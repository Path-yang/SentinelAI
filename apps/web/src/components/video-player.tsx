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
        // Ultra-low latency HLS configuration
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          liveSyncDuration: 1, // Target live sync duration in seconds
          liveMaxLatencyDuration: 2, // Maximum acceptable latency
          liveDurationInfinity: true, // Consider live playlist as endless
          startLevel: -1, // Auto-select starting level based on bandwidth
          maxBufferLength: 2, // Max buffer length in seconds
          maxBufferSize: 2 * 1000 * 1000, // Max buffer size (2MB)
          maxBufferHole: 0.1, // Maximum buffer holes tolerated in seconds
          maxStarvationDelay: 1, // Maximum starvation delay in seconds
          maxLoadingDelay: 1, // Maximum loading delay in seconds
          backBufferLength: 0, // Don't keep any back buffer
          initialLiveManifestSize: 1, // Start playback after receiving 1 segment
          manifestLoadingTimeOut: 5000, // Manifest loading timeout (ms)
          manifestLoadingMaxRetry: 4, // Maximum manifest loading retries
          startFragPrefetch: true, // Start prefetching fragments
          appendErrorMaxRetry: 3, // Maximum append error retries
          testBandwidth: true, // Test bandwidth before loading
          progressive: false, // Don't use progressive download
          debug: false // Disable debug logs
        });

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log("HLS: Media attached");
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS: Manifest parsed");
          setIsLoading(false);
          if (autoPlay) {
            // Set video properties for low latency
            video.preload = "auto";
            video.muted = muted; // Muted videos start faster
            
            // Reduce latency by setting playback rate slightly faster
            // when buffer is healthy, to catch up with live edge
            const handleWaiting = () => {
              video.playbackRate = 1.0; // Normal speed when buffering
            };
            
            const handlePlaying = () => {
              // Slightly faster to catch up with live edge when playing smoothly
              video.playbackRate = 1.02;
            };
            
            video.addEventListener('waiting', handleWaiting);
            video.addEventListener('playing', handlePlaying);
            
            video.play().catch((e) => console.error("Error playing video:", e));
            
            // Clean up event listeners
            return () => {
              video.removeEventListener('waiting', handleWaiting);
              video.removeEventListener('playing', handlePlaying);
            };
          }
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
                }, 500);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                if (!silent) {
                  console.error("HLS: Fatal media error", data);
                  setError("Media error. Trying to recover...");
                }
                // More aggressive media error recovery
                setTimeout(() => {
                  hls?.recoverMediaError();
                }, 250);
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
                }, 1000);
                break;
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
            data.details.targetduration = Math.min(data.details.targetduration, 1);
          }
        });

        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari
        video.src = src;
        video.preload = "auto";
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          if (autoPlay) {
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
        preload="auto" // Changed from metadata to auto for faster loading
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