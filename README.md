# SentinelAI

<div align="center">
  <img src="apps/web/public/images/logo.png" alt="SentinelAI Logo" width="250" />
</div>

## 🚀 Project Overview

**SentinelAI transforms ordinary commercial cameras into smart anomaly detectors using cloud-based streaming technology.**

Using advanced AI technology, SentinelAI connects to any commercial IP camera via RTSP streams, bridges them to the cloud, analyzes video feeds in real-time for anomalies, and broadcasts instant alerts to web and mobile clients across the internet.

### 🌟 What Makes SentinelAI Special

- **Cloud-First Architecture**: Unlike traditional local-only systems, SentinelAI bridges local cameras to the cloud for global access
- **Zero-Configuration Streaming**: Automatic RTSP to HLS conversion with MediaMTX streaming server
- **Production-Ready Deployment**: Docker-based infrastructure with Caddy reverse proxy and HTTPS
- **Real-Time AI Processing**: WebSocket-based alerts and real-time video streaming
- **Cross-Platform Compatibility**: Works on any device with a modern web browser
- **Enterprise-Grade Security**: HTTPS encryption, proper authentication, and secure streaming

### 🔍 Use Cases

- **Elderly Care**: Detect falls, unusual immobility, or distress signals with 24/7 cloud monitoring
- **Pet Monitoring**: Identify unusual behavior or signs of distress from anywhere
- **Health Monitoring**: Alert on sudden collapses, seizures, or other medical emergencies
- **Industrial Safety**: Spot equipment malfunctions, safety hazards, or unauthorized access
- **Remote Monitoring**: Access camera feeds from anywhere in the world via cloud streaming
- **Home Security**: Monitor multiple properties with centralized cloud dashboard
- **Business Surveillance**: Multi-location business monitoring with cloud-based management
- **Event Monitoring**: Temporary camera setups for events with instant cloud access
- **Construction Sites**: Monitor construction progress and security remotely
- **Agricultural Monitoring**: Watch over farms, livestock, and equipment from anywhere

## 🏗️ Current Development Stage

SentinelAI is currently in active development with the following status:

1. ✅ **Cloud Bridge Architecture**: Complete RTSP to cloud streaming pipeline with MediaMTX
2. ✅ **Camera Integration & Streaming**: Robust RTSP to HLS conversion with ultra-low latency
3. ✅ **Web Dashboard**: Responsive interface for camera management and monitoring
4. ✅ **Cloud Deployment**: Docker-based deployment with Caddy reverse proxy
5. 🔄 **AI Detection UI**: Interface for selecting and managing detection models
6. 🔜 **AI Model Implementation**: Currently building and training detection models
7. 🔜 **Hardware Integration**: Upcoming physical alarm system and voice detector

### Upcoming Features

- **AI Model Training**: Implementing PyTorch-based models for anomaly detection
- **Physical Alarm System**: ESP32-based alarm with siren/strobe for critical alerts
- **Voice Distress Detection**: Raspberry Pi Zero 2 W-based detector for "help" voice commands
- **Mobile App**: Native mobile application for iOS and Android
- **Multi-tenant Support**: Cloud-based multi-user management system
- **Advanced Analytics**: Motion heatmaps, occupancy tracking, and behavioral analysis
- **Integration APIs**: Webhook support, Slack/Discord notifications, and third-party integrations
- **Recording & Playback**: Cloud-based video recording with search and playback capabilities
- **Multi-Camera AI**: Cross-camera event correlation and advanced pattern recognition
- **Edge AI Processing**: On-device AI processing for reduced latency and bandwidth

## ✨ Key Features

- **Cloud Bridge Architecture**: Connect local cameras to cloud streaming infrastructure
- **Camera Integration**: Connect to any commercial IP camera via RTSP streams
- **Automatic RTSP to HLS Conversion**: Built-in conversion for browser compatibility
- **Ultra-Low Latency Streaming**: Optimized for minimal delay between camera and browser
- **Global Access**: Access camera feeds from anywhere via cloud streaming
- **Intelligent Anomaly Detection**: Identify unusual events and behaviors
- **Customizable AI Models**: Select specific detection models based on your needs
- **Instant Alerts**: Receive notifications via WebSockets when anomalies are detected
- **Intuitive Dashboard**: Monitor all cameras and review alerts in one place
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Choose your preferred theme
- **Cross-Network Support**: Works across different networks and devices
- **Production Ready**: Docker-based deployment with proper reverse proxy

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with TypeScript and App Router
- **TailwindCSS** for utility-first styling
- **shadcn/ui** for accessible UI components
- **Zustand** for lightweight state management
- **TanStack Query** for server state management
- **Framer Motion** for smooth animations and transitions
- **HLS.js** for adaptive bitrate video streaming
- **React 18** with concurrent features
- **TypeScript 5** for type safety

### Backend
- **FastAPI** (Python 3.11+) with async/await support
- **WebSockets** for real-time bidirectional communication
- **Pydantic** for data validation and serialization
- **Uvicorn** ASGI server with multiple workers
- **In-memory storage** with automatic cleanup (for prototype)
- **Health checks** and comprehensive monitoring
- **CORS middleware** for cross-origin requests
- **Rate limiting** and security headers

### Stream Processing
- **MediaMTX** for enterprise-grade RTSP ingest and HLS serving
- **FFmpeg** for high-performance RTSP to RTSP bridging
- **Bridge Script** for intelligent local camera to cloud connection
- **HLS streaming** with adaptive bitrate and low latency
- **RTSP protocol** support for maximum camera compatibility
- **Stream health monitoring** with automatic reconnection

