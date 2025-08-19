"use client";

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  fullWidth?: boolean;
  className?: string;
}

export function VideoPlayer({ src, fullWidth = false, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let hls: Hls | null = null;
    
    const initPlayer = () => {
      setLoading(true);
      setError(null);
      
      if (!videoRef.current) return;
      
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.warn('Auto-play was prevented:', err);
            });
          }
        });
        
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError('Network error, trying to recover...');
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError('Media error, trying to recover...');
                hls?.recoverMediaError();
                break;
              default:
                setError('Fatal error: unable to load video');
                hls?.destroy();
                break;
            }
          }
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // For Safari which has built-in HLS support
        videoRef.current.src = src;
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current?.play().catch(err => {
            console.warn('Auto-play was prevented:', err);
          });
        });
      } else {
        setError('HLS is not supported by your browser');
      }
    };

    initPlayer();
    
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-black rounded-lg ${fullWidth ? 'w-full' : 'w-full md:w-2/3'} ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white">
          <div className="text-center p-4">
            <p className="text-red-400 font-medium">{error}</p>
            <p className="text-sm mt-2">Please check your connection or try again later.</p>
          </div>
        </div>
      )}
      
      <video 
        ref={videoRef}
        className="w-full h-full" 
        muted
        playsInline
        autoPlay
        onLoadedData={() => setLoading(false)}
        onError={() => setError('Failed to load video')}
      />
    </div>
  );
} 