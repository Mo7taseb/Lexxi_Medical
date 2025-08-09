import { LanguageTexts } from './types';

export const languageTexts: LanguageTexts = {
  ar: {
    noteTypeNames: {
      soap: 'تقرير SOAP',
      progress: 'تقرير متابعة',
      consultation: 'تقرير استشارة',
      discharge: 'تقرير خروج',
      freeform: 'تقرير حر'
    },
    noteTypeDescriptions: {
      soap: 'تنسيق منظم: الأعراض، الفحص، التقييم، الخطة',
      progress: 'تحديثات حالة المريض وتقدم العلاج',
      consultation: 'إحالة المختص ونتائج الاستشارة',
      discharge: 'ملخص خروج المستشفى والتعليمات',
      freeform: 'تنسيق توثيق طبي مرن'
    },
    originalText: 'النص الأصلي',
    generateReport: 'إنشاء التقرير الطبي',
    generating: 'جاري إنشاء التقرير...',
    generatingDesc: 'يتم تحليل النص وإنشاء التقرير الطبي المناسب',
    reportGenerated: 'تم الإنشاء',
    edit: 'تحرير',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    download: 'تحميل',
    downloadDocx: 'تحميل DOCX',
    cancel: 'إلغاء',
    save: 'حفظ',
    editPlaceholder: 'قم بتحرير التقرير هنا...',
    wordCount: 'عدد الكلمات',
    charCount: 'عدد الأحرف',
    reportType: 'نوع التقرير',
    startNew: 'بدء جديد',
    regenerate: 'إعادة إنشاء التقرير'
  },
  en: {
    noteTypeNames: {
      soap: 'SOAP Note',
      progress: 'Progress Note',
      consultation: 'Consultation Note',
      discharge: 'Discharge Summary',
      freeform: 'Free-form Note'
    },
    noteTypeDescriptions: {
      soap: 'Structured format: Subjective, Objective, Assessment, Plan',
      progress: 'Patient status updates and treatment progress',
      consultation: 'Specialist referral and consultation findings',
      discharge: 'Hospital discharge summary and instructions',
      freeform: 'Flexible medical documentation format'
    },
    originalText: 'Original Text',
    generateReport: 'Generate Medical Note',
    generating: 'Generating Report...',
    generatingDesc: 'Analyzing text and creating appropriate medical report',
    reportGenerated: 'Generated',
    edit: 'Edit',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download',
    downloadDocx: 'Download DOCX',
    cancel: 'Cancel',
    save: 'Save',
    editPlaceholder: 'Edit the report here...',
    wordCount: 'Word count',
    charCount: 'Character count',
    reportType: 'Report type',
    startNew: 'Start New',
    regenerate: 'Regenerate Report'
  }
};
