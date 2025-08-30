"use client";

import { create } from 'zustand';

export interface CameraSession {
  camera_id: string;
  publish_url: string;
  hls_url: string;
  created_at?: number;
  label?: string;
}

export interface CameraDetails {
  ip: string;
  port: string;
  path: string;
  username: string;
  password: string;
  streamName: string;
}

interface CameraStore {
  // Cloud Bridge session
  currentSession: CameraSession | null;
  isSessionActive: boolean;
  
  // Legacy camera details (for future use)
  cameraDetails: CameraDetails;
  
  // Stream state
  streamUrl: string | null;
  isConnected: boolean;
  isStreaming: boolean;
  
  // Actions
  setSession: (session: CameraSession | null) => void;
  clearSession: () => void;
  setStreamUrl: (url: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  setCameraDetails: (details: CameraDetails) => void;
  disconnect: () => void;
  
  // Computed values
  getRtspUrl: () => string;
  getHlsUrl: () => string | null;
}

export const useCameraStore = create<CameraStore>((set, get) => ({
  // Cloud Bridge session
  currentSession: null,
  isSessionActive: false,
  
  // Legacy camera details
  cameraDetails: {
    ip: '',
    port: '554',
    path: '',
    username: '',
    password: '',
    streamName: 'mystream'
  },
  
  // Stream state
  streamUrl: null,
  isConnected: false,
  isStreaming: false,
  
  // Actions
  setSession: (session) => set({ 
    currentSession: session, 
    isSessionActive: !!session,
    isConnected: !!session,
    streamUrl: session?.hls_url || null
  }),
  
  clearSession: () => set({ 
    currentSession: null, 
    isSessionActive: false,
    isConnected: false,
    streamUrl: null,
    isStreaming: false
  }),
  
  setStreamUrl: (url) => set({ streamUrl: url }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setCameraDetails: (details) => set({ cameraDetails: details }),
  
  disconnect: () => set({ 
    streamUrl: null, 
    isConnected: false, 
    isStreaming: false,
    currentSession: null,
    isSessionActive: false
  }),
  
  // Computed values
  getRtspUrl: () => {
    const { cameraDetails } = get();
    if (!cameraDetails.ip) return '';
    
    const auth = cameraDetails.username && cameraDetails.password 
      ? `${cameraDetails.username}:${cameraDetails.password}@`
      : '';
    
    return `rtsp://${auth}${cameraDetails.ip}:${cameraDetails.port}${cameraDetails.path}`;
  },
  
  getHlsUrl: () => {
    const { currentSession, streamUrl } = get();
    return currentSession?.hls_url || streamUrl;
  }
})); 