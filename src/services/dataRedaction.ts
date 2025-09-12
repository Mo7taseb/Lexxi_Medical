// Privacy-First Data Redaction Service
// Removes PHI before storing any medical data

import { RedactionPattern } from '@/types/changeTracking';

export class DataRedactionService {
  private static instance: DataRedactionService;
  
  // Arabic and English patterns for PHI redaction
  private readonly redactionPatterns: RedactionPattern[] = [
    // Names (Arabic and English)
    {
      pattern: /\b(?:د\.?|دكتور|دكتورة|Dr\.?|Doctor|Mr\.?|Mrs\.?|Ms\.?|Miss)\s+[أ-ي\u0600-\u06FF\s]{2,}|[A-Z][a-z]+\s+[A-Z][a-z]+/g,
      replacement: '[PATIENT_NAME]',
      language: 'both',
      category: 'name'
    },
    
    // Phone numbers (international formats)
    {
      pattern: /(\+?\d{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
      replacement: '[PHONE]',
      language: 'both',
      category: 'contact'
    },
    
    // Email addresses
    {
      pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      replacement: '[EMAIL]',
      language: 'both',
      category: 'contact'
    },
    
    // Medical Record Numbers (various formats)
    {
      pattern: /\b(?:MRN|رقم\s*المريض|Patient\s*ID|معرف\s*المريض)[\s:]*[\d\-\/]{4,}/gi,
      replacement: '[MRN]',
      language: 'both',
      category: 'id'
    },
    
    // National IDs / Civil IDs
    {
      pattern: /\b(?:ID|الهوية|Civil\s*ID|الرقم\s*المدني)[\s:]*[\d\-\/]{8,}/gi,
      replacement: '[NATIONAL_ID]',
      language: 'both',
      category: 'id'
    },
    
    // Hospital/Facility names (common patterns)
    {
      pattern: /\b(?:مستشفى|مركز|عيادة|Hospital|Medical\s+Center|Clinic|Healthcare)\s+[أ-ي\u0600-\u06FF\sA-Za-z]{3,}/g,
      replacement: '[FACILITY]',
      language: 'both',
      category: 'facility'
    },
    
    // Specific dates (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
    {
      pattern: /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/g,
      replacement: '[DATE]',
      language: 'both',
      category: 'date'
    },
    
    // Arabic-specific patterns
    {
      pattern: /\b(?:اسم|المريض)\s*[أ-ي\u0600-\u06FF\s]{2,}/g,
      replacement: '[PATIENT_NAME]',
      language: 'ar',
      category: 'name'
    },
    
    // Address patterns (Arabic)
    {
      pattern: /\b(?:عنوان|شارع|منطقة|مدينة|محافظة)\s*[أ-ي\u0600-\u06FF\s]{2,}/g,
      replacement: '[ADDRESS]',
      language: 'ar',
      category: 'contact'
    },
    
    // Address patterns (English)
    {
      pattern: /\b(?:Address|Street|Area|City|State|Province)\s*[A-Za-z\s]{2,}/gi,
      replacement: '[ADDRESS]',
      language: 'en',
      category: 'contact'
    }
  ];

  public static getInstance(): DataRedactionService {
    if (!DataRedactionService.instance) {
      DataRedactionService.instance = new DataRedactionService();
    }
    return DataRedactionService.instance;
  }

  /**
   * Redact PHI from transcript text
   */
  public redactTranscript(transcript: string, language: 'ar' | 'en' = 'ar'): string {
    let redacted = transcript;
    
    for (const pattern of this.redactionPatterns) {
      if (pattern.language === 'both' || pattern.language === language) {
        redacted = redacted.replace(pattern.pattern, pattern.replacement);
      }
    }
    
    // Remove Arabic diacritics for better matching
    if (language === 'ar') {
      redacted = this.removeArabicDiacritics(redacted);
    }
    
    // Additional cleanup
    redacted = this.cleanupRedactedText(redacted);
    
    return redacted;
  }

  /**
   * Redact PHI from medical note
   */
  public redactMedicalNote(note: string, language: 'ar' | 'en' = 'ar'): string {
    return this.redactTranscript(note, language);
  }

  /**
   * Redact PHI from medical sections
   */
  public redactMedicalSections(sections: any[], language: 'ar' | 'en' = 'ar'): any[] {
    return sections.map(section => ({
      ...section,
      content: section.content ? this.redactTranscript(section.content, language) : section.content,
      title: section.title ? this.redactTranscript(section.title, language) : section.title
    }));
  }

  /**
   * Check if text contains potential PHI
   */
  public containsPHI(text: string, language: 'ar' | 'en' = 'ar'): boolean {
    for (const pattern of this.redactionPatterns) {
      if (pattern.language === 'both' || pattern.language === language) {
        if (pattern.pattern.test(text)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get redaction statistics
   */
  public getRedactionStats(originalText: string, redactedText: string): {
    totalRedactions: number;
    redactionsByCategory: Record<string, number>;
    redactionPercentage: number;
  } {
    const redactionsByCategory: Record<string, number> = {};
    let totalRedactions = 0;

    for (const pattern of this.redactionPatterns) {
      const matches = originalText.match(pattern.pattern);
      if (matches) {
        const count = matches.length;
        redactionsByCategory[pattern.category] = (redactionsByCategory[pattern.category] || 0) + count;
        totalRedactions += count;
      }
    }

    const redactionPercentage = originalText.length > 0 
      ? ((originalText.length - redactedText.length) / originalText.length) * 100 
      : 0;

    return {
      totalRedactions,
      redactionsByCategory,
      redactionPercentage: Math.round(redactionPercentage * 100) / 100
    };
  }

  /**
   * Remove Arabic diacritics for better pattern matching
   */
  private removeArabicDiacritics(text: string): string {
    return text.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
  }

  /**
   * Clean up redacted text (remove double spaces, etc.)
   */
  private cleanupRedactedText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/([^\w\s])\s+([^\w\s])/g, '$1$2') // Remove spaces between punctuation
      .trim();
  }

  /**
   * Validate redaction - ensure no obvious PHI remains
   */
  public validateRedaction(redactedText: string, language: 'ar' | 'en' = 'ar'): {
    isValid: boolean;
    potentialLeaks: string[];
  } {
    const potentialLeaks: string[] = [];
    
    // Check for common PHI patterns that might have been missed
    const validationPatterns = [
      /\b\d{10,}\b/, // Long number sequences
      /[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}/, // Potential names
      /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/, // Dates
    ];

    for (const pattern of validationPatterns) {
      const matches = redactedText.match(pattern);
      if (matches) {
        potentialLeaks.push(...matches);
      }
    }

    return {
      isValid: potentialLeaks.length === 0,
      potentialLeaks: [...new Set(potentialLeaks)] // Remove duplicates
    };
  }

  /**
   * Test redaction patterns (for development/testing)
   */
  public testRedactionPatterns(): {
    pattern: string;
    category: string;
    testCases: Array<{ input: string; output: string; passed: boolean }>;
  }[] {
    const testData = [
      // Arabic test cases
      { input: 'المريض احمد علي محمد', expected: 'المريض [PATIENT_NAME]', category: 'name' },
      { input: 'رقم الهاتف: 966501234567', expected: 'رقم الهاتف: [PHONE]', category: 'contact' },
      { input: 'البريد الإلكتروني: patient@email.com', expected: 'البريد الإلكتروني: [EMAIL]', category: 'contact' },
      
      // English test cases
      { input: 'Patient: John Smith', expected: 'Patient: [PATIENT_NAME]', category: 'name' },
      { input: 'Dr. Ahmed Hassan', expected: '[PATIENT_NAME]', category: 'name' },
      { input: 'Phone: +1-555-123-4567', expected: 'Phone: [PHONE]', category: 'contact' },
      { input: 'MRN: 12345678', expected: '[MRN]', category: 'id' },
      { input: 'Date: 15/09/2025', expected: 'Date: [DATE]', category: 'date' },
    ];

    return this.redactionPatterns.map(pattern => ({
      pattern: pattern.pattern.source,
      category: pattern.category,
      testCases: testData
        .filter(test => test.category === pattern.category)
        .map(test => {
          const output = test.input.replace(pattern.pattern, pattern.replacement);
          return {
            input: test.input,
            output,
            passed: output === test.expected
          };
        })
    }));
  }
}
