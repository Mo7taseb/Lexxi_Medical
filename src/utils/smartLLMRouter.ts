/**
 * Smart LLM Router - Handles free cloud LLMs with local Ollama fallback
 * Optimized for 8GB RAM + GTX 1650 setup
 */

export interface LLMResponse {
  text: string;
  source: 'groq' | 'huggingface' | 'local' | 'fallback';
  confidence: number;
}

export class SmartLLMRouter {
  private groqApiKey = process.env.GROQ_API_KEY;
  private hfApiKey = process.env.HUGGINGFACE_API_KEY;
  private ollamaUrl = 'http://localhost:11434';

  /**
   * Enhance transcription by fixing medical terms and improving formatting
   */
  async enhanceTranscription(transcript: string, language: 'ar' | 'en'): Promise<LLMResponse> {
    console.log(`🔄 Enhancing transcription (${language}): ${transcript.substring(0, 100)}...`);

    // Try cloud services first (faster)
    try {
      if (this.groqApiKey && this.groqApiKey.length > 10) {
        const result = await this.enhanceWithGroq(transcript, language);
        console.log('✅ Enhanced with Groq');
        return { text: result, source: 'groq', confidence: 0.9 };
      }
    } catch (error) {
      console.log('❌ Groq failed:', error);
    }

    // Try Hugging Face
    try {
      if (this.hfApiKey && this.hfApiKey.length > 10) {
        const result = await this.enhanceWithHuggingFace(transcript, language);
        console.log('✅ Enhanced with Hugging Face');
        return { text: result, source: 'huggingface', confidence: 0.8 };
      }
    } catch (error) {
      console.log('❌ Hugging Face failed:', error);
    }

    // Fallback to local Ollama
    try {
      const result = await this.enhanceWithOllama(transcript, language);
      console.log('✅ Enhanced with local Ollama');
      return { text: result, source: 'local', confidence: 0.7 };
    } catch (error) {
      console.log('❌ Local Ollama failed:', error);
    }

    // Final fallback - return original with basic cleanup
    console.log('⚠️ All LLMs failed, using basic cleanup');
    return { 
      text: this.basicTextCleanup(transcript), 
      source: 'fallback', 
      confidence: 0.3 
    };
  }

  /**
   * Generate medical notes using available LLM services
   */
  async generateMedicalNote(transcript: string, noteType: string, language: 'ar' | 'en' = 'ar'): Promise<LLMResponse> {
    console.log(`🏥 Generating ${noteType} note for transcript: ${transcript.substring(0, 100)}...`);

    // Try cloud services first
    try {
      if (this.groqApiKey && this.groqApiKey.length > 10) {
        const result = await this.generateNoteWithGroq(transcript, noteType, language);
        console.log('✅ Generated note with Groq');
        return { text: result, source: 'groq', confidence: 0.9 };
      }
    } catch (error) {
      console.log('❌ Groq note generation failed:', error);
    }

    // Fallback to local Ollama
    try {
      const result = await this.generateNoteWithOllama(transcript, noteType, language);
      console.log('✅ Generated note with local Ollama');
      return { text: result, source: 'local', confidence: 0.7 };
    } catch (error) {
      console.log('❌ Local Ollama note generation failed:', error);
    }

    // Final fallback
    console.log('⚠️ All LLMs failed for note generation, using basic template');
    return { 
      text: this.generateBasicNote(transcript, noteType, language), 
      source: 'fallback', 
      confidence: 0.3 
    };
  }

  /**
   * Groq API (Free tier: 6K tokens/minute)
   */
  private async enhanceWithGroq(transcript: string, language: string): Promise<string> {
    const prompt = this.buildEnhancementPrompt(transcript, language);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error details:`, response.status, errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText.substring(0, 100)}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || transcript;
  }

  /**
   * Generate medical note with Groq
   */
  private async generateNoteWithGroq(transcript: string, noteType: string, language: string): Promise<string> {
    const prompt = this.buildNotePrompt(transcript, noteType, language);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{
          role: 'system',
          content: language === 'ar' ? 
            'أنت مساعد طبي ذكي متخصص في إنشاء التقارير الطبية المنظمة. تفهم المصطلحات الطبية العربية والإنجليزية.' :
            'You are a medical AI assistant specialized in creating structured medical reports. You understand both Arabic and English medical terminology.'
        }, {
          role: 'user',
          content: prompt
        }],
        temperature: 0.3,
        max_tokens: 1500,
        timeout: 20000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || this.generateBasicNote(transcript, noteType, language);
  }

  /**
   * Hugging Face Inference API (Free tier: 1000 requests/month)
   */
  private async enhanceWithHuggingFace(transcript: string, language: string): Promise<string> {
    const prompt = `Improve this medical transcription by fixing errors and enhancing medical terminology:\n"${transcript}"`;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        headers: {
          'Authorization': `Bearer ${this.hfApiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 500,
            temperature: 0.1,
            return_full_text: false
          },
          options: { 
            wait_for_model: true,
            use_cache: false
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const result = await response.json();
    return result[0]?.generated_text || transcript;
  }

  /**
   * Local Ollama (requires Ollama running locally)
   */
  private async enhanceWithOllama(transcript: string, language: string): Promise<string> {
    const prompt = this.buildEnhancementPrompt(transcript, language);

    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3:mini', // Lightweight model for 8GB RAM
        prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 500,
          num_ctx: 2048
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ollama error details:`, response.status, errorText);
      throw new Error(`Ollama error: ${response.status} - ${errorText.substring(0, 100)}`);
    }

    const data = await response.json();
    return data.response || transcript;
  }

  /**
   * Generate medical note with local Ollama
   */
  private async generateNoteWithOllama(transcript: string, noteType: string, language: string): Promise<string> {
    const prompt = this.buildNotePrompt(transcript, noteType, language);

    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3:mini', // Use same model for consistency
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 1000,
          num_ctx: 4096
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ollama note generation error:`, response.status, errorText);
      throw new Error(`Ollama error: ${response.status} - ${errorText.substring(0, 100)}`);
    }

