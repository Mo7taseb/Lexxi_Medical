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

**Date of assessment:**
${timestamp}

**Patient identification:**
• Patient requires proper identification
• Age, gender, and relevant identifiers needed

**Brief hospital course:**
• Hospital stay details: Requires medical record review
• Key events: As documented in medical records
• Treatment provided: ${medicalTerms.length > 0 ? `Related to ${medicalTerms.slice(0, 3).join(', ')}` : 'Comprehensive care provided'}

**Interval history:**
${symptoms.length > 0 ? 
  symptoms.map(symptom => `• Changes noted: ${symptom}`).join('\n') : 
  `• ${transcript.split('\n')[0] || 'Patient reports interval changes'}`
}
• New concerns: As per patient report
• Patient-reported status: Requires evaluation

**Physical examination:**
• Current vital signs: Need to be measured
• Focused examination: ${medicalTerms.length > 0 ? 
  `Areas of focus: ${medicalTerms.slice(0, 3).join(', ')}` : 
  'Comprehensive examination needed'
}
• Changes from previous: Requires comparison

**Investigations:**
• Recent test results: Pending review
• Trending values: Need laboratory correlation
• Additional studies: As clinically indicated

**Assessment:**
• Current clinical status: Requires medical evaluation
• Treatment response: Ongoing assessment needed
• Updated problem list: To be reviewed

**Plan:**
• Treatment modifications: As per clinical assessment
• New interventions: Based on current status
• Discharge considerations: Ongoing evaluation

**Original Text:**
${transcript}

**Note:** This report was generated automatically and requires specialized medical review.`;
  }

  // Arabic version (default)
  return `تقرير متابعة - ${timestamp}

**تاريخ التقييم:**
${timestamp}

**تعريف المريض:**
• المريض يحتاج للتعريف المناسب
• العمر والجنس والمعرفات ذات الصلة مطلوبة

**مسار المستشفى المختصر:**
• تفاصيل الإقامة في المستشفى: تحتاج لمراجعة السجل الطبي
• الأحداث الرئيسية: كما هو موثق في السجلات الطبية
• العلاج المقدم: ${medicalTerms.length > 0 ? `متعلق بـ ${medicalTerms.slice(0, 3).join('، ')}` : 'تم تقديم رعاية شاملة'}

**التاريخ الفاصل:**
${symptoms.length > 0 ? 
  symptoms.map(symptom => `• التغييرات المسجلة: ${symptom}`).join('\n') : 
  `• ${transcript.split('\n')[0] || 'المريض يبلغ عن تغييرات فترة'}`
}
• مخاوف جديدة: كما ورد في تقرير المريض
• الحالة المبلغ عنها من المريض: تحتاج للتقييم

**الفحص البدني:**
• العلامات الحيوية الحالية: تحتاج للقياس
• الفحص المركز: ${medicalTerms.length > 0 ? 
  `مناطق التركيز: ${medicalTerms.slice(0, 3).join('، ')}` : 
  'يحتاج لفحص شامل'
}
• التغييرات من السابق: تحتاج للمقارنة

**الفحوصات:**
• نتائج الفحوصات الأخيرة: في انتظار المراجعة
• القيم الاتجاهية: تحتاج لارتباط مخبري
• دراسات إضافية: كما هو مبين سريرياً

**التقييم:**
• الحالة السريرية الحالية: تحتاج للتقييم الطبي
• الاستجابة للعلاج: التقييم المستمر مطلوب
• قائمة المشاكل المحدثة: للمراجعة

**الخطة:**
• تعديلات العلاج: كما هو مطلوب في التقييم السريري
• تدخلات جديدة: بناءً على الحالة الحالية
• اعتبارات الخروج: التقييم المستمر

**النص الأصلي:**
${transcript}

**ملاحظة:** هذا التقرير تم إنشاؤه تلقائياً ويحتاج لمراجعة طبية متخصصة.`;
}

function generateConsultationNote(transcript: string, medicalTerms: string[], symptoms: string[], timestamp: string, language: string = 'ar'): string {
  if (language === 'en') {
    return `Consultation Report - ${timestamp}

**Date of consult:**
${timestamp}

**Reason of consult:**
• Primary reason: ${symptoms.length > 0 ? symptoms[0] : 'General medical consultation'}
• Referral indication: Requires medical evaluation

**Patient identification:**
Patient requires proper identification and documentation

**Past medical history:**
• Previous conditions: Requires medical record review
• Surgical history: As documented
• Significant events: From available information

**Home medications:**
• Current medications: Requires medication reconciliation with specific dosages and frequencies
• Recent changes: To be documented with exact dosages

**Allergies:**
• Known allergies: Requires patient interview
• Drug allergies: Need verification
• Environmental allergies: To be assessed

**Social history:**
• Lifestyle factors: Requires assessment
• Occupational history: To be documented
• Family history: If relevant

