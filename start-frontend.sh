#!/bin/bash

# Start script for SentinelAI frontend
echo "🚀 Starting SentinelAI frontend..."

# Start frontend server
echo "🌐 Starting frontend server on http://localhost:3000"
pnpm dev:web

# Keep terminal open
echo "👋 Frontend stopped" 