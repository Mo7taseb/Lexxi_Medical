import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SimpleLLMRouter } from '@/utils/simpleLLMRouter';
import { generateEnhancedFallbackNote } from '@/utils/fallbackNoteGenerator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to clean unwanted prefixes from generated notes
function cleanNoteContent(content: string, language: string): string {
  if (!content) return content;

  console.log(`🧹 Starting cleaning process for ${language.toUpperCase()}`);
  console.log(`🧹 Original content (first 300 chars): "${content.substring(0, 300)}..."`);

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
    console.log(`🧹 Cleaning iteration ${iterations}`);
    
    for (const prefix of prefixes) {
      const regex = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i');
      const beforeLength = cleaned.length;
      cleaned = cleaned.replace(regex, '');
      if (cleaned.length !== beforeLength) {
        hasChanged = true;
        console.log(`🧹 Removed prefix: "${prefix}"`);
      }
    }
    
    // Remove any leading colons, dashes, or whitespace that might be left
    const beforeLength = cleaned.length;
    cleaned = cleaned.replace(/^[:\-\s\n\r]+/, '');
    if (cleaned.length !== beforeLength) {
      hasChanged = true;
      console.log(`🧹 Removed leading punctuation/whitespace`);
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
      console.log(`🧹 Removed pattern match`);
    }
  }

  const finalCleaned = cleaned.trim();
  console.log(`🧹 Final cleaned content (first 300 chars): "${finalCleaned.substring(0, 300)}..."`);
  console.log(`🧹 Cleaning complete. Original length: ${content.length}, Final length: ${finalCleaned.length}`);
  
  return finalCleaned;
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, noteType, language = 'ar' } = await request.json();
    
    if (!transcript || !noteType) {
      return NextResponse.json({ error: 'Missing transcript or note type' }, { status: 400 });
    }

    console.log(`🏥 Generating ${noteType} note in ${language.toUpperCase()}: ${transcript.substring(0, 100)}...`);

    // Try Smart LLM Router first (free cloud + local options)
    const router = new SimpleLLMRouter();
    
    try {
      console.log(`🤖 Attempting note generation with SimpleLLMRouter (${language})`);
      const noteResult = await router.generateMedicalNote(transcript, noteType, language as 'ar' | 'en');
      console.log(`🔍 Raw SimpleLLMRouter response (first 200 chars): "${noteResult.note.substring(0, 200)}..."`);
      const cleanedNote = cleanNoteContent(noteResult.note, language);
      console.log(`🧹 Cleaned note (first 200 chars): "${cleanedNote.substring(0, 200)}..."`);
      console.log(`✅ Note generated using ${noteResult.source} in ${language.toUpperCase()}`);

      return NextResponse.json({
        note: cleanedNote,
        source: noteResult.source,
        confidence: 0.9,
        language: language
      });
    } catch (routerError) {
      console.log(`⚠️ Smart LLM Router failed (${language}), trying OpenAI...`, routerError);
    }

    // Fallback to OpenAI if available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      console.log(`🤖 Using OpenAI as fallback for ${language.toUpperCase()} note generation...`);
      
      const prompt = generatePrompt(transcript, noteType, language);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: language === 'ar' ? 
              "أنت مساعد طبي ذكي متخصص في إنشاء التقارير الطبية المنظمة من المحادثات المفرغة. تفهم المصطلحات الطبية العربية والإنجليزية. قم بالرد باللغة العربية ما لم يُطلب خلاف ذلك. ابدأ مباشرة بالتقرير الطبي بدون أي مقدمات أو عبارات تمهيدية مثل 'إليك التقرير' أو 'فيما يلي'." :
              "You are an expert medical AI assistant specialized in creating structured, professional medical documentation from transcribed conversations. You have comprehensive knowledge of medical terminology, clinical workflows, and healthcare documentation standards. Generate clear, concise, and clinically accurate medical notes following established medical documentation practices. Use appropriate medical terminology and maintain professional formatting throughout. START DIRECTLY with the medical report content without any introductory phrases like 'Here is the', 'The following is', or similar prefixes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      const rawNote = completion.choices[0]?.message?.content || '';
      console.log(`🔍 Raw OpenAI response (first 200 chars): "${rawNote.substring(0, 200)}..."`);
      const cleanedNote = cleanNoteContent(rawNote, language);
      console.log(`🧹 Cleaned note (first 200 chars): "${cleanedNote.substring(0, 200)}..."`);
      console.log(`✅ Note generated with OpenAI in ${language.toUpperCase()}`);
      
      return NextResponse.json({ 
        note: cleanedNote, 
        source: 'openai', 
        confidence: 0.95,
        language: language
      });
    }

    // Final fallback to enhanced note generation
    console.log(`📝 Using enhanced fallback note generator for ${language.toUpperCase()}...`);
    const fallbackNote = generateEnhancedFallbackNote({ transcript, noteType, language });
    const cleanedFallbackNote = cleanNoteContent(fallbackNote, language);
    return NextResponse.json({ 
      note: cleanedFallbackNote, 
      source: 'fallback', 
      confidence: 0.3,
      language: language
    });
    
  } catch (error) {
    console.error('Note generation error:', error);
    
    // Get the original request data for final fallback
    let transcript = '';
    let noteType = 'soap';
    let language = 'ar';
    
    try {
      const requestClone = request.clone();
      const body = await requestClone.json();
      transcript = body.transcript || '';
      noteType = body.noteType || 'soap';
      language = body.language || 'ar';
    } catch {
      console.log('Could not parse request body for fallback, using defaults');
    }
    
    // Final fallback
    const fallbackNote = generateEnhancedFallbackNote({ transcript, noteType, language });
    const cleanedErrorFallbackNote = cleanNoteContent(fallbackNote, language);
    return NextResponse.json({ note: cleanedErrorFallbackNote, source: 'error-fallback', confidence: 0.1 });
  }
}

