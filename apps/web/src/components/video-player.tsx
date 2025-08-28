"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { useAlertsStore, Alert } from "@/store/alerts-store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface VideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  silent?: boolean;
  stabilizePlayback?: boolean; // Add prop to prevent constant reconnecting
}

export function VideoPlayer({
  src,
  className,
  autoPlay = true,
  muted = true,
  controls = true,
  silent = false,
  stabilizePlayback = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { alerts } = useAlertsStore();
  
  // Track if we've already set up HLS to prevent multiple setups
  const setupCompleteRef = useRef(false);
  
  // Add a timestamp reference to track when we last received data
  const lastActivityRef = useRef(Date.now());
  
  // Function to reload the stream if it's stale
  const checkStreamHealth = useCallback(() => {
    const now = Date.now();
    const video = videoRef.current;
    const hls = hlsRef.current;
    
    // If no activity for more than 30 seconds, reload the stream
    if (now - lastActivityRef.current > 30000 && video && hls) {
      console.log("Stream appears stale, reloading...");
      
      // Try to recover by reloading the stream
      try {
        // First try a simple restart
        hls.stopLoad();
        hls.startLoad();
        
        // If we have a position, seek there to force refresh
        if (video.duration) {
          video.currentTime = video.duration;
        }
        
        // Reset our activity timestamp
        lastActivityRef.current = now;
      } catch (e) {
        console.error("Error reloading stale stream:", e);
        
        // If simple reload fails, do a complete reset
        setupHls();
      }
    }
  }, []);

  // Handle browser visibility changes (tab switching, sleep, etc.)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, checking stream health...');
        checkStreamHealth();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkStreamHealth]);
  
  // Setup periodic health check for the stream
  useEffect(() => {
    // Check the stream health every 10 seconds
    intervalRef.current = setInterval(checkStreamHealth, 10000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkStreamHealth]);

  // Define setupHls function at component level so we can reuse it
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Fix the AbortError and improve latency
  const setupHls = useCallback(() => {
    if (!videoRef.current || !src || setupCompleteRef.current) return;
    
    if (Hls.isSupported()) {
      if (hlsRef.current) { 
        hlsRef.current.destroy(); 
      }
      
      // Create extreme low-latency HLS configuration
      const hls = new Hls({ 
        enableWorker: true,
        lowLatencyMode: true,
        liveSyncDuration: 0.2,
        liveMaxLatencyDuration: 0.4,
        maxBufferLength: 0.5,
        maxBufferSize: 2 * 1000 * 1000,
        debug: false,
        xhrSetup: function(xhr) {
          xhr.setRequestHeader('Cache-Control', 'no-cache');
          // Allow cross-origin for HLS requests
          xhr.withCredentials = false;
        }
      });
      
      // Add timestamp to prevent caching
      const urlWithTimestamp = `${src}?_t=${Date.now()}`;
      
      // Set up error handling
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (!silent && data && Object.keys(data).length > 0) {
          console.warn('HLS player error:', data.type, data.details);
        }
        // Retry on manifest load error
        if (data && data.type === Hls.ErrorTypes.NETWORK_ERROR && data.details === 'manifestLoadError') {
          console.log('Manifest not ready, retrying...');
          setTimeout(() => {
            hls.startLoad();
          }, 500);
          return;
        }
        
        if (data && data.fatal) {
          switch(data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Fatal network error encountered, trying to recover...');
              setTimeout(() => { 
                hls.loadSource(urlWithTimestamp); 
                hls.startLoad(); 
              }, 500);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error encountered, trying to recover...');
              setTimeout(() => { 
                hls.recoverMediaError(); 
              }, 500);
              break;
            default:
              console.error('Fatal error, cannot recover');
              setError('Stream playback error. Try refreshing the page.');
              break;
          }
        }
      });
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setError(null);
        
        if (videoRef.current) {
          // Configure video for low latency
          videoRef.current.muted = true;
          videoRef.current.autoplay = true;
          videoRef.current.playsInline = true;
          
          // Play faster to reduce latency
          videoRef.current.playbackRate = 1.1;
          
          // Handle play interruption errors
          const safePlay = () => {
            if (!videoRef.current) return;
            
            videoRef.current.play()
              .catch(e => {
                if (e.name === 'AbortError') {
                  // Play was interrupted, try again after a short delay
                  setTimeout(safePlay, 100);
                } else {
                  console.error('Autoplay failed:', e);
                }
              });
          };
          
          // Start playback safely
          safePlay();
          
          // Seek to live edge periodically
          const seekToLiveEdge = () => {
            if (hls.liveSyncPosition && videoRef.current) {
              videoRef.current.currentTime = hls.liveSyncPosition;
            }
          };
          
          const liveEdgeInterval = setInterval(seekToLiveEdge, 1000);
          liveEdgeIntervalRef.current = liveEdgeInterval;
        }
        
        updateActivity();
      });
      
      hls.loadSource(urlWithTimestamp);
      hls.attachMedia(videoRef.current);
      hlsRef.current = hls;
      setupCompleteRef.current = true;
      
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = `${src}?_t=${Date.now()}`;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current?.play().catch(e => { 
          console.error('Autoplay failed:', e); 
        });
        updateActivity();
      });
      setupCompleteRef.current = true;
    }
  }, [src, silent, updateActivity]);

  // Add this at the component level, outside the setupHls function
  const liveEdgeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle HLS video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // If we're stabilizing playback and already have an HLS instance with the same source, don't recreate
    if (stabilizePlayback && hlsRef.current && setupCompleteRef.current) {
      console.log("Stabilizing playback: reusing existing HLS instance");
      return;
    }

    setupHls();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [src, setupHls, stabilizePlayback]);

  // Handle alerts and bounding box display
  useEffect(() => {
    if (alerts.length > 0) {
      // The bounding_box property is no longer part of the Alert interface,
      // so we'll just show the alert if it exists.
      // The bounding box display logic is removed as per the edit hint.
    }
  }, [alerts]);

  // Listen for custom alert events
  useEffect(() => {
    const handleAlert = (event: Event) => {
      const alert = (event as CustomEvent<Alert>).detail;
      // The bounding_box property is no longer part of the Alert interface,
      // so we'll just show the alert if it exists.
      // The bounding box display logic is removed as per the edit hint.
    };

    window.addEventListener("sentinelai:alert", handleAlert);

    return () => {
      window.removeEventListener("sentinelai:alert", handleAlert);
    };
  }, []);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (liveEdgeIntervalRef.current) {
        clearInterval(liveEdgeIntervalRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-black rounded-2xl shadow-md w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-12 h-12 animate-spin text-gray-400"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
            <div className="text-gray-400 text-sm">
              {error ? error : "Connecting to stream..."}
            </div>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className={cn("w-full h-full", className)}
        muted={muted}
        playsInline
        autoPlay={autoPlay}
        controls={controls}
        aria-label="Live video stream"
        preload="auto"
      />

      <AnimatePresence>
        {/* The bounding box display logic is removed as per the edit hint. */}
      </AnimatePresence>
    </div>
  );
} 