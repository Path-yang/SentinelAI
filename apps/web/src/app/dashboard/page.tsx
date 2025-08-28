// Replace VideoPlayer with direct video implementation
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AlertsPanel } from "@/components/alerts-panel";
import { Button } from "@/components/ui/button";
import { useCameraStore } from "@/store/camera-store";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Video } from "lucide-react";
import Hls from "hls.js";

export default function DashboardPage() {
  const { streamUrl, isConnected, cameraDetails } = useCameraStore();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [cameraIp, setCameraIp] = useState<string>("");
  
  // Direct video implementation
  useEffect(() => {
    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    // If connected and we have a stream URL
    if (isConnected && streamUrl && videoRef.current) {
      console.log("Dashboard: Loading video from", streamUrl);
      setCameraIp(cameraDetails.ip || "");
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          liveSyncDuration: 0.2,
          liveMaxLatencyDuration: 0.4,
          maxBufferLength: 0.5,
          debug: false,
          xhrSetup: function(xhr) {
            xhr.setRequestHeader('Cache-Control', 'no-cache');
            xhr.withCredentials = false;
          }
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.warn("Dashboard HLS error:", data?.type, data?.details);
          
          // Auto-recover
          if (data && data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          }
        });
        
        hls.loadSource(`${streamUrl}?_t=${Date.now()}`);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play().catch(e => {
            console.error("Autoplay failed:", e);
          });
        });
        
        hlsRef.current = hls;
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // For Safari
        videoRef.current.src = streamUrl;
        videoRef.current.play().catch(e => {
          console.error("Autoplay failed:", e);
        });
      }
    } else {
      setCameraIp("");
    }
    
    // Clean up
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isConnected, streamUrl, cameraDetails]);

  // Add periodic refresh and visibility change detection
  useEffect(() => {
    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && isConnected) {
        console.log('Periodic refresh');
        refreshVideo();
      }
    }, 30000); // Refresh every 30 seconds if visible
    
    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isConnected) {
        console.log('Tab became visible, refreshing video');
        refreshVideo();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, refreshVideo]);

  const handleManageCamera = () => {
    router.push("/camera");
  };

  const refreshVideo = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    if (videoRef.current && isConnected && streamUrl) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          liveSyncDuration: 0.2,
          liveMaxLatencyDuration: 0.4,
          maxBufferLength: 0.5,
          debug: false,
          xhrSetup: function(xhr) {
            xhr.setRequestHeader('Cache-Control', 'no-cache');
            xhr.withCredentials = false;
          }
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.warn("Dashboard HLS error:", data?.type, data?.details);
          
          // Auto-recover
          if (data && data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          }
        });
        
        hls.loadSource(`${streamUrl}?_t=${Date.now()}`);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play().catch(e => {
            console.error("Autoplay failed:", e);
          });
        });
        
        hlsRef.current = hls;
      }
    }
  }, [isConnected, streamUrl]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your cameras and view anomaly alerts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {}} disabled={!isConnected}>
            <Zap className="mr-2 h-4 w-4" /> Test AI
          </Button>
          <Button onClick={handleManageCamera}>
            <Video className="mr-2 h-4 w-4" /> Manage Camera
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Live Feed</CardTitle>
                {isConnected && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div> Live
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Zap className="w-3 h-3 mr-1" /> AI Active
                    </Badge>
                  </div>
                )}
              </div>
              {cameraIp && <p className="text-sm text-muted-foreground">Camera: {cameraIp}</p>}
            </CardHeader>
            <CardContent>
              {isConnected ? (
                <div className="relative bg-black rounded-md overflow-hidden aspect-video" key={streamUrl || 'no-stream'}>
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    playsInline
                    muted
                    autoPlay
                  />
                  <button 
                    onClick={refreshVideo}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    title="Refresh video"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center bg-muted rounded-md w-full aspect-video">
                  <p className="text-muted-foreground mb-4">No camera connected</p>
                  <Button onClick={handleManageCamera}>Connect Camera</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
} 