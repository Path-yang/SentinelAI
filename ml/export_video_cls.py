import torch
import torch.nn as nn
import argparse
import os
import pytorchvideo.models.hub as hub
from train_video_cls import get_model

def export_torchscript(model, input_shape, output_path):
    """Export model to TorchScript format."""
    # Create example input
    example_input = torch.randn(input_shape)
    
    # Trace the model
    traced_model = torch.jit.trace(model, example_input)
    
    # Save the traced model
    traced_model.save(output_path)
    
    print(f"TorchScript model saved to {output_path}")
    return traced_model

def export_onnx(model, input_shape, output_path):
    """Export model to ONNX format."""
    # Create example input
    example_input = torch.randn(input_shape)
    
    # Export the model
    torch.onnx.export(
        model,                  # model being run
        example_input,          # model input (or a tuple for multiple inputs)
        output_path,            # where to save the model
        export_params=True,     # store the trained parameter weights inside the model file
        opset_version=12,       # the ONNX version to export the model to
        do_constant_folding=True,  # whether to execute constant folding for optimization
        input_names=['input'],  # the model's input names
        output_names=['output'],  # the model's output names
        dynamic_axes={
            'input': {0: 'batch_size'},  # variable length axes
            'output': {0: 'batch_size'}
        }
    )
    
    print(f"ONNX model saved to {output_path}")

def main():
    parser = argparse.ArgumentParser(description='Export video classification model to TorchScript and ONNX')
    parser.add_argument('--checkpoint', type=str, required=True, help='Path to model checkpoint')
    parser.add_argument('--output_dir', type=str, default='.', help='Directory to save exported models')
    
    args = parser.parse_args()
    
    # Set device
    device = torch.device("cpu")  # Use CPU for export
    print(f"Using device: {device}")
    
    # Load checkpoint
    checkpoint = torch.load(args.checkpoint, map_location=device)
    
    # Get model parameters from checkpoint
    model_name = checkpoint.get('model_name', 'x3d_xs')
    num_classes = checkpoint.get('num_classes', 2)
    frames = checkpoint.get('frames', 16)
    image_size = checkpoint.get('image_size', 224)
    
    print(f"Model: {model_name}")
    print(f"Number of classes: {num_classes}")
    print(f"Frames: {frames}")
    print(f"Image size: {image_size}")
    
    # Create model and load weights
    model = get_model(model_name, num_classes)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()  # Set model to evaluation mode
    
    # Define input shape: (batch_size, channels, frames, height, width)
    input_shape = (1, 3, frames, image_size, image_size)
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Export to TorchScript
    torchscript_path = os.path.join(args.output_dir, 'model_x3d.ts')
    traced_model = export_torchscript(model, input_shape, torchscript_path)
    
    # Export to ONNX
    onnx_path = os.path.join(args.output_dir, 'model_x3d.onnx')
    export_onnx(model, input_shape, onnx_path)
    
    print("Export complete!")

if __name__ == "__main__":
    main() 