function generatePrompt(transcript: string, noteType: string, language: string = 'ar'): string {
  if (language === 'en') {
    const basePrompt = `Convert the following transcript into a structured, professional medical report. START DIRECTLY with the report content without any introductory phrases.

Transcript:
"${transcript}"

Generate the report immediately in the requested format:`;

    const englishTypePrompts = {
      soap: `Create a comprehensive SOAP note in English following medical documentation standards:

**SUBJECTIVE (S):**
- Chief complaint (CC): Primary reason for the visit
- History of present illness (HPI): Detailed symptom description, onset, location, duration, characteristics, aggravating/alleviating factors, radiation, timing, severity
- Review of systems (ROS): Pertinent positive and negative findings
- Past medical history (PMH): Relevant medical conditions
- Medications: Current prescriptions and over-the-counter medications
- Allergies: Drug allergies and reactions
- Social history: Smoking, alcohol, occupation as relevant

**OBJECTIVE (O):**
- Vital signs: Temperature, blood pressure, heart rate, respiratory rate, oxygen saturation, weight
- Physical examination: Systematic examination findings organized by body systems
- Laboratory results: Recent lab values if available
- Imaging studies: Radiology findings if applicable
- Other diagnostic tests: EKG, procedures, etc.

**ASSESSMENT (A):**
- Primary diagnosis with ICD-10 code if known
- Differential diagnoses ranked by likelihood
- Problem list: Active medical problems
- Clinical reasoning: Assessment of findings and diagnostic thinking

**PLAN (P):**
- Diagnostic plan: Additional tests or studies needed
- Therapeutic plan: Medications, dosages, and instructions
- Patient education: Information provided to patient
- Follow-up: Return visit timing and conditions
- Monitoring: Parameters to track
- Referrals: Specialist consultations if needed`,

      progress: `Create a comprehensive Progress Note in English following medical documentation standards:

**DATE OF ASSESSMENT:**
${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

**PATIENT IDENTIFICATION:**
- Patient demographics and identifiers required
- Age, gender, and relevant medical record identifiers

**BRIEF HOSPITAL COURSE:**
- Summary of hospital stay and significant events
- Key interventions and treatments provided
- Response to therapy and clinical milestones

**INTERVAL HISTORY:**
- Changes since last assessment
- New symptoms, concerns, or complications
- Patient-reported improvements or deterioration
- Current functional status

**PHYSICAL EXAMINATION:**
- Current vital signs and trends
- Focused physical examination relevant to conditions
- Changes from previous examination
- Neurological status if applicable

**INVESTIGATIONS:**
- Recent laboratory results and trends
- Pending investigations and studies
- Imaging findings and interpretations
- Diagnostic test results

**ASSESSMENT:**
- Current clinical status and stability
- Response to ongoing treatments
- Updated problem list with priorities
- Risk assessment and prognosis

**PLAN:**
- Ongoing treatment modifications and adjustments
- New therapeutic interventions
- Monitoring parameters and frequency
- Discharge planning considerations
- Follow-up arrangements and timing`,

      consultation: `Create a comprehensive Consultation Note in English following medical documentation standards:

**DATE OF CONSULTATION:**
${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

**REASON FOR CONSULTATION:**
- Primary indication for specialist consultation
- Referring physician and specific questions
- Urgency level and clinical context

**PATIENT IDENTIFICATION:**
- Complete patient demographics
- Medical record number and identifiers
- Age, gender, and contact information

**PAST MEDICAL HISTORY:**
- Significant previous medical conditions
- Surgical history with dates and complications
- Hospitalizations and major medical events
- Relevant family history

**CURRENT MEDICATIONS:**
- Complete medication list with dosages
- Recent changes or adjustments
- Over-the-counter medications and supplements
- Medication adherence assessment

**ALLERGIES:**
- Known drug allergies with specific reactions
- Food allergies and environmental sensitivities
- Previous adverse drug reactions
- Allergy severity and management

**SOCIAL HISTORY:**
- Tobacco, alcohol, and substance use
- Occupational exposures and risks
- Social support system and living situation
- Relevant lifestyle factors

**HISTORY OF PRESENT ILLNESS:**
- Detailed chronological symptom progression
- Onset, duration, and character of symptoms
- Aggravating and alleviating factors
- Previous treatments and responses
- Impact on daily activities and quality of life

**PHYSICAL EXAMINATION:**
- Complete vital signs and anthropometrics
- Systematic physical examination by systems
- Focused examination relevant to consultation
- Abnormal findings and clinical significance

**DIAGNOSTIC STUDIES:**
**Laboratory Studies:**
- Recent laboratory results with reference ranges
- Trending of abnormal values
- Pending laboratory investigations

**Imaging Studies:**
- Radiology reports and interpretations
- Previous imaging for comparison
- Recommended additional imaging

**Other Studies:**
- Electrocardiogram and cardiac studies
- Pulmonary function tests
- Specialized diagnostic procedures

**CLINICAL ASSESSMENT:**
- Primary diagnosis with supporting evidence
- Differential diagnosis with likelihood ranking
- Severity assessment and risk stratification
- Prognosis and expected outcomes

**RECOMMENDATIONS:**
- Specific treatment recommendations with rationale
- Medication management and monitoring
- Lifestyle modifications and patient education
- Follow-up scheduling and monitoring parameters
- Coordination with other specialists if needed`,

      discharge: `Create a comprehensive Discharge Summary in English following medical documentation standards:

**DISCHARGE SUMMARY**
Date of Admission: [To be completed]
Date of Discharge: ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric'
})}

**ADMISSION DIAGNOSIS:**
- Primary reason for hospitalization
- Secondary diagnoses present on admission

**DISCHARGE DIAGNOSIS:**
- Primary diagnosis with ICD-10 codes
- Secondary diagnoses and complications
- Procedures performed during stay

**HOSPITAL COURSE:**
- Detailed summary of clinical progression
- Significant events and complications
- Response to treatments and interventions
- Consultations obtained and recommendations

**PROCEDURES PERFORMED:**
- Surgical procedures with dates and outcomes
- Diagnostic procedures and results
- Therapeutic interventions

**DISCHARGE MEDICATIONS:**
- Complete medication list with dosages
- New medications started during admission
- Discontinued medications with reasons
- Medication reconciliation completed

**DISCHARGE INSTRUCTIONS:**
- Activity restrictions and limitations
- Dietary modifications and restrictions
- Wound care and medical device management
- Signs and symptoms requiring immediate attention

**FOLLOW-UP CARE:**
- Scheduled appointments with primary care
- Specialist follow-up arrangements
- Laboratory or imaging studies needed
- Rehabilitation services if applicable

**PATIENT CONDITION AT DISCHARGE:**
- Overall clinical stability
- Functional status and mobility
- Mental status and cognitive function
- Discharge disposition and support needs`,

      freeform: `Create a comprehensive medical report in English following clinical documentation standards:

**CLINICAL SUMMARY**
Date: ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric'
})}

**PATIENT PRESENTATION:**
- Chief complaint and presenting symptoms
- Duration and progression of symptoms
- Functional impact and severity assessment

**CLINICAL FINDINGS:**
- Relevant physical examination findings
- Vital signs and clinical measurements
- Objective observations and assessments

**DIAGNOSTIC CONSIDERATIONS:**
- Primary diagnostic impression
- Differential diagnoses considered
- Clinical reasoning and evidence basis

**MANAGEMENT RECOMMENDATIONS:**
- Therapeutic interventions recommended
- Monitoring parameters and follow-up care
- Patient education and counseling provided
- Coordination with other healthcare providers

**CLINICAL ASSESSMENT:**
- Overall patient condition and prognosis
- Risk factors and preventive measures
- Quality of life considerations
- Long-term management planning`
    };

    return basePrompt + (englishTypePrompts[noteType as keyof typeof englishTypePrompts] || englishTypePrompts.freeform);
  }

  // Arabic version (default)
  const basePrompt = `قم بتحويل النص المفرغ التالي إلى تقرير طبي منظم ومهني. ابدأ مباشرة بالتقرير بدون أي مقدمات.

النص المفرغ:
"${transcript}"

أنشئ التقرير مباشرة بالتنسيق المطلوب:`;

  const typeSpecificPrompts = {
    soap: `أنشئ تقرير SOAP باللغة العربية مع التنسيق التالي:

**الأعراض الذاتية (S - Subjective):**
- ما يشكو منه المريض
- تاريخ الحالة الحالية
- الأعراض المصاحبة

**الفحص الموضوعي (O - Objective):**
- العلامات الحيوية
- نتائج الفحص البدني
- الفحوصات المخبرية (إن وجدت)

**التقييم والتشخيص (A - Assessment):**
- التشخيص الأولي
- التشخيص التفريقي
- تقييم شدة الحالة

**الخطة العلاجية (P - Plan):**
- العلاج الدوائي
- التعليمات للمريض
- مواعيد المتابعة`,

    progress: `أنشئ تقرير متابعة باللغة العربية مع التنسيق التالي:

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
- اعتبارات تخطيط الخروج`,

    consultation: `أنشئ تقرير استشارة باللغة العربية مع التنسيق التالي:

**تاريخ الاستشارة:**
[التاريخ والوقت الحالي]

**سبب الاستشارة:**
- السبب الأساسي للاستشارة
- مؤشر الإحالة

**تعريف المريض:**
- البيانات الديموغرافية للمريض والمعرفات
- العمر والجنس والمعرفات ذات الصلة

**التاريخ المرضي السابق:**
- الحالات الطبية السابقة
- التاريخ الجراحي
- الأحداث الطبية المهمة

**أدوية المنزل:**
- الأدوية الحالية
- الجرعات والتكرار
- التغييرات الحديثة في الأدوية

**الحساسية:**
- حساسية الأدوية المعروفة
- حساسية الطعام أو البيئة
- ردود فعل الحساسية

**التاريخ الاجتماعي:**
- التدخين والكحول وتعاطي المخدرات
- المهنة وعوامل نمط الحياة
- التاريخ العائلي إذا كان ذا صلة

**تاريخ المرض الحالي:**
- وصف تفصيلي للمشكلة الحالية
- الجدول الزمني والتطور
- الأعراض المصاحبة

**الفحص البدني:**
- العلامات الحيوية
- النتائج البدنية المنتظمة
- نتائج الفحص ذات الصلة

**الفحوصات:**
**الفحوصات المخبرية:**
- نتائج الفحوصات المخبرية
- الأعمال المخبرية المعلقة

**التصوير:**
- نتائج الأشعة
- دراسات التصوير المطلوبة

**علم الأحياء الدقيقة:**
- نتائج الزراعة
- نتائج علم الأحياء الدقيقة

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
- التحقيقات الأخرى المطلوبة`,

    discharge: `أنشئ تقرير خروج باللغة العربية مع التنسيق التالي:

**ملخص الإقامة:**
- سبب الدخول
- مدة الإقامة
- العلاج المقدم

**التشخيص النهائي:**
- التشخيص الأساسي
- التشخيصات الثانوية

**حالة المريض عند الخروج:**
- تحسن الأعراض
- الحالة العامة

**التعليمات والمتابعة:**
- الأدوية المطلوبة
- مواعيد المتابعة
- التعليمات للمريض`,

    freeform: `أنشئ تقرير طبي مفصل باللغة العربية يتضمن:

**ملخص الحالة:**
- وصف شامل لحالة المريض
- الأعراض والعلامات

**التقييم الطبي:**
- الانطباع الطبي
- التشخيص المحتمل

**التوصيات:**
- العلاج المقترح
- المتابعة المطلوبة`
  };

  return basePrompt + (typeSpecificPrompts[noteType as keyof typeof typeSpecificPrompts] || typeSpecificPrompts.freeform);
}
