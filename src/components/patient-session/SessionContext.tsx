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
      updatedAt: now
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
      finalNoteGenerated: false
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
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
    clearAllSessions
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
