// Missing Info Assist Types and Interfaces

export interface MissingInfoField {
  id: string;
  section: string;
  fieldName: string;
  displayName: string;
  type: 'text' | 'date' | 'dropdown' | 'number' | 'textarea' | 'complex';
  isRequired: boolean;
  placeholder?: string;
  options?: string[];
  validation?: (value: string) => boolean;
  priority: 'high' | 'medium' | 'low';
  canSkip?: boolean;
}

export interface ComplexField {
  id: string;
  displayName: string;
  subfields: {
    id: string;
    name: string;
    type: 'text' | 'date' | 'dropdown';
    placeholder?: string;
    options?: string[];
    required: boolean;
  }[];
}

export interface MissingInfoItem {
  field: MissingInfoField;
  reason: string;
  suggestion?: string;
  canSkip: boolean;
}

export interface MissingInfoDetectionResult {
  totalFields: number;
  completedFields: number;
  missingItems: MissingInfoItem[];
  completionPercentage: number;
  sectionsWithMissing: string[];
}

export interface MedicalSchema {
  [noteType: string]: {
    [section: string]: MissingInfoField[];
  };
}

export interface MissingInfoAssistProps {
  transcript: string;
  generatedNote: string;
  noteType: string;
  language: 'en' | 'ar';
  onFieldAdd: (sectionId: string, fieldName: string, value: string) => void;
  onSkipField: (fieldId: string) => void;
}

export interface CompletionPillProps {
  completed: number;
  total: number;
  onViewChecklist: () => void;
  language: 'en' | 'ar';
}

export interface ChecklistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  missingItems: MissingInfoItem[];
  onScrollToSection: (sectionId: string) => void;
  onFillField: (fieldId: string) => void;
  language: 'en' | 'ar';
}

export interface MicroFormProps {
  field: MissingInfoField;
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string | Record<string, string>) => void;
  onSkip: () => void;
  onVoiceInput: () => void;
  language: 'en' | 'ar';
}

export interface InlineHintProps {
  sectionId: string;
  missingFields: MissingInfoField[];
  onAddField: (fieldId: string) => void;
  language: 'en' | 'ar';
}

// Language constants for missing info
export interface MissingInfoLanguageTexts {
  en: {
    completion: string;
    viewChecklist: string;
    missingInfo: string;
    addInfo: string;
    skip: string;
    save: string;
    cancel: string;
    voiceInput: string;
    skipForNow: string;
    required: string;
    optional: string;
    fillMissingInfo: string;
    completionStatus: string;
    sectionsNeedingAttention: string;
    tapToFill: string;
    noMissingInfo: string;
    allFieldsComplete: string;
    addMissingField: string;
    fieldAdded: string;
    fieldSkipped: string;
    priorities: {
      high: string;
      medium: string;
      low: string;
    };
  };
  ar: {
    completion: string;
    viewChecklist: string;
    missingInfo: string;
    addInfo: string;
    skip: string;
    save: string;
    cancel: string;
    voiceInput: string;
    skipForNow: string;
    required: string;
    optional: string;
    fillMissingInfo: string;
    completionStatus: string;
    sectionsNeedingAttention: string;
    tapToFill: string;
    noMissingInfo: string;
    allFieldsComplete: string;
    addMissingField: string;
    fieldAdded: string;
    fieldSkipped: string;
    priorities: {
      high: string;
      medium: string;
      low: string;
    };
  };
}

// Field validation functions
export type FieldValidator = (value: string, transcript: string, note: string) => {
  isMissing: boolean;
  confidence: number;
  reason: string;
  suggestion?: string;
};

// Voice input types
export interface VoiceInputConfig {
  enabled: boolean;
  language: 'en' | 'ar';
  timeout: number;
  autoSubmit: boolean;
}
