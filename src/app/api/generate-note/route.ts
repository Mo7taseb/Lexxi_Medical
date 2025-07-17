import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateEnhancedFallbackNote } from '@/utils/fallbackNoteGenerator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { transcript, noteType } = await request.json();
    
    if (!transcript || !noteType) {
      return NextResponse.json({ error: 'Missing transcript or note type' }, { status: 400 });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('OpenAI API key not configured, using fallback');
      const fallbackNote = generateEnhancedFallbackNote({ transcript, noteType });
      return NextResponse.json({ note: fallbackNote, source: 'fallback' });
    }

    const prompt = generatePrompt(transcript, noteType);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant specialized in creating structured medical notes from transcribed conversations. You understand both Arabic and English medical terminology. Format your responses in Arabic unless specifically requested otherwise."
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
    
    return NextResponse.json({ note, source: 'ai' });
    
  } catch (error) {
    console.error('Note generation error:', error);
    
    // Get the original request data for fallback
    let transcript = '';
    let noteType = 'soap';
    
    try {
      // Try to parse the request body again (this might fail)
      const requestClone = request.clone();
      const body = await requestClone.json();
      transcript = body.transcript || '';
      noteType = body.noteType || 'soap';
    } catch {
      // If parsing fails, we'll use default values
      console.log('Could not parse request body for fallback, using defaults');
    }
    
    // Fallback to enhanced note generation if OpenAI fails
    const fallbackNote = generateEnhancedFallbackNote({ transcript, noteType });
    return NextResponse.json({ note: fallbackNote, source: 'fallback' });
  }
}

function generatePrompt(transcript: string, noteType: string): string {
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
