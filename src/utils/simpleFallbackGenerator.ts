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
  if (language === 'en') {
    return `Consultation Note

**Date of Consult:** ${timestamp}

**Reason of Consult:**
${symptoms.length > 0 ? symptoms[0] : 'Medical consultation requested'}

**Patient Identification:**
[To be completed by healthcare provider]

**Past Medical History:**
[To be completed by healthcare provider]

**Home Medications:**
[List each medication with specific dosage and frequency - to be completed by healthcare provider]

**Allergies:**
[To be completed by healthcare provider]

**Social History:**
[To be completed by healthcare provider]

**History of Presenting Illness:**
Patient presents with a narrative history describing their current condition. ${transcript}

**Physical Examination:**
[To be completed by healthcare provider]

**Investigation:**
**Lab Work:** [To be ordered as indicated]
**Imaging:** 
• Date: [To be documented]
• Type: [To be specified]
• Site: [To be specified]
• Result: [To be documented when available]
**Microbiology:** 
• Date: [If applicable]
• Type: [To be specified]
• Site: [To be specified]
• Result: [To be documented when available]
**Others:** [To be ordered as indicated]

**Assessment:**
• Clinical evaluation required based on patient's presenting symptoms
• Further assessment needed for proper diagnosis

**Plan:**
• Complete physical examination
• Order appropriate investigations as indicated
• Follow-up as required

---
*Note: This is an automatically generated template based on patient's verbal report and requires completion by healthcare provider.*`;
  }

  return `تقرير استشارة

**تاريخ الاستشارة:** ${timestamp}

**سبب الاستشارة:**
${symptoms.length > 0 ? symptoms[0] : 'طلب استشارة طبية'}

**بيانات المريض:**
[يُملأ من قِبل مقدم الرعاية الصحية]

**التاريخ المرضي السابق:**
[يُملأ من قِبل مقدم الرعاية الصحية]

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
