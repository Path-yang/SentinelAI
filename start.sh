#!/bin/bash

# Start script for SentinelAI
echo "🚀 Starting SentinelAI..."

# Check if MediaMTX is running
if ! curl -s http://localhost:8084/metrics > /dev/null; then
  echo "🔧 Starting MediaMTX for HLS streaming..."
  ./mediamtx &
  MEDIAMTX_PID=$!
  echo $MEDIAMTX_PID > mediamtx.pid
  sleep 2
fi

# Start stream configuration server
echo "🔧 Starting stream configuration server..."
node configure-stream.js &
STREAM_CONFIG_PID=$!
echo $STREAM_CONFIG_PID > streamconfig.pid

# Start backend server
echo "🔧 Starting backend server..."
cd apps/backend
source venv/bin/activate || { echo "❌ Failed to activate Python environment. Run 'cd apps/backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt' first"; exit 1; }
python simple_server.py &
BACKEND_PID=$!
echo $BACKEND_PID > ../../backend.pid
cd ../..

# Start frontend server
echo "🌐 Starting frontend server..."
pnpm dev:web &
FRONTEND_PID=$!

echo "✅ SentinelAI is running!"
echo "📊 Dashboard: http://localhost:3000/dashboard"
echo "🔌 API: http://localhost:10000"
echo "🔄 Stream Configuration API: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID $STREAM_CONFIG_PID $MEDIAMTX_PID; echo '👋 SentinelAI stopped'; exit" INT TERM

wait 