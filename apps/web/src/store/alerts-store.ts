"use client";

import { create } from 'zustand';

export type AlertType = 'motion' | 'person' | 'object' | 'fall' | 'unknown';
export type AlertSeverity = 'low' | 'medium' | 'high';

export interface Alert {
  id: string;
  timestamp: number;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  cameraId: string;
  cameraName?: string;
  imageUrl?: string;
  /** Confidence score for the alert (0 to 1) */
  confidence?: number;
  /** Description of the alert */
  description?: string;
  acknowledged: boolean;
}

interface AlertsState {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>) => void;
  acknowledgeAlert: (id: string) => void;
  acknowledgeAll: () => void;
  clearAlerts: () => void;
}

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: [],
  
  addAlert: (alertData) => set((state) => {
    const newAlert: Alert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      acknowledged: false,
    };
    
    return {
      alerts: [newAlert, ...state.alerts].slice(0, 100), // Keep only the last 100 alerts
    };
  }),
  
  acknowledgeAlert: (id) => set((state) => ({
    alerts: state.alerts.map((alert) =>
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ),
  })),
  
  acknowledgeAll: () => set((state) => ({
    alerts: state.alerts.map((alert) => ({ ...alert, acknowledged: true })),
  })),
  
  clearAlerts: () => set({ alerts: [] }),
})); 