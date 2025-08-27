import os
import pandas as pd
import random
import argparse
from typing import List, Dict, Tuple

def find_videos(base_dir: str, extensions: List[str] = ['.mp4', '.avi', '.mov']) -> Dict[str, List[str]]:
    """
    Find all video files in the given directory and its subdirectories.
    
    Args:
        base_dir: Base directory to search
        extensions: List of video file extensions to include
        
    Returns:
        Dictionary mapping class names to lists of video paths
    """
    videos = {}
    
    for root, _, files in os.walk(base_dir):
        # Get class name from directory name
        class_name = os.path.basename(root)
        
        # Skip the base directory itself
        if class_name == os.path.basename(base_dir):
            continue
        
        # Initialize list for this class if it doesn't exist
        if class_name not in videos:
            videos[class_name] = []
        
        # Add all video files
        for file in files:
            if any(file.lower().endswith(ext) for ext in extensions):
                videos[class_name].append(os.path.join(root, file))
    
    return videos

def split_dataset(videos: Dict[str, List[str]], train_ratio: float = 0.7, val_ratio: float = 0.15) -> Tuple[List[Dict], List[Dict], List[Dict]]:
    """
    Split videos into train, validation, and test sets.
    
    Args:
        videos: Dictionary mapping class names to lists of video paths
        train_ratio: Ratio of videos to use for training
        val_ratio: Ratio of videos to use for validation
        
    Returns:
        Tuple of (train_data, val_data, test_data) where each is a list of dicts with 'path' and 'label' keys
    """
    train_data = []
    val_data = []
    test_data = []
    
    # Create a mapping from class names to numeric labels
    class_to_label = {name: i for i, name in enumerate(sorted(videos.keys()))}
    
    for class_name, paths in videos.items():
        # Shuffle paths
        random.shuffle(paths)
        
        # Calculate split indices
        n_videos = len(paths)
        n_train = int(n_videos * train_ratio)
        n_val = int(n_videos * val_ratio)
        
        # Split paths
        train_paths = paths[:n_train]
        val_paths = paths[n_train:n_train + n_val]
        test_paths = paths[n_train + n_val:]
        
        # Get numeric label
        label = class_to_label[class_name]
        
        # Add to datasets
        for path in train_paths:
            train_data.append({'path': os.path.abspath(path), 'label': label})
        
        for path in val_paths:
            val_data.append({'path': os.path.abspath(path), 'label': label})
        
        for path in test_paths:
            test_data.append({'path': os.path.abspath(path), 'label': label})
    
    return train_data, val_data, test_data

def save_csv(data: List[Dict], output_path: str) -> None:
    """Save data to CSV file."""
    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    print(f"Saved {len(data)} samples to {output_path}")

def main():
    parser = argparse.ArgumentParser(description='Create dataset split for video classification')
    parser.add_argument('--data_dir', type=str, required=True, help='Path to data directory')
    parser.add_argument('--output_dir', type=str, default='.', help='Directory to save CSV files')
    parser.add_argument('--train_ratio', type=float, default=0.7, help='Ratio of videos to use for training')
    parser.add_argument('--val_ratio', type=float, default=0.15, help='Ratio of videos to use for validation')
    parser.add_argument('--seed', type=int, default=42, help='Random seed')
    
    args = parser.parse_args()
    
    # Set random seed
    random.seed(args.seed)
    
    # Find videos
    print(f"Finding videos in {args.data_dir}...")
    videos = find_videos(args.data_dir)
    
    # Print class statistics
    for class_name, paths in videos.items():
        print(f"Found {len(paths)} videos for class '{class_name}'")
    
    # Split dataset
    print("Splitting dataset...")
    train_data, val_data, test_data = split_dataset(videos, args.train_ratio, args.val_ratio)
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Save CSV files
    save_csv(train_data, os.path.join(args.output_dir, 'train.csv'))
    save_csv(val_data, os.path.join(args.output_dir, 'val.csv'))
    save_csv(test_data, os.path.join(args.output_dir, 'test.csv'))
    
    print("Done!")

if __name__ == "__main__":
    main() 