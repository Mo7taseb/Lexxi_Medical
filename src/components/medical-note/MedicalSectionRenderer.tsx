import React, { useState } from 'react';
import { MedicalSection, Language } from './types';
import { formatSectionContent } from './templates';
import { sanitizeHTML } from './utils';

interface MedicalSectionRendererProps {
    section: MedicalSection;
    language: Language;
    onStartEdit?: (sectionId: string) => void;
    onSaveEdit?: (sectionId: string, newContent: string) => void;
    onCancelEdit?: (sectionId: string) => void;
    isInlineEditing?: boolean;
}

const MedicalSectionRenderer: React.FC<MedicalSectionRendererProps> = ({
    section,
    language,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    isInlineEditing = false
}) => {
    const [isEditingThis, setIsEditingThis] = useState(false);
    const [editContent, setEditContent] = useState(section.content);

    // Handle touch/click to start editing (better for mobile)
    const handleTapToEdit = () => {
        if (!isInlineEditing || isEditingThis) return;

        setIsEditingThis(true);
        setEditContent(section.content);
        onStartEdit?.(section.id);
    };

    // Handle double-click for desktop compatibility
    const handleDoubleClick = () => {
        if (!isInlineEditing) return;
        handleTapToEdit();
    };

    // Handle save
    const handleSave = () => {
        setIsEditingThis(false);
        onSaveEdit?.(section.id, editContent);
    };

    // Handle cancel
    const handleCancel = () => {
        setIsEditingThis(false);
        setEditContent(section.content);
        onCancelEdit?.(section.id);
    };

    // Handle escape key to cancel editing
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        } else if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        }
    };
    // Force LTR for all content - handled by CSS

    const formattedContent = formatSectionContent(section, language);
    const sanitizedContent = sanitizeHTML(formattedContent);

    return (
        <div
            className={`medical-section medical-section-${section.type} ${isInlineEditing && !isEditingThis ? 'cursor-pointer group' : ''
                } ${isEditingThis ? 'ring-2 ring-blue-500 shadow-lg' : ''} relative`}
            onDoubleClick={handleDoubleClick}
            onClick={handleTapToEdit}
            title={isInlineEditing && !isEditingThis ? 'Tap to edit this section' : ''}
        >
            {/* Section Header */}
            {section.title && (
                <div className="medical-section-header flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0" style={{ '--section-color': section.color } as React.CSSProperties}>
                    <div className="section-title flex items-center">
                        {section.icon && <span className="section-icon">{section.icon}</span>}
                        <span>{section.title}:</span>
                    </div>

                    {isEditingThis && (
                        <div className="flex flex-row gap-3 w-full mt-3 sm:mt-0 sm:w-auto">
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg min-h-[48px] sm:min-h-[44px] sm:text-base"
                                title="Save changes"
                            >
                                <span className="text-base sm:text-lg">✓</span>
                                <span>Save</span>
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg min-h-[48px] sm:min-h-[44px] sm:text-base"
                                title="Cancel editing"
                            >
                                <span className="text-base sm:text-lg">✕</span>
                                <span>Cancel</span>
                            </button>
                        </div>
                    )}

                    {isInlineEditing && !isEditingThis && (
                        <div className="text-sm sm:text-sm text-blue-600 bg-blue-50 px-3 sm:px-3 py-2 sm:py-1.5 rounded-lg border border-blue-200 font-medium text-center min-w-[90px] flex items-center justify-center">
                            <span className="whitespace-nowrap">Tap to edit</span>
                        </div>
                    )}
                </div>
            )}

            {/* Section Content */}
            {section.content && (
                <div className="medical-section-content">
                    {isEditingThis ? (
                        <div className="space-y-3">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full min-h-[180px] sm:min-h-[200px] max-h-[400px] sm:max-h-[500px] p-4 sm:p-5 border-2 border-blue-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-lg sm:text-base leading-relaxed shadow-inner bg-white placeholder-gray-500"
                                placeholder="Enter medical content here..."
                                autoFocus
                                style={{
                                    direction: 'ltr',
                                    textAlign: 'left',
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                    fontSize: '16px', // Prevents zoom on iOS
                                    lineHeight: '1.7'
                                }}
                            />
                            <div className="flex justify-center items-center text-base sm:text-sm bg-blue-50 border border-blue-200 px-4 py-3 sm:py-2.5 rounded-xl">
                                <span className={`font-semibold ${editContent.length > 1000 ? 'text-orange-600' : 'text-blue-600'}`}>
                                    {editContent.length} characters
                                    {editContent.length > 1000 && <span className="ml-2">⚠️ Long</span>}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={isInlineEditing ? 'rounded-xl p-4 border-2 border-transparent' : 'p-2'}
                            style={{
                                color: '#1f2937',
                                lineHeight: '1.8',
                                textAlign: 'left',
                                direction: 'ltr',
                                fontSize: '16px',
                                fontWeight: '400'
                            }}
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                        />
                    )}
                </div>
            )}

            {/* Editing Indicator */}
            {isEditingThis && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 rounded-l shadow-sm"></div>
            )}
        </div>
    );
};

export default MedicalSectionRenderer;
