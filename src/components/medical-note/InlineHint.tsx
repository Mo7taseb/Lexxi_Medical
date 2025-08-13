'use client';

import React from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { InlineHintProps } from './missingInfoTypes';
import { missingInfoLanguageTexts } from './missingInfoDetection';

const InlineHint: React.FC<InlineHintProps> = ({
    sectionId,
    missingFields,
    onAddField,
    language
}) => {
    const t = missingInfoLanguageTexts[language];

    if (missingFields.length === 0) return null;

    // Get the highest priority among missing fields
    const highestPriority = missingFields.reduce((highest, field) => {
        const priorities: Record<string, number> = { high: 3, medium: 2, low: 1 };
        return (priorities[field.priority] || 1) > (priorities[highest] || 1) ? field.priority : highest;
    }, 'low' as 'high' | 'medium' | 'low');

    const getHintColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'border-red-300 bg-red-50 text-red-700';
            case 'medium':
                return 'border-yellow-300 bg-yellow-50 text-yellow-700';
            case 'low':
                return 'border-blue-300 bg-blue-50 text-blue-700';
            default:
                return 'border-gray-300 bg-gray-50 text-gray-700';
        }
    };

    return (
        <div
            id={`inline-hint-${sectionId}`}
            className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-dashed text-xs font-medium transition-all duration-200 hover:shadow-sm ${getHintColor(highestPriority)}`}
        >
            {/* Warning Icon */}
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />

            {/* Message */}
            <span className="flex-1 min-w-0">
                {language === 'en'
                    ? `${missingFields.length} missing`
                    : `${missingFields.length} مفقود`
                }
            </span>

            {/* Add Button for first missing field */}
            <button
                onClick={() => onAddField(missingFields[0].id)}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-white rounded text-xs font-medium hover:shadow-sm transition-all duration-200 border border-current border-opacity-30"
                title={missingFields[0].displayName}
            >
                <Plus className="h-3 w-3" />
                <span className="truncate max-w-16">
                    {missingFields[0].displayName.length > 10 ? missingFields[0].displayName.substring(0, 8) + '..' : missingFields[0].displayName}
                </span>
            </button>

            {/* Show more indicator if there are more fields */}
            {missingFields.length > 1 && (
                <span className="flex items-center px-1 text-xs font-medium opacity-70">
                    +{missingFields.length - 1}
                </span>
            )}
        </div>
    );
};

export default InlineHint;
