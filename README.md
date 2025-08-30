# SentinelAI - Cloud Bridge Architecture

Transform ordinary cameras into smart anomaly detectors using AI technology with a cloud-based streaming architecture.

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

### 2. Start Backend
```bash
# From root directory
pnpm dev:backend

# Or manually
cd apps/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 3. Start Frontend
```bash
# From root directory
pnpm dev:web

# Or manually
cd apps/web
pnpm dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000/dashboard
- **Backend API**: http://localhost:10000
- **WebSocket**: ws://localhost:10000/ws/alerts

## 📱 Features

### Dashboard
- System status monitoring
- Camera connection status
- AI detection status
- Recent alerts overview

### Connect Camera (Cloud Bridge)
- Generate unique camera sessions
- Get RTSP publish URLs for cloud streaming
- Copy-paste bridge commands for LAN devices
- Real-time HLS video streaming

### AI Detection
- Configure detection models by category
- Health & Safety monitoring
- Security detection
- Emergency situation detection
- Analytics and insights

### Settings
- Application configuration
- Camera settings management

## 🔧 Configuration

### Environment Variables
Create `.env.local` in `apps/web/`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:10000
NEXT_PUBLIC_WS_URL=ws://localhost:10000/ws/alerts
```

### Cloud Deployment
For production, update environment variables:
```bash
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_WS_URL=wss://yourdomain.com/ws/alerts
```

## 🌐 Cloud Setup

### 1. MediaMTX Server
Deploy MediaMTX on your VPS with the provided configuration:
```bash
# Use configs/mediamtx/mediamtx.yml
# Enable HLS and configure RTSP publish paths
```

### 2. Nginx Configuration
Put Nginx in front of MediaMTX for HTTPS and CORS:
```nginx
location /hls {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods GET,POST,OPTIONS;
    add_header Access-Control-Allow-Headers DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range;
    
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods GET,POST,OPTIONS;
        add_header Access-Control-Allow-Headers DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range;
        add_header Access-Control-Max-Age 1728000;
        add_header Content-Type 'text/plain; charset=utf-8';
        add_header Content-Length 0;
        return 204;
    }
    
    types {
        application/vnd.apple.mpegurl m3u8;
        video/mp2t ts;
    }
    
    root /path/to/mediamtx/hls;
    add_header Cache-Control no-cache;
    add_header Access-Control-Allow-Origin *;
}
```

### 3. Bridge Script Usage
On your LAN device with camera access:
```bash
python apps/bridge/bridge.py "rtsp://user:pass@192.168.x.x:554/stream" "rtsp://yourdomain.com:8554/cam-XXXX"
```

## 🛠️ Development

### Available Scripts
```bash
pnpm dev:web      # Start frontend development server
pnpm dev:backend  # Start backend API server
pnpm dev:bridge   # Test bridge script
```

### Project Structure
```
SentinelAI/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── backend/          # FastAPI backend
│   └── bridge/           # Python bridge script
├── configs/
│   └── mediamtx/         # MediaMTX configuration
└── docs/                 # Documentation
```

## 🔒 Security Considerations

- **Authentication**: Implement JWT tokens for camera access
- **HTTPS**: Use HTTPS for all web traffic
- **Network Security**: Secure your MediaMTX server
- **Access Control**: Implement proper access controls for RTSP publishing

## 📊 API Endpoints

### Backend API
- `POST /events` - Post new events
- `GET /events` - Retrieve recent events
- `POST /bridge/session` - Generate camera session
- `WebSocket /ws/alerts` - Real-time alerts

### Bridge Session Response
```json
{
  "camera_id": "cam-XXXX",
  "publish_url": "rtsp://stream.yourdomain.com:8554/cam-XXXX",
  "hls_url": "https://stream.yourdomain.com/hls/cam-XXXX/index.m3u8"
}
```

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3000 and 10000 are available
2. **Python dependencies**: Use virtual environments for backend
3. **Build errors**: Check all dependencies are installed
4. **Stream issues**: Verify MediaMTX configuration and network access

### Logs
- Frontend: Check browser console and terminal output
- Backend: Check terminal output for API errors
- Bridge: Check terminal output for FFmpeg errors

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