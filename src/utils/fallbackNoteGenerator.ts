// Enhanced fallback note generation utilities
export interface NoteData {
  transcript: string;
  noteType: string;
  language?: string;
}

export function generateEnhancedFallbackNote(data: NoteData): string {
  const { transcript, noteType, language = 'ar' } = data;
  const timestamp = new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');
  
  // Extract key medical terms and symptoms from transcript
  const medicalTerms = extractMedicalTerms(transcript);
  const symptoms = extractSymptoms(transcript);
  
  switch (noteType) {
    case 'soap':
      return generateSOAPNote(transcript, medicalTerms, symptoms, timestamp, language);
    case 'progress':
      return generateProgressNote(transcript, medicalTerms, symptoms, timestamp, language);
    case 'consultation':
      return generateConsultationNote(transcript, medicalTerms, symptoms, timestamp, language);
    case 'discharge':
      return generateDischargeNote(transcript, medicalTerms, symptoms, timestamp, language);
    case 'freeform':
    default:
      return generateFreeformNote(transcript, medicalTerms, symptoms, timestamp, language);
  }
}

function extractMedicalTerms(transcript: string): string[] {
  const arabicMedicalTerms = [
    'ألم', 'وجع', 'صداع', 'حرارة', 'سخونة', 'برد', 'سعال', 'دوخة', 'غثيان',
    'قيء', 'إسهال', 'إمساك', 'طفح', 'حكة', 'تورم', 'التهاب', 'عدوى',
    'ضغط', 'سكر', 'قلب', 'صدر', 'بطن', 'ظهر', 'رقبة', 'رأس', 'عين',
    'أذن', 'حلق', 'كتف', 'ذراع', 'يد', 'ساق', 'قدم', 'مفصل', 'عضلة',
    'عظم', 'جلد', 'دم', 'بول', 'براز', 'نوم', 'تعب', 'إرهاق', 'ضعف'
  ];
  
  const englishMedicalTerms = [
    'pain', 'headache', 'fever', 'cough', 'nausea', 'vomiting', 'diarrhea',
    'constipation', 'rash', 'swelling', 'infection', 'pressure', 'diabetes',
    'heart', 'chest', 'stomach', 'back', 'neck', 'head', 'eye', 'ear',
    'throat', 'shoulder', 'arm', 'hand', 'leg', 'foot', 'joint', 'muscle',
    'bone', 'skin', 'blood', 'urine', 'stool', 'sleep', 'fatigue', 'weakness'
  ];
  
  const allTerms = [...arabicMedicalTerms, ...englishMedicalTerms];
  const foundTerms: string[] = [];
  
  allTerms.forEach(term => {
    if (transcript.toLowerCase().includes(term.toLowerCase())) {
      foundTerms.push(term);
    }
  });
  
  return foundTerms;
}

function extractSymptoms(transcript: string): string[] {
  const symptoms: string[] = [];
  
  // Common symptom patterns in Arabic
  const arabicSymptomPatterns = [
    /يشكو من (.+?)(?:\.|،|$)/g,
    /يعاني من (.+?)(?:\.|،|$)/g,
    /لديه (.+?)(?:\.|،|$)/g,
    /يشعر بـ(.+?)(?:\.|،|$)/g,
    /عنده (.+?)(?:\.|،|$)/g
  ];
  
  // Common symptom patterns in English
  const englishSymptomPatterns = [
    /complains of (.+?)(?:\.|,|$)/gi,
    /suffers from (.+?)(?:\.|,|$)/gi,
    /has (.+?)(?:\.|,|$)/gi,
    /feels (.+?)(?:\.|,|$)/gi,
    /experiences (.+?)(?:\.|,|$)/gi
  ];
  
  [...arabicSymptomPatterns, ...englishSymptomPatterns].forEach(pattern => {
    const matches = transcript.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const symptom = match.replace(pattern, '$1').trim();
        if (symptom.length > 2) {
          symptoms.push(symptom);
        }
      });
    }
  });
  
  return symptoms;
}

