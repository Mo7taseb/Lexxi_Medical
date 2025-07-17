'use client';

import React, { useState } from 'react';
import { Mic, Upload, FileText, Stethoscope, AlertCircle, CheckCircle, Play, Pause, Square, Download, Copy } from 'lucide-react';
import VoiceRecorder from '@/components/VoiceRecorder';
import TranscriptionViewer from '@/components/TranscriptionViewer';
import NoteTypeSelector from '@/components/NoteTypeSelector';
import MedicalNoteViewer from '@/components/MedicalNoteViewer';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Lexxi Medical</h1>
          </div>
          <p className="text-gray-600 text-lg">
            نظام ذكي لتحويل الأصوات الطبية إلى تقارير منظمة
          </p>
          <p className="text-gray-500 text-sm">
            AI-Powered Voice-to-Medical-Note System
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex flex-col items-center ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                    }`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-center">{step.title}</span>
                  <span className="text-xs text-gray-500 text-center">{step.titleEn}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Choose Input Mode */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                اختر نوع الإدخال
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${inputMode === 'conversation'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setInputMode('conversation')}
                >
                  <div className="text-center">
                    <Mic className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <h3 className="text-lg font-semibold mb-2">محادثة كاملة</h3>
                    <p className="text-gray-600 text-sm">
                      تسجيل المحادثة الكاملة بين الطبيب والمريض
                    </p>
                  </div>
                </div>

                <div
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${inputMode === 'summary'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setInputMode('summary')}
                >
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <h3 className="text-lg font-semibold mb-2">ملخص الطبيب</h3>
                    <p className="text-gray-600 text-sm">
                      تسجيل ملخص من الطبيب فقط
                    </p>
                  </div>
                </div>
              </div>

              {inputMode === 'conversation' && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 mb-3">
                        <strong>تنبيه:</strong> يتطلب تسجيل المحادثة الكاملة موافقة المريض
                      </p>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={patientConsent}
                          onChange={(e) => setPatientConsent(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        أؤكد حصولي على موافقة المريض لتسجيل المحادثة
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={inputMode === null || (inputMode === 'conversation' && !patientConsent)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  متابعة
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Record Audio */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <VoiceRecorder onComplete={handleAudioComplete} />
            </div>
          )}

          {/* Step 3: Review Transcript */}
          {currentStep === 3 && audioFile && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <TranscriptionViewer
                audioFile={audioFile}
                onComplete={handleTranscriptionComplete}
              />
            </div>
          )}

          {/* Step 4: Select Note Type */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <NoteTypeSelector
                selectedType={noteType}
                onSelect={handleNoteTypeSelect}
              />
            </div>
          )}

          {/* Step 5: Review Generated Note */}
          {currentStep === 5 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <MedicalNoteViewer
                transcript={transcript}
                noteType={noteType}
                generatedNote={generatedNote}
                isProcessing={isProcessing}
                onGenerate={handleGenerateNote}
                onReset={resetApp}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
