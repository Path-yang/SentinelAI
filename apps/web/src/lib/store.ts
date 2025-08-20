import { create } from 'zustand';

export interface Event {
  id: string;
  camera_id: string;
  type: string;
  confidence: number;
  timestamp: string;
  description?: string;
}

interface AppState {
  // Cameras
  cameras: { id: string; name: string; stream_url: string }[];
  selectedCamera: string | null;
  
  // Events
  events: Event[];
  
  // State mutations
  setSelectedCamera: (cameraId: string | null) => void;
  addEvent: (event: Event) => void;
  addEvents: (events: Event[]) => void;
  clearEvents: () => void;
  
  // Stats 
  stats: {
    todayAlertCount: number;
    activeDevices: number;
    uptime: number; // in seconds
  };
  updateStat: (key: keyof AppState['stats'], value: number) => void;
}

// Get HLS URL from environment variable
const envHlsUrl = process.env.NEXT_PUBLIC_HLS_URL;

// Initial state with demo data
const initialCameras = [
  { id: 'camera_living_room', name: 'Living Room', stream_url: envHlsUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: 'camera_bedroom', name: 'Bedroom', stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: 'camera_kitchen', name: 'Kitchen', stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
];

export const useAppStore = create<AppState>((set, get) => {
  // Get stored camera selection from localStorage
  const getStoredCameraSelection = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sentinelai-selected-camera');
      return stored || initialCameras[0]?.id || null;
    }
    return initialCameras[0]?.id || null;
  };

  return {
    // Initial state
    cameras: initialCameras,
    selectedCamera: getStoredCameraSelection(),
    events: [],
    
    stats: {
      todayAlertCount: 0,
      activeDevices: initialCameras.length,
      uptime: 3600, // 1 hour in seconds as demo
    },
    
    // Actions
    setSelectedCamera: (cameraId) => {
      set({ selectedCamera: cameraId });
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sentinelai-selected-camera', cameraId || '');
      }
    },
  
  addEvent: (event) => set((state) => {
    // Add event and increment today's alert count
    return { 
      events: [event, ...state.events],
      stats: {
        ...state.stats,
        todayAlertCount: state.stats.todayAlertCount + 1,
      }
    };
  }),
  
  addEvents: (newEvents) => set((state) => {
    return { 
      events: [...newEvents, ...state.events],
      stats: {
        ...state.stats,
        todayAlertCount: state.stats.todayAlertCount + newEvents.length,
      }
    };
  }),
  
  clearEvents: () => set({ events: [] }),
  
  updateStat: (key, value) => set((state) => ({
    stats: {
      ...state.stats,
      [key]: value,
    }
  })),
  };
});