function generateSOAPNote(transcript: string, medicalTerms: string[], symptoms: string[], timestamp: string, language: string = 'ar'): string {
  if (language === 'en') {
    return `SOAP Report - ${timestamp}

**SUBJECTIVE (S):**
${symptoms.length > 0 ? 
  symptoms.map(symptom => `• ${symptom}`).join('\n') : 
  `• ${transcript.split('\n')[0] || 'Patient presents with various symptoms'}`
}

**OBJECTIVE (O):**
• Vital signs: Need to be measured
• Physical examination: ${medicalTerms.length > 0 ? 
  `Examination of areas related to: ${medicalTerms.slice(0, 5).join(', ')}` : 
  'Comprehensive examination needed'
}
• Laboratory tests: As indicated

**ASSESSMENT (A):**
• Primary diagnosis: Requires specialized medical evaluation
• Differential diagnosis: Needs symptom and test review
• Condition severity: Requires assessment

**PLAN (P):**
• Medication therapy: According to diagnosis
• Patient instructions: Rest and follow-up
• Follow-up appointments: As needed

**Original Text:**
${transcript}

**Note:** This report was generated automatically and requires specialized medical review.`;
  }

  // Arabic version (default)
  return `تقرير SOAP - ${timestamp}

**الأعراض الذاتية (S - Subjective):**
${symptoms.length > 0 ? 
  symptoms.map(symptom => `• ${symptom}`).join('\n') : 
  `• ${transcript.split('\n')[0] || 'المريض يشكو من أعراض متنوعة'}`
}

**الفحص الموضوعي (O - Objective):**
• العلامات الحيوية: تحتاج لقياس
• الفحص البدني: ${medicalTerms.length > 0 ? 
  `تم فحص المناطق المتعلقة بـ: ${medicalTerms.slice(0, 5).join('، ')}` : 
  'يحتاج لفحص شامل'
}
• الفحوصات المخبرية: حسب الحاجة

**التقييم والتشخيص (A - Assessment):**
• التشخيص الأولي: يحتاج لتقييم طبي متخصص
• التشخيص التفريقي: يحتاج لمراجعة الأعراض والفحوصات
• شدة الحالة: يحتاج لتقييم

**الخطة العلاجية (P - Plan):**
• العلاج الدوائي: حسب التشخيص
• التعليمات للمريض: الراحة والمتابعة
• مواعيد المتابعة: حسب الحاجة

**النص الأصلي:**
${transcript}

**ملاحظة:** هذا التقرير تم إنشاؤه تلقائياً ويحتاج لمراجعة طبية متخصصة.`;
}

function generateProgressNote(transcript: string, medicalTerms: string[], symptoms: string[], timestamp: string, language: string = 'ar'): string {
  if (language === 'en') {
    return `Progress Note - ${timestamp}

**Current Status:**
${symptoms.length > 0 ? 
  symptoms.map(symptom => `• ${symptom}`).join('\n') : 
  `• ${transcript.split('\n')[0] || 'General improvement in condition'}`
}

**Progress Since Last Visit:**
• Symptoms: ${medicalTerms.length > 0 ? 
  `Progress in: ${medicalTerms.slice(0, 3).join(', ')}` : 
  'Gradual improvement'
}
• Treatment response: Needs assessment
• New symptoms: As per evaluation

**Updated Plan:**
• Medication adjustment: As needed
• New instructions: Regular follow-up
• Next follow-up: As per condition

**Original Text:**
${transcript}

**Note:** This report was generated automatically and requires specialized medical review.`;
  }

  // Arabic version (default)
  return `تقرير متابعة - ${timestamp}

**الحالة الحالية:**
${symptoms.length > 0 ? 
  symptoms.map(symptom => `• ${symptom}`).join('\n') : 
  `• ${transcript.split('\n')[0] || 'تحسن عام في الحالة'}`
}

**التطور منذ الزيارة الأخيرة:**
• الأعراض: ${medicalTerms.length > 0 ? 
  `تطور في: ${medicalTerms.slice(0, 3).join('، ')}` : 
  'تحسن تدريجي'
}
• الاستجابة للعلاج: تحتاج لتقييم
• أعراض جديدة: حسب التقييم

**الخطة المحدثة:**
• تعديل الأدوية: حسب الحاجة
• تعليمات جديدة: المتابعة المنتظمة
• المتابعة القادمة: حسب الحالة

**النص الأصلي:**
${transcript}

**ملاحظة:** هذا التقرير تم إنشاؤه تلقائياً ويحتاج لمراجعة طبية متخصصة.`;
}

function generateConsultationNote(transcript: string, medicalTerms: string[], symptoms: string[], timestamp: string, language: string = 'ar'): string {
  if (language === 'en') {
    return `Consultation Report - ${timestamp}

**Reason for Consultation:**
• Referral: ${symptoms.length > 0 ? symptoms[0] : 'General medical consultation'}
• Question posed: Evaluate condition and provide recommendations

**Assessment:**
• Symptom review: ${medicalTerms.length > 0 ? 
  medicalTerms.slice(0, 4).join(', ') : 
  'Various symptoms'
}
• Examination: Needs specialized examination
• Medical history: According to available information

**Recommendations:**
• Medical opinion: Needs specialized evaluation
• Proposed plan: According to evaluation results
• Follow-up: As needed

**Original Text:**
${transcript}

**Note:** This report was generated automatically and requires specialized medical review.`;
  }

  // Arabic version (default)
  return `تقرير استشارة - ${timestamp}

**سبب الاستشارة:**
• الإحالة: ${symptoms.length > 0 ? symptoms[0] : 'استشارة طبية عامة'}
• السؤال المطروح: تقييم الحالة وإعطاء التوصيات

**التقييم:**
• مراجعة الأعراض: ${medicalTerms.length > 0 ? 
  medicalTerms.slice(0, 4).join('، ') : 
  'أعراض متنوعة'
}
• الفحص: يحتاج لفحص متخصص
• التاريخ المرضي: حسب المعلومات المتاحة

**التوصيات:**
• الرأي الطبي: يحتاج لتقييم متخصص
• الخطة المقترحة: حسب نتائج التقييم
• المتابعة: حسب الحاجة

**النص الأصلي:**
${transcript}

**ملاحظة:** هذا التقرير تم إنشاؤه تلقائياً ويحتاج لمراجعة طبية متخصصة.`;
}

