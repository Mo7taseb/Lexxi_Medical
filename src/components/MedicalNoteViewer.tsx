'use client';

import React, { useState } from 'react';
import { FileText, Loader2, AlertCircle, CheckCircle, Copy, Download, RotateCcw, Edit3, Save, X } from 'lucide-react';

interface MedicalNoteViewerProps {
    transcript: string;
    noteType: string;
    generatedNote: string;
    isProcessing: boolean;
    onGenerate: () => void;
    onReset: () => void;
}

const MedicalNoteViewer: React.FC<MedicalNoteViewerProps> = ({
    transcript,
    noteType,
    generatedNote,
    isProcessing,
    onGenerate,
    onReset
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedNote, setEditedNote] = useState(generatedNote);
    const [copySuccess, setCopySuccess] = useState(false);

    const noteTypeNames: { [key: string]: string } = {
        soap: 'تقرير SOAP',
        progress: 'تقرير متابعة',
        consultation: 'تقرير استشارة',
        discharge: 'تقرير خروج',
        freeform: 'تقرير حر'
    };

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

        // Add line breaks for better readability
        return note
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {noteTypeNames[noteType] || 'التقرير الطبي'}
            </h2>

            {/* Original Transcript Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">النص الأصلي</h3>
                <div className="bg-white rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap text-right">
                        {transcript}
                    </p>
                </div>
            </div>

            {/* Generate Note Button */}
            {!generatedNote && !isProcessing && (
                <div className="text-center mb-6">
                    <button
                        onClick={onGenerate}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <FileText className="h-5 w-5" />
                        إنشاء التقرير الطبي
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center mb-6">
                    <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">جاري إنشاء التقرير...</h3>
                    <p className="text-blue-600">يتم تحليل النص وإنشاء التقرير الطبي المناسب</p>
                </div>
            )}

            {/* Generated Note Display */}
            {generatedNote && !isProcessing && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-800">
                                {noteTypeNames[noteType]} - تم الإنشاء
                            </h3>
                        </div>

                        <div className="flex gap-2">
                            {!isEditing && (
                                <button
                                    onClick={handleEdit}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <Edit3 className="h-4 w-4" />
                                    تحرير
                                </button>
                            )}

                            <button
                                onClick={handleCopy}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${copySuccess
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                <Copy className="h-4 w-4" />
                                {copySuccess ? 'تم النسخ!' : 'نسخ'}
                            </button>

                            <button
                                onClick={handleDownload}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                تحميل
                            </button>
                        </div>
                    </div>

                    {isEditing ? (
                        <div>
                            <textarea
                                value={editedNote}
                                onChange={(e) => setEditedNote(e.target.value)}
                                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-right bg-white"
                                placeholder="قم بتحرير التقرير هنا..."
                                dir="rtl"
                                style={{
                                    color: '#1f2937',
                                    fontSize: '16px',
                                    lineHeight: '1.6',
                                    fontFamily: 'Cairo, sans-serif'
                                }}
                            />

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={handleCancel}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    حفظ
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div
                                className="whitespace-pre-wrap text-right leading-relaxed text-gray-800"
                                dangerouslySetInnerHTML={{ __html: formatNote(editedNote || generatedNote) }}
                            />
                        </div>
                    )}

                    {/* Note Statistics */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>عدد الكلمات: {(editedNote || generatedNote).split(/\s+/).filter(word => word.trim()).length}</span>
                            <span>عدد الأحرف: {(editedNote || generatedNote).length}</span>
                            <span>نوع التقرير: {noteTypeNames[noteType]}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {generatedNote && !isProcessing && !isEditing && (
                <div className="flex justify-between">
                    <button
                        onClick={onReset}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                        <RotateCcw className="h-5 w-5" />
                        بدء جديد
                    </button>

                    <button
                        onClick={onGenerate}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        إعادة إنشاء التقرير
                    </button>
                </div>
            )}
        </div>
    );
};

export default MedicalNoteViewer;
