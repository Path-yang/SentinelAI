from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional, Set
from pydantic import BaseModel
import json
from datetime import datetime
import os
import uuid

class Event(BaseModel):
    id: str = None
    camera_id: str
    type: str  # e.g., "fall", "immobility", "unusual_behavior"
    confidence: float  # 0.0 to 1.0
    timestamp: str
    description: Optional[str] = None
    bounding_box: Optional[Dict[str, float]] = None  # x, y, width, height as normalized coordinates

# In-memory storage for the prototype
events: List[Dict] = []

app = FastAPI(title="SentinelAI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Connection might be closed or errored
                pass

manager = ConnectionManager()

@app.get("/")
def read_root():
    return {"message": "Welcome to SentinelAI API"}

@app.get("/events")
def get_events():
    return {"events": events}

@app.post("/events")
async def create_event(event_data: Event):
    # If no ID is provided, generate one
    if not event_data.id:
        event_data.id = str(uuid.uuid4())
    
    event_dict = event_data.dict()
    events.append(event_dict)
    
    # Keep only the most recent 100 events
    if len(events) > 100:
        events.pop(0)
    
    # Broadcast to all connected WebSocket clients
    await manager.broadcast(json.dumps({"type": "new_event", "data": event_dict}))
    
    return {"status": "success", "event": event_dict}

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Just keep the connection open
            data = await websocket.receive_text()
            # You can handle client messages here if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/sample_event")
async def create_sample_event():
    """Endpoint to generate a sample event for testing purposes"""
    sample_event = Event(
        id=str(uuid.uuid4()),
        camera_id="camera_living_room",
        type="fall",
        confidence=0.95,
        timestamp=datetime.now().isoformat(),
        description="Possible fall detected in living room",
        bounding_box={"x": 0.4, "y": 0.3, "width": 0.2, "height": 0.4}
    )
    
    event_dict = sample_event.dict()
    events.append(event_dict)
    
    # Keep only the most recent 100 events
    if len(events) > 100:
        events.pop(0)
    
    # Broadcast to all connected WebSocket clients
    await manager.broadcast(json.dumps({"type": "new_event", "data": event_dict}))
    
    return {"status": "success", "event": event_dict}

# Add some sample events for demo purposes
@app.on_event("startup")
def startup_db_client():
    events.append({
        "id": "1",
        "camera_id": "camera_bedroom",
        "type": "immobility",
        "confidence": 0.89,
        "timestamp": (datetime.now().isoformat()),
        "description": "Extended immobility detected on bed"
    })
    
    events.append({
        "id": "2",
        "camera_id": "camera_living_room",
        "type": "fall",
        "confidence": 0.92,
        "timestamp": (datetime.now().isoformat()),
        "description": "Possible fall detected near sofa"
    })

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True) 