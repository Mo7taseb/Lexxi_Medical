#!/usr/bin/env python3
"""
Setup script for Lexxi Medical App
Installs required Python dependencies
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🏥 Setting up Lexxi Medical App")
    print("=" * 40)
    
    # Check Python version
    python_version = sys.version_info
    if python_version < (3, 8):
        print(f"❌ Python {python_version.major}.{python_version.minor} is too old. Requires Python 3.8+")
        return False
    
    print(f"✅ Python {python_version.major}.{python_version.minor} is supported")
    
    # Install requirements
    dependencies = [
        ("pip install openai-whisper", "Installing OpenAI Whisper"),
        ("pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu", "Installing PyTorch (CPU version)"),
    ]
    
    for command, description in dependencies:
        if not run_command(command, description):
            return False
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Add your OpenAI API key to .env.local:")
    print("   OPENAI_API_KEY=your_api_key_here")
    print("2. Run 'npm run dev' to start the development server")
    print("3. Open http://localhost:3000 in your browser")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
