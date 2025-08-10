// Sharing utilities for medical notes
import { Language } from './types';
import { languageTexts } from './constants';

export interface PatientInfo {
  name?: string;
  id?: string;
  age?: number;
  gender?: string;
}

export interface ShareContent {
  subject: string;
  body: string;
  shortBody: string;
}

export const generateEmailSubject = (
  noteType: string, 
  patientInfo: PatientInfo, 
  language: Language
): string => {
  const t = languageTexts[language];
  const noteTypeName = t.noteTypeNames[noteType] || noteType;
  const patientName = patientInfo.name || (language === 'en' ? 'Patient' : 'المريض');
  
  return language === 'en'
    ? `Medical Report - ${noteTypeName} - ${patientName}`
    : `التقرير الطبي - ${noteTypeName} - ${patientName}`;
};

// Extract key medical information for short sharing formats
const extractKeyMedicalInfo = (medicalNote: string, language: Language): string => {
  const isEnglish = language === 'en';
  const lines = medicalNote.split('\n').filter(line => line.trim());
  
  // Key sections to prioritize for WhatsApp summary
  const keyPatterns = isEnglish ? [
    /chief complaint|presenting complaint|cc:/i,
    /assessment|impression|diagnosis/i,
    /plan|treatment|recommendations/i,
    /consultation details|consult/i
  ] : [
    /الشكوى الرئيسية|الشكوى الحالية/i,
    /التقييم|التشخيص|الانطباع/i,
    /الخطة|العلاج|التوصيات/i
  ];
  
  let extractedContent = '';
  let remainingLength = 500; // Conservative limit for WhatsApp summary
  
  // Extract key sections only
  for (let i = 0; i < lines.length && remainingLength > 50; i++) {
    const line = lines[i];
    const isKeySection = keyPatterns.some(pattern => pattern.test(line));
    
    if (isKeySection || line.startsWith('**') || line.startsWith('*') || line.includes(':')) {
      // Include this line and a few following lines
      let sectionText = line.replace(/\*\*(.*?)\*\*/g, '$1:').replace(/\*/g, '');
      let j = i + 1;
      
      // Add 2-3 following lines for context
      let linesAdded = 0;
      while (j < lines.length && remainingLength > 20 && linesAdded < 3) {
        const nextLine = lines[j];
        if (nextLine.startsWith('**') && nextLine !== line) break;
        if (sectionText.length + nextLine.length > remainingLength) break;
        
        sectionText += '\n' + nextLine;
        j++;
        linesAdded++;
      }
      
      extractedContent += (extractedContent ? '\n\n' : '') + sectionText;
      remainingLength -= sectionText.length;
      i = j - 1;
    }
  }
  
  // If no key sections found, use first part of note
  if (!extractedContent.trim()) {
    extractedContent = medicalNote.substring(0, remainingLength);
  }
  
  return extractedContent.replace(/::+/g, ':').replace(/:\s*:/g, ':').trim();
};

// Helper function to format text based on output type
const formatText = (text: string, type: 'header' | 'subheader' | 'bold' | 'italic', outputFormat: string): string => {
  switch (outputFormat) {
    case 'html':
      switch (type) {
        case 'header': return `<h2><strong>${text.toUpperCase()}</strong></h2>`;
        case 'subheader': return `<h3><strong>${text}</strong></h3>`;
        case 'bold': return `<strong>${text}</strong>`;
        case 'italic': return `<em>${text}</em>`;
      }
      break;
    case 'markdown':
      switch (type) {
        case 'header': return `## **${text}**`;
        case 'subheader': return `### **${text}**`;
        case 'bold': return `**${text}**`;
        case 'italic': return `*${text}*`;
      }
      break;
    case 'whatsapp':
    case 'text':
    default:
      switch (type) {
        case 'header': return `${text.toUpperCase()}`;
        case 'subheader': return `${text}:`;
        case 'bold': return `${text}:`;
        case 'italic': return `${text}`;
      }
  }
  return text;
};

