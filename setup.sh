#!/bin/bash

echo "🚀 Setting up SentinelAI..."

# Detect OS and architecture
OS="$(uname -s)"
ARCH="$(uname -m)"

# Function to download MediaMTX
download_mediamtx() {
  echo "📥 Downloading MediaMTX..."
  
  MEDIAMTX_VERSION="1.5.0"
  
  if [ "$OS" = "Darwin" ]; then
    if [ "$ARCH" = "arm64" ]; then
      # macOS ARM64 (Apple Silicon)
      MEDIAMTX_URL="https://github.com/bluenviron/mediamtx/releases/download/v${MEDIAMTX_VERSION}/mediamtx_v${MEDIAMTX_VERSION}_darwin_arm64.tar.gz"
    else
      # macOS Intel
      MEDIAMTX_URL="https://github.com/bluenviron/mediamtx/releases/download/v${MEDIAMTX_VERSION}/mediamtx_v${MEDIAMTX_VERSION}_darwin_amd64.tar.gz"
    fi
  elif [ "$OS" = "Linux" ]; then
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
      # Linux ARM64
      MEDIAMTX_URL="https://github.com/bluenviron/mediamtx/releases/download/v${MEDIAMTX_VERSION}/mediamtx_v${MEDIAMTX_VERSION}_linux_arm64.tar.gz"
    else
      # Linux AMD64
      MEDIAMTX_URL="https://github.com/bluenviron/mediamtx/releases/download/v${MEDIAMTX_VERSION}/mediamtx_v${MEDIAMTX_VERSION}_linux_amd64.tar.gz"
    fi
  else
    echo "❌ Unsupported operating system: $OS"
    exit 1
  fi
  
  # Download and extract MediaMTX
  curl -L -o mediamtx.tar.gz "$MEDIAMTX_URL"
  tar -xzf mediamtx.tar.gz mediamtx
  rm mediamtx.tar.gz
  
  # Make it executable
  chmod +x mediamtx
  
  echo "✅ MediaMTX downloaded successfully"
}

# Function to set up the backend
setup_backend() {
  echo "🔧 Setting up backend..."
  
  cd apps/backend
  
  # Create virtual environment if it doesn't exist
  if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
  fi
  
  # Activate virtual environment
  source venv/bin/activate
  
  # Upgrade pip to latest version
  echo "📦 Upgrading pip..."
  pip install --upgrade pip
  
  # Install dependencies with flexible versioning for Python 3.13 compatibility
  echo "📦 Installing Python dependencies..."
  pip install flask flask-cors fastapi uvicorn websockets python-multipart
  
  cd ../..
  
  echo "✅ Backend setup completed"
}

# Function to set up the frontend
setup_frontend() {
  echo "🔧 Setting up frontend..."
  
  # Install Node.js dependencies
  echo "📦 Installing Node.js dependencies..."
  npm install
  
  # Create .env.local if it doesn't exist
  if [ ! -f "apps/web/.env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp apps/web/env.example apps/web/.env.local
  fi
  
  echo "✅ Frontend setup completed"
}

# Function to set up the stream configuration server
setup_stream_config() {
  echo "🔧 Setting up stream configuration server..."
  
  # Install required Node.js packages
  echo "📦 Installing stream configuration server dependencies..."
  npm install cors express js-yaml
  
  echo "✅ Stream configuration server setup completed"
}

# Main setup process
echo "🔍 Checking for MediaMTX..."
if [ ! -f "mediamtx" ]; then
  download_mediamtx
else
  echo "✅ MediaMTX already exists"
fi

setup_backend
setup_frontend
setup_stream_config

echo "🎉 Setup completed successfully!"
echo ""
echo "To start the application, run:"
echo "  ./start.sh"
echo ""
echo "Then open http://localhost:3000/dashboard in your browser" 