#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Backup transcription script using the existing transcribe.py logic
"""

import whisper
import sys
import os
import codecs
import re

# Ensure UTF-8 encoding for stdout/stderr
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer)

def clean_and_format_text(text):
    """Clean and format transcribed text for medical use"""
    
    # Basic cleaning
    text = text.strip()
    
    # Split by common Arabic words and phrases that typically start new sentences
    sentences = re.split(r'\s+(نعم|هل|كيف|ما|لا|ثم|بعد|السلام|شكرا|ولكن|من فضلك|أن|وأن)', text)
    
    # Reconstruct sentences by combining split parts
    formatted_sentences = []
    i = 0
    while i < len(sentences):
        if i + 1 < len(sentences) and sentences[i+1] in ['نعم', 'هل', 'كيف', 'ما', 'لا', 'ثم', 'بعد', 'السلام', 'شكرا', 'ولكن', 'من فضليك', 'أن', 'وأن']:
            # Combine current part with the next keyword and following text
            if i + 2 < len(sentences):
                combined = sentences[i] + ' ' + sentences[i+1] + ' ' + sentences[i+2]
                formatted_sentences.append(combined.strip())
                i += 3
            else:
                combined = sentences[i] + ' ' + sentences[i+1]
                formatted_sentences.append(combined.strip())
                i += 2
        else:
            if sentences[i].strip():
                formatted_sentences.append(sentences[i].strip())
            i += 1
    
    # If no good splits found, split by approximate length for readability
    if len(formatted_sentences) <= 2:
        words = text.split()
        formatted_sentences = []
        chunk_size = 12  # Approximate words per line for better readability
        
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i+chunk_size])
            if chunk.strip():
                formatted_sentences.append(chunk.strip())
    
    return '\n'.join(formatted_sentences)

def main():
    if len(sys.argv) != 3:
        print("Usage: python transcribe_backup.py <audio_file> <language>", file=sys.stderr)
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
        
        # Get and format the text
        text = result["text"]
        formatted_text = clean_and_format_text(text)
        
        # Output the result
        print(formatted_text)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