    const data = await response.json();
    return data.response || this.generateBasicNote(transcript, noteType, language);
  }

  /**
   * Build enhancement prompt for transcription improvement
   */
  private buildEnhancementPrompt(transcript: string, language: string): string {
    if (language === 'ar') {
      return `أنت متخصص في تحسين النصوص الطبية المفرغة. قم بتحسين النص التالي عبر:
1. إصلاح أخطاء التفريغ الصوتي
2. تصحيح المصطلحات الطبية
3. إضافة علامات الترقيم المناسبة
4. تحسين التنسيق دون تغيير المعنى

النص الأصلي: "${transcript}"

النص المحسن:`;
    } else {
      return `You are a medical transcription specialist. Enhance this transcript by:
1. Fixing speech-to-text errors
2. Correcting medical terminology
3. Adding proper punctuation
4. Improving formatting while maintaining original meaning

Original: "${transcript}"

Enhanced:`;
    }
  }

  /**
   * Build note generation prompt
   */
  private buildNotePrompt(transcript: string, noteType: string, language: string): string {
    const templates = {
      ar: {
        soap: `قم بإنشاء تقرير SOAP من هذه المحادثة الطبية:
"${transcript}"

التنسيق المطلوب:
**الأعراض الذاتية (S):** شكاوى المريض وتاريخ الحالة
**الفحص الموضوعي (O):** النتائج الجسدية والفحوصات
**التقييم (A):** التشخيص والتقييم الطبي
**الخطة (P):** العلاج والمتابعة`,

        progress: `قم بإنشاء تقرير متابعة من هذه المحادثة:
"${transcript}"

يجب أن يتضمن:
- الحالة الحالية
- التغييرات منذ الزيارة الأخيرة
- التقييم الطبي
- الخطة القادمة`,

        consultation: `قم بإنشاء تقرير استشارة من هذه المحادثة:
"${transcript}"

يجب أن يتضمن:
- سبب الاستشارة
- التاريخ المرضي
- الفحص والتقييم
- التوصيات`
      },
      en: {
        soap: `Create a SOAP note from this medical conversation:
"${transcript}"

Format:
**SUBJECTIVE (S):** Patient complaints and history
**OBJECTIVE (O):** Physical findings and test results
**ASSESSMENT (A):** Diagnosis and medical evaluation
**PLAN (P):** Treatment and follow-up`,

        progress: `Create a Progress Note from this conversation:
"${transcript}"

Include:
- Current status
- Changes since last visit
- Medical assessment
- Next steps`,

        consultation: `Create a Consultation Note from this conversation:
"${transcript}"

Include:
- Reason for consultation
- Medical history
- Assessment and findings
- Recommendations`
      }
    };

    const langTemplates = templates[language as keyof typeof templates] || templates.en;
    return langTemplates[noteType as keyof typeof langTemplates] || langTemplates.soap;
  }

  /**
   * Basic text cleanup when all LLMs fail
   */
  private basicTextCleanup(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Fix multiple spaces
      .replace(/([.!?])\s*([a-zA-Zأ-ي])/g, '$1 $2') // Fix punctuation spacing
      .trim();
  }

  /**
   * Generate basic note when all LLMs fail
   */
  private generateBasicNote(transcript: string, noteType: string, language: string): string {
    const timestamp = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
    
    if (language === 'ar') {
      return `## تقرير طبي - ${noteType.toUpperCase()}
**التاريخ:** ${timestamp}

**محتوى المحادثة:**
${transcript}

**ملاحظة:** تم إنشاء هذا التقرير تلقائياً ويحتاج إلى مراجعة طبية.`;
    } else {
      return `## Medical Report - ${noteType.toUpperCase()}
**Date:** ${timestamp}

**Conversation Content:**
${transcript}

**Note:** This report was generated automatically and requires medical review.`;
    }
  }

  /**
   * Check if Ollama is running locally
   */
  async checkOllamaStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get available models from Ollama
   */
  async getOllamaModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch {
      return [];
    }
  }
}
