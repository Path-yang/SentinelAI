"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, Maximize2, Copy, RefreshCw } from 'lucide-react';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LatencyBadge } from '@/components/ui/latency-badge';
import { canUseNativeHls, initHlsInstance, retryWithDelay } from '@/lib/hlsSupport';
import { useToast } from '@/components/ui/use-toast';

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  posterUrl?: string;
  fullWidth?: boolean;
  className?: string;
  showLatencyBadge?: boolean;
  showCopyButton?: boolean;
}

export function VideoPlayer({ 
  src, 
  autoPlay = true, 
  muted = true, 
  controls = true, 
  posterUrl,
  fullWidth = false, 
  className = '',
  showLatencyBadge = true,
  showCopyButton = true
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const maxRetries = 3;

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  }, []);

  const handleReady = useCallback(() => {
    setIsReady(true);
    setLoading(false);
    setError(null);
    setRetryCount(0);
  }, []);

  const copyHlsUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(src);
      toast({
        title: "HLS URL copied",
        description: "The stream URL has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy URL to clipboard.",
        variant: "destructive",
      });
    }
  }, [src, toast]);

  const retry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      handleError('Stream unavailable. Check HLS URL or network.');
      return;
    }

    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);

    try {
      await retryWithDelay(() => {
        if (!videoRef.current) return;
        
        // Clean up existing HLS instance
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        // Reset video element
        videoRef.current.src = '';
        videoRef.current.load();

        // Initialize new HLS instance
        if (canUseNativeHls(videoRef.current)) {
          videoRef.current.src = src;
          videoRef.current.addEventListener('loadedmetadata', handleReady, { once: true });
          videoRef.current.addEventListener('error', () => handleError('Failed to load video'), { once: true });
        } else {
          hlsRef.current = initHlsInstance(src, videoRef.current, handleError, handleReady);
        }
      }, 1, 1000 * retryCount);
    } catch (err) {
      handleError('Failed to retry connection');
    }
  }, [retryCount, maxRetries, src, handleError, handleReady]);

  useEffect(() => {
    if (!src) {
      handleError('No video source provided');
      return;
    }

    if (!videoRef.current) return;

    setLoading(true);
    setError(null);
    setIsReady(false);

    if (canUseNativeHls(videoRef.current)) {
      // Use native HLS support (Safari, iOS)
      videoRef.current.src = src;
      videoRef.current.addEventListener('loadedmetadata', handleReady, { once: true });
      videoRef.current.addEventListener('error', () => handleError('Failed to load video'), { once: true });
    } else {
      // Use hls.js for other browsers
      hlsRef.current = initHlsInstance(src, videoRef.current, handleError, handleReady);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, handleError, handleReady]);

  const handleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
    }
  }, []);

  if (!src) {
    return (
      <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-md ${fullWidth ? 'w-full' : 'w-full md:w-2/3'} ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Alert className="max-w-md">
            <AlertDescription>
              No video source provided. Please set the NEXT_PUBLIC_HLS_URL environment variable.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-black rounded-2xl shadow-md ${fullWidth ? 'w-full' : 'w-full md:w-2/3'} ${className}`}>
      {/* Loading skeleton */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-pulse">
              <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
            </div>
            <div className="text-gray-400 text-sm">Connecting to stream...</div>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90">
          <div className="text-center p-6 max-w-md">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={retry} 
              disabled={retryCount >= maxRetries}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryCount >= maxRetries ? 'Max retries reached' : `Retry (${retryCount}/${maxRetries})`}
            </Button>
          </div>
        </div>
      )}
      
      {/* Video element */}
      <video 
        ref={videoRef}
        className="w-full h-full" 
        muted={muted}
        playsInline
        autoPlay={autoPlay}
        controls={controls}
        poster={posterUrl}
        onLoadedData={() => setLoading(false)}
        onError={() => handleError('Failed to load video')}
        aria-label="Live video stream"
        // Low-latency optimizations
        preload="metadata"
        disablePictureInPicture={false}
        disableRemotePlayback={false}
      />
      
      {/* Latency badge */}
      {showLatencyBadge && isReady && (
        <LatencyBadge />
      )}
      
      {/* Fullscreen button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={handleFullscreen}
        className="absolute top-3 right-3 z-10 bg-black/70 text-white border-0 hover:bg-black/80"
        aria-label="Toggle fullscreen"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
      
      {/* Copy URL button */}
      {showCopyButton && (
        <Button
          variant="secondary"
          size="icon"
          onClick={copyHlsUrl}
          className="absolute top-3 right-12 z-10 bg-black/70 text-white border-0 hover:bg-black/80"
          aria-label="Copy HLS URL"
        >
          <Copy className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
} 