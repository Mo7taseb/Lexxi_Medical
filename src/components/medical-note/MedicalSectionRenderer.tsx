import React, { useState } from 'react';
import { MedicalSection, Language } from './types';
import { formatSectionContent } from './templates';
import { sanitizeHTML } from './utils';

interface MedicalSectionRendererProps {
    section: MedicalSection;
    language: Language;
    isEditing?: boolean;
    onEdit?: (sectionId: string, content: string) => void;
    onStartEdit?: (sectionId: string) => void;
    onSaveEdit?: (sectionId: string, newContent: string) => void;
    onCancelEdit?: (sectionId: string) => void;
    isInlineEditing?: boolean;
}

const MedicalSectionRenderer: React.FC<MedicalSectionRendererProps> = ({
    section,
    language,
    isEditing,
    onEdit,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    isInlineEditing = false
}) => {
    const [isEditingThis, setIsEditingThis] = useState(false);
    const [editContent, setEditContent] = useState(section.content);
    const [showEditHint, setShowEditHint] = useState(false);

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
    // Force LTR for all content - no RTL logic

    const getSectionStyles = () => {
        const baseStyles = {
            margin: '16px 0',
            direction: 'ltr' as const,
            textAlign: 'left' as const
        };

        return baseStyles;
    };

    const formattedContent = formatSectionContent(section, language);
    const sanitizedContent = sanitizeHTML(formattedContent);

    return (
        <div
            style={getSectionStyles()}
            dir="ltr"
            className={`medical-section medical-section-${section.type} ${isInlineEditing && !isEditingThis ? 'cursor-pointer transition-all duration-200 group' : ''
                } ${isEditingThis ? 'ring-2 ring-blue-500 shadow-lg' : ''} relative`}
            onDoubleClick={handleDoubleClick}
            onClick={handleTapToEdit}
            title={isInlineEditing && !isEditingThis ? 'Tap to edit this section' : ''}
        >
            {/* Section Header */}
            {section.title && (
                <div className="medical-section-header flex justify-between items-center" style={{ '--section-color': section.color } as React.CSSProperties}>
                    <div className="section-title flex items-center">
                        {section.icon && <span className="section-icon">{section.icon}</span>}
                        <span>{section.title}:</span>
                    </div>

                    {isEditingThis && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                                onClick={handleSave}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95 min-h-[48px]"
                                title="Save changes"
                            >
                                <span className="text-lg">✓</span> Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95 min-h-[48px]"
                                title="Cancel editing"
                            >
                                <span className="text-lg">✕</span> Cancel
                            </button>
                        </div>
                    )}

                    {isInlineEditing && !isEditingThis && (
                        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 font-medium">
                            ✏️ Tap to edit
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
                                    {editContent.length > 1000 && <span className="ml-2 animate-pulse">⚠️ Long</span>}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={isInlineEditing ? 'rounded-xl p-4 transition-all duration-300 border-2 border-transparent active:border-blue-300' : 'p-2'}
                            style={{
                                color: '#1f2937',
                                lineHeight: '1.8',
                                textAlign: 'left',
                                direction: 'ltr',
                                fontSize: '16px', // Larger for mobile readability
                                fontWeight: '400'
                            }}
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                        />
                    )}
                </div>
            )}

            {/* Editing Indicator */}
            {isEditingThis && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 rounded-l shadow-sm animate-pulse"></div>
            )}
        </div>
    );
};

export default MedicalSectionRenderer;
