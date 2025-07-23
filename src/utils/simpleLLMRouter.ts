// Simple LLM router that prioritizes working solutions
export class SimpleLLMRouter {
  private ollamaUrl = 'http://localhost:11434';
  private groqApiKey = process.env.GROQ_API_KEY;

  async enhanceTranscription(transcript: string, language: 'ar' | 'en', enableEnhancement = true): Promise<{
    text: string;
    source: string;
    confidence: number;
  }> {
    console.log(`🔄 Enhancing transcription (${language}): ${transcript.substring(0, 100)}...`);

    // Option to skip enhancement completely
    if (!enableEnhancement) {
      console.log('🚫 Enhancement disabled, returning original text');
      return { text: transcript, source: 'original', confidence: 1.0 };
    }

    // Quick quality check - if text seems good, skip enhancement
    const words = transcript.split(/\s+/).filter(w => w.trim());
    if (words.length > 15 && transcript.length > 100 && !transcript.includes('???')) {
      console.log('📝 Text seems coherent, skipping enhancement');
      return { text: transcript, source: 'original', confidence: 0.95 };
    }

    // Try local Ollama first (most reliable)
    try {
      const enhanced = await this.enhanceWithOllama(transcript, language);
      console.log('✅ Enhanced with local Ollama');
      return { text: enhanced, source: 'local', confidence: 0.9 };
    } catch (error) {
      console.log('❌ Local Ollama failed:', error);
    }

    // Try Groq with simpler request
    if (this.groqApiKey && this.groqApiKey !== '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') {
      try {
        const enhanced = await this.enhanceWithGroqSimple(transcript, language);
        console.log('✅ Enhanced with Groq');
        return { text: enhanced, source: 'groq', confidence: 0.95 };
      } catch (error) {
        console.log('❌ Groq failed:', error);
      }
    }

    // Template fallback
    console.log('⚠️ Using template enhancement');
    return { 
      text: this.templateEnhancement(transcript, language), 
      source: 'template', 
      confidence: 0.7 
    };
  }

  async generateMedicalNote(transcript: string, noteType: string, language: 'ar' | 'en'): Promise<{
    note: string;
    source: string;
  }> {
    console.log(`🏥 Generating ${noteType} note (${language}): ${transcript.substring(0, 100)}...`);

    // TEMPORARILY SKIP AI - Use template generation for reliability
    console.log('⚠️ Temporarily using template note generation for reliability');
    const { generateEnhancedFallbackNote } = await import('./simpleFallbackGenerator');
    const note = generateEnhancedFallbackNote({ transcript, noteType, language });
    return { note, source: 'template' };

    // AI Note generation is disabled until we fix hallucination issues
    /*
    // Try local Ollama first
    try {
      const note = await this.generateNoteWithOllama(transcript, noteType, language);
      console.log('✅ Note generated with local Ollama');
      return { note, source: 'local' };
    } catch (error) {
      console.log('❌ Local Ollama note generation failed:', error);
    }

    // Try Groq
    if (this.groqApiKey && this.groqApiKey !== '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') {
      try {
        const note = await this.generateNoteWithGroqSimple(transcript, noteType, language);
        console.log('✅ Note generated with Groq');
        return { note, source: 'groq' };
      } catch (error) {
        console.log('❌ Groq note generation failed:', error);
      }
    }

    // Template fallback
    console.log('⚠️ Using template note generation');
    const { generateEnhancedFallbackNote } = await import('./simpleFallbackGenerator');
    const note = generateEnhancedFallbackNote({ transcript, noteType, language });
    return { note, source: 'template' };
    */
  }

