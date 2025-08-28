"use client";

import { useState } from "react";
import { VideoPlayer } from "@/components/video-player";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Heart, AlertTriangle, PieChart, Eye, Bell } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCameraStore } from "@/store/camera-store";

// Define monitoring categories and options
const monitoringOptions = [
  {
    id: "health",
    name: "Health & Safety",
    icon: Heart,
    description: "Monitor for health-related emergencies",
    options: [
      { id: "falls", name: "Fall Detection", description: "Detect when someone falls" },
      { id: "immobility", name: "Extended Immobility", description: "Alert when someone is immobile for too long" },
      { id: "seizures", name: "Seizure Detection", description: "Detect signs of seizure activity" },
    ]
  },
  {
    id: "security",
    name: "Security",
    icon: Shield,
    description: "Monitor for security concerns",
    options: [
      { id: "intruders", name: "Intruder Detection", description: "Detect unauthorized persons" },
      { id: "objects", name: "Abandoned Objects", description: "Identify suspicious unattended items" },
      { id: "tampering", name: "Camera Tampering", description: "Alert if camera is tampered with" },
    ]
  },
  {
    id: "emergencies",
    name: "Emergencies",
    icon: AlertTriangle,
    description: "Monitor for emergency situations",
    options: [
      { id: "fire", name: "Fire Detection", description: "Detect flames or smoke" },
      { id: "accidents", name: "Accidents", description: "Detect potential accidents" },
      { id: "distress", name: "Distress Signs", description: "Identify distress behaviors" },
    ]
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: PieChart,
    description: "Gather analytical insights",
    options: [
      { id: "occupancy", name: "Occupancy Counting", description: "Count people in the area" },
      { id: "dwell", name: "Dwell Time", description: "Measure how long people stay in areas" },
      { id: "traffic", name: "Traffic Patterns", description: "Analyze movement patterns" },
    ]
  }
];

export default function WatchPage() {
  const { isConnected } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:10000/ws/alerts",
  });
  
  const { streamUrl } = useCameraStore();
  const [activeCategory, setActiveCategory] = useState("health");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [alertLevel, setAlertLevel] = useState<"low" | "medium" | "high">("medium");

  // Toggle monitoring option
  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId) 
        : [...prev, optionId]
    );
  };

  // Count active options by category
  const getActiveCounts = () => {
    return monitoringOptions.reduce((acc, category) => {
      acc[category.id] = category.options.filter(option => 
        selectedOptions.includes(option.id)
      ).length;
      return acc;
    }, {} as Record<string, number>);
  };

  const activeCounts = getActiveCounts();
  const totalActive = selectedOptions.length;

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
          {totalActive > 0 && (
            <Badge className="bg-primary">
              <Eye className="w-3 h-3 mr-1" />
              {totalActive} Active
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card>
            <CardContent className="p-4">
              <VideoPlayer
                src={streamUrl || process.env.NEXT_PUBLIC_HLS_URL || "http://localhost:8084/mystream/index.m3u8"}
                className="w-full aspect-video rounded-md overflow-hidden"
              />
            </CardContent>
          </Card>

          {/* Active Monitoring Summary */}
          {totalActive > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Active Monitoring
                </CardTitle>
                <CardDescription>
                  SentinelAI is actively monitoring for {totalActive} different conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {monitoringOptions.map(category => {
                    const count = activeCounts[category.id];
                    if (count === 0) return null;
                    
                    return (
                      <div key={category.id} className="flex items-start space-x-3">
                        <category.icon className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {count} active condition{count !== 1 ? 's' : ''}
                          </p>
                          <div className="mt-1 space-y-1">
                            {category.options.map(option => {
                              if (!selectedOptions.includes(option.id)) return null;
                              
                              return (
                                <Badge key={option.id} variant="outline" className="mr-1 mt-1">
                                  {option.name}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 flex justify-between items-center border-t pt-4">
                  <div>
                    <span className="text-sm font-medium">Alert Sensitivity:</span>
                    <div className="flex space-x-2 mt-1">
                      <Badge 
                        variant={alertLevel === "low" ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setAlertLevel("low")}
                      >
                        Low
                      </Badge>
                      <Badge 
                        variant={alertLevel === "medium" ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setAlertLevel("medium")}
                      >
                        Medium
                      </Badge>
                      <Badge 
                        variant={alertLevel === "high" ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setAlertLevel("high")}
                      >
                        High
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setSelectedOptions([])}
                  >
                    Stop All Monitoring
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Monitoring Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Options</CardTitle>
              <CardDescription>
                Select what you want SentinelAI to monitor for
              </CardDescription>
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mt-2">
                <TabsList className="grid grid-cols-4">
                  {monitoringOptions.map(category => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="relative"
                    >
                      <category.icon className="h-4 w-4" />
                      {activeCounts[category.id] > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {activeCounts[category.id]}
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monitoringOptions.find(c => c.id === activeCategory)?.options.map(option => (
                  <div 
                    key={option.id} 
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <h3 className="font-medium">{option.name}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <Switch 
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={() => toggleOption(option.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Alert Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
              <CardDescription>
                Configure how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">In-App Notifications</h3>
                    <p className="text-sm text-muted-foreground">Show alerts in the app</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sound Alerts</h3>
                    <p className="text-sm text-muted-foreground">Play sound when alert triggers</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Send email for critical alerts</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 