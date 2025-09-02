import { 
  MedicalSchema, 
  MissingInfoField, 
  MissingInfoDetectionResult, 
  MissingInfoItem,
  FieldValidator,
  MissingInfoLanguageTexts
} from './missingInfoTypes';

// Language texts for missing info feature
export const missingInfoLanguageTexts: MissingInfoLanguageTexts = {
  en: {
    completion: 'Completion',
    viewChecklist: 'View Checklist',
    missingInfo: 'Missing Information',
    addInfo: 'Add Info',
    skip: 'Skip',
    save: 'Save',
    cancel: 'Cancel',
    voiceInput: 'Voice Input',
    skipForNow: 'Skip for Now',
    required: 'Required',
    optional: 'Optional',
    fillMissingInfo: 'Fill Missing Information',
    completionStatus: 'Completion Status',
    sectionsNeedingAttention: 'Sections Needing Attention',
    tapToFill: 'Tap to Fill',
    noMissingInfo: 'No Missing Information',
    allFieldsComplete: 'All fields are complete',
    addMissingField: 'Add Missing Field',
    fieldAdded: 'Field added successfully',
    fieldSkipped: 'Field skipped',
    priorities: {
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority'
    }
  },
  ar: {
    completion: 'مكتمل',
    viewChecklist: 'عرض القائمة',
    missingInfo: 'معلومات مفقودة',
    addInfo: 'إضافة معلومات',
    skip: 'تخطي',
    save: 'حفظ',
    cancel: 'إلغاء',
    voiceInput: 'إدخال صوتي',
    skipForNow: 'تخطي الآن',
    required: 'مطلوب',
    optional: 'اختياري',
    fillMissingInfo: 'ملء المعلومات المفقودة',
    completionStatus: 'حالة الإكمال',
    sectionsNeedingAttention: 'أقسام تحتاج انتباه',
    tapToFill: 'انقر للملء',
    noMissingInfo: 'لا توجد معلومات مفقودة',
    allFieldsComplete: 'جميع الحقول مكتملة',
    addMissingField: 'إضافة حقل مفقود',
    fieldAdded: 'تم إضافة الحقل بنجاح',
    fieldSkipped: 'تم تخطي الحقل',
    priorities: {
      high: 'أولوية عالية',
      medium: 'أولوية متوسطة',
      low: 'أولوية منخفضة'
    }
  }
};

