# SentinelAI - Cloud Bridge Architecture

Transform ordinary cameras into smart anomaly detectors using AI technology with a cloud-based streaming architecture.

## 🚀 **WORKING STATUS: Cloud Bridge MVP Complete!**

✅ **Backend**: FastAPI running on port 10000 with working `/bridge/session` API  
✅ **Frontend**: Next.js 15 with "Connect via Bridge" flow working  
✅ **Bridge**: Python FFmpeg wrapper ready for deployment  
✅ **Deployment**: Docker-compose + Caddy configuration ready  
✅ **Documentation**: Complete setup and deployment guides  

## 🏗️ Architecture Overview

SentinelAI now uses a **Cloud Bridge** architecture that separates the camera connection from the web interface:

```
[Local Camera] → [Sentinel Bridge (LAN)] → [Cloud MediaMTX] → [HLS Stream] → [Web Interface]
```

### Components:
- **Frontend**: Next.js 15 web application with real-time video streaming
- **Backend**: FastAPI server handling events and WebSocket alerts
- **Bridge**: Python script that pulls RTSP from local cameras and publishes to cloud
- **MediaMTX**: Cloud streaming server for RTSP ingest and HLS serving

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <your-repo>
cd SentinelAI
pnpm install
```

### 2. Start Backend (with Python virtual environment)
```bash
cd apps/backend
python3 -m venv venv
source venv/bin/activate
pip install "fastapi" "pydantic" "uvicorn[standard]" --no-build-isolation
cd ../..
pnpm dev:backend
```

### 3. Start Frontend
```bash
pnpm dev:web
```

### 4. Test the Cloud Bridge Flow
- Navigate to `http://localhost:3000/camera`
- Click **"Create Cloud Stream"**
- You'll get a unique camera session with publish/HLS URLs
- Enter your RTSP URL to get the Bridge command

## 🔄 Migration from Localhost

This version replaces the previous localhost RTSP→HLS flow with:
- ✅ **Cloud Bridge architecture** for remote camera access
- ✅ **Same UI/UX** - all existing components preserved
- ✅ **Enhanced scalability** - support for multiple remote cameras
- ✅ **Better performance** - cloud-based HLS serving

## 🚀 Cloud Bridge Quickstart

1. **Deploy server**: `cd deploy && docker compose up -d` (set STREAM_DOMAIN in Caddyfile).
2. **Frontend env (Vercel)**: `NEXT_PUBLIC_API_BASE=https://STREAM_DOMAIN/api`, `NEXT_PUBLIC_WS_URL=wss://STREAM_DOMAIN/ws/alerts`.
3. **In /camera**, click "Create Cloud Stream", copy the Bridge command, and run it on a LAN device with your camera's RTSP URL.
4. **The dashboard plays the returned hls_url and shows alerts from /ws/alerts.**

## 📝 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines Here] 