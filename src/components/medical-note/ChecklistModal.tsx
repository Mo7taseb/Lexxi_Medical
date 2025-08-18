'use client';

import React, { useEffect } from 'react';
import { X, AlertCircle, ArrowRight, Plus, CheckCircle } from 'lucide-react';
import { ChecklistDrawerProps } from './missingInfoTypes';
import { missingInfoLanguageTexts } from './missingInfoDetection';

const ChecklistModal: React.FC<ChecklistDrawerProps> = ({
    isOpen,
    onClose,
    missingItems,
    onScrollToSection,
    onFillField,
    language
}) => {
    const t = missingInfoLanguageTexts[language];

    // Don't render anything if not open
    if (!isOpen) return null;

    // Scroll to top when modal opens to ensure it's visible
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

    // Group items by section
    const itemsBySection = missingItems.reduce((acc, item) => {
        if (!acc[item.field.section]) {
            acc[item.field.section] = [];
        }
        acc[item.field.section].push(item);
        return acc;
    }, {} as Record<string, typeof missingItems>);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto">
            {/* Add CSS to force modal width */}
            <style>{`
                @media (min-width: 640px) {
                    .force-modal-width {
                        width: 600px !important;
                        max-width: 90vw !important;
                    }
                }
                @media (min-width: 768px) {
                    .force-modal-width {
                        width: 700px !important;
                    }
                }
                @media (min-width: 1024px) {
                    .force-modal-width {
                        width: 800px !important;
                    }
                }
            `}</style>

            {/* Backdrop with blur effect only - NO BLACK BACKGROUND */}
            <div
                className="absolute inset-0 backdrop-blur-md"
                onClick={onClose}
                style={{ background: 'transparent' }}
            />

            {/* Modal - FORCED WIDER WITH CSS */}
            <div
                className="force-modal-width relative bg-white w-full h-full sm:h-auto sm:mx-4 sm:mt-8 sm:mb-8 sm:rounded-2xl shadow-2xl flex flex-col missing-info-modal"
                dir={language === 'en' ? 'ltr' : 'rtl'}
                style={{
                    direction: language === 'en' ? 'ltr' : 'rtl'
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between p-4 sm:p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50"
                    style={{
                        textAlign: language === 'en' ? 'left' : 'right',
                        direction: language === 'en' ? 'ltr' : 'rtl'
                    }}
                >
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate">
                                {t.missingInfo}
                            </h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1 truncate">
                                {language === 'en'
                                    ? `${missingItems.length} field${missingItems.length === 1 ? '' : 's'} need attention`
                                    : `${missingItems.length} حقل يحتاج انتباه`
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 md:p-3 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0 ml-2"
                    >
                        <X className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div
                    className="flex-1 overflow-y-auto sm:max-h-[60vh] md:max-h-[70vh]"
                    style={{
                        textAlign: language === 'en' ? 'left' : 'right',
                        direction: language === 'en' ? 'ltr' : 'rtl'
                    }}
                >
                    {missingItems.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-green-600" />
                            </div>
                            <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                                {t.noMissingInfo}
                            </h4>
                            <p className="text-sm sm:text-base md:text-lg text-gray-600">
                                {t.allFieldsComplete}
                            </p>
                        </div>
                    ) : (
                        <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
                            {Object.entries(itemsBySection).map(([sectionName, items]) => (
                                <div key={sectionName} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200/50">
                                    {/* Section Header */}
                                    <div
                                        className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6"
                                        style={{
                                            direction: language === 'en' ? 'ltr' : 'rtl'
                                        }}
                                    >
                                        <div
                                            className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-1 min-w-0"
                                            style={{
                                                textAlign: language === 'en' ? 'left' : 'right',
                                                justifyContent: language === 'en' ? 'flex-start' : 'flex-end',
                                                flexDirection: language === 'en' ? 'row' : 'row-reverse'
                                            }}
                                        >
                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                                            <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 capitalize truncate">
                                                {sectionName.replace('_', ' ')}
                                            </h4>
                                        </div>
                                        <button
                                            onClick={() => {
                                                onScrollToSection(sectionName);
                                                onClose();
                                            }}
                                            className="flex items-center gap-1 text-xs sm:text-sm md:text-base text-blue-600 hover:text-blue-800 transition-colors duration-200 px-2 sm:px-3 md:px-4 py-1 md:py-2 rounded-full hover:bg-blue-50 flex-shrink-0"
                                        >
                                            <span className="hidden sm:inline">{language === 'en' ? 'Go to section' : 'انتقل للقسم'}</span>
                                            <span className="sm:hidden">{language === 'en' ? 'Go' : 'انتقل'}</span>
                                            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                        </button>
                                    </div>

                                    {/* Missing Items */}
                                    <div
                                        className="space-y-3 md:space-y-4"
                                        style={{
                                            textAlign: language === 'en' ? 'left' : 'right',
                                            direction: language === 'en' ? 'ltr' : 'rtl'
                                        }}
                                    >
                                        {items.slice(0, 3).map((item) => (
                                            <div
                                                key={item.field.id}
                                                className="bg-white p-3 sm:p-4 md:p-6 rounded-lg md:rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-200"
                                            >
                                                <div
                                                    className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4"
                                                    style={{
                                                        direction: language === 'en' ? 'ltr' : 'rtl'
                                                    }}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div
                                                            className="flex items-start sm:items-center justify-between mb-2 md:mb-3 gap-2"
                                                            style={{
                                                                direction: language === 'en' ? 'ltr' : 'rtl'
                                                            }}
                                                        >
                                                            <h5
                                                                className="font-medium text-gray-900 text-sm sm:text-base md:text-lg leading-tight flex-1"
                                                                style={{
                                                                    textAlign: language === 'en' ? 'left' : 'right'
                                                                }}
                                                            >
                                                                {item.field.displayName}
                                                            </h5>
                                                            <div className="flex flex-wrap gap-1 flex-shrink-0 justify-end">
                                                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full border ${getPriorityColor(item.field.priority)}`}>
                                                                    <span className="sm:hidden">{t.priorities[item.field.priority].charAt(0)}</span>
                                                                    <span className="hidden sm:inline">{t.priorities[item.field.priority]}</span>
                                                                </span>
                                                                {item.field.isRequired && (
                                                                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                                                                        <span className="sm:hidden">R</span>
                                                                        <span className="hidden sm:inline">{t.required}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <p
                                                            className="text-xs sm:text-sm text-gray-600 mb-2 leading-relaxed"
                                                            style={{
                                                                textAlign: language === 'en' ? 'left' : 'right',
                                                                direction: language === 'en' ? 'ltr' : 'rtl'
                                                            }}
                                                        >
                                                            {item.reason}
                                                        </p>

                                                        {item.suggestion && (
                                                            <div
                                                                className="text-xs sm:text-sm text-blue-600 italic bg-blue-50 p-2 rounded-lg flex items-start gap-1.5 sm:gap-2"
                                                                style={{
                                                                    flexDirection: language === 'en' ? 'row' : 'row-reverse',
                                                                    textAlign: language === 'en' ? 'left' : 'right',
                                                                    direction: language === 'en' ? 'ltr' : 'rtl'
                                                                }}
                                                            >
                                                                <span
                                                                    className="flex-shrink-0"
                                                                    style={{ order: language === 'en' ? 1 : 2 }}
                                                                >
                                                                    💡
                                                                </span>
                                                                <span
                                                                    style={{
                                                                        order: language === 'en' ? 2 : 1,
                                                                        flex: 1
                                                                    }}
                                                                >
                                                                    {item.suggestion}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            onFillField(item.field.id);
                                                            onClose();
                                                        }}
                                                        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex-shrink-0 shadow-lg hover:shadow-xl"
                                                    >
                                                        <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {items.length > 3 && (
                                            <div className="text-center py-2">
                                                <p className="text-sm text-gray-500">
                                                    {language === 'en'
                                                        ? `+${items.length - 3} more items in this section`
                                                        : `+${items.length - 3} عنصر إضافي في هذا القسم`
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 md:p-8 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 sm:rounded-b-2xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
                        <div
                            className="text-xs sm:text-sm md:text-base text-gray-700 font-medium text-center sm:text-left"
                            style={{
                                textAlign: language === 'en' ? 'left' : 'right',
                                direction: language === 'en' ? 'ltr' : 'rtl'
                            }}
                        >
                            💡 {language === 'en'
                                ? 'Tap the + button to add missing information'
                                : 'انقر على زر + لإضافة المعلومات المفقودة'
                            }
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-white border border-gray-300 text-gray-700 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium shadow-sm text-sm md:text-base"
                        >
                            {language === 'en' ? 'Close' : 'إغلاق'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChecklistModal;
