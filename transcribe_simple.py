#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple transcription script for API calls
"""

import whisper
import sys
import os
import codecs

# Ensure UTF-8 encoding for stdout/stderr
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer)

def main():
    if len(sys.argv) != 3:
        print("Usage: python transcribe_simple.py <audio_file> <language>", file=sys.stderr)
        sys.exit(1)
    
    audio_file = sys.argv[1]
    language = sys.argv[2]
    
    if not os.path.exists(audio_file):
        print(f"Error: Audio file not found: {audio_file}", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Load model
        model = whisper.load_model("base")
        
        # Transcribe
        result = model.transcribe(audio_file, language=language)
        
        # Clean and format the text
        text = result["text"].strip()
        
        # Output the result
        print(text)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
