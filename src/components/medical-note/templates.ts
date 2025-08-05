import { MedicalSection, Language } from './types';

// Medical section templates and patterns
export interface SectionTemplate {
  pattern: RegExp;
  type: 'header' | 'text' | 'list' | 'medication' | 'investigation';
  color: string;
  icon?: string;
  priority: number;
}

// English section templates
export const englishSectionTemplates: SectionTemplate[] = [
  {
    pattern: /^[\*]*\s*(Consultation Details):?\s*[\*]*(.*)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '📅',
    priority: 1
  },
  {
    pattern: /^[\*]*\s*(Date of consult(?:ation)?):?\s*[\*]*(.*)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '📅',
    priority: 1
  },
  {
    pattern: /^[\*]*\s*(Patient (?:identification|location)):?\s*[\*]*(.*)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '👤',
    priority: 2
  },
  {
    pattern: /^[\*]*\s*(Reason (?:for )?(?:of )?consult(?:ation)?):?\s*[\*]*(.*)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '📋',
    priority: 3
  },
  {
    pattern: /^[\*]*\s*(Past medical history):?\s*[\*]*(.*)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '📚',
    priority: 4
  },
  {
    pattern: /^[\*]*\s*(History of presenting illness):?\s*[\*]*(.*)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '🩺',
    priority: 5
  },
  {
    pattern: /^[\*]*\s*(Physical examination):?\s*[\*]*(.*)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '🔍',
    priority: 6
  },
  {
    pattern: /^[\*]*\s*(Investigation|Lab work|Imaging|Microbiology):?\s*[\*]*(.*)$/gmi,
    type: 'investigation',
    color: '#0066cc',
    icon: '🧪',
    priority: 7
  },
  {
    pattern: /^[\*]*\s*(Assessment):?\s*[\*]*(.*)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '📊',
    priority: 8
  },
  {
    pattern: /^[\*]*\s*(Plan):?\s*[\*]*(.*)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '📝',
    priority: 9
  },
  {
    pattern: /^[\*]*\s*(Home medications?):?\s*[\*]*(.*)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '💊',
    priority: 10
  },
  {
    pattern: /^[\*]*\s*(Allergies):?\s*[\*]*(.*)$/gmi,
    type: 'header',
    color: '#dc2626',
    icon: '⚠️',
    priority: 11
  },
  {
    pattern: /^[\*]*\s*(Social history):?\s*[\*]*(.*)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '👥',
    priority: 12
  }
];

// Arabic section templates
export const arabicSectionTemplates: SectionTemplate[] = [
  {
    pattern: /^(تاريخ الاستشارة:.*?)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '📅',
    priority: 1
  },
  {
    pattern: /^(تعريف المريض|موقع المريض:.*?)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '👤',
    priority: 2
  },
  {
    pattern: /^(سبب الاستشارة:.*?)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '📋',
    priority: 3
  },
  {
    pattern: /^(التاريخ المرضي السابق.*?)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '📚',
    priority: 4
  },
  {
    pattern: /^(تاريخ المرض الحالي:.*?)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '🩺',
    priority: 5
  },
  {
    pattern: /^(الفحص البدني.*?)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '🔍',
    priority: 6
  },
  {
    pattern: /^(الفحوصات|الفحوصات المخبرية|التصوير|علم الأحياء الدقيقة):.*?$/gmi,
    type: 'investigation',
    color: '#3a96edff',
    icon: '🧪',
    priority: 7
  },
  {
    pattern: /^(التقييم.*?)$/gmi,
    type: 'header',
    color: '#0066cc',
    icon: '📊',
    priority: 8
  },
  {
    pattern: /^(الخطة.*?)$/gmi,
    type: 'header',
    color: '#10b981',
    icon: '📝',
    priority: 9
  }
];

