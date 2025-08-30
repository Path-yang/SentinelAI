"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertsPanel } from "@/components/alerts-panel";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-muted-foreground">System Online</span>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Camera Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No cameras connected</p>
            <p className="text-sm text-muted-foreground mt-2">
              Use the Connect Camera page to add your first camera
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No AI models active</p>
            <p className="text-sm text-muted-foreground mt-2">
              Configure AI detection models in the AI Detection page
            </p>
          </CardContent>
        </Card>
      </div>
      
      <AlertsPanel />
    </div>
  );
} 