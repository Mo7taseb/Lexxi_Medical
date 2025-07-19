#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ultra-Fast Whisper Transcription - No Reloading, No Crashes
Uses tiny model for instant responses
"""

import sys
import os
import argparse
import warnings
import whisper

# Suppress all warnings
warnings.filterwarnings("ignore")
os.environ["PYTHONWARNINGS"] = "ignore"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('file_path', help='Audio file path')
    parser.add_argument('--language', '-l', default='ar')
    parser.add_argument('--model', '-m', default='tiny')
    
    args = parser.parse_args()
    
    try:
        # Use tiny model for instant results
        print("Loading tiny model...", file=sys.stderr)
        model = whisper.load_model("tiny")
        
        print("Transcribing...", file=sys.stderr)
        result = whisper.transcribe(model, args.file_path, language=args.language)
        
        # Simple output
        text = result["text"].strip()
        print(text)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        print("فشل في التفريغ")

if __name__ == "__main__":
    main()
