# SentinelAI

![SentinelAI Logo](https://placehold.co/600x200/1a1a2e/ffffff?text=SentinelAI)

## 🚀 Project Overview

**SentinelAI transforms ordinary commercial cameras into smart anomaly detectors.**

Using advanced AI technology, SentinelAI connects to any commercial IP camera via RTSP or HLS streams, analyzes video feeds in real-time for anomalies, and broadcasts instant alerts to web and mobile clients.

### 🔍 Use Cases

- **Elderly Care**: Detect falls, unusual immobility, or distress signals
- **Pet Monitoring**: Identify unusual behavior or signs of distress
- **Health Monitoring**: Alert on sudden collapses, seizures, or other medical emergencies
- **Industrial Safety**: Spot equipment malfunctions, safety hazards, or unauthorized access

## ✨ Key Features

- **Camera Integration**: Connect to any commercial IP camera via RTSP or HLS streams
- **Automatic RTSP to HLS Conversion**: Built-in conversion for browser compatibility
- **Intelligent Anomaly Detection**: Identify unusual events and behaviors
- **Instant Alerts**: Receive notifications via WebSockets when anomalies are detected
- **Intuitive Dashboard**: Monitor all cameras and review alerts in one place
- **Responsive Design**: Works on desktop and mobile devices
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
- **FastAPI/Flask** (Python)
- **WebSockets** for real-time communication
- **In-memory storage** (for prototype)

### Stream Processing
- **MediaMTX** for RTSP to HLS conversion
- **Express.js** for stream configuration API

### ML
- **PyTorch** for deep learning
- **PyTorchVideo** for video models
- **X3D** architecture for video classification
- **OpenCV** for video processing

### Infrastructure
- **pnpm** monorepo with workspaces

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+
- npm or pnpm 8+
- Python 3.8+
- curl (for downloading MediaMTX)

### Quick Setup (Recommended)

The easiest way to set up SentinelAI is to use the provided setup script:

```bash
# Make the script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

This script will:
1. Download MediaMTX for your operating system
2. Set up the Python virtual environment
3. Install all dependencies for the backend, frontend, and stream configuration server
4. Create necessary configuration files

### Manual Installation

If you prefer to set up manually, follow these steps:

1. Clone the repository
```bash
git clone https://github.com/yourusername/SentinelAI.git
cd SentinelAI
```

2. Download MediaMTX
```bash
# For macOS (Apple Silicon)
curl -L -o mediamtx.tar.gz https://github.com/bluenviron/mediamtx/releases/download/v1.5.0/mediamtx_v1.5.0_darwin_arm64.tar.gz

# For macOS (Intel)
curl -L -o mediamtx.tar.gz https://github.com/bluenviron/mediamtx/releases/download/v1.5.0/mediamtx_v1.5.0_darwin_amd64.tar.gz

# For Linux (AMD64)
curl -L -o mediamtx.tar.gz https://github.com/bluenviron/mediamtx/releases/download/v1.5.0/mediamtx_v1.5.0_linux_amd64.tar.gz

# Extract and make executable
tar -xzf mediamtx.tar.gz mediamtx
chmod +x mediamtx
rm mediamtx.tar.gz
```

3. Install frontend dependencies
```bash
npm install
```

4. Install stream configuration server dependencies
```bash
npm install cors express js-yaml
```

5. Set up backend environment
```bash
cd apps/backend
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

6. Create environment variables
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

This script will start:
1. MediaMTX for RTSP to HLS conversion
2. Stream configuration server
3. Backend server
4. Frontend server

### Manual Start

If you prefer to start the services manually:

1. Start MediaMTX
```bash
./mediamtx
```

2. Start the stream configuration server
```bash
node configure-stream.js
```

3. Start the backend
```bash
cd apps/backend
source venv/bin/activate
python simple_server.py
```

4. Start the frontend
```bash
npm run dev:web
# or with pnpm
pnpm dev:web
```

### Access the Application

Once all services are running, access the application at:

- **Dashboard**: http://localhost:3000/dashboard
- **Camera Connection**: http://localhost:3000/camera
- **Backend API**: http://localhost:10000
- **Stream Configuration API**: http://localhost:3001

## 📹 Camera Connection Guide

SentinelAI supports both RTSP and HLS camera streams:

### Connecting an RTSP Camera

1. Navigate to http://localhost:3000/camera
2. Enter your RTSP URL (e.g., rtsp://192.168.1.100:554/stream1)
3. Enter your username and password if required
4. Enter a stream name (e.g., living_room)
5. Click "Connect"

The application will automatically:
- Configure MediaMTX with your RTSP URL
- Convert the RTSP stream to HLS
- Display the stream in your browser

### Connecting an HLS Camera

1. Navigate to http://localhost:3000/camera
2. Enter your HLS URL (e.g., http://example.com/stream.m3u8)
3. Enter your username and password if required
4. Click "Connect"

### Testing with a Sample Stream

For testing purposes, you can use this public RTSP test stream:
```
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
```

## 🤖 ML Model Training

### Dataset Preparation

1. Place your videos in the appropriate directories:
```
/datasets/fall/    # Fall videos
/datasets/normal/  # Normal videos
```

2. Generate dataset splits:
```bash
python ml/create_dataset_split.py --data_dir datasets --output_dir ml
```

### Training

Train the model:
```bash
python ml/train_video_cls.py --train ml/train.csv --val ml/val.csv --epochs 5 --model x3d_m --num_classes 2
```

### Evaluation

Evaluate the model:
```bash
python ml/eval_video_cls.py --checkpoint ckpt.pth --val ml/val.csv
```

### Export

Export the model for inference:
```bash
python ml/export_video_cls.py --checkpoint ckpt.pth
```

## 🔧 Troubleshooting

### Stream Configuration Issues

If you encounter issues with the stream configuration:

1. Check that the stream configuration server is running:
```bash
curl http://localhost:3001/api/status
```

2. Verify that MediaMTX is running:
```bash
ps aux | grep mediamtx
```

3. Check the MediaMTX logs:
```bash
cat mediamtx.log
```

### Camera Connection Issues

If you cannot connect to your camera:

1. Verify that your camera is accessible from your network
2. Check that the RTSP URL is correct
3. Ensure your username and password are correct
4. Try connecting with a different media player (e.g., VLC)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 