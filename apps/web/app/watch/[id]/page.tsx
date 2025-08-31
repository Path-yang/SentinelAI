'use client';

import { useMemo } from 'react';
import HlsPlayer from '@/components/HlsPlayer';

export default function Watch({ params }: { params: { id: string } }) {
  const origin = process.env.NEXT_PUBLIC_STREAM_ORIGIN || 'http://54.206.49.163';
  const src = useMemo(() => `${origin}/hls/${params.id}/index.m3u8`, [origin, params.id]);

  return (
    <main style={{ maxWidth: 1100, margin: '40px auto', padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Live: {params.id}</h1>
      <HlsPlayer src={src} />
      <p style={{ color: '#666', marginTop: 12 }}>If video is black, ensure the publish command is running and the camera is reachable.</p>
    </main>
  );
}
