# SentinelAI

<div align="center">
  <img src="logo.png" alt="SentinelAI Logo" width="250" />
</div>

## 🚀 Project Overview

**SentinelAI transforms ordinary commercial cameras into smart anomaly detectors.**

Using advanced AI technology, SentinelAI connects to any commercial IP camera via RTSP streams, analyzes video feeds in real-time for anomalies, and broadcasts instant alerts to web and mobile clients.

### 🔍 Use Cases

- **Elderly Care**: Detect falls, unusual immobility, or distress signals
- **Pet Monitoring**: Identify unusual behavior or signs of distress
- **Health Monitoring**: Alert on sudden collapses, seizures, or other medical emergencies
- **Industrial Safety**: Spot equipment malfunctions, safety hazards, or unauthorized access

## 🏗️ Current Development Stage

SentinelAI is currently in active development with the following status:

1. ✅ **Camera Integration & Streaming**: Robust RTSP to HLS conversion with ultra-low latency
2. ✅ **Web Dashboard**: Responsive interface for camera management and monitoring
3. ✅ **AI Detection UI**: Interface for selecting and managing detection models
4. 🔄 **AI Model Implementation**: Currently building and training detection models
5. 🔜 **Hardware Integration**: Upcoming physical alarm system and voice detector

### Upcoming Features

- **AI Model Training**: Implementing PyTorch-based models for anomaly detection
- **Physical Alarm System**: ESP32-based alarm with siren/strobe for critical alerts
- **Voice Distress Detection**: Raspberry Pi Zero 2 W-based detector for "help" voice commands
- **Mobile App**: Native mobile application for iOS and Android

## ✨ Key Features

- **Camera Integration**: Connect to any commercial IP camera via RTSP streams
- **Automatic RTSP to HLS Conversion**: Built-in conversion for browser compatibility
- **Ultra-Low Latency Streaming**: Optimized for minimal delay between camera and browser
- **Intelligent Anomaly Detection**: Identify unusual events and behaviors
- **Customizable AI Models**: Select specific detection models based on your needs
- **Instant Alerts**: Receive notifications via WebSockets when anomalies are detected
- **Intuitive Dashboard**: Monitor all cameras and review alerts in one place
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Choose your preferred theme
- **Cross-Network Support**: Works across different networks and devices

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
- **FastAPI/Flask** (Python)
- **WebSockets** for real-time communication
- **In-memory storage** (for prototype)

### Stream Processing
- **FFmpeg** for RTSP to HLS conversion
- **Express.js** for stream configuration API

### ML
- **PyTorch** for deep learning
- **PyTorchVideo** for video models
- **X3D** architecture for video classification
- **OpenCV** for video processing

### Hardware (Coming Soon)
- **ESP32** for physical alarm system
- **Raspberry Pi Zero 2 W** for voice detection
- **5V/12V relay circuits** for external devices

### Infrastructure
- **pnpm** monorepo with workspaces

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+ (recommended 18.17.0 or higher)
- npm or pnpm 8+ (pnpm is preferred)
- Python 3.8+ 
- FFmpeg (required for video stream conversion)
- curl (for API testing)

