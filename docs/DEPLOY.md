# SentinelAI Cloud Bridge — Deployment (MVP)

## Prereqs
- **DNS**: STREAM_DOMAIN (e.g., stream.example.com) pointing to your VPS public IP.
- **Firewall**: open ports 80, 443, 8554.

## Bring up the stack
- `cd deploy`
- Edit Caddyfile: replace STREAM_DOMAIN with your real domain.
- `docker compose up -d`

## Test backend
- `GET https://STREAM_DOMAIN/api/events` → should return JSON list

## Create a camera session (from app or curl)
- `POST https://STREAM_DOMAIN/api/bridge/session` → returns:
  ```json
  { 
    "camera_id": "cam-XXXX", 
    "publish_url": "rtsp://STREAM_DOMAIN:8554/cam-XXXX", 
    "hls_url": "https://STREAM_DOMAIN/hls/cam-XXXX/index.m3u8" 
  }
  ```

## Run the Bridge on a LAN device
```bash
python apps/bridge/bridge.py "rtsp://user:pass@192.168.1.20:554/Streaming/Channels/101" "rtsp://STREAM_DOMAIN:8554/cam-XXXX"
```

## View on the website
- The app's `/camera` page plays hls_url via HLS.js.
- Trigger a test alert:
```bash
curl -X POST https://STREAM_DOMAIN/api/events \
  -H "content-type: application/json" \
  -d '{"camera_id":"cam-XXXX","type":"fall","confidence":0.93}'
```

## Vercel env (Production and Preview)
- `NEXT_PUBLIC_API_BASE = https://STREAM_DOMAIN/api`
- `NEXT_PUBLIC_WS_URL = wss://STREAM_DOMAIN/ws/alerts`

## Notes
- No port-forwarding required; Bridge publishes outbound to the cloud.
- Prefer H.264 on the camera so the Bridge can copy video without re-encoding.
- To reduce latency later, enable MediaMTX WHIP/WHEP (WebRTC) and add a WebRTC player. 