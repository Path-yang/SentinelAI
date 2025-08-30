# SentinelAI — Cloud Bridge (new main)

We are migrating from a localhost prototype to a cloud-ready design:

- **Sentinel Bridge (LAN agent)**: ONVIF → RTSP pull, publishes to cloud RTSP (auth token), auto-reconnect.
- **MediaMTX (cloud)**: accepts RTSP PUBLISH; serves **HLS** (/hls/cam-<id>/index.m3u8). (Optional **WHIP/WHEP** WebRTC).
- **Backend (FastAPI)**: REST `POST/GET /events`, **WebSocket** `/ws/alerts`, MQTT alarm trigger.
- **Frontend (Next.js 15)**: HLS.js player + real-time toasts; PWA.
- **Hardware**: ESP32 siren/strobe via HTTP/MQTT; Pi Zero voice detector posting `/events`.

Legacy localhost code is preserved in branch **legacy-local** (tag: `v0-local-snapshot`). 