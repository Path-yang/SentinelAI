"use client";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { useCameraStore } from "@/store/camera-store";

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
      <h1 className="text-2xl font-bold mb-6">Connect Camera via Bridge</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      
      {!session ? (
        <div className="space-y-4">
          <button
            onClick={createSession}
            disabled={loading}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Creating..." : "Create Cloud Stream"}
          </button>
          
          {loading && (
            <p className="text-sm text-gray-600">Generating unique camera session...</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-medium text-green-800 mb-2">Session Created Successfully!</h3>
            <p className="text-sm text-green-700">Camera ID: <code className="bg-green-100 px-2 py-1 rounded">{session.camera_id}</code></p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              RTSP URL from your camera (LAN):
            </label>
            <input
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="rtsp://user:pass@192.168.x.x:554/Streaming/Channels/101"
              value={rtsp}
              onChange={(e) => setRtsp(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Enter the RTSP URL from your camera to get the bridge command</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-1">Publish URL:</p>
              <code className="text-xs break-all bg-white p-2 rounded border block">
                {session.publish_url}
              </code>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-1">HLS URL:</p>
              <code className="text-xs break-all bg-white p-2 rounded border block">
                {session.hls_url}
              </code>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Run this command on your LAN device:</p>
            <div className="relative">
              <code className="block bg-gray-100 p-3 rounded text-sm break-all">
                {cmd}
              </code>
              <button
                onClick={() => copyToClipboard(cmd)}
                className="absolute top-2 right-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>
          
          {!session.hls_url.includes("STREAM_DOMAIN") && (
            <div>
              <p className="text-sm font-medium mb-2">Live Stream Preview:</p>
              <video
                ref={vidRef}
                controls
                className="w-full max-w-2xl border rounded bg-gray-100"
                poster="/images/video-placeholder.png"
              />
            </div>
          )}
          
          {session.hls_url.includes("STREAM_DOMAIN") && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a development session. For production, replace STREAM_DOMAIN with your actual domain.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 