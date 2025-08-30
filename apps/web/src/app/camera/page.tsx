"use client";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type Session = { camera_id: string; publish_url: string; hls_url: string };

export default function ConnectCamera() {
  const [session, setSession] = useState<Session | null>(null);
  const [rtsp, setRtsp] = useState("");
  const [cmd, setCmd] = useState("");
  const vidRef = useRef<HTMLVideoElement>(null);

  // Fallback to localhost if environment variable not set
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:10000";

  async function createSession() {
    const res = await fetch(`${apiBase}/bridge/session`, {
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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Connect Camera via Bridge</h1>
      
      {!session ? (
        <button
          onClick={createSession}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Cloud Stream
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              RTSP URL from your camera (LAN):
            </label>
            <input
              className="w-full border rounded p-2"
              placeholder="rtsp://user:pass@192.168.x.x:554/Streaming/Channels/101"
              value={rtsp}
              onChange={(e) => setRtsp(e.target.value)}
            />
          </div>
          
          <div>
            <p><strong>Publish URL:</strong> {session.publish_url}</p>
            <p><strong>HLS URL:</strong> {session.hls_url}</p>
          </div>
          
          <div>
            <p><strong>Run on your LAN device:</strong></p>
            <code className="block bg-gray-100 p-2 rounded">{cmd}</code>
          </div>
          
          <video
            ref={vidRef}
            controls
            className="w-full max-w-2xl border rounded"
          />
        </div>
      )}
    </div>
  );
} 