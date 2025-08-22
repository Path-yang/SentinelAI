"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Settings, 
  RotateCcw, 
  Maximize2, 
  Download, 
  AlertTriangle,
  Wifi,
  WifiOff,
  Zap,
  Eye,
  EyeOff
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface CameraStatus {
  id: string;
  isOnline: boolean;
  lastSeen: Date;
  streamQuality: 'excellent' | 'good' | 'poor' | 'offline';
  recording: boolean;
  motionDetected: boolean;
}

export function InteractiveCameraControls() {
  const cameras = useAppStore((state) => state.cameras);
  const selectedCamera = useAppStore((state) => state.selectedCamera);
  const setSelectedCamera = useAppStore((state) => state.setSelectedCamera);
  
  const [cameraStatuses, setCameraStatuses] = useState<Record<string, CameraStatus>>({});
  const [showOfflineCameras, setShowOfflineCameras] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Simulate camera status updates
  useEffect(() => {
    const updateCameraStatuses = () => {
      const statuses: Record<string, CameraStatus> = {};
      
      cameras.forEach(camera => {
        const isOnline = Math.random() > 0.1; // 90% chance of being online
        statuses[camera.id] = {
          id: camera.id,
          isOnline,
          lastSeen: new Date(),
          streamQuality: isOnline ? (Math.random() > 0.3 ? 'excellent' : 'good') : 'offline',
          recording: Math.random() > 0.5,
          motionDetected: Math.random() > 0.7
        };
      });
      
      setCameraStatuses(statuses);
    };

    updateCameraStatuses();
    const interval = setInterval(updateCameraStatuses, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [cameras]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleCameraAction = async (action: string, cameraId: string) => {
    switch (action) {
      case 'restart':
        // Simulate camera restart
        console.log(`Restarting camera: ${cameraId}`);
        break;
      case 'record':
        setIsRecording(!isRecording);
        break;
      case 'fullscreen':
        setIsFullscreen(!isFullscreen);
        break;
      case 'settings':
        // Open camera settings
        console.log(`Opening settings for: ${cameraId}`);
        break;
    }
  };

  const filteredCameras = cameras.filter(camera => 
    showOfflineCameras || cameraStatuses[camera.id]?.isOnline
  );

  return (
    <div className="space-y-4">
      {/* Camera Status Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Camera Status</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOfflineCameras(!showOfflineCameras)}
              >
                {showOfflineCameras ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showOfflineCameras ? 'Show All' : 'Online Only'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {filteredCameras.map((camera) => {
              const status = cameraStatuses[camera.id];
              const isSelected = camera.id === selectedCamera;
              
              return (
                <div
                  key={camera.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedCamera(camera.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Camera className={cn(
                        "w-5 h-5",
                        status?.isOnline ? "text-green-500" : "text-red-500"
                      )} />
                      {status?.motionDetected && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium">{camera.name}</div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        {status?.isOnline ? (
                          <>
                            <Wifi className="w-3 h-3 text-green-500" />
                            <span>Online</span>
                            <div className={cn("w-2 h-2 rounded-full", getQualityColor(status.streamQuality))} />
                            <span className="capitalize">{status.streamQuality}</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-3 h-3 text-red-500" />
                            <span>Offline</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {status?.recording && (
                      <Badge variant="destructive" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Recording
                      </Badge>
                    )}
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCameraAction('restart', camera.id);
                        }}
                        disabled={!status?.isOnline}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCameraAction('settings', camera.id);
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleCameraAction('record', selectedCamera)}
              className="h-12"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleCameraAction('fullscreen', selectedCamera)}
              className="h-12"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
            
            <Button
              variant="outline"
              className="h-12"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Footage
            </Button>
            
            <Button
              variant="outline"
              className="h-12"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Test Alert
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 