/**
 * Groq Whisper API Integration
 * Ultra-fast cloud-based transcription with medical terminology correction
 */

export interface GroqWhisperOptions {
  language: 'ar' | 'en';
  model?: 'whisper-large-v3' | 'whisper-large-v3-turbo';
  temperature?: number;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
}

export interface GroqWhisperResponse {
  text: string;
  language?: string;
  duration?: number;
  segments?: any[];
}

export class GroqWhisperTranscriber {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }
  }

  /**
   * Transcribe audio file using Groq's Whisper API
   */
  async transcribe(audioFile: File, options: GroqWhisperOptions = { language: 'ar' }): Promise<GroqWhisperResponse> {
    console.log(`🎙️ Starting Groq Whisper transcription (Language: ${options.language.toUpperCase()})`);
    
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', options.model || 'whisper-large-v3-turbo'); // Faster turbo model
    formData.append('language', options.language);
    formData.append('response_format', options.response_format || 'json');
    
    if (options.temperature !== undefined) {
      formData.append('temperature', options.temperature.toString());
    }

    // Add language-specific medical prompts for better transcription
    if (options.language === 'ar') {
      console.log('📝 Using Arabic medical context prompt');
      formData.append('prompt', 'المريض يعاني من ألم في الصدر والرأس. الطبيب يفحص المريض ويكتب التشخيص والعلاج.');
    } else if (options.language === 'en') {
      console.log('📝 Using English medical context prompt');
      formData.append('prompt', 'Patient complains of chest pain and headache. Doctor examines patient and writes diagnosis and treatment plan. Medical history includes hypertension and diabetes.');
    }

    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq Whisper API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Apply medical terminology corrections based on language
    let text = result.text || '';
    if (options.language === 'ar') {
      text = this.applyMedicalCorrections(text);
    } else if (options.language === 'en') {
      text = this.applyEnglishMedicalCorrections(text);
    }

    return {
      text: text.trim(),
      language: result.language,
      duration: result.duration,
      segments: result.segments
    };
  }

  /**
   * Apply medical terminology corrections for Arabic text
   */
  private applyMedicalCorrections(text: string): string {
    const medicalCorrections: Record<string, string> = {
      // Complex phrases first (order matters!)
      'ونخفع الفيد رجات الحرار': 'وانخفاض درجات الحرارة',
      'نخفع الفيد رجات الحرار': 'انخفاض درجات الحرارة',
      'الفيد رجات الحرار': 'درجات الحرارة',
      'فيد رجات الحرار': 'درجات الحرارة',
      'كسر في صق': 'كسر في الساق',
      'درجات الحرار': 'درجات الحرارة',
      'درجة حرار': 'درجة الحرارة',

      // Patient terms
      'مريد': 'المريض',
      'مريده': 'المريضة',
      'مريض': 'المريض',

      // Symptoms and conditions
      'يعان': 'يعاني',
      'يعن': 'يعاني',
      'عن في': 'يعاني في',
      'يعني من': 'يعاني من',

      // Body parts
      'صق': 'الساق',
      'ساق': 'الساق',
      'اليومنا': 'اليمنى',
      'اليمن': 'اليمنى',
      'اليسار': 'اليسرى',

      // Medical conditions
      'كسر': 'كسر',
      'التهاب': 'التهاب',
      'ألم': 'ألم',
      'آلام': 'آلام',
      'تورم': 'تورم',
      'نزيف': 'نزيف',

      // Temperature and measurements
      'ونخفع': 'وانخفاض',
      'انخفع': 'انخفاض',
      'ارتفع': 'ارتفاع',
      'الفيد': 'درجات',
      'رجات': 'الحرارة',
      'حرار': 'حرارة',
      'حراره': 'حرارة',
      'الحرار': 'الحرارة',

      // Common medical words
      'علاج': 'علاج',
      'دواء': 'دواء',
      'أدوية': 'أدوية',
      'فحص': 'فحص',
      'تشخيص': 'تشخيص',
      'عملية': 'عملية',
      'جراحة': 'جراحة'
    };

    let correctedText = text;

    // Apply complex phrases first
    const complexPhrases: string[] = [
      'ونخفع الفيد رجات الحرار',
      'نخفع الفيد رجات الحرار',
      'الفيد رجات الحرار',
      'فيد رجات الحرار',
      'كسر في صق',
      'درجات الحرار',
      'درجة حرار'
    ];

    complexPhrases.forEach(phrase => {
      const correction = medicalCorrections[phrase];
      if (correction) {
        correctedText = correctedText.replace(new RegExp(phrase, 'g'), correction);
      }
    });

    // Then apply individual word corrections
    Object.entries(medicalCorrections).forEach(([wrong, correct]) => {
      if (!complexPhrases.includes(wrong)) {
        correctedText = correctedText.replace(new RegExp(`\\b${wrong}\\b`, 'g'), correct);
      }
    });

    return correctedText;
  }

  /**
   * Apply medical terminology corrections for English text
   * Common speech-to-text errors in medical dictation
   */
  private applyEnglishMedicalCorrections(text: string): string {
    console.log('🔧 Applying English medical corrections...');
    
    const medicalCorrections: Record<string, string> = {
      // Common medical dictation errors - Patient variations
      'patent' : 'patient',
      'patience' : 'patient', 
      'patents' : 'patients',
      'patiences' : 'patients',
      'pasient' : 'patient',
      'paisant' : 'patient',
      
      // Directional/anatomical errors
      'write arm' : 'right arm',
      'write hand' : 'right hand',
      'write leg' : 'right leg',
      'write side' : 'right side',
      'left write' : 'left right', // Common confusion
      
      // Medical examination terms
      'physical exam' : 'physical examination',
      'heart sounds' : 'heart sounds',
      'breath sounds' : 'breath sounds',
      'lung sounds' : 'lung sounds',
      'bowel sounds' : 'bowel sounds',
      
      // Common medical conditions - homophones
      'dime abetes' : 'diabetes',
      'die abetes' : 'diabetes', 
      'hyperattention' : 'hypertension',
      'high pertension' : 'hypertension',
      'new monia' : 'pneumonia',
      'ammonia' : 'pneumonia', // Common misheard
      
      // Medical procedures/actions
      'prescribed' : 'prescribed',
      'proscribed' : 'prescribed', // Common confusion
      'diagnosed' : 'diagnosed',
      'examine' : 'examine',
      'examined' : 'examined',
      'assessment' : 'assessment',
      'treatment' : 'treatment',
      'medication' : 'medication',
      'surgery' : 'surgery',
      
      // Vital signs and measurements
      'blood pressure' : 'blood pressure',
      'heart rate' : 'heart rate',
      'pulse rate' : 'pulse rate',
      'respiratory rate' : 'respiratory rate',
      'temperature' : 'temperature',
      'oxygen saturation' : 'oxygen saturation',
      'blood sugar' : 'blood sugar',
      'glucose level' : 'glucose level',
      
      // Common symptoms
      'chest pain' : 'chest pain',
      'shortness of breath' : 'shortness of breath',
      'difficulty breathing' : 'difficulty breathing',
      'abdominal pain' : 'abdominal pain',
      'headache' : 'headache',
      'dizziness' : 'dizziness',
      'nausea' : 'nausea',
      'vomiting' : 'vomiting',
      'fatigue' : 'fatigue',
      'weakness' : 'weakness',
      
      // Medical phrases
      'complains of' : 'complains of',
      'suffers from' : 'suffers from',
      'history of' : 'history of',
      'family history' : 'family history',
      'medical history' : 'medical history',
      'physical examination' : 'physical examination',
      'vital signs' : 'vital signs',
      'normal limits' : 'normal limits',
      'within normal limits' : 'within normal limits',
      
      // Dosage and timing - common errors
      'once a day' : 'once daily',
      'twice a day' : 'twice daily',  
      'three times a day' : 'three times daily',
      'four times a day' : 'four times daily',
      'every four hours' : 'every 4 hours',
      'every six hours' : 'every 6 hours',
      'every eight hours' : 'every 8 hours',
      'every twelve hours' : 'every 12 hours',
      'as needed' : 'as needed',
      'when necessary' : 'as needed',
      'with food' : 'with food',
      'before meals' : 'before meals',
      'after meals' : 'after meals',
      'on empty stomach' : 'on empty stomach',
      
      // Medical specialties  
      'cardiology' : 'cardiology',
      'neurology' : 'neurology',
      'orthopedics' : 'orthopedics',
      'gastroenterology' : 'gastroenterology',
      'pulmonology' : 'pulmonology',
      'endocrinology' : 'endocrinology',
      
      // Medical equipment/tests
      'x-ray' : 'X-ray',
      'CT scan' : 'CT scan',
      'MRI' : 'MRI',
      'ultrasound' : 'ultrasound',
      'electrocardiogram' : 'electrocardiogram',
      'ECG' : 'ECG',
      'EKG' : 'EKG',
      'blood test' : 'blood test',
      'urine test' : 'urine test'
    };

    let correctedText = text;
    let correctionCount = 0;

    // Apply corrections with word boundaries to avoid partial matches
    Object.entries(medicalCorrections).forEach(([wrong, correct]) => {
      // Use case-insensitive matching but preserve original case
      const regex = new RegExp(`\\b${wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const beforeReplace = correctedText;
      correctedText = correctedText.replace(regex, (match) => {
        correctionCount++;
        console.log(`✅ Corrected: "${match}" → "${correct}"`);
        // Preserve the case of the original match
        if (match === match.toUpperCase()) return correct.toUpperCase();
        if (match === match.toLowerCase()) return correct.toLowerCase();
        if (match[0] === match[0].toUpperCase()) {
          return correct.charAt(0).toUpperCase() + correct.slice(1).toLowerCase();
        }
        return correct;
      });
    });

    console.log(`✨ Applied ${correctionCount} English medical corrections`);
    return correctedText;
  }

  /**
   * Check if Groq API is available and configured
   */
  isAvailable(): boolean {
    return !!(this.apiKey && this.apiKey.length > 10);
  }

  /**
   * Get estimated transcription time (Groq is much faster than local)
   */
  getEstimatedTime(fileSizeMB: number): string {
    // Groq Whisper is typically 5-15 seconds regardless of file size
    return '5-15 seconds';
  }
}
