#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Full GPU-Accelerated Whisper Transcription Script for Maximum Accuracy
Uses OpenAI Whisper directly with PyTorch CUDA for best performance and accuracy
"""

import sys
import os
import argparse
import re
import codecs
import torch
import whisper
from datetime import datetime
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore")

# Ensure UTF-8 encoding for stdout/stderr
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer)

def check_gpu_acceleration():
    """Check and report GPU acceleration status"""
    if torch.cuda.is_available():
        print(f"✓ GPU Acceleration: ENABLED", file=sys.stderr)
        print(f"✓ GPU Device: {torch.cuda.get_device_name(0)}", file=sys.stderr)
        print(f"✓ GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB", file=sys.stderr)
        print(f"✓ CUDA Version: {torch.version.cuda}", file=sys.stderr)
        return True
    else:
        print("✗ GPU Acceleration: DISABLED", file=sys.stderr)
        return False

def clean_and_format_text_enhanced(text, language='ar'):
    """Enhanced text cleaning and formatting for medical transcriptions"""
    
    # Basic cleaning
    text = text.strip()
    
    if language == 'ar':
        # Enhanced Arabic medical vocabulary
        medical_keywords = [
            # Greetings
            'السلام عليكم', 'أهلا', 'مرحبا', 'تفضل',
            # Medical terms
            'المريض', 'الطبيب', 'الدكتور', 'العيادة', 'المستشفى',
            'الأعراض', 'العلاج', 'الدواء', 'الحبوب', 'الإبرة',
            'الألم', 'الوجع', 'الصداع', 'الدوخة', 'الغثيان',
            'الحرارة', 'السعال', 'ضيق التنفس', 'خفقان',
            'الضغط', 'السكر', 'القلب', 'الكبد', 'الكلى',
            'الصدر', 'البطن', 'الظهر', 'الرقبة', 'الكتف',
            'الفحص', 'التحليل', 'الأشعة', 'التشخيص',
            # Question words
            'كيف', 'متى', 'أين', 'ماذا', 'لماذا', 'هل',
            # Responses
            'نعم', 'لا', 'بلى', 'ممكن', 'طبعا', 'أكيد',
            # Time expressions
            'اليوم', 'أمس', 'غدا', 'الصباح', 'المساء', 'الليل',
            'دقيقة', 'ساعة', 'يوم', 'أسبوع', 'شهر',
        ]
        
        # Create sentence boundaries based on medical context
        text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
        
        # Split on strong punctuation or medical phrase boundaries
        sentences = []
        current_sentence = ""
        words = text.split()
        
        for i, word in enumerate(words):
            current_sentence += word + " "
            
            # Check if this word ends a logical medical phrase
            if (any(keyword in current_sentence for keyword in medical_keywords) and 
                len(current_sentence.split()) >= 5) or \
               (word.endswith(('.', '?', '!')) or 
                i == len(words) - 1 or
                len(current_sentence.split()) >= 15):
                
                sentences.append(current_sentence.strip())
                current_sentence = ""
        
        # If we have a remaining sentence, add it
        if current_sentence.strip():
            sentences.append(current_sentence.strip())
        
        # Clean up sentences
        cleaned_sentences = []
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 3 and not sentence.isspace():
                # Remove duplicate words that sometimes occur in transcription
                words = sentence.split()
                cleaned_words = []
                prev_word = ""
                for word in words:
                    if word != prev_word:
                        cleaned_words.append(word)
                    prev_word = word
                cleaned_sentences.append(" ".join(cleaned_words))
        
        return '\n'.join(cleaned_sentences)
    
    else:
        # English formatting with medical context
        sentences = re.split(r'[.!?]+', text)
        formatted_sentences = []
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 3:
                formatted_sentences.append(sentence)
        return '\n'.join(formatted_sentences)

def transcribe_with_full_gpu(file_path, language='ar', model_size='medium'):
    """Transcribe audio using OpenAI Whisper with full GPU acceleration"""
    
    # Check GPU status
    gpu_available = check_gpu_acceleration()
    
    try:
        # Set device
        device = "cuda" if gpu_available else "cpu"
        
        # Load Whisper model with specific device
        print(f"Loading Whisper model: {model_size} on {device}...", file=sys.stderr)
        model = whisper.load_model(model_size, device=device)
        
        # Verify model is on GPU
        if gpu_available:
            print(f"✓ Model loaded on GPU: {next(model.parameters()).device}", file=sys.stderr)
        
        # Enhanced transcription options for medical accuracy
        print(f"Transcribing with enhanced medical settings...", file=sys.stderr)
        
        # Set medical-specific prompt for better context
        if language == 'ar':
            initial_prompt = "هذا تسجيل طبي بين طبيب ومريض يتضمن الأعراض والتشخيص والعلاج"
        else:
            initial_prompt = "This is a medical recording between doctor and patient discussing symptoms, diagnosis and treatment"
        
        # Transcribe with enhanced settings for accuracy
        result = whisper.transcribe(
            model, 
            file_path,
            language=language,
            task="transcribe",
            # Enhanced parameters for medical accuracy
            beam_size=5,               # Higher beam size for better accuracy
            best_of=5,                # Consider more candidates
            temperature=0.0,          # Lower temperature for consistent results
            compression_ratio_threshold=2.4,  # Filter repetitive segments
            logprob_threshold=-1.0,   # Filter low-probability segments
            no_speech_threshold=0.6,  # Better silence detection
            condition_on_previous_text=True,  # Use context
            initial_prompt=initial_prompt,
            # Additional accuracy parameters
            fp16=gpu_available,       # Use half precision on GPU for speed
            verbose=False             # Reduce console output
        )
        
        # Extract and format text
        raw_text = result["text"]
        formatted_text = clean_and_format_text_enhanced(raw_text, language)
        
        # Print performance info
        audio_duration = len(result.get("segments", [])) * 30  # Estimate
        print(f"✓ Transcription completed successfully", file=sys.stderr)
        print(f"✓ Language detected: {result.get('language', 'unknown')}", file=sys.stderr)
        
        return formatted_text
        
    except Exception as e:
        print(f"✗ GPU transcription failed: {str(e)}", file=sys.stderr)
        
        # Fallback to CPU if GPU fails
        if gpu_available:
            print("Attempting CPU fallback...", file=sys.stderr)
            try:
                model = whisper.load_model(model_size, device="cpu")
                result = whisper.transcribe(model, file_path, language=language)
                raw_text = result["text"]
                return clean_and_format_text_enhanced(raw_text, language)
            except Exception as cpu_error:
                print(f"✗ CPU fallback also failed: {str(cpu_error)}", file=sys.stderr)
                raise
        else:
            raise

def main():
    parser = argparse.ArgumentParser(description='Full GPU-accelerated Whisper transcription for maximum accuracy')
    parser.add_argument('file_path', help='Path to audio file')
    parser.add_argument('--language', '-l', default='ar', help='Language code (ar, en)')
    parser.add_argument('--model', '-m', default='medium', 
                       choices=['tiny', 'base', 'small', 'medium', 'large', 'large-v2', 'large-v3'],
                       help='Whisper model size (larger = more accurate)')
    parser.add_argument('--gpu', action='store_true', default=True,
                       help='Force GPU usage (default: True)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.file_path):
        print(f"✗ Error: File not found: {args.file_path}", file=sys.stderr)
        sys.exit(1)
    
    try:
        print(f"🚀 Starting full GPU transcription...", file=sys.stderr)
        print(f"📁 File: {args.file_path}", file=sys.stderr)
        print(f"🌍 Language: {args.language}", file=sys.stderr)
        print(f"🧠 Model: {args.model}", file=sys.stderr)
        
        start_time = datetime.now()
        transcript = transcribe_with_full_gpu(args.file_path, args.language, args.model)
        end_time = datetime.now()
        
        processing_time = (end_time - start_time).total_seconds()
        print(f"⏱️  Total processing time: {processing_time:.2f} seconds", file=sys.stderr)
        
        # Save transcript to file
        output_file = f"{args.file_path}_transcript.txt"
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(transcript)
            print(f"✓ Transcript saved to: {output_file}", file=sys.stderr)
        except Exception as e:
            print(f"✗ Warning: Could not save file: {str(e)}", file=sys.stderr)
        
        # Output the clean transcript
        print(transcript)
        
    except Exception as e:
        print(f"✗ Fatal error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
