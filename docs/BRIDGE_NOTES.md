# Cloud Bridge Quickstart (MVP)

## Setup Steps:

1) **On your VPS, run MediaMTX** with `configs/mediamtx/mediamtx.yml` (HLS enabled). Put Nginx in front of `/hls` with HTTPS and CORS:
   ```nginx
   location /hls/ {
     root /var;
     types { application/vnd.apple.mpegurl m3u8; video/mp2t ts; }
     add_header Access-Control-Allow-Origin *;
     add_header Access-Control-Allow-Headers "origin,range,accept,referer,accept-encoding";
     add_header Cache-Control no-cache;
     expires -1;
   }
   ```
   Proxy `/api` and `/ws` to the backend (HTTPS/WSS).

2) **Backend**: `pnpm dev:backend` (on port 10000).

3) **Frontend**: set `NEXT_PUBLIC_API_BASE` and `NEXT_PUBLIC_WS_URL` as in `env.example`; `pnpm dev:web`.

4) **In `/camera`**, click "Create Cloud Stream", paste your RTSP, copy the Bridge command, and run it on a LAN device:
   ```bash
   ffmpeg -nostdin -rtsp_transport tcp -i "rtsp://user:pass@192.168.1.20:554/Streaming/Channels/101" -c:v copy -c:a aac -f rtsp rtsp://stream.yourdomain.com:8554/cam-XXXX
   ```

5) **The player renders HLS** at `https://stream.yourdomain.com/hls/cam-XXXX/index.m3u8`. Alerts still arrive via `/ws/alerts` when `POST /events` is called.

## Security TODO (next):
- Per-camera JWT/token via MediaMTX auth webhook
- HTTPS-only
- Optional WebRTC (WHIP/WHEP) for sub-second latency 