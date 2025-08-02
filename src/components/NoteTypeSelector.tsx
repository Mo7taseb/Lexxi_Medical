'use client';

import React from 'react';
import { FileText, Clipboard, Heart, PenTool, ChevronRight } from 'lucide-react';

interface NoteType {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    example: string;
}

interface NoteTypeSelectorProps {
    selectedType: string;
    onSelect: (type: string) => void;
}

const NoteTypeSelector: React.FC<NoteTypeSelectorProps> = ({ selectedType, onSelect }) => {
    const noteTypes: NoteType[] = [
        {
            id: 'soap',
            title: 'تقرير SOAP',
            titleEn: 'SOAP Note',
            description: 'تقرير منظم يتضمن الأعراض، الفحص، التشخيص، والعلاج',
            icon: Clipboard,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 border-blue-200',
            example: 'S: الأعراض الذاتية\nO: الفحص الموضوعي\nA: التقييم والتشخيص\nP: الخطة العلاجية'
        },
        {
            id: 'progress',
            title: 'تقرير متابعة',
            titleEn: 'Progress Note',
            description: 'تقرير لمتابعة حالة المريض والتطور في العلاج',
            icon: Heart,
            color: 'text-green-600',
            bgColor: 'bg-green-50 border-green-200',
            example: 'تقييم الحالة الحالية\nالتطور منذ الزيارة الأخيرة\nتعديل العلاج إذا لزم الأمر'
        },
        {
            id: 'consultation',
            title: 'تقرير استشارة',
            titleEn: 'Consultation Note',
            description: 'تقرير للاستشارة الطبية أو الإحالة لطبيب آخر',
            icon: PenTool,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 border-purple-200',
            example: 'سبب الإحالة\nالفحص والتقييم\nالتوصيات المطلوبة'
        },
        {
            id: 'discharge',
            title: 'تقرير خروج',
            titleEn: 'Discharge Summary',
            description: 'ملخص شامل لحالة المريض عند الخروج من المستشفى',
            icon: FileText,
            color: 'text-red-600',
            bgColor: 'bg-red-50 border-red-200',
            example: 'ملخص الإقامة\nالتشخيص النهائي\nالعلاج المطلوب\nمواعيد المتابعة'
        },
        {
            id: 'freeform',
            title: 'تقرير حر',
            titleEn: 'Free Form Note',
            description: 'تقرير مفتوح بدون تنسيق محدد',
            icon: PenTool,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50 border-gray-200',
            example: 'تقرير مرن يمكن تخصيصه حسب الحاجة'
        }
    ];

    const handleSelect = (type: string) => {
        onSelect(type);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center px-2">
                اختر نوع التقرير الطبي
            </h2>

            <p className="text-gray-600 text-center mb-6 sm:mb-8 text-sm sm:text-base px-2">
                اختر نوع التقرير الذي تريد إنشاءه من النص المفرغ
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                {noteTypes.map((noteType) => (
                    <div
                        key={noteType.id}
                        className={`p-4 sm:p-6 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all hover:shadow-lg ${selectedType === noteType.id
                            ? `${noteType.bgColor} border-current`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                        onClick={() => handleSelect(noteType.id)}
                    >
                        <div className="text-center">
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full ${noteType.bgColor} flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                                <noteType.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${noteType.color}`} />
                            </div>

                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 px-1">
                                {noteType.title}
                            </h3>

                            <p className="text-xs sm:text-sm text-gray-500 mb-2">
                                {noteType.titleEn}
                            </p>

                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed px-1">
                                {noteType.description}
                            </p>

                            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-right">
                                <p className="text-xs text-gray-500 mb-1">مثال:</p>
                                <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                                    {noteType.example}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected Note Details - Mobile optimized */}
            {selectedType && (
                <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                            التقرير المختار: {noteTypes.find(type => type.id === selectedType)?.title}
                        </h3>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-blue-800 mb-2">
                            <strong>الوصف:</strong> {noteTypes.find(type => type.id === selectedType)?.description}
                        </p>

                        <div className="bg-white rounded-lg p-2 sm:p-3 mt-2 sm:mt-3">
                            <p className="text-xs text-gray-500 mb-2">هيكل التقرير:</p>
                            <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                {noteTypes.find(type => type.id === selectedType)?.example}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Continue Button - Mobile optimized */}
            <div className="text-center">
                <button
                    onClick={() => handleSelect(selectedType)}
                    disabled={!selectedType}
                    className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors w-full sm:w-auto text-sm sm:text-base"
                >
                    متابعة إلى إنشاء التقرير
                </button>
            </div>
        </div>
    );
};

export default NoteTypeSelector;
