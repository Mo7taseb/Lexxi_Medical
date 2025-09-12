// Groq-Only LLM Router - Powerful 70B Models for Medical AI
export class SimpleLLMRouter {
  private groqApiKey = process.env.GROQ_API_KEY;
  private primaryModel = 'llama-3.3-70b-versatile'; // Your best available model
  private fallbackModel = 'llama-3.1-8b-instant'; // Fast fallback

  // Function to clean unwanted prefixes from generated notes
  private cleanNoteContent(content: string, language: string): string {
    if (!content) return content;

    console.log(`🧹 [SimpleLLMRouter] Starting cleaning process for ${language.toUpperCase()}`);
    console.log(`🧹 [SimpleLLMRouter] Original content (first 300 chars): "${content.substring(0, 300)}..."`);

    const englishPrefixes = [
      'Here is the enhanced medical transcription:',
      'Here is the enhanced medical transcription',
      'Here is the medical transcription:',
      'Here is the medical transcription',
      'Enhanced medical transcription:',
      'Medical transcription:',
      'Here is the structured medical report:',
      'Here is the structured medical report',
      'Structured medical report:',
      'Here is the medical report:',
      'Here is the medical report',
      'Medical report:',
      'Here is the consultation report:',
      'Here is the consultation report',
      'Consultation report:',
      'Here is the SOAP note:',
      'Here is the SOAP note',
      'SOAP note:',
      'Here is the progress note:',
      'Here is the progress note',
      'Progress note:',
      'Here is the discharge summary:',
      'Here is the discharge summary',
      'Discharge summary:',
      'Here is your',
      'Here is the',
      'The following is',
      'Below is the',
      'This is the',
      'Based on the transcript',
      'From the transcript',
      'Here\'s the',
      'Here\'s your'
    ];

    const arabicPrefixes = [
      'إليك النسخة المحسنة من النص الطبي:',
      'إليك النسخة المحسنة من النص الطبي',
      'النسخة المحسنة من النص الطبي:',
      'النسخة المحسنة من النص الطبي',
      'إليك التقرير الطبي:',
      'إليك التقرير الطبي',
      'التقرير الطبي:',
      'التقرير الطبي',
      'إليك تقرير الاستشارة:',
      'إليك تقرير الاستشارة',
      'تقرير الاستشارة:',
      'إليك تقرير SOAP:',
      'إليك تقرير SOAP',
      'تقرير SOAP:',
      'إليك تقرير المتابعة:',
      'إليك تقرير المتابعة',
      'تقرير المتابعة:',
      'إليك تقرير الخروج:',
      'إليك تقرير الخروج',
      'تقرير الخروج:',
      'فيما يلي',
      'إليك',
      'هذا هو',
      'بناءً على النص'
    ];

    let cleaned = content.trim();
    const prefixes = language === 'en' ? englishPrefixes : arabicPrefixes;

    // Remove any matching prefixes (case insensitive) - multiple passes
    let hasChanged = true;
    let iterations = 0;
    const maxIterations = 10;
    
    while (hasChanged && iterations < maxIterations) {
      hasChanged = false;
      iterations++;
      console.log(`🧹 [SimpleLLMRouter] Cleaning iteration ${iterations}`);
      
      for (const prefix of prefixes) {
        const regex = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i');
        const beforeLength = cleaned.length;
        cleaned = cleaned.replace(regex, '');
        if (cleaned.length !== beforeLength) {
          hasChanged = true;
          console.log(`🧹 [SimpleLLMRouter] Removed prefix: "${prefix}"`);
        }
      }
      
      // Remove any leading colons, dashes, or whitespace that might be left
      const beforeLength = cleaned.length;
      cleaned = cleaned.replace(/^[:\-\s\n\r]+/, '');
      if (cleaned.length !== beforeLength) {
        hasChanged = true;
        console.log(`🧹 [SimpleLLMRouter] Removed leading punctuation/whitespace`);
      }
    }

    // Additional aggressive cleaning for stubborn cases
    cleaned = cleaned.replace(/^["\'\`]*\s*/, ''); // Remove leading quotes and spaces
    cleaned = cleaned.replace(/^\d+\.\s*/, ''); // Remove numbered list prefixes
    
    // Remove any remaining common AI prefixes that might have been missed
    const additionalPatterns = [
      /^Here\s+is\s+.*?:\s*/gi,
      /^The\s+following\s+is\s+.*?:\s*/gi,
      /^Below\s+is\s+.*?:\s*/gi,
      /^This\s+is\s+.*?:\s*/gi,
      /^إليك\s+.*?:\s*/gi,
      /^فيما\s+يلي\s+.*?:\s*/gi
    ];
    
    for (const pattern of additionalPatterns) {
      const beforeLength = cleaned.length;
      cleaned = cleaned.replace(pattern, '');
      if (cleaned.length !== beforeLength) {
        console.log(`🧹 [SimpleLLMRouter] Removed pattern match`);
      }
    }

    const finalCleaned = cleaned.trim();
    console.log(`🧹 [SimpleLLMRouter] Final cleaned content (first 300 chars): "${finalCleaned.substring(0, 300)}..."`);
    console.log(`🧹 [SimpleLLMRouter] Cleaning complete. Original length: ${content.length}, Final length: ${finalCleaned.length}`);
    
    return finalCleaned;
  }

  async enhanceTranscription(transcript: string, language: 'ar' | 'en', enableEnhancement = true): Promise<{
    text: string;
    source: string;
    confidence: number;
  }> {
    console.log(`� Enhancing transcription with Groq 70B (${language}): ${transcript.substring(0, 100)}...`);

    // Option to skip enhancement completely
    if (!enableEnhancement) {
      console.log('🚫 Enhancement disabled, returning original text');
      return { text: transcript, source: 'original', confidence: 1.0 };
    }

    // Always try Groq enhancement for maximum quality
    if (!this.groqApiKey || this.groqApiKey === 'your_new_groq_api_key_here') {
      console.log('❌ No valid Groq API key found');
      return { text: transcript, source: 'original', confidence: 0.5 };
    }

    // Try primary 70B model first
    try {
      const enhanced = await this.enhanceWithGroq(transcript, language, this.primaryModel);
      console.log('✅ Enhanced with Groq 70B model');
      return { text: enhanced, source: 'groq-70b', confidence: 0.98 };
    } catch (error) {
      console.log('⚠️ Primary model failed, trying fallback:', error);
    }

    // Try fallback 8B model
    try {
      const enhanced = await this.enhanceWithGroq(transcript, language, this.fallbackModel);
      console.log('✅ Enhanced with Groq 8B fallback');
      return { text: enhanced, source: 'groq-8b', confidence: 0.90 };
    } catch (error) {
      console.log('❌ All Groq models failed:', error);
    }

    // Return original if Groq fails
    console.log('⚠️ Groq unavailable, returning original text');
    return { 
      text: transcript, 
      source: 'original', 
      confidence: 0.7 
    };
  }

  async generateMedicalNote(transcript: string, noteType: string, language: 'ar' | 'en'): Promise<{
    note: string;
    source: string;
  }> {
    console.log(`🏥 Generating ${noteType} note with Groq 70B (${language}): ${transcript.substring(0, 100)}...`);

    if (!this.groqApiKey || this.groqApiKey === 'your_new_groq_api_key_here') {
      console.log('❌ No valid Groq API key found, using template');
      const { generateEnhancedFallbackNote } = await import('./simpleFallbackGenerator');
      const note = generateEnhancedFallbackNote({ transcript, noteType, language });
      return { note, source: 'template' };
    }

    // Try primary 70B model for note generation
    try {
      const note = await this.generateNoteWithGroq(transcript, noteType, language, this.primaryModel);
      const cleanedNote = this.cleanNoteContent(note, language);
      if (this.validateMedicalNote(cleanedNote, transcript)) {
        console.log('✅ Medical note generated with Groq 70B');
        return { note: cleanedNote, source: 'groq-70b' };
      } else {
        console.log('⚠️ Primary model note failed validation, trying strict mode');
        
        // Try again with stricter prompt emphasizing no hallucinations
        const strictNote = await this.generateStrictNoteWithGroq(transcript, noteType, language, this.primaryModel);
        const cleanedStrictNote = this.cleanNoteContent(strictNote, language);
        if (this.validateMedicalNote(cleanedStrictNote, transcript)) {
          console.log('✅ Strict mode note generated with Groq 70B');
          return { note: cleanedStrictNote, source: 'groq-70b-strict' };
        }
      }
    } catch (error) {
      console.log('⚠️ Primary model failed for note generation:', error);
    }

    // Try fallback 8B model
    try {
      const note = await this.generateNoteWithGroq(transcript, noteType, language, this.fallbackModel);
      const cleanedNote = this.cleanNoteContent(note, language);
      if (this.validateMedicalNote(cleanedNote, transcript)) {
        console.log('✅ Medical note generated with Groq 8B fallback');
        return { note: cleanedNote, source: 'groq-8b' };
      } else {
        console.log('⚠️ Fallback model note failed validation, trying strict mode');
        
        // Try again with stricter prompt
        const strictNote = await this.generateStrictNoteWithGroq(transcript, noteType, language, this.fallbackModel);
        const cleanedStrictNote = this.cleanNoteContent(strictNote, language);
        if (this.validateMedicalNote(cleanedStrictNote, transcript)) {
          console.log('✅ Strict mode note generated with Groq 8B');
          return { note: cleanedStrictNote, source: 'groq-8b-strict' };
        }
      }
    } catch (error) {
      console.log('❌ All Groq models failed for note generation:', error);
    }

    // Template fallback
    console.log('⚠️ Using template note generation');
    const { generateEnhancedFallbackNote } = await import('./simpleFallbackGenerator');
    const note = generateEnhancedFallbackNote({ transcript, noteType, language });
    return { note, source: 'template' };
  }

  private async enhanceWithGroq(transcript: string, language: string, model: string): Promise<string> {
    let systemPrompt: string;
    let userPrompt: string;

    if (language === 'ar') {
      systemPrompt = "أنت خبير في تصحيح النصوص الطبية العربية. مهمتك تحسين دقة النص المنقول من الصوت للكتابة. ارجع النص المحسن مباشرة بدون أي مقدمات.";
      userPrompt = `صحح وحسن هذا النص الطبي العربي المنقول من الصوت. ارجع النص المحسن مباشرة:

"${transcript}"

متطلبات التحسين:
- ارجع النص المحسن مباشرة بدون مقدمات مثل "إليك النص المحسن" أو "فيما يلي"
- صحح الأخطاء الإملائية والنحوية
- حسن المصطلحات الطبية العربية
- اجعل النص أوضح وأكثر احترافية
- احتفظ بالمعنى والسياق الأصلي
- لا تضف معلومات طبية جديدة
- لا تحذف معلومات مهمة`;
    } else {
      systemPrompt = "You are an expert medical text correction specialist. Your task is to improve transcribed medical text accuracy. Return the enhanced text directly without any introductory phrases.";
      userPrompt = `Correct and improve this medical transcription. Return the enhanced text directly:

"${transcript}"

Enhancement requirements:
- Return the enhanced text directly without introductory phrases like "Here is the enhanced" or "The following is"
- Fix spelling and grammar errors
- Improve medical terminology accuracy
- Make text clearer and more professional
- Preserve original meaning and context
- Do not add new medical information
- Do not remove important information`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: Math.max(transcript.length * 2, 500),
        top_p: 0.9,
        stop: null
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const rawEnhanced = data.choices?.[0]?.message?.content?.trim() || transcript;
    
    // Clean the enhanced transcription to remove unwanted prefixes
    const enhanced = this.cleanNoteContent(rawEnhanced, language);
    
    // Quality validation
    const originalWords = transcript.split(/\s+/).length;
    const enhancedWords = enhanced.split(/\s+/).length;
    
    console.log(`📊 Groq Enhancement - Original: ${transcript.length} chars, ${originalWords} words`);
    console.log(`📊 Groq Enhancement - Enhanced: ${enhanced.length} chars, ${enhancedWords} words`);
    
    // Allow more flexibility for 70B model improvements
    if (enhanced.length > transcript.length * 4 || 
        enhanced.length < transcript.length * 0.2 ||
        enhancedWords > originalWords * 3 ||
        enhancedWords < originalWords * 0.2) {
      console.log('⚠️ Groq response too different, using original text');
      return transcript;
    }
    
    console.log(`✅ Groq enhancement accepted: ${enhanced.substring(0, 100)}...`);
    return enhanced;
  }

  private async generateStrictNoteWithGroq(transcript: string, noteType: string, language: string, model: string): Promise<string> {
    let systemPrompt: string;
    let userPrompt: string;
    
    if (language === 'ar') {
      systemPrompt = `أنت مساعد طبي محافظ ودقيق. مهمتك كتابة تقارير طبية بسيطة ومنظمة بدون إضافة أي معلومات غير موجودة.

قواعد صارمة:
1. استخدم فقط النص المُقدم - لا تخترع أي شيء
2. لا تضيف أرقام أو تواريخ أو قياسات غير مذكورة
3. لا تضيف أدوية أو علاجات غير مذكورة
4. إذا لم تُذكر معلومة، اتركها فارغة أو اكتب "[غير مذكور]"
5. ابدأ مباشرة بالتقرير`;
      
      userPrompt = `اكتب تقرير طبي بسيط ومحافظ بناءً فقط على هذا النص:

"${transcript}"

اكتب تقرير منظم بالأقسام التالية:
- سبب الزيارة: [من النص فقط]
- وصف الأعراض: [من النص فقط]
- التقييم: [عام بناءً على الأعراض]
- التوصيات: [عامة ومحافظة]

لا تضيف: أرقام، تواريخ، أدوية، أو فحوصات غير مذكورة`;
    } else {
      systemPrompt = `You are a conservative medical assistant. Your task is to write simple, organized medical reports without adding any information not present in the source.

STRICT RULES:
1. Use only the provided text - do not invent anything
2. Do not add numbers, dates, or measurements not mentioned
3. Do not add medications or treatments not mentioned
4. If information is not mentioned, leave blank or write "[not mentioned]"
5. Start directly with the report`;
      
      userPrompt = `Write a simple, conservative medical report based ONLY on this text:

"${transcript}"

Write an organized report with these sections:
- Reason for visit: [from text only]
- Symptom description: [from text only] 
- Assessment: [general based on symptoms]
- Recommendations: [general and conservative]

Do NOT add: numbers, dates, medications, or tests not mentioned`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.05, // Very low for conservative approach
        max_tokens: Math.min(transcript.length * 2, 800), // Shorter for simpler output
        top_p: 0.8,
        frequency_penalty: 0.5, // Reduce repetition
        presence_penalty: 0.4, // Stay focused
        stop: null
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const note = data.choices?.[0]?.message?.content?.trim() || '';
    
    console.log(`📄 Generated strict note (${model}): ${note.substring(0, 150)}...`);
    return note;
  }

  private async generateNoteWithGroq(transcript: string, noteType: string, language: string, model: string): Promise<string> {
    let systemPrompt: string;
    let userPrompt: string;
    
    if (language === 'ar') {
      systemPrompt = `أنت طبيب خبير متخصص في كتابة التقارير الطبية الاحترافية باللغة العربية. تتميز بالدقة والوضوح والالتزام بالمعايير الطبية.

قواعد صارمة يجب اتباعها:
1. استخدم فقط المعلومات الموجودة في النص المُقدم
2. لا تخترع أو تضيف أي معلومات طبية غير موجودة (مثل: علامات حيوية، نتائج فحوصات، أدوية، تواريخ محددة)
3. إذا لم تُذكر معلومة، اتركها فارغة أو استخدم "[يحتاج لتوثيق]"
4. ابدأ مباشرة بالتقرير بدون مقدمات`;
      
      const noteTypeArabic = {
        'consultation': 'استشارة طبية',
        'examination': 'فحص طبي',
        'diagnosis': 'تشخيص',
        'treatment': 'خطة علاج',
        'follow-up': 'متابعة',
        'general': 'تقرير عام'
      }[noteType] || 'تقرير طبي';

      userPrompt = `اكتب ${noteTypeArabic} احترافي مفصل بناءً فقط على هذه المحادثة الطبية:

"${transcript}"

${this.getArabicNoteStructure(noteType)}

متطلبات التقرير:
- ابدأ مباشرة بالتقرير بدون مقدمات
- استخدم فقط المعلومات الموجودة في المحادثة أعلاه
- لا تضيف: علامات حيوية، نتائج فحوصات، أدوية، أو تواريخ غير مذكورة
- استخدم "[يحتاج لتوثيق]" للمعلومات المفقودة
- اكتب تقرير طبي منظم وواضح
- استخدم المصطلحات الطبية العربية المناسبة`;
    } else {
      systemPrompt = `You are an expert physician specialized in writing comprehensive, professional medical consultation notes. You excel at extracting relevant information from patient conversations and organizing it into proper medical documentation format.

Your expertise includes:
- Extracting patient demographics and presentation details
- Organizing symptom descriptions chronologically  
- Writing comprehensive History of Presenting Illness narratives
- Providing appropriate clinical assessments
- Recommending suitable follow-up care

IMPORTANT GUIDELINES:
1. Extract and use ALL relevant information from the conversation
2. Write detailed, professional medical narratives
3. For missing standard information, use appropriate medical notations
4. Maintain professional medical terminology and structure
5. Start directly with the medical report`;
      
      userPrompt = `Create a comprehensive ${noteType} report from this patient consultation:

"${transcript}"

${this.getEnglishNoteStructure(noteType)}

CRITICAL FORMATTING REQUIREMENTS:
- Each section header should be on its own line with ONLY the section name
- Content should go on separate lines below each header
- Do NOT put content in the same line as section headers
- For Investigation section: use "Lab Work:", "Imaging Studies:", "Microbiology:", "Others:" as subsection headers
- Extract ALL relevant patient information from the conversation
- Write detailed, professional medical narratives
- Start directly with the report content`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2, // Slight increase for better narrative flow
        max_tokens: Math.min(transcript.length * 4, 2500), // Increased for comprehensive notes
        top_p: 0.9,
        frequency_penalty: 0.2, // Reduced to allow proper medical terminology
        presence_penalty: 0.1, // Reduced to allow thorough documentation
        stop: null
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const note = data.choices?.[0]?.message?.content?.trim() || '';
    
    console.log(`📄 Generated note (${model}): ${note.substring(0, 150)}...`);
    return note;
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

  private getEnglishNoteStructure(noteType: string): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    switch (noteType) {
      case 'consultation':
        return `Create a consultation note using this EXACT structure and format. Follow this template precisely:

**Consultation Details:**
Date of Consultation: ${currentDate}
Patient Location: [Extract facility name, department, or clinic from conversation]
Consulting Service: [Extract medical service/specialty from conversation]
Reason for Consult: [Extract main reason from conversation]

[Write a brief 1-2 sentence summary of the assessment, e.g., "I assessed [Patient] at [Location] for [condition]."]

**HISTORY OF PRESENTING ILLNESS:**
[Write a detailed narrative paragraph describing the patient's condition. Include patient demographics, timeline of symptom development, detailed symptom description, associated symptoms, previous treatments, and current status. Format as continuous prose, not bullet points.]

**PAST MEDICAL HISTORY:**
[List relevant past medical conditions using bullet points with dashes. If none, state "- No significant past medical history"]

**Home medications:**
[List current medications using bullet points with dashes, or state "- None"]

**Allergies:**
[List known allergies using bullet points with dashes, or state "- No known drug allergies"]

**Social history:**
[Include relevant social history details mentioned in conversation using bullet points with dashes. Do NOT use labels like "Occupation:" or "Smoking history:". Just list the information directly, for example: "- Born in Nepal and moved to Canada 3 years ago", "- Currently living with her husband in London, Ontario", "- Works in a factory", "- No history of smoking, drug use, or alcohol use"]

**Physical examination:**
[Describe physical examination findings mentioned in conversation using bullet points with dashes. If no examination mentioned, state appropriately.]

**Investigation:**

Lab work:
[List laboratory results using bullet points with dashes]

Imaging:
[List imaging studies using bullet points with dashes]

Microbiology:
[List microbiology results using bullet points with dashes, or state "- No microbiology results mentioned"]

**Assessment:**
[Provide clinical assessment using bullet points with dashes. Do NOT use labels like "Clinical impression:" or "Differential diagnosis:". Just list the assessment points directly, for example: "- 31-year-old female with history of tuberculous lymphadenitis, presenting with left supraclavicular lymph node enlargement", "- Differential diagnosis includes tuberculous lymphadenitis, other causes of lymphadenopathy", "- Further investigation needed to determine cause"]

**Plan:**
[Provide detailed management plan using bullet points with dashes. Do NOT use labels like "Treatment:" or "Follow-up:". Just list the plan actions directly, for example: "- Refer patient to ENT for excisional biopsy", "- Arrange CT thorax to rule out further involvement", "- Send routine labs including liver enzymes", "- Follow-up after investigation results available"]
- Follow-up arrangements
- Patient education points

Professional medical formatting and structure applied.`;

      case 'progress':
        return `Please follow this EXACT structure, using ONLY information from the conversation:

**Date of assessment:** ${currentDate}

**Patient identification:**
[Extract patient details mentioned in conversation - if none, write "[To be completed by healthcare provider]"]

**Brief hospital course:**
[Only if hospital stay information is mentioned in conversation - otherwise write "[To be completed by healthcare provider]"]

**Interval history:**
[Extract any changes or updates mentioned by patient in conversation]

**Physical examination:**
[Only include examination findings mentioned in conversation - if none mentioned, write "[To be completed by healthcare provider]"]

**Investigations:**
[Only include test results mentioned in conversation - if none mentioned, write "[To be completed by healthcare provider]"]

**Assessment:**
[Based on information provided in conversation]

**Plan:**
[Based on what was discussed in conversation - avoid specific medical recommendations unless clearly indicated]

Note: This is an automatically generated template based on patient's verbal report and requires completion by healthcare provider.`;

      default:
        return `Structure the report with clear sections using ONLY information from the conversation:
- Main Complaint: [From conversation]
- History: [From conversation only] 
- Examination: [Only if mentioned in conversation]
- Assessment: [Based on conversation]
- Plan: [Based on conversation]
- Add "[needs documentation]" for any missing standard information`;
    }
  }

  private getArabicNoteStructure(noteType: string): string {
    const currentDate = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    switch (noteType) {
      case 'consultation':
        return `أنشئ تقرير استشارة باستخدام هذا الهيكل والتنسيق بالضبط. اتبع هذا النموذج بدقة:

**تفاصيل الاستشارة:**
تاريخ الاستشارة: ${currentDate}
موقع المريض: [استخرج اسم المرفق، القسم، أو العيادة من المحادثة]
الخدمة الاستشارية: [استخرج الخدمة الطبية/التخصص من المحادثة]
سبب الاستشارة: [استخرج السبب الرئيسي من المحادثة]

[اكتب ملخصاً موجزاً من 1-2 جملة للتقييم، مثل "قمت بتقييم [المريض] في [الموقع] لحالة [الحالة]."]

**تاريخ المرض الحالي:**
[اكتب فقرة سردية مفصلة تصف حالة المريض. اشمل التركيبة السكانية للمريض، الجدول الزمني لتطور الأعراض، وصف مفصل للأعراض، الأعراض المصاحبة، العلاجات السابقة، والحالة الحالية. اكتب كنثر مستمر، وليس نقاط.]

**التاريخ المرضي السابق:**
[اذكر الحالات الطبية السابقة باستخدام نقاط مع شرطات. إذا لم يكن هناك شيء، اكتب "- لا يوجد تاريخ مرضي مهم سابق"]

**الأدوية المنزلية:**
[اذكر الأدوية الحالية باستخدام نقاط مع شرطات، أو اكتب "- لا توجد"]

**الحساسية:**
[اذكر الحساسيات المعروفة باستخدام نقاط مع شرطات، أو اكتب "- لا توجد حساسية دوائية معروفة"]

**التاريخ الاجتماعي:**
[اشمل تفاصيل التاريخ الاجتماعي باستخدام نقاط مع شرطات. لا تستخدم تسميات مثل "المهنة:" أو "تاريخ التدخين:". فقط اذكر المعلومات مباشرة، مثل: "- ولدت في نيبال وانتقلت إلى كندا منذ 3 سنوات"، "- تعيش حالياً مع زوجها في لندن، أونتاريو"، "- تعمل في مصنع"، "- لا تدخن ولا تشرب الكحول"]

**الفحص البدني:**
[اوصف نتائج الفحص البدني باستخدام نقاط مع شرطات. إذا لم يُذكر فحص، اذكر ذلك بشكل مناسب.]

**الفحوصات:**

الفحوصات المخبرية:
[اذكر نتائج المختبر باستخدام نقاط مع شرطات]

التصوير:
[اذكر دراسات التصوير باستخدام نقاط مع شرطات]

علم الأحياء الدقيقة:
[اذكر نتائج علم الأحياء الدقيقة باستخدام نقاط مع شرطات، أو اكتب "- لم تُذكر نتائج علم أحياء دقيقة"]

**التقييم:**
[قدم التقييم الإكلينيكي باستخدام نقاط مع شرطات. لا تستخدم تسميات مثل "الانطباع الإكلينيكي:" أو "التشخيص التفريقي:". فقط اذكر نقاط التقييم مباشرة، مثل: "- أنثى 31 عاماً مع تاريخ التهاب العقد الليمفاوية السلي، تراجع بتضخم عقدة ليمفاوية فوق الترقوة اليسرى"، "- التشخيص التفريقي يشمل التهاب العقد الليمفاوية السلي، أسباب أخرى لتضخم العقد الليمفاوية"، "- حاجة لفحوصات إضافية لتحديد السبب"]

**الخطة:**
[قدم خطة الإدارة المفصلة باستخدام نقاط مع شرطات. لا تستخدم تسميات مثل "العلاج:" أو "المتابعة:". فقط اذكر إجراءات الخطة مباشرة، مثل: "- تحويل المريضة لجراحة الأنف والأذن والحنجرة لأخذ خزعة استئصالية"، "- ترتيب فحص CT للصدر لاستبعاد إصابة إضافية"، "- إرسال فحوصات روتينية تشمل إنزيمات الكبد"، "- متابعة بعد ظهور نتائج الفحوصات"]

**تعريف المريض:**
[استخرج تفاصيل المريض المذكورة في المحادثة]

**التاريخ المرضي السابق:**
[اذكر فقط التاريخ المرضي المذكور في المحادثة - إذا لم يُذكر شيء، اكتب "[يُملأ من قِبل مقدم الرعاية الصحية]"]

**تاريخ المرض الحالي:**
[اكتب قصة سردية بناءً على ما وصفه المريض في المحادثة. اشمل الجدول الزمني والأعراض والتطور كما ذُكر. إذا كانت المعلومات قليلة، اكتب ما هو متاح واذكر أن التاريخ الإضافي مطلوب]

**الفحص البدني:**
[اشمل فقط نتائج الفحص المذكورة في المحادثة - إذا لم تُذكر، اكتب "[يُملأ من قِبل مقدم الرعاية الصحية]"]

**الفحوصات:**

الفحوصات المخبرية:
[اذكر النتائج المذكورة في المحادثة]

التصوير الطبي:
[اشمل أي دراسات تصوير نُوقشت مع التواريخ والأنواع والنتائج]

علم الأحياء الدقيقة:
[اشمل أي نتائج زراعة أو علم أحياء دقيقة ذُكرت]

أخرى:
[أي فحوصات أو تحقيقات إضافية نُوقشت]

**التقييم:**
[بناءً على الأعراض والمعلومات المقدمة في المحادثة - تجنب التشخيصات المحددة إلا إذا كانت مذكورة بوضوح]

**الخطة:**
[بناءً على ما نُوقش في المحادثة - إذا كانت المعلومات قليلة، اكتب توصيات الرعاية الطبية العامة]

ملاحظة: هذا نموذج تلقائي مبني على تقرير المريض الشفهي ويحتاج لإكمال من قِبل مقدم الرعاية الصحية.`;

      case 'progress':
        return `يرجى اتباع هذا الهيكل بالضبط، استخدم فقط المعلومات الموجودة في المحادثة:

**تاريخ التقييم:** ${currentDate}

**تعريف المريض:**
[استخرج تفاصيل المريض المذكورة في المحادثة - إذا لم تُذكر، اكتب "[يُملأ من قِبل مقدم الرعاية الصحية]"]

**مسار المستشفى المختصر:**
[فقط إذا ذُكرت معلومات الإقامة في المستشفى في المحادثة - وإلا اكتب "[يُملأ من قِبل مقدم الرعاية الصحية]"]

**التاريخ الفاصل:**
[استخرج أي تغييرات أو تحديثات ذكرها المريض في المحادثة]

**الفحص البدني:**
[اشمل فقط نتائج الفحص المذكورة في المحادثة - إذا لم تُذكر، اكتب "[يُملأ من قِبل مقدم الرعاية الصحية]"]

**الفحوصات:**
[اشمل فقط نتائج الفحوصات المذكورة في المحادثة - إذا لم تُذكر، اكتب "[يُملأ من قِبل مقدم الرعاية الصحية]"]

**التقييم:**
[بناءً على المعلومات المقدمة في المحادثة]

**الخطة:**
[بناءً على ما نُوقش في المحادثة - تجنب التوصيات الطبية المحددة إلا إذا كانت مذكورة بوضوح]

ملاحظة: هذا نموذج تلقائي مبني على تقرير المريض الشفهي ويحتاج لإكمال من قِبل مقدم الرعاية الصحية.`;

      default:
        return `نظم التقرير بأقسام واضحة باستخدام فقط المعلومات من المحادثة:
- الشكوى الرئيسية: [من المحادثة]
- التاريخ المرضي: [من المحادثة فقط]
- الفحص: [فقط إذا ذُكر في المحادثة]
- التقييم: [بناءً على المحادثة]
- الخطة: [بناءً على المحادثة]
- أضف "[يحتاج لتوثيق]" لأي معلومات قياسية مفقودة`;
    }
  }

  private validateMedicalNote(note: string, originalTranscript: string): boolean {
    // Basic validation checks for medical note quality
    if (!note || note.length < 50) {
      console.log('❌ Note too short');
      return false;
    }
    
    if (note.length > originalTranscript.length * 8) {
      console.log('❌ Note too long compared to transcript');
      return false;
    }
    
    // Check for severe hallucinations - only flag obvious fabrications
    const severeHallucinationPatterns = [
      // Specific medical details not mentioned in transcript
      /blood pressure.*\d+\/\d+/i, // Specific BP readings
      /temperature.*\d+\.?\d*[°]?[fc]/i, // Specific temperatures
      /heart rate.*\d+.*bpm/i, // Specific heart rates
      /weight.*\d+.*kg|lbs/i, // Specific weights
      /height.*\d+.*cm|ft/i, // Specific heights
      
      // Specific medication names and dosages not mentioned
      /metformin.*\d+.*mg/i,
      /lisinopril.*\d+.*mg/i,
      /aspirin.*\d+.*mg/i,
      /amoxicillin.*\d+.*mg/i,
      
      // Specific test results not mentioned
      /white.*blood.*cell.*count.*\d+/i,
      /hemoglobin.*\d+\.?\d*/i,
      /glucose.*\d+.*mg\/dl/i,
      /creatinine.*\d+\.?\d*/i,
      
      // Specific dates not mentioned
      /admitted.*on.*\d{1,2}\/\d{1,2}\/\d{4}/i,
      /discharged.*on.*\d{1,2}\/\d{1,2}\/\d{4}/i
    ];
    
    // Only flag as hallucination if the pattern exists in note but has NO similar content in transcript
    const hasSeveireHallucination = severeHallucinationPatterns.some(pattern => {
      const foundInNote = pattern.test(note);
      if (!foundInNote) return false;
      
      // Extract the key concept (remove numbers and units for comparison)
      const conceptPattern = pattern.source.replace(/\\d\+|\\.\\?\\d\*|\[°\]\?|\[fc\]|mg|kg|lbs|cm|ft|bpm|mg\/dl/gi, '');
      const conceptRegex = new RegExp(conceptPattern, 'i');
      
      // If the concept exists in transcript, it's not a hallucination
      return !conceptRegex.test(originalTranscript);
    });
    
    if (hasSeveireHallucination) {
      console.log('❌ Severe hallucination detected in note - fabricated specific medical data');
      return false;
    }
    
    // Check for excessive empty template placeholders - only reject if note is mostly empty placeholders
    const templatePlaceholders = [
      /\[to be completed by healthcare provider\]/gi,
      /\[to be documented\]/gi,
      /\[to be specified\]/gi,
      /\[if applicable\]/gi,
      /\[needs documentation\]/gi,
      /\[يُملأ من قِبل مقدم الرعاية الصحية\]/gi,
      /\[ليتم توثيقه\]/gi,
      /\[ليتم تحديده\]/gi,
      /\[يحتاج لتوثيق\]/gi
    ];
    
    // Count placeholders vs actual content
    const placeholderMatches = templatePlaceholders.reduce((count, pattern) => {
      return count + (note.match(pattern) || []).length;
    }, 0);
    
    // Count lines with actual patient content vs placeholder lines
    const noteLines = note.split('\n').filter(line => line.trim());
    const contentLines = noteLines.filter(line => {
      const hasContent = /\w{3,}/.test(line) && !line.includes('[');
      return hasContent;
    });
    
    const placeholderRatio = placeholderMatches / Math.max(noteLines.length, 1);
    const contentRatio = contentLines.length / Math.max(noteLines.length, 1);
    
    // Only reject if note is mostly placeholders (>60%) and has very little content (<30%)
    if (placeholderRatio > 0.6 && contentRatio < 0.3) {
      console.log(`❌ Note has too many empty placeholders (${(placeholderRatio * 100).toFixed(1)}%) and too little content (${(contentRatio * 100).toFixed(1)}%)`);
      return false;
    }
    
    // Check if note is just a reformatted version of the transcript without medical structure
    const noteWords = note.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    const transcriptWords = originalTranscript.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    
    // Calculate overlap - if too low, might be hallucinated content
    const commonWords = noteWords.filter(word => transcriptWords.includes(word));
    const overlapRatio = commonWords.length / Math.max(noteWords.length, 1);
    
    if (overlapRatio < 0.15) {
      console.log(`❌ Note has too little overlap with transcript (${(overlapRatio * 100).toFixed(1)}%)`);
      return false;
    }
    
    console.log(`✅ Medical note passed validation (overlap: ${(overlapRatio * 100).toFixed(1)}%)`);
    return true;
  }
}

// Export a singleton instance
export const llmRouter = new SimpleLLMRouter();
