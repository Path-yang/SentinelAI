// Use direct video tag like in camera page
"use client";

import { useRef, useState, useEffect } from "react";
import { RefreshCw, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCameraStore } from "@/store/camera-store";
import Hls from "hls.js";

export default function DashboardPage() {
  const { isConnected, streamUrl, cameraDetails } = useCameraStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModels, setActiveModels] = useState<string[]>([]);

  // Load active AI models from localStorage
  useEffect(() => {
    try {
      const savedModels = localStorage.getItem('activeAIModels');
      if (savedModels) {
        setActiveModels(JSON.parse(savedModels));
      }
    } catch (error) {
      console.error("Failed to load active AI models:", error);
    }
  }, []);

  // Initialize HLS player
  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    const setupHls = async () => {
      setIsLoading(true);
      
      // Clean up existing HLS instance if it exists
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported() && videoRef.current) {
        const hls = new Hls({
          lowLatencyMode: true,
          liveSyncDuration: 1,
          liveMaxLatencyDuration: 3,
          liveDurationInfinity: true,
          highBufferWatchdogPeriod: 1,
        });
        
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log("HLS media attached");
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed");
          setIsLoading(false);
          videoRef.current?.play().catch(err => console.warn("Play failed:", err));
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error("Fatal HLS error:", data.type, data.details);
            setIsLoading(false);
          }
        });

        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const urlWithTimestamp = `${streamUrl}?_=${timestamp}`;
        
        hls.loadSource(urlWithTimestamp);
        hls.attachMedia(videoRef.current);
        hlsRef.current = hls;
      }
    };

    setupHls();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Get model names for display
  const getModelNames = () => {
    if (!activeModels.length) return [];
    
    const allModels: { id: string, name: string, category: string }[] = [];
    
    // This should match the structure in the AI detection page
    const detectionCategories = [
      {
        id: "health",
        name: "Health & Safety",
        options: [
          { id: "falls", name: "Fall Detection" },
          { id: "immobility", name: "Extended Immobility" },
          { id: "seizures", name: "Seizure Detection" },
        ]
      },
      {
        id: "security",
        name: "Security",
        options: [
          { id: "intruders", name: "Intruder Detection" },
          { id: "objects", name: "Abandoned Objects" },
          { id: "tampering", name: "Camera Tampering" },
        ]
      },
      {
        id: "emergencies",
        name: "Emergencies",
        options: [
          { id: "fire", name: "Fire Detection" },
          { id: "accidents", name: "Accidents" },
          { id: "distress", name: "Distress Signs" },
        ]
      },
      {
        id: "analytics",
        name: "Analytics",
        options: [
          { id: "occupancy", name: "Occupancy Counting" },
          { id: "dwell", name: "Dwell Time" },
          { id: "traffic", name: "Traffic Patterns" },
        ]
      }
    ];
    
    for (const category of detectionCategories) {
      for (const option of category.options) {
        if (activeModels.includes(option.id)) {
          allModels.push({
            id: option.id,
            name: option.name,
            category: category.name
          });
        }
      }
    }
    
    return allModels;
  };
  
  const modelDetails = getModelNames();

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your cameras and view anomaly alerts.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Live Feed</CardTitle>
                {cameraDetails.ip && <CardDescription>Camera: {cameraDetails.ip}</CardDescription>}
              </div>
              <div className="flex items-center gap-2">
                {isConnected && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                    Live
                  </Badge>
                )}
                
                {activeModels.length > 0 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Zap className="h-3 w-3 mr-1" />
                    AI Active
                  </Badge>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  className="h-8 w-8"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isConnected && streamUrl ? (
                <div className="relative rounded-md overflow-hidden border aspect-video bg-black">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    playsInline
                    autoPlay
                    muted
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border rounded-md aspect-video bg-muted/30">
                  <p className="text-muted-foreground mb-4">No camera connected</p>
                  <Link href="/camera">
                    <Button>
                      Connect Camera
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* AI Detection Models Card - Only show if models are active */}
          {activeModels.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-primary" />
                    Active AI Detection
                  </CardTitle>
                  <Link href="/dashboard/watch">
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      Manage
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  {activeModels.length} active detection model{activeModels.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {modelDetails.map(model => (
                    <div key={model.id} className="flex items-center p-2 border rounded-md">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{model.name}</p>
                        <p className="text-xs text-muted-foreground">{model.category}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Alerts</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M3 6h18" />
                      <path d="M7 12h10" />
                      <path d="M10 18h4" />
                    </svg>
                  </Button>
                </div>
              </div>
              <CardDescription>
                0 alerts in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted/30 p-4 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-muted-foreground"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">No alerts found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Alerts will appear here when detected
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 