// Medical schemas for different note types
export const medicalSchemas: MedicalSchema = {
  soap: {
    'subjective': [
      {
        id: 'chief_complaint',
        section: 'subjective',
        fieldName: 'Main Complaint',
        displayName: 'Main Complaint',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Patient\'s main concern or reason for visit',
        priority: 'high'
      },
      {
        id: 'history_present_illness',
        section: 'subjective',
        fieldName: 'History of Present Illness',
        displayName: 'History of Present Illness',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Detailed description of current symptoms',
        priority: 'high'
      },
      {
        id: 'past_medical_history',
        section: 'subjective',
        fieldName: 'Past Medical History',
        displayName: 'Past Medical History',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Previous medical conditions and surgeries',
        priority: 'medium'
      },
      {
        id: 'medications',
        section: 'subjective',
        fieldName: 'Current Medications',
        displayName: 'Current Medications',
        type: 'complex',
        isRequired: true,
        placeholder: 'List current medications with dosage and frequency',
        priority: 'high'
      },
      {
        id: 'allergies',
        section: 'subjective',
        fieldName: 'Allergies',
        displayName: 'Allergies',
        type: 'text',
        isRequired: true,
        placeholder: 'Known allergies or NKDA',
        priority: 'high'
      },
      {
        id: 'social_history',
        section: 'subjective',
        fieldName: 'Social History',
        displayName: 'Social History',
        type: 'textarea',
        isRequired: false,
        placeholder: 'Smoking, alcohol, occupation, etc.',
        priority: 'low'
      },
      {
        id: 'family_history',
        section: 'subjective',
        fieldName: 'Family History',
        displayName: 'Family History',
        type: 'textarea',
        isRequired: false,
        placeholder: 'Relevant family medical history',
        priority: 'low'
      }
    ],
    'objective': [
      {
        id: 'vital_signs',
        section: 'objective',
        fieldName: 'Vital Signs',
        displayName: 'Vital Signs',
        type: 'complex',
        isRequired: true,
        placeholder: 'BP, HR, Temp, RR, O2 Sat',
        priority: 'high'
      },
      {
        id: 'physical_exam',
        section: 'objective',
        fieldName: 'Physical Examination',
        displayName: 'Physical Examination',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Systematic physical examination findings',
        priority: 'high'
      },
      {
        id: 'lab_results',
        section: 'objective',
        fieldName: 'Laboratory Results',
        displayName: 'Laboratory Results',
        type: 'complex',
        isRequired: false,
        placeholder: 'Lab test results with dates',
        priority: 'medium'
      },
      {
        id: 'imaging',
        section: 'objective',
        fieldName: 'Imaging Studies',
        displayName: 'Imaging Studies',
        type: 'complex',
        isRequired: false,
        placeholder: 'Imaging results with dates and findings',
        priority: 'medium'
      }
    ],
    'assessment': [
      {
        id: 'primary_diagnosis',
        section: 'assessment',
        fieldName: 'Primary Diagnosis',
        displayName: 'Primary Diagnosis',
        type: 'text',
        isRequired: true,
        placeholder: 'Primary diagnosis with ICD code if available',
        priority: 'high'
      },
      {
        id: 'differential_diagnosis',
        section: 'assessment',
        fieldName: 'Differential Diagnosis',
        displayName: 'Differential Diagnosis',
        type: 'textarea',
        isRequired: false,
        placeholder: 'Alternative diagnoses to consider',
        priority: 'medium'
      }
    ],
    'plan': [
      {
        id: 'treatment_plan',
        section: 'plan',
        fieldName: 'Treatment Plan',
        displayName: 'Treatment Plan',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Detailed treatment approach',
        priority: 'high'
      },
      {
        id: 'medications_prescribed',
        section: 'plan',
        fieldName: 'Medications Prescribed',
        displayName: 'Medications Prescribed',
        type: 'complex',
        isRequired: false,
        placeholder: 'New medications with dosage and instructions',
        priority: 'high'
      },
      {
        id: 'follow_up',
        section: 'plan',
        fieldName: 'Follow-up',
        displayName: 'Follow-up Instructions',
        type: 'text',
        isRequired: true,
        placeholder: 'When and where to follow up',
        priority: 'medium'
      },
      {
        id: 'patient_education',
        section: 'plan',
        fieldName: 'Patient Education',
        displayName: 'Patient Education',
        type: 'textarea',
        isRequired: false,
        placeholder: 'Instructions and education provided to patient',
        priority: 'medium'
      }
    ]
  },
  consultation: {
    'consultation_details': [
      {
        id: 'consultation_date',
        section: 'consultation_details',
        fieldName: 'Date of Consultation',
        displayName: 'Consultation Date',
        type: 'date',
        isRequired: true,
        placeholder: 'Date of consultation',
        priority: 'high'
      },
      {
        id: 'referring_physician',
        section: 'consultation_details',
        fieldName: 'Referring Physician',
        displayName: 'Referring Physician',
        type: 'text',
        isRequired: true,
        placeholder: 'Name of referring doctor',
        priority: 'medium'
      },
      {
        id: 'reason_for_consultation',
        section: 'consultation_details',
        fieldName: 'Reason for Consultation',
        displayName: 'Reason for Consultation',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Why patient was referred',
        priority: 'high'
      }
    ],
    'history': [
      {
        id: 'history_present_illness',
        section: 'history',
        fieldName: 'History of Present Illness',
        displayName: 'History of Present Illness',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Current problem details',
        priority: 'high'
      },
      {
        id: 'past_medical_history',
        section: 'history',
        fieldName: 'Past Medical History',
        displayName: 'Past Medical History',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Previous medical conditions',
        priority: 'medium'
      },
      {
        id: 'medications',
        section: 'history',
        fieldName: 'Current Medications',
        displayName: 'Current Medications',
        type: 'complex',
        isRequired: true,
        placeholder: 'Current medications with dosages',
        priority: 'high'
      },
      {
        id: 'allergies',
        section: 'history',
        fieldName: 'Allergies',
        displayName: 'Allergies',
        type: 'text',
        isRequired: true,
        placeholder: 'Known allergies or NKDA',
        priority: 'high'
      }
    ],
    'examination': [
      {
        id: 'physical_examination',
        section: 'examination',
        fieldName: 'Physical Examination',
        displayName: 'Physical Examination',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Focused physical examination findings',
        priority: 'high'
      },
      {
        id: 'vital_signs',
        section: 'examination',
        fieldName: 'Vital Signs',
        displayName: 'Vital Signs',
        type: 'complex',
        isRequired: true,
        placeholder: 'Current vital signs',
        priority: 'high'
      }
    ],
    'investigations': [
      {
        id: 'lab_work',
        section: 'investigations',
        fieldName: 'Laboratory Work',
        displayName: 'Laboratory Work',
        type: 'complex',
        isRequired: false,
        placeholder: 'Lab results if available',
        priority: 'medium'
      },
      {
        id: 'imaging',
        section: 'investigations',
        fieldName: 'Imaging Studies',
        displayName: 'Imaging Studies',
        type: 'complex',
        isRequired: false,
        placeholder: 'Imaging results if available',
        priority: 'medium'
      },
      {
        id: 'microbiology',
        section: 'investigations',
        fieldName: 'Microbiology',
        displayName: 'Microbiology',
        type: 'complex',
        isRequired: false,
        placeholder: 'Culture results if available',
        priority: 'medium'
      }
    ],
    'assessment': [
      {
        id: 'clinical_impression',
        section: 'assessment',
        fieldName: 'Clinical Impression',
        displayName: 'Clinical Impression',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Clinical assessment and impression',
        priority: 'high'
      },
      {
        id: 'recommendations',
        section: 'assessment',
        fieldName: 'Recommendations',
        displayName: 'Recommendations',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Specific recommendations for care',
        priority: 'high'
      }
    ]
  },
  progress: {
    'progress_details': [
      {
        id: 'progress_date',
        section: 'progress_details',
        fieldName: 'Progress Note Date',
        displayName: 'Date',
        type: 'date',
        isRequired: true,
        placeholder: 'Date of progress note',
        priority: 'high'
      },
      {
        id: 'interval_history',
        section: 'progress_details',
        fieldName: 'Interval History',
        displayName: 'Interval History',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Changes since last visit',
        priority: 'high'
      }
    ],
    'current_status': [
      {
        id: 'current_symptoms',
        section: 'current_status',
        fieldName: 'Current Symptoms',
        displayName: 'Current Symptoms',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Current symptom status',
        priority: 'high'
      },
      {
        id: 'medication_compliance',
        section: 'current_status',
        fieldName: 'Medication Compliance',
        displayName: 'Medication Compliance',
        type: 'text',
        isRequired: true,
        placeholder: 'Patient adherence to medications',
        priority: 'high'
      },
      {
        id: 'vital_signs',
        section: 'current_status',
        fieldName: 'Vital Signs',
        displayName: 'Vital Signs',
        type: 'complex',
        isRequired: true,
        placeholder: 'Current vital signs',
        priority: 'high'
      }
    ],
    'assessment_plan': [
      {
        id: 'clinical_progress',
        section: 'assessment_plan',
        fieldName: 'Clinical Progress',
        displayName: 'Clinical Progress',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Assessment of patient progress',
        priority: 'high'
      },
      {
        id: 'plan_changes',
        section: 'assessment_plan',
        fieldName: 'Plan Changes',
        displayName: 'Plan Changes',
        type: 'textarea',
        isRequired: false,
        placeholder: 'Any changes to treatment plan',
        priority: 'medium'
      },
      {
        id: 'next_steps',
        section: 'assessment_plan',
        fieldName: 'Next Steps',
        displayName: 'Next Steps',
        type: 'textarea',
        isRequired: true,
        placeholder: 'Next steps in care',
        priority: 'high'
      }
    ]
  }
};

