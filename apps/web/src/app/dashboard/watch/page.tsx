"use client";

import { VideoPlayer } from "@/components/video-player";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WatchPage() {
  const { isConnected } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:10000/ws/alerts",
  });

  return (
    <div className="container mx-auto py-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Live Stream</h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-sm text-muted-foreground">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          <div className="rounded-lg bg-card text-card-foreground shadow-sm border">
            <div className="p-6">
              <VideoPlayer
                src={
                  process.env.NEXT_PUBLIC_HLS_URL ||
                  "http://localhost:8084/mystream/index.m3u8"
                }
                className="w-full aspect-video"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 