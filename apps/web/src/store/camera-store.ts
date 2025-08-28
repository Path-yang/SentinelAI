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

// Reset store on first load to clear any persisted data
// This helps prevent issues with cached streams
if (typeof window !== 'undefined') {
  // Only run in browser, not during SSR
  setTimeout(() => {
    const persistedState = JSON.parse(localStorage.getItem('camera-storage') || '{}');
    const isFirstLoad = !localStorage.getItem('camera-store-initialized');
    
    if (isFirstLoad || (persistedState?.state?.isConnected && !document.hasFocus())) {
      console.log('Resetting camera store state on first load or because tab was inactive');
      useCameraStore.getState().disconnect();
      localStorage.setItem('camera-store-initialized', 'true');
    }
  }, 100);
} 