"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { useAlertsStore, Alert, BoundingBox } from "@/store/alerts-store";
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
  const setupHls = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    console.log("Setting up HLS instance...");
    
    // Clean up existing instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    if (Hls.isSupported()) {
      // Extreme low-latency HLS configuration
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        
        // Minimal buffer configuration
        liveSyncDuration: 0.5,
        liveMaxLatencyDuration: 1,
        liveDurationInfinity: true,
        
        // Level selection
        startLevel: 0,
        capLevelToPlayerSize: true,
        
        // Buffer settings
        maxBufferLength: 1,
        maxBufferSize: 1 * 1000 * 1000,
        maxBufferHole: 0.05,
        highBufferWatchdogPeriod: 1,
        
        // Latency optimization
        maxStarvationDelay: 0.2,
        maxLoadingDelay: 0.2,
        backBufferLength: 0,
        
        // Segment loading
        initialLiveManifestSize: 1,
        manifestLoadingTimeOut: 2000,
        manifestLoadingMaxRetry: 6,
        manifestLoadingRetryDelay: 500,
        startFragPrefetch: true,
        
        // Error handling
        appendErrorMaxRetry: 5,
        
        // Performance
        testBandwidth: false,
        progressive: false,
        
        // Disable features not needed for low latency
        enableCEA708Captions: false,
        enableWebVTT: false,
        enableIMSC1: false,
        enableDateRangeMetadataCues: false,
        
        debug: false
      });
      
      // Update activity timestamp on any HLS event
      const updateActivity = () => {
        lastActivityRef.current = Date.now();
      };
      
      hls.on(Hls.Events.FRAG_LOADING, updateActivity);
      hls.on(Hls.Events.FRAG_LOADED, updateActivity);
      hls.on(Hls.Events.LEVEL_LOADED, updateActivity);

      // Force playlist reload periodically - using startLoad/stopLoad instead of loadLevel
      let lastRefreshTime = Date.now();
      const refreshInterval = stabilizePlayback ? 2000 : 500;
      
      const playlistRefreshInterval = setInterval(() => {
        if (hls && video && !video.paused) {
          const now = Date.now();
          
          // Only refresh if enough time has passed
          if (now - lastRefreshTime >= refreshInterval) {
            try {
              // Simple refresh by stopping and restarting load
              hls.stopLoad();
              hls.startLoad();
              lastRefreshTime = now;
            } catch (e) {
              console.error("Error refreshing playlist:", e);
            }
          }
        }
      }, refreshInterval);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("HLS: Media attached");
        updateActivity();
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS: Manifest parsed");
        setIsLoading(false);
        setupCompleteRef.current = true;
        updateActivity();
        
        if (autoPlay) {
          // Set video properties for extreme low latency
          video.preload = "auto";
          video.muted = muted; // Muted videos start faster
          
          // Disable all default browser buffering
          video.autoplay = true;
          video.playsInline = true;
          
          // Reduce latency by setting playback rate slightly faster
          // when buffer is healthy, to catch up with live edge
          const handleWaiting = () => {
            video.playbackRate = 1.0; // Normal speed when buffering
            updateActivity(); // Update activity on waiting
          };
          
          const handlePlaying = () => {
            // Faster to catch up with live edge when playing smoothly
            // Use a more conservative speed when stabilizing
            video.playbackRate = stabilizePlayback ? 1.02 : 1.05;
            updateActivity(); // Update activity on playing
          };
          
          // Add event listeners
          video.addEventListener('waiting', handleWaiting);
          video.addEventListener('playing', handlePlaying);
          
          // Force seeking to live edge
          const seekToLiveEdge = () => {
            if (hls && video && !video.paused) {
              const liveEdge = hls.liveSyncPosition;
              if (liveEdge && video.currentTime < liveEdge - 0.3) {
                console.log(`Seeking to live edge: ${liveEdge}`);
                video.currentTime = liveEdge;
                updateActivity(); // Update activity after seeking
              }
            }
          };
          
          // Periodically seek to live edge - less frequently when stabilizing
          const liveEdgeInterval = setInterval(seekToLiveEdge, stabilizePlayback ? 5000 : 2000);
          
          video.play().catch((e) => console.error("Error playing video:", e));
          
          // Clean up event listeners and intervals
          return () => {
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
            clearInterval(liveEdgeInterval);
            clearInterval(playlistRefreshInterval);
          };
        }
        
        return () => {
          clearInterval(playlistRefreshInterval);
        };
      });

      // Error handling with recovery - less aggressive when stabilizing
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (!silent) {
                console.error("HLS: Fatal network error", data);
                setError("Network error. Trying to recover...");
              }
              // More aggressive recovery for network errors - but with delay when stabilizing
              setTimeout(() => {
                try {
                  hls.startLoad();
                  updateActivity(); // Update activity after recovery
                } catch (e) {
                  console.error("Error during recovery:", e);
                  // If startLoad fails, try a complete reset
                  setupHls();
                }
              }, stabilizePlayback ? 1000 : 250);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              if (!silent) {
                console.error("HLS: Fatal media error", data);
                setError("Media error. Trying to recover...");
              }
              // More aggressive media error recovery - but with delay when stabilizing
              setTimeout(() => {
                try {
                  hls.recoverMediaError();
                  updateActivity(); // Update activity after recovery
                } catch (e) {
                  console.error("Error during media recovery:", e);
                  setupHls();
                }
              }, stabilizePlayback ? 500 : 100);
              break;
            default:
              if (!silent) {
                console.error("HLS: Fatal error", data);
                setError("Could not load video stream");
              }
              // Try to recreate the HLS instance - but with delay when stabilizing
              setTimeout(() => {
                setupHls();
              }, stabilizePlayback ? 2000 : 500);
              break;
          }
        } else if (!stabilizePlayback) {
          // For non-fatal errors, try to recover immediately - skip when stabilizing
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            try {
              hls.recoverMediaError();
              updateActivity();
            } catch (e) {
              console.error("Error during non-fatal media recovery:", e);
            }
          } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            try {
              hls.startLoad();
              updateActivity();
            } catch (e) {
              console.error("Error during non-fatal network recovery:", e);
            }
          }
        }
      });
      
      // Force reload of the playlist more frequently
      hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
        updateActivity(); // Update activity when level is loaded
        
        if (data.details.live) {
          // For live streams, reduce the reload interval - less aggressive when stabilizing
          data.details.targetduration = Math.min(data.details.targetduration, stabilizePlayback ? 1 : 0.5);
          
          // Force seeking to live edge when level is loaded - only if not stabilizing
          if (!stabilizePlayback && video && !video.paused && hls.liveSyncPosition) {
            video.currentTime = hls.liveSyncPosition;
          }
        }
      });
      
      // Use low latency mode if available
      hls.on(Hls.Events.FRAG_LOADED, (_, data) => {
        updateActivity(); // Update activity when fragment is loaded
        
        if (data.frag.type === 'main') {
          console.log(`HLS: Fragment loaded - duration: ${data.frag.duration}s`);
        }
      });

      // Add timestamp to URL to prevent caching
      const urlWithTimestamp = stabilizePlayback ? src : `${src}?_t=${Date.now()}`;
      hls.loadSource(urlWithTimestamp);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari
      // Add timestamp to URL to prevent caching
      const urlWithTimestamp = stabilizePlayback ? src : `${src}?_t=${Date.now()}`;
      video.src = urlWithTimestamp;
      video.preload = "auto";
      
      const updateActivity = () => {
        lastActivityRef.current = Date.now();
      };
      
      video.addEventListener('loadstart', updateActivity);
      video.addEventListener('progress', updateActivity);
      video.addEventListener('timeupdate', updateActivity);
      
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        setupCompleteRef.current = true;
        updateActivity();
        
        if (autoPlay) {
          // Set video properties for low latency
          video.preload = "auto";
          video.muted = muted; // Muted videos start faster
          video.playbackRate = stabilizePlayback ? 1.02 : 1.05; // Play slightly faster to catch up
          
          video.play().catch((e) => console.error("Error playing video:", e));
        }
      });
      
      // Clean up event listeners
      return () => {
        video.removeEventListener('loadstart', updateActivity);
        video.removeEventListener('progress', updateActivity);
        video.removeEventListener('timeupdate', updateActivity);
      };
    } else {
      setError("HLS is not supported in this browser");
    }
  }, [src, autoPlay, silent, muted, stabilizePlayback]);

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