# Minimal LAN bridge: pull RTSP from camera, publish to cloud RTSP (MediaMTX)
# Usage:
#   python apps/bridge/bridge.py "rtsp://user:pass@192.168.x.x:554/..." "rtsp://stream.yourdomain.com:8554/cam-XXXX"
import subprocess, time, shlex, sys

def run(rtsp_in: str, publish_url: str):
    while True:
        cmd = f'ffmpeg -nostdin -rtsp_transport tcp -i "{rtsp_in}" -fflags +genpts -c:v copy -c:a aac -f rtsp {publish_url}'
        print("Running:", cmd, flush=True)
        p = subprocess.Popen(shlex.split(cmd))
        code = p.wait()
        print("FFmpeg exited", code, "- retrying in 3s", flush=True)
        time.sleep(3)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python apps/bridge/bridge.py <rtsp_in> <publish_url>")
        sys.exit(1)
    run(sys.argv[1], sys.argv[2]) 