"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye, 
  Download, 
  Trash2, 
  Info,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Customize your SentinelAI experience.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <div className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="w-4 h-4" />
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Configure how you receive alerts and notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive alerts in real-time
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound Alerts</Label>
                <div className="text-sm text-muted-foreground">
                  Play sound for new alerts
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Send alerts via email
                </div>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Privacy & Security</span>
            </CardTitle>
            <CardDescription>
              Manage your privacy and security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Collection</Label>
                <div className="text-sm text-muted-foreground">
                  Allow anonymous usage data collection
                </div>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-logout</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically logout after inactivity
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="pt-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Privacy Policy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Data Management</span>
            </CardTitle>
            <CardDescription>
              Manage your data and export options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export Alerts Only
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export Camera Configurations
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>System Information</span>
          </CardTitle>
          <CardDescription>
            Current system status and version information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-sm font-medium">Version</div>
              <div className="text-sm text-muted-foreground">1.0.0</div>
            </div>
            <div>
              <div className="text-sm font-medium">Status</div>
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                Operational
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium">Last Updated</div>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Support</div>
              <Button variant="link" className="p-0 h-auto text-sm">
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
} 