"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Wifi, AlertTriangle, Settings } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function CamerasPage() {
  const cameras = useAppStore((state) => state.cameras);
  const events = useAppStore((state) => state.events);

  const getCameraEvents = (cameraId: string) => {
    return events.filter(event => event.cameraId === cameraId);
  };

  const getCameraStatus = (cameraId: string) => {
    // Simulate camera status based on events
    const recentEvents = getCameraEvents(cameraId).filter(event => {
      const eventTime = new Date(event.timestamp);
      const now = new Date();
      const diffHours = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60);
      return diffHours < 24;
    });
    
    if (recentEvents.length === 0) return 'online';
    if (recentEvents.some(e => e.confidence > 0.8)) return 'alert';
    return 'warning';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'alert': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '●';
      case 'warning': return '○';
      case 'alert': return '▲';
      default: return '●';
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cameras</h1>
          <p className="text-muted-foreground">
            Manage and monitor your connected cameras.
          </p>
        </div>
        
        <Button>
          <Camera className="w-4 h-4 mr-2" />
          Add Camera
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cameras.map((camera) => {
          const status = getCameraStatus(camera.id);
          const cameraEvents = getCameraEvents(camera.id);
          const recentEvents = cameraEvents.filter(event => {
            const eventTime = new Date(event.timestamp);
            const now = new Date();
            const diffHours = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60);
            return diffHours < 24;
          });

          return (
            <Card key={camera.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{camera.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={`text-sm ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {status}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Camera ID: {camera.id}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center space-x-1">
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span>Connected</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Alerts (24h)</span>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span>{recentEvents.length}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Events</span>
                  <span>{cameraEvents.length}</span>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Feed
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {cameras.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No cameras connected</h3>
          <p className="text-muted-foreground mb-4">
            Add your first camera to start monitoring.
          </p>
          <Button>
            <Camera className="w-4 h-4 mr-2" />
            Add Camera
          </Button>
        </div>
      )}
    </MainLayout>
  );
} 