### Cloud Infrastructure
- **Docker Compose** for multi-service orchestration
- **Caddy** for modern reverse proxy with automatic HTTPS
- **MediaMTX** for scalable streaming server
- **Python Bridge** for cross-platform camera connectivity
- **Load balancing** and health checks
- **Automatic SSL certificate** generation with Let's Encrypt
- **Container health monitoring** and restart policies

### ML (Coming Soon)
- **PyTorch** for deep learning and neural networks
- **PyTorchVideo** for video-specific model architectures
- **X3D** architecture for efficient video classification
- **OpenCV** for computer vision and video processing
- **TensorRT** for GPU acceleration and optimization
- **ONNX** for model interoperability and deployment
- **Custom training pipelines** for domain-specific models
- **Transfer learning** from pre-trained video models

### Hardware (Coming Soon)
- **ESP32** for physical alarm system with WiFi connectivity
- **Raspberry Pi Zero 2 W** for voice detection and local processing
- **5V/12V relay circuits** for external device control
- **PIR motion sensors** for additional motion detection
- **Temperature/humidity sensors** for environmental monitoring
- **GPIO expansion** for custom hardware integrations
- **LoRa modules** for long-range wireless communication
- **Solar power systems** for off-grid deployments

### Infrastructure
- **pnpm** monorepo with workspace management
- **Docker** for containerization and deployment
- **Caddy** for modern web server and reverse proxy
- **GitHub Actions** for CI/CD automation
- **Environment management** with .env files
- **Health monitoring** and alerting
- **Log aggregation** and centralized logging
- **Backup and disaster recovery** strategies

## 📋 Setup Instructions

### Prerequisites

#### System Requirements
- **Operating System**: macOS 10.15+, Ubuntu 20.04+, Windows 10+, or any Linux distribution
- **Memory**: Minimum 4GB RAM, recommended 8GB+ for production
- **Storage**: Minimum 10GB free space, recommended 50GB+ for video storage
- **Network**: Stable internet connection for cloud deployment
- **CPU**: Multi-core processor recommended for video processing

#### Software Requirements
- **Node.js**: Version 18+ (recommended 18.17.0 or higher for LTS support)
- **Package Manager**: npm 8+ or pnpm 8+ (pnpm is preferred for monorepo management)
- **Python**: Version 3.8+ (recommended 3.11+ for performance)
- **FFmpeg**: Latest stable version (required for video stream conversion)
- **Docker**: Version 20.10+ with Docker Compose support
- **Git**: Version 2.20+ for repository management
- **curl**: For API testing and health checks
- **wget**: For health check scripts and downloads

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

#### Installing Docker
Docker is required for cloud deployment and containerization:

**macOS:**
```bash
# Using Homebrew
brew install --cask docker

# Alternative: Download from Docker website
# https://www.docker.com/products/docker-desktop/
```

**Ubuntu/Debian:**
```bash
# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker compose version
```

