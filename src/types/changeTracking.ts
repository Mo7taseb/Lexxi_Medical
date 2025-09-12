// Medical Note Change Tracking Types
// Types for the AI training data collection system

// Core tracking interfaces
export interface DoctorSession {
  id: string;
  doctorAnonId: string;
  deviceFingerprint?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  sessionCount: number;
  doctorUserId?: string; // Future auth support
  createdAt: string;
  updatedAt: string;
}

export interface NoteGeneration {
  id: string;
  sessionId: string;
  doctorAnonId: string;
  
  // Input data (redacted)
  transcriptRedacted: string;
  noteType: 'soap' | 'consultation' | 'progress' | 'discharge' | 'freeform';
  language: 'ar' | 'en';
  
  // AI generation info
  generatedNote: string;
  generatedSections: MedicalSection[];
  generationSource: string;
  generationConfidence?: number;
  modelVersion?: string;
  templateUsed?: string;
  
  // Timing
  generatedAt: string;
  processingTimeMs?: number;
  
  // Status
  isEdited: boolean;
  editCompletedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface NoteEdit {
  id: string;
  noteGenerationId: string;
  
  // Final content
  finalNote: string;
  finalSections: MedicalSection[];
  
  // Change analysis
  sectionsChanged: string[];
  totalChanges: number;
  changesBySection: Record<string, { added: number; removed: number }>;
  
  // Edit context
  editDurationSeconds?: number;
  characterChanges: number;
  wordChanges: number;
  
  // Timing
  savedAt: string;
  createdAt: string;
}

export interface SectionDiff {
  id: string;
  noteEditId: string;
  
  // Section info
  sectionId: string;
  sectionTitle?: string;
  sectionType?: string;
  
  // Content comparison
  originalContent: string;
  finalContent: string;
  
  // Normalized diff
  contentDiff: DiffResult;
  changeType: 'addition' | 'deletion' | 'modification' | 'no_change';
  
  // Medical context
  medicalTermsChanged: string[];
  
  createdAt: string;
}

export interface DiffResult {
  additions: DiffChange[];
  deletions: DiffChange[];
  modifications: DiffChange[];
  similarity: number; // 0-1 score
}

export interface DiffChange {
  position: number;
  content: string;
  context?: string;
  medicalRelevance?: 'high' | 'medium' | 'low';
}

export interface LearningInsight {
  id: string;
  patternType: 'common_correction' | 'frequent_addition' | 'terminology_fix';
  frequency: number;
  
  // Pattern data
  originalPattern: string;
  correctedPattern: string;
  contextData: Record<string, any>;
  
  // Categorization
  noteType?: string;
  language?: string;
  sectionType?: string;
  
  // Confidence scoring
  confidenceScore: number;
  
  firstSeenAt: string;
  lastSeenAt: string;
  updatedAt: string;
}

// Medical section structure (matching your existing types)
export interface MedicalSection {
  id: string;
  title?: string;
  content: string;
  type?: string;
  color?: string;
  icon?: string;
}

// Change tracking configuration
export interface ChangeTrackingConfig {
  enabled: boolean;
  consentGiven: boolean;
  doctorAnonId: string;
  redactionLevel: 'minimal' | 'standard' | 'aggressive';
  includeTimings: boolean;
}

// Redaction patterns
export interface RedactionPattern {
  pattern: RegExp;
  replacement: string;
  language: 'ar' | 'en' | 'both';
  category: 'name' | 'id' | 'contact' | 'facility' | 'date';
}

// Analytics interfaces
export interface ChangeAnalytics {
  totalGenerations: number;
  totalEdits: number;
  averageEditTime: number;
  mostEditedSections: Array<{ section: string; frequency: number }>;
  commonCorrections: Array<{ from: string; to: string; frequency: number }>;
  improvementPatterns: LearningInsight[];
}

// API request/response types
export interface TrackGenerationRequest {
  sessionId: string;
  transcript: string;
  noteType: string;
  language: 'ar' | 'en';
  generatedNote: string;
  generatedSections: MedicalSection[];
  generationSource: string;
  generationConfidence?: number;
  templateUsed?: string;
  processingTimeMs?: number;
}

export interface TrackGenerationResponse {
  success: boolean;
  generationId: string;
  message?: string;
}

export interface TrackEditRequest {
  generationId: string;
  finalNote: string;
  finalSections: MedicalSection[];
  editDurationSeconds?: number;
}

export interface TrackEditResponse {
  success: boolean;
  editId: string;
  changesDetected: number;
  sectionsChanged: string[];
  message?: string;
}

// Utility types
export type NoteType = 'soap' | 'consultation' | 'progress' | 'discharge' | 'freeform';
export type Language = 'ar' | 'en';
export type GenerationSource = 'groq' | 'openai' | 'fallback';
export type ChangeType = 'addition' | 'deletion' | 'modification' | 'no_change';

// Storage types for localStorage
export interface ChangeTrackingState {
  doctorAnonId: string;
  consentGiven: boolean;
  deviceFingerprint: string;
  sessionCount: number;
  lastSync: string;
  pendingChanges: Array<{
    type: 'generation' | 'edit';
    data: any;
    timestamp: string;
  }>;
}
