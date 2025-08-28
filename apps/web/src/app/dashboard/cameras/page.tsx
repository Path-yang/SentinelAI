"use client";

import { useState } from "react";
import { Camera, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlertsStore } from "@/store/alerts-store";

// Mock camera data
const cameras = [
  {
    id: "camera_living_room",
    name: "Living Room",
    status: "online",
    stream_url: "http://localhost:8084/mystream/index.m3u8",
  },
  {
    id: "camera_bedroom",
    name: "Bedroom",
    status: "offline",
    stream_url: "http://localhost:8084/bedroom/index.m3u8",
  },
  {
    id: "camera_kitchen",
    name: "Kitchen",
    status: "online",
    stream_url: "http://localhost:8084/kitchen/index.m3u8",
  },
];

export default function CamerasPage() {
  const { alerts } = useAlertsStore();
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  // Count alerts per camera
  const alertCountByCamera = alerts.reduce((acc, alert) => {
    acc[alert.cameraId] = (acc[alert.cameraId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cameras</h1>
          <p className="text-muted-foreground">
            Manage and monitor your connected cameras.
          </p>
        </div>
        <div>
          <Button>
            <Camera className="w-4 h-4 mr-2" />
            Add Camera
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <h3 className="font-semibold tracking-tight">{camera.name}</h3>
                </div>
                <Badge
                  variant={camera.status === "online" ? "default" : "destructive"}
                >
                  {camera.status}
                </Badge>
              </div>

              <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center">
                {camera.status === "online" ? (
                  <img
                    src="/camera-placeholder.jpg"
                    alt={camera.name}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/800x450/1a1a2e/ffffff?text=Camera+Preview";
                    }}
                  />
                ) : (
                  <div className="text-center p-4">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Camera offline</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {alertCountByCamera[camera.id] || 0} alerts today
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 