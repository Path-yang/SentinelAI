from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import secrets, time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SentinelAI Backend",
    description="AI-powered camera monitoring system backend",
    version="1.0.0"
)

# Improved CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://*.vercel.app",
        "https://*.vercel.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,  # Cache preflight for 24 hours
)

EVENTS: list[dict] = []
CLIENTS: set[WebSocket] = set()

class Event(BaseModel):
    camera_id: str
    type: str
    confidence: float
    timestamp: int | None = None
    snapshot_url: str | None = None

class BridgeReq(BaseModel):
    camera_label: str | None = None

@app.get("/")
async def root():
    return {"message": "SentinelAI Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": int(time.time())}

@app.post("/events")
async def post_event(ev: Event):
    try:
        ev.timestamp = ev.timestamp or int(time.time())
        data = ev.dict()
        EVENTS.append(data)
        
        # Clean up old events (keep only last 1000)
        if len(EVENTS) > 1000:
            EVENTS[:] = EVENTS[-1000:]
        
        # Broadcast to all connected WebSocket clients
        disconnected_clients = set()
        for ws in CLIENTS:
            try:
                await ws.send_json(data)
            except Exception as e:
                logger.warning(f"Failed to send to WebSocket client: {e}")
                disconnected_clients.add(ws)
        
        # Remove disconnected clients
        CLIENTS.difference_update(disconnected_clients)
        
        logger.info(f"Event posted: {ev.type} from camera {ev.camera_id}")
        return {"ok": True, "event_id": len(EVENTS)}
        
    except Exception as e:
        logger.error(f"Error posting event: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/events")
async def get_events(limit: int = 50):
    if limit > 100:
        limit = 100  # Prevent excessive data retrieval
    
    try:
        events = list(reversed(EVENTS[-limit:]))
        return {"events": events, "total": len(EVENTS), "returned": len(events)}
    except Exception as e:
        logger.error(f"Error retrieving events: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.websocket("/ws/alerts")
async def ws_alerts(ws: WebSocket):
    await ws.accept()
    CLIENTS.add(ws)
    client_id = id(ws)
    logger.info(f"WebSocket client connected: {client_id}")
    
    try:
        while True:
            # Keep connection alive and handle any incoming messages
            data = await ws.receive_text()
            if data == "ping":
                await ws.send_text("pong")
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected: {client_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        CLIENTS.discard(ws)
        logger.info(f"WebSocket client removed: {client_id}")

@app.post("/bridge/session")
async def bridge_session(req: BridgeReq):
    try:
        cam_id = "cam-" + secrets.token_urlsafe(6)
        publish_url = f"rtsp://STREAM_DOMAIN:8554/{cam_id}"
        hls_url = f"https://STREAM_DOMAIN/hls/{cam_id}/index.m3u8"
        
        session_data = {
            "camera_id": cam_id, 
            "publish_url": publish_url, 
            "hls_url": hls_url,
            "created_at": int(time.time()),
            "label": req.camera_label or "Unnamed Camera"
        }
        
        logger.info(f"Bridge session created: {cam_id}")
        return session_data
        
    except Exception as e:
        logger.error(f"Error creating bridge session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create bridge session")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000) 