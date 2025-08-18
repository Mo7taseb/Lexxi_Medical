'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Mic,
    Square,
    Play,
    Pause,
    Upload,
    AlertCircle,
    CheckCircle,
    Volume2,
    FileText,
    Loader2,
    Cloud,
    Edit,
    Eye,
    EyeOff
} from 'lucide-react';
import { CloudinaryUploader } from '@/utils/cloudinaryUpload';
import { SessionSummary, NoteEditor, useSession } from '@/components/patient-session';
import { PatientSession } from '@/components/patient-session/types';

interface SessionVoiceRecorderProps {
    onComplete: (file: File, url: string) => void;
    session: PatientSession;
    language: 'ar' | 'en';
}

const SessionVoiceRecorder: React.FC<SessionVoiceRecorderProps> = ({ onComplete, session, language }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
    const [showNotes, setShowNotes] = useState(true);
    const [showSessionSummary, setShowSessionSummary] = useState(true);

    const { updateSession } = useSession();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        return () => {
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000
                }
            });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });

                setAudioURL(audioUrl);
                setAudioFile(file);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                if (durationIntervalRef.current) {
                    clearInterval(durationIntervalRef.current);
                }
            });

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);

            durationIntervalRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

            // Update session to mark recording as started
            updateSession(session.id, {
                status: 'active',
                lastAccessedAt: new Date().toISOString()
            });

        } catch (err) {
            setError(language === 'ar'
                ? 'لا يمكن الوصول للميكروفون. يرجى التأكد من إذن الوصول للميكروفون.'
                : 'Cannot access microphone. Please ensure microphone permissions are granted.'
            );
            console.error('Error accessing microphone:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);

            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }

            // Update session to mark recording as completed
            updateSession(session.id, {
                recordingCompleted: true,
                lastAccessedAt: new Date().toISOString()
            });
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                durationIntervalRef.current = setInterval(() => {
                    setDuration(prev => prev + 1);
                }, 1000);
            } else {
                mediaRecorderRef.current.pause();
                if (durationIntervalRef.current) {
                    clearInterval(durationIntervalRef.current);
                }
            }
            setIsPaused(!isPaused);
        }
    };

    const playRecording = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check file type first
            const supportedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/ogg'];
            if (!supportedTypes.some(type => file.type.includes(type.split('/')[1]))) {
                setError(language === 'ar'
                    ? `نوع الملف غير مدعوم (${file.type}). الأنواع المدعومة: MP3, WAV, M4A, WebM, OGG`
                    : `Unsupported file type (${file.type}). Supported types: MP3, WAV, M4A, WebM, OGG`
                );
                event.target.value = '';
                return;
            }

            // Check file size (100MB Cloudinary limit)
            const maxCloudinarySize = 100 * 1024 * 1024; // 100MB

            if (file.size > maxCloudinarySize) {
                setError(language === 'ar'
                    ? `حجم الملف كبير جداً (${(file.size / 1024 / 1024).toFixed(1)} MB). الحد الأقصى لـ Cloudinary هو 100 MB. يرجى استخدام ملف أصغر.`
                    : `File size too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Cloudinary limit is 100 MB. Please use a smaller file.`
                );
                event.target.value = '';
                return;
            }

            // Always upload to Cloudinary for consistent testing
            try {
                setIsUploading(true);
                setError(null);
                setUploadProgress(0);

                // Upload to Cloudinary
                const cloudinary = new CloudinaryUploader();
                const uploadResult = await cloudinary.uploadAudio(file);

                console.log('Cloudinary upload successful:', uploadResult);

                // Store Cloudinary URL for transcription
                setCloudinaryUrl(uploadResult.secure_url);

                // Create a local URL for preview
                const url = URL.createObjectURL(file);
                setAudioURL(url);
                setAudioFile(file); // Keep original file for local preview
                setError(null); // Clear any previous errors

            } catch (uploadError) {
                console.error('Cloudinary upload failed:', uploadError);
                setError(language === 'ar'
                    ? `فشل في رفع الملف إلى Cloudinary. يرجى التحقق من إعدادات Cloudinary والمحاولة مرة أخرى. الخطأ: ${uploadError}`
                    : `Failed to upload file to Cloudinary. Please check Cloudinary settings and try again. Error: ${uploadError}`
                );
                event.target.value = '';
            } finally {
                setIsUploading(false);
                setUploadProgress(0);
            }
        }
    };

    const handleComplete = async () => {
        if (audioFile && audioURL) {
            // If we have a recording (not uploaded file) and no Cloudinary URL, upload it first
            if (!cloudinaryUrl && audioFile.name.includes('recording-')) {
                try {
                    setIsUploading(true);
                    setError(null);

                    console.log('Uploading recorded audio to Cloudinary...');
                    const cloudinary = new CloudinaryUploader();
                    const uploadResult = await cloudinary.uploadAudio(audioFile);

                    console.log('Recording uploaded to Cloudinary:', uploadResult.secure_url);
                    setCloudinaryUrl(uploadResult.secure_url);

                    // Update session to mark recording as completed
                    updateSession(session.id, {
                        recordingCompleted: true,
                        lastAccessedAt: new Date().toISOString()
                    });

                    // Pass the uploaded Cloudinary URL
                    onComplete(audioFile, uploadResult.secure_url);
                } catch (uploadError) {
                    console.error('Failed to upload recording to Cloudinary:', uploadError);
                    setError(language === 'ar'
                        ? `فشل في رفع التسجيل إلى Cloudinary: ${uploadError}`
                        : `Failed to upload recording to Cloudinary: ${uploadError}`
                    );
                } finally {
                    setIsUploading(false);
                }
            } else {
                // Update session to mark recording as completed
                updateSession(session.id, {
                    recordingCompleted: true,
                    lastAccessedAt: new Date().toISOString()
                });

                // Pass existing Cloudinary URL or local URL for uploaded files
                onComplete(audioFile, cloudinaryUrl || audioURL);
            }
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-7xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Recording Interface */}
                <div className="lg:col-span-8">
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                            {language === 'ar' ? 'تسجيل الصوت' : 'Audio Recording'}
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base px-2">
                            {language === 'ar'
                                ? 'سجل المحادثة الطبية أو ارفع ملف صوتي موجود'
                                : 'Record medical conversation or upload existing audio file'
                            }
                        </p>

                        {/* Patient Name Badge */}
                        <div className="mt-4 inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-lg px-4 py-2">
                            <span className="text-blue-800 font-medium">
                                {language === 'ar' ? 'المريض:' : 'Patient:'} {session.patientInfo.name}
                            </span>
                        </div>

                        {/* Cloudinary indicator */}
                        <div className="mt-3 sm:mt-4">
                            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                                <span className="text-blue-600 text-xs font-medium">☁️ Cloudinary Upload</span>
                                <span className="text-blue-500 text-xs">
                                    {language === 'ar'
                                        ? 'الحد الأقصى: 100 MB • رفع سحابي لجميع الملفات'
                                        : 'Max: 100 MB • Cloud upload for all files'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl sm:rounded-2xl">
                            <div className="flex items-center gap-2 sm:gap-3 text-red-700">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <span className="font-medium text-sm sm:text-base">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Recording Interface */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-200">
                        {/* Recording Visual and Controls - Same as original VoiceRecorder */}
                        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                            {/* Recording Visual Indicator */}
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mx-auto mb-3 sm:mb-4 lg:mb-6">
                                <div className={`absolute inset-0 rounded-full transition-all duration-300 ${isRecording
                                    ? 'bg-gradient-to-r from-red-400 to-red-600 animate-pulse shadow-lg shadow-red-500/30'
                                    : 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30'
                                    }`}>
                                    {isRecording && (
                                        <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                                    )}
                                </div>

                                <div className="absolute inset-2 sm:inset-3 lg:inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                                    {isRecording ? (
                                        <div className="relative">
                                            <div className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-red-500 rounded-full animate-pulse"></div>
                                            <div className="absolute inset-0 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-red-500/50 rounded-full animate-ping"></div>
                                        </div>
                                    ) : (
                                        <Mic className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-blue-600" />
                                    )}
                                </div>

                                {/* Visual sound waves when recording */}
                                {isRecording && !isPaused && (
                                    <>
                                        <div className="hidden lg:block absolute top-1/2 left-0 w-2 h-8 bg-red-400 rounded-full transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="hidden lg:block absolute top-1/2 left-2 w-2 h-12 bg-red-500 rounded-full transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '100ms' }} />
                                        <div className="hidden lg:block absolute top-1/2 left-4 w-2 h-6 bg-red-400 rounded-full transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '200ms' }} />

                                        <div className="hidden lg:block absolute top-1/2 right-0 w-2 h-8 bg-red-400 rounded-full transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="hidden lg:block absolute top-1/2 right-2 w-2 h-12 bg-red-500 rounded-full transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '250ms' }} />
                                        <div className="hidden lg:block absolute top-1/2 right-4 w-2 h-6 bg-red-400 rounded-full transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '50ms' }} />
                                    </>
                                )}
                            </div>

                            {/* Timer Display */}
                            <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 inline-block shadow-md border border-gray-200 mb-3 sm:mb-4">
                                <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold text-gray-800">
                                    {formatDuration(duration)}
                                </div>
                            </div>

                            {/* Status Text */}
                            <div className={`text-sm sm:text-base lg:text-lg font-medium mb-4 sm:mb-6 ${isRecording
                                ? (isPaused ? 'text-yellow-600' : 'text-red-600')
                                : 'text-gray-600'
                                }`}>
                                {isRecording ? (isPaused ?
                                    (language === 'ar' ? '⏸️ متوقف مؤقتاً' : '⏸️ Paused') :
                                    (language === 'ar' ? '🔴 جاري التسجيل...' : '🔴 Recording...')) :
                                    (language === 'ar' ? '🎤 اضغط لبدء التسجيل' : '🎤 Press to start recording')
                                }
                            </div>
                        </div>

                        {/* Recording Controls */}
                        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
                            {!isRecording && !audioURL && (
                                <button
                                    onClick={startRecording}
                                    className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 lg:px-8 py-3 lg:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105 w-full sm:w-auto"
                                >
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center">
                                        <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </div>
                                    {language === 'ar' ? 'ابدأ التسجيل' : 'Start Recording'}
                                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </button>
                            )}

                            {isRecording && (
                                <>
                                    <button
                                        onClick={pauseRecording}
                                        className="group relative bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 sm:px-4 lg:px-6 py-3 lg:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 lg:gap-3 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 flex-1 sm:flex-initial"
                                    >
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center">
                                            {isPaused ? <Play className="h-3 w-3 sm:h-4 sm:w-4" /> : <Pause className="h-3 w-3 sm:h-4 sm:w-4" />}
                                        </div>
                                        <span className="text-sm sm:text-base">
                                            {isPaused ? (language === 'ar' ? 'متابعة' : 'Resume') : (language === 'ar' ? 'إيقاف مؤقت' : 'Pause')}
                                        </span>
                                    </button>

                                    <button
                                        onClick={stopRecording}
                                        className="group relative bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-4 lg:px-6 py-3 lg:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 lg:gap-3 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 flex-1 sm:flex-initial"
                                    >
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center">
                                            <Square className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </div>
                                        <span className="text-sm sm:text-base">
                                            {language === 'ar' ? 'إيقاف التسجيل' : 'Stop Recording'}
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* File Upload Option */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-xs sm:text-sm">
                                <span className="px-3 sm:px-4 bg-gray-50 text-gray-500 font-medium">
                                    {language === 'ar' ? 'أو' : 'or'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 sm:mt-4 lg:mt-6 flex justify-center">
                            <label className={`group relative bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 sm:px-6 lg:px-8 py-3 lg:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 lg:gap-3 shadow-lg shadow-gray-500/25 hover:shadow-xl hover:shadow-gray-500/30 transform hover:scale-105 w-full sm:w-auto text-sm sm:text-base ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    {isUploading ? (
                                        <Cloud className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
                                    ) : (
                                        <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                                    )}
                                </div>
                                {isUploading ?
                                    (language === 'ar' ? 'جاري الرفع إلى Cloudinary...' : 'Uploading to Cloudinary...') :
                                    (language === 'ar' ? 'رفع ملف صوتي' : 'Upload Audio File')
                                }
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </label>
                        </div>

                        {/* Upload Progress */}
                        {isUploading && uploadProgress > 0 && (
                            <div className="mt-3">
                                <div className="bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 text-center">
                                    {uploadProgress}% {language === 'ar' ? 'مكتمل' : 'completed'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Audio Preview */}
                    {audioURL && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-green-800">
                                            {language === 'ar' ? 'معاينة التسجيل' : 'Recording Preview'}
                                        </h3>
                                        <p className="text-green-600 text-xs sm:text-sm">
                                            {language === 'ar' ? 'تم إنشاء التسجيل بنجاح' : 'Recording created successfully'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                    <span className="text-green-700 font-medium text-xs sm:text-sm">
                                        {language === 'ar' ? 'جاهز' : 'Ready'}
                                    </span>
                                </div>
                            </div>

                            {/* Custom Audio Player */}
                            <div className="bg-white rounded-xl p-4 md:p-6 mb-6 border border-green-100">
                                <audio
                                    ref={audioRef}
                                    src={audioURL}
                                    onEnded={() => setIsPlaying(false)}
                                    className="w-full mb-4"
                                    controls
                                />

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                                    <button
                                        onClick={playRecording}
                                        className="group bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 w-full sm:w-auto"
                                    >
                                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                        </div>
                                        {isPlaying ? (language === 'ar' ? 'إيقاف' : 'Pause') : (language === 'ar' ? 'تشغيل' : 'Play')}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setAudioURL(null);
                                            setAudioFile(null);
                                            setDuration(0);
                                            setIsPlaying(false);
                                        }}
                                        className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
                                    >
                                        <Mic className="h-4 w-4" />
                                        {language === 'ar' ? 'إعادة التسجيل' : 'Re-record'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Continue Button */}
                    {audioFile && (
                        <div className="text-center">
                            <button
                                onClick={handleComplete}
                                disabled={isUploading}
                                className={`group relative px-8 md:px-10 py-3 md:py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl transform w-full sm:w-auto ${isUploading
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-3">
                                    {isUploading ? (
                                        <>
                                            {language === 'ar' ? 'جاري الرفع إلى Cloudinary...' : 'Uploading to Cloudinary...'}
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </>
                                    ) : (
                                        <>
                                            {language === 'ar' ? 'متابعة إلى التفريغ' : 'Continue to Transcription'}
                                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                        </>
                                    )}
                                </span>
                                {!isUploading && (
                                    <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Side Panel */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Session Summary Toggle */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {language === 'ar' ? 'معلومات الجلسة' : 'Session Info'}
                        </h3>
                        <button
                            onClick={() => setShowSessionSummary(!showSessionSummary)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            {showSessionSummary ? (
                                <EyeOff className="h-5 w-5 text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-600" />
                            )}
                        </button>
                    </div>

                    {/* Session Summary */}
                    {showSessionSummary && (
                        <SessionSummary
                            session={session}
                            language={language}
                            onEdit={() => {/* Handle edit - could open a modal or navigate */ }}
                            onContinue={() => {/* Handle continue if needed */ }}
                        />
                    )}

                    {/* Notes Toggle */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {language === 'ar' ? 'ملاحظات الجلسة' : 'Session Notes'}
                        </h3>
                        <button
                            onClick={() => setShowNotes(!showNotes)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            {showNotes ? (
                                <EyeOff className="h-5 w-5 text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-600" />
                            )}
                        </button>
                    </div>

                    {/* Session Notes */}
                    {showNotes && (
                        <NoteEditor
                            session={session}
                            onUpdateSession={() => {/* Session will be updated through context */ }}
                            language={language}
                            className="max-h-96 overflow-y-auto"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionVoiceRecorder;
