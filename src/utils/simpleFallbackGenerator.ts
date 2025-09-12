// Simplified fallback note generation with language support
export interface NoteData {
  transcript: string;
  noteType: string;
  language?: string;
}

export function generateEnhancedFallbackNote(data: NoteData): string {
  const { transcript, noteType, language = 'ar' } = data;
  const timestamp = new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');
  
  // Quick medical term extraction
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
  const arabicTerms = ['ألم', 'وجع', 'صداع', 'حرارة', 'سعال', 'دوخة', 'غثيان', 'قيء', 'إسهال', 'طفح', 'تورم', 'التهاب'];
  const englishTerms = ['pain', 'headache', 'fever', 'cough', 'nausea', 'vomiting', 'diarrhea', 'rash', 'swelling', 'infection'];
  
  const allTerms = [...arabicTerms, ...englishTerms];
  return allTerms.filter(term => transcript.toLowerCase().includes(term.toLowerCase()));
}

function extractSymptoms(transcript: string): string[] {
  // Basic symptom extraction
  const sentences = transcript.split(/[.!?]/).filter(s => s.trim());
  return sentences.slice(0, 3).map(s => s.trim());
}

function extractPatientInfo(transcript: string): {
  description: string;
  medicalHistory: string;
} {
  const text = transcript.toLowerCase();
  
  // Look for age and gender patterns
  const ageMatch = text.match(/(\d+)[-\s]?year[-\s]?old/);
  const genderMatch = text.match(/(male|female|man|woman|lady|gentleman)/);
  const locationMatch = text.match(/from\s+([^,\n]+)/);
  
  let description = '';
  if (ageMatch || genderMatch || locationMatch) {
    const age = ageMatch ? ageMatch[1] + '-year-old' : '';
    const gender = genderMatch ? genderMatch[1] : '';
    const location = locationMatch ? `from ${locationMatch[1]}` : '';
    description = [age, gender, location].filter(Boolean).join(' ');
  }
  
  // Look for medical history mentions
  let medicalHistory = '';
  if (text.includes('history of') || text.includes('previous') || text.includes('past')) {
    medicalHistory = 'Past medical history mentioned - details to be documented';
  }
  
  return { description, medicalHistory };
}

function extractSymptomDetails(transcript: string): {
  mainComplaint: string;
  presentingIllness: string;
  timeline: string;
  associatedSymptoms: string;
  aggravatingFactors: string;
  relievingFactors: string;
  clinicalImpression: string;
} {
  const text = transcript.toLowerCase();
  
  // Extract main complaint
  const complaintPatterns = [
    /presenting with\s+([^.]+)/,
    /complaining of\s+([^.]+)/,
    /chief complaint[:\s]+([^.]+)/,
    /main concern[:\s]+([^.]+)/
  ];
  
  let mainComplaint = '';
  for (const pattern of complaintPatterns) {
    const match = text.match(pattern);
    if (match) {
      mainComplaint = match[1].trim();
      break;
    }
  }
  
  // Extract timeline
  let timeline = '';
  const timePatterns = [
    /(\d+\s*(?:day|week|month|year)s?\s*(?:ago|history))/g,
    /(for\s+\d+\s*(?:day|week|month|year)s?)/g,
    /(since\s+[^.]+)/g
  ];
  
  for (const pattern of timePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      timeline = matches[0];
      break;
    }
  }
  
  // Extract aggravating/relieving factors
  let aggravatingFactors = '';
  let relievingFactors = '';
  
  if (text.includes('worse') || text.includes('worsens')) {
    const worseMatch = text.match(/(?:worse|worsens)(?:\s+when|\s+with|\s+by)\s+([^.]+)/);
    if (worseMatch) aggravatingFactors = worseMatch[1].trim();
  }
  
  if (text.includes('better') || text.includes('improves')) {
    const betterMatch = text.match(/(?:better|improves)(?:\s+when|\s+with|\s+by)\s+([^.]+)/);
    if (betterMatch) relievingFactors = betterMatch[1].trim();
  }
  
  // Generate clinical impression based on symptoms
  let clinicalImpression = '';
  if (text.includes('chest pain')) {
    clinicalImpression = 'Chest pain evaluation - consider cardiac, pulmonary, or musculoskeletal etiology';
  } else if (text.includes('shortness of breath') || text.includes('dyspnea')) {
    clinicalImpression = 'Dyspnea evaluation - consider cardiac or pulmonary causes';
  } else if (text.includes('headache')) {
    clinicalImpression = 'Headache evaluation - assess for primary vs secondary causes';
  } else if (text.includes('fever')) {
    clinicalImpression = 'Febrile illness - evaluate for infectious or inflammatory process';
  }
  
  return {
    mainComplaint,
    presentingIllness: mainComplaint || 'symptoms requiring medical evaluation',
    timeline,
    associatedSymptoms: '',
    aggravatingFactors,
    relievingFactors,
    clinicalImpression
  };
}

