// Patient Session Types and Interfaces

export interface PatientInfo {
  id: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  medicalRecordNumber?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string;
  chiefComplaint?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionNote {
  id: string;
  content: string;
  type: 'observation' | 'diagnosis' | 'plan' | 'general';
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface PatientSession {
  id: string;
  patientInfo: PatientInfo;
  notes: SessionNote[];
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  recordingCompleted?: boolean;
  transcriptGenerated?: boolean;
  finalNoteGenerated?: boolean;
}

export interface SessionContextType {
  currentSession: PatientSession | null;
  sessions: PatientSession[];
  createNewSession: (patientInfo: Partial<PatientInfo>) => void;
  updateSession: (sessionId: string, updates: Partial<PatientSession>) => void;
  addNote: (sessionId: string, note: Omit<SessionNote, 'id' | 'timestamp'>) => void;
  updateNote: (sessionId: string, noteId: string, updates: Partial<SessionNote>) => void;
  deleteNote: (sessionId: string, noteId: string) => void;
  setActiveSession: (sessionId: string | null) => void;
  deleteSession: (sessionId: string) => void;
  clearAllSessions: () => void;
}

export interface PatientFormData {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other' | '';
  medicalRecordNumber: string;
  phoneNumber: string;
  allergies: string;
  medications: string;
  medicalHistory: string;
  chiefComplaint: string;
}

export interface SessionManagerProps {
  onSessionReady: (session: PatientSession) => void;
  currentStep: number;
  language: 'ar' | 'en';
}

export interface NoteEditorProps {
  session: PatientSession;
  onUpdateSession: (updates: Partial<PatientSession>) => void;
  language: 'ar' | 'en';
  className?: string;
}

export interface SessionSummaryProps {
  session: PatientSession;
  language: 'ar' | 'en';
  onEdit: () => void;
  onContinue: () => void;
  showContinueButton?: boolean;
}

export interface SessionLanguageTexts {
  ar: {
    newSession: string;
    patientInfo: string;
    patientName: string;
    age: string;
    gender: string;
    male: string;
    female: string;
    other: string;
    medicalRecordNumber: string;
    phoneNumber: string;
    allergies: string;
    medications: string;
    medicalHistory: string;
    chiefComplaint: string;
    sessionNotes: string;
    addNote: string;
    noteType: string;
    observation: string;
    diagnosis: string;
    plan: string;
    general: string;
    priority: string;
    low: string;
    medium: string;
    high: string;
    startSession: string;
    continueToRecording: string;
    editSession: string;
    deleteSession: string;
    saveChanges: string;
    cancel: string;
    required: string;
    optional: string;
    sessionSummary: string;
    notesCount: string;
    noNotes: string;
    addFirstNote: string;
    recentSessions: string;
    noSessions: string;
    createFirstSession: string;
    deleteConfirm: string;
    deleteAllSessions: string;
    exportSession: string;
    importSession: string;
    sessionId: string;
    createdAt: string;
    lastAccessed: string;
    sessionStatus: string;
    active: string;
    completed: string;
    paused: string;
    searchPlaceholder: string;
    filterByStatus: string;
    all: string;
    sortBy: string;
    name: string;
    date: string;
    noteContent: string;
    noteTypePlaceholder: string;
    priorityLevel: string;
    tags: string;
    addTag: string;
    removeTag: string;
    deleteNote: string;
    editNote: string;
    saveNote: string;
    timestampLabel: string;
    quickNotes: string;
    templates: string;
    useTemplate: string;
    patientInfoComplete: string;
    notesAdded: string;
    readyToRecord: string;
  };
  en: {
    newSession: string;
    patientInfo: string;
    patientName: string;
    age: string;
    gender: string;
    male: string;
    female: string;
    other: string;
    medicalRecordNumber: string;
    phoneNumber: string;
    allergies: string;
    medications: string;
    medicalHistory: string;
    chiefComplaint: string;
    sessionNotes: string;
    addNote: string;
    noteType: string;
    observation: string;
    diagnosis: string;
    plan: string;
    general: string;
    priority: string;
    low: string;
    medium: string;
    high: string;
    startSession: string;
    continueToRecording: string;
    editSession: string;
    deleteSession: string;
    saveChanges: string;
    cancel: string;
    required: string;
    optional: string;
    sessionSummary: string;
    notesCount: string;
    noNotes: string;
    addFirstNote: string;
    recentSessions: string;
    noSessions: string;
    createFirstSession: string;
    deleteConfirm: string;
    deleteAllSessions: string;
    exportSession: string;
    importSession: string;
    sessionId: string;
    createdAt: string;
    lastAccessed: string;
    sessionStatus: string;
    active: string;
    completed: string;
    paused: string;
    searchPlaceholder: string;
    filterByStatus: string;
    all: string;
    sortBy: string;
    name: string;
    date: string;
    noteContent: string;
    noteTypePlaceholder: string;
    priorityLevel: string;
    tags: string;
    addTag: string;
    removeTag: string;
    deleteNote: string;
    editNote: string;
    saveNote: string;
    timestampLabel: string;
    quickNotes: string;
    templates: string;
    useTemplate: string;
    patientInfoComplete: string;
    notesAdded: string;
    readyToRecord: string;
  };
}

export type SessionStatus = 'active' | 'completed' | 'paused';
export type NoteType = 'observation' | 'diagnosis' | 'plan' | 'general';
export type NotePriority = 'low' | 'medium' | 'high';
export type Gender = 'male' | 'female' | 'other';
