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

  // Update local state when store changes
  useEffect(() => {
    setLocalIsConnected(storeConnected);
  }, [storeConnected]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, []);
 
  const validateInputs = (): boolean => {
    if (!ip) { toast({ title: "Error", description: "Please enter camera IP", variant: "destructive" }); return false; }
    if (!path) { toast({ title: "Error", description: "Please enter stream path", variant: "destructive" }); return false; }
    return true;
  };
 
  const connectStream = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);

    // Save camera details to store
    setCameraDetails({ ip, port, path, username, password, streamName });

    // Build RTSP URL
    let rtspUrl = `rtsp://`;
    rtspUrl += `${ip}:${port}/${path}`;
    
    // Configure stream via API
    const resp = await fetch("http://localhost:3001/api/configure-stream", {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ 
        streamName, 
        rtspUrl,
        username: username || undefined,
        password: password || undefined
      })
    });
    if (!resp.ok) {
      const err = await resp.json(); toast({ title:"Error", description:err.error||"Configuration failed", variant:"destructive" }); setIsLoading(false); return;
    }
    const { hlsUrl } = await resp.json();
    const finalUrl = hlsUrl;

    // Save stream URL to store
    setStreamUrl(finalUrl);

    const video = videoRef.current; if (!video) return;
    try {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker:true, lowLatencyMode:true });
        
        // Custom error handler to prevent showing network errors during initial connection
        hls.on(Hls.Events.ERROR, (event, data) => {
          // Only show fatal errors after we're connected
          if (data.fatal && isConnected) {
            console.error("HLS error:", data);
            toast({ 
              title: data.type === Hls.ErrorTypes.NETWORK_ERROR ? "Network Error" : "Playback Error",
              description: "Stream connection issue. Trying to recover...",
              variant: "destructive"
            });
          }
        });
        
        hls.loadSource(finalUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => { 
          setIsLoading(false); 
          setLocalIsConnected(true);
          setIsConnected(true);
          video.play().catch(e => console.error("Autoplay failed:", e));
          
          // Show success toast and navigate to dashboard after 2 seconds
          toast({
            title: "Camera Connected",
            description: "Successfully connected to camera stream",
            variant: "default",
          });
          
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        });
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = finalUrl;
        video.addEventListener("loadedmetadata", () => { 
          setIsLoading(false); 
          setLocalIsConnected(true);
          setIsConnected(true);
          video.play().catch(e => console.error("Autoplay failed:", e));
          
          // Show success toast and navigate to dashboard after 2 seconds
          toast({
            title: "Camera Connected",
            description: "Successfully connected to camera stream",
            variant: "default",
          });
          
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        });
      }
    } catch (e) { setIsLoading(false); toast({ title:"Error", description:"Playback failed", variant:"destructive" }); }
  };
 
  const disconnectStream = async () => {
    setIsLoading(true);
    
    try {
      // Call API to remove stream
      await fetch(`http://localhost:3001/api/remove-stream?streamName=${streamName}`, {
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