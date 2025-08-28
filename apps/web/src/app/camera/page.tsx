"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Hls from "hls.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCameraStore } from "@/store/camera-store";
import Link from "next/link";
import Image from "next/image";
import { Home, Camera, Settings, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Add helper to wait for HLS manifest availability
const waitForManifest = async (url: string) => {
  const maxAttempts = 12;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) return;
    } catch (e) {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Manifest not available');
};

// Direct HLS test stream that works
const TEST_STREAM_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

// Navigation items
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "AI Detection", href: "/dashboard/watch", icon: Activity },
  { name: "Cameras", href: "/dashboard/cameras", icon: Camera },
  { name: "Connect Camera", href: "/camera", icon: Camera },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function CameraPage() {
  const router = useRouter();
  
  const { 
    cameraDetails, 
    setCameraDetails, 
    isConnected: storeConnected, 
    setIsConnected, 
    setStreamUrl,
    disconnect: storeDisconnect
  } = useCameraStore();
  
  const [ip, setIp] = useState(cameraDetails.ip);
  const [port, setPort] = useState(cameraDetails.port);
  const [path, setPath] = useState(cameraDetails.path);
  const [username, setUsername] = useState(cameraDetails.username);
  const [password, setPassword] = useState(cameraDetails.password);
  const [streamName, setStreamName] = useState(cameraDetails.streamName);
  const [isConnected, setLocalIsConnected] = useState(storeConnected);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { toast } = useToast();
  const [serverIp, setServerIp] = useState<string | null>(null);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Fetch server info on component mount
  useEffect(() => {
    const fetchServerInfo = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/server-info');
        if (response.ok) {
          const data = await response.json();
          setServerIp(data.ip);
          console.log(`Server detected at IP: ${data.ip}`);
        }
      } catch (error) {
        console.error('Error fetching server info:', error);
      }
    };
    
    fetchServerInfo();
  }, []);

  // Update local state when store changes
  useEffect(() => {
    setLocalIsConnected(storeConnected);
  }, [storeConnected]);

  // Add effect to reconnect to existing stream if already connected
  useEffect(() => {
    if (storeConnected && videoRef.current) {
      const reconnectToExistingStream = async () => {
        const streamUrl = useCameraStore.getState().streamUrl;
        if (!streamUrl) return;
        
        try {
          if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(videoRef.current!);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              videoRef.current?.play().catch(e => console.error("Autoplay failed:", e));
            });
            hlsRef.current = hls;
          } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
            if (videoRef.current) {
              videoRef.current.src = streamUrl;
              videoRef.current.addEventListener("loadedmetadata", () => {
                videoRef.current?.play().catch(e => console.error("Autoplay failed:", e));
              });
            }
          }
        } catch (e) {
          console.error("Error reconnecting to stream:", e);
        }
      };
      
      reconnectToExistingStream();
    }
  }, [storeConnected]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, []);
 
  // Add force disconnect on error
  const forceDisconnect = () => {
    // Clean up video player
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    if (videoRef.current) { videoRef.current.src = ""; videoRef.current.load(); }
    
    // Update state
    setLocalIsConnected(false);
    storeDisconnect();
  };

  // Update validateInputs to log more information
  const validateInputs = async (): Promise<boolean> => {
    if (!ip) { 
      toast({ title: "Error", description: "Please enter camera IP", variant: "destructive" }); 
      return false; 
    }
    if (!path) { 
      toast({ title: "Error", description: "Please enter stream path", variant: "destructive" }); 
      return false; 
    }
    
    // Set the loading state while we test
    setIsLoading(true);
    
    // Use the detected server IP or fall back to localhost
    const apiUrl = serverIp ? `http://${serverIp}:3001/api/test-connection` : 'http://localhost:3001/api/test-connection';
    
    try {
      // Build RTSP URL for testing
      let testRtspUrl = `rtsp://`;
      testRtspUrl += `${ip}:${port}/${path}`;
      
      console.log('Testing connection with:', {
        rtspUrl: testRtspUrl,
        username: username ? '(provided)' : '(not provided)',
        password: password ? '(provided)' : '(not provided)',
        serverIp
      });
      
      // Test the connection first
      const testResp = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rtspUrl: testRtspUrl,
          username: username || undefined,
          password: password || undefined,
          timeout: 5 // 5 second timeout
        })
      });
      
      const testResult = await testResp.json();
      console.log('Connection test result:', testResult);
      
      if (!testResp.ok || !testResult.success) {
        toast({ 
          title: "Connection Failed", 
          description: testResult.error || "Could not connect to camera. Please check your settings.", 
          variant: "destructive" 
        });
        setIsLoading(false);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error testing connection:", error);
      toast({ 
        title: "Connection Error", 
        description: "Failed to test camera connection. Make sure the stream configuration server is running.", 
        variant: "destructive" 
      });
      setIsLoading(false);
      return false;
    }
  };

  const connectStream = async () => {
    // Test connection first - this also sets isLoading
    if (!(await validateInputs())) return;

    // Save camera details to store
    setCameraDetails({ ip, port, path, username, password, streamName });

    // Build RTSP URL
    let rtspUrl = `rtsp://`;
    rtspUrl += `${ip}:${port}/${path}`;
    
    // Use the detected server IP or fall back to localhost
    const apiUrl = serverIp ? `http://${serverIp}:3001/api/configure-stream` : 'http://localhost:3001/api/configure-stream';
    
    console.log('Connecting to stream with:', {
      streamName,
      rtspUrl,
      username: username ? '(provided)' : '(not provided)',
      password: password ? '(provided)' : '(not provided)',
      serverIp,
      apiUrl
    });
    
    // Configure stream via API with extreme low-latency flag
    try {
      const resp = await fetch(apiUrl, {
        method: 'POST', 
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ 
          streamName, 
          rtspUrl,
          username: username || undefined,
          password: password || undefined,
          lowLatency: true,
          extremeLatency: true // Signal that we want extreme low-latency configuration
        })
      });
      
      if (!resp.ok) {
        const err = await resp.json(); 
        console.error('Stream configuration failed:', err);
        toast({ title:"Error", description:err.error||"Configuration failed", variant:"destructive" }); 
        setIsLoading(false); 
        return;
      }
      
      const { hlsUrl, serverIp: streamServerIp } = await resp.json();
      const finalUrl = hlsUrl;
      console.log('Stream configured successfully:', { hlsUrl: finalUrl, serverIp: streamServerIp });
      // Save stream URL to store and mark connected immediately
      setStreamUrl(finalUrl);
      setLocalIsConnected(true);
      setIsConnected(true);
      // Stop loading spinner
      await setIsLoading(true);

      // Wait for HLS manifest to be ready before loading
      try {
        await waitForManifest(finalUrl);
      } catch (e) {
        toast({ title: 'Stream Not Ready', description: 'Could not load stream manifest.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const video = videoRef.current; 
      if (!video) {
        console.error('Video element not found');
        setIsLoading(false);
        return;
      }
      
      // Fix the HLS.js error and console output
      if (Hls.isSupported()) {
        // Ultra low-latency HLS configuration
        const hls = new Hls({ 
          enableWorker: true,
          lowLatencyMode: true,  // Enable low latency mode
          liveSyncDuration: 0.2, // Very short sync duration
          liveMaxLatencyDuration: 0.4, // Very short max latency
          maxBufferLength: 0.5,  // Very small buffer
          maxBufferSize: 2 * 1000 * 1000, // 2MB max buffer
          debug: false
        });
        
        // Use finalUrl directly since server disables caching
        const urlWithTimestamp = finalUrl;
        console.log("Loading HLS source:", urlWithTimestamp);
        
        // Set up error handling before loading source
        hls.on(Hls.Events.ERROR, function(event, data) {
          // Stop loading spinner on fatal errors (but do not disconnect)
          if (data && data.fatal) {
            setIsLoading(false);
          }
          // Suppress detailed HLS error logs for manifest load failures
          if (data && !(data.type === Hls.ErrorTypes.NETWORK_ERROR && data.details === 'manifestLoadError')) {
            console.warn("HLS error:", data.type, data.details);
          }
          // Handle manifest load errors gracefully
          if (data && data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR && data.details === 'manifestLoadError') {
            // Notify user and stop loading
            toast({ title: "Stream Not Found", description: "Could not load video stream.", variant: "destructive" });
            setIsLoading(false);
            return;
          }
          
          if (data && data.fatal) {
            switch(data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Fatal network error encountered, trying to recover...');
                setTimeout(() => {
                  hls.loadSource(urlWithTimestamp);
                  hls.startLoad();
                }, 500); // Faster recovery
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Fatal media error encountered, trying to recover...');
                setTimeout(() => {
                  hls.recoverMediaError();
                }, 500); // Faster recovery
                break;
              default:
                // Cannot recover from other errors
                console.error('Fatal error, cannot recover');
                setIsLoading(false);
                toast({ 
                  title: "Playback Error", 
                  description: "Could not play the stream. Please try again.", 
                  variant: "destructive" 
                });
                break;
            }
          }
        });
        
        // Handle manifest parsed event
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed, starting playback');
          setIsLoading(false);
          setLocalIsConnected(true);
          // Mark connected after manifest parsed
          setIsConnected(true);
          
          // Basic video setup for low latency
          if (video) {
            video.muted = true;
            video.autoplay = true;
            video.playsInline = true;
            
            // Play faster to reduce latency
            video.playbackRate = 1.1;
            
            // Add seeking to live edge
            const seekToLiveEdge = () => {
              if (hls.liveSyncPosition) {
                video.currentTime = hls.liveSyncPosition;
              }
            };
            
            // Periodically seek to live edge
            const liveEdgeInterval = setInterval(seekToLiveEdge, 1000);
            
            // Play with error handling
            video.play().catch(e => {
              console.error("Autoplay failed:", e);
              // Try again with user interaction
              toast({
                title: "Autoplay Blocked",
                description: "Click the video to start playback",
                variant: "default",
              });
            });
            
            // Clean up on unmount
            return () => {
              clearInterval(liveEdgeInterval);
            };
          }
          
          // Show success toast
          toast({
            title: "Camera Connected",
            description: "Successfully connected to camera stream",
            variant: "default",
          });
        });
        
        // Load source and attach media
        hls.loadSource(urlWithTimestamp);
        hls.attachMedia(video);
        
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari - add timestamp to prevent caching
        const urlWithTimestamp = `${finalUrl}?_t=${Date.now()}`;
        video.src = urlWithTimestamp;
        video.preload = "auto";
        
        video.addEventListener("loadedmetadata", () => { 
          setIsLoading(false); 
          setLocalIsConnected(true);
          setIsConnected(true);
          
          // Set video properties for low latency
          video.preload = "auto";
          video.muted = true; // Start muted to avoid autoplay issues
          video.playbackRate = 1.05; // Play slightly faster to catch up
          
          video.play().catch(e => console.error("Autoplay failed:", e));
          
          // Show success toast
          toast({
            title: "Camera Connected",
            description: "Successfully connected to camera stream",
            variant: "default",
          });
        });
      }
    } catch (e) { 
      console.error("Playback error:", e);
      setIsLoading(false); 
      toast({ title:"Error", description:"Playback failed", variant:"destructive" }); 
      forceDisconnect();
    }
  };
 
  const disconnectStream = async () => {
    setIsLoading(true);
    
    try {
      // Use the detected server IP or fall back to localhost
      const apiUrl = serverIp 
        ? `http://${serverIp}:3001/api/remove-stream?streamName=${streamName}`
        : `http://localhost:3001/api/remove-stream?streamName=${streamName}`;
      
      // Call API to remove stream
      await fetch(apiUrl, {
        method: 'DELETE'
      });
      
      // Clean up video player
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (videoRef.current) { videoRef.current.src = ""; videoRef.current.load(); }
      
      // Update state
      setLocalIsConnected(false);
      storeDisconnect();
      
      toast({
        title: "Disconnected",
        description: "Camera stream has been disconnected",
        variant: "default",
      });
    } catch (error) {
      console.error("Error disconnecting stream:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect stream",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r lg:relative lg:z-0",
          "transform -translate-x-full lg:translate-x-0 transition-transform duration-200 ease-in-out",
          sidebarOpen && "translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link
            href="/"
            className="flex items-center space-x-2 text-primary font-bold text-xl tracking-tight"
          >
            <Image 
              src="/images/logo-only.png" 
              alt="SentinelAI Logo" 
              width={40} 
              height={40} 
              className="rounded-md"
              priority
            />
            <span>SentinelAI</span>
          </Link>
        </div>

        {/* Sidebar navigation */}
        <nav className="flex flex-col h-[calc(100%-64px)] justify-between">
          <div className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = item.href === "/camera";
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm text-muted-foreground">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Connect Camera</h1>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Form Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Stream Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      connectStream();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="ip">Camera IP</Label>
                      <Input id="ip" value={ip} onChange={e => setIp(e.target.value)} disabled={isConnected || isLoading} />
                    </div>
                    <div>
                      <Label htmlFor="port">Port</Label>
                      <Input id="port" value={port} onChange={e => setPort(e.target.value)} disabled={isConnected || isLoading} />
                    </div>
                    <div>
                      <Label htmlFor="path">Stream Path</Label>
                      <Input id="path" value={path} onChange={e => setPath(e.target.value)} disabled={isConnected || isLoading} />
                    </div>
                    <div>
                      <Label htmlFor="username">Username (Optional)</Label>
                      <Input id="username" value={username} onChange={e => setUsername(e.target.value)} disabled={isConnected || isLoading} />
                    </div>
                    <div>
                      <Label htmlFor="password">Password (Optional)</Label>
                      <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={isConnected || isLoading} />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={isConnected || isLoading}
                      >
                        {isLoading ? "Connecting..." : "Connect"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={disconnectStream}
                        disabled={!isConnected || isLoading}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              {/* Video Player Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Video Stream</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-black rounded-md overflow-hidden aspect-video">
                    {isLoading && !isConnected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                          <p className="text-sm text-gray-400">Connecting to stream...</p>
                        </div>
                      </div>
                    )}
                    
                    {!isConnected && !isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                        <p className="text-gray-400">No stream connected</p>
                      </div>
                    )}
                    
                    <video
                      ref={videoRef}
                      className="w-full h-full"
                      controls
                      playsInline
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 