function generateSOAPNote(transcript: string, medicalTerms: string[], symptoms: string[], timestamp: string, language: string): string {
  if (language === 'en') {
    return `SOAP Report - ${timestamp}

**SUBJECTIVE (S):**
${symptoms.length > 0 ? symptoms.map(s => `• ${s}`).join('\n') : `• ${transcript.split('\n')[0] || 'Patient presents with various symptoms'}`}

**OBJECTIVE (O):**
• Vital signs: To be measured
• Physical examination: ${medicalTerms.length > 0 ? `Areas related to: ${medicalTerms.join(', ')}` : 'Comprehensive examination needed'}
• Laboratory tests: As indicated

**ASSESSMENT (A):**
• Primary diagnosis: Requires medical evaluation
• Differential diagnosis: Needs review
• Severity: To be assessed

**PLAN (P):**
• Treatment: According to diagnosis
• Instructions: Rest and follow-up
• Follow-up: As needed

**Original Text:** ${transcript}

**Note:** Auto-generated report requiring medical review.`;
  }

  return `تقرير SOAP - ${timestamp}

**الأعراض الذاتية (S):**
${symptoms.length > 0 ? symptoms.map(s => `• ${s}`).join('\n') : `• ${transcript.split('\n')[0] || 'المريض يشكو من أعراض متنوعة'}`}

**الفحص الموضوعي (O):**
• العلامات الحيوية: تحتاج لقياس
• الفحص البدني: ${medicalTerms.length > 0 ? `المناطق المتعلقة بـ: ${medicalTerms.join('، ')}` : 'يحتاج لفحص شامل'}
• الفحوصات المخبرية: حسب الحاجة

**التقييم (A):**
• التشخيص الأولي: يحتاج لتقييم طبي
• التشخيص التفريقي: يحتاج لمراجعة
• شدة الحالة: يحتاج لتقييم

**الخطة (P):**
• العلاج: حسب التشخيص
• التعليمات: الراحة والمتابعة
• المتابعة: حسب الحاجة

**النص الأصلي:** ${transcript}

**ملاحظة:** تقرير تم إنشاؤه تلقائياً ويحتاج لمراجعة طبية.`;
}

function generateProgressNote(transcript: string, medicalTerms: string[], symptoms: string[], timestamp: string, language: string): string {
  if (language === 'en') {
    return `Progress Note

**Date of Assessment:** ${timestamp}

**Patient Identification:**
[To be completed by healthcare provider]

**Brief Hospital Course:**
[To be completed by healthcare provider]

**Interval History:**
Patient reports: "${transcript}"

**Physical Examination:**
[To be completed by healthcare provider]

**Investigations:**
[To be completed by healthcare provider]

**Assessment:**
• Patient status requires clinical evaluation
• Progress assessment based on current presentation
• Further monitoring as indicated

**Plan:**
• Continue current management
• Monitor patient progress
• Adjust treatment as necessary
• Follow-up as scheduled

---
*Note: This is an automatically generated template based on patient's verbal report and requires completion by healthcare provider.*`;
  }

  return `تقرير متابعة

**تاريخ التقييم:** ${timestamp}

**بيانات المريض:**
[يُملأ من قِبل مقدم الرعاية الصحية]

**ملخص الإقامة في المستشفى:**
[يُملأ من قِبل مقدم الرعاية الصحية]

**التاريخ الفاصل:**
المريض يذكر: "${transcript}"

**الفحص البدني:**
[يُملأ من قِبل مقدم الرعاية الصحية]

**الفحوصات:**
[يُملأ من قِبل مقدم الرعاية الصحية]

**التقييم:**
• حالة المريض تحتاج لتقييم سريري
• تقييم التقدم بناءً على الحالة الحالية
• المراقبة الإضافية حسب الحاجة

**الخطة:**
• الاستمرار في العلاج الحالي
• مراقبة تقدم المريض
• تعديل العلاج حسب الحاجة
• المتابعة حسب الجدولة

---
*ملاحظة: هذا نموذج تلقائي مبني على تقرير المريض الشفهي ويحتاج لإكمال من قِبل مقدم الرعاية الصحية.*`;
}

