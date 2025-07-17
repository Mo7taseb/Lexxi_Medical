#!/usr/bin/env python3
"""
Test script to verify Whisper installation and basic functionality
"""

import sys
import os

def test_whisper_installation():
    """Test if Whisper is properly installed"""
    try:
        import whisper
        print("✅ Whisper is installed correctly")
        
        # Test model loading
        print("🔄 Testing model loading...")
        model = whisper.load_model("base")
        print("✅ Whisper base model loaded successfully")
        
        return True
    except ImportError:
        print("❌ Whisper is not installed")
        print("Run: pip install openai-whisper")
        return False
    except Exception as e:
        print(f"❌ Error loading Whisper: {e}")
        return False

def test_dependencies():
    """Test other required dependencies"""
    dependencies = ['torch', 'numpy']
    
    for dep in dependencies:
        try:
            __import__(dep)
            print(f"✅ {dep} is installed")
        except ImportError:
            print(f"❌ {dep} is not installed")
            return False
    
    return True

def main():
    print("🧪 Testing Lexxi Medical Setup")
    print("=" * 40)
    
    # Test Python version
    python_version = sys.version_info
    if python_version >= (3, 8):
        print(f"✅ Python {python_version.major}.{python_version.minor} is supported")
    else:
        print(f"❌ Python {python_version.major}.{python_version.minor} is too old. Requires Python 3.8+")
        return False
    
    # Test dependencies
    if not test_dependencies():
        return False
    
    # Test Whisper
    if not test_whisper_installation():
        return False
    
    print("\n🎉 All tests passed! Setup is complete.")
    print("\nNext steps:")
    print("1. Add your OpenAI API key to .env.local")
    print("2. Run 'npm run dev' to start the development server")
    print("3. Open http://localhost:3000 in your browser")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
