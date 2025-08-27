"use client";

import { useState } from "react";
import { Save, Moon, Sun, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [savedSettings, setSavedSettings] = useState(false);

  const handleSave = () => {
    setSavedSettings(true);
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your preferences and system settings.
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-8">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Appearance</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme" className="text-sm font-medium">
                  Theme
                </Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="w-24"
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="w-24"
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="w-24"
                  >
                    System
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">SentinelAI</h4>
                  <p className="text-sm text-muted-foreground">
                    Version 0.1.0 - Prototype
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    SentinelAI transforms ordinary commercial cameras into smart
                    anomaly detectors using advanced AI technology.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Privacy Information</h4>
                <p className="text-sm text-muted-foreground">
                  All video processing is done locally on your device or server.
                  No video data is sent to external servers unless explicitly
                  configured.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 