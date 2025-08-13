'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Mic, SkipForward, Calendar, Clock } from 'lucide-react';
import { MicroFormProps } from './missingInfoTypes';
import { missingInfoLanguageTexts, generateFieldSuggestions } from './missingInfoDetection';

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
    const t = missingInfoLanguageTexts[language];

    // Reset form when field changes
    useEffect(() => {
        setValue('');
        setComplexValues({});
        setIsVoiceMode(false);
    }, [field.id]);

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
        setIsVoiceMode(true);
        onVoiceInput();
        // TODO: Implement actual voice recording logic
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

            {/* Form Modal */}
            <div className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 z-[9999] max-w-lg mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[80vh] overflow-hidden">
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        style={{ fontSize: '16px' }} // Prevent zoom on iOS
                                    />
                                ) : field.type === 'date' ? (
                                    <input
                                        type="date"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        style={{ fontSize: '16px' }} // Prevent zoom on iOS
                                    />
                                ) : field.type === 'dropdown' && field.options ? (
                                    <select
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        style={{ fontSize: '16px' }} // Prevent zoom on iOS
                                    >
                                        <option value="">{language === 'en' ? 'Select...' : 'اختر...'}</option>
                                        {field.options.map((option) => (
                                            <option key={option} value={option}>
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        style={{ fontSize: '16px' }} // Prevent zoom on iOS
                                    />
                                )}

                                {/* Voice Input Button */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleVoiceInput}
                                        disabled={isVoiceMode}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isVoiceMode
                                            ? 'bg-red-100 text-red-700 border border-red-200'
                                            : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
                                            }`}
                                    >
                                        <Mic className={`h-4 w-4 ${isVoiceMode ? 'animate-pulse' : ''}`} />
                                        <span>
                                            {isVoiceMode
                                                ? (language === 'en' ? 'Recording...' : 'جاري التسجيل...')
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
