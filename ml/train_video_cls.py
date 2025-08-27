import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import numpy as np
import os
import cv2
import random
import argparse
from tqdm import tqdm
from sklearn.metrics import f1_score, accuracy_score
import pytorchvideo.models.hub as hub
from torchvision.transforms import Compose, Lambda, Normalize
from typing import List, Tuple, Dict, Optional

# Define video dataset class
class VideoDataset(Dataset):
    def __init__(self, csv_file, frames=16, image_size=224, mode='train'):
        """
        Args:
            csv_file (str): Path to the csv file with video paths and labels.
            frames (int): Number of frames to sample from each video.
            image_size (int): Size to resize frames to.
            mode (str): 'train' or 'val' to determine augmentation strategy.
        """
        self.data = pd.read_csv(csv_file)
        self.frames = frames
        self.image_size = image_size
        self.mode = mode
        
        # Normalization values for Kinetics dataset (used in pretrained models)
        self.mean = [0.45, 0.45, 0.45]
        self.std = [0.225, 0.225, 0.225]
        
    def __len__(self):
        return len(self.data)
    
    def sample_frames(self, video_path: str) -> List[np.ndarray]:
        """Sample frames from a video file."""
        cap = cv2.VideoCapture(video_path)
        
        # Get video properties
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        if frame_count <= 0:
            raise ValueError(f"Failed to open video or empty video: {video_path}")
            
        # Sample frames uniformly
        indices = np.linspace(0, frame_count - 1, self.frames, dtype=int)
        
        # Read the frames
        frames = []
        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if not ret:
                # If failed to read frame, create a black frame
                frame = np.zeros((self.image_size, self.image_size, 3), dtype=np.uint8)
            frames.append(frame)
            
        cap.release()
        return frames
    
    def preprocess_frames(self, frames: List[np.ndarray]) -> torch.Tensor:
        """Preprocess frames for the model."""
        processed_frames = []
        
        for frame in frames:
            # Convert BGR to RGB
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Resize
            frame = cv2.resize(frame, (self.image_size, self.image_size))
            
            # Simple augmentation for training
            if self.mode == 'train':
                # Random horizontal flip with 50% probability
                if random.random() > 0.5:
                    frame = cv2.flip(frame, 1)  # 1 for horizontal flip
                
                # Random brightness and contrast adjustment
                alpha = 1.0 + random.uniform(-0.1, 0.1)  # Contrast
                beta = random.uniform(-10, 10)  # Brightness
                frame = cv2.convertScaleAbs(frame, alpha=alpha, beta=beta)
            
            # Normalize to [0, 1]
            frame = frame.astype(np.float32) / 255.0
            
            # Apply mean and std normalization
            frame = (frame - self.mean) / self.std
            
            # HWC to CHW format
            frame = frame.transpose(2, 0, 1)
            
            processed_frames.append(frame)
            
        # Stack frames: (C, T, H, W)
        video_tensor = np.stack(processed_frames, axis=1)
        
        return torch.from_numpy(video_tensor).float()
    
    def __getitem__(self, idx):
        video_path = self.data.iloc[idx]['path']
        label = self.data.iloc[idx]['label']
        
        # Sample and preprocess frames
        frames = self.sample_frames(video_path)
        video_tensor = self.preprocess_frames(frames)
        
        return video_tensor, torch.tensor(label, dtype=torch.long)

def get_model(model_name: str, num_classes: int) -> nn.Module:
    """
    Load a pretrained X3D model and modify the head for our num_classes.
    
    Args:
        model_name: One of 'x3d_xs', 'x3d_s', 'x3d_m'
        num_classes: Number of output classes
        
    Returns:
        Modified X3D model
    """
    if model_name == 'x3d_xs':
        model = hub.x3d_xs(pretrained=True)
    elif model_name == 'x3d_s':
        model = hub.x3d_s(pretrained=True)
    elif model_name == 'x3d_m':
        model = hub.x3d_m(pretrained=True)
    else:
        raise ValueError(f"Unsupported model: {model_name}")
    
    # Replace the classification head
    in_features = model.blocks[5].proj.in_features
    model.blocks[5].proj = nn.Linear(in_features, num_classes)
    
    return model

