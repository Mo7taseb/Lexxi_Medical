#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enhanced Whisper Transcription Script for Lexxi Medical App
Supports both Arabic and English transcription with medical-specific formatting
"""

import whisper
import sys
import os
import argparse
import re
import codecs
from datetime import datetime

# Ensure UTF-8 encoding for stdout/stderr
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer)

def clean_and_format_text(text, language='ar'):
    """Clean and format transcribed text for medical use"""
    
    # Basic cleaning
    text = text.strip()
    
    if language == 'ar':
        # Arabic-specific cleaning and formatting
        # Split by common Arabic medical phrases
        sentences = re.split(r'\s+(نعم|هل|كيف|ما|لا|ثم|بعد|السلام|شكرا|ولكن|من فضلك|أن|وأن|الطبيب|المريض|الأعراض|العلاج)', text)
        
        # Reconstruct sentences
        formatted_sentences = []
        i = 0
        while i < len(sentences):
            if i + 1 < len(sentences) and sentences[i+1] in ['نعم', 'هل', 'كيف', 'ما', 'لا', 'ثم', 'بعد', 'السلام', 'شكرا', 'ولكن', 'من فضلك', 'أن', 'وأن', 'الطبيب', 'المريض', 'الأعراض', 'العلاج']:
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
        
        # If no good splits found, split by approximate length
        if len(formatted_sentences) <= 2:
            words = text.split()
            formatted_sentences = []
            chunk_size = 15
            
            for i in range(0, len(words), chunk_size):
                chunk = ' '.join(words[i:i+chunk_size])
                if chunk.strip():
                    formatted_sentences.append(chunk.strip())
        
        # Join with proper spacing
        return '\n'.join(formatted_sentences)
    
    else:
        # English formatting
        # Split by sentences
        sentences = re.split(r'[.!?]+', text)
        formatted_sentences = [s.strip() for s in sentences if s.strip()]
        return '\n'.join(formatted_sentences)

def transcribe_audio(file_path, language='ar', model_size='base'):
    """Transcribe audio file using Whisper"""
    
    try:
        # Load Whisper model
        print(f"Loading Whisper model: {model_size}", file=sys.stderr)
        model = whisper.load_model(model_size)
        
        # Transcribe
        print(f"Transcribing audio: {file_path}", file=sys.stderr)
        result = model.transcribe(file_path, language=language)
        
        # Get raw text
        raw_text = result["text"]
        
        # Clean and format
        formatted_text = clean_and_format_text(raw_text, language)
        
        return formatted_text
        
    except Exception as e:
        print(f"Transcription error: {str(e)}", file=sys.stderr)
        raise

def main():
    parser = argparse.ArgumentParser(description='Transcribe audio using Whisper')
    parser.add_argument('file_path', help='Path to audio file')
    parser.add_argument('--language', '-l', default='ar', help='Language code (ar, en)')
    parser.add_argument('--model', '-m', default='base', help='Whisper model size')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.file_path):
        print(f"Error: File not found: {args.file_path}", file=sys.stderr)
        sys.exit(1)
    
    try:
        transcript = transcribe_audio(args.file_path, args.language, args.model)
        print(transcript)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
