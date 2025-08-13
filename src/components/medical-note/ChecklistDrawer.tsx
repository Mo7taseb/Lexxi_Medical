'use client';

import React from 'react';
import { X, AlertCircle, ArrowRight, Plus, CheckCircle } from 'lucide-react';
import { ChecklistDrawerProps } from './missingInfoTypes';
import { missingInfoLanguageTexts } from './missingInfoDetection';

const ChecklistDrawer: React.FC<ChecklistDrawerProps> = ({
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-30"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                {t.missingInfo}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {language === 'en'
                                    ? `${missingItems.length} field${missingItems.length === 1 ? '' : 's'} need attention`
                                    : `${missingItems.length} حقل يحتاج انتباه`
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <X className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {missingItems.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {t.noMissingInfo}
                            </h4>
                            <p className="text-gray-600">
                                {t.allFieldsComplete}
                            </p>
                        </div>
                    ) : (
                        <div className="p-6 space-y-4">
                            {Object.entries(itemsBySection).map(([sectionName, items]) => (
                                <div key={sectionName} className="bg-gray-50 rounded-xl p-4">
                                    {/* Section Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            {sectionName.replace('_', ' ')}
                                        </h4>
                                        <button
                                            onClick={() => {
                                                onScrollToSection(sectionName);
                                                onClose();
                                            }}
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 px-3 py-1 rounded-full hover:bg-blue-50"
                                        >
                                            <span>{language === 'en' ? 'Go to section' : 'انتقل للقسم'}</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {items.slice(0, 3).map((item) => (
                                            <div
                                                key={item.field.id}
                                                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                            <h5 className="font-medium text-gray-900 text-sm">
                                                                {item.field.displayName}
                                                            </h5>
                                                            <div className="flex gap-1">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(item.field.priority)}`}>
                                                                    {t.priorities[item.field.priority]}
                                                                </span>
                                                                {item.field.isRequired && (
                                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                                                                        {t.required}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                                            {item.reason}
                                                        </p>

                                                        {item.suggestion && (
                                                            <p className="text-xs text-blue-600 italic bg-blue-50 p-2 rounded-lg">
                                                                💡 {item.suggestion}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            onFillField(item.field.id);
                                                            onClose();
                                                        }}
                                                        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex-shrink-0 shadow-lg hover:shadow-xl"
                                                    >
                                                        <Plus className="h-5 w-5" />
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
                <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {language === 'en'
                                ? 'Tap the + button to add missing information'
                                : 'انقر على زر + لإضافة المعلومات المفقودة'
                            }
                        </div>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                        >
                            {language === 'en' ? 'Close' : 'إغلاق'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChecklistDrawer;
