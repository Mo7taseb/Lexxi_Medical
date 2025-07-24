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
    if (!this.apiKey || this.apiKey === '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') {
      throw new Error('Valid GROQ_API_KEY is required');
    }
  }

  /**
   * Transcribe audio file using Groq's Whisper API
   */
  async transcribe(audioFile: File, options: GroqWhisperOptions = { language: 'ar' }): Promise<GroqWhisperResponse> {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', options.model || 'whisper-large-v3-turbo'); // Faster turbo model
    formData.append('language', options.language);
    formData.append('response_format', options.response_format || 'json');
    
    if (options.temperature !== undefined) {
      formData.append('temperature', options.temperature.toString());
    }

    // Add medical prompt for better Arabic medical transcription
    if (options.language === 'ar') {
      formData.append('prompt', 'المريض يعاني من ألم في الصدر والرأس. الطبيب يفحص المريض ويكتب التشخيص والعلاج.');
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
    
    // Apply medical terminology corrections for Arabic
    let text = result.text || '';
    if (options.language === 'ar') {
      text = this.applyMedicalCorrections(text);
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
   * Check if Groq API is available and configured
   */
  isAvailable(): boolean {
    return !!(this.apiKey && this.apiKey !== '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' && this.apiKey.length > 10);
  }

  /**
   * Get estimated transcription time (Groq is much faster than local)
   */
  getEstimatedTime(fileSizeMB: number): string {
    // Groq Whisper is typically 5-15 seconds regardless of file size
    return '5-15 seconds';
  }
}
