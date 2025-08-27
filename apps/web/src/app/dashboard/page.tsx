"use client";

import { useEffect } from "react";
import { VideoPlayer } from "@/components/video-player";
import { AlertsPanel } from "@/components/alerts-panel";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Zap, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { isConnected } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:10000/ws/alerts",
    silent: true, // Suppress WebSocket error messages
  });
  
  const { toast } = useToast();

  // Test function to trigger a sample alert
  const testAI = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000"}/sample_event`
      );
      
      if (response.ok) {
        toast({
          title: "Test Alert Triggered",
          description: "A sample alert has been sent to the system.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to trigger test alert.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error triggering test alert:", error);
      toast({
        title: "Error",
        description: "Failed to connect to the API.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your cameras and view anomaly alerts.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={testAI}>
            <Zap className="w-4 h-4 mr-2" />
            Test AI
          </Button>
          <Button>
            <Camera className="w-4 h-4 mr-2" />
            Live View
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-lg bg-card text-card-foreground shadow-sm border">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold leading-none tracking-tight">
                    Live Feed
                  </h3>
                  <p className="text-sm text-muted-foreground">Living Room</p>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">Live</span>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    AI Active
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 pt-2 pb-6">
              <VideoPlayer
                src={
                  process.env.NEXT_PUBLIC_HLS_URL ||
                  "http://localhost:8084/mystream/index.m3u8"
                }
              />
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 space-y-4">
          <div className="space-y-4">
            <AlertsPanel />
          </div>
        </div>
      </div>
    </div>
  );
} 