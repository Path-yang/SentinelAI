from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime
import uuid
import threading
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory storage for the prototype
events = []

# Add some sample events
events.append({
    "id": str(uuid.uuid4()),
    "cameraId": "camera_bedroom",
    "type": "immobility",
    "confidence": 0.89,
    "timestamp": datetime.now().isoformat(),
    "description": "Extended immobility detected on bed"
})
    
events.append({
    "id": str(uuid.uuid4()),
    "cameraId": "camera_living_room",
    "type": "fall",
    "confidence": 0.92,
    "timestamp": datetime.now().isoformat(),
    "description": "Possible fall detected near sofa"
})

@app.route("/", methods=["GET"])
def read_root():
    return jsonify({"message": "Welcome to SentinelAI API"})

@app.route("/events", methods=["GET"])
def get_events():
    return jsonify({"events": events})

@app.route("/events", methods=["POST"])
def create_event():
    event_data = request.json
    
    # If no ID is provided, generate one
    if "id" not in event_data or not event_data["id"]:
        event_data["id"] = str(uuid.uuid4())
    
    events.append(event_data)
    return jsonify({"status": "success", "event": event_data})

@app.route("/sample_event", methods=["GET"])
def create_sample_event():
    """Endpoint to generate a sample event for testing purposes"""
    sample_event = {
        "id": str(uuid.uuid4()),
        "cameraId": "camera_living_room",
        "type": "fall",
        "confidence": 0.95,
        "timestamp": datetime.now().isoformat(),
        "description": "Possible fall detected in living room"
    }
    
    events.append(sample_event)
    return jsonify({"status": "success", "event": sample_event})

if __name__ == "__main__":
    print("🚀 Starting SentinelAI API Server...")
    print("🌐 API is running at http://127.0.0.1:10000")
    print("🌐 API Documentation is not available in this simplified version")
    app.run(host="127.0.0.1", port=10000, debug=True) 