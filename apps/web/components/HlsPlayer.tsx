'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

type Props = { src: string };

export default function HlsPlayer({ src }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;

    // Safari can play HLS natively
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.play().catch(() => {});
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        // Optional: surface errors somewhere
        console.log('HLS error', data);
      });
      return () => hls.destroy();
    }
  }, [src]);

  return (
    <video
      ref={ref}
      controls
      playsInline
      muted
      style={{ width: '100%', maxHeight: '80vh', background: '#000' }}
    />
  );
}
