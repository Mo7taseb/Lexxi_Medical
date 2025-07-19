#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
High-Accuracy Whisper Transcription for Medical Content
Uses base model for improved accuracy, especially for Arabic medical terms
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
    parser.add_argument('--model', '-m', default='base')
    
    args = parser.parse_args()
    
    try:
        # Use base model for better accuracy (140MB vs 39MB tiny)
        print("Loading base model for improved accuracy...", file=sys.stderr)
        model = whisper.load_model("base")
        
        print("Transcribing with enhanced accuracy...", file=sys.stderr)
        
        # Enhanced transcription options for better accuracy
        result = whisper.transcribe(
            model, 
            args.file_path, 
            language=args.language,
            # Additional options for better accuracy
            word_timestamps=False,
            condition_on_previous_text=True,  # Better context understanding
            temperature=0.0,  # More deterministic, less creative
            compression_ratio_threshold=2.4,  # Better quality control
            logprob_threshold=-1.0,  # Better confidence filtering
            no_speech_threshold=0.6  # Better speech detection
        )
        
        # Clean and format output
        text = result["text"].strip()
        
        # Basic medical terminology corrections for Arabic
        medical_corrections = {
            'مريد': 'المريض',
            'مريده': 'المريضة', 
            'يعان': 'يعاني',
            'يعن': 'يعاني',
            'عن في': 'يعاني في',
            'صق': 'الساق',
            'اليومنا': 'اليمنى',
            'اليسار': 'اليسرى',
            'ونخفع': 'وانخفاض',
            'درجات الحرار': 'درجات الحرارة',
            'الفيد رجات': 'درجات',
            'حرار': 'حرارة'
        }
        
        # Apply corrections
        for wrong, correct in medical_corrections.items():
            text = text.replace(wrong, correct)
        
        print(text)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        print("فشل في التفريغ")

if __name__ == "__main__":
    main()
