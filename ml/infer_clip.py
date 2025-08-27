import torch
import cv2
import numpy as np
from typing import List, Tuple, Dict, Optional
import os

# Define class labels
LABELS = {0: "normal", 1: "fall"}

class VideoPredictor:
    def __init__(self, model_path: str, frames: int = 16, image_size: int = 224):
        """
        Initialize the video predictor.
        
        Args:
            model_path: Path to the TorchScript model
            frames: Number of frames to sample
            image_size: Size to resize frames to
        """
        self.model = torch.jit.load(model_path)
        self.model.eval()
        self.frames = frames
        self.image_size = image_size
        
        # Normalization values for Kinetics dataset (used in pretrained models)
        self.mean = [0.45, 0.45, 0.45]
        self.std = [0.225, 0.225, 0.225]
        
        print(f"Model loaded from {model_path}")
    
    def preprocess_frames(self, frames_bgr: List[np.ndarray]) -> torch.Tensor:
        """
        Preprocess frames for the model.
        
        Args:
            frames_bgr: List of BGR frames
            
        Returns:
            Preprocessed tensor of shape (1, 3, frames, height, width)
        """
        processed_frames = []
        
        for frame in frames_bgr:
            # Convert BGR to RGB
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Resize
            frame = cv2.resize(frame, (self.image_size, self.image_size))
            
            # Normalize to [0, 1]
            frame = frame.astype(np.float32) / 255.0
            
            # Apply mean and std normalization
            frame = (frame - self.mean) / self.std
            
            # HWC to CHW format
            frame = frame.transpose(2, 0, 1)
            
            processed_frames.append(frame)
        
        # Stack frames: (C, T, H, W)
        video_tensor = np.stack(processed_frames, axis=1)
        
        # Add batch dimension: (B, C, T, H, W)
        video_tensor = np.expand_dims(video_tensor, axis=0)
        
        return torch.from_numpy(video_tensor).float()
    
    def predict_clip(self, frames_bgr: List[np.ndarray]) -> Tuple[str, float, Optional[Dict[str, float]]]:
        """
        Predict the class of a video clip.
        
        Args:
            frames_bgr: List of BGR frames
            
        Returns:
            Tuple of (label, confidence, bounding_box)
            bounding_box is a dictionary with keys 'x', 'y', 'width', 'height' as normalized coordinates
        """
        # Check if we have enough frames
        if len(frames_bgr) < self.frames:
            raise ValueError(f"Not enough frames. Expected at least {self.frames}, got {len(frames_bgr)}")
        
        # If we have more frames than needed, sample uniformly
        if len(frames_bgr) > self.frames:
            indices = np.linspace(0, len(frames_bgr) - 1, self.frames, dtype=int)
            frames_bgr = [frames_bgr[i] for i in indices]
        
        # Preprocess frames
        input_tensor = self.preprocess_frames(frames_bgr)
        
        # Run inference
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probs = torch.nn.functional.softmax(outputs, dim=1)[0]
            
            # Get prediction
            pred_idx = torch.argmax(probs).item()
            pred_label = LABELS[pred_idx]
            confidence = probs[pred_idx].item()
            
            # For demonstration purposes, if it's a fall, return a placeholder bounding box
            # In a real system, this would come from an object detection model
            bounding_box = None
            if pred_label != "normal" and confidence >= 0.5:
                # Placeholder bounding box in the center of the frame
                bounding_box = {
                    "x": 0.4,       # Normalized x coordinate of the top-left corner
                    "y": 0.3,       # Normalized y coordinate of the top-left corner
                    "width": 0.2,   # Normalized width
                    "height": 0.4   # Normalized height
                }
            
            return pred_label, confidence, bounding_box

def load_model(model_path: str = "model_x3d.ts") -> VideoPredictor:
    """
    Load the video prediction model.
    
    Args:
        model_path: Path to the TorchScript model
        
    Returns:
        VideoPredictor instance
    """
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    
    return VideoPredictor(model_path)

# Example usage
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Run inference on a video clip')
    parser.add_argument('--model', type=str, default='model_x3d.ts', help='Path to the model')
    parser.add_argument('--video', type=str, required=True, help='Path to the video file')
    parser.add_argument('--output', type=str, default=None, help='Path to save the output video with visualization')
    
    args = parser.parse_args()
    
    # Load model
    predictor = load_model(args.model)
    
    # Open video
    cap = cv2.VideoCapture(args.video)
    
    # Get video properties
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # Setup output video if requested
    out = None
    if args.output:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(args.output, fourcc, fps, (width, height))
    
    # Process video in chunks of 16 frames
    frames = []
    frame_idx = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frames.append(frame)
        frame_idx += 1
        
        # When we have enough frames, make a prediction
        if len(frames) == predictor.frames:
            label, confidence, bbox = predictor.predict_clip(frames)
            
            # Print prediction
            print(f"Frame {frame_idx}: {label} ({confidence:.2f})")
            
            # Visualize prediction on the last frame
            if bbox:
                x = int(bbox['x'] * width)
                y = int(bbox['y'] * height)
                w = int(bbox['width'] * width)
                h = int(bbox['height'] * height)
                
                # Draw bounding box
                cv2.rectangle(frames[-1], (x, y), (x + w, y + h), (0, 0, 255), 2)
            
            # Add text with prediction
            text = f"{label}: {confidence:.2f}"
            cv2.putText(frames[-1], text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            # Write frames to output video
            if out:
                for frame in frames:
                    out.write(frame)
            
            # Reset frames list, but keep some overlap for smooth prediction
            frames = frames[8:]  # Keep half of the frames for overlap
    
    # Process any remaining frames
    if frames and len(frames) >= predictor.frames // 2:
        # Pad with the last frame if needed
        while len(frames) < predictor.frames:
            frames.append(frames[-1])
        
        label, confidence, bbox = predictor.predict_clip(frames)
        
        # Print prediction
        print(f"Final frames: {label} ({confidence:.2f})")
        
        # Visualize prediction on the last frame
        if bbox:
            x = int(bbox['x'] * width)
            y = int(bbox['y'] * height)
            w = int(bbox['width'] * width)
            h = int(bbox['height'] * height)
            
            # Draw bounding box
            cv2.rectangle(frames[-1], (x, y), (x + w, y + h), (0, 0, 255), 2)
        
        # Add text with prediction
        text = f"{label}: {confidence:.2f}"
        cv2.putText(frames[-1], text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        # Write frames to output video
        if out:
            for frame in frames:
                out.write(frame)
    
    # Release resources
    cap.release()
    if out:
        out.release()
    
    print("Inference complete!") 