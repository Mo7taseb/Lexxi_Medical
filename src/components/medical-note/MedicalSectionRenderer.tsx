import React from 'react';
import { MedicalSection, Language } from './types';
import { formatSectionContent } from './templates';
import { sanitizeHTML } from './utils';

interface MedicalSectionRendererProps {
    section: MedicalSection;
    language: Language;
    isEditing?: boolean;
    onEdit?: (sectionId: string, content: string) => void;
}

const MedicalSectionRenderer: React.FC<MedicalSectionRendererProps> = ({
    section,
    language,
    isEditing,
    onEdit
}) => {
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
            className={`medical-section medical-section-${section.type}`}
        >
            {/* Section Header */}
            {section.title && (
                <div className="medical-section-header" style={{ '--section-color': section.color } as React.CSSProperties}>
                    <div className="section-title">
                        {section.icon && <span className="section-icon">{section.icon}</span>}
                        <span>{section.title}:</span>
                    </div>
                </div>
            )}

            {/* Section Content */}
            {section.content && (
                <div className="medical-section-content">
                    <div
                        style={{
                            color: '#374151',
                            lineHeight: '1.6',
                            textAlign: 'left',
                            direction: 'ltr'
                        }}
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                </div>
            )}
        </div>
    );
};

export default MedicalSectionRenderer;