// Helper function to format medical content while preserving structure
const formatMedicalContent = (content: string, outputFormat: string, language: Language): string => {
  const isEnglish = language === 'en';
  
  let formattedContent = content;
  
  // Apply LTR direction for medical content (even in Arabic UI, medical terms should be LTR)
  const ltrDirective = outputFormat === 'html' ? ' dir="ltr"' : '';
  
  switch (outputFormat) {
    case 'html':
      // Convert markdown-style formatting to HTML with LTR direction
      formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, `<strong>$1:</strong>`) // Bold headers
        .replace(/\*([^*]+)\*/g, `• $1`) // Keep bullet points as text, not italic
        .replace(/\n\n/g, '<br><br>') // Double line breaks
        .replace(/\n/g, '<br>'); // Single line breaks
        
      // Wrap the entire content in a div with LTR direction for email
      formattedContent = `<div dir="ltr" style="font-family: Arial, sans-serif; line-height: 1.6;">${formattedContent}</div>`;
      break;
      
    case 'markdown':
      // Keep markdown formatting
      formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, '**$1:**') // Bold headers with colon
        .replace(/\n(\*\*[^*]+\*\*:)/g, '\n\n$1'); // Add spacing before headers
      break;
      
    case 'whatsapp':
    case 'text':
    default:
      // WhatsApp/Text formatting - use clean structure with NO symbols
      formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, '$1:') // Convert **text** to clean text:
        .replace(/\*([^*]+)\*/g, '$1') // Convert single * to clean text (remove bullet conversion for headers)
        .replace(/::+/g, ':') // Fix double colons
        .replace(/:\s*:/g, ':') // Fix spaced colons
        .replace(/\n{3,}/g, '\n\n'); // Limit multiple newlines to double
  }
  
  return formattedContent.trim();
};

export const generateShareContent = (
  medicalNote: string,
  noteType: string,
  patientInfo: PatientInfo,
  language: Language,
  format: 'short' | 'full' = 'full',
  outputFormat: 'text' | 'html' | 'markdown' | 'whatsapp' = 'text'
): ShareContent => {
  const t = languageTexts[language];
  const isEnglish = language === 'en';
  const noteTypeName = t.noteTypeNames[noteType] || noteType;
  const patientName = patientInfo.name || (isEnglish ? 'Patient' : 'المريض');
  const timestamp = new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ar-EG');
  
  // Always use text format for both email and WhatsApp
  const cleanOutputFormat = 'text';
  
  // Generate patient info section
  const patientInfoSection = generatePatientInfoSection(patientInfo, language, cleanOutputFormat);
  
  if (format === 'short') {
    // For WhatsApp: Create a professional summary with key medical information
    // This ensures it fits within WhatsApp limits while providing essential medical context
    
    const extractedContent = extractKeyMedicalInfo(medicalNote, language);
    
    // Create a concise but comprehensive medical summary
    const shortBody = isEnglish 
      ? `MEDICAL REPORT - ${noteTypeName.toUpperCase()}
Patient: ${patientName}
Date: ${timestamp}

KEY FINDINGS:
${extractedContent}

NOTE: This is a summary for quick reference.
Full detailed report available via other sharing methods.

Generated by Lexxi Medical AI
Professional medical transcription`
      : `التقرير الطبي - ${noteTypeName}
المريض: ${patientName}  
التاريخ: ${timestamp}

النتائج الرئيسية:
${extractedContent}

ملاحظة: هذا ملخص للمرجع السريع.
التقرير المفصل الكامل متاح عبر طرق المشاركة الأخرى.

تم الإنشاء بواسطة Lexxi Medical AI
نسخ طبي احترافي`;

    return {
      subject: generateEmailSubject(noteType, patientInfo, language),
      body: shortBody,
      shortBody
    };
  }
  
  // Full format - ALWAYS use clean text formatting for both email and WhatsApp
  const title = isEnglish ? `MEDICAL REPORT - ${noteTypeName.toUpperCase()}` : `التقرير الطبي - ${noteTypeName}`;
  
  // Clean and format the medical note content as plain text only
  const cleanedMedicalNote = formatMedicalContent(medicalNote, cleanOutputFormat, language);
  
  const footer = isEnglish
    ? `\nThis report was generated using Lexxi Medical AI\nAI-powered medical transcription technology\nGenerated on: ${timestamp}\n\nCONFIDENTIAL MEDICAL INFORMATION\nFor medical professionals only`
    : `\nتم إنشاء هذا التقرير باستخدام Lexxi Medical AI\nتقنية النسخ الطبي المدعومة بالذكاء الاصطناعي\nتم الإنشاء في: ${timestamp}\n\nمعلومات طبية سرية\nللمختصين الطبيين فقط`;
  
  // Always generate clean text format for both email and WhatsApp
  const fullBody = isEnglish
    ? `${title}\n\n${patientInfoSection}${cleanedMedicalNote}${footer}`
    : `${title}\n\n${patientInfoSection}${cleanedMedicalNote}${footer}`;

  const shortBody = generateShareContent(medicalNote, noteType, patientInfo, language, 'short').shortBody;

  return {
    subject: generateEmailSubject(noteType, patientInfo, language),
    body: fullBody,
    shortBody
  };
};

