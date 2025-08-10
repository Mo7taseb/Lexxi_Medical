// Medical Note Types and Interfaces

export interface MedicalSection {
  id: string;
  title: string;
  content: string;
  type: 'header' | 'text' | 'list' | 'medication' | 'investigation';
  color?: string;
  icon?: string;
}

export interface FormattedNote {
  sections: MedicalSection[];
  metadata: {
    wordCount: number;
    charCount: number;
    language: 'en' | 'ar';
    noteType: string;
  };
}

export interface MedicalNoteViewerProps {
  transcript: string;
  noteType: string;
  generatedNote: string;
  isProcessing: boolean;
  language?: string;
  onGenerate: () => void;
  onReset: () => void;
}

export interface LanguageTexts {
  ar: {
    noteTypeNames: Record<string, string>;
    noteTypeDescriptions: Record<string, string>;
    originalText: string;
    generateReport: string;
    generating: string;
    generatingDesc: string;
    reportGenerated: string;
    edit: string;
    copy: string;
    copied: string;
    download: string;
    downloadDocx: string;
    cancel: string;
    save: string;
    editPlaceholder: string;
    wordCount: string;
    charCount: string;
    reportType: string;
    startNew: string;
    regenerate: string;
    share: string;
    shareReport: string;
    shareViaEmail: string;
    shareViaWhatsApp: string;
    copyContent: string;
  };
  en: {
    noteTypeNames: Record<string, string>;
    noteTypeDescriptions: Record<string, string>;
    originalText: string;
    generateReport: string;
    generating: string;
    generatingDesc: string;
    reportGenerated: string;
    edit: string;
    copy: string;
    copied: string;
    download: string;
    downloadDocx: string;
    cancel: string;
    save: string;
    editPlaceholder: string;
    wordCount: string;
    charCount: string;
    reportType: string;
    startNew: string;
    regenerate: string;
    share: string;
    shareReport: string;
    shareViaEmail: string;
    shareViaWhatsApp: string;
    copyContent: string;
  };
}

export type NoteType = 'soap' | 'progress' | 'consultation' | 'discharge' | 'freeform';
export type Language = 'en' | 'ar';