// Field validators - detect if information is missing from transcript/note
export const fieldValidators: Record<string, FieldValidator> = {
  // Generic validators
  chief_complaint: (value, transcript, note) => {
    const complainKeywords = [
      'chief complaint', 'main concern', 'presenting complaint', 'reason for visit',
      'الشكوى الرئيسية', 'السبب الرئيسي', 'الشكوى الأساسية'
    ];
    
    const hasComplaint = complainKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase()) ||
      note.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return {
      isMissing: !hasComplaint,
      confidence: hasComplaint ? 0.9 : 0.8,
      reason: hasComplaint ? 'Chief complaint mentioned' : 'No clear chief complaint identified',
      suggestion: hasComplaint ? undefined : 'Consider adding the patient\'s main concern or reason for visit'
    };
  },

  allergies: (value, transcript, note) => {
    const allergyKeywords = [
      'allergies', 'allergy', 'nkda', 'no known drug allergies', 'no allergies',
      'الحساسية', 'حساسية', 'لا يوجد حساسية', 'بدون حساسية', 'لا توجد'
    ];
    
    const hasAllergies = allergyKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase()) ||
      note.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return {
      isMissing: !hasAllergies,
      confidence: hasAllergies ? 0.95 : 0.9,
      reason: hasAllergies ? 'Allergies documented' : 'No allergy information found',
      suggestion: hasAllergies ? undefined : 'Document known allergies or state "NKDA" if none'
    };
  },

  medications: (value, transcript, note) => {
    const medicationKeywords = [
      'medication', 'medications', 'pills', 'drugs', 'prescription', 'taking',
      'أدوية', 'دواء', 'علاج', 'حبوب', 'يأخذ', 'يتناول'
    ];
    
    const hasMedications = medicationKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase()) ||
      note.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check for dosage and frequency indicators
    const dosageKeywords = ['mg', 'mcg', 'ml', 'daily', 'twice', 'morning', 'evening', 'مرة', 'يومياً', 'صباحاً'];
    const hasDosageInfo = dosageKeywords.some(keyword =>
      transcript.toLowerCase().includes(keyword.toLowerCase()) ||
      note.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return {
      isMissing: !hasMedications,
      confidence: hasMedications && hasDosageInfo ? 0.9 : hasMedications ? 0.7 : 0.8,
      reason: hasMedications ? 
        (hasDosageInfo ? 'Medications with dosage documented' : 'Medications mentioned but dosage unclear') :
        'No medication information found',
      suggestion: !hasMedications ? 'List current medications or state "none"' :
        !hasDosageInfo ? 'Include dosage and frequency for each medication' : undefined
    };
  },

  vital_signs: (value, transcript, note) => {
    const vitalKeywords = [
      'blood pressure', 'bp', 'heart rate', 'hr', 'temperature', 'temp', 'respiratory rate', 'rr',
      'oxygen saturation', 'o2 sat', 'pulse', 'mmhg',
      'ضغط الدم', 'نبضة', 'درجة الحرارة', 'التنفس', 'الأكسجين'
    ];
    
    const hasVitals = vitalKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase()) ||
      note.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return {
      isMissing: !hasVitals,
      confidence: hasVitals ? 0.85 : 0.9,
      reason: hasVitals ? 'Vital signs documented' : 'No vital signs information found',
      suggestion: hasVitals ? undefined : 'Include basic vital signs (BP, HR, Temp, RR, O2 Sat)'
    };
  },

  physical_examination: (value, transcript, note) => {
    const examKeywords = [
      'physical exam', 'examination', 'vital signs', 'blood pressure', 'temperature', 'pulse',
      'heart rate', 'respiratory rate', 'oxygen saturation', 'auscultation', 'palpation',
      'inspection', 'percussion', 'abdomen', 'chest', 'heart', 'lungs', 'neurological'
    ];
    
    const hasPhysicalExamInTranscript = examKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check for specific examination findings
    const hasExamFindings = transcript.match(/normal|abnormal|clear|tender|enlarged|murmur|rash|swelling/i);
    
    // Check for vital signs in transcript
    const hasVitals = transcript.match(/\d+\/\d+|\d+\s*bpm|\d+\s*°[CF]|\d+\s*mmHg/i);
    
    return {
      isMissing: !hasPhysicalExamInTranscript && !hasExamFindings && !hasVitals,
      confidence: hasPhysicalExamInTranscript ? 0.9 : (hasExamFindings || hasVitals ? 0.8 : 0.95),
      reason: hasPhysicalExamInTranscript ? 'Physical examination documented in transcript' :
              hasExamFindings || hasVitals ? 'Some examination details present' :
              'No physical examination findings documented in transcript',
      suggestion: hasPhysicalExamInTranscript ? undefined : 
                 'Include physical examination findings: vital signs, general appearance, and relevant system examinations'
    };
  },

  imaging: (value, transcript, note) => {
    const imagingKeywords = [
      'x-ray', 'xray', 'ct scan', 'ct', 'mri', 'ultrasound', 'echo', 'imaging',
      'radiology', 'chest x-ray', 'abdominal ct', 'scan'
    ];
    
    const hasImagingInTranscript = imagingKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return {
      isMissing: !hasImagingInTranscript,
      confidence: hasImagingInTranscript ? 0.9 : 0.8,
      reason: hasImagingInTranscript ? 'Imaging studies mentioned in transcript' :
              'No imaging studies mentioned in transcript',
      suggestion: hasImagingInTranscript ? undefined : 
                 'Include imaging studies performed or planned (X-ray, CT, MRI, ultrasound)'
    };
  },

  reason_for_consultation: (value, transcript, note) => {
    const reasonKeywords = [
      'reason for consultation', 'reason for consult', 'reason for visit', 'referred for',
      'consultation for', 'chief complaint', 'presenting complaint', 'main concern',
      'السبب في الاستشارة', 'سبب الزيارة', 'الشكوى الرئيسية'
    ];
    
    const hasReason = reasonKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase()) ||
      note.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Also check for any specific complaint or problem description
    const hasSymptomDescription = transcript.length > 50 && note.length > 50;
    
    return {
      isMissing: !hasReason && !hasSymptomDescription,
      confidence: hasReason ? 0.95 : (hasSymptomDescription ? 0.8 : 0.9),
      reason: hasReason ? 'Reason for consultation clearly stated' : 
              hasSymptomDescription ? 'Symptoms described but reason could be clearer' :
              'No clear reason for consultation identified',
      suggestion: hasReason ? undefined : 'Clearly state the reason for consultation or referral'
    };
  },

  history_present_illness: (value, transcript, note) => {
    // Check if HPI is present in the ORIGINAL TRANSCRIPT (more reliable than generated note)
    const hpiKeywords = [
      'symptoms', 'started', 'began', 'onset', 'duration', 'pain', 'ache', 'feel',
      'experiencing', 'complain', 'problem', 'issue', 'concern', 'sick', 'ill',
      'hurt', 'sore', 'tender', 'discomfort', 'trouble', 'difficulty'
    ];
    
    const hasHPIInTranscript = hpiKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check for actual symptom descriptions in transcript
    const hasSymptomDetails = transcript.match(/pain|ache|hurt|feel|sick|nausea|vomit|fever|cough|breath/i) &&
                             (transcript.match(/\d+\s*(day|week|month|hour|minute)/i) ||
                              transcript.match(/mild|moderate|severe|sharp|dull|aching|burning|throbbing/i) ||
                              transcript.match(/\d+\/10|scale/i));
    
    // Check if transcript actually describes a medical problem (not just demographic info)
    const transcriptLength = transcript.replace(/patient|male|female|years|old|married|children|work|teacher|identification/gi, '').length;
    const hasSubstantialContent = transcriptLength > 200; // After removing demographic words
    
    // If generated note has HPI section but transcript doesn't have symptoms, it's likely hallucinated
    const generatedHasHPI = note.toLowerCase().includes('history of presenting illness') || 
                           note.toLowerCase().includes('history of present illness');
    const possibleHallucination = generatedHasHPI && !hasHPIInTranscript && !hasSymptomDetails;
    
    return {
      isMissing: !hasHPIInTranscript || !hasSymptomDetails || possibleHallucination,
      confidence: hasHPIInTranscript && hasSymptomDetails ? 0.95 : 
                 possibleHallucination ? 0.9 : 0.85,
      reason: hasHPIInTranscript && hasSymptomDetails ? 'History of present illness documented in transcript' :
              possibleHallucination ? 'Generated note contains HPI but transcript lacks symptom details' :
              !hasHPIInTranscript ? 'No symptoms or presenting complaint described in transcript' :
              'Incomplete symptom details in transcript',
      suggestion: hasHPIInTranscript && hasSymptomDetails ? undefined : 
                 'Include detailed description of patient symptoms, when they started, severity, character, and progression'
    };
  },

  recommendations: (value, transcript, note) => {
    const recommendationKeywords = [
      'recommendations', 'plan', 'treatment plan', 'management plan', 'next steps',
      'follow up', 'follow-up', 'advised', 'recommend', 'suggest', 'instructions',
      'discharge plan', 'care plan', 'therapy', 'medication', 'referral',
      'التوصيات', 'الخطة', 'خطة العلاج', 'المتابعة', 'ينصح', 'يوصى'
    ];
    
    const hasRecommendations = recommendationKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase()) ||
      note.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check for specific actionable items
    const hasActionableItems = transcript.match(/scheduled|order|prescribe|refer|return|continue|stop|start/i) ||
                              note.match(/scheduled|order|prescribe|refer|return|continue|stop|start/i);
    
    return {
      isMissing: !hasRecommendations && !hasActionableItems,
      confidence: hasRecommendations ? 0.9 : (hasActionableItems ? 0.8 : 0.85),
      reason: hasRecommendations ? 'Recommendations documented' :
              hasActionableItems ? 'Some actions mentioned but recommendations could be clearer' :
              'No clear recommendations or treatment plan found',
      suggestion: hasRecommendations ? undefined : 'Include specific recommendations for treatment, follow-up, and patient instructions'
    };
  },

  investigations: (value, transcript, note) => {
    const investigationKeywords = [
      'lab', 'laboratory', 'blood test', 'urine test', 'x-ray', 'ct scan', 'mri', 'ultrasound',
      'ecg', 'ekg', 'blood work', 'culture', 'biopsy', 'imaging', 'radiology'
    ];
    
    const hasInvestigationsInTranscript = investigationKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check for specific test results
    const hasResults = transcript.match(/result|normal|abnormal|elevated|low|high|positive|negative/i);
    
    return {
      isMissing: !hasInvestigationsInTranscript,
      confidence: hasInvestigationsInTranscript ? 0.9 : 0.8,
      reason: hasInvestigationsInTranscript ? 'Investigations mentioned in transcript' :
              'No investigations or diagnostic tests mentioned in transcript',
      suggestion: hasInvestigationsInTranscript ? undefined : 
                 'Include relevant investigations: lab work, imaging, or diagnostic tests performed or planned'
    };
  },

  clinical_impression: (value, transcript, note) => {
    const assessmentKeywords = [
      'diagnosis', 'impression', 'assessment', 'likely', 'probable', 'suspect', 'differential',
      'condition', 'disease', 'syndrome', 'disorder', 'rule out', 'consider'
    ];
    
    const hasAssessmentInTranscript = assessmentKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check for medical conditions mentioned
    const hasMedicalConditions = transcript.match(/itis|osis|pathy|syndrome|disease|infection|injury/i);
    
    return {
      isMissing: !hasAssessmentInTranscript && !hasMedicalConditions,
      confidence: hasAssessmentInTranscript ? 0.9 : (hasMedicalConditions ? 0.7 : 0.85),
      reason: hasAssessmentInTranscript ? 'Clinical assessment documented in transcript' :
              hasMedicalConditions ? 'Some medical conditions mentioned' :
              'No clinical assessment or diagnostic impression in transcript',
      suggestion: hasAssessmentInTranscript ? undefined : 
                 'Include clinical impression, working diagnosis, and differential diagnoses'
    };
  },

  referring_physician: (value, transcript, note) => {
    const referringKeywords = [
      'referring', 'referred by', 'sent by', 'from dr', 'from doctor',
      'consultation requested by', 'referral from',
      'محول من', 'أرسل من', 'طلب استشارة من'
    ];
    
    const hasReferring = referringKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase()) ||
      note.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check for doctor names or medical departments
    const hasDoctorName = transcript.match(/dr\.?\s+[a-z]+|doctor\s+[a-z]+/i) ||
                         note.match(/dr\.?\s+[a-z]+|doctor\s+[a-z]+/i);
    
    return {
      isMissing: !hasReferring && !hasDoctorName,
      confidence: hasReferring ? 0.85 : (hasDoctorName ? 0.7 : 0.6),
      reason: hasReferring ? 'Referring physician mentioned' :
              hasDoctorName ? 'Doctor name mentioned but referral context unclear' :
              'No referring physician information found',
      suggestion: hasReferring ? undefined : 'Include name and contact of referring physician if this is a referral consultation'
    };
  },

  // Specific field ID validators
  lab_work: (value, transcript, note) => {
    const labKeywords = [
      'lab', 'laboratory', 'blood test', 'blood work', 'cbc', 'complete blood count',
      'chemistry', 'glucose', 'creatinine', 'electrolytes', 'liver function'
    ];
    
    const hasLabInTranscript = labKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return {
      isMissing: !hasLabInTranscript,
      confidence: hasLabInTranscript ? 0.9 : 0.9,
      reason: hasLabInTranscript ? 'Laboratory work mentioned in transcript' :
              'No laboratory tests mentioned in transcript',
      suggestion: hasLabInTranscript ? undefined : 
                 'Include laboratory tests performed or planned (CBC, chemistry panel, etc.)'
    };
  },

  lab_results: (value, transcript, note) => {
    const labKeywords = [
      'lab', 'laboratory', 'blood test', 'blood work', 'cbc', 'complete blood count',
      'chemistry', 'glucose', 'creatinine', 'electrolytes', 'liver function', 'results'
    ];
    
    const hasLabInTranscript = labKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return {
      isMissing: !hasLabInTranscript,
      confidence: hasLabInTranscript ? 0.9 : 0.9,
      reason: hasLabInTranscript ? 'Laboratory results mentioned in transcript' :
              'No laboratory results mentioned in transcript',
      suggestion: hasLabInTranscript ? undefined : 
                 'Include laboratory test results and interpretation'
    };
  },

  // Add more validators for other fields...
};

