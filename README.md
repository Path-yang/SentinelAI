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
- **In-memory storage** (for prototype)

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
NEXT_PUBLIC_API_URL=http://localhost:10000
NEXT_PUBLIC_WS_URL=ws://localhost:10000/ws/alerts
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

#### 3. Access Your HLS Stream

Once MediaMTX is running, your HLS stream will be available at:
```
http://YOUR_SERVER_IP:8084/mystream/index.m3u8
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

## 🚀 Running the Application

### Start the Backend

```bash
cd apps/backend
source venv/bin/activate
python simple_server.py
```

### Start the Frontend

```bash
pnpm dev:web
```

### Start the Stream Processor

```bash
cd ml
API_BASE=http://localhost:10000 RTSP_URL="rtsp://<camera-ip>/stream" CAMERA_ID=cam-001 python ml/stream_poster.py
```

### Access the Dashboard

Open http://localhost:3000/dashboard to see the live stream, alerts panel, toast notifications, and overlay rectangle when a fall is detected.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 