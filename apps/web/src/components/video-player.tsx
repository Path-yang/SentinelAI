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
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log("HLS: Media attached");
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS: Manifest parsed");
          setIsLoading(false);
          if (autoPlay) {
            video.play().catch((e) => console.error("Error playing video:", e));
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // Only show errors if not in silent mode
                if (!silent) {
                  console.error("HLS: Fatal network error", data);
                  setError("Network error. Trying to recover...");
                }
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                // Only show errors if not in silent mode
                if (!silent) {
                  console.error("HLS: Fatal media error", data);
                  setError("Media error. Trying to recover...");
                }
                hls?.recoverMediaError();
                break;
              default:
                // Only show errors if not in silent mode
                if (!silent) {
                  console.error("HLS: Fatal error", data);
                  setError("Could not load video stream");
                }
                hls?.destroy();
                break;
            }
          }
        });

        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari
        video.src = src;
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
  }, [src, autoPlay, silent]); // Add silent to dependencies

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
        preload="metadata"
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