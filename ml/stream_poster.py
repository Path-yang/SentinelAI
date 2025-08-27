import os
import cv2
import time
import json
import requests
from datetime import datetime
import argparse
from typing import List, Dict, Any, Optional
import numpy as np
from infer_clip import load_model

def get_env_var(name: str, default: Optional[str] = None) -> str:
    """Get environment variable or use default value."""
    value = os.environ.get(name, default)
    if value is None:
        raise ValueError(f"Environment variable {name} is not set and no default provided")
    return value

def process_stream(rtsp_url: str, api_base: str, camera_id: str, threshold: float = 0.9, 
                   cooldown: int = 5, model_path: str = "model_x3d.ts", 
                   frames_to_collect: int = 16, visualize: bool = False) -> None:
    """
    Process RTSP stream and post anomaly events to API.
    
    Args:
        rtsp_url: RTSP stream URL
        api_base: Base URL for the API
        camera_id: Camera ID
        threshold: Confidence threshold for anomaly detection
        cooldown: Cooldown period between posts (seconds)
        model_path: Path to the model
        frames_to_collect: Number of frames to collect before prediction
        visualize: Whether to show visualization
    """
    print(f"Loading model from {model_path}")
    predictor = load_model(model_path)
    
    print(f"Connecting to RTSP stream: {rtsp_url}")
    cap = cv2.VideoCapture(rtsp_url)
    
    if not cap.isOpened():
        raise ValueError(f"Failed to open RTSP stream: {rtsp_url}")
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"Stream properties: {width}x{height} @ {fps} FPS")
    
    # Initialize variables
    frames = []
    last_post_time = 0
    frame_count = 0
    
    # Create window for visualization if requested
    if visualize:
        cv2.namedWindow("SentinelAI Stream", cv2.WINDOW_NORMAL)
        cv2.resizeWindow("SentinelAI Stream", 800, 600)
    
    print("Starting stream processing...")
    
    try:
        while True:
            # Read frame
            ret, frame = cap.read()
            
            if not ret:
                print("Failed to read frame, reconnecting...")
                # Try to reconnect
                cap.release()
                time.sleep(1)
                cap = cv2.VideoCapture(rtsp_url)
                continue
            
            # Add frame to buffer
            frames.append(frame.copy())
            frame_count += 1
            
            # Keep only the required number of frames
            if len(frames) > frames_to_collect:
                frames.pop(0)
            
            # When we have enough frames, make a prediction
            if len(frames) == frames_to_collect and frame_count % 15 == 0:  # Process every 15 frames
                # Make prediction
                label, confidence, bbox = predictor.predict_clip(frames)
                
                # Display prediction
                display_frame = frame.copy()
                text = f"{label}: {confidence:.2f}"
                cv2.putText(display_frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                
                # Draw bounding box if available
                if bbox:
                    x = int(bbox['x'] * width)
                    y = int(bbox['y'] * height)
                    w = int(bbox['width'] * width)
                    h = int(bbox['height'] * height)
                    cv2.rectangle(display_frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
                
                # Show frame if visualization is enabled
                if visualize:
                    cv2.imshow("SentinelAI Stream", display_frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                
                # If anomaly detected and confidence is above threshold
                current_time = time.time()
                if label != "normal" and confidence >= threshold and current_time - last_post_time >= cooldown:
                    # Create event payload
                    event = {
                        "camera_id": camera_id,
                        "type": label,
                        "confidence": float(confidence),
                        "timestamp": datetime.now().isoformat(),
                        "description": f"{label.capitalize()} detected with {confidence:.2f} confidence",
                        "bounding_box": bbox
                    }
                    
                    # Post to API
                    try:
                        response = requests.post(
                            f"{api_base}/events",
                            json=event,
                            headers={"Content-Type": "application/json"}
                        )
                        
                        if response.status_code == 200:
                            print(f"Posted: {label} event with confidence {confidence:.2f}")
                            last_post_time = current_time
                        else:
                            print(f"Failed to post event: {response.status_code} - {response.text}")
                    
                    except Exception as e:
                        print(f"Error posting event: {e}")
    
    except KeyboardInterrupt:
        print("Interrupted by user")
    
    finally:
        # Release resources
        cap.release()
        if visualize:
            cv2.destroyAllWindows()
        print("Stream processing stopped")

def main():
    parser = argparse.ArgumentParser(description="Process RTSP stream and post anomaly events to API")
    parser.add_argument("--rtsp_url", type=str, help="RTSP stream URL")
    parser.add_argument("--api_base", type=str, help="Base URL for the API")
    parser.add_argument("--camera_id", type=str, help="Camera ID")
    parser.add_argument("--threshold", type=float, default=0.9, help="Confidence threshold")
    parser.add_argument("--cooldown", type=int, default=5, help="Cooldown period between posts (seconds)")
    parser.add_argument("--model", type=str, default="model_x3d.ts", help="Path to the model")
    parser.add_argument("--visualize", action="store_true", help="Show visualization")
    
    args = parser.parse_args()
    
    # Get parameters from environment variables or command line arguments
    rtsp_url = args.rtsp_url or get_env_var("RTSP_URL")
    api_base = args.api_base or get_env_var("API_BASE")
    camera_id = args.camera_id or get_env_var("CAMERA_ID")
    threshold = args.threshold or float(get_env_var("THRESHOLD", "0.9"))
    
    process_stream(
        rtsp_url=rtsp_url,
        api_base=api_base,
        camera_id=camera_id,
        threshold=threshold,
        cooldown=args.cooldown,
        model_path=args.model,
        visualize=args.visualize
    )

if __name__ == "__main__":
    main() 