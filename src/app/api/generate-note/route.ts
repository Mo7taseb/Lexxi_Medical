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

**Date of assessment:**
[Current date and time]

**Patient identification:**
- Patient demographics and identifiers
- Age, gender, relevant identifiers

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
- Ongoing treatment modifications
- New interventions
- Discharge planning considerations`,

      consultation: `Create a Consultation Note in English with the following format:

**Date of consult:**
[Current date and time]

**Reason of consult:**
- Primary reason for consultation
- Referral indication

**Patient identification:**
- Patient demographics and identifiers
- Age, gender, relevant identifiers

**Past medical history:**
- Previous medical conditions
- Surgical history
- Significant medical events

**Home medications:**
- Current medications
- Dosages and frequencies
- Recent medication changes

**Allergies:**
- Known drug allergies
- Food or environmental allergies
- Allergy reactions

**Social history:**
- Smoking, alcohol, drug use
- Occupation and lifestyle factors
- Family history if relevant

**History of presenting illness:**
- Detailed description of current problem
- Timeline and progression
- Associated symptoms

**Physical examination:**
- Vital signs
- Systematic physical findings
- Relevant examination results

**Investigation:**
**Lab work:**
- Laboratory test results
- Pending lab work

**Imaging:**
- Radiology results
- Imaging studies ordered

**Microbiology:**
- Culture results
- Microbiology findings

**Others:**
- Additional diagnostic tests
- Specialized investigations

**Assessment:**
- Clinical impression
- Differential diagnosis
- Problem prioritization

**Plan:**
- Treatment recommendations
- Follow-up arrangements
- Further investigations needed`,

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