#### Installing FFmpeg
FFmpeg is essential for video stream conversion. Install it based on your operating system:

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from [FFmpeg official website](https://ffmpeg.org/download.html) or install with Chocolatey:
```bash
choco install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

### Quick Setup (Recommended)

The easiest way to set up SentinelAI is to use the provided setup script:

```bash
# Make the script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

This script will:
1. Set up the Python virtual environment
2. Install all dependencies for the backend, frontend, and stream configuration server
3. Create necessary configuration files

### Manual Installation

If you prefer to set up manually, follow these steps:

1. Clone the repository
```bash
git clone https://github.com/yourusername/SentinelAI.git
cd SentinelAI
```

2. Install frontend dependencies
```bash
# Using npm
npm install

# Using pnpm (recommended)
pnpm install
```

3. Install stream configuration server dependencies
```bash
npm install express cors mkdirp
```

4. Set up backend environment
```bash
cd apps/backend
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
pip install --upgrade pip
pip install flask flask-cors
cd ../..
```

5. Create environment variables
```bash
# In apps/web
cp env.example .env.local
```

## 🎬 Running the Application

### All-in-One Start (Recommended)

The easiest way to run SentinelAI is to use the provided start script:

```bash
# Make the script executable
chmod +x start.sh

# Run the start script
./start.sh
```

This script will automatically:
1. Check and install missing dependencies if needed
2. Start the stream configuration server (RTSP to HLS conversion)
3. Start the backend server (Python Flask)
4. Start the frontend server (Next.js)

### Manual Start

If you prefer to start the services manually:

1. Start the stream configuration server
```bash
node configure-stream.js
```

2. Start the backend
```bash
cd apps/backend
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
python simple_server.py
```

3. Start the frontend
```bash
# Using npm
npm run dev:web

# Using pnpm (recommended)
pnpm dev:web
```

### Access the Application

Once all services are running, access the application at:

- **Dashboard**: http://localhost:3000/dashboard
- **Camera Connection**: http://localhost:3000/camera
- **AI Detection**: http://localhost:3000/dashboard/watch
- **Backend API**: http://localhost:10000
- **Stream Configuration API**: http://localhost:3001

## 📹 Camera Connection Guide

SentinelAI supports RTSP camera streams with automatic conversion to HLS:

### Connecting an RTSP Camera

1. Navigate to http://localhost:3000/camera
2. Enter your camera details:
   - IP address (e.g., 192.168.1.100)
   - Port (usually 554 for RTSP)
   - Stream path (e.g., stream1, live/ch0)
   - Username and password if required
3. Click "Connect"

The application will automatically:
- Build the RTSP URL from your inputs
- Convert the RTSP stream to HLS using FFmpeg
- Display the stream in your browser with ultra-low latency
- Make the stream available on the dashboard

### Testing with a Sample Stream

For testing purposes, you can use this public RTSP test stream:
```
IP: wowzaec2demo.streamlock.net
Port: 554
Path: vod/mp4:BigBuckBunny_115k.mp4
```

No username or password is required for this test stream.

## 🤖 AI Detection Guide

SentinelAI allows you to select specific AI models for monitoring your camera feed:

### Setting Up AI Detection

1. Connect your camera first (see Camera Connection Guide)
2. Navigate to http://localhost:3000/dashboard/watch
3. Browse through the available detection models:
   - **Health & Safety**: Fall detection, extended immobility, seizures
   - **Security**: Intruder detection, abandoned objects, camera tampering
   - **Emergencies**: Fire detection, accidents, distress signs
   - **Analytics**: Occupancy counting, dwell time, traffic patterns
4. Toggle the switch for any models you want to activate
5. Confirm your selection when prompted
6. Click "Apply & Return to Dashboard" when finished

The selected models will be displayed on your dashboard and will begin monitoring your camera feed for the specified events.

### Viewing Active Models

Active AI models are displayed in two places:
1. On the dashboard under the "Active AI Detection" card
2. As an "AI Active" badge next to your live feed

To manage your active models, click the "Manage" button on the Active AI Detection card.

## 🌐 Using Across Different Networks

SentinelAI can be used across different networks with some additional configuration:

### Server Setup (Host)

1. Make sure the server is running on a machine with a stable network connection
2. Ensure ports 3000, 3001, and 10000 are open in your firewall
3. For external access, you may need to set up port forwarding on your router

### Client Access (Remote Users)

To access the application from another device:

1. Find the server's IP address:
   - The server automatically detects and displays its IP on startup
   - You can also check the `/api/server-info` endpoint

2. Access the application using the server's IP:
   - **Dashboard**: http://SERVER_IP:3000/dashboard
   - **Camera Connection**: http://SERVER_IP:3000/camera

3. When connecting to a camera:
   - Enter the camera's IP as seen from the server's network
   - If the camera is on a different network, you may need VPN or port forwarding

### Firewall and Network Considerations

- **Port 3000**: Next.js frontend
- **Port 3001**: Stream configuration server and HLS stream delivery
- **Port 10000**: Backend API and WebSocket server

For security in production environments:
- Use a reverse proxy like Nginx
- Set up HTTPS
- Implement proper authentication

## 🔧 Troubleshooting

### Common Issues

#### "FFmpeg not found" Error
Ensure FFmpeg is installed and available in your PATH:
```bash
ffmpeg -version
```

If not installed, follow the FFmpeg installation instructions in the Prerequisites section.

#### Stream Configuration Issues

If you encounter issues with the stream configuration:

1. Check that the stream configuration server is running:
```bash
curl http://localhost:3001/api/status
```

2. Check that the `hls` directory exists and has write permissions:
```bash
mkdir -p hls
chmod 755 hls
```

3. Check the logs for the stream configuration server:
```bash
# Press Ctrl+C to stop the server and view logs
node configure-stream.js
```

#### Camera Connection Issues

If you cannot connect to your camera:

1. Verify that your camera is accessible from your network
   ```bash
   # Test RTSP connection with FFmpeg
   ffmpeg -i rtsp://username:password@camera-ip:port/path -t 5 -c copy test.mp4
   ```

2. Check that the RTSP URL format is correct
   - Standard format: `rtsp://[username:password@]ip-address:port/path`
   - Common ports: 554 (default), 8554, 10554

3. Try connecting with VLC media player:
   - Open VLC
   - Media > Open Network Stream
   - Enter your RTSP URL and click Play

#### Dashboard Video Not Loading

If the dashboard video is not loading:

1. Make sure you've successfully connected a camera first
2. Click the refresh button in the top-right corner of the video player
3. Try disconnecting and reconnecting the camera
4. Check the browser console for any error messages

#### "NotAllowedError: play() failed because the user didn't interact" Warning

This is a browser security feature that prevents videos from automatically playing with sound. You may see this warning in the console, but it doesn't affect functionality. The video will still play when:

1. The user interacts with the page
2. The video is muted (which our application handles)

#### Browser Compatibility Issues

For best results:
- Use Chrome, Firefox, or Edge
- Safari may have limitations with HLS streams
- Ensure your browser is up to date

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details 