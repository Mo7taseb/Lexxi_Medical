'use client';

import React, { useState } from 'react';
import { FileText, Loader2, AlertCircle, CheckCircle, Copy, Download, RotateCcw, Edit3, Save, X } from 'lucide-react';

interface MedicalNoteViewerProps {
    transcript: string;
    noteType: string;
    generatedNote: string;
    isProcessing: boolean;
    language?: string; // Add language prop
    onGenerate: () => void;
    onReset: () => void;
}

const MedicalNoteViewer: React.FC<MedicalNoteViewerProps> = ({
    transcript,
    noteType,
    generatedNote,
    isProcessing,
    language = 'ar', // Default to Arabic for backwards compatibility
    onGenerate,
    onReset
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedNote, setEditedNote] = useState(generatedNote);
    const [copySuccess, setCopySuccess] = useState(false);

    // Detect language from transcript if not provided
    const detectedLanguage = language || detectLanguage(transcript);
    const isEnglish = detectedLanguage === 'en';
    const isArabic = detectedLanguage === 'ar';

    // Language-specific text
    const texts = {
        ar: {
            noteTypeNames: {
                soap: 'تقرير SOAP',
                progress: 'تقرير متابعة',
                consultation: 'تقرير استشارة',
                discharge: 'تقرير خروج',
                freeform: 'تقرير حر'
            },
            noteTypeDescriptions: {
                soap: 'تنسيق منظم: الأعراض، الفحص، التقييم، الخطة',
                progress: 'تحديثات حالة المريض وتقدم العلاج',
                consultation: 'إحالة المختص ونتائج الاستشارة',
                discharge: 'ملخص خروج المستشفى والتعليمات',
                freeform: 'تنسيق توثيق طبي مرن'
            },
            originalText: 'النص الأصلي',
            generateReport: 'إنشاء التقرير الطبي',
            generating: 'جاري إنشاء التقرير...',
            generatingDesc: 'يتم تحليل النص وإنشاء التقرير الطبي المناسب',
            reportGenerated: 'تم الإنشاء',
            edit: 'تحرير',
            copy: 'نسخ',
            copied: 'تم النسخ!',
            download: 'تحميل',
            cancel: 'إلغاء',
            save: 'حفظ',
            editPlaceholder: 'قم بتحرير التقرير هنا...',
            wordCount: 'عدد الكلمات',
            charCount: 'عدد الأحرف',
            reportType: 'نوع التقرير',
            startNew: 'بدء جديد',
            regenerate: 'إعادة إنشاء التقرير'
        },
        en: {
            noteTypeNames: {
                soap: 'SOAP Note',
                progress: 'Progress Note',
                consultation: 'Consultation Note',
                discharge: 'Discharge Summary',
                freeform: 'Free-form Note'
            },
            noteTypeDescriptions: {
                soap: 'Structured format: Subjective, Objective, Assessment, Plan',
                progress: 'Patient status updates and treatment progress',
                consultation: 'Specialist referral and consultation findings',
                discharge: 'Hospital discharge summary and instructions',
                freeform: 'Flexible medical documentation format'
            },
            originalText: 'Original Text',
            generateReport: 'Generate Medical Note',
            generating: 'Generating Report...',
            generatingDesc: 'Analyzing text and creating appropriate medical report',
            reportGenerated: 'Generated',
            edit: 'Edit',
            copy: 'Copy',
            copied: 'Copied!',
            download: 'Download',
            cancel: 'Cancel',
            save: 'Save',
            editPlaceholder: 'Edit the report here...',
            wordCount: 'Word count',
            charCount: 'Character count',
            reportType: 'Report type',
            startNew: 'Start New',
            regenerate: 'Regenerate Report'
        }
    };

    const t = texts[isEnglish ? 'en' : 'ar'];

    // Simple language detection function
    function detectLanguage(text: string): string {
        const arabicPattern = /[\u0600-\u06FF]/;
        const arabicMatches = text.match(/[\u0600-\u06FF]/g);
        const totalChars = text.length;
        const arabicRatio = arabicMatches ? arabicMatches.length / totalChars : 0;
        return arabicRatio > 0.3 ? 'ar' : 'en';
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(editedNote || generatedNote);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleDownload = () => {
        const content = editedNote || generatedNote;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `medical-note-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedNote(generatedNote);
    };

    const handleSave = () => {
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedNote(generatedNote);
        setIsEditing(false);
    };

    const formatNote = (note: string) => {
        if (!note) return '';

        // Enhanced formatting for English notes
        if (isEnglish) {
            let formatted = note
                // First, normalize line breaks
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                // Convert text to proper HTML structure with better detection
                .replace(/(Date of consultation:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Patient location:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Patient identification:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Reason for consultation:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Past medical history.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Physical examination.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Assessment.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Plan.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                // Format any remaining bold text
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1f2937; font-weight: 600;">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em style="color: #374151;">$1</em>')
                // Highlight important medical terms more aggressively
                .replace(/\b(tuberculosis|lymphadenitis|anti-tubercular|medication|Nepal|Canada|London|Ontario|Miss X|31-year-old|female|male|diagnosis|diagnosed|treated|months|years|history|consultation|patient|examination|assessment|plan)\b/gi,
                    '<span style="background: #dbeafe; padding: 2px 6px; border-radius: 4px; font-weight: 500; color: #1e40af;">$1</span>')
                // Format numbered lists with FORCED LTR direction and proper left alignment
                .replace(/^(\d+)\.\s*(.+)$/gm, '<div style="margin: 12px 0; direction: ltr !important; text-align: left !important; display: flex !important; flex-direction: row !important; align-items: flex-start; justify-content: flex-start; border-left: 2px solid #e5e7eb; padding-left: 12px;"><span style="display: inline-block !important; min-width: 40px; text-align: left !important; font-weight: 700; color: #374151; margin-right: 16px; flex-shrink: 0; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">$1.</span><span style="flex: 1; text-align: left !important; line-height: 1.6;">$2</span></div>')
                // Better bullet point formatting
                .replace(/^• (.+)$/gm, '<div style="margin: 8px 0; padding-left: 24px; direction: ltr !important; text-align: left !important; position: relative;"><span style="position: absolute; left: 0; color: #0066cc; font-weight: bold;">•</span>$1</div>')
                // Convert sentences into proper divs instead of invalid nested p tags
                .replace(/\.\s+([A-Z][a-z])/g, '.</div><div style="margin: 12px 0; text-align: left; direction: ltr; line-height: 1.7; color: #374151;">$1')
                // Handle remaining line breaks
                .replace(/\n/g, '<br style="margin: 6px 0;">');

            // Wrap the content properly in a container div, not p tag
            return `<div style="direction: ltr; text-align: left; font-family: 'Inter', sans-serif; color: #374151; line-height: 1.7;"><div style="margin: 12px 0; text-align: left; direction: ltr; line-height: 1.7; color: #374151;">${formatted}</div></div>`;
        }

        // Arabic formatting (existing)
        return note
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Format numbered lists for Arabic with RTL direction
            .replace(/^(\d+)\.\s*(.+)$/gm, '<div style="margin: 4px 0; padding-right: 0; direction: rtl; text-align: right; display: flex; align-items: flex-start;"><span style="flex: 1;">$2</span><span style="display: inline-block; min-width: 32px; text-align: right; font-weight: 500; color: #374151; margin-left: 8px; flex-shrink: 0;">$1.</span></div>')
            .replace(/^(\d+)\s+(.+)$/gm, '<div style="margin: 4px 0; padding-right: 0; direction: rtl; text-align: right; display: flex; align-items: flex-start;"><span style="flex: 1;">$2</span><span style="display: inline-block; min-width: 32px; text-align: right; font-weight: 500; color: #374151; margin-left: 8px; flex-shrink: 0;">$1</span></div>');
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-4 sm:mb-6">
                <h2 className={`text-xl sm:text-2xl font-bold text-gray-800 mb-2 ${isEnglish ? 'text-left' : 'text-right'} px-2`}>
                    {(t.noteTypeNames as any)[noteType] || (isEnglish ? 'Medical Report' : 'التقرير الطبي')}
                </h2>
                {/* Note type description */}
                {(t as any).noteTypeDescriptions && (t as any).noteTypeDescriptions[noteType] && (
                    <p className={`text-xs sm:text-sm text-gray-600 ${isEnglish ? 'text-left' : 'text-right'} px-2`}>
                        {(t as any).noteTypeDescriptions[noteType]}
                    </p>
                )}
            </div>

            {/* Original Transcript Preview - Mobile optimized */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className={`text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 ${isEnglish ? 'text-left' : 'text-right'}`}>
                    {t.originalText}
                </h3>
                <div className="bg-white rounded-lg p-3 sm:p-4 max-h-32 sm:max-h-40 overflow-y-auto">
                    <p className={`text-xs sm:text-sm text-gray-700 whitespace-pre-wrap ${isEnglish ? 'text-left' : 'text-right'}`}
                        dir={isEnglish ? 'ltr' : 'rtl'}>
                        {transcript}
                    </p>
                </div>
            </div>

            {/* Generate Note Button - Mobile responsive */}
            {!generatedNote && !isProcessing && (
                <div className="text-center mb-4 sm:mb-6">
                    <button
                        onClick={onGenerate}
                        className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto w-full sm:w-auto text-sm sm:text-base"
                        dir={isEnglish ? 'ltr' : 'rtl'}
                    >
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        {t.generateReport}
                    </button>
                </div>
            )}

            {/* Loading State - Mobile optimized */}
            {isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 text-center mb-4 sm:mb-6">
                    <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4 animate-spin" />
                    <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">{t.generating}</h3>
                    <p className="text-blue-600 mb-3 text-sm sm:text-base px-2">{t.generatingDesc}</p>

                    {/* English-specific loading indicators - Mobile responsive */}
                    {isEnglish && (
                        <div className="mt-3 sm:mt-4 space-y-2">
                            <div className="text-xs sm:text-sm text-blue-600 flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                <span>Applying medical terminology corrections...</span>
                            </div>
                            <div className="text-xs sm:text-sm text-blue-600 flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <span>Formatting professional medical structure...</span>
                            </div>
                            <div className="text-xs sm:text-sm text-blue-600 flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <span>Ensuring clinical accuracy...</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Generated Note Display - Mobile optimized */}
            {generatedNote && !isProcessing && (
                <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                    {/* Header with title and action buttons - Mobile responsive */}
                    <div className={`flex flex-col gap-3 sm:gap-4 mb-4 ${isEnglish ? 'sm:flex-row sm:items-center sm:justify-between' : 'sm:flex-row-reverse sm:items-center sm:justify-between'}`}>
                        {/* Title section */}
                        <div className={`flex items-center gap-2 ${isEnglish ? 'flex-row' : 'flex-row-reverse'}`}>
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                                {(t.noteTypeNames as any)[noteType] || noteType} - {t.reportGenerated}
                            </h3>
                        </div>

                        {/* Action buttons - Mobile stacked, desktop horizontal */}
                        <div className={`flex flex-col sm:flex-row gap-2 sm:gap-2 ${isEnglish ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                            {!isEditing && (
                                <button
                                    onClick={handleEdit}
                                    className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="truncate">{t.edit}</span>
                                </button>
                            )}

                            <button
                                onClick={handleCopy}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${copySuccess
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="truncate">{copySuccess ? t.copied : t.copy}</span>
                            </button>

                            <button
                                onClick={handleDownload}
                                className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="truncate">{t.download}</span>
                            </button>
                        </div>
                    </div>

                    {isEditing ? (
                        <div>
                            {/* Mobile-optimized textarea for editing */}
                            <textarea
                                value={editedNote}
                                onChange={(e) => setEditedNote(e.target.value)}
                                className={`w-full h-64 sm:h-96 p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-sm sm:text-base ${isEnglish ? 'text-left' : 'text-right'}`}
                                placeholder={t.editPlaceholder}
                                dir={isEnglish ? 'ltr' : 'rtl'}
                                style={{
                                    color: '#1f2937',
                                    fontSize: isEnglish ? '14px' : '15px',
                                    lineHeight: isEnglish ? '1.6' : '1.5',
                                    fontFamily: isEnglish ? 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' : 'Cairo, sans-serif',
                                    letterSpacing: isEnglish ? '0.2px' : 'normal',
                                    unicodeBidi: isEnglish ? 'embed' : 'normal',
                                    textAlign: isEnglish ? 'left' : 'right'
                                }}
                            />

                            {/* English editing helper - Mobile responsive */}
                            {isEnglish && isEditing && (
                                <div className="mt-2 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded text-xs sm:text-sm text-blue-700">
                                    💡 Tip: Use **bold** for section headers and • for bullet points. Medical terminology will be enhanced automatically.
                                </div>
                            )}

                            {/* Editing action buttons - Mobile responsive */}
                            <div className={`flex flex-col sm:flex-row gap-2 sm:gap-2 mt-4 ${isEnglish ? 'sm:justify-end' : 'sm:justify-end'}`}>
                                <button
                                    onClick={handleCancel}
                                    className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base order-2 sm:order-1"
                                >
                                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="truncate">{t.cancel}</span>
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
                                >
                                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="truncate">{t.save}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div
                                className={`medical-note-content leading-relaxed text-gray-800 ${isEnglish ? 'text-left' : 'text-right'} ${isEnglish ? 'font-sans' : 'font-cairo'
                                    }`}
                                dangerouslySetInnerHTML={{ __html: formatNote(editedNote || generatedNote) }}
                                dir={isEnglish ? 'ltr' : 'rtl'}
                                style={{
                                    fontSize: isEnglish ? '15px' : '16px',
                                    lineHeight: isEnglish ? '1.7' : '1.6',
                                    letterSpacing: isEnglish ? '0.3px' : 'normal',
                                    unicodeBidi: isEnglish ? 'embed' : 'normal',
                                    textAlign: isEnglish ? 'left' : 'right'
                                }}
                            />

                            {/* English note enhancement indicator */}
                            {isEnglish && generatedNote && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Professional medical terminology and formatting applied
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Note Statistics - Mobile responsive */}
                    <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 ${isEnglish ? '' : 'text-right'}`}>
                            <span className="truncate">{t.wordCount}: {(editedNote || generatedNote).split(/\s+/).filter(word => word.trim()).length}</span>
                            <span className="truncate">{t.charCount}: {(editedNote || generatedNote).length}</span>
                            <span className="truncate">{t.reportType}: {(t.noteTypeNames as any)[noteType] || noteType}</span>
                        </div>

                        {/* English-specific quality indicators - Mobile responsive */}
                        {isEnglish && generatedNote && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">✅ Medical terminology enhanced</span>
                                    <span className="flex items-center gap-1">✅ Professional formatting applied</span>
                                    <span className="flex items-center gap-1">✅ English medical standards</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bottom Action Buttons - Mobile responsive */}
            {generatedNote && !isProcessing && !isEditing && (
                <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${isEnglish ? 'sm:justify-between' : 'sm:justify-between sm:flex-row-reverse'}`}>
                    <button
                        onClick={onReset}
                        className="bg-gray-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base order-2 sm:order-1"
                    >
                        <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="truncate">{t.startNew}</span>
                    </button>

                    <button
                        onClick={onGenerate}
                        className="bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base order-1 sm:order-2"
                    >
                        <span className="truncate">{t.regenerate}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default MedicalNoteViewer;
