#!/bin/bash

# Start the frontend and backend services

echo "🚀 Starting SentinelAI..."
echo "🌐 Frontend will be available at: http://localhost:4000"
echo "🌐 Backend API will be available at: http://localhost:9000"
echo "🌐 API Documentation: http://localhost:9000/docs"

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

# Run the development services
echo "🔧 Starting development servers..."
pnpm dev:all 