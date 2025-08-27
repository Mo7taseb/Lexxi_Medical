'use client';

import React, { useState, lazy, Suspense } from 'react';
import {
  Mic,
  Upload,
  FileText,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  User,
  Plus,
  Clock,
  Edit,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { FastLoadingSpinner } from '@/components/LoadingOptimization';
import Image from 'next/image';
import '@/components/medical-note/styles.css';
import {
  useSession,
  SessionManager,
  SessionSummary,
  NoteEditor,
  SessionVoiceRecorder
} from '@/components/patient-session';
import { PatientSession } from '@/components/patient-session/types';
import { useLanguage } from '@/contexts/LanguageContext';

// Lazy load components to reduce initial bundle size
const TranscriptionViewer = lazy(() => import('@/components/TranscriptionViewer'));
const NoteTypeSelector = lazy(() => import('@/components/NoteTypeSelector'));
const MedicalNoteViewer = lazy(() => import('@/components/MedicalNoteViewer'));

// Main App Component
function MainApp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [inputMode, setInputMode] = useState<'conversation' | 'summary' | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [noteType, setNoteType] = useState<string>('soap');
  const [generatedNote, setGeneratedNote] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [patientConsent, setPatientConsent] = useState(false);
  const [currentSession, setCurrentSession] = useState<PatientSession | null>(null);

  const { sessions, createNewSession, updateSession } = useSession();
  const { language, setLanguage, t, direction } = useLanguage();

  const steps = [
    { id: 1, title: t('patientInformation'), icon: User },
    { id: 2, title: t('sessionNotes'), icon: FileText },
    { id: 3, title: t('voiceRecording'), icon: Mic },
    { id: 4, title: t('reviewTranscript'), icon: FileText },
    { id: 5, title: t('selectNoteType'), icon: Stethoscope },
    { id: 6, title: t('reviewNote'), icon: CheckCircle },
  ];

  const handleSessionReady = (session: PatientSession) => {
    setCurrentSession(session);
    setCurrentStep(2);
  };

  const handleSessionUpdate = (updates: Partial<PatientSession>) => {
    if (currentSession) {
      updateSession(currentSession.id, updates);
      // Find the latest session from context after update
      const updated = sessions.find(s => s.id === currentSession.id);
      if (updated) {
        setCurrentSession(updated);
      } else {
        // fallback if not found (shouldn't happen)
        setCurrentSession({ ...currentSession, ...updates });
      }
    }
  };

  const handleAudioComplete = (file: File, url: string) => {
    setAudioFile(file);
    setAudioUrl(url);

    if (url.includes('cloudinary.com')) {
      setCloudinaryUrl(url);
    } else {
      setCloudinaryUrl(null);
    }

    setCurrentStep(4);
  };

  const handleTranscriptionComplete = (text: string) => {
    setTranscript(text);
    setCurrentStep(5);
  };

  const handleLanguageDetected = (detectedLanguage: 'ar' | 'en') => {
    // Don't change the UI language based on transcript language
    // Keep the user's selected UI language
    console.log(`🌍 Language detected in transcript: ${detectedLanguage.toUpperCase()}, but keeping UI language as: ${language.toUpperCase()}`);
  };

  const handleNoteTypeSelect = (type: string) => {
    setNoteType(type);
    setCurrentStep(6);
  };

  const handleGenerateNote = async () => {
    setIsProcessing(true);
    try {
      console.log(`🏥 Generating note in English for consistent structure (UI language: ${language.toUpperCase()})`);
      const response = await fetch('/api/generate-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          noteType,
          language: 'en' // Always generate notes in English for consistent structure
        }),
      });

      if (!response.ok) throw new Error('Failed to generate note');

      const data = await response.json();
      console.log(`✅ Note generated in English from ${data.source} with confidence: ${data.confidence}`);
      setGeneratedNote(data.note);
    } catch (error) {
      console.error('Error generating note:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetApp = () => {
    setCurrentStep(1);
    setInputMode(null);
    setAudioFile(null);
    setAudioUrl(null);
    setTranscript('');
    setNoteType('soap');
    setGeneratedNote('');
    setPatientConsent(false);
    setCurrentSession(null);
  };

  const goToRecording = () => {
    setCurrentStep(3);
  };


  // Keep currentSession in sync with context when sessions change
  React.useEffect(() => {
    if (currentSession) {
      const updated = sessions.find(s => s.id === currentSession.id);
      if (updated) setCurrentSession(updated);
    }
  }, [sessions]);

  // Loading component for better UX
  const LoadingSpinner = () => <FastLoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir={direction}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

      {/* Floating Glass Header - Responsive Layout */}
      <div className="sticky top-0 z-50 mb-4 sm:mb-6 lg:mb-8">
        <div className="relative">
          {/* Scroll-triggered background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-2xl transition-opacity duration-500 opacity-0 hover:opacity-100" />

          {/* Animated gradient border using logo colors */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-indigo-600/20 rounded-3xl blur-xl animate-pulse transition-opacity duration-500 opacity-0 hover:opacity-100" />

          {/* Main header container */}
          <div className="relative bg-white/20 backdrop-blur-3xl border border-white/30 rounded-2xl sm:rounded-3xl mx-3 sm:mx-4 lg:mx-6 shadow-2xl shadow-blue-500/10 transition-all duration-500 hover:bg-white/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 max-w-7xl">
              <div className="flex items-center justify-between relative">
                {/* Logo - Left aligned with glow */}
                <div className="flex items-center flex-1">
                  <div className="relative group">
                    {/* Animated glow rings using logo colors */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/40 via-blue-500/40 to-indigo-600/40 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />

                    {/* Logo container with glass effect */}
                    <div className="relative bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl rounded-2xl p-2 sm:p-3 lg:p-4 border border-white/40 shadow-xl shadow-blue-500/20 transform transition-all duration-500 group-hover:scale-105">
                      <Image
                        src="/logo.png"
                        alt="Lexxi"
                        width={100}
                        height={16}
                        className="w-[100px] sm:w-[120px] lg:w-[140px] xl:w-[160px] object-contain transition-all duration-500 group-hover:scale-110"
                        priority
                      />
                    </div>
                  </div>
                </div>

                {/* Language Toggle - Right aligned */}
                <div className="flex items-center justify-end flex-shrink-0">
                  <div className="relative group">
                    {/* Button glow effect using logo colors */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />

                    {/* Button container */}
                    <div className="relative flex bg-white/30 backdrop-blur-xl rounded-2xl p-1 border border-white/40 shadow-xl shadow-blue-500/20 gap-0.5">
                      <button
                        onClick={() => setLanguage('ar')}
                        className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 relative overflow-hidden min-w-[56px] sm:min-w-[64px] lg:min-w-[70px] touch-manipulation ${language === 'ar'
                          ? 'bg-[#3c78bc] from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-white/50 active:bg-white/60'
                          }`}
                      >
                        {/* Active button shine effect */}
                        {language === 'ar' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
                        )}
                        <span className="relative z-10 block text-center leading-tight">العربية</span>
                      </button>
                      <button
                        onClick={() => setLanguage('en')}
                        className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 relative overflow-hidden min-w-[56px] sm:min-w-[64px] lg:min-w-[70px] touch-manipulation ${language === 'en'
                          ? 'bg-[#3c78bc] from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-white/50 active:bg-white/60'
                          }`}
                      >
                        {/* Active button shine effect */}
                        {language === 'en' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
                        )}
                        <span className="relative z-10 block text-center leading-tight">English</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-6xl">
        {/* Hero Section - Enhanced with Cool Animations */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 relative overflow-hidden">


          <div className="mb-6 sm:mb-8 relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2 leading-tight relative group">
              {/* Gradient Text Effect */}
              <span className="bg-gradient-to-r from-[#102d3e] via-[#3c78bc] to-[#7ac5eb] bg-clip-text text-transparent animate-gradient-x">
                {t('heroTitle')}
              </span>

              {/* Glowing Underline Effect */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-1 rounded-full transition-all duration-700 group-hover:w-full group-hover:shadow-lg" style={{ background: 'linear-gradient(90deg, #3c78bc 0%, #7ac5eb 100%)', boxShadow: '0 4px 14px -1px rgba(60, 120, 188, 0.5)' }}></div>


            </h2>
          </div>

          {/* Enhanced Features badges with hover effects */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-8 text-xs sm:text-sm px-2 relative z-10">
            <div className="feature-badge group">
              <span className="text-gray-600 group-hover:text-[#3c78bc] transition-colors duration-300 font-medium">
                {t('arabicSupport')}
              </span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full group-hover:scale-125 transition-all duration-300 animate-pulse" style={{ backgroundColor: '#7ac5eb' }}></div>
            </div>
            <div className="feature-badge group">
              <span className="text-gray-600 group-hover:text-[#3c78bc] transition-colors duration-300 font-medium">
                {t('seheCompliant')}
              </span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full group-hover:scale-125 transition-all duration-300 animate-pulse" style={{ backgroundColor: '#64a1c1', animationDelay: '0.5s' }}></div>
            </div>
            <div className="feature-badge group">
              <span className="text-gray-600 group-hover:text-[#3c78bc] transition-colors duration-300 font-medium">
                {t('pdplCompliant')}
              </span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full group-hover:scale-125 transition-all duration-300 animate-pulse" style={{ backgroundColor: '#3c78bc', animationDelay: '1s' }}></div>
            </div>
            <div className="feature-badge group">
              <span className="text-gray-600 group-hover:text-[#3c78bc] transition-colors duration-300 font-medium">
                {t('aiTranscription')}
              </span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full group-hover:scale-125 transition-all duration-300 animate-pulse" style={{ backgroundColor: '#3a6077', animationDelay: '1.5s' }}></div>
            </div>
          </div>


        </div>

        {/* Progress Steps - Enhanced Mobile Design */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/30">
            {/* Mobile: Vertical Layout, Desktop: Horizontal */}
            <div className="flex flex-col sm:hidden space-y-4 max-w-xs mx-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4">
                  {/* Step Icon */}
                  <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${currentStep >= step.id
                    ? 'text-white shadow-xl'
                    : 'bg-gray-100 text-gray-400'
                    }`}
                    style={currentStep >= step.id ? {
                      background: `linear-gradient(135deg, #3c78bc, #7ac5eb)`,
                      boxShadow: '0 8px 25px -5px rgba(60, 120, 188, 0.3)'
                    } : {}}>
                    <step.icon className="h-6 w-6" />
                    {currentStep >= step.id && (
                      <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ backgroundColor: 'rgba(60, 120, 188, 0.2)' }} />
                    )}
                  </div>

                  {/* Step Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold mb-1 ${currentStep >= step.id ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                      {step.title}
                    </h3>
                  </div>

                  {/* Connection Line for Mobile */}
                  {index < steps.length - 1 && (
                    <div className="absolute right-6 mt-12 w-0.5 h-4 bg-gradient-to-b from-blue-300 to-gray-200 rounded-full" />
                  )}
                </div>
              ))}
            </div>

            {/* Desktop: Horizontal Layout */}
            <div className="hidden sm:flex items-center max-w-5xl mx-auto">
              <div className="grid grid-cols-6 gap-8 lg:gap-12 w-full">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`relative w-14 h-14 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-3 lg:mb-4 transition-all duration-300 ${currentStep >= step.id
                      ? 'text-white shadow-xl scale-105'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      style={currentStep >= step.id ? {
                        background: `linear-gradient(135deg, #3c78bc, #7ac5eb)`,
                        boxShadow: '0 12px 25px -5px rgba(60, 120, 188, 0.3)'
                      } : {}}>
                      <step.icon className="h-7 w-7 lg:h-8 lg:w-8" />
                      {currentStep >= step.id && (
                        <div className="absolute inset-0 rounded-2xl lg:rounded-3xl animate-pulse" style={{ backgroundColor: 'rgba(60, 120, 188, 0.2)' }} />
                      )}
                    </div>
                    <span className={`text-sm lg:text-base font-bold text-center mb-1 px-2 ${currentStep >= step.id ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Mobile Optimized */}
        <div className="max-w-5xl mx-auto">
          {/* Step 1: Patient Information */}
          {currentStep === 1 && (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 lg:p-10 border border-white/30">
              <div className="text-center mb-8 sm:mb-10">
              </div>
              <SessionManager
                onSessionReady={handleSessionReady}
                currentStep={currentStep}
                language={language}
              />
            </div>
          )}

          {/* Step 2: Session Notes */}
          {currentStep === 2 && currentSession && (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 lg:p-10 border border-white/30">
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                  {t('sessionNotesTitle')}
                </h2>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
                  {t('sessionNotesSubtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                {/* Session Summary */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                  <SessionSummary
                    session={currentSession}
                    language={language}
                    onEdit={() => setCurrentStep(1)}
                    onContinue={goToRecording}
                    showContinueButton={true}
                  />
                </div>

                {/* Note Editor */}
                <div className="lg:col-span-3 order-1 lg:order-2">
                  <NoteEditor
                    session={currentSession}
                    onUpdateSession={handleSessionUpdate}
                    language={language}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Voice Recording */}
          {currentStep === 3 && currentSession && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                  {t('voiceRecordingTitle')}
                </h2>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
                  {t('voiceRecordingSubtitle')}
                </p>
              </div>

              <SessionVoiceRecorder
                onComplete={handleAudioComplete}
                session={currentSession}
                language={language}
              />
            </div>
          )}

          {/* Step 4: Review Transcript */}
          {currentStep === 4 && audioFile && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
              <Suspense fallback={<LoadingSpinner />}>
                <TranscriptionViewer
                  audioFile={audioFile}
                  audioUrl={cloudinaryUrl || undefined}
                  onComplete={handleTranscriptionComplete}
                  onLanguageDetected={handleLanguageDetected}
                />
              </Suspense>
            </div>
          )}

          {/* Step 5: Select Note Type */}
          {currentStep === 5 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
              <Suspense fallback={<LoadingSpinner />}>
                <NoteTypeSelector
                  selectedType={noteType}
                  onSelect={handleNoteTypeSelect}
                />
              </Suspense>
            </div>
          )}

          {/* Step 6: Review Generated Note */}
          {currentStep === 6 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
              <Suspense fallback={<LoadingSpinner />}>
                <MedicalNoteViewer
                  transcript={transcript}
                  noteType={noteType}
                  generatedNote={generatedNote}
                  isProcessing={isProcessing}
                  language={language}
                  onGenerate={handleGenerateNote}
                  onReset={resetApp}
                />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main app component
export default function Home() {
  return <MainApp />;
}
