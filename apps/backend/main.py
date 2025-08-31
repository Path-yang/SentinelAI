from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse, JSONResponse
import os, time, uuid, jwt, urllib.parse

app = FastAPI()
JWT_SECRET = os.getenv("SENTINEL_JWT_SECRET", "change-me-please-32-chars-min")
STREAM_DOMAIN = os.getenv("STREAM_DOMAIN", "54.206.49.163")
BASE_RTSP_PORT = int(os.getenv("BASE_RTSP_PORT", "8554"))

def issue_token(camera_id: str, role: str, ttl_sec: int = 3600):
  now = int(time.time())
  payload = {"cameraId": camera_id, "role": role, "iat": now, "exp": now + ttl_sec}
  return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

@app.get("/health")
def health():
  return {"ok": True, "ts": int(time.time())}

# Minimal provisioning endpoint (dev/demo). In prod, add auth & DB.

@app.get("/api/provision")
def provision(label: str = "cam"):
  cam_id = f"cam-{uuid.uuid4().hex[:8]}"
  pub_token = issue_token(cam_id, "publish", 3600)
  # NOTE: HLS is served by Caddy (static), so viewing is not gated here (MVP).
  publish_url = f"rtsp://{STREAM_DOMAIN}:{BASE_RTSP_PORT}/{cam_id}?token={pub_token}"
  hls_url = f"http://{STREAM_DOMAIN}/hls/{cam_id}/index.m3u8"
  return {"cameraId": cam_id, "publishUrl": publish_url, "hlsUrl": hls_url}

# MediaMTX auth hook: allow publish if token valid + matches path.

@app.post("/mediamtx/auth")
async def mediamtx_auth(request: Request):
  form = await request.form()
  # MediaMTX sends fields like: ip, user, path, protocol, action, query, id
  action = form.get("action", "")
  path = form.get("path", "").lstrip("/")  # e.g., "cam-xxxx"
  raw_query = form.get("query", "")  # e.g., "token=...."
  q = dict(urllib.parse.parse_qsl(raw_query))
  token = q.get("token") or form.get("token")
  if action == "publish":
    try:
      data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
      if data.get("cameraId") != path or data.get("role") != "publish":
        return PlainTextResponse("forbidden", status_code=401)
      return PlainTextResponse("ok", status_code=200)
    except Exception:
      return PlainTextResponse("bad token", status_code=401)
  # For MVP we allow reads (HLS is served by Caddy static anyway)
  return PlainTextResponse("ok", status_code=200)

# Nice root splash for quick check

@app.get("/")
def root():
  return JSONResponse({"ok": True, "docs": "/docs", "health": "/health"})