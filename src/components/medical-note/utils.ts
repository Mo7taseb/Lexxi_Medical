import { MedicalSection, FormattedNote, Language } from './types';

// Safe HTML sanitization - Basic implementation without external dependency
export const sanitizeHTML = (html: string): string => {
  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
  
  // Only allow safe tags
  const allowedTags = ['div', 'span', 'strong', 'em', 'br', 'p', 'ul', 'li', 'h1', 'h2', 'h3'];
  const tagRegex = /<(\/?)([\w]+)([^>]*)>/gi;
  
  sanitized = sanitized.replace(tagRegex, (match, closing, tagName, attributes) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // Clean attributes - only allow class, style, dir
      const cleanAttributes = attributes.replace(/\s*(class|style|dir)="[^"]*"/gi, '$&');
      return `<${closing}${tagName}${cleanAttributes}>`;
    }
    return '';
  });
  
  return sanitized;
};

// Clean and consistent text processing
export const normalizeText = (text: string): string => {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
};

// Language detection utility
export const detectLanguage = (text: string): Language => {
  const arabicPattern = /[\u0600-\u06FF]/;
  const arabicMatches = text.match(/[\u0600-\u06FF]/g);
  const totalChars = text.length;
  const arabicRatio = arabicMatches ? arabicMatches.length / totalChars : 0;
  return arabicRatio > 0.3 ? 'ar' : 'en';
};

// Text statistics
export const getTextStats = (text: string) => {
  const wordCount = text.split(/\s+/).filter(word => word.trim()).length;
  const charCount = text.length;
  return { wordCount, charCount };
};

// Copy to clipboard utility
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
};

// Download file utility
export const downloadFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
