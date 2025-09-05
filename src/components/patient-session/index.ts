// Patient Session Components
export { default as SessionProvider, useSession } from './SessionContext';
export { default as SessionManager } from './SessionManager';
export { default as NoteEditor } from './NoteEditor';
export { default as SessionSummary } from './SessionSummary';
export { default as SessionVoiceRecorder } from './SessionVoiceRecorder';
export { default as TemplateManager } from './TemplateManager';
export { default as QuickRecordsManager } from './QuickRecordsManager';

// Types and Constants
export * from './types';
export { sessionLanguageTexts, getSessionTexts } from './constants';
