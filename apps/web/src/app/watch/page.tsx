"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Maximize2, Settings, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function WatchPage() {
  const cameras = useAppStore((state) => state.cameras);
  const selectedCamera = useAppStore((state) => state.selectedCamera);
  const setSelectedCamera = useAppStore((state) => state.setSelectedCamera);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [streamQuality, setStreamQuality] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);
  
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

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'auto': return 'Auto';
      case '1080p': return '1080p';
      case '720p': return '720p';
      case '480p': return '480p';
      default: return 'Auto';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2">
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
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Video Player */}
          <div className="lg:col-span-3">
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
                fullWidth={true}
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

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Camera Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cameras</CardTitle>
                <CardDescription>
                  Switch between different camera feeds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {cameras.map((camera) => (
                  <Button
                    key={camera.id}
                    variant={camera.id === selectedCamera ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCamera(camera.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        camera.id === selectedCamera ? "bg-green-500" : "bg-gray-400"
                      )} />
                      <span>{camera.name}</span>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Settings */}
            {showSettings && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                  <CardDescription>
                    Adjust video playback settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Stream Quality</label>
                    <select
                      value={streamQuality}
                      onChange={(e) => setStreamQuality(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="auto">Auto</option>
                      <option value="1080p">1080p</option>
                      <option value="720p">720p</option>
                      <option value="480p">480p</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mute Audio</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleMute}
                    >
                      {isMuted ? 'On' : 'Off'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Show Controls</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleControls}
                    >
                      {showControls ? 'On' : 'Off'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stream Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stream Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Camera:</span>
                  <span>{currentCamera?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quality:</span>
                  <span>{getQualityLabel(streamQuality)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Audio:</span>
                  <span>{isMuted ? 'Muted' : 'On'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                    Live
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 