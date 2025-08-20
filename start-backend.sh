#!/bin/bash

echo "🚀 Starting SentinelAI Backend..."
echo "🌐 Backend API will be available at: http://127.0.0.1:9000"
echo "🌐 API Documentation: http://127.0.0.1:9000/docs"

# Check if we're in a virtual environment already
if [[ -z "$VIRTUAL_ENV" ]]; then
  # We're not in a virtual environment
  if [ -d "apps/backend/venv" ]; then
    echo "📦 Activating Python virtual environment..."
    source apps/backend/venv/bin/activate
  else
    echo "❌ Backend virtual environment not found. Please set up the environment first."
    exit 1
  fi
fi

cd apps/backend
python main.py 