const generatePatientInfoSection = (patientInfo: PatientInfo, language: Language, outputFormat: string = 'text'): string => {
  const isEnglish = language === 'en';
  const patientName = patientInfo.name || (isEnglish ? 'Patient' : 'المريض');
  
  // Don't generate the template consultation details section here
  // This will be handled by the medical content itself
  let section = '';
  
  // Only add patient-specific information if available
  if (patientInfo.name && patientInfo.name !== 'Patient') {
    section += `Patient Name: ${patientName}\n`;
  }
  
  if (patientInfo.id) {
    section += `Patient ID: ${patientInfo.id}\n`;
  }
  
  if (patientInfo.age) {
    const ageText = isEnglish ? 'years' : 'سنة';
    section += `Age: ${patientInfo.age} ${ageText}\n`;
  }
  
  if (patientInfo.gender) {
    section += `Gender: ${patientInfo.gender}\n`;
  }
  
  return section ? section + '\n' : '';
};

export const createWhatsAppUrl = (content: string): string => {
  // Clean the content for better WhatsApp compatibility
  const cleanContent = content
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')   // Handle old Mac line endings
    .replace(/::+/g, ':')   // Fix double colons
    .replace(/:\s*:/g, ':') // Fix "word: :" to "word:"
    .trim();
  
  // WhatsApp can handle up to 65,000 characters - send the full report!
  const encodedContent = encodeURIComponent(cleanContent);
  const baseUrl = 'https://wa.me/?text=';
  
  // WhatsApp URL length limit is very generous (around 65,000 characters)
  // Only truncate if we exceed this massive limit
  const maxWhatsAppLength = 60000; // Conservative limit to ensure compatibility
  
  if (cleanContent.length > maxWhatsAppLength) {
    // Only truncate in extremely rare cases of very long reports
    const truncatedContent = cleanContent.substring(0, maxWhatsAppLength - 100) + 
      '\n\n[Report truncated - Full report available via other sharing methods]';
    return `${baseUrl}${encodeURIComponent(truncatedContent)}`;
  }
  
  return `${baseUrl}${encodedContent}`;
};

export const createGmailUrl = (subject: string, body: string): string => {
  // Gmail compose URL format - opens directly in Gmail
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  
  // Gmail compose URL - opens in a new tab
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedSubject}&body=${encodedBody}`;
  
  return gmailUrl;
};

export const copyToClipboard = async (content: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
};

// Analytics and tracking (optional)
export const trackShareAction = (platform: 'email' | 'whatsapp' | 'copy' | 'qr' | 'sms', format?: 'text' | 'docx') => {
  // You can integrate with analytics services here
  console.log(`Share tracked: ${platform} ${format ? `(${format})` : ''}`);
};
