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
  const [currentBoundingBox, setCurrentBoundingBox] = useState<BoundingBox | null>(null);
  const [showBoundingBox, setShowBoundingBox] = useState(false);
  const { currentAlert } = useAlertsStore();
  
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

  // Update HLS.js configuration for better compatibility
  const setupHls = useCallback(() => {
    if (!videoRef.current || !src || setupCompleteRef.current) return;
    
    if (Hls.isSupported()) {
      // Clean up previous instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      
      // More compatible HLS configuration
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false, // Disable low latency mode for better compatibility
        startLevel: 0,
        maxBufferLength: 10,
        maxBufferSize: 10 * 1000 * 1000,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 6,
        manifestLoadingRetryDelay: 1000,
        appendErrorMaxRetry: 5,
        debug: false
      });
      
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      
      // Handle errors
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (!silent) {
          console.error('HLS error:', data);
        }
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              try {
                console.log('HLS network error - trying to recover');
                hls.startLoad();
              } catch (e) {
                console.error('Recovery failed:', e);
                setupHls(); // Try complete reset
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              try {
                console.log('HLS media error - trying to recover');
                hls.recoverMediaError();
              } catch (e) {
                console.error('Recovery failed:', e);
                setupHls(); // Try complete reset
              }
              break;
            default:
              console.error('Fatal HLS error, trying to recreate instance');
              setupHls();
              break;
          }
        }
      });
      
      // Handle successful loading
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (videoRef.current) {
          videoRef.current.play().catch(e => {
            console.error('Autoplay failed:', e);
          });
        }
        updateActivity();
      });
      
      hlsRef.current = hls;
      setupCompleteRef.current = true;
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari
      videoRef.current.src = src;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current?.play().catch(e => {
          console.error('Autoplay failed:', e);
        });
        updateActivity();
      });
      setupCompleteRef.current = true;
    }
  }, [src, silent, updateActivity]);

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
    if (currentAlert?.bounding_box) {
      setCurrentBoundingBox(currentAlert.bounding_box);
      setShowBoundingBox(true);

      // Hide bounding box after 5 seconds
      const timer = setTimeout(() => {
        setShowBoundingBox(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentAlert]);

  // Listen for custom alert events
  useEffect(() => {
    const handleAlert = (event: Event) => {
      const alert = (event as CustomEvent<Alert>).detail;
      if (alert.bounding_box) {
        setCurrentBoundingBox(alert.bounding_box);
        setShowBoundingBox(true);

        // Hide bounding box after 5 seconds
        setTimeout(() => {
          setShowBoundingBox(false);
        }, 5000);
      }
    };

    window.addEventListener("sentinelai:alert", handleAlert);

    return () => {
      window.removeEventListener("sentinelai:alert", handleAlert);
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
        {showBoundingBox && currentBoundingBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="anomaly-box animate-pulse-border absolute"
            style={{
              left: `${currentBoundingBox.x * 100}%`,
              top: `${currentBoundingBox.y * 100}%`,
              width: `${currentBoundingBox.width * 100}%`,
              height: `${currentBoundingBox.height * 100}%`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 