// Detect missing information based on transcript and note
export const detectMissingInfo = (
  transcript: string,
  generatedNote: string,
  noteType: string
): MissingInfoDetectionResult => {
  const schema = medicalSchemas[noteType];
  if (!schema) {
    return {
      totalFields: 0,
      completedFields: 0,
      missingItems: [],
      completionPercentage: 100,
      sectionsWithMissing: []
    };
  }

  const missingItems: MissingInfoItem[] = [];
  let totalFields = 0;
  let completedFields = 0;
  const sectionsWithMissing = new Set<string>();

  // Check each section and field
  for (const [sectionName, fields] of Object.entries(schema)) {
    for (const field of fields) {
      totalFields++;
      
      const validator = fieldValidators[field.id];
      if (validator) {
        const result = validator('', transcript, generatedNote);
        
        if (result.isMissing && result.confidence > 0.6) {
          missingItems.push({
            field,
            reason: result.reason,
            suggestion: result.suggestion,
            canSkip: !field.isRequired
          });
          sectionsWithMissing.add(sectionName);
        } else {
          completedFields++;
        }
      } else {
        // Default check - look for field name in transcript/note
        const fieldMentioned = 
          transcript.toLowerCase().includes(field.fieldName.toLowerCase()) ||
          generatedNote.toLowerCase().includes(field.fieldName.toLowerCase()) ||
          transcript.toLowerCase().includes(field.displayName.toLowerCase()) ||
          generatedNote.toLowerCase().includes(field.displayName.toLowerCase());
        
        if (!fieldMentioned && field.isRequired) {
          missingItems.push({
            field,
            reason: `${field.displayName} not mentioned in transcript or note`,
            canSkip: !field.isRequired
          });
          sectionsWithMissing.add(sectionName);
        } else {
          completedFields++;
        }
      }
    }
  }

  // Calculate completion percentage
  const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 100;

  return {
    totalFields,
    completedFields,
    missingItems,
    completionPercentage,
    sectionsWithMissing: Array.from(sectionsWithMissing)
  };
};

