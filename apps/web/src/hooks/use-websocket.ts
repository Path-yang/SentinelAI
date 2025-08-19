"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Event, useAppStore } from '@/lib/store';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected';

// Default to localhost in development
const getWebSocketUrl = () => {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/alerts';
  return wsUrl;
};

export const useWebSocket = () => {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const socket = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const addEvent = useAppStore((state) => state.addEvent);

  // Handle incoming messages from WebSocket
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      // If we receive a new event notification
      if (data.type === 'new_event' && data.data) {
        const newEvent = data.data as Event;
        
        // Add to store
        addEvent(newEvent);
        
        // Show toast notification
        toast({
          title: `Alert: ${newEvent.type}`,
          description: newEvent.description || `Confidence: ${Math.round(newEvent.confidence * 100)}%`,
          variant: newEvent.confidence > 0.9 ? 'destructive' : 'default',
        });
      }
    } catch (err) {
      console.error('Failed to parse WebSocket message', err);
    }
  }, [addEvent, toast]);

  // Connect/Reconnect logic
  const connect = useCallback(() => {
    if (socket.current?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = getWebSocketUrl();
      setStatus('connecting');
      
      socket.current = new WebSocket(wsUrl);
      
      socket.current.onopen = () => {
        setStatus('connected');
        console.log('WebSocket connected');
        
        // Clear any pending reconnect timeouts
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
      };
      
      socket.current.onclose = () => {
        setStatus('disconnected');
        console.log('WebSocket disconnected, attempting to reconnect...');
        
        // Reconnect with exponential backoff
        reconnectTimeout.current = setTimeout(() => {
          connect();
        }, 2000);
      };
      
      socket.current.onerror = (error) => {
        console.error('WebSocket error', error);
        socket.current?.close();
      };
      
      socket.current.onmessage = handleMessage;
    } catch (err) {
      console.error('Failed to connect WebSocket', err);
      setStatus('disconnected');
      
      // Try to reconnect
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, 5000);
    }
  }, [handleMessage]);

  // Connect on component mount
  useEffect(() => {
    connect();
    
    // Cleanup on component unmount
    return () => {
      if (socket.current) {
        socket.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [connect]);

  // Send message function
  const sendMessage = useCallback((message: any) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  return { status, sendMessage };
}; 