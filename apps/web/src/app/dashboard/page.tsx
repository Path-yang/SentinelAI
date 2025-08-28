// Fix dashboard video display issue
"use client";

import { useState, useEffect, useCallback } from "react";
import { VideoPlayer } from "@/components/video-player";
import { AlertsPanel } from "@/components/alerts-panel";
import { Button } from "@/components/ui/button";
import { useCameraStore } from "@/store/camera-store";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Video } from "lucide-react";

export default function DashboardPage() {
  const { streamUrl, isConnected, cameraDetails } = useCameraStore();
  const router = useRouter();
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [cameraIp, setCameraIp] = useState<string>("");
  
  // Force refresh the video source when dashboard loads
  const refreshVideoSource = useCallback(() => {
    if (isConnected && streamUrl) {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      setVideoSource(`${streamUrl}?_t=${timestamp}`);
      setCameraIp(cameraDetails.ip || "");
      console.log("Dashboard: Setting video source to", `${streamUrl}?_t=${timestamp}`);
    } else {
      setVideoSource(null);
      setCameraIp("");
    }
  }, [isConnected, streamUrl, cameraDetails]);

  // Set video source on initial load
  useEffect(() => {
    refreshVideoSource();
    
    // Set up periodic refresh
    const refreshInterval = setInterval(refreshVideoSource, 30000);
    
    // Clean up
    return () => clearInterval(refreshInterval);
  }, [refreshVideoSource]);
  
  // Force refresh when navigating to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshVideoSource();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refreshVideoSource);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refreshVideoSource);
    };
  }, [refreshVideoSource]);

  const handleManageCamera = () => {
    router.push("/camera");
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
              {videoSource ? (
                <div key={videoSource}>
                  <VideoPlayer 
                    src={videoSource} 
                    className="rounded-md overflow-hidden w-full aspect-video" 
                    stabilizePlayback={false}
                    silent={true}
                  />
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