function generateConsultationNote(transcript: string, medicalTerms: string[], symptoms: string[], timestamp: string, language: string): string {
  // Extract basic patient info
  const patientInfo = extractPatientInfo(transcript);
  const symptomDetails = extractSymptomDetails(transcript);
  
  if (language === 'en') {
    return `**Consultation Details:**
Date of Consultation: ${timestamp}
Patient Location: [To be documented by healthcare provider]
Consulting Service: [To be documented by healthcare provider]
Reason for Consult: ${symptomDetails.mainComplaint || 'Medical consultation for evaluation and management'}

Brief assessment summary to be completed by healthcare provider.

**HISTORY OF PRESENTING ILLNESS:**
Patient presents with ${symptomDetails.presentingIllness || 'concerns requiring medical evaluation'}. ${transcript.length > 100 ? 'Based on the patient\'s account: ' + transcript : transcript}

**PAST MEDICAL HISTORY:**
- ${patientInfo.medicalHistory || 'Past medical history to be obtained and documented'}

**Home medications:**
- Current medications to be documented by healthcare provider

**Allergies:**
- Drug allergies to be documented by healthcare provider

**Social history:**
- Social history details to be obtained and documented

**Physical examination:**
- Physical examination findings to be documented by healthcare provider

**Investigation:**

Lab work:
- Laboratory studies to be completed as clinically indicated

Imaging:
- Imaging studies as appropriate based on clinical presentation

Microbiology:
- No microbiology results mentioned

**Assessment:**
- Clinical assessment to be documented by healthcare provider

**Plan:**
- Management plan to be documented by healthcare provider

${symptomDetails.timeline ? `Timeline: ${symptomDetails.timeline}` : ''}
${symptomDetails.associatedSymptoms ? `Associated symptoms: ${symptomDetails.associatedSymptoms}` : ''}
${symptomDetails.aggravatingFactors ? `Aggravating factors: ${symptomDetails.aggravatingFactors}` : ''}
${symptomDetails.relievingFactors ? `Relieving factors: ${symptomDetails.relievingFactors}` : ''}

**Physical Examination:**
Physical examination findings to be documented by healthcare provider

**Investigation:**
**Laboratory Studies:** Laboratory investigations as clinically indicated
**Imaging Studies:** Imaging studies as appropriate based on clinical presentation
**Other Investigations:** Additional diagnostic workup as determined by clinical assessment

**Assessment:**
Clinical assessment based on presenting symptoms and history:
• ${symptomDetails.clinicalImpression || 'Requires comprehensive clinical evaluation'}
• Further diagnostic workup may be indicated
• Clinical correlation with examination findings needed

**Plan:**
Management plan based on clinical presentation:
• Complete comprehensive physical examination
• Obtain additional history as needed
• Order appropriate diagnostic studies based on clinical judgment
• Initiate appropriate treatment plan
• Follow-up care as clinically indicated

---
*Professional medical formatting and structure applied*`;
  }

  return `**تفاصيل الاستشارة:**
تاريخ الاستشارة: ${timestamp}
موقع المريض: [يُملأ من قِبل مقدم الرعاية الصحية]
الخدمة الاستشارية: [يُملأ من قِبل مقدم الرعاية الصحية]
سبب الاستشارة: ${symptoms.length > 0 ? symptoms[0] : 'طلب استشارة طبية'}

ملخص موجز للتقييم يُملأ من قِبل مقدم الرعاية الصحية.

**تاريخ المرض الحالي:**
المريض يراجع بسبب ${symptoms.length > 0 ? symptoms.join('، ') : 'أعراض تتطلب تقييماً طبياً'}. تفاصيل إضافية تُملأ من قِبل مقدم الرعاية الصحية.

**التاريخ المرضي السابق:**
- تاريخ مرضي سابق يُملأ من قِبل مقدم الرعاية الصحية

**الأدوية المنزلية:**
- الأدوية الحالية تُملأ من قِبل مقدم الرعاية الصحية

**الحساسية:**
- حساسيات الأدوية تُملأ من قِبل مقدم الرعاية الصحية

**التاريخ الاجتماعي:**
- تفاصيل التاريخ الاجتماعي تُملأ من قِبل مقدم الرعاية الصحية

**الفحص البدني:**
- نتائج الفحص البدني تُملأ من قِبل مقدم الرعاية الصحية

**الفحوصات:**

الفحوصات المخبرية:
- فحوصات مختبرية حسب الحاجة الإكلينيكية

التصوير:
- دراسات التصوير حسب الحاجة الإكلينيكية

علم الأحياء الدقيقة:
- لم تُذكر نتائج علم أحياء دقيقة

**التقييم:**
- التقييم الإكلينيكي يُملأ من قِبل مقدم الرعاية الصحية

**الخطة:**
- خطة العلاج تُملأ من قِبل مقدم الرعاية الصحية

**الأدوية المنزلية:**
[قائمة بكل دواء مع الجرعة والتكرار المحدد - يُملأ من قِبل مقدم الرعاية الصحية]

**الحساسية:**
[يُملأ من قِبل مقدم الرعاية الصحية]

**التاريخ الاجتماعي:**
[يُملأ من قِبل مقدم الرعاية الصحية]

**تاريخ المرض الحالي:**
يحضر المريض بتاريخ سردي يصف حالته الحالية. ${transcript}

**الفحص البدني:**
[يُملأ من قِبل مقدم الرعاية الصحية]

**الفحوصات:**
**الفحوصات المخبرية:** [تُطلب حسب الحاجة]
**التصوير الطبي:** 
• التاريخ: [ليتم توثيقه]
• النوع: [ليتم تحديده]
• الموقع: [ليتم تحديده]
• النتيجة: [ليتم توثيقها عند توفرها]
**الفحوصات الميكروبيولوجية:** 
• التاريخ: [إذا كان قابلاً للتطبيق]
• النوع: [ليتم تحديده]
• الموقع: [ليتم تحديده]
• النتيجة: [ليتم توثيقها عند توفرها]
**أخرى:** [تُطلب حسب الحاجة]

**التقييم:**
• يحتاج لتقييم سريري بناءً على الأعراض المذكورة
• يلزم فحص إضافي للتشخيص السليم

**الخطة:**
• إجراء فحص بدني كامل
• طلب الفحوصات المناسبة حسب الحاجة
• المتابعة حسب الحاجة

---
*ملاحظة: هذا نموذج تلقائي مبني على تقرير المريض الشفهي ويحتاج لإكمال من قِبل مقدم الرعاية الصحية.*`;
}

