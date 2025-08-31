'use client';

import { useState } from 'react';

type Resp = {
  cameraId: string;
  publishUrl: string;
  playbackUrl: string;
  commands: { ffmpeg: string; docker: string };
};

export default function Page() {
  const [form, setForm] = useState({ username: '', password: '', ip: '', port: '554', path: 'stream1' });
  const [resp, setResp] = useState<Resp | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch('/api/streams', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const j = (await r.json()) as Resp;
      setResp(j);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Connect your camera</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Enter your camera RTSP details. We’ll generate a one-liner you (or your user) runs on a machine
        that can reach the camera. That publishes to the cloud, and you can watch instantly on the website.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input placeholder="Username (optional)" value={form.username} onChange={e => setForm(s => ({ ...s, username: e.target.value }))} />
          <input placeholder="Password (optional)" value={form.password} onChange={e => setForm(s => ({ ...s, password: e.target.value }))} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 12 }}>
          <input required placeholder="Camera IP (e.g., 192.168.1.116)" value={form.ip} onChange={e => setForm(s => ({ ...s, ip: e.target.value }))} />
          <input required placeholder="Port" value={form.port} onChange={e => setForm(s => ({ ...s, port: e.target.value }))} />
          <input required placeholder="Path (e.g., stream1)" value={form.path} onChange={e => setForm(s => ({ ...s, path: e.target.value }))} />
        </div>
        <button disabled={busy} style={{ padding: '10px 16px', fontWeight: 600 }}>
          {busy ? 'Creating…' : 'Create Cloud Stream'}
        </button>
      </form>

      {resp && (
        <section style={{ display: 'grid', gap: 16 }}>
          <div>
            <h2>Watch link</h2>
            <p>
              <a href={`/watch/${resp.cameraId}`} target="_blank">Open player</a> &nbsp;•&nbsp;
              HLS: <code>{resp.playbackUrl}</code>
            </p>
          </div>

          <div>
            <h2>Publish command (user runs this near their camera)</h2>
            <p style={{ color: '#666' }}>Option A — plain ffmpeg:</p>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#0f0', padding: 12, borderRadius: 6 }}>{resp.commands.ffmpeg}</pre>
            <p style={{ color: '#666' }}>Option B — Docker (no local ffmpeg needed):</p>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#0f0', padding: 12, borderRadius: 6 }}>{resp.commands.docker}</pre>
          </div>

          <div style={{ color: '#888', fontSize: 14 }}>
            <strong>How it works:</strong> a tiny “bridge” command pulls RTSP from the camera and publishes to your
            cloud ingest. Your website then plays the HLS URL above. The bridge can run on a laptop, mini-PC, NAS, or a
            small always-on box on the same LAN as the camera.
          </div>
        </section>
      )}
    </main>
  );
}
