// Update Watch page to be AI Detection page with models selection
"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Maximize2, Settings, Volume2, VolumeX, Search, Zap } from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// AI detection models
const detectionModels = [
  { id: "fallDetection", name: "Fall Detection", category: "healthcare", description: "Detects falls and sends immediate alerts" },
  { id: "intruderDetection", name: "Intruder Detection", category: "security", description: "Identifies unauthorized persons" },
  { id: "fireDetection", name: "Fire Detection", category: "emergency", description: "Detects flames and smoke" },
  { id: "vehicleAccident", name: "Vehicle Accident", category: "emergency", description: "Detects car crashes and accidents" },
  { id: "personCounting", name: "Person Counting", category: "analytics", description: "Counts people in the frame" },
  { id: "weaponDetection", name: "Weapon Detection", category: "security", description: "Identifies potential weapons" },
  { id: "abnormalBehavior", name: "Abnormal Behavior", category: "analytics", description: "Detects unusual activity patterns" },
  { id: "abandonedObject", name: "Abandoned Object", category: "security", description: "Identifies objects left unattended" }
];

export default function AIDetectionPage() {
  const cameras = useAppStore((state) => state.cameras);
  const selectedCamera = useAppStore((state) => state.selectedCamera);
  const setSelectedCamera = useAppStore((state) => state.setSelectedCamera);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [streamQuality, setStreamQuality] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the currently selected camera object
  const currentCamera = cameras.find(c => c.id === selectedCamera) || cameras[0];

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const toggleModelSelection = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId) 
        : [...prev, modelId]
    );
  };

  // Filter models based on search query and active tab
  const filteredModels = detectionModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          model.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'all' || model.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="ml-auto flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {currentCamera?.name || 'Camera Feed'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleControls}
            >
              {showControls ? 'Hide' : 'Show'} Controls
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreen}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">AI Detection</h1>
        <p className="text-muted-foreground mb-6">
          Select AI models to detect anomalies in your camera feed. Multiple models can run simultaneously.
        </p>
        
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div 
              ref={containerRef}
              className={cn(
                "relative overflow-hidden bg-black rounded-2xl shadow-lg",
                isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
              )}
            >
              <VideoPlayer 
                src={currentCamera?.stream_url || ''} 
                autoPlay={true}
                muted={isMuted}
                controls={showControls}
                className="w-full h-full"
              />
              
              {/* Overlay Controls */}
              {showControls && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      LIVE
                    </Badge>
                    <span className="text-white text-sm">
                      {currentCamera?.name || 'Camera Feed'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* AI Models Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and filter */}
            <Card>
              <CardHeader>
                <CardTitle>AI Detection Models</CardTitle>
                <CardDescription>
                  Select models to detect anomalies in your video feed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search models..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="emergency">Emergency</TabsTrigger>
                    <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {filteredModels.map((model) => (
                    <Card key={model.id} className={cn(
                      "hover:bg-accent/30 transition-colors cursor-pointer",
                      selectedModels.includes(model.id) && "border-primary bg-primary/5"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{model.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {model.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {model.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`model-${model.id}`}
                              checked={selectedModels.includes(model.id)}
                              onCheckedChange={() => toggleModelSelection(model.id)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredModels.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No models found matching your search
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Active Models */}
            {selectedModels.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Detection</CardTitle>
                  <CardDescription>
                    {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} currently running
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedModels.map(modelId => {
                      const model = detectionModels.find(m => m.id === modelId);
                      return (
                        <div key={modelId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <span>{model?.name}</span>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Active
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                  
                  <Button className="w-full mt-4" onClick={() => setSelectedModels([])}>
                    Stop All Detection
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 