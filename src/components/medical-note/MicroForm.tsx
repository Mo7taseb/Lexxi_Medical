'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Mic, SkipForward, Calendar, Clock } from 'lucide-react';
import { MicroFormProps } from './missingInfoTypes';
import { missingInfoLanguageTexts, generateFieldSuggestions } from './missingInfoDetection';

// TypeScript declaration for SpeechRecognition
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

const MicroForm: React.FC<MicroFormProps> = ({
    field,
    isOpen,
    onClose,
    onSave,
    onSkip,
    onVoiceInput,
    language
}) => {
    const [value, setValue] = useState('');
    const [complexValues, setComplexValues] = useState<Record<string, string>>({});
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const [isListening, setIsListening] = useState(false);
    const t = missingInfoLanguageTexts[language];

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const speechRecognition = new (window as any).webkitSpeechRecognition();
            speechRecognition.continuous = false;
            speechRecognition.interimResults = false;
            speechRecognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';

            speechRecognition.onstart = () => {
                setIsListening(true);
                setIsVoiceMode(true);
            };

            speechRecognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setValue(prev => prev ? `${prev} ${transcript}` : transcript);
                setIsListening(false);
                setIsVoiceMode(false);

                // Show success feedback
                const button = document.querySelector('[data-voice-button]') as HTMLElement;
                if (button) {
                    button.style.backgroundColor = '#dcfce7';
                    button.style.borderColor = '#16a34a';
                    button.style.color = '#15803d';
                    setTimeout(() => {
                        button.style.backgroundColor = '';
                        button.style.borderColor = '';
                        button.style.color = '';
                    }, 1000);
                }
            };

            speechRecognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                setIsVoiceMode(false);
            };

            speechRecognition.onend = () => {
                setIsListening(false);
                setIsVoiceMode(false);
            };

            setRecognition(speechRecognition);
        }
    }, [language]);

    // Reset form when field changes
    useEffect(() => {
        setValue('');
        setComplexValues({});
        setIsVoiceMode(false);
        setIsListening(false);
    }, [field.id]);

    // Scroll to medical note viewer when modal opens - same as ChecklistModal
    useEffect(() => {
        if (isOpen) {
            // Find the medical note viewer container and scroll to it
            const noteViewer = document.getElementById('medical-note-viewer');

            if (noteViewer) {
                noteViewer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            } else {
                // Fallback to scrolling to top of page if note viewer not found
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }, [isOpen]);

    // Get suggestions for the current field
    const suggestions = generateFieldSuggestions(field, language);

    const handleSave = () => {
        if (field.type === 'complex') {
            onSave(complexValues);
        } else {
            onSave(value.trim());
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setValue(suggestion);
    };

    const handleComplexFieldChange = (fieldName: string, fieldValue: string) => {
        setComplexValues(prev => ({
            ...prev,
            [fieldName]: fieldValue
        }));
    };

    const handleVoiceInput = () => {
        if (!recognition) {
            alert(language === 'en'
                ? 'Voice recognition is not supported in this browser. Please try Chrome or Edge.'
                : 'التعرف على الصوت غير مدعوم في هذا المتصفح. يرجى استخدام Chrome أو Edge.'
            );
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
            setIsVoiceMode(false);
        } else {
            try {
                recognition.start();
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                alert(language === 'en'
                    ? 'Could not start voice recognition. Please check your microphone permissions.'
                    : 'لا يمكن بدء التعرف على الصوت. يرجى التحقق من أذونات الميكروفون.'
                );
            }
        }
    };

    const renderComplexFields = () => {
        switch (field.id) {
            case 'vital_signs':
                return (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {language === 'en' ? 'Blood Pressure' : 'ضغط الدم'}
                            </label>
                            <input
                                type="text"
                                placeholder="120/80 mmHg"
                                value={complexValues.bp || ''}
                                onChange={(e) => handleComplexFieldChange('bp', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {language === 'en' ? 'Heart Rate' : 'النبض'}
                            </label>
                            <input
                                type="text"
                                placeholder="72 bpm"
                                value={complexValues.hr || ''}
                                onChange={(e) => handleComplexFieldChange('hr', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {language === 'en' ? 'Temperature' : 'الحرارة'}
                            </label>
                            <input
                                type="text"
                                placeholder="36.5°C"
                                value={complexValues.temp || ''}
                                onChange={(e) => handleComplexFieldChange('temp', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {language === 'en' ? 'O2 Saturation' : 'الأكسجين'}
                            </label>
                            <input
                                type="text"
                                placeholder="98%"
                                value={complexValues.o2sat || ''}
                                onChange={(e) => handleComplexFieldChange('o2sat', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                );

            case 'medications':
            case 'medications_prescribed':
                return (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {language === 'en' ? 'Medication Name' : 'اسم الدواء'}
                            </label>
                            <input
                                type="text"
                                placeholder={language === 'en' ? 'e.g., Metformin' : 'مثال: ميتفورمين'}
                                value={complexValues.medication || ''}
                                onChange={(e) => handleComplexFieldChange('medication', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {language === 'en' ? 'Dosage' : 'الجرعة'}
                                </label>
                                <input
                                    type="text"
                                    placeholder="500mg"
                                    value={complexValues.dosage || ''}
                                    onChange={(e) => handleComplexFieldChange('dosage', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {language === 'en' ? 'Frequency' : 'التكرار'}
                                </label>
                                <select
                                    value={complexValues.frequency || ''}
                                    onChange={(e) => handleComplexFieldChange('frequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">{language === 'en' ? 'Select...' : 'اختر...'}</option>
                                    <option value="once_daily">{language === 'en' ? 'Once daily' : 'مرة يومياً'}</option>
                                    <option value="twice_daily">{language === 'en' ? 'Twice daily' : 'مرتين يومياً'}</option>
                                    <option value="three_times">{language === 'en' ? 'Three times daily' : 'ثلاث مرات يومياً'}</option>
                                    <option value="as_needed">{language === 'en' ? 'As needed' : 'عند الحاجة'}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            case 'imaging':
            case 'lab_results':
            case 'microbiology':
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {language === 'en' ? 'Date' : 'التاريخ'}
                                </label>
                                <input
                                    type="date"
                                    value={complexValues.date || ''}
                                    onChange={(e) => handleComplexFieldChange('date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {language === 'en' ? 'Type' : 'النوع'}
                                </label>
                                <input
                                    type="text"
                                    placeholder={field.id === 'imaging' ? 'X-ray, CT, MRI' : field.id === 'lab_results' ? 'CBC, CMP' : 'Culture'}
                                    value={complexValues.type || ''}
                                    onChange={(e) => handleComplexFieldChange('type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {language === 'en' ? 'Site/Specimen' : 'الموقع/العينة'}
                            </label>
                            <input
                                type="text"
                                placeholder={language === 'en' ? 'Chest, Abdomen, Blood, etc.' : 'الصدر، البطن، الدم، إلخ'}
                                value={complexValues.site || ''}
                                onChange={(e) => handleComplexFieldChange('site', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {language === 'en' ? 'Result' : 'النتيجة'}
                            </label>
                            <textarea
                                placeholder={language === 'en' ? 'Enter results...' : 'أدخل النتائج...'}
                                value={complexValues.result || ''}
                                onChange={(e) => handleComplexFieldChange('result', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop - ONLY BLUR, NO BLACK BACKGROUND */}
            <div
                className="fixed inset-0 backdrop-blur-md z-[9998] transition-opacity duration-300"
                onClick={onClose}
                style={{ background: 'transparent' }}
            />

            {/* Form Modal - positioned at top like ChecklistModal for seamless replacement */}
            <div className="fixed inset-x-4 top-8 z-[9999] max-w-lg mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[calc(100vh-4rem)] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                {field.type === 'date' ? <Calendar className="h-4 w-4 text-blue-600" /> :
                                    field.type === 'complex' ? <Clock className="h-4 w-4 text-blue-600" /> :
                                        <Save className="h-4 w-4 text-blue-600" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {t.addMissingField}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {field.displayName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 max-h-[60vh] overflow-y-auto">
                        {field.type === 'complex' ? (
                            renderComplexFields()
                        ) : (
                            <div className="space-y-4">
                                {/* Input Field */}
                                {field.type === 'textarea' ? (
                                    <textarea
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder={field.placeholder}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        style={{ fontSize: '16px' }} // Prevent zoom on iOS
                                    />
                                ) : field.type === 'date' ? (
                                    <input
                                        type="date"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        style={{ fontSize: '16px' }} // Prevent zoom on iOS
                                    />
                                ) : field.type === 'dropdown' && field.options ? (
                                    <select
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        style={{ fontSize: '16px' }} // Prevent zoom on iOS
                                    >
                                        <option value="" className="text-gray-500">{language === 'en' ? 'Select...' : 'اختر...'}</option>
                                        {field.options.map((option) => (
                                            <option key={option} value={option} className="text-gray-900">
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type === 'number' ? 'number' : 'text'}
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder={field.placeholder}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        style={{ fontSize: '16px' }} // Prevent zoom on iOS
                                    />
                                )}

                                {/* Voice Input Button */}
                                <div className="flex justify-center">
                                    <button
                                        data-voice-button
                                        onClick={handleVoiceInput}
                                        disabled={!recognition}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isListening
                                                ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                                                : recognition
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
                                                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                            }`}
                                        title={!recognition ? (language === 'en' ? 'Voice recognition not supported' : 'التعرف على الصوت غير مدعوم') : ''}
                                    >
                                        <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse text-red-600' : ''}`} />
                                        <span>
                                            {isListening
                                                ? (language === 'en' ? 'Recording...' : 'جاري التسجيل...')
                                                : !recognition
                                                    ? (language === 'en' ? 'Voice not supported' : 'الصوت غير مدعوم')
                                                    : t.voiceInput
                                            }
                                        </span>
                                    </button>
                                </div>

                                {/* Suggestions */}
                                {suggestions.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                                            {language === 'en' ? 'Quick suggestions:' : 'اقتراحات سريعة:'}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={field.type === 'complex' ? Object.keys(complexValues).length === 0 : !value.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                <Save className="h-4 w-4" />
                                <span>{t.save}</span>
                            </button>

                            {(!field.isRequired || field.canSkip) && (
                                <button
                                    onClick={onSkip}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-200"
                                >
                                    <SkipForward className="h-4 w-4" />
                                    <span>{t.skip}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MicroForm;
