'use client';

import React, { useState, lazy, Suspense } from 'react';
import { Mic, Upload, FileText, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';
import { FastLoadingSpinner } from '@/components/LoadingOptimization';

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
  const [transcript, setTranscript] = useState<string>('');
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
    setCurrentStep(3);
  };

  const handleTranscriptionComplete = (text: string) => {
    setTranscript(text);
    setCurrentStep(4);
  };

  const handleNoteTypeSelect = (type: string) => {
    setNoteType(type);
    setCurrentStep(5);
  };

  const handleGenerateNote = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/generate-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, noteType }),
      });

      if (!response.ok) throw new Error('Failed to generate note');

      const data = await response.json();
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

      <div className="relative container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
              <div className="relative bg-white p-3 rounded-full shadow-lg border border-blue-100">
                <Stethoscope className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                Lexxi Medical
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mt-2" />
            </div>
          </div>
          <p className="text-gray-700 text-xl font-medium mb-2">
            نظام ذكي لتحويل الأصوات الطبية إلى تقارير منظمة
          </p>
          <p className="text-gray-500 text-base flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            AI-Powered Voice-to-Medical-Note System
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/20">
            <div className="flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto gap-4 md:gap-0">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center w-full md:w-auto">
                  <div className={`flex flex-col items-center flex-1 md:flex-initial ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                    <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 md:mb-3 transition-all duration-300 ${currentStep >= step.id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}>
                      {currentStep > step.id ? (
                        <CheckCircle className="h-6 w-6 md:h-7 md:w-7" />
                      ) : (
                        <step.icon className="h-6 w-6 md:h-7 md:w-7" />
                      )}
                      {currentStep >= step.id && (
                        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                      )}
                    </div>
                    <span className={`text-xs md:text-sm font-semibold text-center mb-1 ${currentStep >= step.id ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                      {step.title}
                    </span>
                    <span className="text-xs text-gray-400 text-center hidden md:block">{step.titleEn}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden md:flex flex-1 h-1 mx-6 rounded-full transition-all duration-500 ${currentStep > step.id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : 'bg-gray-200'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Choose Input Mode */}
          {currentStep === 1 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  اختر نوع الإدخال
                </h2>
                <p className="text-gray-600">اختر طريقة التسجيل المناسبة لاحتياجاتك</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div
                  className={`group relative p-6 md:p-8 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${inputMode === 'conversation'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-500/20 scale-105'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-lg hover:scale-102 bg-white'
                    }`}
                  onClick={() => setInputMode('conversation')}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${inputMode === 'conversation'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                      }`}>
                      <Mic className="h-8 w-8 md:h-10 md:w-10" />
                    </div>
                    <h3 className={`text-lg md:text-xl font-bold mb-2 md:mb-3 ${inputMode === 'conversation' ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                      محادثة كاملة
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      تسجيل المحادثة الكاملة بين الطبيب والمريض
                      <br />
                      <span className="text-xs text-gray-500 mt-2 block">Record full doctor-patient conversation</span>
                    </p>
                  </div>
                  {inputMode === 'conversation' && (
                    <div className="absolute top-3 md:top-4 right-3 md:right-4">
                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                    </div>
                  )}
                </div>

                <div
                  className={`group relative p-6 md:p-8 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${inputMode === 'summary'
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg shadow-green-500/20 scale-105'
                      : 'border-gray-200 hover:border-green-300 hover:shadow-lg hover:scale-102 bg-white'
                    }`}
                  onClick={() => setInputMode('summary')}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${inputMode === 'summary'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25'
                        : 'bg-green-100 text-green-600 group-hover:bg-green-200'
                      }`}>
                      <FileText className="h-8 w-8 md:h-10 md:w-10" />
                    </div>
                    <h3 className={`text-lg md:text-xl font-bold mb-2 md:mb-3 ${inputMode === 'summary' ? 'text-green-700' : 'text-gray-800'
                      }`}>
                      ملخص الطبيب
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      تسجيل ملخص من الطبيب فقط
                      <br />
                      <span className="text-xs text-gray-500 mt-2 block">Record doctor's summary only</span>
                    </p>
                  </div>
                  {inputMode === 'summary' && (
                    <div className="absolute top-3 md:top-4 right-3 md:right-4">
                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                    </div>
                  )}
                </div>
              </div>

              {inputMode === 'conversation' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-amber-800 font-semibold mb-2">
                        تنبيه مهم - Patient Consent Required
                      </h4>
                      <p className="text-amber-700 text-sm mb-4 leading-relaxed">
                        يتطلب تسجيل المحادثة الكاملة موافقة المريض المسبقة وفقاً لقوانين الخصوصية الطبية
                      </p>
                      <label className="flex items-start gap-3 text-sm cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={patientConsent}
                          onChange={(e) => setPatientConsent(e.target.checked)}
                          className="mt-1 rounded border-amber-300 text-amber-600 focus:ring-amber-500 focus:ring-2"
                        />
                        <span className="text-amber-800 group-hover:text-amber-900 transition-colors">
                          أؤكد حصولي على موافقة المريض الخطية لتسجيل المحادثة ومعالجة البيانات الطبية
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 text-center">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={inputMode === null || (inputMode === 'conversation' && !patientConsent)}
                  className={`relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${inputMode === null || (inputMode === 'conversation' && !patientConsent)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    متابعة إلى التسجيل
                    <Upload className="h-5 w-5" />
                  </span>
                  {!(inputMode === null || (inputMode === 'conversation' && !patientConsent)) && (
                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Record Audio */}
          {currentStep === 2 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <Suspense fallback={<LoadingSpinner />}>
                <VoiceRecorder onComplete={handleAudioComplete} />
              </Suspense>
            </div>
          )}

          {/* Step 3: Review Transcript */}
          {currentStep === 3 && audioFile && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <Suspense fallback={<LoadingSpinner />}>
                <TranscriptionViewer
                  audioFile={audioFile}
                  onComplete={handleTranscriptionComplete}
                />
              </Suspense>
            </div>
          )}

          {/* Step 4: Select Note Type */}
          {currentStep === 4 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <Suspense fallback={<LoadingSpinner />}>
                <MedicalNoteViewer
                  transcript={transcript}
                  noteType={noteType}
                  generatedNote={generatedNote}
                  isProcessing={isProcessing}
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