def train_epoch(model, dataloader, criterion, optimizer, device):
    """Train for one epoch."""
    model.train()
    running_loss = 0.0
    all_preds = []
    all_labels = []
    
    pbar = tqdm(dataloader, desc="Training")
    for inputs, labels in pbar:
        inputs = inputs.to(device)
        labels = labels.to(device)
        
        # Zero the parameter gradients
        optimizer.zero_grad()
        
        # Forward pass
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        
        # Backward pass and optimize
        loss.backward()
        optimizer.step()
        
        # Statistics
        running_loss += loss.item() * inputs.size(0)
        _, preds = torch.max(outputs, 1)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())
        
        # Update progress bar
        pbar.set_postfix({'loss': loss.item()})
    
    epoch_loss = running_loss / len(dataloader.dataset)
    epoch_acc = accuracy_score(all_labels, all_preds)
    epoch_f1 = f1_score(all_labels, all_preds, average='weighted')
    
    return epoch_loss, epoch_acc, epoch_f1

def validate(model, dataloader, criterion, device):
    """Validate the model."""
    model.eval()
    running_loss = 0.0
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        pbar = tqdm(dataloader, desc="Validation")
        for inputs, labels in pbar:
            inputs = inputs.to(device)
            labels = labels.to(device)
            
            # Forward pass
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
            # Statistics
            running_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            
            # Update progress bar
            pbar.set_postfix({'loss': loss.item()})
    
    val_loss = running_loss / len(dataloader.dataset)
    val_acc = accuracy_score(all_labels, all_preds)
    val_f1 = f1_score(all_labels, all_preds, average='weighted')
    
    return val_loss, val_acc, val_f1

def main():
    parser = argparse.ArgumentParser(description='Train a video classification model')
    parser.add_argument('--train', type=str, required=True, help='Path to train CSV file')
    parser.add_argument('--val', type=str, required=True, help='Path to validation CSV file')
    parser.add_argument('--epochs', type=int, default=10, help='Number of epochs to train for')
    parser.add_argument('--model', type=str, choices=['x3d_xs', 'x3d_s', 'x3d_m'], default='x3d_xs', 
                        help='Model architecture to use')
    parser.add_argument('--num_classes', type=int, default=2, help='Number of classes')
    parser.add_argument('--batch_size', type=int, default=8, help='Batch size')
    parser.add_argument('--lr', type=float, default=0.001, help='Learning rate')
    parser.add_argument('--frames', type=int, default=16, help='Number of frames to sample')
    parser.add_argument('--image_size', type=int, default=224, help='Image size')
    
    args = parser.parse_args()
    
    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Create datasets
    train_dataset = VideoDataset(args.train, frames=args.frames, image_size=args.image_size, mode='train')
    val_dataset = VideoDataset(args.val, frames=args.frames, image_size=args.image_size, mode='val')
    
    # Create dataloaders
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=4)
    
    # Get model
    model = get_model(args.model, args.num_classes)
    model = model.to(device)
    
    # Define loss function and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr)
    
    # Learning rate scheduler
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=3, verbose=True)
    
    # Training loop
    best_val_acc = 0.0
    for epoch in range(args.epochs):
        print(f"Epoch {epoch+1}/{args.epochs}")
        
        # Train
        train_loss, train_acc, train_f1 = train_epoch(model, train_loader, criterion, optimizer, device)
        print(f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.4f}, Train F1: {train_f1:.4f}")
        
        # Validate
        val_loss, val_acc, val_f1 = validate(model, val_loader, criterion, device)
        print(f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}, Val F1: {val_f1:.4f}")
        
        # Update learning rate
        scheduler.step(val_loss)
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_acc': val_acc,
                'val_f1': val_f1,
                'model_name': args.model,
                'num_classes': args.num_classes,
                'frames': args.frames,
                'image_size': args.image_size,
            }, 'ckpt.pth')
            print(f"Saved new best model with validation accuracy: {val_acc:.4f}")
    
    print(f"Training complete. Best validation accuracy: {best_val_acc:.4f}")

if __name__ == "__main__":
    main() 