'use client';

import React from 'react';
import { FileText, Clipboard, Heart, PenTool, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NoteType {
    id: string;
    title: string;
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
    const { t, direction } = useLanguage();

    const noteTypes: NoteType[] = [
        {
            id: 'soap',
            title: t('soap'),
            description: t('soapDescription'),
            icon: Clipboard,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 border-blue-200',
            example: 'S: الأعراض الذاتية\nO: الفحص الموضوعي\nA: التقييم والتشخيص\nP: الخطة العلاجية'
        },
        {
            id: 'progress',
            title: t('progress'),
            description: t('progressDescription'),
            icon: Heart,
            color: 'text-green-600',
            bgColor: 'bg-green-50 border-green-200',
            example: 'تقييم الحالة الحالية\nالتطور منذ الزيارة الأخيرة\nتعديل العلاج إذا لزم الأمر'
        },
        {
            id: 'consultation',
            title: t('consultation'),
            description: t('consultationDescription'),
            icon: PenTool,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 border-purple-200',
            example: 'سبب الإحالة\nالفحص والتقييم\nالتوصيات المطلوبة'
        },
        {
            id: 'discharge',
            title: t('discharge'),
            description: t('dischargeDescription'),
            icon: FileText,
            color: 'text-red-600',
            bgColor: 'bg-red-50 border-red-200',
            example: 'ملخص الإقامة\nالتشخيص النهائي\nالعلاج المطلوب\nمواعيد المتابعة'
        },
        {
            id: 'freeform',
            title: t('freeform'),
            description: t('freeformDescription'),
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
        <div className="max-w-5xl mx-auto" dir={direction}>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center px-2">
                {t('selectNoteTypeTitle')}
            </h2>

            <p className="text-gray-600 text-center mb-6 sm:mb-8 text-sm sm:text-base px-2">
                {t('selectNoteTypeSubtitle')}
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
                            <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${noteType.bgColor}`}>
                                <noteType.icon className={`w-6 h-6 ${noteType.color}`} />
                            </div>
                            <h3 className={`font-semibold text-lg mb-2 ${noteType.color}`}>
                                {noteType.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {noteType.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <span>💡</span>
                    <span>اختر نوع التقرير المناسب لنوع الاستشارة الطبية</span>
                </div>
            </div>
        </div>
    );
};

export default NoteTypeSelector;
