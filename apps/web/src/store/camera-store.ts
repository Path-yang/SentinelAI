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
  resetStore: () => void;
}

// Initial state
const initialState = {
  streamUrl: null,
  isConnected: false,
  cameraDetails: {
    ip: '',
    port: '554',
    path: 'stream1',
    username: '',
    password: '',
    streamName: 'my_camera',
  }
};

export const useCameraStore = create<CameraState>()(
  persist(
    (set) => ({
      ...initialState,
      setStreamUrl: (url) => set({ streamUrl: url }),
      setIsConnected: (connected) => set({ isConnected: connected }),
      setCameraDetails: (details) => set((state) => ({
        cameraDetails: { ...state.cameraDetails, ...details },
      })),
      disconnect: () => set({ 
        streamUrl: null, 
        isConnected: false 
      }),
      resetStore: () => set(initialState),
    }),
    {
      name: 'camera-storage',
    }
  )
); 