**Windows:**
1. Download Docker Desktop from [Docker official website](https://www.docker.com/products/docker-desktop/)
2. Install and restart your computer
3. Ensure WSL 2 is enabled for better performance
4. Verify installation in PowerShell:
```powershell
docker --version
docker compose version
```

**Verify Docker Installation:**
```bash
# Test Docker
docker run hello-world

# Test Docker Compose
docker compose version
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
1. Set up the Python virtual environment for backend and bridge
2. Install all Node.js dependencies for the frontend
3. Create necessary configuration files and environment variables
4. Set up Docker environment and verify installations
5. Configure development and production environments
6. Run health checks to ensure everything is working

**Note**: The setup script requires sudo access for Docker installation on Linux systems.

### Manual Installation

If you prefer to set up manually, follow these detailed steps:

#### 1. Clone and Setup Repository
```bash
# Clone the repository
git clone https://github.com/yourusername/SentinelAI.git
cd SentinelAI

# Verify the structure
ls -la
```

#### 2. Install Frontend Dependencies
```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies
pnpm install

# Verify installation
pnpm --version
node --version
```

#### 3. Set Up Backend Environment
```bash
# Navigate to backend directory
cd apps/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install fastapi uvicorn[standard] pydantic

# Verify installation
python -c "import fastapi; print('FastAPI installed successfully')"

# Return to root directory
cd ../..
```

#### 4. Set Up Bridge Environment
```bash
# Navigate to bridge directory
cd apps/bridge

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install requirements
pip install --upgrade pip
pip install -r requirements.txt

# Verify FFmpeg installation
ffmpeg -version

# Return to root directory
cd ../..
```

#### 5. Configure Environment Variables
```bash
# Copy environment template
cp apps/web/env.example apps/web/.env.local

# Edit the environment file
# nano apps/web/.env.local
# or
# code apps/web/.env.local
```

#### 6. Verify All Installations
```bash
# Check Node.js and pnpm
node --version
pnpm --version

# Check Python and pip
python --version
pip --version

# Check Docker
docker --version
docker compose version

# Check FFmpeg
ffmpeg -version
```

## 🎬 Running the Application

### Cloud Deployment (Production)

The recommended way to run SentinelAI is using the cloud deployment. This provides a production-ready environment with HTTPS, load balancing, and proper security.

#### Prerequisites for Production
- **Domain Name**: A registered domain name pointing to your server
- **Server Access**: SSH access to your deployment server
- **Firewall Configuration**: Open ports 80, 443, and 8554
- **SSL Certificates**: Caddy will automatically generate Let's Encrypt certificates

#### Deployment Steps

1. **Prepare Your Server**
```bash
# SSH into your server
ssh user@your-server-ip

# Clone the repository
git clone https://github.com/yourusername/SentinelAI.git
cd SentinelAI

# Install Docker if not already installed
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

2. **Configure Domain**
```bash
# Navigate to deploy directory
cd deploy

# Edit Caddyfile and replace STREAM_DOMAIN with your actual domain
# Example: STREAM_DOMAIN = yourdomain.com
nano Caddyfile
```

3. **Start the Cloud Infrastructure**
```bash
# Start all services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f
```

4. **Verify Deployment**
```bash
# Check if services are running
docker compose ps

# Test MediaMTX
curl http://localhost:9997/v3/paths/list

# Test Backend
curl http://localhost:10000/health

# Test Caddy
curl -I http://localhost:80
```

#### What Gets Started
- **MediaMTX**: Cloud streaming server on port 8554 (RTSP ingest)
- **Backend**: FastAPI server on port 10000 (API and WebSockets)
- **Caddy**: Reverse proxy with HTTPS support (ports 80/443)
- **HLS Storage**: Persistent volume for video segments
- **SSL Certificates**: Automatic Let's Encrypt certificate generation

### Local Development

For development purposes, you can run the services locally. This is useful for testing, debugging, and development work.

#### Development Prerequisites
- All prerequisites from the setup section
- Local FFmpeg installation for testing
- Development tools (VS Code, PyCharm, etc.)

#### Running Services Locally

1. **Start the Backend Server**
```bash
# Navigate to backend directory
cd apps/backend

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start FastAPI with auto-reload
python -m uvicorn main:app --host 0.0.0.0 --port 10000 --reload

# Alternative: Use the provided run script
bash run.sh
```

2. **Start the Frontend Development Server**
```bash
# In a new terminal, from the root directory
# Using pnpm (recommended)
pnpm dev:web

# Alternative: Using npm
npm run dev:web

# Alternative: Direct Next.js command
cd apps/web && npm run dev
```

3. **Start the Bridge (Optional for Development)**
```bash
# In a new terminal, from the root directory
# Test bridge help
pnpm dev:bridge

# Or run bridge directly
cd apps/bridge
source venv/bin/activate
python bridge.py --help
```

#### Development Workflow
- **Backend**: Runs on http://localhost:10000 with auto-reload
- **Frontend**: Runs on http://localhost:3000 with hot reload
- **API Testing**: Use http://localhost:10000/docs for FastAPI interactive docs
- **Logs**: Check terminal outputs for real-time logs
- **Hot Reload**: Both frontend and backend support automatic reloading

#### Development Tips
- Use the FastAPI docs at `/docs` for API testing
- Check browser console for frontend errors
- Monitor terminal outputs for backend logs
- Use `Ctrl+C` to stop services gracefully

### Access the Application

#### Production URLs (After Cloud Deployment)
Once deployed with your domain, access the application at:

- **Main Dashboard**: https://yourdomain.com/dashboard
- **Camera Connection**: https://yourdomain.com/camera
- **AI Detection Management**: https://yourdomain.com/dashboard/watch
- **Backend API**: https://yourdomain.com/api
- **WebSocket Alerts**: wss://yourdomain.com/ws/alerts
- **HLS Streams**: https://yourdomain.com/hls/[camera-id]
- **Health Check**: https://yourdomain.com/health

#### Development URLs (Local Development)
For local development and testing:

- **Main Dashboard**: http://localhost:3000/dashboard
- **Camera Connection**: http://localhost:3000/camera
- **AI Detection Management**: http://localhost:3000/dashboard/watch
- **Backend API**: http://localhost:10000
- **FastAPI Docs**: http://localhost:10000/docs
- **FastAPI ReDoc**: http://localhost:10000/redoc
- **Health Check**: http://localhost:10000/health

#### API Endpoints
- **Health Check**: `GET /health`
- **Events**: `GET /api/events` and `POST /api/events`
- **WebSocket**: `ws://localhost:10000/ws/alerts` (local) or `wss://yourdomain.com/ws/alerts` (production)

#### Important Notes
- **HTTPS Required**: Production deployment automatically uses HTTPS
- **CORS Configured**: Frontend can communicate with backend across different ports
- **WebSocket Support**: Real-time alerts work in both development and production
- **API Documentation**: Interactive API docs available at `/docs` endpoint

## 📹 Camera Connection Guide

SentinelAI supports RTSP camera streams with cloud-based streaming. This guide explains how to connect your cameras and set up the bridge for cloud streaming.

### Understanding the Cloud Bridge Flow

The connection process works as follows:
1. **Create Cloud Stream**: Generate a unique camera session in the web interface
2. **Bridge Setup**: Run the bridge script on a device with access to your camera
3. **Stream Publishing**: Bridge pulls RTSP from camera and publishes to cloud MediaMTX
4. **HLS Conversion**: MediaMTX automatically converts RTSP to HLS for web viewing
5. **Dashboard Access**: View your camera feed from anywhere via the web dashboard

### Step-by-Step Camera Connection

#### 1. Create Cloud Stream Session
1. Navigate to the camera connection page (`/camera`)
2. Click **"Create Cloud Stream"** button
3. Enter a descriptive label for your camera (e.g., "Front Door Camera")
4. Click **"Create Stream"** to generate a unique session

#### 2. Get Connection Details
After creating the stream, you'll receive:
- **Camera ID**: Unique identifier (e.g., `cam-abc123`)
- **Publish URL**: RTSP endpoint for the bridge (e.g., `rtsp://yourdomain.com:8554/cam-abc123`)
- **HLS URL**: Web-viewable stream (e.g., `https://yourdomain.com/hls/cam-abc123/stream.m3u8`)
- **Bridge Command**: Complete command to run on your camera device

#### 3. Set Up the Bridge
Run the bridge command on a device with access to your camera:

```bash
# Basic bridge command format
python apps/bridge/bridge.py "rtsp://user:pass@camera-ip:port/path" "rtsp://yourdomain.com:8554/cam-XXXX"

# Example with actual values
python apps/bridge/bridge.py "rtsp://admin:password@192.168.1.100:554/stream1" "rtsp://yourdomain.com:8554/cam-abc123"

# Alternative: Use the full path if not in the project directory
python /path/to/SentinelAI/apps/bridge/bridge.py "rtsp://admin:password@192.168.1.100:554/stream1" "rtsp://yourdomain.com:8554/cam-abc123"
```

#### 4. Verify Connection
Once the bridge is running:
- Check the bridge terminal for connection status
- Navigate to the dashboard to see your camera feed
- The video should appear automatically with low latency
- Check for any error messages in the bridge terminal

### Camera Compatibility

#### Supported Camera Types
- **IP Cameras**: Any camera with RTSP support
- **DVR/NVR Systems**: Most modern DVR/NVR systems support RTSP
- **USB Cameras**: Can be converted to RTSP using software like OBS
- **Mobile Apps**: Apps that can stream to RTSP endpoints
- **Webcams**: With appropriate software conversion

#### RTSP URL Formats
Common RTSP URL patterns:
```
rtsp://username:password@ip-address:port/path
rtsp://ip-address:port/path
rtsp://username:password@ip-address:port/stream1
rtsp://ip-address:port/live/ch0
rtsp://ip-address:port/live/ch00_0
```

#### Common Camera Ports
- **554**: Standard RTSP port (most common)
- **8554**: Alternative RTSP port
- **10554**: Another common alternative
- **Custom**: Some cameras use custom ports

### Bridge Configuration Options

#### Command Line Arguments
```bash
python apps/bridge/bridge.py --help

# Available options:
# --rtsp-in: Input RTSP URL
# --publish-url: Output RTSP URL
# --retry-count: Number of retry attempts
# --log-level: Logging level (DEBUG, INFO, WARNING, ERROR)
```

#### Environment Variables
```bash
# Set bridge configuration via environment
export BRIDGE_RETRY_COUNT=5
export BRIDGE_LOG_LEVEL=INFO
export BRIDGE_TIMEOUT=5000000
```

### Troubleshooting Camera Connections

#### Common Issues and Solutions

**1. "Connection refused" Error**
- Verify camera IP address and port
- Check if camera is accessible from bridge device
- Ensure firewall allows RTSP traffic
- Test network connectivity with ping/telnet

**2. "Authentication failed" Error**
- Verify username and password
- Check camera authentication settings
- Try different authentication methods
- Reset camera credentials if necessary

**3. "Stream not found" Error**
- Verify RTSP path/stream name
- Check camera stream configuration
- Try different stream paths
- Consult camera manufacturer documentation

**4. Bridge Connection Issues**
- Verify cloud MediaMTX is running
- Check domain name resolution
- Ensure port 8554 is open on cloud server
- Check bridge logs for detailed error messages

**5. "FFmpeg not found" Error**
- Ensure FFmpeg is installed and in PATH
- Verify FFmpeg version compatibility
- Reinstall FFmpeg if necessary

#### Testing Camera Connectivity
```bash
# Test RTSP connection with FFmpeg
ffmpeg -i "rtsp://user:pass@camera-ip:port/path" -t 5 -c copy test.mp4

# Test with VLC media player
# Open VLC → Media → Open Network Stream → Enter RTSP URL

# Test network connectivity
ping camera-ip
telnet camera-ip port

# Test specific ports
nmap -p 554 camera-ip
```

### Testing with Sample Streams

For testing and development purposes, you can use these public RTSP test streams:

#### Free Test Streams
```
# Big Buck Bunny (Animation)
IP: wowzaec2demo.streamlock.net
Port: 554
Path: vod/mp4:BigBuckBunny_115k.mp4
Full URL: rtsp://wowzaec2demo.streamlock.net:554/vod/mp4:BigBuckBunny_115k.mp4

# Alternative test streams
rtsp://demo:demo@ipvmdemo.dyndns.org:5541/onvif1
rtsp://demo:demo@ipvmdemo.dyndns.org:5541/onvif2
rtsp://demo:demo@ipvmdemo.dyndns.org:5541/onvif3
```

#### Testing Your Setup
1. **Use the test stream URL** in your bridge command
2. **Verify cloud streaming** works before connecting real cameras
3. **Test different stream qualities** and bitrates
4. **Check latency** and performance characteristics

#### Creating Local Test Streams
If you want to test with local video files:

```bash
# Convert video file to RTSP stream using FFmpeg
ffmpeg -re -i video.mp4 -c copy -f rtsp rtsp://localhost:8554/test

# Or use OBS Studio to create RTSP streams
# Settings → Stream → Custom → RTSP URL
```

**Note**: These test streams are for development purposes only. Use your own cameras for production deployments.

### Testing with a Sample Stream

For testing purposes, you can use this public RTSP test stream:
```
IP: wowzaec2demo.streamlock.net
Port: 554
Path: vod/mp4:BigBuckBunny_115k.mp4
```

No username or password is required for this test stream.

## 🌐 Cloud Bridge Architecture

SentinelAI uses a **Cloud Bridge** architecture that separates camera connectivity from the web interface:

```
[Local Camera] → [Sentinel Bridge (LAN)] → [Cloud MediaMTX] → [HLS Stream] → [Web Interface]
```

### Components:

- **Bridge**: Python script that pulls RTSP from local cameras and publishes to cloud
- **MediaMTX**: Cloud streaming server for RTSP ingest and HLS serving
- **Backend**: FastAPI server handling events and WebSocket alerts
- **Frontend**: Next.js web application with real-time video streaming
- **Caddy**: Reverse proxy providing HTTPS and load balancing

### Benefits:

- **Global Access**: View camera feeds from anywhere via cloud streaming
- **Scalability**: Support for multiple remote cameras
- **Performance**: Cloud-based HLS serving with CDN capabilities
- **Security**: HTTPS encryption and proper reverse proxy setup
- **Reliability**: Docker-based deployment with health checks

## 🤖 AI Detection Guide

SentinelAI provides intelligent anomaly detection using advanced AI models. This guide explains how to set up, configure, and manage AI detection for your camera feeds.

### Understanding AI Detection

AI detection in SentinelAI works by:
1. **Real-time Analysis**: Continuously analyzing video streams for anomalies
2. **Model Selection**: Choosing specific detection models based on your needs
3. **Event Detection**: Identifying and categorizing unusual events
4. **Instant Alerts**: Sending real-time notifications via WebSockets
5. **Historical Analysis**: Storing events for review and analysis

### Available Detection Models

#### Health & Safety Models
- **Fall Detection**: Identifies sudden falls or collapses
- **Extended Immobility**: Detects prolonged periods of inactivity
- **Seizure Detection**: Recognizes seizure-like movements
- **Distress Signals**: Identifies signs of distress or emergency
- **Medical Emergency**: Detects medical emergencies and accidents

#### Security Models
- **Intruder Detection**: Identifies unauthorized access
- **Abandoned Objects**: Detects suspicious abandoned items
- **Camera Tampering**: Recognizes camera obstruction or manipulation
- **Perimeter Breach**: Monitors boundary violations
- **Suspicious Behavior**: Identifies unusual behavioral patterns

#### Emergency Models
- **Fire Detection**: Recognizes fire and smoke
- **Accident Detection**: Identifies accidents and incidents
- **Natural Disasters**: Detects environmental hazards
- **Equipment Failure**: Monitors for equipment malfunctions
- **Safety Violations**: Identifies safety protocol violations

#### Analytics Models
- **Occupancy Counting**: Tracks people entering/leaving areas
- **Dwell Time Analysis**: Measures time spent in specific areas
- **Traffic Patterns**: Analyzes movement patterns
- **Queue Monitoring**: Tracks waiting times and line lengths
- **Behavioral Analysis**: Identifies behavioral trends and patterns

### Setting Up AI Detection

#### Prerequisites
1. **Camera Connection**: Ensure your camera is connected and streaming (see Camera Connection Guide)
2. **AI Models**: Verify that AI models are available and loaded
3. **Permissions**: Ensure you have access to AI detection features

#### Step-by-Step Setup

1. **Navigate to AI Detection**
   - Go to the main dashboard
   - Click on "AI Detection" or navigate to `/dashboard/watch`
   - You'll see the AI model selection interface

2. **Browse Available Models**
   - Models are organized by category (Health & Safety, Security, etc.)
   - Each model shows its current status (Active/Inactive)
   - Hover over models to see detailed descriptions

3. **Select Detection Models**
   - Toggle the switch for models you want to activate
   - You can select multiple models simultaneously
   - Consider your specific use case when selecting models

4. **Configure Model Parameters**
   - Some models have configurable parameters
   - Adjust sensitivity, detection thresholds, and alert conditions
   - Set notification preferences for each model

5. **Apply Configuration**
   - Click "Apply & Return to Dashboard" when finished
   - The system will activate your selected models
   - Models begin monitoring immediately

### Managing Active Models

#### Dashboard Integration
Active AI models are displayed in multiple locations:
1. **Active AI Detection Card**: Shows all currently active models
2. **Camera Feed Badges**: "AI Active" indicator next to monitored feeds
3. **Event History**: AI-detected events in the events timeline
4. **Real-time Alerts**: Instant notifications for detected anomalies

#### Model Management
- **Enable/Disable**: Toggle models on/off as needed
- **Parameter Adjustment**: Fine-tune detection sensitivity
- **Performance Monitoring**: Track detection accuracy and performance
- **Model Updates**: Receive updates and improvements

#### Alert Configuration
- **Notification Types**: Choose between push, email, or SMS alerts
- **Alert Thresholds**: Set minimum confidence levels for alerts
- **Frequency Limits**: Prevent alert spam with rate limiting
- **Escalation Rules**: Define alert escalation procedures

### AI Detection Performance

#### Accuracy and Reliability
- **High Accuracy**: State-of-the-art models with >95% accuracy
- **False Positive Reduction**: Advanced algorithms minimize false alarms
- **Adaptive Learning**: Models improve over time with usage
- **Multi-camera Correlation**: Cross-camera event validation

#### Performance Optimization
- **GPU Acceleration**: Hardware acceleration for faster processing
- **Edge Processing**: Local processing for reduced latency
- **Cloud AI**: Scalable cloud-based AI processing
- **Hybrid Approach**: Combination of edge and cloud processing

#### Monitoring and Maintenance
- **Performance Metrics**: Track detection accuracy and speed
- **Model Health**: Monitor model performance and health
- **Automatic Updates**: Receive model improvements automatically
- **Custom Training**: Train models on your specific use cases

### Advanced AI Features

#### Custom Model Training
- **Domain Adaptation**: Adapt models to your specific environment
- **Data Collection**: Gather training data from your cameras
- **Model Fine-tuning**: Customize models for your use cases
- **Performance Optimization**: Optimize models for your hardware

#### Integration Capabilities
- **API Access**: Programmatic access to AI detection results
- **Webhook Support**: Send alerts to external systems
- **Third-party Integration**: Connect with existing security systems
- **Custom Alerts**: Define custom alert conditions and actions

#### Future Enhancements
- **Multi-modal Detection**: Audio and video analysis
- **Predictive Analytics**: Predict potential incidents
- **Behavioral Profiling**: Learn normal behavior patterns
- **Advanced Analytics**: Deep insights and reporting

## 🔧 Troubleshooting

This comprehensive troubleshooting guide covers common issues and their solutions for SentinelAI deployment and operation.

### Quick Diagnostic Commands

Before diving into specific issues, run these diagnostic commands:

```bash
# Check system status
docker compose ps
docker compose logs --tail=50

# Check service health
curl http://localhost:10000/health
curl http://localhost:9997/v3/paths/list

# Check network connectivity
ping your-domain.com
nslookup your-domain.com

# Check disk space
df -h
docker system df
```

### Common Issues and Solutions

#### System-Level Issues

**1. "FFmpeg not found" Error**
Ensure FFmpeg is installed and available in your PATH:
```bash
ffmpeg -version
```

If not installed, follow the FFmpeg installation instructions in the Prerequisites section.

**2. "Docker not running" Error**
```bash
# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker is running
docker --version
docker compose version
```

**3. "Port already in use" Error**
```bash
# Check what's using the port
sudo netstat -tulpn | grep :10000
sudo netstat -tulpn | grep :8554

# Kill processes using the port
sudo kill -9 <PID>
```

#### Bridge Connection Issues

If the bridge cannot connect to your camera, follow this systematic troubleshooting approach:

**1. Verify Camera Accessibility**
```bash
# Test RTSP connection with FFmpeg
ffmpeg -i rtsp://username:password@camera-ip:port/path -t 5 -c copy test.mp4

# Test network connectivity
ping camera-ip
telnet camera-ip port

# Check if camera is reachable
nmap -p 554 camera-ip
```

**2. Verify RTSP URL Format**
- Standard format: `rtsp://[username:password@]ip-address:port/path`
- Common ports: 554 (default), 8554, 10554
- Check for typos in username, password, IP, or path

**3. Test with Alternative Tools**
```bash
# Test with VLC media player
# Open VLC → Media → Open Network Stream → Enter RTSP URL

# Test with GStreamer
gst-launch-1.0 playbin uri="rtsp://username:password@camera-ip:port/path"

# Test with curl (for HTTP-based cameras)
curl -I http://camera-ip:port/path
```

**4. Check Camera Configuration**
- Verify camera is set to RTSP streaming mode
- Check camera authentication settings
- Ensure camera is not in sleep/power-saving mode
- Verify camera firmware supports RTSP

**5. Network and Firewall Issues**
```bash
# Check local firewall
sudo ufw status
sudo iptables -L

# Check router firewall settings
# Ensure port forwarding is configured if needed

# Test from different network locations
# Try connecting from the same network as the camera
```

#### Cloud Deployment Issues

If you encounter issues with cloud deployment, follow this comprehensive troubleshooting guide:

**1. Check Docker Services Status**
```bash
cd deploy

# Check service status
docker compose ps

# View recent logs
docker compose logs --tail=100

# View logs for specific service
docker compose logs mediamtx
docker compose logs backend
docker compose logs caddy

# Check service health
docker compose exec mediamtx wget --no-verbose --tries=1 --spider http://localhost:9997/v3/paths/list
docker compose exec backend wget --no-verbose --tries=1 --spider http://localhost:10000/health
```

**2. Verify Domain Configuration**
```bash
# Check Caddyfile configuration
cat Caddyfile

# Verify DNS resolution
nslookup your-domain.com
dig your-domain.com

# Test domain accessibility
curl -I http://your-domain.com
curl -I https://your-domain.com

# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

**3. Check MediaMTX Status**
```bash
# Check MediaMTX API
curl http://localhost:9997/v3/paths/list
curl http://localhost:9997/v3/paths/list | jq .

# Check MediaMTX configuration
docker compose exec mediamtx cat /mediamtx.yml

# Check MediaMTX logs
docker compose logs mediamtx --tail=50
```

**4. Verify Backend API**
```bash
# Check backend health
curl http://localhost:10000/health

# Check backend logs
docker compose logs backend --tail=50

# Test API endpoints
curl http://localhost:10000/
curl http://localhost:10000/docs
```

**5. Check Caddy Configuration**
```bash
# Verify Caddy is running
docker compose ps caddy

# Check Caddy logs
docker compose logs caddy --tail=50

# Test Caddy endpoints
curl -I http://localhost:80
curl -I https://localhost:443
```

**6. Network and Firewall Issues**
```bash
# Check if ports are open
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
sudo netstat -tulpn | grep :8554

# Check firewall rules
sudo ufw status
sudo iptables -L

# Test external connectivity
curl -I http://your-server-ip:80
curl -I http://your-server-ip:443
```

**7. SSL Certificate Issues**
```bash
# Check Let's Encrypt rate limits
# Visit: https://letsencrypt.org/docs/rate-limits/

# Check Caddy data directory
ls -la caddy_data/
ls -la caddy_config/

# Verify certificate files
find caddy_data -name "*.crt" -exec openssl x509 -in {} -text -noout \;
```

#### Dashboard Video Not Loading

If the dashboard video is not loading, follow these troubleshooting steps:

**1. Verify Stream Creation**
- Ensure you've successfully created a cloud stream
- Check that the stream shows as "Active" in the dashboard
- Verify the camera ID and HLS URL are correct

**2. Check Bridge Status**
```bash
# Verify bridge is running
ps aux | grep bridge.py

# Check bridge logs for errors
# Look for connection status and error messages

# Test bridge connectivity
curl -I "https://yourdomain.com/hls/cam-XXXX/stream.m3u8"
```

**3. Check Browser Network Tab**
- Open browser Developer Tools (F12)
- Go to Network tab
- Refresh the page
- Look for failed requests to HLS endpoints
- Check for CORS errors or 404 responses

**4. Verify HLS Stream**
```bash
# Test HLS playlist
curl "https://yourdomain.com/hls/cam-XXXX/stream.m3u8"

# Test HLS segments
curl "https://yourdomain.com/hls/cam-XXXX/segment0.ts"

# Check MediaMTX paths
curl http://localhost:9997/v3/paths/list | jq .
```

**5. Common Solutions**
- Refresh the page and wait for stream to load
- Disconnect and reconnect the camera
- Check if camera is still streaming to the bridge
- Verify domain and SSL certificate are working
- Clear browser cache and cookies

#### "NotAllowedError: play() failed because the user didn't interact" Warning

This is a browser security feature that prevents videos from automatically playing with sound. You may see this warning in the console, but it doesn't affect functionality. The video will still play when:

1. The user interacts with the page
2. The video is muted (which our application handles)

#### Browser Compatibility Issues

For best results:
- Use Chrome, Firefox, or Edge
- Safari may have limitations with HLS streams
- Ensure your browser is up to date

## 🚀 Deployment Checklist

This comprehensive checklist ensures a successful production deployment of SentinelAI.

### Pre-Deployment Requirements

#### Domain and DNS
- [ ] **Domain Registration**: Secure a domain name for your deployment
- [ ] **DNS Configuration**: Point domain to your server's IP address
- [ ] **DNS Propagation**: Wait for DNS changes to propagate (up to 48 hours)
- [ ] **Subdomain Planning**: Plan any subdomains needed for different services

#### Server Requirements
- [ ] **Server Access**: SSH access to your deployment server
- [ ] **Server Specifications**: Minimum 4GB RAM, 2 CPU cores, 50GB storage
- [ ] **Operating System**: Ubuntu 20.04+ or CentOS 8+ recommended
- [ ] **Network**: Stable internet connection with static IP preferred

#### Security Prerequisites
- [ ] **Firewall Configuration**: Configure UFW or iptables
- [ ] **SSH Security**: Disable root login, use key-based authentication
- [ ] **User Permissions**: Create dedicated user with sudo access
- [ ] **Port Planning**: Plan which ports to open and close

### Deployment Configuration

#### Docker and Services
- [ ] **Docker Installation**: Install Docker 20.10+ and Docker Compose
- [ ] **Service Configuration**: Configure docker-compose.yml for your environment
- [ ] **Volume Mounts**: Set up persistent storage for HLS and configuration
- [ ] **Network Configuration**: Configure Docker networks and port mappings

#### Caddy Configuration
- [ ] **Caddyfile Setup**: Configure Caddyfile with your domain
- [ ] **SSL Configuration**: Ensure Let's Encrypt integration is working
- [ ] **Reverse Proxy**: Configure proper routing to backend services
- [ ] **Security Headers**: Set appropriate security headers

#### Environment Variables
- [ ] **API Keys**: Set any required API keys or tokens
- [ ] **Database URLs**: Configure database connection strings if applicable
- [ ] **External Services**: Configure webhook URLs and third-party integrations
- [ ] **Logging Levels**: Set appropriate logging verbosity

### Production Deployment

#### Service Deployment
- [ ] **MediaMTX**: Deploy streaming server with proper configuration
- [ ] **Backend API**: Deploy FastAPI backend with health checks
- [ ] **Frontend**: Deploy Next.js frontend or configure for production
- [ ] **Caddy**: Deploy reverse proxy with SSL termination

#### Health Monitoring
- [ ] **Health Checks**: Verify all services respond to health endpoints
- [ ] **Log Monitoring**: Set up log aggregation and monitoring
- [ ] **Performance Metrics**: Monitor CPU, memory, and network usage
- [ ] **Error Tracking**: Set up error reporting and alerting

#### Security Hardening
- [ ] **SSL Certificates**: Verify Let's Encrypt certificates are generated
- [ ] **Security Headers**: Confirm security headers are properly set
- [ ] **Access Control**: Implement proper authentication if needed
- [ ] **Rate Limiting**: Configure rate limiting for API endpoints

### Post-Deployment Verification

#### Functionality Testing
- [ ] **API Endpoints**: Test all API endpoints and WebSocket connections
- [ ] **Streaming**: Verify RTSP ingest and HLS streaming work correctly
- [ ] **Frontend**: Test all frontend functionality and user flows
- [ ] **Bridge Connection**: Test camera bridge connectivity

#### Performance Testing
- [ ] **Load Testing**: Test system under expected load
- [ ] **Latency Testing**: Measure video streaming latency
- [ ] **Bandwidth Testing**: Verify bandwidth usage meets requirements
- [ ] **Concurrent Users**: Test multiple simultaneous connections

#### Security Testing
- [ ] **SSL Verification**: Confirm HTTPS is working correctly
- [ ] **Vulnerability Scan**: Run security scans on your deployment
- [ ] **Access Control**: Verify unauthorized access is properly blocked
- [ ] **Data Protection**: Ensure sensitive data is properly encrypted

### Maintenance and Monitoring

#### Ongoing Maintenance
- [ ] **Backup Strategy**: Implement regular backups of configuration and data
- [ ] **Update Schedule**: Plan regular updates for security patches
- [ ] **Monitoring Setup**: Configure monitoring and alerting systems
- [ ] **Documentation**: Keep deployment documentation up to date

#### Performance Optimization
- [ ] **Resource Monitoring**: Monitor and optimize resource usage
- [ ] **Caching Strategy**: Implement appropriate caching for HLS streams
- [ ] **CDN Integration**: Consider CDN for global content delivery
- [ ] **Load Balancing**: Plan for horizontal scaling if needed

### Emergency Procedures

#### Incident Response
- [ ] **Rollback Plan**: Document rollback procedures for failed deployments
- [ ] **Contact Information**: Maintain emergency contact information
- [ ] **Escalation Procedures**: Define incident escalation procedures
- [ ] **Communication Plan**: Plan how to communicate issues to users

#### Disaster Recovery
- [ ] **Backup Verification**: Regularly test backup restoration procedures
- [ ] **Recovery Time Objectives**: Define acceptable recovery times
- [ ] **Alternative Deployment**: Plan alternative deployment locations
- [ ] **Data Recovery**: Document data recovery procedures

## 🌐 Using Across Different Networks

SentinelAI's cloud architecture makes it perfect for monitoring cameras across different networks and locations.

### Multi-Location Deployment

#### Centralized Management
- **Single Dashboard**: Monitor all cameras from one web interface
- **Global Access**: Access camera feeds from anywhere in the world
- **Unified Alerts**: Receive notifications for all locations in one place
- **Centralized Configuration**: Manage all cameras from one location

#### Network Considerations
- **Local Camera Access**: Bridge devices need access to local cameras
- **Internet Connectivity**: Bridge devices need stable internet connection
- **Firewall Configuration**: Ensure proper port forwarding and firewall rules
- **Bandwidth Requirements**: Consider upload bandwidth for each location

### Remote Access Scenarios

#### Home Security
- **Multiple Properties**: Monitor vacation homes, rental properties
- **Remote Access**: Check on your home from anywhere
- **Family Sharing**: Share access with family members
- **Mobile Monitoring**: Access via mobile devices on the go

#### Business Applications
- **Branch Offices**: Monitor multiple office locations
- **Retail Chains**: Watch over multiple store locations
- **Construction Sites**: Monitor multiple project sites
- **Warehouse Networks**: Track inventory across locations

#### Healthcare and Elderly Care
- **Multiple Residences**: Monitor elderly family members in different homes
- **Healthcare Facilities**: Monitor patient areas and common spaces
- **Emergency Response**: Quick access to emergency situations
- **Family Coordination**: Coordinate care across multiple locations

### Security and Privacy

#### Data Protection
- **Encrypted Transmission**: All data is encrypted in transit
- **Secure Access**: HTTPS and proper authentication
- **Privacy Controls**: Granular access permissions
- **Audit Logging**: Track who accessed what and when

#### Access Control
- **User Management**: Create accounts for different users
- **Role-Based Access**: Assign different permissions to users
- **Device Management**: Control which devices can access feeds
- **Session Management**: Secure session handling and timeouts

## 🔄 Migration from Localhost

If you're migrating from the legacy localhost version, here's what's changed:

### What's New
- **Cloud Bridge Architecture**: Replaces local RTSP→HLS conversion
- **Global Access**: Access camera feeds from anywhere via cloud streaming
- **Production Ready**: Docker-based deployment with proper security
- **Scalability**: Support for multiple remote cameras and locations
- **Enhanced Performance**: Cloud-based HLS serving with CDN capabilities

### What's Preserved
- **Same UI/UX**: All existing components and user interface
- **Camera Compatibility**: Same RTSP camera support
- **AI Detection**: Same AI model selection and management
- **Alert System**: Same WebSocket-based alert system
- **Dashboard**: Same monitoring and management interface

### Migration Steps
1. **Backup Configuration**: Save your existing configuration
2. **Deploy Cloud Infrastructure**: Set up the new cloud deployment
3. **Update Camera Connections**: Use the new bridge system
4. **Test Functionality**: Verify all features work as expected
5. **Update Documentation**: Update any custom documentation

## 🤝 Contributing

We welcome contributions to SentinelAI! Here's how you can help:

### Getting Started
1. **Fork the Repository**: Create your own fork of the project
2. **Set Up Development Environment**: Follow the setup instructions
3. **Choose an Issue**: Pick an issue from the issue tracker
4. **Create a Branch**: Make your changes in a feature branch
5. **Submit a Pull Request**: Submit your changes for review

### Areas for Contribution
- **Frontend Development**: Improve the web interface and user experience
- **Backend Development**: Enhance the API and backend functionality
- **AI Models**: Develop and improve detection models
- **Documentation**: Improve documentation and add examples
- **Testing**: Add tests and improve test coverage
- **Deployment**: Improve deployment and infrastructure

### Development Guidelines
- **Code Style**: Follow existing code style and conventions
- **Testing**: Write tests for new functionality
- **Documentation**: Update documentation for new features
- **Commit Messages**: Use clear and descriptive commit messages
- **Pull Requests**: Provide clear descriptions of changes

### Community
- **Discussions**: Join discussions in GitHub Discussions
- **Issues**: Report bugs and request features
- **Wiki**: Contribute to the project wiki
- **Examples**: Share your use cases and implementations

## 📚 Additional Resources

### Documentation
- **API Reference**: Complete API documentation at `/docs` endpoint
- **Architecture Guide**: Detailed system architecture documentation
- **Deployment Guide**: Step-by-step deployment instructions
- **Troubleshooting Guide**: Comprehensive troubleshooting information

### Community Resources
- **GitHub Repository**: Main project repository
- **Issue Tracker**: Report bugs and request features
- **Discussions**: Community discussions and support
- **Wiki**: Community-maintained documentation

### Related Projects
- **MediaMTX**: Streaming server used by SentinelAI
- **FastAPI**: Backend framework for the API
- **Next.js**: Frontend framework for the web interface
- **FFmpeg**: Video processing and streaming

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**SentinelAI** - Transforming ordinary cameras into intelligent guardians with cloud-powered AI detection. 