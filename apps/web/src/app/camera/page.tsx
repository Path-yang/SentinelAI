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

// Direct HLS test stream that works
const TEST_STREAM_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

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
      
      console.log('Stream configured successfully:', {
        hlsUrl: finalUrl,
        serverIp: streamServerIp
      });
      
      // Log the server IP for debugging
      if (streamServerIp) {
        console.log(`Stream server IP: ${streamServerIp}`);
      }

      // Save stream URL to store
      setStreamUrl(finalUrl);

      const video = videoRef.current; 
      if (!video) {
        console.error('Video element not found');
        setIsLoading(false);
        return;
      }
      
      // Fix the HLS.js configuration to handle errors properly
      if (Hls.isSupported()) {
        // Basic HLS configuration with minimal settings
        const hls = new Hls({ 
          enableWorker: true,
          debug: false
        });
        
        // Add timestamp to URL to prevent caching
        const urlWithTimestamp = `${finalUrl}?_t=${Date.now()}`;
        console.log("Loading HLS source:", urlWithTimestamp);
        
        // Set up error handling before loading source
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", event, data);
          
          if (data.fatal) {
            switch(data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Fatal network error encountered, trying to recover...');
                setTimeout(() => {
                  hls.loadSource(urlWithTimestamp);
                  hls.startLoad();
                }, 1000);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Fatal media error encountered, trying to recover...');
                setTimeout(() => {
                  hls.recoverMediaError();
                }, 1000);
                break;
              default:
                // Cannot recover from other errors
                console.error('Fatal error, cannot recover:', data);
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
          setIsConnected(true);
          
          // Basic video setup
          if (video) {
            video.muted = true;
            video.play().catch(e => {
              console.error("Autoplay failed:", e);
              // Try again with user interaction
              toast({
                title: "Autoplay Blocked",
                description: "Click the video to start playback",
                variant: "default",
              });
            });
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
    <div>
      <Button variant="link" onClick={() => router.back()}>Go Back</Button>
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
                {isLoading && (
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
    </div>
  );
} 