**History of presenting illness:**
${symptoms.length > 0 ? 
  `Patient presents with a history of ${symptoms.join(', ')}. The condition has developed over time with various symptoms and concerns. ${transcript.split('.')[0] || 'Further details from consultation are being documented'}.` : 
  `Patient presents with current concerns requiring medical evaluation. ${transcript.split('.')[0] || 'The presentation involves multiple symptoms and requires comprehensive assessment'}.`
}

**Physical examination:**
• Vital signs: Need to be measured
• Systematic examination: ${medicalTerms.length > 0 ? 
  `Focus on: ${medicalTerms.slice(0, 4).join(', ')}` : 
  'Comprehensive examination required'
}

**Investigation:**
**Lab work:**
• Laboratory results: Pending or to be ordered
• Additional tests: As clinically indicated

**Imaging:**
• Date: [To be documented]
• Type: [Imaging studies as needed]
• Site: [Based on clinical assessment]
• Result: [Results to be documented when available]

**Microbiology:**
• Date: [If applicable]
• Type: [Culture studies as indicated]
• Site: [Specimen collection site]
• Result: [Sensitivity testing and organism identification]

**Others:**
• Specialized tests: As required
• Additional investigations: Based on presentation

**Assessment:**
• Clinical impression: Requires specialized evaluation
• Differential diagnosis: Based on findings
• Priority assessment: To be determined

**Plan:**
• Treatment recommendations: Based on assessment
• Follow-up arrangements: As needed
• Additional investigations: If required

**Original Text:**
${transcript}

**Note:** This report was generated automatically and requires specialized medical review.`;
  }

  // Arabic version (default)
  return `تقرير استشارة - ${timestamp}

**تاريخ الاستشارة:**
${timestamp}

**سبب الاستشارة:**
• السبب الأساسي: ${symptoms.length > 0 ? symptoms[0] : 'استشارة طبية عامة'}
• مؤشر الإحالة: يتطلب تقييماً طبياً

**تعريف المريض:**
المريض يتطلب التوثيق والتعريف المناسب

**التاريخ المرضي السابق:**
• الحالات السابقة: تتطلب مراجعة السجل الطبي
• التاريخ الجراحي: كما هو موثق
• الأحداث المهمة: من المعلومات المتاحة

**أدوية المنزل:**
• الأدوية الحالية: تتطلب توفيق الأدوية مع الجرعات والتكرار المحدد
• التغييرات الأخيرة: ليتم توثيقها مع الجرعات الدقيقة

**الحساسية:**
• الحساسيات المعروفة: تتطلب مقابلة المريض
• حساسية الأدوية: تحتاج للتحقق
• الحساسيات البيئية: ليتم تقييمها

**التاريخ الاجتماعي:**
• عوامل نمط الحياة: تتطلب التقييم
• التاريخ المهني: ليتم توثيقه
• التاريخ العائلي: إذا كان ذا صلة

**تاريخ المرض الحالي:**
${symptoms.length > 0 ? 
  `يحضر المريض بتاريخ مرضي يتضمن ${symptoms.join('، ')}. تطورت الحالة مع مرور الوقت مع أعراض ومخاوف مختلفة. ${transcript.split('.')[0] || 'تفاصيل إضافية من الاستشارة يتم توثيقها'}.` : 
  `يحضر المريض بمخاوف حالية تتطلب تقييماً طبياً. ${transcript.split('.')[0] || 'العرض يتضمن أعراضاً متعددة ويتطلب تقييماً شاملاً'}.`
}

**الفحص البدني:**
• العلامات الحيوية: تحتاج للقياس
• الفحص المنتظم: ${medicalTerms.length > 0 ? 
  `التركيز على: ${medicalTerms.slice(0, 4).join('، ')}` : 
  'فحص شامل مطلوب'
}

**الفحوصات:**
**الفحوصات المخبرية:**
• نتائج المختبر: معلقة أو ليتم طلبها
• اختبارات إضافية: كما هو مبين سريرياً

**التصوير:**
• التاريخ: [ليتم توثيقه]
• النوع: [دراسات التصوير حسب الحاجة]
• الموقع: [بناءً على التقييم السريري]
• النتيجة: [النتائج ليتم توثيقها عند توفرها]

**علم الأحياء الدقيقة:**
• التاريخ: [إذا كان قابلاً للتطبيق]
• النوع: [دراسات الزراعة كما هو مبين]
• الموقع: [موقع جمع العينة]
• النتيجة: [اختبار الحساسية وتحديد الكائن]

**أخرى:**
• اختبارات متخصصة: كما هو مطلوب
• تحقيقات إضافية: بناءً على العرض

**التقييم:**
• الانطباع السريري: يتطلب تقييماً متخصصاً
• التشخيص التفريقي: بناءً على النتائج
• تقييم الأولوية: ليتم تحديده

**الخطة:**
• توصيات العلاج: بناءً على التقييم
• ترتيبات المتابعة: حسب الحاجة
• تحقيقات إضافية: إذا لزم الأمر

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
