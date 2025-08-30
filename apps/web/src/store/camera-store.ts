"use client";

import { create } from 'zustand';

interface CameraDetails {
  ip: string;
  port: string;
  path: string;
  username: string;
  password: string;
  streamName: string;
}

interface CameraState {
  streamUrl: string | null;
  isConnected: boolean;
  cameraDetails: CameraDetails;
  setCameraDetails: (details: Partial<CameraDetails>) => void;
  setStreamUrl: (url: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  disconnect: () => void;
  resetStore: () => void;
}

const defaultCameraDetails: CameraDetails = {
  ip: "",
  port: "554",
  path: "stream1",
  username: "",
  password: "",
  streamName: "My Camera",
};

export const useCameraStore = create<CameraState>((set, get) => ({
  streamUrl: null,
  isConnected: false,
  cameraDetails: defaultCameraDetails,
  
  setCameraDetails: (details) => set((state) => ({
    cameraDetails: { ...state.cameraDetails, ...details }
  })),
  
  setStreamUrl: (url) => set({ streamUrl: url }),
  
  setIsConnected: (connected) => set({ isConnected: connected }),
  
  disconnect: () => set({
    streamUrl: null,
    isConnected: false,
  }),
  
  resetStore: () => set({
    streamUrl: null,
    isConnected: false,
    cameraDetails: defaultCameraDetails,
  }),
})); 