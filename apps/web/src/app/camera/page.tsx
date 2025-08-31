"use client";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { useCameraStore } from "../../store/camera-store";
import Link from "next/link";

type Session = { camera_id: string; publish_url: string; hls_url: string };

export default function ConnectCamera() {
  const [session, setSession] = useState<Session | null>(null);
  const [rtsp, setRtsp] = useState("");
  const [cmd, setCmd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const vidRef = useRef<HTMLVideoElement>(null);
  
  const { setSession: setStoreSession, setIsConnected, setIsStreaming } = useCameraStore();

  // Fallback to localhost if environment variable not set
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:10000";

  async function createSession() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/bridge/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ camera_label: "My Camera" })
      });
      
      if (!res.ok) {
        throw new Error(`Failed to create session: ${res.status} ${res.statusText}`);
      }
      
      const js = await res.json();
      setSession(js);
      
      // Update store
      setStoreSession(js);
      setIsConnected(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      console.error("Session creation error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session || !vidRef.current) return;
    const url = session.hls_url;
    
    // Only try to play if we have a valid HLS URL (not placeholder)
    if (url.includes("STREAM_DOMAIN")) {
      return; // Don't try to play placeholder URLs
    }
    
    if (Hls.isSupported()) {
      const h = new Hls({ 
        liveDurationInfinity: true,
        enableWorker: true,
        lowLatencyMode: true
      });
      
      h.loadSource(url);
      h.attachMedia(vidRef.current);
      
      h.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest loaded");
        setIsStreaming(true);
      });
      
      h.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        setIsStreaming(false);
      });
      
      return () => h.destroy();
    } else if (vidRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      vidRef.current.src = url; // Safari
      setIsStreaming(true);
    }
  }, [session, setIsStreaming]);

  useEffect(() => {
    if (!session) return setCmd("");
    if (!rtsp) return setCmd("Enter your RTSP above to get the Bridge command.");
    setCmd(`python apps/bridge/bridge.py "${rtsp}" "${session.publish_url}"`);
  }, [rtsp, session]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* Navigation Bar */}
      <nav className="flex gap-4 mb-6">
        <Link 
          href="/dashboard"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Dashboard
        </Link>
        <Link 
          href="/camera"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Connect Camera
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Connect Camera via Bridge</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Camera Setup */}
        <div className="space-y-6">
          {/* RTSP Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              RTSP URL
            </label>
            <input
              type="text"
              value={rtsp}
              onChange={(e) => setRtsp(e.target.value)}
              placeholder="rtsp://username:password@ip:port/path"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 mt-1">
              Example: rtsp://admin:password@192.168.1.100:554/stream1
            </p>
          </div>

          {/* Create Session Button */}
          <button
            onClick={createSession}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Session..." : "Create Streaming Session"}
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Bridge Command */}
          {cmd && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Bridge Command
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cmd}
                  readOnly
                  className="flex-1 p-3 bg-gray-100 border border-gray-300 rounded-md font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(cmd)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Run this command on your local machine to connect your camera
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Video Preview */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Stream Preview</h3>
          
          {session ? (
            <div className="space-y-4">
              <video
                ref={vidRef}
                controls
                className="w-full rounded-lg border"
                style={{ maxHeight: '400px' }}
              />
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Session Info</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Camera ID:</strong> {session.camera_id}</div>
                  <div><strong>Publish URL:</strong> <code className="bg-white px-2 py-1 rounded">{session.publish_url}</code></div>
                  <div><strong>HLS URL:</strong> <code className="bg-white px-2 py-1 rounded">{session.hls_url}</code></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-500">
              <p>Create a session to see the stream preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 