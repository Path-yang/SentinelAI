"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Bell, Camera, Clock, Zap, Activity } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { VideoPlayer } from "@/components/video-player";
import { AlertItem } from "@/components/dashboard/alert-item";
import { StatsCard } from "@/components/dashboard/stats-card";
import { InteractiveCameraControls } from "@/components/dashboard/interactive-camera-controls";
import { InteractiveAlerts } from "@/components/dashboard/interactive-alerts";
import { NotificationToast } from "@/components/ui/notification-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAppStore, Event } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { status: wsStatus } = useWebSocket();
  const cameras = useAppStore((state) => state.cameras);
  const selectedCamera = useAppStore((state) => state.selectedCamera);
  const setSelectedCamera = useAppStore((state) => state.setSelectedCamera);
  const events = useAppStore((state) => state.events);
  const stats = useAppStore((state) => state.stats);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showCameraControls, setShowCameraControls] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    ai: 'active',
    streaming: 'active',
    storage: 'normal',
    network: 'stable'
  });

  // Fetch initial events from the API
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:10000/events');
        const data = await response.json();
        
        if (data && Array.isArray(data.events)) {
          useAppStore.getState().addEvents(data.events);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEvents();
    
    // Update uptime every minute
    const uptimeInterval = setInterval(() => {
      useAppStore.getState().updateStat('uptime', stats.uptime + 60);
    }, 60000);
    
    // Simulate system status updates
    const statusInterval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        ai: Math.random() > 0.1 ? 'active' : 'processing',
        streaming: Math.random() > 0.05 ? 'active' : 'buffering',
        storage: Math.random() > 0.2 ? 'normal' : 'warning',
        network: Math.random() > 0.1 ? 'stable' : 'unstable'
      }));
    }, 10000);
    
    return () => {
      clearInterval(uptimeInterval);
      clearInterval(statusInterval);
    };
  }, [stats.uptime]);

  // Get the currently selected camera object
  const currentCamera = cameras.find(c => c.id === selectedCamera) || cameras[0];
  
  // Format uptime for display
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'stable':
      case 'normal':
        return 'text-green-500';
      case 'processing':
      case 'buffering':
        return 'text-yellow-500';
      case 'warning':
      case 'unstable':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'stable':
      case 'normal':
        return '●';
      case 'processing':
      case 'buffering':
        return '○';
      case 'warning':
      case 'unstable':
        return '▲';
      default:
        return '●';
    }
  };

  return (
    <MainLayout>
      {/* System Status Bar */}
      <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={cn("text-sm", getStatusColor(systemStatus.ai))}>
                {getStatusIcon(systemStatus.ai)}
              </span>
              <span className="text-sm font-medium">AI: {systemStatus.ai}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={cn("text-sm", getStatusColor(systemStatus.streaming))}>
                {getStatusIcon(systemStatus.streaming)}
              </span>
              <span className="text-sm font-medium">Stream: {systemStatus.streaming}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={cn("text-sm", getStatusColor(systemStatus.network))}>
                {getStatusIcon(systemStatus.network)}
              </span>
              <span className="text-sm font-medium">Network: {systemStatus.network}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              {wsStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCameraControls(!showCameraControls)}
            >
              <Camera className="w-4 h-4 mr-2" />
              {showCameraControls ? 'Hide' : 'Show'} Controls
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your cameras and view anomaly alerts.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Test AI
          </Button>
          <Link href="/watch">
            <Button size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Live View
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <StatsCard
          title="Alerts Today"
          value={stats.todayAlertCount}
          icon={Bell}
          iconColor="text-red-500"
          description="Total alerts in the last 24h"
        />
        
        <StatsCard
          title="Active Cameras"
          value={stats.activeDevices}
          icon={Camera}
          iconColor="text-green-500"
          description="Connected devices"
        />
        
        <StatsCard
          title="System Uptime"
          value={formatUptime(stats.uptime)}
          icon={Clock}
          iconColor="text-blue-500"
          description="Since last restart"
        />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main video feed */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live Feed</CardTitle>
                  <CardDescription>
                    {currentCamera?.name || 'Camera Feed'}
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Live</span>
                  <Badge variant="outline" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    AI Active
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-6">
              <VideoPlayer src={currentCamera?.stream_url || ''} />
              
              <div className="flex flex-wrap gap-2 mt-4">
                {cameras.map((camera) => (
                  <Button
                    key={camera.id}
                    variant={camera.id === selectedCamera ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCamera(camera.id)}
                  >
                    {camera.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Camera Controls Panel */}
          {showCameraControls && (
            <InteractiveCameraControls />
          )}
        </div>
        
        {/* Interactive Alerts Panel */}
        <div className="lg:col-span-3 space-y-4">
          <InteractiveAlerts />
        </div>
      </div>

      {/* Real-time Notifications */}
      <NotificationToast />
    </MainLayout>
  );
} 