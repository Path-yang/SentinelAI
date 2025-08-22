"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Volume2, 
  VolumeX,
  Settings,
  Zap
} from "lucide-react";
import { useAppStore, Event } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  cameraId?: string;
  eventId?: string;
  isRead: boolean;
}

export function NotificationToast() {
  const events = useAppStore((state) => state.events);
  const cameras = useAppStore((state) => state.cameras);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Convert events to notifications
  useEffect(() => {
    const newNotifications: Notification[] = events
      .filter(event => {
        // Only show recent events (last 10 minutes)
        const eventTime = new Date(event.timestamp);
        const now = new Date();
        const diffMinutes = (now.getTime() - eventTime.getTime()) / (1000 * 60);
        return diffMinutes <= 10;
      })
      .map(event => ({
        id: event.id,
        type: event.confidence > 0.8 ? 'alert' : event.confidence > 0.5 ? 'warning' : 'info',
        title: `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} Detected`,
        message: event.description || `Anomaly detected on ${cameras.find(c => c.id === event.camera_id)?.name || event.camera_id}`,
        timestamp: new Date(event.timestamp),
        cameraId: event.camera_id,
        eventId: event.id,
        isRead: false
      }));

    // Add new notifications
    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const newOnes = newNotifications.filter(n => !existingIds.has(n.id));
      return [...prev, ...newOnes];
    });

    // Play sound for new alerts (if not muted)
    if (!isMuted && newNotifications.some(n => n.type === 'alert')) {
      playNotificationSound();
    }
  }, [events, cameras, isMuted]);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  const playNotificationSound = () => {
    try {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Could not play notification sound');
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ago`;
  };

  const recentNotifications = notifications
    .slice(-5) // Show last 5 notifications
    .reverse(); // Most recent first

  if (!showNotifications) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Notification Controls */}
      <div className="flex items-center justify-between bg-background border rounded-lg p-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4" />
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="h-8 w-8 p-0"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-8 w-8 p-0"
            disabled={unreadCount === 0}
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {recentNotifications.length > 0 ? (
          recentNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "transition-all duration-200 hover:shadow-md cursor-pointer",
                getNotificationColor(notification.type),
                !notification.isRead && "ring-2 ring-primary/20"
              )}
              onClick={() => markAsRead(notification.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground">
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    
                    {notification.cameraId && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {cameras.find(c => c.id === notification.cameraId)?.name || notification.cameraId}
                        </Badge>
                        {notification.type === 'alert' && (
                          <Badge variant="destructive" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            High Priority
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent notifications</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Show More Button */}
      {notifications.length > 5 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            // This could open a full notifications panel
            console.log('Show all notifications');
          }}
        >
          View All ({notifications.length})
        </Button>
      )}
    </div>
  );
} 