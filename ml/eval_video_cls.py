import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import argparse
from sklearn.metrics import f1_score, accuracy_score, classification_report, confusion_matrix
import numpy as np
from tqdm import tqdm
import pytorchvideo.models.hub as hub
import seaborn as sns
import matplotlib.pyplot as plt
from train_video_cls import VideoDataset, get_model

def evaluate(model, dataloader, device):
    """Evaluate the model on the dataset."""
    model.eval()
    all_preds = []
    all_labels = []
    all_probs = []
    
    with torch.no_grad():
        pbar = tqdm(dataloader, desc="Evaluating")
        for inputs, labels in pbar:
            inputs = inputs.to(device)
            
            # Forward pass
            outputs = model(inputs)
            probs = torch.nn.functional.softmax(outputs, dim=1)
            
            # Get predictions
            _, preds = torch.max(outputs, 1)
            
            # Store results
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())
            all_probs.extend(probs.cpu().numpy())
    
    # Calculate metrics
    accuracy = accuracy_score(all_labels, all_preds)
    f1 = f1_score(all_labels, all_preds, average='weighted')
    
    # Generate classification report
    report = classification_report(all_labels, all_preds, target_names=['normal', 'fall'])
    
    # Generate confusion matrix
    cm = confusion_matrix(all_labels, all_preds)
    
    return accuracy, f1, report, cm, np.array(all_probs)

def plot_confusion_matrix(cm, class_names):
    """Plot confusion matrix."""
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Confusion Matrix')
    plt.savefig('confusion_matrix.png')
    plt.close()

def main():
    parser = argparse.ArgumentParser(description='Evaluate a video classification model')
    parser.add_argument('--checkpoint', type=str, required=True, help='Path to model checkpoint')
    parser.add_argument('--val', type=str, required=True, help='Path to validation CSV file')
    parser.add_argument('--batch_size', type=int, default=16, help='Batch size')
    
    args = parser.parse_args()
    
    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Load checkpoint
    checkpoint = torch.load(args.checkpoint, map_location=device)
    
    # Get model parameters from checkpoint
    model_name = checkpoint.get('model_name', 'x3d_xs')
    num_classes = checkpoint.get('num_classes', 2)
    frames = checkpoint.get('frames', 16)
    image_size = checkpoint.get('image_size', 224)
    
    # Create model and load weights
    model = get_model(model_name, num_classes)
    model.load_state_dict(checkpoint['model_state_dict'])
    model = model.to(device)
    
    # Create dataset and dataloader
    val_dataset = VideoDataset(args.val, frames=frames, image_size=image_size, mode='val')
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=4)
    
    # Evaluate model
    accuracy, f1, report, cm, probs = evaluate(model, val_loader, device)
    
    # Print results
    print(f"Accuracy: {accuracy:.4f}")
    print(f"F1 Score: {f1:.4f}")
    print("\nClassification Report:")
    print(report)
    
    # Plot confusion matrix
    plot_confusion_matrix(cm, class_names=['normal', 'fall'])
    print("Confusion matrix saved as 'confusion_matrix.png'")

if __name__ == "__main__":
    main() 