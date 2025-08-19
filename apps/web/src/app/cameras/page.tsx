"use client";

import { useEffect, useState } from "react";
import { Camera as CameraIcon } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { VideoPlayer } from "@/components/video-player";
import { AlertItem } from "@/components/dashboard/alert-item";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";

export default function CamerasPage() {
  const cameras = useAppStore((state) => state.cameras);
  const events = useAppStore((state) => state.events);

  // Group events by camera
  const eventsByCamera = events.reduce((acc, event) => {
    if (!acc[event.camera_id]) {
      acc[event.camera_id] = [];
    }
    acc[event.camera_id].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  // Animation variants for staggered appearance
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cameras</h1>
          <p className="text-muted-foreground">
            View and manage your connected cameras.
          </p>
        </div>
      </div>

      <motion.div 
        className="grid gap-6 md:grid-cols-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {cameras.map((camera) => {
          const cameraEvents = eventsByCamera[camera.id] || [];
          return (
            <motion.div key={camera.id} variants={item}>
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CameraIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle>{camera.name}</CardTitle>
                        <CardDescription>{camera.id}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-muted-foreground">Online</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 flex flex-col flex-1">
                  <div className="h-64 mb-4">
                    <VideoPlayer src={camera.stream_url} className="h-full" />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recent Alerts</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cameraEvents.length > 0 ? (
                        cameraEvents.slice(0, 3).map((event, index) => (
                          <AlertItem 
                            key={event.id} 
                            alert={event} 
                            index={index} 
                            cameraName={camera.name} 
                          />
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No alerts for this camera
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </MainLayout>
  );
} 