// Utility function to check for explicit "none" mentions
export const hasExplicitNone = (text: string, language: 'en' | 'ar'): boolean => {
  const noneKeywords = language === 'en' 
    ? ['none', 'no allergies', 'nkda', 'nil', 'negative', 'unremarkable']
    : ['لا يوجد', 'بدون', 'لا توجد', 'سلبي', 'عادي', 'طبيعي'];
    
  return noneKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
};

// Generate suggestions for missing fields
export const generateFieldSuggestions = (field: MissingInfoField, language: 'en' | 'ar'): string[] => {
  const suggestions: Record<string, Record<string, string[]>> = {
    en: {
      allergies: ['NKDA (No Known Drug Allergies)', 'Penicillin allergy', 'No known allergies'],
      medications: ['None currently', 'See medication list', 'Patient will provide list'],
      vital_signs: ['BP: 120/80 mmHg', 'HR: 72 bpm', 'Temp: 36.5°C', 'RR: 16/min', 'O2 Sat: 98%'],
      follow_up: ['Follow up in 1 week', 'Return if symptoms worsen', 'Routine follow-up in 3 months'],
    },
    ar: {
      allergies: ['لا يوجد حساسية معروفة', 'حساسية من البنسلين', 'بدون حساسية'],
      medications: ['لا يتناول أدوية حالياً', 'انظر قائمة الأدوية', 'سيقدم المريض القائمة'],
      vital_signs: ['ضغط الدم: 120/80', 'النبض: 72', 'الحرارة: 36.5°', 'التنفس: 16', 'الأكسجين: 98%'],
      follow_up: ['مراجعة خلال أسبوع', 'العودة عند تفاقم الأعراض', 'مراجعة روتينية خلال 3 أشهر'],
    }
  };

  return suggestions[language]?.[field.id] || [];
};
