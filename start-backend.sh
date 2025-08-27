#!/bin/bash

# Start script for SentinelAI backend
echo "🚀 Starting SentinelAI backend..."

# Start backend server
cd apps/backend
source venv/bin/activate || { echo "❌ Failed to activate Python environment. Run 'cd apps/backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt' first"; exit 1; }
echo "🔧 Starting backend server on http://localhost:10000"
python main.py

# Keep terminal open
echo "�� Backend stopped" 