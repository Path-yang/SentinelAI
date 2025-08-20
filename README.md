# SentinelAI

![SentinelAI Logo](https://placehold.co/600x200/1a1a2e/ffffff?text=SentinelAI)

## 🚀 Project Overview

**SentinelAI transforms ordinary commercial cameras into smart anomaly detectors.**

Using advanced AI technology, SentinelAI connects to any commercial IP camera via HLS streams, analyzes video feeds in real-time for anomalies, and broadcasts instant alerts to web and mobile clients.

### 🔍 Use Cases

- **Elderly Care**: Detect falls, unusual immobility, or distress signals
- **Pet Monitoring**: Identify unusual behavior or signs of distress
- **Health Monitoring**: Alert on sudden collapses, seizures, or other medical emergencies
- **Industrial Safety**: Spot equipment malfunctions, safety hazards, or unauthorized access

## ✨ Key Features

- **Real-time Video Processing**: Connect to any commercial IP camera via HLS streams
- **Intelligent Anomaly Detection**: Identify unusual events and behaviors
- **Instant Alerts**: Receive notifications via WebSockets when anomalies are detected
- **Intuitive Dashboard**: Monitor all cameras and review alerts in one place
- **Responsive Design**: Works on desktop and mobile devices
- **PWA Support**: Install as a standalone app on mobile devices
- **Dark/Light Mode**: Choose your preferred theme

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **Zustand** for state management
- **TanStack Query** for data fetching
- **Framer Motion** for animations
- **HLS.js** for video streaming

### Backend
- **FastAPI** (Python)
- **WebSockets** for real-time communication
- In-memory storage (for prototype)

### Testing & Quality
- **Playwright** for end-to-end testing

### Infrastructure
- **pnpm** monorepo with workspaces
- **Vercel** ready for frontend deployment
- **Render/Heroku** ready for backend deployment

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+
- pnpm 8+
- Python 3.8+

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/SentinelAI.git
cd SentinelAI
```

2. Install dependencies
```bash
pnpm install
```

3. Set up backend environment
```bash
cd apps/backend
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
pip install -r requirements.txt
```

4. Create environment variables
```bash
# In apps/web
cp env.example .env.local
# Update with your HLS stream URL and backend URL
```

## 📹 Live Video Setup

### Environment Configuration

The live video feature uses the `NEXT_PUBLIC_HLS_URL` environment variable to specify your HLS stream URL.

**Example configuration in `.env.local`:**
```bash
NEXT_PUBLIC_HLS_URL=http://localhost:8084/mystream/index.m3u8
NEXT_PUBLIC_API_URL=http://127.0.0.1:10000
```

### Converting RTSP to HLS with MediaMTX

If your camera provides RTSP streams, you can convert them to HLS using MediaMTX:

#### 1. Install and Run MediaMTX

**Using Docker (Recommended):**
```bash
docker run -it --rm \
  -p 8554:8554 \
  -p 8083:8083 \
  -p 8084:8084 \
  -e MTX_PROTOCOLS=tcp \
  aler9/mediamtx
```

**Manual Installation:**
```bash
# Download from https://github.com/aler9/mediamtx/releases
# Extract and run with your configuration
```

#### 2. Configure Your Stream

Create a `mediamtx.yml` configuration file:
```yaml
paths:
  mystream:
    source: rtsp://USER:PASS@CAMERA_IP:554/stream1
    sourceOnDemand: yes
    # Force TCP if needed for stability
    sourceProtocol: tcp
```

**Common RTSP URL formats:**
- Generic: `rtsp://USER:PASS@CAMERA_IP:554/stream1`
- Hikvision: `rtsp://USER:PASS@CAMERA_IP:554/Streaming/Channels/101`
- Dahua: `rtsp://USER:PASS@CAMERA_IP:554/cam/realmonitor?channel=1&subtype=0`
- Axis: `rtsp://USER:PASS@CAMERA_IP:554/axis-media/media.amp`

#### 3. Access Your HLS Stream

Once MediaMTX is running, your HLS stream will be available at:
```
http://YOUR_SERVER_IP:8084/mystream/index.m3u8
```

### Troubleshooting

**Common Issues:**

1. **Blank video player:**
   - Check if MediaMTX is running: `curl http://localhost:8084/mystream/index.m3u8`
   - Verify camera credentials and IP address
   - Check firewall settings

2. **CORS errors:**
   - Ensure MediaMTX is configured to allow your domain
   - Add CORS headers in MediaMTX configuration

3. **High latency:**
   - Use wired network connections
   - Lower camera resolution/framerate
   - Enable LL-HLS for lower latency

4. **Connection refused:**
   - Verify MediaMTX is running on correct ports
   - Check if ports are blocked by firewall
   - Ensure camera is accessible from MediaMTX server

**Validation:**
- Test your HLS URL in VLC: `vlc http://localhost:8084/mystream/index.m3u8`
- Check MediaMTX logs for connection errors
- Verify camera stream is working with RTSP client

### Development

1. Start the development servers
```bash
# From the root directory
pnpm dev:all
```

2. Or start individual services
```bash
# Frontend only
pnpm dev:web

# Backend only
pnpm dev:backend
```

3. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📱 Usage Guide

### Dashboard

![Dashboard Screenshot](https://placehold.co/800x450/1a1a2e/ffffff?text=Dashboard+Screenshot)

The dashboard provides an overview of your system:
- Live camera feed with the ability to switch between cameras
- Recent alerts panel showing anomalies detected
- Statistics cards showing system status

### Camera Management

![Cameras Screenshot](https://placehold.co/800x450/1a1a2e/ffffff?text=Cameras+Screenshot)

The cameras page allows you to:
- View all connected cameras
- See camera-specific alerts
- Monitor camera status

### Settings

![Settings Screenshot](https://placehold.co/800x450/1a1a2e/ffffff?text=Settings+Screenshot)

Customize your experience:
- Toggle between light and dark mode
- View privacy information

## 🔮 Roadmap

- **AI Model Integration**: Replace placeholder detection with actual ML models
- **Mobile App**: Develop native mobile applications
- **Camera Management**: Add, remove and configure cameras through the UI
- **Alert Rules**: Create custom alert conditions and notification preferences
- **User Management**: Multi-user support with different permission levels
- **Historical Analysis**: Advanced reporting and trend analysis

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 