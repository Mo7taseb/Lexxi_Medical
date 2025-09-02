'use client';

import React from 'react';
import { Heart, UserCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NoteType {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    shadowColor: string;
    iconBg: string;
}

interface NoteTypeSelectorProps {
    selectedType: string;
    onSelect: (type: string) => void;
}

const NoteTypeSelector: React.FC<NoteTypeSelectorProps> = ({ selectedType, onSelect }) => {
    const { t, direction } = useLanguage();

    const noteTypes: NoteType[] = [
        {
            id: 'progress',
            title: t('progress'),
            description: t('progressDescription'),
            icon: Heart,
            gradient: 'from-emerald-500 to-teal-600',
            shadowColor: 'shadow-emerald-200',
            iconBg: 'bg-emerald-100'
        },
        {
            id: 'consultation',
            title: t('consultation'),
            description: t('consultationDescription'),
            icon: UserCheck,
            gradient: 'from-violet-500 to-purple-600',
            shadowColor: 'shadow-violet-200',
            iconBg: 'bg-violet-100'
        }
    ];

    const handleSelect = (type: string) => {
        onSelect(type);
    };

    return (
        <div className="max-w-4xl mx-auto" dir={direction}>
            {/* Header Section */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {t('selectNoteTypeTitle')}
                    </h2>
                </div>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                    {t('selectNoteTypeSubtitle')}
                </p>
            </div>

            {/* Note Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {noteTypes.map((noteType) => (
                    <div
                        key={noteType.id}
                        className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-[1.02] ${
                            selectedType === noteType.id
                                ? `ring-4 ring-opacity-50 ${noteType.shadowColor} shadow-2xl`
                                : 'hover:shadow-xl'
                        }`}
                        onClick={() => handleSelect(noteType.id)}
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${noteType.gradient} ${
                            selectedType === noteType.id ? 'opacity-15' : 'opacity-0 group-hover:opacity-10'
                        } transition-opacity duration-300`} />
                        
                        {/* Card Content */}
                        <div className={`relative p-8 ${
                            selectedType === noteType.id 
                                ? 'bg-white border-2 border-gray-300 shadow-lg' 
                                : 'bg-white border-2 border-gray-200 group-hover:border-gray-300 group-hover:shadow-md'
                        } transition-all duration-300 rounded-2xl`}>
                            
                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                                selectedType === noteType.id 
                                    ? `bg-gradient-to-br ${noteType.gradient} shadow-lg scale-105` 
                                    : `${noteType.iconBg} group-hover:shadow-md group-hover:scale-105`
                            }`}>
                                <noteType.icon className={`w-8 h-8 transition-all duration-300 ${
                                    selectedType === noteType.id 
                                        ? 'text-white'
                                        : 'text-gray-600 group-hover:text-gray-700'
                                }`} />
                            </div>

                            {/* Title */}
                            <h3 className={`text-2xl font-bold mb-3 transition-all duration-300 ${
                                selectedType === noteType.id 
                                    ? 'text-gray-800'
                                    : 'text-gray-800 group-hover:text-gray-900'
                            }`}>
                                {noteType.title}
                            </h3>

                            {/* Description */}
                            <p className={`text-gray-600 leading-relaxed transition-colors duration-300 ${
                                selectedType === noteType.id ? 'text-gray-700' : 'group-hover:text-gray-700'
                            }`}>
                                {noteType.description}
                            </p>

                            {/* Selection Indicator */}
                            {selectedType === noteType.id && (
                                <div className="absolute top-4 right-4">
                                    <div className={`w-6 h-6 bg-gradient-to-r ${noteType.gradient} rounded-full flex items-center justify-center shadow-lg animate-pulse`}>
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            )}

                            {/* Hover Glow Effect */}
                            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                                noteType.shadowColor
                            } shadow-xl`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">💡</span>
                    </div>
                    <span className="text-gray-700 font-medium">
                        اختر نوع التقرير المناسب لنوع الاستشارة الطبية
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NoteTypeSelector;
