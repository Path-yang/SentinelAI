from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import secrets, time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app", "https://*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EVENTS: list[dict] = []
CLIENTS: set[WebSocket] = set()

class Event(BaseModel):
    camera_id: str
    type: str
    confidence: float
    timestamp: int | None = None
    snapshot_url: str | None = None

@app.post("/events")
async def post_event(ev: Event):
    ev.timestamp = ev.timestamp or int(time.time())
    data = ev.dict()
    EVENTS.append(data)
    for ws in list(CLIENTS):
        try:
            await ws.send_json(data)
        except Exception:
            CLIENTS.discard(ws)
    return {"ok": True}

@app.get("/events")
async def get_events(limit: int = 50):
    return list(reversed(EVENTS[-limit:]))

@app.websocket("/ws/alerts")
async def ws_alerts(ws: WebSocket):
    await ws.accept()
    CLIENTS.add(ws)
    try:
        while True:
            await ws.receive_text()  # keepalive
    except WebSocketDisconnect:
        CLIENTS.discard(ws)

class BridgeReq(BaseModel):
    camera_label: str | None = None

@app.post("/bridge/session")
async def bridge_session(_: BridgeReq):
    cam_id = "cam-" + secrets.token_urlsafe(6)
    publish_url = f"rtsp://STREAM_DOMAIN:8554/{cam_id}"
    hls_url     = f"https://STREAM_DOMAIN/hls/{cam_id}/index.m3u8"
    return {"camera_id": cam_id, "publish_url": publish_url, "hls_url": hls_url} 