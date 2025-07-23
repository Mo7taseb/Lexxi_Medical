'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Loader2, AlertCircle, CheckCircle, Volume2, Edit3, Save, X } from 'lucide-react';

interface TranscriptionViewerProps {
    audioFile: File;
    onComplete: (transcript: string) => void;
}

const TranscriptionViewer: React.FC<TranscriptionViewerProps> = ({ audioFile, onComplete }) => {
    const [transcript, setTranscript] = useState<string>('');
    const [originalTranscript, setOriginalTranscript] = useState<string>('');
    const [enhancement, setEnhancement] = useState<any>(null);
    const [showComparison, setShowComparison] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTranscript, setEditedTranscript] = useState<string>('');
    const [language, setLanguage] = useState<'ar' | 'en'>('ar');
    const [hasTranscribed, setHasTranscribed] = useState(false);
    const [processedAudioFile, setProcessedAudioFile] = useState<File | null>(null);
    const [accuracyMode, setAccuracyMode] = useState<'fast' | 'accurate' | 'medical'>('medical');
    const isTranscribingRef = useRef(false);

    const transcribeAudio = useCallback(async () => {
        // Prevent multiple simultaneous calls using ref
        if (isTranscribingRef.current || hasTranscribed) {
            console.log('Transcription already in progress or completed, skipping...');
            return;
        }

        isTranscribingRef.current = true;
        setIsTranscribing(true);
        setError(null);
        setHasTranscribed(true);

        try {
            const formData = new FormData();
            formData.append('audio', audioFile);
            formData.append('language', language);
            formData.append('accuracy', accuracyMode);

            console.log('Sending transcription request...');
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();

                // If it's a duplicate request, show a better message instead of auto-retry
                if (response.status === 429) {
                    console.log('Duplicate request detected');
                    throw new Error('العملية قيد التنفيذ بالفعل. يرجى انتظار انتهاء التفريغ الحالي أو المحاولة مرة أخرى بعد دقيقتين.');
                }

                throw new Error(errorData.error || 'فشل في تفريغ الصوت');
            }

            const data = await response.json();

            if (!data.transcript || data.transcript.trim() === '') {
                throw new Error('لم يتم العثور على نص في التسجيل الصوتي');
            }

            // Set enhanced transcript as primary
            setTranscript(data.transcript);
            setEditedTranscript(data.transcript);

            // Store original and enhancement info
            setOriginalTranscript(data.originalTranscript || data.transcript);
            setEnhancement(data.enhancement || null);

            console.log('Transcription completed successfully with LLM enhancement:', data.enhancement?.source);
            console.log('Enhancement improved:', data.enhancement?.improved);

        } catch (err) {
            setHasTranscribed(false); // Reset flag on error so user can retry
            let errorMessage = 'حدث خطأ أثناء تفريغ الصوت';

            if (err instanceof Error) {
                if (err.message.includes('charmap') || err.message.includes('codec')) {
                    errorMessage = 'خطأ في ترميز النص العربي. يرجى المحاولة مرة أخرى.';
                } else if (err.message.includes('Python script failed')) {
                    errorMessage = 'خطأ في تشغيل محرك التفريغ. تأكد من تثبيت Python و Whisper.';
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
            console.error('Transcription error:', err);
        } finally {
            setIsTranscribing(false);
            isTranscribingRef.current = false;
        }
    }, [audioFile, language]);

    // Effect to process new audio files only once
    useEffect(() => {
        // Only process if this is a truly new audio file that hasn't been processed yet
        if (audioFile && audioFile !== processedAudioFile && !isTranscribingRef.current) {
            console.log('New audio file detected, starting transcription:', audioFile.name);
            setProcessedAudioFile(audioFile);
            setHasTranscribed(false);
            setError(null);
            setTranscript('');
            setEditedTranscript('');
            transcribeAudio();
        }
    }, [audioFile, processedAudioFile]);

    // Manual retry function
    const retryTranscription = () => {
        setError(null);
        setHasTranscribed(false);
        if (!isTranscribingRef.current) {
            transcribeAudio();
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedTranscript(transcript);
    };

    const handleSave = () => {
        setTranscript(editedTranscript);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedTranscript(transcript);
        setIsEditing(false);
    };

    const handleComplete = () => {
        if (transcript.trim()) {
            onComplete(transcript);
        }
    };

    const formatTranscript = (text: string) => {
        // Clean and format the text properly
        const cleanText = text.trim();

        // For Arabic text with better formatting
        if (language === 'ar') {
            // Split by Arabic punctuation and periods
            const sentences = cleanText.split(/[.!?؟।]/).filter(sentence => sentence.trim());
            if (sentences.length > 1) {
                return sentences.map((sentence, index) => (
                    <div key={index} className="mb-3 leading-relaxed">
                        <span className="inline-block w-6 text-xs text-gray-500 ml-2">
                            {index + 1}.
                        </span>
                        <span className="text-gray-800 text-lg leading-relaxed">
                            {sentence.trim()}
                        </span>
                    </div>
                ));
            }
        } else {
            // English formatting
            const sentences = cleanText.split(/[.!?]/).filter(sentence => sentence.trim());
            if (sentences.length > 1) {
                return sentences.map((sentence, index) => (
                    <div key={index} className="mb-3 leading-relaxed">
                        <span className="inline-block w-6 text-xs text-gray-500 mr-2">
                            {index + 1}.
                        </span>
                        <span className="text-gray-800 text-lg leading-relaxed">
                            {sentence.trim()}
                        </span>
                    </div>
                ));
            }
        }

        // Single paragraph for short text
        return (
            <div className="leading-relaxed">
                <span className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                    {cleanText}
                </span>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                تفريغ الصوت
            </h2>

            {/* Language Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    اختر لغة التفريغ
                </label>
                <div className="flex gap-4">
                    <button
                        onClick={() => setLanguage('ar')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${language === 'ar'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        العربية
                    </button>
                    <button
                        onClick={() => setLanguage('en')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${language === 'en'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        English
                    </button>
                </div>
            </div>

            {/* Accuracy Mode Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    اختر مستوى الدقة
                </label>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => setAccuracyMode('fast')}
                        className={`p-3 rounded-lg font-medium transition-colors text-center ${accuracyMode === 'fast'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <div className="text-sm font-semibold">سريع</div>
                        <div className="text-xs opacity-75">7-15 ثانية</div>
                    </button>
                    <button
                        onClick={() => setAccuracyMode('accurate')}
                        className={`p-3 rounded-lg font-medium transition-colors text-center ${accuracyMode === 'accurate'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <div className="text-sm font-semibold">دقيق</div>
                        <div className="text-xs opacity-75">30-60 ثانية</div>
                    </button>
                    <button
                        onClick={() => setAccuracyMode('medical')}
                        className={`p-3 rounded-lg font-medium transition-colors text-center ${accuracyMode === 'medical'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <div className="text-sm font-semibold">طبي</div>
                        <div className="text-xs opacity-75">1-3 دقائق</div>
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    {accuracyMode === 'fast' && '⚡ سرعة عالية - دقة جيدة للمحادثات العامة'}
                    {accuracyMode === 'accurate' && '🎯 دقة عالية - أفضل للنصوص المهمة'}
                    {accuracyMode === 'medical' && '🏥 دقة طبية - متخصص في المصطلحات الطبية العربية'}
                </p>
            </div>

            {/* Audio Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                    <Volume2 className="h-5 w-5 text-gray-600" />
                    <div>
                        <p className="text-sm text-gray-700">اسم الملف: {audioFile.name}</p>
                        <p className="text-sm text-gray-500">الحجم: {(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isTranscribing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                    <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">جاري تفريغ الصوت...</h3>
                    <p className="text-blue-600">قد تستغرق هذه العملية بضع دقائق حسب طول التسجيل</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-red-800">خطأ في التفريغ</h3>
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={retryTranscription}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                </div>
            )}

            {/* Enhancement Results */}
            {enhancement && transcript && !isTranscribing && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <h4 className="text-md font-semibold text-green-800">
                                🤖 تم تحسين النص بواسطة الذكاء الاصطناعي
                            </h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${enhancement.source === 'groq' ? 'bg-green-100 text-green-800' :
                                enhancement.source === 'local' ? 'bg-blue-100 text-blue-800' :
                                    enhancement.source === 'huggingface' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                }`}>
                                {enhancement.source === 'groq' ? '☁️ Groq' :
                                    enhancement.source === 'local' ? '🏠 Local' :
                                        enhancement.source === 'huggingface' ? '🤗 HuggingFace' :
                                            '📝 Template'}
                            </span>
                            <span className="text-sm text-gray-600">
                                جودة: {(enhancement.confidence * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>

                    {enhancement.improved && (
                        <div className="mb-3">
                            <div className="text-sm text-green-700 mb-2">التحسينات المطبقة:</div>
                            <ul className="list-disc list-inside text-xs text-green-600 space-y-1">
                                {enhancement.corrections?.map((correction: string, index: number) => (
                                    <li key={index}>{correction}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {originalTranscript !== transcript && (
                        <button
                            onClick={() => setShowComparison(!showComparison)}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                            {showComparison ? '🔼 إخفاء المقارنة' : '🔍 مقارنة مع النص الأصلي'}
                        </button>
                    )}
                </div>
            )}

            {/* Original vs Enhanced Comparison */}
            {showComparison && originalTranscript !== transcript && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                        <h5 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                            📝 النص الأصلي (Whisper)
                        </h5>
                        <div
                            className="text-red-700 leading-relaxed text-lg bg-white p-4 rounded border"
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                            style={{ fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
                        >
                            {originalTranscript}
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                        <h5 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                            ✨ النص المحسن (AI)
                        </h5>
                        <div
                            className="text-green-700 leading-relaxed text-lg bg-white p-4 rounded border"
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                            style={{ fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
                        >
                            {transcript}
                        </div>
                    </div>
                </div>
            )}

            {/* Transcript Display */}
            {transcript && !isTranscribing && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-800">النص المفرغ</h3>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={handleEdit}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
                            >
                                <Edit3 className="h-4 w-4" />
                                تحرير
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div>
                            <textarea
                                value={editedTranscript}
                                onChange={(e) => setEditedTranscript(e.target.value)}
                                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                                placeholder="قم بتحرير النص هنا..."
                                dir={language === 'ar' ? 'rtl' : 'ltr'}
                                style={{
                                    scrollBehavior: 'smooth',
                                    color: '#1f2937',
                                    fontSize: '16px',
                                    lineHeight: '1.6',
                                    fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif'
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
                        <div
                            className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto text-right border border-gray-200"
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                            style={{
                                scrollBehavior: 'smooth',
                                fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif',
                                lineHeight: '1.8'
                            }}
                        >
                            <div className="whitespace-pre-wrap leading-relaxed text-gray-800 text-lg">
                                {formatTranscript(transcript)}
                            </div>
                        </div>
                    )}

                    {/* Transcript Statistics */}
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg border">
                        <div className="flex justify-between text-sm text-gray-700 font-medium">
                            <span>عدد الكلمات: {transcript.split(/\s+/).filter(word => word.trim()).length}</span>
                            <span>عدد الأحرف: {transcript.length}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {transcript && !isTranscribing && !isEditing && (
                <div className="flex justify-between">
                    <button
                        onClick={transcribeAudio}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                        إعادة التفريغ
                    </button>

                    <button
                        onClick={handleComplete}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        متابعة إلى اختيار نوع التقرير
                    </button>
                </div>
            )}
        </div>
    );
};

export default TranscriptionViewer;