function generateDischargeNote(transcript: string, medicalTerms: string[], symptoms: string[], timestamp: string, language: string): string {
  if (language === 'en') {
    return `Discharge Summary - ${timestamp}

**Hospital Stay Summary:**
• Admission reason: ${symptoms.length > 0 ? symptoms[0] : 'Medical care required'}
• Treatment provided: Comprehensive care
• Duration: As per medical needs

**Final Diagnosis:**
• Primary: Requires medical documentation
• Secondary: ${medicalTerms.length > 0 ? `Related to: ${medicalTerms.join(', ')}` : 'As assessed'}

**Discharge Instructions:**
• Medications: As prescribed
• Follow-up: Regular appointments
• Restrictions: As advised

**Original Text:** ${transcript}

**Note:** Auto-generated report requiring medical review.`;
  }

  return `تقرير خروج - ${timestamp}

**ملخص الإقامة:**
• سبب الدخول: ${symptoms.length > 0 ? symptoms[0] : 'احتاج لرعاية طبية'}
• العلاج المقدم: رعاية شاملة
• المدة: حسب الحاجة الطبية

**التشخيص النهائي:**
• الأساسي: يحتاج لتوثيق طبي
• الثانوي: ${medicalTerms.length > 0 ? `متعلق بـ: ${medicalTerms.join('، ')}` : 'حسب التقييم'}

**تعليمات الخروج:**
• الأدوية: حسب الوصفة
• المتابعة: مواعيد منتظمة
• القيود: حسب النصح

**النص الأصلي:** ${transcript}

**ملاحظة:** تقرير تم إنشاؤه تلقائياً ويحتاج لمراجعة طبية.`;
}

function generateFreeformNote(transcript: string, medicalTerms: string[], symptoms: string[], timestamp: string, language: string): string {
  if (language === 'en') {
    return `Medical Report - ${timestamp}

**Case Summary:**
${symptoms.length > 0 ? symptoms.map(s => `• ${s}`).join('\n') : `• ${transcript.split('\n')[0] || 'Comprehensive medical evaluation'}`}

**Clinical Findings:**
• Relevant areas: ${medicalTerms.length > 0 ? medicalTerms.join(', ') : 'General assessment'}
• Assessment: Requires medical evaluation

**Recommendations:**
• Treatment plan: To be determined
• Follow-up care: As needed
• Additional evaluation: If required

**Original Text:** ${transcript}

**Note:** Auto-generated report requiring medical review.`;
  }

  return `تقرير طبي - ${timestamp}

**ملخص الحالة:**
${symptoms.length > 0 ? symptoms.map(s => `• ${s}`).join('\n') : `• ${transcript.split('\n')[0] || 'تقييم طبي شامل'}`}

**النتائج السريرية:**
• المناطق ذات الصلة: ${medicalTerms.length > 0 ? medicalTerms.join('، ') : 'تقييم عام'}
• التقييم: يحتاج لتقييم طبي

**التوصيات:**
• خطة العلاج: يحدد لاحقاً
• الرعاية المتابعة: حسب الحاجة
• تقييم إضافي: إذا لزم

**النص الأصلي:** ${transcript}

**ملاحظة:** تقرير تم إنشاؤه تلقائياً ويحتاج لمراجعة طبية.`;
}
