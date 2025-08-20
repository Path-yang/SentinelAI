"use client";

import { Badge } from "@/components/ui/badge";
import { Wifi } from "lucide-react";

interface LatencyBadgeProps {
  className?: string;
}

export function LatencyBadge({ className = "" }: LatencyBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={`absolute top-3 left-3 z-10 bg-black/70 text-white border-0 ${className}`}
    >
      <Wifi className="w-3 h-3 mr-1" />
      LIVE ~1-2s
    </Badge>
  );
} 