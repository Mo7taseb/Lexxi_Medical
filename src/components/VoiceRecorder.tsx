'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Upload, AlertCircle, CheckCircle, Volume2 } from 'lucide-react';

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
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                تسجيل الصوت
            </h2>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <div className="bg-gray-50 rounded-lg p-8 mb-6">
                <div className="text-center mb-6">
                    <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {isRecording ? (
                            <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
                        ) : (
                            <Mic className="h-16 w-16 text-blue-600" />
                        )}
                    </div>

                    <div className="text-2xl font-mono font-bold text-gray-800 mb-2">
                        {formatDuration(duration)}
                    </div>

                    <div className="text-sm text-gray-600">
                        {isRecording ? (isPaused ? 'متوقف مؤقتاً' : 'جاري التسجيل...') : 'اضغط لبدء التسجيل'}
                    </div>
                </div>

                <div className="flex justify-center gap-4 mb-6">
                    {!isRecording && !audioURL && (
                        <button
                            onClick={startRecording}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Mic className="h-5 w-5" />
                            ابدأ التسجيل
                        </button>
                    )}

                    {isRecording && (
                        <>
                            <button
                                onClick={pauseRecording}
                                className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center gap-2"
                            >
                                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                                {isPaused ? 'متابعة' : 'إيقاف مؤقت'}
                            </button>

                            <button
                                onClick={stopRecording}
                                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                <Square className="h-5 w-5" />
                                إيقاف التسجيل
                            </button>
                        </>
                    )}
                </div>

                {/* File Upload Option */}
                <div className="border-t pt-6">
                    <div className="text-center mb-4">
                        <span className="text-gray-500 text-sm">أو</span>
                    </div>

                    <div className="flex justify-center">
                        <label className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            رفع ملف صوتي
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Audio Preview */}
            {audioURL && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">معاينة التسجيل</h3>
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>

                    <audio
                        ref={audioRef}
                        src={audioURL}
                        onEnded={() => setIsPlaying(false)}
                        className="w-full mb-4"
                        controls
                    />

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={playRecording}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            {isPlaying ? 'إيقاف' : 'تشغيل'}
                        </button>

                        <button
                            onClick={() => {
                                setAudioURL(null);
                                setAudioFile(null);
                                setDuration(0);
                                setIsPlaying(false);
                            }}
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                        >
                            إعادة التسجيل
                        </button>
                    </div>
                </div>
            )}

            {/* Continue Button */}
            {audioFile && (
                <div className="text-center">
                    <button
                        onClick={handleComplete}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        متابعة إلى التفريغ
                    </button>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;
