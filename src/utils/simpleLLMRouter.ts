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

  private async generateNoteWithGroq(transcript: string, noteType: string, language: string, model: string): Promise<string> {
    let systemPrompt: string;
    let userPrompt: string;
    
    if (language === 'ar') {
      systemPrompt = "أنت طبيب خبير متخصص في كتابة التقارير الطبية الاحترافية باللغة العربية. تتميز بالدقة والوضوح والالتزام بالمعايير الطبية. ابدأ مباشرة بالتقرير بدون أي مقدمات أو عبارات تمهيدية.";
      
      const noteTypeArabic = {
        'consultation': 'استشارة طبية',
        'examination': 'فحص طبي',
        'diagnosis': 'تشخيص',
        'treatment': 'خطة علاج',
        'follow-up': 'متابعة',
        'general': 'تقرير عام'
      }[noteType] || 'تقرير طبي';

      userPrompt = `اكتب ${noteTypeArabic} احترافي مفصل بناءً على هذه المحادثة الطبية. ابدأ مباشرة بالتقرير:

"${transcript}"

${this.getArabicNoteStructure(noteType)}

متطلبات التقرير:
- ابدأ مباشرة بالتقرير بدون مقدمات مثل "إليك التقرير" أو "فيما يلي"
- اكتب تقرير طبي شامل ومنظم
- استخدم المصطلحات الطبية العربية المناسبة
- اتبع الهيكل المحدد بدقة
- اذكر كل التفاصيل المهمة من المحادثة
- استخدم لغة طبية احترافية
- تأكد من الدقة والوضوح
- لا تضيف معلومات غير موجودة في النص`;
    } else {
      systemPrompt = "You are an expert physician specialized in writing professional medical reports. You are known for accuracy, clarity, and adherence to medical standards. Start directly with the report content without any introductory phrases.";
      
      userPrompt = `Write a comprehensive professional ${noteType} report based on this medical conversation. Start directly with the report:

"${transcript}"

${this.getEnglishNoteStructure(noteType)}

Report requirements:
- Start directly with the report without introductory phrases like "Here is the report" or "The following is"
- Write a thorough and organized medical report
- Use appropriate medical terminology
- Follow the specified structure exactly
- Include all important details from the conversation
- Use professional medical language
- Ensure accuracy and clarity
- Do not add information not present in the text`;
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
        max_tokens: Math.min(transcript.length * 3, 1500),
        top_p: 0.9,
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
    switch (noteType) {
      case 'consultation':
        return `Please follow this EXACT structure:

**Consultation Details:**
Date of Consultation: [Current date]
Patient Location: [Hospital/Clinic location from transcript]
Consulting Service: Infectious Diseases
Reason for Consult: [Main reason from transcript]


I assessed [Patient name/identifier] at [location] for [chief complaint/reason].


**HISTORY OF PRESENTING ILLNESS:**
Write as a comprehensive narrative describing the patient's journey with their current illness. Start with patient demographics (e.g., "Mr. X is a 33-year-old previously healthy male who..."). Include detailed timeline, symptom progression, associated symptoms, treatment received, and current status. Write in paragraph form, not bullet points. Include all relevant details from the conversation such as how the condition started, what treatments were given, current symptoms, and patient's current state.


**PAST MEDICAL HISTORY:**
- [Previous medical conditions]
- [Surgical history]
- [Significant medical events]

**Home medications:**(this is a section title)
- List each medication followed by specific dosage and frequency (e.g., Medication Name 500mg twice daily)
- Include route of administration when relevant
- Recent medication changes with dosages

**Allergies:**(this is a section title)
- [Known drug allergies]
- [Food or environmental allergies]
- [Allergic reactions]

**Social history:**(this is a section title)
- [Smoking, alcohol, drug use]
- [Occupation and lifestyle factors]
- [Family history if relevant]

**Physical examination:**(this is a section title)
- [Vital signs]
- [Systematic physical findings]
- [Relevant examination results]

**Investigation:**(this is a section title)
**Lab work:**
- Laboratory test results
- Pending lab work

**Imaging:**(this is a section title)
- [Date of imaging]
- [Type of imaging study]
- [Anatomical site examined]
- [Detailed findings and interpretation]

**Microbiology:**(this is a section title)
- [Date of specimen collection]
- [Type of test/culture]
- [Site of specimen collection]
- [Organism identified, sensitivities, clinical significance]


**Assessment:**(this is a section title)
- [Clinical impression]
- [Differential diagnosis]
- [Problem prioritization]

**Plan:**(this is a section title)
- [Treatment recommendations]
- [Follow-up arrangements]
- [Further investigations needed]`;

      case 'progress':
        return `Please follow this EXACT structure:

**Date of assessment:**
[Current date and time]

**Patient identification:**
Brief patient demographics and identifiers

**Brief hospital course:**
- Summary of hospital stay
- Key events and interventions
- Treatment provided

**Interval history:**
- Changes since last assessment
- New symptoms or concerns
- Patient-reported improvements or deterioration

**Physical examination:**
- Current vital signs
- Focused physical examination
- Changes from previous examination

**Investigations:**
- Recent test results
- Pending investigations
- Trending of laboratory values

**Assessment:**
- Current clinical status
- Response to treatment
- Updated problem list

**Plan:**
- Ongoing treatment modifications with specific dosages and frequencies
- New interventions
- Discharge planning considerations`;

      default:
        return 'Structure the report with clear sections (Chief Complaint, History, Examination, Assessment, Plan).';
    }
  }

  private getArabicNoteStructure(noteType: string): string {
    switch (noteType) {
      case 'consultation':
        return `يرجى اتباع هذا الهيكل بالضبط:

**تاريخ الاستشارة:**
[التاريخ والوقت الحالي]

**سبب الاستشارة:**
- السبب الأساسي للاستشارة
- مؤشر الإحالة

**تعريف المريض:**
الآنسة إكس، امرأة تبلغ من العمر 31 عامًا، من النيبال أصلاً، تقيم حاليًا في لندن، أونتاريو، مع زوجها

**التاريخ المرضي السابق:**
- الحالات الطبية السابقة
- التاريخ الجراحي
- الأحداث الطبية المهمة

**أدوية المنزل:**
- اذكر كل دواء متبوعًا بالجرعة المحددة والتكرار (مثل: اسم الدواء 500 ملغ مرتين يوميًا)
- تضمين طريقة الإعطاء عند الضرورة
- التغييرات الحديثة في الأدوية مع الجرعات

**الحساسية:**
- حساسية الأدوية المعروفة
- حساسية الطعام أو البيئة
- ردود فعل الحساسية

**التاريخ الاجتماعي:**
- التدخين والكحول وتعاطي المخدرات
- المهنة وعوامل نمط الحياة
- التاريخ العائلي إذا كان ذا صلة

**تاريخ المرض الحالي:**
اكتب كقصة سردية تصف رحلة المريض مع مرضه الحالي. تضمين الجدول الزمني، تطور الأعراض، الأعراض المصاحبة، وأي تفاصيل ذات صلة في شكل فقرات بدلاً من النقاط. اوصف كيف تطورت الحالة، وتقدمت، وأي عوامل قد تكون ساهمت في العرض الحالي.

**الفحص البدني:**
- العلامات الحيوية
- النتائج البدنية المنتظمة
- نتائج الفحص ذات الصلة

**الفحوصات:**
**الفحوصات المخبرية:**
- نتائج الفحوصات المخبرية
- الأعمال المخبرية المعلقة

**التصوير:**
- التاريخ: [تاريخ التصوير]
- النوع: [نوع دراسة التصوير]
- الموقع: [الموقع التشريحي المفحوص]
- النتيجة: [النتائج التفصيلية والتفسير]

**علم الأحياء الدقيقة:**
- التاريخ: [تاريخ جمع العينة]
- النوع: [نوع الفحص/الزراعة]
- الموقع: [موقع جمع العينة]
- النتيجة: [الكائن المحدد، الحساسيات، الأهمية السريرية]

**أخرى:**
- فحوصات تشخيصية إضافية
- تحقيقات متخصصة

**التقييم:**
- الانطباع السريري
- التشخيص التفريقي
- ترتيب أولويات المشكلة

**الخطة:**
- توصيات العلاج
- ترتيبات المتابعة
- التحقيقات الأخرى المطلوبة`;

      case 'progress':
        return `يرجى اتباع هذا الهيكل بالضبط:

**تاريخ التقييم:**
[التاريخ والوقت الحالي]

**تعريف المريض:**
- البيانات الديموغرافية للمريض والمعرفات
- العمر والجنس والمعرفات ذات الصلة

**مسار المستشفى المختصر:**
- ملخص إقامة المستشفى
- الأحداث والتدخلات الرئيسية
- العلاج المقدم

**التاريخ الفاصل:**
- التغييرات منذ التقييم الأخير
- أعراض أو مخاوف جديدة
- التحسينات أو التدهور المبلغ عنها من المريض

**الفحص البدني:**
- العلامات الحيوية الحالية
- الفحص البدني المركز
- التغييرات من الفحص السابق

**الفحوصات:**
- نتائج الاختبار الأخيرة
- التحقيقات المعلقة
- اتجاه القيم المخبرية

**التقييم:**
- الحالة السريرية الحالية
- الاستجابة للعلاج
- قائمة المشاكل المحدثة

**الخطة:**
- تعديلات العلاج المستمرة
- تدخلات جديدة
- اعتبارات تخطيط الخروج`;

      default:
        return 'قم بتنظيم التقرير بأقسام واضحة (الشكوى الرئيسية، التاريخ المرضي، الفحص، التقييم، الخطة).';
    }
  }

  private validateMedicalNote(note: string, originalTranscript: string): boolean {
    // Basic validation checks for medical note quality
    if (!note || note.length < 50) {
      console.log('❌ Note too short');
      return false;
    }
    
    if (note.length > originalTranscript.length * 5) {
      console.log('❌ Note too long compared to transcript');
      return false;
    }
    
    // Check for common hallucination indicators (only if not in original)
    const suspiciousPatterns = [
      /patient.*denies.*drug.*use/i,
      /no.*known.*allergies/i,
      /vital.*signs.*stable/i,
      /further.*evaluation.*needed/i,
      /follow.*up.*in.*clinic/i,
      /تم.*الفحص.*السريري/i,
      /العلامات.*الحيوية.*مستقرة/i
    ];
    
    const hasHallucination = suspiciousPatterns.some(pattern => 
      pattern.test(note) && !pattern.test(originalTranscript)
    );
    
    if (hasHallucination) {
      console.log('❌ Potential hallucination detected in note');
      return false;
    }
    
    console.log('✅ Medical note passed validation');
    return true;
  }
}

// Export a singleton instance
export const llmRouter = new SimpleLLMRouter();
