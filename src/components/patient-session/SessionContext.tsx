'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PatientSession, PatientInfo, SessionNote, SessionContextType } from './types';

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<PatientSession | null>(null);
  const [sessions, setSessions] = useState<PatientSession[]>([]);

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem('lexxi-patient-sessions');
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions);
      }

      const savedCurrentSession = localStorage.getItem('lexxi-current-session');
      if (savedCurrentSession) {
        const parsedCurrentSession = JSON.parse(savedCurrentSession);
        setCurrentSession(parsedCurrentSession);
      }
    } catch (error) {
      console.error('Error loading sessions from localStorage:', error);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('lexxi-patient-sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions to localStorage:', error);
    }
  }, [sessions]);

  // Save current session to localStorage whenever it changes
  useEffect(() => {
    try {
      if (currentSession) {
        localStorage.setItem('lexxi-current-session', JSON.stringify(currentSession));
      } else {
        localStorage.removeItem('lexxi-current-session');
      }
    } catch (error) {
      console.error('Error saving current session to localStorage:', error);
    }
  }, [currentSession]);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const createNewSession = (patientInfo: Partial<PatientInfo>) => {
    const now = new Date().toISOString();
    const sessionId = generateId();

    const newPatientInfo: PatientInfo = {
      id: generateId(),
      name: patientInfo.name || '',
      age: patientInfo.age,
      gender: patientInfo.gender,
      medicalRecordNumber: patientInfo.medicalRecordNumber,
      phoneNumber: patientInfo.phoneNumber,
      dateOfBirth: patientInfo.dateOfBirth,
      allergies: patientInfo.allergies || [],
      medications: patientInfo.medications || [],
      medicalHistory: patientInfo.medicalHistory,
      chiefComplaint: patientInfo.chiefComplaint,
      createdAt: now,
      updatedAt: now,
      isAnonymous: patientInfo.isAnonymous || false,
      originalRecordingType: patientInfo.originalRecordingType || 'session',
      anonymousId: patientInfo.anonymousId
    };

    const newSession: PatientSession = {
      id: sessionId,
      patientInfo: newPatientInfo,
      notes: [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
      recordingCompleted: false,
      transcriptGenerated: false,
      finalNoteGenerated: false,
      isQuickRecord: patientInfo.originalRecordingType === 'quick'
    };

    // Pause any previously active sessions and prepend the new one
    setSessions(prev => [
      newSession,
      ...prev.map(s => (s.status === 'active' ? { ...s, status: 'paused' as const } : s))
    ]);
    setCurrentSession(newSession);
  };

  // ✨ Enhanced method for creating quick record sessions
  const createQuickRecordSession = (audioFile?: File, audioUrl?: string): PatientSession => {
    const now = new Date().toISOString();
    const sessionId = `quick-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const anonymousId = `anon-${Date.now()}`;

    const quickSession: PatientSession = {
      id: sessionId,
      patientInfo: {
        id: anonymousId,
        name: `🎙️ Quick Record - ${new Date().toLocaleString()}`,
        chiefComplaint: 'Quick recording session',
        createdAt: now,
        updatedAt: now,
        isAnonymous: true,
        originalRecordingType: 'quick',
        anonymousId: anonymousId
      },
      notes: [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
      recordingCompleted: false,
      transcriptGenerated: false,
      finalNoteGenerated: false,
      isQuickRecord: true,
      canAssignToPatient: true,
      originalAudioUrl: audioUrl,
      quickRecordMetadata: {
        processingStatus: 'pending',
        autoProcessed: false
      }
    };

    // Pause any previously active sessions and prepend the new one
    setSessions(prev => [
      quickSession,
      ...prev.map(s => (s.status === 'active' ? { ...s, status: 'paused' as const } : s))
    ]);
    setCurrentSession(quickSession);

    return quickSession;
  };

  // 📋 Method to get all quick record sessions
  const getQuickRecordSessions = (): PatientSession[] => {
    return sessions.filter(session => session.isQuickRecord === true);
  };

  // 👤 Method to assign quick record to a patient
  const assignQuickRecordToPatient = (sessionId: string, patientInfo: Partial<PatientInfo>) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || !session.isQuickRecord) return;

    const updatedPatientInfo = {
      ...session.patientInfo,
      ...patientInfo,
      name: patientInfo.name || session.patientInfo.name,
      isAnonymous: false,
      originalRecordingType: 'quick' as const,
      updatedAt: new Date().toISOString()
    };

    updateSession(sessionId, {
      patientInfo: updatedPatientInfo,
      canAssignToPatient: false,
      lastAccessedAt: new Date().toISOString()
    });
  };

  // 🔄 Method to convert quick record to full session
  const convertToFullSession = (sessionId: string, patientInfo: Partial<PatientInfo>) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || !session.isQuickRecord) return;

    const updatedPatientInfo = {
      ...patientInfo,
      id: patientInfo.id || `patient-${Date.now()}`,
      name: patientInfo.name || '',
      createdAt: session.patientInfo.createdAt,
      updatedAt: new Date().toISOString(),
      isAnonymous: false,
      originalRecordingType: 'quick' as const
    };

    updateSession(sessionId, {
      patientInfo: updatedPatientInfo,
      isQuickRecord: false,
      canAssignToPatient: false,
      lastAccessedAt: new Date().toISOString()
    });
  };

  const updateSession = (sessionId: string, updates: Partial<PatientSession>) => {
    const now = new Date().toISOString();

    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? { ...session, ...updates, updatedAt: now }
        : session
    ));

    if (currentSession?.id === sessionId) {
      setCurrentSession(prev =>
        prev ? { ...prev, ...updates, updatedAt: now } : null
      );
    }
  };

  const addNote = (sessionId: string, note: Omit<SessionNote, 'id' | 'timestamp'>) => {
    const newNote: SessionNote = {
      ...note,
      id: generateId(),
      timestamp: new Date().toISOString()
    };

    updateSession(sessionId, {
      notes: [...(sessions.find(s => s.id === sessionId)?.notes || []), newNote]
    });
  };

  const updateNote = (sessionId: string, noteId: string, updates: Partial<SessionNote>) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const updatedNotes = session.notes.map(note =>
      note.id === noteId ? { ...note, ...updates } : note
    );

    updateSession(sessionId, { notes: updatedNotes });
  };

  const deleteNote = (sessionId: string, noteId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const filteredNotes = session.notes.filter(note => note.id !== noteId);
    updateSession(sessionId, { notes: filteredNotes });
  };

  const setActiveSession = (sessionId: string | null) => {
    if (sessionId === null) {
      setCurrentSession(null);
      return;
    }

    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      const now = new Date().toISOString();
      const updatedSession = { ...session, lastAccessedAt: now };

      updateSession(sessionId, { lastAccessedAt: now });
      setCurrentSession(updatedSession);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
  };

  const clearAllSessions = () => {
    setSessions([]);
    setCurrentSession(null);
    localStorage.removeItem('lexxi-patient-sessions');
    localStorage.removeItem('lexxi-current-session');
  };

  const value: SessionContextType = {
    currentSession,
    sessions,
    createNewSession,
    updateSession,
    addNote,
    updateNote,
    deleteNote,
    setActiveSession,
    deleteSession,
    clearAllSessions,
    // ✨ Anonymous session methods
    createQuickRecordSession,
    getQuickRecordSessions,
    assignQuickRecordToPatient,
    convertToFullSession
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
