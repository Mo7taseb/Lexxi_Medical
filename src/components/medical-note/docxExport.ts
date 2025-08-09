import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { MedicalSection, Language } from './types';

// Color scheme matching the medical note view
const COLORS = {
  primary: '#005fcc',
  headerBg: '#f4fdff',
  text: '#1f2937',
  subtext: '#64748b',
  border: '#e2e8f0'
};

// Convert HTML content to plain text for DOCX
const htmlToText = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '$1')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

// Parse content for bullet points and formatting
const parseContent = (content: string): Array<{ type: 'paragraph' | 'bullet', text: string, isBold?: boolean }> => {
  const text = htmlToText(content);
  const lines = text.split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    const trimmed = line.trim();
    
    // Check for bullet points
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      return {
        type: 'bullet' as const,
        text: trimmed.replace(/^[•\-\*]\s*/, '').trim()
      };
    }
    
    // Check for investigation subsection headers (bold formatting)
    if (trimmed.match(/^(Lab work|Imaging|Microbiology):/i)) {
      return {
        type: 'paragraph' as const,
        text: trimmed,
        isBold: true
      };
    }
    
    return {
      type: 'paragraph' as const,
      text: trimmed
    };
  });
};

// Create section header
const createSectionHeader = (section: MedicalSection): Paragraph => {
  const icon = section.icon || '';
  const title = section.title || '';
  
  return new Paragraph({
    children: [
      new TextRun({
        text: `${icon} ${title}:`.trim(),
        bold: true,
        size: 32, // 16pt
        color: COLORS.primary,
      }),
    ],
    spacing: {
      before: 240, // 12pt
      after: 120,  // 6pt
    },
    border: {
      bottom: {
        color: COLORS.primary,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
};

// Create section content
const createSectionContent = (section: MedicalSection): Paragraph[] => {
  const parsedContent = parseContent(section.content);
  const paragraphs: Paragraph[] = [];
  
  for (const item of parsedContent) {
    if (item.type === 'bullet') {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${item.text}`,
              size: 24, // 12pt
              color: COLORS.text,
            }),
          ],
          spacing: {
            before: 60,  // 3pt
            after: 60,   // 3pt
          },
          indent: {
            left: 360, // 0.25 inch
          },
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: item.text,
              size: 24, // 12pt
              color: COLORS.text,
              bold: item.isBold || false,
            }),
          ],
          spacing: {
            before: item.isBold ? 120 : 60,  // More space for bold headers
            after: item.isBold ? 60 : 60,
          },
        })
      );
    }
  }
  
  return paragraphs;
};

// Create document header
const createDocumentHeader = (noteType: string, language: Language): Paragraph[] => {
  const currentDate = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const title = language === 'ar' ? 'التقرير الطبي' : 'Medical Report';
  const dateLabel = language === 'ar' ? 'التاريخ:' : 'Date:';
  const typeLabel = language === 'ar' ? 'نوع التقرير:' : 'Report Type:';
  
  return [
    // Title
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 36, // 18pt
          color: COLORS.primary,
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: language === 'ar' ? AlignmentType.RIGHT : AlignmentType.CENTER,
      spacing: {
        after: 240, // 12pt
      },
    }),
    
    // Date and Type info
    new Paragraph({
      children: [
        new TextRun({
          text: `${dateLabel} ${currentDate}`,
          size: 22, // 11pt
          color: COLORS.subtext,
        }),
      ],
      alignment: language === 'ar' ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: {
        after: 120, // 6pt
      },
    }),
    
    new Paragraph({
      children: [
        new TextRun({
          text: `${typeLabel} ${noteType}`,
          size: 22, // 11pt
          color: COLORS.subtext,
        }),
      ],
      alignment: language === 'ar' ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: {
        after: 360, // 18pt
      },
    }),
  ];
};

// Main export function
export const exportToDocx = async (
  sections: MedicalSection[],
  noteType: string,
  language: Language = 'en'
): Promise<Blob> => {
  const children: (Paragraph)[] = [];
  
  // Add document header
  children.push(...createDocumentHeader(noteType, language));
  
  // Add sections
  for (const section of sections) {
    if (section.title && section.content) {
      // Add section header
      children.push(createSectionHeader(section));
      
      // Add section content
      children.push(...createSectionContent(section));
      
      // Add spacing between sections
      children.push(
        new Paragraph({
          children: [],
          spacing: {
            after: 240, // 12pt
          },
        })
      );
    }
  }
  
  // Create document
  const doc = new Document({
    creator: 'Lexxi Medical Notes',
    title: `Medical Report - ${noteType}`,
    description: 'Generated medical report',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              right: 1440,  // 1 inch
              bottom: 1440, // 1 inch
              left: 1440,   // 1 inch
            },
          },
        },
        children,
      },
    ],
  });
  
  // Generate and return blob
  const buffer = await Packer.toBuffer(doc);
  return new Blob([new Uint8Array(buffer)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
};// Utility function to download the DOCX file
export const downloadDocx = async (
  sections: MedicalSection[],
  noteType: string,
  language: Language = 'en'
): Promise<boolean> => {
  try {
    const blob = await exportToDocx(sections, noteType, language);
    
    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `medical-note-${noteType}-${timestamp}.docx`;
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return false;
  }
};