  private async enhanceWithOllama(transcript: string, language: string): Promise<string> {
    let prompt: string;
    
    if (language === 'ar') {
      prompt = `أنت مدقق نصوص طبية عربية. صحح الأخطاء الإملائية والنحوية فقط:

النص الأصلي: "${transcript}"

المطلوب:
- صحح الأخطاء الإملائية فقط
- اتركh النص كما هو إذا كان واضحاً
- لا تضيف كلمات جديدة
- حافظ على نفس الطول تقريباً
- لا تترجم أو تفسر

النص المُصحح:`;
    } else {
      prompt = `Fix only obvious spelling errors in this text. Do not change content or meaning:

Text: "${transcript}"

Strict rules:
- If text is understandable, return as-is
- Fix only obvious spelling mistakes
- Do not rewrite any sentences
- Do not add or remove information
- Keep same words and order
- If unsure, return original text

Corrected text:`;
    }

    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3:mini',
        prompt,
        stream: false,
        options: {
          temperature: 0.05,
          num_predict: Math.max(transcript.length + 50, 200),
          top_p: 0.8,
          repeat_penalty: 1.2,
          stop: ["\n\n", "النص:", "Text:"]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    const enhanced = data.response || transcript;
    
    // More lenient safety checks with better logging
    const originalWords = transcript.split(/\s+/).length;
    const enhancedWords = enhanced.split(/\s+/).length;
    
    console.log(`📊 Enhancement check - Original: ${transcript.length} chars, ${originalWords} words`);
    console.log(`📊 Enhancement check - Enhanced: ${enhanced.length} chars, ${enhancedWords} words`);
    
    if (enhanced.length > transcript.length * 3 || 
        enhanced.length < transcript.length * 0.3 ||
        enhancedWords > originalWords * 2 ||
        enhancedWords < originalWords * 0.3) {
      console.log('⚠️ Ollama response too different, using original text');
      console.log(`❌ Rejected: ${enhanced.substring(0, 100)}...`);
      return transcript;
    }
    
    console.log(`✅ Enhancement accepted: ${enhanced.substring(0, 100)}...`);
    return enhanced.trim();
  }

  private async generateNoteWithOllama(transcript: string, noteType: string, language: string): Promise<string> {
    let prompt: string;
    
    if (language === 'ar') {
      prompt = `اكتب تقرير طبي بسيط باللغة العربية من كلام المريض هذا فقط:

"${transcript}"

قواعد مهمة جداً:
- اكتب فقط ما قاله المريض
- لا تخترع أي معلومات طبية
- لا تضيف تشخيص أو علاج
- اكتب ملخص بسيط لشكوى المريض فقط
- إذا كان النص غير مكتمل، اذكر ذلك

التقرير:`;
    } else {
      prompt = `Write a simple medical note in English from this patient's words only:

"${transcript}"

Very important rules:
- Write ONLY what the patient said
- Do NOT invent medical information
- Do NOT add diagnosis or treatment
- Write simple summary of patient complaint only
- If text is incomplete, mention that

Note:`;
    }

    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3:mini',
        prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: Math.min(transcript.length * 2, 400),
          top_p: 0.8,
          repeat_penalty: 1.3,
          stop: ["\n\nالتقرير:", "\n\nNote:", "تشخيص:", "علاج:", "diagnosis:", "treatment:"]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  private async enhanceWithGroqSimple(transcript: string, language: string): Promise<string> {
    let systemPrompt: string;
    let userPrompt: string;

    if (language === 'ar') {
      systemPrompt = "أنت مصحح نصوص متحفظ. مهمتك تصحيح الأخطاء الواضحة فقط دون تغيير المحتوى.";
      userPrompt = `صحح الأخطاء الواضحة فقط في هذا النص العربي:

"${transcript}"

قواعد صارمة:
- إذا كان النص مفهوماً، أرجعه كما هو
- صحح الأخطاء الإملائية الواضحة فقط
- لا تعيد صياغة أي جملة
- لا تضيف أو تحذف معلومات
- إذا لم تكن متأكداً، أرجع النص الأصلي`;
    } else {
      systemPrompt = "You are a conservative text corrector. Only fix obvious errors without changing content.";
      userPrompt = `Fix only obvious errors in this text:

"${transcript}"

Strict rules:
- If text is understandable, return as-is
- Fix only obvious spelling mistakes
- Do not rephrase sentences
- Do not add or remove information  
- If unsure, return original text`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 300,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`Groq error: ${response.status}`);
    }

    const data = await response.json();
    const enhanced = data.choices[0].message.content;
    
    // More lenient safety checks with better logging
    const originalWords = transcript.split(/\s+/).length;
    const enhancedWords = enhanced.split(/\s+/).length;
    
    console.log(`📊 Groq enhancement check - Original: ${transcript.length} chars, ${originalWords} words`);
    console.log(`📊 Groq enhancement check - Enhanced: ${enhanced.length} chars, ${enhancedWords} words`);
    
    if (enhanced.length > transcript.length * 3 || 
        enhanced.length < transcript.length * 0.3 ||
        enhancedWords > originalWords * 2 ||
        enhancedWords < originalWords * 0.3) {
      console.log('⚠️ Groq response too different, using original text');
      console.log(`❌ Rejected: ${enhanced.substring(0, 100)}...`);
      return transcript;
    }
    
    console.log(`✅ Groq enhancement accepted: ${enhanced.substring(0, 100)}...`);
    return enhanced.trim();
  }

  private async generateNoteWithGroqSimple(transcript: string, noteType: string, language: string): Promise<string> {
    let systemPrompt: string;
    let userPrompt: string;
    
    if (language === 'ar') {
      systemPrompt = "أنت طبيب يكتب تقارير طبية بسيطة. استخدم فقط المعلومات الموجودة في النص. لا تخترع معلومات.";
      userPrompt = `اكتب تقرير طبي بسيط من هذه المحادثة فقط:

"${transcript}"

قواعد:
- استخدم المعلومات الموجودة فقط
- لا تضيف تاريخ مرضي غير موجود
- اكتب باللغة العربية
- كن مختصراً ومباشراً`;
    } else {
      systemPrompt = "You are a doctor writing simple medical notes. Use ONLY information from the text. Do not invent information.";
      userPrompt = `Write a simple medical note from this conversation only:

"${transcript}"

Rules:
- Use ONLY information provided
- Do NOT add medical history not mentioned
- Write in English
- Be concise and direct`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`Groq error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private templateEnhancement(transcript: string, language: string): string {
    let enhanced = transcript;
    
    if (language === 'ar') {
      // Fix common Arabic medical transcription errors
      enhanced = enhanced
        // Common speech recognition errors
        .replace(/عنده/g, 'يعاني من')
        .replace(/عندي/g, 'أعاني من')
        .replace(/الم/g, 'ألم')
        .replace(/وجع/g, 'ألم')
        .replace(/حرارة/g, 'درجة حرارة')
        .replace(/سخونة/g, 'حمى')
        .replace(/ةةة/g, 'ة')
        .replace(/ييي/g, 'ي')
        .replace(/ااا/g, 'ا')
        // Medical terms corrections
        .replace(/صداع/g, 'صداع')
        .replace(/دوخة/g, 'دوار')
        .replace(/غثيان/g, 'غثيان')
        .replace(/قيء/g, 'تقيؤ')
        .replace(/سعال/g, 'سعال')
        .replace(/كحة/g, 'سعال')
        .replace(/زكام/g, 'التهاب الأنف')
        .replace(/برد/g, 'نزلة برد')
        // Body parts
        .replace(/راس/g, 'رأس')
        .replace(/بطن/g, 'بطن')
        .replace(/ظهر/g, 'ظهر')
        .replace(/صدر/g, 'صدر')
        .replace(/رقبة/g, 'رقبة')
        // Fix spacing and punctuation
        .replace(/\s+/g, ' ')
        .replace(/\s+([.,!?])/g, '$1')
        .trim();
    } else {
      // English medical corrections
      enhanced = enhanced
        .replace(/hart/g, 'heart')
        .replace(/hart/gi, 'heart')
        .replace(/problm/g, 'problem')
        .replace(/symtoms/g, 'symptoms')
        .replace(/sympton/g, 'symptom')
        .replace(/temperatur/g, 'temperature')
        .replace(/presure/g, 'pressure')
        .replace(/diabetis/g, 'diabetes')
        .replace(/pane/g, 'pain')
        .replace(/hed/g, 'head')
        .replace(/chst/g, 'chest')
        .replace(/bak/g, 'back')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Add proper punctuation if missing
    if (!enhanced.match(/[.!?]$/)) {
      enhanced += '.';
    }
    
    // Capitalize first letter if English
    if (language === 'en' && enhanced.length > 0) {
      enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    }
    
    return enhanced;
  }
}
