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
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>('ar');
  const [noteType, setNoteType] = useState<string>('soap');
  const [generatedNote, setGeneratedNote] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [patientConsent, setPatientConsent] = useState(false);
  const [currentSession, setCurrentSession] = useState<PatientSession | null>(null);

  const { sessions, createNewSession, updateSession } = useSession();

  const steps = [
    { id: 1, title: 'معلومات المريض', titleEn: 'Patient Information', icon: User },
    { id: 2, title: 'ملاحظات الجلسة', titleEn: 'Session Notes', icon: FileText },
    { id: 3, title: 'تسجيل الصوت', titleEn: 'Voice Recording', icon: Mic },
    { id: 4, title: 'راجع النص', titleEn: 'Review Transcript', icon: FileText },
    { id: 5, title: 'اختر نوع التقرير', titleEn: 'Select Note Type', icon: Stethoscope },
    { id: 6, title: 'مراجعة التقرير', titleEn: 'Review Note', icon: CheckCircle },
  ];

  const handleSessionReady = (session: PatientSession) => {
    setCurrentSession(session);
    setCurrentStep(2);
  };

  const handleSessionUpdate = (updates: Partial<PatientSession>) => {
    if (currentSession) {
      updateSession(currentSession.id, updates);
      setCurrentSession({ ...currentSession, ...updates });
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

  const handleLanguageDetected = (language: 'ar' | 'en') => {
    setSelectedLanguage(language);
    console.log(`🌍 Language detected in main page: ${language.toUpperCase()}`);
  };

  const handleNoteTypeSelect = (type: string) => {
    setNoteType(type);
    setCurrentStep(6);
  };

  const handleGenerateNote = async () => {
    setIsProcessing(true);
    try {
      console.log(`🏥 Generating note with language: ${selectedLanguage.toUpperCase()}`);
      const response = await fetch('/api/generate-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          noteType,
          language: selectedLanguage
        }),
      });

      if (!response.ok) throw new Error('Failed to generate note');

      const data = await response.json();
      console.log(`✅ Note generated from ${data.source} with confidence: ${data.confidence}`);
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

  // Loading component for better UX
  const LoadingSpinner = () => <FastLoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

      {/* Modern Header with Logo - Mobile Optimized */}
      <div className="relative bg-white/90 backdrop-blur-md border-b border-white/30 mb-4 sm:mb-6 lg:mb-8">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 lg:py-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
              {/* Logo - Responsive sizing */}
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl blur-sm sm:blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                <Image
                  src="/logo.png"
                  alt="Lexxi Medical Logo"
                  width={160}
                  height={25}
                  className="sm:w-[200px] lg:w-[230px] rounded-lg sm:rounded-xl object-contain bg-transparent drop-shadow-md"
                  priority
                />
              </div>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {selectedLanguage === 'ar' ? 'اللغة:' : 'Language:'}
              </span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSelectedLanguage('ar')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedLanguage === 'ar'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  العربية
                </button>
                <button
                  onClick={() => setSelectedLanguage('en')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedLanguage === 'en'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-6xl">
        {/* Hero Section - Mobile Optimized */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2 leading-tight" style={{ color: '#0f3143' }}>
              تحويل الأصوات الطبية إلى تقارير احترافية باستخدام الذكاء الاصطناعي
            </h2>
          </div>

          {/* Features badges - Mobile responsive */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-8 text-xs sm:text-sm text-gray-500 px-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span>Arabic Support</span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#85cef7' }}></div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span>SeHE Compliant</span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#6f91c7ff' }}></div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span>PDPL Compliant</span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#4f78b9ff' }}></div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span>AI Transcription</span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#0c4a74ff' }}></div>
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
                      background: `linear-gradient(135deg, #3e74c9, #6cb7e8)`,
                      boxShadow: '0 8px 25px -5px rgba(62, 116, 201, 0.3)'
                    } : {}}>
                    <step.icon className="h-6 w-6" />
                    {currentStep >= step.id && (
                      <div className="absolute inset-0 rounded-2xl animate-pulse bg-gradient-to-r from-blue-400/20 to-blue-600/20" />
                    )}
                  </div>

                  {/* Step Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold mb-1 ${currentStep >= step.id ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">{step.titleEn}</p>
                  </div>

                  {/* Connection Line for Mobile */}
                  {index < steps.length - 1 && (
                    <div className="absolute right-6 mt-12 w-0.5 h-4 bg-gradient-to-b from-blue-300 to-gray-200 rounded-full" />
                  )}
                </div>
              ))}
            </div>

            {/* Desktop: Horizontal Layout */}
            <div className="hidden sm:flex justify-between items-center max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                    <div className={`relative w-14 h-14 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-3 lg:mb-4 transition-all duration-300 ${currentStep >= step.id
                      ? 'text-white shadow-xl scale-105'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      style={currentStep >= step.id ? {
                        background: `linear-gradient(135deg, #3e74c9, #6cb7e8)`,
                        boxShadow: '0 12px 25px -5px rgba(62, 116, 201, 0.3)'
                      } : {}}>
                      <step.icon className="h-7 w-7 lg:h-8 lg:w-8" />
                      {currentStep >= step.id && (
                        <div className="absolute inset-0 rounded-2xl lg:rounded-3xl animate-pulse bg-gradient-to-r from-blue-400/20 to-blue-600/20" />
                      )}
                    </div>
                    <span className={`text-sm lg:text-base font-bold text-center mb-1 px-2 ${currentStep >= step.id ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                      {step.title}
                    </span>
                    <span className="text-xs text-gray-400 text-center hidden lg:block">{step.titleEn}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 lg:mx-8 rounded-full transition-all duration-500 ${currentStep > step.id
                      ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                      : 'bg-gray-200'
                      }`} />
                  )}
                </div>
              ))}
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
                language={selectedLanguage}
              />
            </div>
          )}

          {/* Step 2: Session Notes */}
          {currentStep === 2 && currentSession && (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 lg:p-10 border border-white/30">
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                  ملاحظات الجلسة
                </h2>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
                  أضف ملاحظات سريعة أثناء الجلسة لتذكر النقاط المهمة
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Session Summary */}
                <div className="lg:col-span-1">
                  <SessionSummary
                    session={currentSession}
                    language={selectedLanguage}
                    onEdit={() => setCurrentStep(1)}
                    onContinue={goToRecording}
                  />
                </div>

                {/* Note Editor */}
                <div className="lg:col-span-3">
                  <NoteEditor
                    session={currentSession}
                    onUpdateSession={handleSessionUpdate}
                    language={selectedLanguage}
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
                  تسجيل الصوت
                </h2>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
                  سجل ملخص الجلسة أو المحادثة الكاملة
                </p>
              </div>

              <SessionVoiceRecorder
                onComplete={handleAudioComplete}
                session={currentSession}
                language={selectedLanguage}
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
                  language={selectedLanguage}
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