// Parse note into structured sections
export const parseNoteToSections = (note: string, language: Language): MedicalSection[] => {
  if (!note) return [];

  const templates = language === 'en' ? englishSectionTemplates : arabicSectionTemplates;
  const sections: MedicalSection[] = [];
  const lines = note.split('\n').filter(line => line.trim());

  let currentSection: MedicalSection | null = null;
  let sectionCounter = 0;
  let isInConsultationDetails = false;

  // List of major sections that should break consultation details grouping
  const majorSections = [
    'Patient identification',
    'Past medical history', 
    'History of presenting illness',
    'Physical examination',
    'Investigation',
    'Assessment',
    'Plan',
    'Home medications',
    'Allergies',
    'Social history'
  ];

  for (const line of lines) {
    let matched = false;
    const cleanLine = line.trim();

    // Special handling for Consultation Details
    if (cleanLine.match(/^[\*]*\s*Consultation Details:?\s*[\*]*/i)) {
      // Save previous section if exists
      if (currentSection) {
        sections.push(currentSection);
      }

      // Create consultation details section
      currentSection = {
        id: `section-${++sectionCounter}`,
        title: 'Consultation Details',
        content: '',
        type: 'header',
        color: '#0066cc',
        icon: '📅'
      };
      isInConsultationDetails = true;
      matched = true;
    }
    // If we're in consultation details, collect lines until we hit a major section
    else if (isInConsultationDetails) {
      // Check if this line starts a major section
      const isMajorSection = majorSections.some(section => 
        cleanLine.toLowerCase().includes(section.toLowerCase()) && 
        cleanLine.includes('*')
      );

      if (isMajorSection) {
        // End consultation details and process this line normally
        isInConsultationDetails = false;
      } else {
        // Add this line to consultation details content
        if (currentSection) {
          const cleanContent = cleanLine.replace(/^\*+\s*/, '').replace(/\*+$/, '').trim();
          if (cleanContent) {
            if (currentSection.content) {
              currentSection.content += '\n' + cleanContent;
            } else {
              currentSection.content = cleanContent;
            }
          }
        }
        matched = true;
      }
    }

    // Regular section matching (when not in consultation details)
    if (!matched) {
      // Check if line matches any template
      for (const template of templates) {
        const match = cleanLine.match(template.pattern);
        if (match) {
          // Save previous section if exists
          if (currentSection) {
            sections.push(currentSection);
          }

          // Extract title and content
          const rawTitle = match[1] ? match[1].trim() : cleanLine;
          // Clean up title: remove asterisks, colons, and extra spaces
          const cleanTitle = rawTitle.replace(/[\*:]+/g, '').trim();
          const content = match[2] ? match[2].trim() : '';

          // Create new section
          currentSection = {
            id: `section-${++sectionCounter}`,
            title: cleanTitle,
            content: content,
            type: template.type,
            color: template.color,
            icon: template.icon
          };
          matched = true;
          break;
        }
      }
    }

    // If no match and we have a current section, add to content
    if (!matched && currentSection && !isInConsultationDetails) {
      // Clean up content line by removing asterisks and extra formatting
      const cleanContent = cleanLine.replace(/^\*+\s*/, '').replace(/\*+$/, '').trim();
      if (cleanContent) {
        if (currentSection.content) {
          currentSection.content += '\n' + cleanContent;
        } else {
          currentSection.content = cleanContent;
        }
      }
    } else if (!matched && !isInConsultationDetails) {
      // Create a general text section for unmatched content
      const cleanContent = cleanLine.replace(/^\*+\s*/, '').replace(/\*+$/, '').trim();
      if (cleanContent) {
        currentSection = {
          id: `section-${++sectionCounter}`,
          title: '',
          content: cleanContent,
          type: 'text',
          color: '#6b7280'
        };
      }
    }
  }

  // Add the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  // If no sections were created, create a single text section
  if (sections.length === 0 && note.trim()) {
    sections.push({
      id: 'section-1',
      title: 'Medical Note',
      content: note.trim(),
      type: 'text',
      color: '#6b7280'
    });
  }

  return sections;
};

// Format individual section content
export const formatSectionContent = (section: MedicalSection, language: Language): string => {
  let content = section.content;

  if (!content) return '';

  // Handle bullet points and dashes
  content = content
    .replace(/^[\s]*[-•]\s*(.+)$/gm, '<div class="bullet-item"><span class="bullet">•</span><span class="text">$1</span></div>')
    .replace(/^[\s]*(\d+)\.?\s*(.+)$/gm, '<div class="numbered-item"><span class="number">$1.</span><span class="text">$2</span></div>');

  if (section.type === 'medication') {
    // Special formatting for medications
    content = content.replace(
      /(\w+)\s+(\d+\s*(?:mg|mcg|g|ml|units?|tablets?|capsules?))\s+(.*)/gi,
      '<div class="medication-item"><strong>$1</strong> <span class="dosage">$2</span> <em>$3</em></div>'
    );
  } else if (section.type === 'investigation') {
    // Format investigation results
    content = content
      .replace(/(Date|Type|Site|Result):\s*(.*?)(?=\n|$)/gi, 
        '<div class="investigation-field"><strong>$1:</strong> <span class="value">$2</span></div>');
  }

  // Basic text formatting
  content = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');

  return content;
};
