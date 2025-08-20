"use client";

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Event, useAppStore } from '@/lib/store';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

// Default to localhost in development
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:10000';
};

export const useWebSocket = () => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const { toast } = useToast();
  const addEvent = useAppStore((state) => state.addEvent);

  // Fetch events and check for new ones
  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`${getApiUrl()}/events`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      if (data && Array.isArray(data.events)) {
        // Find events that are new since last check
        const events = data.events as Event[];
        const newEvents = events.filter(event => {
          // If we don't have a lastEventId, get the latest one
          if (!lastEventId) {
            return false;
          }
          // Check if this is a new event
          return event.id !== lastEventId;
        });
        
        // Update last event id if we have events
        if (events.length > 0) {
          setLastEventId(events[0].id);
        }
        
        // Add new events and show notifications
        newEvents.forEach(event => {
          addEvent(event);
          
          // Show toast notification
          toast({
            title: `Alert: ${event.type}`,
            description: event.description || `Confidence: ${Math.round(event.confidence * 100)}%`,
            variant: event.confidence > 0.9 ? 'destructive' : 'default',
          });
        });
        
        // If we successfully fetched, we're connected
        setStatus('connected');
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setStatus('disconnected');
    }
  }, [addEvent, lastEventId, toast]);

  // Set up polling
  useEffect(() => {
    setStatus('connecting');
    
    // Initial fetch
    fetchEvents();
    
    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchEvents();
    }, 2000); // Poll every 2 seconds
    
    // Clean up
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchEvents]);

  // Function to generate a sample event (instead of websocket message)
  const sendMessage = useCallback(async () => {
    try {
      const response = await fetch(`${getApiUrl()}/sample_event`);
      return response.ok;
    } catch (error) {
      console.error("Failed to create sample event:", error);
      return false;
    }
  }, []);

  return { status, sendMessage };
}; 