function generateDischargeNote(transcript: string, medicalTerms: string[], symptoms: string[], timestamp: string, language: string = 'ar'): string {
  if (language === 'en') {
    return `Discharge Summary - ${timestamp}

**Hospital Stay Summary:**
• Admission reason: ${symptoms.length > 0 ? symptoms[0] : 'Medical condition requiring care'}
• Length of stay: According to medical record
• Treatment provided: ${medicalTerms.length > 0 ? 
  `Treatment related to: ${medicalTerms.slice(0, 3).join(', ')}` : 
  'Comprehensive treatment'
}

**Final Diagnosis:**
• Primary diagnosis: Needs determination by physician
• Secondary diagnoses: According to condition

**Patient Condition at Discharge:**
• General condition: Stable
• Symptoms: ${medicalTerms.length > 0 ? 
  `Improvement in: ${medicalTerms.slice(0, 2).join(', ')}` : 
  'General improvement'
}

**Instructions and Follow-up:**
• Medications: According to prescription
• Follow-up appointments: As recommended
• Instructions: Rest and treatment compliance

**Original Text:**
${transcript}

**Note:** This report was generated automatically and requires specialized medical review.`;
  }

  // Arabic version (default)
  return `تقرير خروج - ${timestamp}

**ملخص الإقامة:**
• سبب الدخول: ${symptoms.length > 0 ? symptoms[0] : 'حالة طبية تستدعي العناية'}
• مدة الإقامة: حسب السجل الطبي
• العلاج المقدم: ${medicalTerms.length > 0 ? 
  `علاج متعلق بـ: ${medicalTerms.slice(0, 3).join('، ')}` : 
  'علاج شامل'
}

**التشخيص النهائي:**
• التشخيص الأساسي: يحتاج لتحديد من قبل الطبيب
• التشخيصات الثانوية: حسب الحالة

**حالة المريض عند الخروج:**
• الحالة العامة: مستقرة
• الأعراض: ${medicalTerms.length > 0 ? 
  `تحسن في: ${medicalTerms.slice(0, 2).join('، ')}` : 
  'تحسن عام'
}

**التعليمات والمتابعة:**
• الأدوية: حسب الوصفة الطبية
• مواعيد المتابعة: حسب التوصيات
• التعليمات: الراحة والالتزام بالعلاج

**النص الأصلي:**
${transcript}

**ملاحظة:** هذا التقرير تم إنشاؤه تلقائياً ويحتاج لمراجعة طبية متخصصة.`;
}

function generateFreeformNote(transcript: string, medicalTerms: string[], symptoms: string[], timestamp: string, language: string = 'ar'): string {
  if (language === 'en') {
    return `Medical Report - ${timestamp}

**Case Summary:**
${transcript}

**Identified Symptoms:**
${symptoms.length > 0 ? 
  symptoms.map(symptom => `• ${symptom}`).join('\n') : 
  '• Symptoms need to be identified'
}

**Mentioned Medical Terms:**
${medicalTerms.length > 0 ? 
  medicalTerms.map(term => `• ${term}`).join('\n') : 
  '• No specific medical terms identified'
}

**Medical Assessment:**
• Initial impression: Needs specialized medical evaluation
• Possible diagnosis: According to symptoms and examination
• Plan: Determine appropriate treatment

**Recommendations:**
• Regular medical follow-up
• Compliance with medical instructions
• Consult physician if symptoms change

**Note:** This report was generated automatically and requires specialized medical review.`;
  }

  // Arabic version (default)
  return `تقرير طبي - ${timestamp}

**ملخص الحالة:**
${transcript}

**الأعراض المحددة:**
${symptoms.length > 0 ? 
  symptoms.map(symptom => `• ${symptom}`).join('\n') : 
  '• يحتاج لتحديد الأعراض'
}

**المصطلحات الطبية المذكورة:**
${medicalTerms.length > 0 ? 
  medicalTerms.map(term => `• ${term}`).join('\n') : 
  '• لا توجد مصطلحات طبية محددة'
}

**التقييم الطبي:**
• الانطباع الأولي: يحتاج لتقييم طبي متخصص
• التشخيص المحتمل: حسب الأعراض والفحص
• الخطة: تحديد العلاج المناسب

**التوصيات:**
• المتابعة الطبية المنتظمة
• الالتزام بالتعليمات الطبية
• مراجعة الطبيب عند تغير الأعراض

**ملاحظة:** هذا التقرير تم إنشاؤه تلقائياً ويحتاج لمراجعة طبية متخصصة.`;
}
