"use client";

import { motion } from "framer-motion";
import { AlertCircle, Camera } from "lucide-react";
import { Event } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";

interface AlertItemProps {
  alert: Event;
  index: number;
  cameraName?: string;
}

export function AlertItem({ alert, index, cameraName }: AlertItemProps) {
  // Format timestamp
  const timestamp = new Date(alert.timestamp);
  const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Style based on confidence level
  const getAlertSeverityColor = (confidence: number) => {
    if (confidence > 0.9) return "bg-red-500";
    if (confidence > 0.7) return "bg-amber-500";
    return "bg-blue-500";
  };

  // Create animation delay based on index
  const delay = index * 0.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
        delay,
      }}
    >
      <Card className="overflow-hidden">
        <div className="flex">
          <div className={`${getAlertSeverityColor(alert.confidence)} w-2`} />
          <CardContent className="p-4 w-full">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{alert.type}</div>
                  <div className="text-sm text-muted-foreground">
                    {alert.description || `Anomaly detected with ${Math.round(alert.confidence * 100)}% confidence`}
                  </div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Camera className="h-3 w-3 mr-1" />
                    <span>{cameraName || alert.camera_id}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {formattedTime}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
} 