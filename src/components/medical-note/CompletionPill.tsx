'use client';

import React from 'react';
import { CheckCircle, Eye } from 'lucide-react';
import { CompletionPillProps } from './missingInfoTypes';
import { missingInfoLanguageTexts } from './missingInfoDetection';

const CompletionPill: React.FC<CompletionPillProps> = ({
    completed,
    total,
    onViewChecklist,
    language
}) => {
    const t = missingInfoLanguageTexts[language];
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 100;
    const isComplete = percentage >= 100;

    return (
        <div className={`flex items-center justify-between gap-2 px-3 py-2 rounded-full shadow-md border transition-all duration-300 max-w-full text-sm ${isComplete
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Completion Icon */}
                <div className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${isComplete ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                    <CheckCircle className={`h-4 w-4 ${isComplete ? 'text-green-600' : 'text-blue-600'
                        }`} />
                </div>

                {/* Completion Text */}
                <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-xs whitespace-nowrap">
                        {completed}/{total}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${isComplete
                        ? 'bg-green-100 text-green-700'
                        : percentage >= 80
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                        {percentage}%
                    </span>
                </div>
            </div>

            {/* Action Section */}
            <div className="flex-shrink-0">
                {!isComplete ? (
                    <button
                        onClick={onViewChecklist}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-full text-xs font-medium shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-gray-700 hover:text-gray-900 whitespace-nowrap"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{t.viewChecklist}</span>
                    </button>
                ) : (
                    <span className="text-xs font-medium text-green-700 whitespace-nowrap">
                        ✓ {t.allFieldsComplete}
                    </span>
                )}
            </div>
        </div>
    );
};

export default CompletionPill;
