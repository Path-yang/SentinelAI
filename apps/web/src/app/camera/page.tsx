"use client";

import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Direct HLS test stream that works
const TEST_STREAM_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export default function CameraPage() {
  const [streamUrl, setStreamUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [streamName, setStreamName] = useState("my_camera");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { toast } = useToast();

  // Clean up HLS instance on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  const validateUrl = (url: string): boolean => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a stream URL",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const connectStream = async () => {
    let finalUrl = streamUrl;
    
    // Use test stream if no URL is provided
    if (!finalUrl) {
      finalUrl = TEST_STREAM_URL;
    }
    
    if (!validateUrl(finalUrl)) return;
    
    setIsLoading(true);
    
    // Destroy any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    const video = videoRef.current;
    if (!video) return;
    
    try {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log("HLS: Media attached");
        });
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS: Manifest parsed");
          setIsLoading(false);
          setIsConnected(true);
          video.play().catch((e) => {
            console.error("Error playing video:", e);
            toast({
              title: "Playback Error",
              description: "Could not autoplay video. Please click play manually.",
              variant: "destructive",
            });
          });
        });
        
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setIsLoading(false);
            
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("HLS: Fatal network error", data);
                toast({
                  title: "Network Error",
                  description: "Failed to load the stream. Please check the URL and your network connection.",
                  variant: "destructive",
                });
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("HLS: Fatal media error", data);
                toast({
                  title: "Media Error",
                  description: "There was a problem with the stream format.",
                  variant: "destructive",
                });
                hls.recoverMediaError();
                break;
              default:
                console.error("HLS: Fatal error", data);
                toast({
                  title: "Stream Error",
                  description: "Failed to load the video stream.",
                  variant: "destructive",
                });
                hls.destroy();
                setIsConnected(false);
                break;
            }
          }
        });
        
        hls.loadSource(finalUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari
        video.src = finalUrl;
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          setIsConnected(true);
          video.play().catch((e) => console.error("Error playing video:", e));
        });
      } else {
        setIsLoading(false);
        toast({
          title: "Browser Not Supported",
          description: "Your browser doesn't support HLS playback.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error setting up video:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the stream.",
        variant: "destructive",
      });
    }
  };

  const disconnectStream = async () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.src = "";
      videoRef.current.load();
    }
    
    setIsConnected(false);
  };

  return (
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
              <div className="space-y-2">
                <Label htmlFor="streamUrl">Stream URL (HLS)</Label>
                <Input
                  id="streamUrl"
                  placeholder="https://example.com/stream.m3u8 (leave empty for test stream)"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  disabled={isConnected || isLoading}
                />
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
  );
} 