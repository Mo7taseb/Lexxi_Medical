'use client';

import React, { useState, lazy, Suspense } from 'react';
import { Mic, Upload, FileText, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';
import { FastLoadingSpinner } from '@/components/LoadingOptimization';
import Image from 'next/image';
import '@/components/medical-note/styles.css';

// Lazy load components to reduce initial bundle size
const VoiceRecorder = lazy(() => import('@/components/VoiceRecorder'));
const TranscriptionViewer = lazy(() => import('@/components/TranscriptionViewer'));
const NoteTypeSelector = lazy(() => import('@/components/NoteTypeSelector'));
const MedicalNoteViewer = lazy(() => import('@/components/MedicalNoteViewer'));

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [inputMode, setInputMode] = useState<'conversation' | 'summary' | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null); // Add Cloudinary URL state
  const [transcript, setTranscript] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>('ar'); // Add language state
  const [noteType, setNoteType] = useState<string>('soap');
  const [generatedNote, setGeneratedNote] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [patientConsent, setPatientConsent] = useState(false);

  const steps = [
    { id: 1, title: 'اختر نوع الإدخال', titleEn: 'Choose Input Mode', icon: Mic },
    { id: 2, title: 'سجل الصوت', titleEn: 'Record Audio', icon: Upload },
    { id: 3, title: 'راجع النص', titleEn: 'Review Transcript', icon: FileText },
    { id: 4, title: 'اختر نوع التقرير', titleEn: 'Select Note Type', icon: Stethoscope },
    { id: 5, title: 'مراجعة التقرير', titleEn: 'Review Note', icon: CheckCircle },
  ];

  const handleAudioComplete = (file: File, url: string) => {
    setAudioFile(file);
    setAudioUrl(url);

    // Check if it's a Cloudinary URL and store it separately
    if (url.includes('cloudinary.com')) {
      setCloudinaryUrl(url);
    } else {
      setCloudinaryUrl(null);
    }

    setCurrentStep(3);
  };

  const handleTranscriptionComplete = (text: string) => {
    setTranscript(text);
    setCurrentStep(4);
  };

  const handleLanguageDetected = (language: 'ar' | 'en') => {
    setSelectedLanguage(language);
    console.log(`🌍 Language detected in main page: ${language.toUpperCase()}`);
  };

  const handleNoteTypeSelect = (type: string) => {
    setNoteType(type);
    setCurrentStep(5);
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
  };

  // Loading component for better UX
  const LoadingSpinner = () => <FastLoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir="rtl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

      {/* Modern Header with Logo - Mobile Optimized */}
      <div className="relative bg-white/90 backdrop-blur-md border-b border-white/30 mb-4 sm:mb-6 lg:mb-8">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 lg:py-6 max-w-6xl">
          <div className="flex items-center justify-center">
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
              <span>Real-time Processing</span>
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
                    {/* Always show original icon, never replace with checkmark */}
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
                      {/* Always show original icon, never replace with checkmark */}
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
          {/* Step 1: Choose Input Mode */}
          {currentStep === 1 && (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 lg:p-10 border border-white/30">
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                  اختر نوع الإدخال
                </h2>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
                  اختر طريقة التسجيل المناسبة لاحتياجاتك الطبية
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
                <div
                  className={`group relative p-6 sm:p-8 border-3 rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-500 transform hover:scale-102 ${inputMode === 'conversation'
                    ? 'shadow-2xl scale-105 border-blue-400'
                    : 'border-gray-200 hover:shadow-xl bg-white hover:border-gray-300'
                    }`}
                  style={inputMode === 'conversation' ? {
                    background: `linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 50%, #81d4fa 100%)`,
                    boxShadow: '0 25px 50px -12px rgba(62, 116, 201, 0.25)'
                  } : {}}
                  onClick={() => setInputMode('conversation')}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-500 ${inputMode === 'conversation'
                      ? 'text-white shadow-2xl transform rotate-3'
                      : 'text-white hover:scale-110'
                      }`}
                      style={inputMode === 'conversation' ? {
                        background: `linear-gradient(135deg, #1e40af, #3b82f6, #60a5fa)`,
                        boxShadow: '0 20px 25px -5px rgba(30, 64, 175, 0.4)'
                      } : {
                        background: `linear-gradient(135deg, #6366f1, #8b5cf6)`
                      }}>
                      <Mic className="h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${inputMode === 'conversation' ? 'text-blue-900' : 'text-gray-800'
                      }`}>
                      محادثة كاملة
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed px-2">
                      تسجيل المحادثة الكاملة بين الطبيب والمريض
                      <br />
                      <span className="text-xs sm:text-sm text-gray-500 mt-2 block font-medium">Full doctor-patient conversation</span>
                    </p>
                  </div>
                  {inputMode === 'conversation' && (
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div
                  className={`group relative p-6 sm:p-8 border-3 rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-500 transform hover:scale-102 ${inputMode === 'summary'
                    ? 'shadow-2xl scale-105 border-indigo-400'
                    : 'border-gray-200 hover:shadow-xl bg-white hover:border-gray-300'
                    }`}
                  style={inputMode === 'summary' ? {
                    background: `linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #ddd6fe 100%)`,
                    boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)'
                  } : {}}
                  onClick={() => setInputMode('summary')}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-500 ${inputMode === 'summary'
                      ? 'text-white shadow-2xl transform -rotate-3'
                      : 'text-white hover:scale-110'
                      }`}
                      style={inputMode === 'summary' ? {
                        background: `linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa)`,
                        boxShadow: '0 20px 25px -5px rgba(124, 58, 237, 0.4)'
                      } : {
                        background: `linear-gradient(135deg, #06b6d4, #0891b2)`
                      }}>
                      <FileText className="h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${inputMode === 'summary' ? 'text-indigo-900' : 'text-gray-800'
                      }`}>
                      ملخص الطبيب
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed px-2">
                      تسجيل ملخص من الطبيب فقط
                      <br />
                      <span className="text-xs sm:text-sm text-gray-500 mt-2 block font-medium">Doctor's summary only</span>
                    </p>
                  </div>
                  {inputMode === 'summary' && (
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              {inputMode === 'conversation' && (
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl sm:rounded-2xl">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-amber-800 font-semibold mb-2 text-sm sm:text-base">
                        تنبيه مهم - Patient Consent Required
                      </h4>
                      <p className="text-amber-700 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                        يتطلب تسجيل المحادثة الكاملة موافقة المريض المسبقة وفقاً لقوانين الخصوصية الطبية
                      </p>
                      <label className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={patientConsent}
                          onChange={(e) => setPatientConsent(e.target.checked)}
                          className="mt-1 rounded border-amber-300 text-amber-600 focus:ring-amber-500 focus:ring-2 flex-shrink-0"
                        />
                        <span className="text-amber-800 group-hover:text-amber-900 transition-colors leading-relaxed">
                          أؤكد حصولي على موافقة المريض الخطية لتسجيل المحادثة ومعالجة البيانات الطبية
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 sm:mt-10 text-center">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={inputMode === null || (inputMode === 'conversation' && !patientConsent)}
                  className={`relative px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-500 w-full sm:w-auto transform ${inputMode === null || (inputMode === 'conversation' && !patientConsent)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'text-white shadow-2xl hover:shadow-3xl hover:scale-105'
                    }`}
                  style={!(inputMode === null || (inputMode === 'conversation' && !patientConsent)) ? {
                    background: `linear-gradient(135deg, #3b82f6, #1d4ed8, #1e40af)`,
                    boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)'
                  } : {}}
                >
                  <span className="flex items-center justify-center gap-3">
                    <span>متابعة إلى التسجيل</span>
                    <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  {!(inputMode === null || (inputMode === 'conversation' && !patientConsent)) && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 opacity-0 hover:opacity-100 transition-all duration-300" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Record Audio */}
          {currentStep === 2 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
              <Suspense fallback={<LoadingSpinner />}>
                <VoiceRecorder onComplete={handleAudioComplete} />
              </Suspense>
            </div>
          )}

          {/* Step 3: Review Transcript */}
          {currentStep === 3 && audioFile && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
              <Suspense fallback={<LoadingSpinner />}>
                <TranscriptionViewer
                  audioFile={audioFile}
                  audioUrl={cloudinaryUrl || undefined} // Pass Cloudinary URL if available
                  onComplete={handleTranscriptionComplete}
                  onLanguageDetected={handleLanguageDetected}
                />
              </Suspense>
            </div>
          )}

          {/* Step 4: Select Note Type */}
          {currentStep === 4 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
              <Suspense fallback={<LoadingSpinner />}>
                <NoteTypeSelector
                  selectedType={noteType}
                  onSelect={handleNoteTypeSelect}
                />
              </Suspense>
            </div>
          )}

          {/* Step 5: Review Generated Note */}
          {currentStep === 5 && (
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
