"use client";

import { useEffect, useState } from "react";
import { Bell, X, Volume2, VolumeX, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'alert' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  cameraId: string;
  eventId: string;
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
      console.warn('Could not play notification sound:', error);
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

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  if (!showNotifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
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
            className="h-6 w-6 p-0"
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(false)}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notifications.slice(0, 5).map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "bg-background border rounded-lg p-3 shadow-lg transition-all",
              !notification.isRead && "ring-2 ring-primary/20"
            )}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium truncate">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                      <span>{formatTimeAgo(notification.timestamp)}</span>
                      <span>•</span>
                      <span>
                        {cameras.find(c => c.id === notification.cameraId)?.name || notification.cameraId}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNotifications(prev => prev.filter(n => n.id !== notification.id));
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between bg-background border rounded-lg p-2 shadow-lg">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark All Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          
          {notifications.length > 5 && (
            <Button variant="link" size="sm" className="text-xs">
              View All ({notifications.length})
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 