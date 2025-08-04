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
      borderRadius: '8px',
      overflow: 'hidden',
      direction: 'ltr' as const,
      textAlign: 'left' as const
    };

    switch (section.type) {
      case 'header':
        return {
          ...baseStyles,
          borderLeft: `4px solid ${section.color}`,
          background: '#f8fafc',
          padding: '12px 16px'
        };
      case 'medication':
        return {
          ...baseStyles,
          background: '#fef3c7',
          border: `1px solid ${section.color}`,
          padding: '8px 12px'
        };
      case 'investigation':
        return {
          ...baseStyles,
          background: '#f3e8ff',
          border: `1px solid ${section.color}`,
          padding: '8px 12px'
        };
      default:
        return {
          ...baseStyles,
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          padding: '8px 12px'
        };
    }
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
        <div
          style={{
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: section.content ? '8px' : '0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexDirection: 'row',
            direction: 'ltr',
            textAlign: 'left'
          }}
        >
          {section.icon && <span>{section.icon}</span>}
          <span>{section.title}:</span>
        </div>
      )}

      {/* Section Content */}
      {section.content && (
        <div
          style={{
            color: '#374151',
            lineHeight: '1.6',
            textAlign: 'left',
            direction: 'ltr'
          }}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      )}
    </div>
  );
};

export default MedicalSectionRenderer;
