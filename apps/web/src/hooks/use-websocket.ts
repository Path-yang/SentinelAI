"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAlertsStore, Alert } from "@/store/alerts-store";
import { useToast } from "@/hooks/use-toast";

interface WebSocketHookOptions {
  url: string;
  onMessage?: (data: any) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  silent?: boolean; // Add silent option
}

export function useWebSocket({
  url,
  onMessage,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
  silent = false, // Default to false
}: WebSocketHookOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { addAlert } = useAlertsStore();
  const { toast } = useToast();

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message:", data);

          if (data.type === "new_event") {
            const alert = data.data as Alert;
            addAlert(alert);

            // Dispatch custom event for toast
            const customEvent = new CustomEvent("sentinelai:alert", {
              detail: alert,
            });
            window.dispatchEvent(customEvent);

            // Show toast notification
            toast({
              title: `${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Detected`,
              description: `Camera: ${alert.cameraId} - Confidence: ${Math.round(
                (alert.confidence ?? 0) * 100
              )}%`,
              variant: "destructive",
            });
          }

          // Call the custom onMessage handler if provided
          if (onMessage) {
            onMessage(data);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(
              `Attempting to reconnect (${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})...`
            );
            reconnectAttemptsRef.current += 1;
            connect();
          }, reconnectInterval);
        } else {
          setError(new Error("Maximum reconnection attempts reached"));
        }
      };

      ws.onerror = (event) => {
        // Only show errors if not in silent mode
        if (!silent) {
          console.error("WebSocket error:", event);
          setError(new Error("WebSocket error occurred"));
        }
      };

      wsRef.current = ws;
    } catch (err) {
      if (!silent) {
        console.error("Error creating WebSocket:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }, [url, onMessage, reconnectInterval, maxReconnectAttempts, addAlert, toast, silent]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const send = useCallback(
    (data: any) => {
      if (wsRef.current && isConnected) {
        wsRef.current.send(JSON.stringify(data));
      } else {
        console.error("WebSocket is not connected");
      }
    },
    [isConnected]
  );

  return {
    isConnected,
    error,
    send,
  };
} 