import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CameraState {
  streamUrl: string | null;
  isConnected: boolean;
  cameraDetails: {
    ip: string;
    port: string;
    path: string;
    username: string;
    password: string;
    streamName: string;
  };
  setStreamUrl: (url: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setCameraDetails: (details: Partial<CameraState['cameraDetails']>) => void;
  disconnect: () => void;
}

export const useCameraStore = create<CameraState>()(
  persist(
    (set) => ({
      streamUrl: null,
      isConnected: false,
      cameraDetails: {
        ip: '',
        port: '554',
        path: 'stream1',
        username: '',
        password: '',
        streamName: 'my_camera',
      },
      setStreamUrl: (url) => set({ streamUrl: url }),
      setIsConnected: (connected) => set({ isConnected: connected }),
      setCameraDetails: (details) => set((state) => ({
        cameraDetails: { ...state.cameraDetails, ...details },
      })),
      disconnect: () => set({ 
        streamUrl: null, 
        isConnected: false 
      }),
    }),
    {
      name: 'camera-storage',
    }
  )
); 