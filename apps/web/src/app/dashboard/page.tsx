// Use direct video tag like in camera page
"use client";

import { useState, useEffect, useRef } from "react";
import { AlertsPanel } from "@/components/alerts-panel";
import { Button } from "@/components/ui/button";
import { useCameraStore } from "@/store/camera-store";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Video, RefreshCw } from "lucide-react";
import Hls from "hls.js";

export default function DashboardPage() {
  const { streamUrl, isConnected, cameraDetails } = useCameraStore();
  const router = useRouter();
  const [cameraIp, setCameraIp] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  // Set up HLS player when streamUrl changes
  useEffect(() => {
    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    if (isConnected && streamUrl && videoRef.current) {
      console.log("Dashboard: Setting up HLS with", streamUrl);
      setCameraIp(cameraDetails.ip || "");
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          debug: false
        });
        
        // Add timestamp to prevent caching
        const urlWithTimestamp = `${streamUrl}?_t=${Date.now()}`;
        
        hls.loadSource(urlWithTimestamp);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed, playing video");
          videoRef.current?.play().catch(e => {
            console.error("Autoplay failed:", e);
          });
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

  const handleManageCamera = () => {
    router.push("/camera");
  };
  
  const handleRefresh = () => {
    if (isConnected && streamUrl && videoRef.current) {
      // Clean up previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          debug: false
        });
        
        // Add timestamp to prevent caching
        const urlWithTimestamp = `${streamUrl}?_t=${Date.now()}`;
        
        hls.loadSource(urlWithTimestamp);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed after refresh, playing video");
          videoRef.current?.play().catch(e => {
            console.error("Autoplay failed:", e);
          });
        });
        
        hlsRef.current = hls;
      }
    }
  };

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
                <div className="flex items-center gap-2">
                  {isConnected && (
                    <>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div> Live
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Zap className="w-3 h-3 mr-1" /> AI Active
                      </Badge>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh} 
                    disabled={!isConnected}
                    title="Refresh video"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {cameraIp && <p className="text-sm text-muted-foreground">Camera: {cameraIp}</p>}
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-md overflow-hidden aspect-video">
                {!isConnected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                    <p className="text-gray-400">No stream connected</p>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  playsInline
                  muted
                />
              </div>
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