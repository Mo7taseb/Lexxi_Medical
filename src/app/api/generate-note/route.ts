import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SimpleLLMRouter } from '@/utils/simpleLLMRouter';
import { generateEnhancedFallbackNote } from '@/utils/fallbackNoteGenerator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { transcript, noteType, language = 'ar' } = await request.json();
    
    if (!transcript || !noteType) {
      return NextResponse.json({ error: 'Missing transcript or note type' }, { status: 400 });
    }

    console.log(`🏥 Generating ${noteType} note (${language}): ${transcript.substring(0, 100)}...`);

    // Try Smart LLM Router first (free cloud + local options)
    const router = new SimpleLLMRouter();
    
    try {
      const noteResult = await router.generateMedicalNote(transcript, noteType, language as 'ar' | 'en');
      console.log(`✅ Note generated using ${noteResult.source}`);

      return NextResponse.json({
        note: noteResult.note,
        source: noteResult.source,
        confidence: 0.9
      });
    } catch (routerError) {
      console.log('Smart LLM Router failed, trying OpenAI...', routerError);
    }

    // Fallback to OpenAI if available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      console.log('Using OpenAI as fallback...');
      
      const prompt = generatePrompt(transcript, noteType, language);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: language === 'ar' ? 
              "أنت مساعد طبي ذكي متخصص في إنشاء التقارير الطبية المنظمة من المحادثات المفرغة. تفهم المصطلحات الطبية العربية والإنجليزية. قم بالرد باللغة العربية ما لم يُطلب خلاف ذلك." :
              "You are a medical AI assistant specialized in creating structured medical notes from transcribed conversations. You understand both Arabic and English medical terminology."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      const note = completion.choices[0]?.message?.content || '';
      console.log('✅ Note generated with OpenAI');
      
      return NextResponse.json({ note, source: 'openai', confidence: 0.95 });
    }

    // Final fallback to enhanced note generation
    console.log('Using enhanced fallback note generator...');
    const fallbackNote = generateEnhancedFallbackNote({ transcript, noteType, language });
    return NextResponse.json({ note: fallbackNote, source: 'fallback', confidence: 0.3 });
    
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
    return NextResponse.json({ note: fallbackNote, source: 'error-fallback', confidence: 0.1 });
  }
}

function generatePrompt(transcript: string, noteType: string, language: string = 'ar'): string {
  if (language === 'en') {
    const basePrompt = `Please convert the following transcript into a structured, professional medical report:

Transcript:
"${transcript}"

`;

    const englishTypePrompts = {
      soap: `Create a SOAP note in English with the following format:

**SUBJECTIVE (S):**
- Patient complaints and symptoms
- Current illness history
- Associated symptoms

**OBJECTIVE (O):**
- Vital signs
- Physical examination results
- Laboratory tests (if any)

**ASSESSMENT (A):**
- Primary diagnosis
- Differential diagnosis
- Severity assessment

**PLAN (P):**
- Medication therapy
- Patient instructions
- Follow-up appointments`,

      progress: `Create a Progress Note in English with the following format:

**Current Status Assessment:**
- Current symptoms
- Patient response to previous treatment

**Changes Since Last Visit:**
- Improvement or deterioration
- New symptoms

**Treatment Plan Modification:**
- Medication changes (if needed)
- New instructions
- Required follow-up`,

      consultation: `Create a Consultation Note in English with the following format:

**Reason for Consultation:**
- Referral reason
- Clinical question

**Assessment:**
- Case evaluation
- Medical history review

**Recommendations:**
- Opinions and recommendations
- Proposed plan
- Need for additional follow-up`,

      discharge: `Create a Discharge Summary in English with the following format:

**Hospital Stay Summary:**
- Admission reason
- Length of stay
- Treatment provided

**Final Diagnosis:**
- Primary diagnosis
- Secondary diagnoses

**Patient Condition at Discharge:**
- Symptom improvement
- General condition

**Instructions and Follow-up:**
- Required medications
- Follow-up appointments
- Patient instructions`,

      freeform: `Create a detailed medical report in English including:

**Case Summary:**
- Comprehensive description of patient condition
- Symptoms and signs

**Medical Assessment:**
- Medical impression
- Probable diagnosis

**Recommendations:**
- Proposed treatment
- Required follow-up`
    };

    return basePrompt + (englishTypePrompts[noteType as keyof typeof englishTypePrompts] || englishTypePrompts.freeform);
  }

  // Arabic version (default)
  const basePrompt = `من فضلك قم بتحويل النص المفرغ التالي إلى تقرير طبي منظم ومهني:

النص المفرغ:
"${transcript}"

`;

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

**تقييم الحالة الحالية:**
- الأعراض الحالية
- استجابة المريض للعلاج السابق

**التطور منذ الزيارة الأخيرة:**
- التحسن أو التدهور
- الأعراض الجديدة

**تعديل الخطة العلاجية:**
- تغيير الأدوية (إن لزم)
- تعليمات جديدة
- المتابعة المطلوبة`,

    consultation: `أنشئ تقرير استشارة باللغة العربية مع التنسيق التالي:

**سبب الاستشارة:**
- سبب الإحالة
- السؤال المطروح

**التقييم:**
- فحص الحالة
- مراجعة التاريخ المرضي

**التوصيات:**
- الآراء والتوصيات
- الخطة المقترحة
- الحاجة لمتابعة إضافية`,

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
