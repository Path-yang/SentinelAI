"use client";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type Session = { camera_id: string; publish_url: string; hls_url: string };

export default function ConnectCamera() {
  const [session, setSession] = useState<Session | null>(null);
  const [rtsp, setRtsp] = useState("");
  const [cmd, setCmd] = useState("");
  const vidRef = useRef<HTMLVideoElement>(null);

  async function createSession() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bridge/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ camera_label: "My Camera" })
    });
    const js = await res.json();
    setSession(js);
  }

  useEffect(() => {
    if (!session || !vidRef.current) return;
    const url = session.hls_url;
    if (Hls.isSupported()) {
      const h = new Hls({ liveDurationInfinity: true });
      h.loadSource(url);
      h.attachMedia(vidRef.current);
      return () => h.destroy();
    } else {
      vidRef.current.src = url; // Safari
    }
  }, [session]);

  useEffect(() => {
    if (!session) return setCmd("");
    if (!rtsp) return setCmd("Enter your RTSP above to get the Bridge command.");
    setCmd(`python apps/bridge/bridge.py "${rtsp}" "${session.publish_url}"`);
  }, [rtsp, session]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Connect Camera via Bridge</h1>
      {!session ? (
        <button className="px-4 py-2 rounded bg-black text-white" onClick={createSession}>
          Create Cloud Stream
        </button>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm">RTSP URL from your camera (LAN):</label>
          <input
            className="w-full border rounded p-2"
            placeholder='rtsp://user:pass@192.168.x.x:554/Streaming/Channels/101'
            value={rtsp}
            onChange={(e) => setRtsp(e.target.value)}
          />
          <div className="text-sm">Publish URL: <code>{session.publish_url}</code></div>
          <div className="text-sm">HLS URL: <code>{session.hls_url}</code></div>
          <label className="block text-sm mt-2">Run on your LAN device:</label>
          <pre className="bg-neutral-100 p-3 rounded text-xs overflow-x-auto">{cmd}</pre>
        </div>
      )}
      <video ref={vidRef} autoPlay controls muted className="w-full rounded-lg" />
    </div>
  );
} 