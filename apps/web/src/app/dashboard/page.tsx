"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCameraStore } from "@/store/camera-store";

export default function Dashboard() {
  const { isConnected } = useCameraStore();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Dashboard Status */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-sm">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Camera Status */}
        <Card>
          <CardHeader>
            <CardTitle>Camera Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="text-sm text-green-600">Camera connected</div>
            ) : (
              <div className="text-sm text-gray-500">
                No cameras connected
                <br />
                <span className="text-xs">Use the Connect Camera page to add your first camera</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Detection Status */}
        <Card>
          <CardHeader>
            <CardTitle>AI Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              No AI models active
              <br />
              <span className="text-xs">Configure AI detection models in the AI Detection page</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              0 alerts in the last 24 hours
              <br />
              <span className="text-xs">Alerts will appear here when detected</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 