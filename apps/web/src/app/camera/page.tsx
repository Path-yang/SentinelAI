"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Hls from "hls.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Direct HLS test stream that works
const TEST_STREAM_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export default function CameraPage() {
  const router = useRouter();
 
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("554");
  const [path, setPath] = useState("stream1");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [streamName, setStreamName] = useState("my_camera");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { toast } = useToast();

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

    // Build RTSP URL
    let rtspUrl = `rtsp://`;
    if (username && password) rtspUrl += `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
    rtspUrl += `${ip}:${port}/${path}`;
    // Configure stream via API
    const resp = await fetch("http://localhost:3001/api/configure-stream", {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ streamName, rtspUrl })
    });
    if (!resp.ok) {
      const err = await resp.json(); toast({ title:"Error", description:err.error||"Configuration failed", variant:"destructive" }); setIsLoading(false); return;
    }
    const { hlsUrl } = await resp.json();
    const finalUrl = hlsUrl;

    const video = videoRef.current; if (!video) return;
    try {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker:true, lowLatencyMode:true });
        hls.loadSource(finalUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => { setIsLoading(false); setIsConnected(true); video.play(); });
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = finalUrl;
        video.addEventListener("loadedmetadata", () => { setIsLoading(false); setIsConnected(true); video.play(); });
      }
    } catch (e) { setIsLoading(false); toast({ title:"Error", description:"Playback failed", variant:"destructive" }); }
  };
 
  const disconnectStream = () => {
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    if (videoRef.current) { videoRef.current.src = ""; videoRef.current.load(); }
    setIsConnected(false);
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