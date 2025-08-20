"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Bell, Camera, Clock } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { VideoPlayer } from "@/components/video-player";
import { AlertItem } from "@/components/dashboard/alert-item";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAppStore, Event } from "@/lib/store";

export default function DashboardPage() {
  const { status: wsStatus } = useWebSocket();
  const cameras = useAppStore((state) => state.cameras);
  const selectedCamera = useAppStore((state) => state.selectedCamera);
  const setSelectedCamera = useAppStore((state) => state.setSelectedCamera);
  const events = useAppStore((state) => state.events);
  const stats = useAppStore((state) => state.stats);
  
  const [isLoading, setIsLoading] = useState(true);

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
    
    return () => {
      clearInterval(uptimeInterval);
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

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your cameras and view anomaly alerts.
          </p>
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
        </div>
        
        {/* Alerts panel */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Alerts</CardTitle>
                <Link href="/cameras">
                  <Button variant="link" size="sm" className="text-muted-foreground">
                    View all
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-6 max-h-[550px] overflow-y-auto">
              <div className="space-y-3">
                {events.length > 0 ? (
                  events.slice(0, 10).map((event, index) => {
                    const camera = cameras.find(c => c.id === event.camera_id);
                    return (
                      <AlertItem
                        key={event.id}
                        alert={event}
                        index={index}
                        cameraName={camera?.name}
                      />
                    );
                  })
                ) : isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-pulse flex items-center space-x-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-1">No alerts yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Alerts will appear here when anomalies are detected
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 