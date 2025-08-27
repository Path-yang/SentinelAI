"use client";

import { useEffect, useRef, useState } from "react";
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
  silent?: boolean; // Add silent mode option
}

export function VideoPlayer({
  src,
  className,
  autoPlay = true,
  muted = true,
  controls = true,
  silent = false, // Default to false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBoundingBox, setCurrentBoundingBox] = useState<BoundingBox | null>(null);
  const [showBoundingBox, setShowBoundingBox] = useState(false);
  const { currentAlert } = useAlertsStore();

  // Handle HLS video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    const setupHls = () => {
      if (Hls.isSupported()) {
        // Extreme low-latency HLS configuration
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          
          // Minimal buffer configuration
          liveSyncDuration: 0.5, // Target live sync duration in seconds
          liveMaxLatencyDuration: 1, // Maximum acceptable latency
          liveDurationInfinity: true, // Consider live playlist as endless
          
          // Level selection
          startLevel: 0, // Start with lowest quality level for speed
          capLevelToPlayerSize: true, // Adjust quality to player size
          
          // Buffer settings
          maxBufferLength: 1, // Max buffer length in seconds
          maxBufferSize: 1 * 1000 * 1000, // Max buffer size (1MB)
          maxBufferHole: 0.05, // Maximum buffer holes tolerated in seconds
          highBufferWatchdogPeriod: 1, // High buffer watchdog period
          
          // Latency optimization
          maxStarvationDelay: 0.2, // Maximum starvation delay in seconds
          maxLoadingDelay: 0.2, // Maximum loading delay in seconds
          backBufferLength: 0, // Don't keep any back buffer
          
          // Segment loading
          initialLiveManifestSize: 1, // Start playback after receiving 1 segment
          manifestLoadingTimeOut: 2000, // Manifest loading timeout (ms)
          manifestLoadingMaxRetry: 6, // Maximum manifest loading retries
          manifestLoadingRetryDelay: 500, // Manifest loading retry delay (ms)
          startFragPrefetch: true, // Start prefetching fragments
          
          // Error handling
          appendErrorMaxRetry: 5, // Maximum append error retries
          
          // Performance
          testBandwidth: false, // Skip bandwidth test for faster startup
          progressive: false, // Don't use progressive download
          
          // Disable features not needed for low latency
          enableCEA708Captions: false,
          enableWebVTT: false,
          enableIMSC1: false,
          enableDateRangeMetadataCues: false,
          
          debug: false // Disable debug logs
        });

        // Force playlist reload every 500ms for live streams
        const playlistRefreshInterval = setInterval(() => {
          if (hls && hls.levels && hls.levels.length > 0 && hls.currentLevel >= 0) {
            hls.loadLevel(hls.currentLevel);
          }
        }, 500);

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log("HLS: Media attached");
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS: Manifest parsed");
          setIsLoading(false);
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
            };
            
            const handlePlaying = () => {
              // Faster to catch up with live edge when playing smoothly
              video.playbackRate = 1.05;
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
                }
              }
            };
            
            // Periodically seek to live edge
            const liveEdgeInterval = setInterval(seekToLiveEdge, 2000);
            
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

        // Error handling with recovery
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (!silent) {
                  console.error("HLS: Fatal network error", data);
                  setError("Network error. Trying to recover...");
                }
                // More aggressive recovery for network errors
                setTimeout(() => {
                  hls?.startLoad();
                }, 250); // Reduced timeout
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                if (!silent) {
                  console.error("HLS: Fatal media error", data);
                  setError("Media error. Trying to recover...");
                }
                // More aggressive media error recovery
                setTimeout(() => {
                  hls?.recoverMediaError();
                }, 100); // Reduced timeout
                break;
              default:
                if (!silent) {
                  console.error("HLS: Fatal error", data);
                  setError("Could not load video stream");
                }
                // Try to recreate the HLS instance
                setTimeout(() => {
                  if (hls) {
                    hls.destroy();
                    setupHls();
                  }
                }, 500); // Reduced timeout
                break;
            }
          } else {
            // For non-fatal errors, try to recover immediately
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls?.recoverMediaError();
            } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls?.startLoad();
            }
          }
        });

        // Add level switching event handler to always use lowest latency level
        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          console.log(`HLS: Switched to level ${data.level}`);
        });
        
        // Force reload of the playlist more frequently
        hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
          if (data.details.live) {
            // For live streams, reduce the reload interval
            data.details.targetduration = Math.min(data.details.targetduration, 0.5);
            
            // Force seeking to live edge when level is loaded
            if (video && !video.paused && hls.liveSyncPosition) {
              video.currentTime = hls.liveSyncPosition;
            }
          }
        });
        
        // Use low latency mode if available
        hls.on(Hls.Events.FRAG_LOADED, (_, data) => {
          if (data.frag.type === 'main') {
            console.log(`HLS: Fragment loaded - duration: ${data.frag.duration}s`);
          }
        });

        // Add timestamp to URL to prevent caching
        const urlWithTimestamp = `${src}?_t=${Date.now()}`;
        hls.loadSource(urlWithTimestamp);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari
        // Add timestamp to URL to prevent caching
        const urlWithTimestamp = `${src}?_t=${Date.now()}`;
        video.src = urlWithTimestamp;
        video.preload = "auto";
        
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          if (autoPlay) {
            // Set video properties for low latency
            video.preload = "auto";
            video.muted = muted; // Muted videos start faster
            video.playbackRate = 1.05; // Play slightly faster to catch up
            
            video.play().catch((e) => console.error("Error playing video:", e));
          }
        });
      } else {
        setError("HLS is not supported in this browser");
      }
    };

    setupHls();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, autoPlay, silent, muted]);

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