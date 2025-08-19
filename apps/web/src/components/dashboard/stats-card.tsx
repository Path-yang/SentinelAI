"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-blue-500",
  trend
}: StatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {(description || trend) && (
          <div className="flex items-center space-x-1 mt-1">
            {trend && (
              <span 
                className={`text-xs ${trend.positive ? 'text-green-500' : 'text-red-500'}`}
              >
                {trend.positive ? '+' : '-'}{trend.value}%
              </span>
            )}
            
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 