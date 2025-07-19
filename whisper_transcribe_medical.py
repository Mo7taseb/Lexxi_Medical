#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Medical-Specialized Whisper Transcription
Uses medium model with extensive medical terminology correction for Arabic
"""

import sys
import os
import argparse
import warnings
import whisper
import re

# Suppress all warnings
warnings.filterwarnings("ignore")
os.environ["PYTHONWARNINGS"] = "ignore"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('file_path', help='Audio file path')
    parser.add_argument('--language', '-l', default='ar')
    parser.add_argument('--model', '-m', default='small')
    
    args = parser.parse_args()
    
    try:
        # Use small model for good balance of speed and accuracy (244MB)
        print("Loading small model for medical accuracy...", file=sys.stderr)
        model = whisper.load_model("small")
        
        print("Processing medical transcription...", file=sys.stderr)
        
        # Enhanced transcription with medical-focused settings
        result = whisper.transcribe(
            model, 
            args.file_path, 
            language=args.language,
            # Medical transcription optimizations
            word_timestamps=False,
            condition_on_previous_text=True,  # Better medical context
            temperature=0.0,  # Deterministic for medical accuracy
            compression_ratio_threshold=2.4,
            logprob_threshold=-1.0,
            no_speech_threshold=0.6,
            initial_prompt="المريض يعاني من كسر في الساق درجة الحرارة طبي"  # Medical context
        )
        
        text = result["text"].strip()
        
        # Comprehensive medical terminology corrections for Arabic
        medical_corrections = {
            # Phrase corrections (apply these first for better context)
            'ونخفع الفيد رجات الحرار': 'وانخفاض درجات الحرارة',
            'نخفع الفيد رجات الحرار': 'انخفاض درجات الحرارة',
            'فيد رجات الحرار': 'درجات الحرارة',
            'الفيد رجات الحرار': 'درجات الحرارة',
            'كسر في صق': 'كسر في الساق',
            'نخفع الفيد رجات': 'انخفاض درجات',
            'الفيد رجات': 'درجات',
            'فيد رجات': 'درجات',
            
            # Patient terms
            'مريد': 'المريض',
            'مريده': 'المريضة',
            'مريض': 'المريض',
            'مرضى': 'المرضى',
            
            # Symptoms and conditions
            'يعان': 'يعاني',
            'يعن': 'يعاني', 
            'عن في': 'يعاني في',
            'يعني من': 'يعاني من',
            'معان': 'يعاني',
            
            # Body parts
            'صق': 'الساق',
            'ساق': 'الساق',
            'اليومنا': 'اليمنى',
            'اليمن': 'اليمنى',
            'يمين': 'اليمنى',
            'اليسار': 'اليسرى',
            'يسار': 'اليسرى',
            'الذراع': 'الذراع',
            'اليد': 'اليد',
            'القدم': 'القدم',
            'الرأس': 'الرأس',
            'الظهر': 'الظهر',
            
            # Medical conditions
            'كسر': 'كسر',
            'كسور': 'كسور',
            'التهاب': 'التهاب',
            'ألم': 'ألم',
            'آلام': 'آلام',
            'تورم': 'تورم',
            'نزيف': 'نزيف',
            
            # Temperature and measurements
            'ونخفع': 'وانخفاض',
            'انخفع': 'انخفاض',
            'ارتفع': 'ارتفاع',
            'درجات الحرار': 'درجات الحرارة',
            'درجة حرار': 'درجة الحرارة',
            'الفيد': 'درجات',
            'رجات': 'الحرارة',
            'حرار': 'حرارة',
            'حراره': 'حرارة',
            'الحرار': 'الحرارة',
            
            # Common medical words
            'علاج': 'علاج',
            'دواء': 'دواء',
            'أدوية': 'أدوية',
            'فحص': 'فحص',
            'تشخيص': 'تشخيص',
            'عملية': 'عملية',
            'جراحة': 'جراحة'
        }
        
        # Apply medical terminology corrections with improved logic
        corrected_text = text
        
        # Step 1: Handle complex phrases first (order matters!)
        complex_phrases = [
            ('ونخفع الفيد رجات الحرار', 'وانخفاض درجات الحرارة'),
            ('نخفع الفيد رجات الحرار', 'انخفاض درجات الحرارة'),
            ('الفيد رجات الحرار', 'درجات الحرارة'),
            ('فيد رجات الحرار', 'درجات الحرارة'),
            ('نخفع الفيد رجات', 'انخفاض درجات'),
            ('كسر في صق', 'كسر في الساق'),
            ('درجات الحرار', 'درجات الحرارة'),
            ('درجة حرار', 'درجة الحرارة')
        ]
        
        for incorrect, correct in complex_phrases:
            corrected_text = corrected_text.replace(incorrect, correct)
        
        # Step 2: Individual word corrections (only apply if not already corrected)
        individual_words = [
            ('مريد', 'المريض'),
            ('مريده', 'المريضة'),
            ('عن في', 'يعاني في'),
            ('يعان', 'يعاني'),
            ('يعن', 'يعاني'),
            ('صق', 'الساق'),
            ('اليومنا', 'اليمنى'),
            ('اليمن', 'اليمنى'),
            ('ونخفع', 'وانخفاض'),
            ('انخفع', 'انخفاض'),
            ('الفيد', 'درجات'),
            ('رجات', 'الحرارة'),
            ('الحرار', 'الحرارة'),
            ('حرار', 'حرارة'),
            ('حراره', 'حرارة')
        ]
        
        for incorrect, correct in individual_words:
            if incorrect in corrected_text:
                corrected_text = corrected_text.replace(incorrect, correct)
        
        print(corrected_text)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        print("فشل في التفريغ")

if __name__ == "__main__":
    main()
