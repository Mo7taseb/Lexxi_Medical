'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Upload, AlertCircle, CheckCircle, Volume2, FileText } from 'lucide-react';

interface VoiceRecorderProps {
    onComplete: (file: File, url: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        } catch (err) {
            setError('لا يمكن الوصول للميكروفون. يرجى التأكد من إذن الوصول للميكروفون.');
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

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAudioURL(url);
            setAudioFile(file);
            setError(null);
        }
    };

    const handleComplete = () => {
        if (audioFile && audioURL) {
            onComplete(audioFile, audioURL);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    تسجيل الصوت
                </h2>
                <p className="text-gray-600">سجل المحادثة الطبية أو ارفع ملف صوتي موجود</p>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
                    <div className="flex items-center gap-3 text-red-700">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            )}

            {/* Recording Interface */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 md:p-8 mb-8 border border-gray-200">
                <div className="text-center mb-6 md:mb-8">
                    {/* Recording Visual Indicator */}
                    <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 md:mb-6">
                        {/* Outer ring with animation */}
                        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${isRecording
                                ? 'bg-gradient-to-r from-red-400 to-red-600 animate-pulse shadow-lg shadow-red-500/30'
                                : 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30'
                            }`}>
                            {isRecording && (
                                <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                            )}
                        </div>

                        {/* Inner circle */}
                        <div className="absolute inset-3 md:inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                            {isRecording ? (
                                <div className="relative">
                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-red-500 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-0 w-6 h-6 md:w-8 md:h-8 bg-red-500/50 rounded-full animate-ping"></div>
                                </div>
                            ) : (
                                <Mic className="h-12 w-12 md:h-16 md:w-16 text-blue-600" />
                            )}
                        </div>

                        {/* Visual sound waves when recording - hidden on mobile for cleaner look */}
                        {isRecording && !isPaused && (
                            <>
                                <div className="hidden md:block absolute top-1/2 left-0 w-2 h-8 bg-red-400 rounded-full transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="hidden md:block absolute top-1/2 left-2 w-2 h-12 bg-red-500 rounded-full transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '100ms' }} />
                                <div className="hidden md:block absolute top-1/2 left-4 w-2 h-6 bg-red-400 rounded-full transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '200ms' }} />

                                <div className="hidden md:block absolute top-1/2 right-0 w-2 h-8 bg-red-400 rounded-full transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="hidden md:block absolute top-1/2 right-2 w-2 h-12 bg-red-500 rounded-full transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '250ms' }} />
                                <div className="hidden md:block absolute top-1/2 right-4 w-2 h-6 bg-red-400 rounded-full transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '50ms' }} />
                            </>
                        )}
                    </div>

                    {/* Timer Display */}
                    <div className="bg-white rounded-xl p-3 md:p-4 inline-block shadow-md border border-gray-200 mb-3 md:mb-4">
                        <div className="text-2xl md:text-3xl font-mono font-bold text-gray-800">
                            {formatDuration(duration)}
                        </div>
                    </div>

                    {/* Status Text */}
                    <div className={`text-base md:text-lg font-medium mb-4 md:mb-6 ${isRecording
                            ? (isPaused ? 'text-yellow-600' : 'text-red-600')
                            : 'text-gray-600'
                        }`}>
                        {isRecording ? (isPaused ? '⏸️ متوقف مؤقتاً' : '🔴 جاري التسجيل...') : '🎤 اضغط لبدء التسجيل'}
                    </div>
                </div>

                {/* Recording Controls */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-6 md:mb-8">
                    {!isRecording && !audioURL && (
                        <button
                            onClick={startRecording}
                            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105"
                        >
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <Mic className="h-4 w-4" />
                            </div>
                            ابدأ التسجيل
                            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    )}

                    {isRecording && (
                        <>
                            <button
                                onClick={pauseRecording}
                                className="group relative bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 md:px-6 py-3 md:py-4 rounded-2xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30"
                            >
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                </div>
                                <span className="hidden sm:inline">{isPaused ? 'متابعة' : 'إيقاف مؤقت'}</span>
                                <span className="sm:hidden">{isPaused ? 'متابعة' : 'إيقاف'}</span>
                            </button>

                            <button
                                onClick={stopRecording}
                                className="group relative bg-gradient-to-r from-red-500 to-red-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
                            >
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    <Square className="h-4 w-4" />
                                </div>
                                <span className="hidden sm:inline">إيقاف التسجيل</span>
                                <span className="sm:hidden">إيقاف</span>
                            </button>
                        </>
                    )}
                </div>

                {/* File Upload Option */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-gray-50 text-gray-500 font-medium">أو</span>
                    </div>
                </div>

                <div className="mt-4 md:mt-6 flex justify-center">
                    <label className="group relative bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 md:gap-3 shadow-lg shadow-gray-500/25 hover:shadow-xl hover:shadow-gray-500/30 transform hover:scale-105 w-full sm:w-auto">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            <Upload className="h-4 w-4" />
                        </div>
                        رفع ملف صوتي
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </label>
                </div>
            </div>

            {/* Audio Preview */}
            {audioURL && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 md:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Volume2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-green-800">معاينة التسجيل</h3>
                                <p className="text-green-600 text-sm">تم إنشاء التسجيل بنجاح</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <span className="text-green-700 font-medium text-sm">جاهز</span>
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
                                {isPlaying ? 'إيقاف' : 'تشغيل'}
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
                                إعادة التسجيل
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
                        className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105 w-full sm:w-auto"
                    >
                        <span className="flex items-center justify-center gap-3">
                            متابعة إلى التفريغ
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <FileText className="h-4 w-4" />
                            </div>
                        </span>
                        <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;
