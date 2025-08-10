'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Loader2, AlertCircle, CheckCircle, Volume2, Edit3, Save, X } from 'lucide-react';

interface TranscriptionViewerProps {
    audioFile: File;
    audioUrl?: string; // Add support for Cloudinary URL
    onComplete: (transcript: string) => void;
    onLanguageDetected?: (language: 'ar' | 'en') => void; // Add language detection callback
}

const TranscriptionViewer: React.FC<TranscriptionViewerProps> = ({ audioFile, audioUrl, onComplete, onLanguageDetected }) => {
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
    const [transcriptionSource, setTranscriptionSource] = useState<string>('');
    const [showLanguageSelection, setShowLanguageSelection] = useState(false);
    const [isReadyToTranscribe, setIsReadyToTranscribe] = useState(false);
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
            // Always use Cloudinary transcription if we have a Cloudinary URL
            const isCloudinaryUrl = audioUrl && audioUrl.includes('cloudinary.com');

            if (isCloudinaryUrl) {
                // Use Cloudinary transcription endpoint
                console.log('Using Cloudinary transcription for file:', audioUrl);

                const response = await fetch('/api/transcribe-cloudinary', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        audioUrl: audioUrl,
                        language: language,
                        model: 'whisper-large-v3-turbo'
                    }),
                });

                if (!response.ok) {
                    let errorMessage = 'فشل في تفريغ الصوت من Cloudinary';

                    try {
                        // Try to read as text first, then parse as JSON if possible
                        const responseText = await response.text();
                        try {
                            const errorData = JSON.parse(responseText);
                            errorMessage = errorData.error || 'فشل في تفريغ الصوت من Cloudinary';
                        } catch (jsonError) {
                            // If not valid JSON, use the raw text for debugging
                            console.error('Non-JSON error response:', responseText);
                            errorMessage = `خطأ في معالجة الملف من Cloudinary (${response.status}). يرجى المحاولة مرة أخرى.`;
                        }
                    } catch (readError) {
                        console.error('Failed to read response:', readError);
                        errorMessage = `خطأ في قراءة الاستجابة من Cloudinary (${response.status}). يرجى المحاولة مرة أخرى.`;
                    }

                    if (response.status === 429) {
                        throw new Error('العملية قيد التنفيذ بالفعل. يرجى انتظار انتهاء التفريغ الحالي أو المحاولة مرة أخرى بعد دقيقتين.');
                    }

                    throw new Error(errorMessage);
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
                setTranscriptionSource(data.transcriptionSource || 'groq-whisper-cloudinary');

                console.log('Cloudinary transcription completed successfully');
                console.log('- Source:', data.transcriptionSource);
                console.log('- Enhancement:', data.enhancement?.source);

            } else {
                // Fallback to regular transcription (should rarely happen now)
                console.log('Warning: Using direct file upload instead of Cloudinary');

                const formData = new FormData();
                formData.append('audio', audioFile);
                formData.append('language', language);

                console.log('Sending transcription request...');
                const response = await fetch('/api/transcribe', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    let errorData;
                    let errorMessage = 'فشل في تفريغ الصوت';

                    try {
                        errorData = await response.json();
                        errorMessage = errorData.error || 'فشل في تفريغ الصوت';
                    } catch (parseError) {
                        const errorText = await response.text();
                        console.error('Non-JSON error response:', errorText);

                        if (response.status === 413) {
                            errorMessage = 'حجم الملف كبير جداً. يرجى استخدام Cloudinary للملفات الكبيرة.';
                        } else {
                            errorMessage = `خطأ غير متوقع (${response.status}). يرجى المحاولة مرة أخرى.`;
                        }
                    }

                    if (response.status === 429) {
                        throw new Error('العملية قيد التنفيذ بالفعل. يرجى انتظار انتهاء التفريغ الحالي أو المحاولة مرة أخرى بعد دقيقتين.');
                    }

                    throw new Error(errorMessage);
                }

                const data = await response.json();

                if (!data.transcript || data.transcript.trim() === '') {
                    throw new Error('لم يتم العثور على نص في التسجيل الصوتي');
                }

                setTranscript(data.transcript);
                setEditedTranscript(data.transcript);
                setOriginalTranscript(data.originalTranscript || data.transcript);
                setEnhancement(data.enhancement || null);
                setTranscriptionSource(data.transcriptionSource || 'groq-whisper-direct');

                console.log('Direct transcription completed successfully');
            }

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

    // Effect to process new audio files - show language selection first
    useEffect(() => {
        // Only process if this is a truly new audio file that hasn't been processed yet
        if (audioFile && audioFile !== processedAudioFile && !isTranscribingRef.current) {
            console.log('New audio file detected, showing language selection:', audioFile.name);
            setProcessedAudioFile(audioFile);
            setHasTranscribed(false);
            setError(null);
            setTranscript('');
            setEditedTranscript('');
            setShowLanguageSelection(true);
            setIsReadyToTranscribe(false);
        }
    }, [audioFile, processedAudioFile]);

    // Manual retry function
    const retryTranscription = () => {
        setError(null);
        setHasTranscribed(false);
        if (!isTranscribingRef.current) {
            console.log(`🔄 Retrying transcription with language: ${language.toUpperCase()}`);
            transcribeAudioWithLanguage(language);
        }
    };

    // Handle language selection and start transcription
    const handleLanguageSelection = (selectedLanguage: 'ar' | 'en') => {
        console.log(`🌍 Language selected: ${selectedLanguage.toUpperCase()}`);
        setLanguage(selectedLanguage);
        setShowLanguageSelection(false);
        setIsReadyToTranscribe(true);

        // Notify parent component about language selection
        if (onLanguageDetected) {
            onLanguageDetected(selectedLanguage);
        }

        // Start transcription with the selected language directly
        setTimeout(() => {
            transcribeAudioWithLanguage(selectedLanguage);
        }, 100); // Small delay to ensure UI state is updated
    };

    // Handle mixed language selection
    const handleMixedLanguage = () => {
        console.log('🌍 Mixed language selected, defaulting to Arabic');
        setLanguage('ar'); // Default to Arabic for mixed content
        setShowLanguageSelection(false);
        setIsReadyToTranscribe(true);

        // Notify parent component about language selection
        if (onLanguageDetected) {
            onLanguageDetected('ar');
        }

        // Start transcription with Arabic for mixed content
        setTimeout(() => {
            transcribeAudioWithLanguage('ar');
        }, 100);
    };

    // Transcribe with specific language (used by language selection)
    const transcribeAudioWithLanguage = async (targetLanguage: 'ar' | 'en') => {
        // Prevent multiple simultaneous calls using ref
        if (isTranscribingRef.current || hasTranscribed) {
            console.log('Transcription already in progress or completed, skipping...');
            return;
        }

        isTranscribingRef.current = true;
        setIsTranscribing(true);
        setError(null);
        setHasTranscribed(true);

        console.log(`🎯 Starting transcription with language: ${targetLanguage.toUpperCase()}`);

        try {
            const formData = new FormData();
            formData.append('audio', audioFile);
            formData.append('language', targetLanguage); // Use the passed language directly

            console.log(`📤 Sending transcription request with language: ${targetLanguage}`);
            console.log(`📤 FormData contents:`, Array.from(formData.entries()));

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = 'فشل في تفريغ الصوت';

                try {
                    // Try to read as text first, then parse as JSON if possible
                    const responseText = await response.text();
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.error || 'فشل في تفريغ الصوت';
                    } catch (jsonError) {
                        // If not valid JSON, handle different status codes
                        console.error('Non-JSON error response:', responseText);

                        if (response.status === 413) {
                            errorMessage = 'حجم الملف كبير جداً. الحد الأقصى المسموح هو 25 MB. يرجى ضغط الملف أو تقسيمه إلى أجزاء أصغر.';
                        } else if (response.status === 400) {
                            errorMessage = 'تنسيق الملف غير مدعوم أو يحتوي على أخطاء.';
                        } else if (response.status === 500) {
                            errorMessage = 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.';
                        } else if (response.status === 502 || response.status === 503) {
                            errorMessage = 'الخدمة غير متاحة مؤقتاً. يرجى المحاولة مرة أخرى بعد دقائق قليلة.';
                        } else if (responseText.includes('Request Entity Too Large') || responseText.includes('413')) {
                            errorMessage = 'حجم الملف كبير جداً للمعالجة. يرجى استخدام ملف أصغر من 25 MB.';
                        } else {
                            errorMessage = `خطأ غير متوقع (${response.status}). يرجى المحاولة مرة أخرى أو التواصل مع الدعم.`;
                        }
                    }
                } catch (readError) {
                    console.error('Failed to read response:', readError);
                    errorMessage = `خطأ في قراءة الاستجابة (${response.status}). يرجى المحاولة مرة أخرى.`;
                }

                // If it's a duplicate request, show a better message instead of auto-retry
                if (response.status === 429) {
                    console.log('Duplicate request detected');
                    throw new Error('العملية قيد التنفيذ بالفعل. يرجى انتظار انتهاء التفريغ الحالي أو المحاولة مرة أخرى بعد دقيقتين.');
                }

                throw new Error(errorMessage);
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
            setTranscriptionSource(data.transcriptionSource || 'unknown');

            console.log('Transcription completed successfully:');
            console.log('- Source:', data.transcriptionSource);
            console.log('- Enhancement:', data.enhancement?.source);
            console.log('- Improved:', data.enhancement?.improved);

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

            {/* Language Selection Modal - Shown First */}
            {showLanguageSelection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                اختر لغة التسجيل الصوتي
                            </h3>
                            <p className="text-gray-600 text-sm">
                                حدد اللغة المستخدمة في التسجيل الصوتي للحصول على أفضل نتائج التفريغ مع نماذج محسنة لكل لغة
                            </p>
                        </div>

                        <div className="space-y-3">
                            {/* Arabic Option */}
                            <button
                                onClick={() => handleLanguageSelection('ar')}
                                className="w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-200 text-right"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🇸🇦</span>
                                        <div>
                                            <div className="font-semibold text-gray-800">العربية</div>
                                            <div className="text-sm text-gray-600">نموذج Whisper محسن للعربية + تصحيح المصطلحات الطبية</div>
                                        </div>
                                    </div>
                                    <div className="text-blue-600">←</div>
                                </div>
                            </button>

                            {/* English Option */}
                            <button
                                onClick={() => handleLanguageSelection('en')}
                                className="w-full p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 hover:border-green-300 transition-all duration-200 text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🇺🇸</span>
                                        <div>
                                            <div className="font-semibold text-gray-800">English</div>
                                            <div className="text-sm text-gray-600">Optimized English Whisper model + medical terminology correction</div>
                                        </div>
                                    </div>
                                    <div className="text-green-600">→</div>
                                </div>
                            </button>

                            {/* Mixed Language Option */}
                            <button
                                onClick={handleMixedLanguage}
                                className="w-full p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 transition-all duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🌐</span>
                                        <div className="text-center">
                                            <div className="font-semibold text-gray-800">مختلط / Mixed</div>
                                            <div className="text-sm text-gray-600">للتسجيلات التي تحتوي على عربي وإنجليزي</div>
                                        </div>
                                    </div>
                                    <div className="text-purple-600">↕</div>
                                </div>
                            </button>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                <span>يتم التفريغ باستخدام تقنية Groq Whisper (5-15 ثانية)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rest of the UI - Only show after language selection */}
            {!showLanguageSelection && (
                <>
                    {/* Language Selection - Mobile responsive */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'ar' ? 'اختر لغة التفريغ' : 'Select Transcription Language'}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <button
                                onClick={() => setLanguage('ar')}
                                className={`px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors ${language === 'ar'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                العربية
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors ${language === 'en'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                English
                            </button>
                        </div>
                    </div>

                    {/* Transcription Info - Mobile responsive */}
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-2">
                            <span className="text-blue-600 text-lg flex-shrink-0">☁️</span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-blue-800">
                                    {language === 'ar'
                                        ? 'تفريغ سحابي بتقنية Groq Whisper'
                                        : 'Cloud Transcription with Groq Whisper'}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    {language === 'ar'
                                        ? 'سرعة فائقة (5-15 ثانية) مع تصحيح المصطلحات الطبية العربية'
                                        : 'Ultra-fast (5-15 seconds) with medical terminology correction'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Audio Info - Mobile responsive */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-6">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                            <Volume2 className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-700 truncate">اسم الملف: {audioFile.name}</p>
                                <p className="text-sm text-gray-500">الحجم: {(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isTranscribing && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                {language === 'ar' ? 'جاري تفريغ الصوت...' : 'Transcribing audio...'}
                            </h3>
                            <p className="text-blue-600">
                                {language === 'ar'
                                    ? 'قد تستغرق هذه العملية بضع دقائق حسب طول التسجيل'
                                    : 'This process may take a few minutes depending on the recording length'}
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                                <div>
                                    <h3 className="text-lg font-semibold text-red-800">
                                        {language === 'ar' ? 'خطأ في التفريغ' : 'Transcription Error'}
                                    </h3>
                                    <p className="text-red-600">{error}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={retryTranscription}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
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
                                        {language === 'ar'
                                            ? '🤖 تم تحسين النص بواسطة الذكاء الاصطناعي'
                                            : '🤖 Text enhanced by AI'}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Transcription Source Badge */}
                                    {transcriptionSource && (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${transcriptionSource.includes('groq') ? 'bg-blue-100 text-blue-800' :
                                            transcriptionSource.includes('local') ? 'bg-gray-100 text-gray-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {transcriptionSource.includes('groq') ? '☁️ Groq' :
                                                transcriptionSource.includes('local') ? '🖥️ Local' : transcriptionSource}
                                        </span>
                                    )}
                                    {/* Enhancement Source Badge */}
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
                                    {showComparison
                                        ? (language === 'ar' ? '🔼 إخفاء المقارنة' : '� Hide Comparison')
                                        : (language === 'ar' ? '�🔍 مقارنة مع النص الأصلي' : '🔍 Compare with Original')}
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

                            {/* Transcript Statistics - Mobile responsive */}
                            <div className="mt-4 p-3 bg-gray-100 rounded-lg border">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 font-medium">
                                    <span className="truncate">عدد الكلمات: {transcript.split(/\s+/).filter(word => word.trim()).length}</span>
                                    <span className="truncate">عدد الأحرف: {transcript.length}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons - Mobile responsive */}
                    {transcript && !isTranscribing && !isEditing && (
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between">
                            <button
                                onClick={() => {
                                    console.log(`🔄 Re-transcribing with language: ${language.toUpperCase()}`);
                                    transcribeAudioWithLanguage(language);
                                }}
                                className="bg-gray-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors order-2 sm:order-1"
                            >
                                إعادة التفريغ
                            </button>

                            <button
                                onClick={handleComplete}
                                className="bg-blue-600 text-white px-4 sm:px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors order-1 sm:order-2"
                            >
                                {language === 'ar' ? 'متابعة إلى اختيار نوع التقرير' : 'Continue to Note Type Selection'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TranscriptionViewer;
