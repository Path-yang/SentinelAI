#!/usr/bin/env python3
"""
SentinelAI Bridge Script
Minimal LAN bridge: pull RTSP from camera, publish to cloud RTSP (MediaMTX)

Usage:
    python apps/bridge/bridge.py "rtsp://user:pass@192.168.x.x:554/..." "rtsp://stream.yourdomain.com:8554/cam-XXXX"

Requirements:
    - FFmpeg installed and accessible in PATH
    - Python 3.7+
"""

import subprocess
import time
import shlex
import sys
import signal
import logging
from typing import Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BridgeRunner:
    def __init__(self, rtsp_in: str, publish_url: str):
        self.rtsp_in = rtsp_in
        self.publish_url = publish_url
        self.process: Optional[subprocess.Popen] = None
        self.running = True
        self.retry_count = 0
        self.max_retries = 10
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info(f"Received signal {signum}, shutting down...")
        self.running = False
        if self.process:
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                logger.warning("FFmpeg didn't terminate gracefully, forcing...")
                self.process.kill()
    
    def _build_ffmpeg_command(self) -> list:
        """Build the FFmpeg command with proper arguments"""
        return [
            'ffmpeg',
            '-nostdin',
            '-rtsp_transport', 'tcp',
            '-i', self.rtsp_in,
            '-fflags', '+genpts',
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-f', 'rtsp',
            '-rtsp_transport', 'tcp',
            '-timeout', '5000000',  # 5 second timeout
            self.publish_url
        ]
    
    def _check_ffmpeg(self) -> bool:
        """Check if FFmpeg is available"""
        try:
            result = subprocess.run(['ffmpeg', '-version'], 
                                  capture_output=True, text=True, timeout=10)
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False
    
    def run(self):
        """Main run loop with error handling and retries"""
        if not self._check_ffmpeg():
            logger.error("FFmpeg not found! Please install FFmpeg and ensure it's in your PATH")
            sys.exit(1)
        
        logger.info(f"Starting bridge: {self.rtsp_in} -> {self.publish_url}")
        
        while self.running and self.retry_count < self.max_retries:
            try:
                cmd = self._build_ffmpeg_command()
                logger.info(f"Running FFmpeg (attempt {self.retry_count + 1}/{self.max_retries})")
                logger.debug(f"Command: {' '.join(cmd)}")
                
                self.process = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                
                # Monitor the process
                while self.running and self.process.poll() is None:
                    time.sleep(1)
                
                if self.process.returncode is not None:
                    logger.warning(f"FFmpeg exited with code {self.process.returncode}")
                    
                    # Check if it's a graceful shutdown
                    if not self.running:
                        break
                    
                    self.retry_count += 1
                    if self.retry_count >= self.max_retries:
                        logger.error(f"Max retries ({self.max_retries}) reached. Giving up.")
                        break
                    
                    wait_time = min(3 * self.retry_count, 30)  # Exponential backoff, max 30s
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                
            except KeyboardInterrupt:
                logger.info("Interrupted by user")
                break
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                self.retry_count += 1
                time.sleep(5)
        
        logger.info("Bridge stopped")

def main():
    if len(sys.argv) != 3:
        print("Usage: python apps/bridge/bridge.py <rtsp_in> <publish_url>")
        print("\nExample:")
        print('  python apps/bridge/bridge.py "rtsp://user:pass@192.168.1.100:554/stream" "rtsp://stream.yourdomain.com:8554/cam-XXXX"')
        sys.exit(1)
    
    rtsp_in = sys.argv[1]
    publish_url = sys.argv[2]
    
    # Validate URLs
    if not rtsp_in.startswith('rtsp://'):
        logger.error("Input URL must be an RTSP URL")
        sys.exit(1)
    
    if not publish_url.startswith('rtsp://'):
        logger.error("Publish URL must be an RTSP URL")
        sys.exit(1)
    
    try:
        runner = BridgeRunner(rtsp_in, publish_url)
        runner.run()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 