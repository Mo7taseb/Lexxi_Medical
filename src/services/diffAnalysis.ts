// Medical Note Diff Analysis Service
// Analyzes changes between original and edited medical notes

import { DiffResult, DiffChange, MedicalSection } from '@/types/changeTracking';

export class DiffAnalysisService {
  private static instance: DiffAnalysisService;

  public static getInstance(): DiffAnalysisService {
    if (!DiffAnalysisService.instance) {
      DiffAnalysisService.instance = new DiffAnalysisService();
    }
    return DiffAnalysisService.instance;
  }

  /**
   * Compare two medical notes and generate detailed diff
   */
  public analyzeMedicalNoteDiff(
    originalNote: string,
    finalNote: string,
    language: 'ar' | 'en' = 'ar'
  ): DiffResult {
    // Normalize both texts
    const normalizedOriginal = this.normalizeText(originalNote, language);
    const normalizedFinal = this.normalizeText(finalNote, language);

    // Generate word-level diff
    const wordDiff = this.generateWordDiff(normalizedOriginal, normalizedFinal);
    
    // Analyze changes
    const additions = this.extractAdditions(wordDiff);
    const deletions = this.extractDeletions(wordDiff);
    const modifications = this.extractModifications(wordDiff);

    // Calculate similarity score
    const similarity = this.calculateSimilarity(normalizedOriginal, normalizedFinal);

    return {
      additions: additions.map(change => ({
        ...change,
        medicalRelevance: this.assessMedicalRelevance(change.content, language)
      })),
      deletions: deletions.map(change => ({
        ...change,
        medicalRelevance: this.assessMedicalRelevance(change.content, language)
      })),
      modifications: modifications.map(change => ({
        ...change,
        medicalRelevance: this.assessMedicalRelevance(change.content, language)
      })),
      similarity
    };
  }

  /**
   * Compare medical sections and identify changes
   */
  public analyzeSectionDiffs(
    originalSections: MedicalSection[],
    finalSections: MedicalSection[],
    language: 'ar' | 'en' = 'ar'
  ): Record<string, DiffResult> {
    const sectionDiffs: Record<string, DiffResult> = {};

    // Create maps for easier lookup
    const originalMap = new Map(originalSections.map(s => [s.id, s]));
    const finalMap = new Map(finalSections.map(s => [s.id, s]));

    // 🔧 CRITICAL FIX: Only analyze sections that actually exist in both sets
    // First, identify sections that were added or removed
    const allSectionIds = new Set([
      ...originalSections.map(s => s.id),
      ...finalSections.map(s => s.id)
    ]);

    console.log('🔍 Section diff analysis:', {
      originalSectionIds: originalSections.map(s => s.id),
      finalSectionIds: finalSections.map(s => s.id),
      allSectionIds: Array.from(allSectionIds)
    });

    for (const sectionId of allSectionIds) {
      const original = originalMap.get(sectionId);
      const final = finalMap.get(sectionId);

      if (!original && final) {
        // New section added
        console.log(`📝 New section detected: ${sectionId}`);
        sectionDiffs[sectionId] = {
          additions: [{
            position: 0,
            content: final.content,
            context: `New section: ${final.title || 'Untitled'}`,
            medicalRelevance: this.assessMedicalRelevance(final.content, language)
          }],
          deletions: [],
          modifications: [],
          similarity: 0
        };
      } else if (original && !final) {
        // Section removed
        console.log(`🗑️ Section removed: ${sectionId}`);
        sectionDiffs[sectionId] = {
          additions: [],
          deletions: [{
            position: 0,
            content: original.content,
            context: `Removed section: ${original.title || 'Untitled'}`,
            medicalRelevance: this.assessMedicalRelevance(original.content, language)
          }],
          modifications: [],
          similarity: 0
        };
      } else if (original && final) {
        // 🔧 CRITICAL: First check if content is actually different
        const originalContent = this.normalizeText(original.content, language);
        const finalContent = this.normalizeText(final.content, language);
        
        if (originalContent === finalContent) {
          // Content is identical, assign perfect similarity
          console.log(`✅ Section unchanged: ${sectionId}`);
          sectionDiffs[sectionId] = {
            additions: [],
            deletions: [],
            modifications: [],
            similarity: 1.0 // Perfect similarity for unchanged content
          };
        } else {
          // Content actually changed, perform full diff analysis
          console.log(`📝 Section modified: ${sectionId}`, {
            originalLength: original.content.length,
            finalLength: final.content.length,
            originalPreview: original.content.substring(0, 100) + '...',
            finalPreview: final.content.substring(0, 100) + '...'
          });
          
          sectionDiffs[sectionId] = this.analyzeMedicalNoteDiff(
            original.content,
            final.content,
            language
          );
        }
      }
    }

    // 🔧 Log final section diff results
    const changedSections = Object.keys(sectionDiffs).filter(
      id => sectionDiffs[id].similarity < 0.95
    );
    
    console.log('📊 Section diff results:', {
      totalSections: Object.keys(sectionDiffs).length,
      sectionsChanged: changedSections.length,
      changedSectionIds: changedSections,
      similarityScores: Object.fromEntries(
        Object.entries(sectionDiffs).map(([id, diff]) => [id, diff.similarity])
      )
    });

    return sectionDiffs;
  }

  /**
   * Extract medical terms that changed
   */
  public extractChangedMedicalTerms(
    originalText: string,
    finalText: string,
    language: 'ar' | 'en' = 'ar'
  ): { added: string[]; removed: string[]; modified: Array<{ from: string; to: string }> } {
    const originalTerms = this.extractMedicalTerms(originalText, language);
    const finalTerms = this.extractMedicalTerms(finalText, language);

    const added = finalTerms.filter(term => !originalTerms.includes(term));
    const removed = originalTerms.filter(term => !finalTerms.includes(term));
    
    // Find potential modifications (terms that are similar but not identical)
    const modified: Array<{ from: string; to: string }> = [];
    for (const removedTerm of removed) {
      for (const addedTerm of added) {
        if (this.areTermsSimilar(removedTerm, addedTerm)) {
          modified.push({ from: removedTerm, to: addedTerm });
        }
      }
    }

    // Remove modified terms from added/removed lists
    const modifiedFrom = modified.map(m => m.from);
    const modifiedTo = modified.map(m => m.to);

    return {
      added: added.filter(term => !modifiedTo.includes(term)),
      removed: removed.filter(term => !modifiedFrom.includes(term)),
      modified
    };
  }

  /**
   * Normalize text for comparison (ignore whitespace, punctuation)
   */
  private normalizeText(text: string, language: 'ar' | 'en'): string {
    let normalized = text.toLowerCase().trim();
    
    // Remove extra whitespace
    normalized = normalized.replace(/\s+/g, ' ');
    
    // Remove common punctuation (but keep medical-relevant ones)
    normalized = normalized.replace(/[.,;!?()[\]{}""'']/g, '');
    
    // Arabic-specific normalization
    if (language === 'ar') {
      // Remove diacritics
      normalized = normalized.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
      // Normalize Arabic letters
      normalized = normalized.replace(/[أإآ]/g, 'ا');
      normalized = normalized.replace(/[ة]/g, 'ه');
    }
    
    return normalized;
  }

  /**
   * Generate word-level diff using improved algorithm
   */
  private generateWordDiff(original: string, final: string): Array<{
    type: 'equal' | 'insert' | 'delete';
    content: string;
    position: number;
  }> {
    // 🔧 IMPROVED: Filter out empty strings and normalize
    const originalWords = original.split(/\s+/).filter(word => word.length > 0);
    const finalWords = final.split(/\s+/).filter(word => word.length > 0);
    
    // 🔧 IMPROVED: Use phrase-based comparison for better accuracy
    const diff: Array<{ type: 'equal' | 'insert' | 'delete'; content: string; position: number }> = [];
    
    // Quick return for identical content
    if (originalWords.join(' ') === finalWords.join(' ')) {
      originalWords.forEach((word, index) => {
        diff.push({ type: 'equal', content: word, position: index });
      });
      return diff;
    }
    
    let i = 0, j = 0, position = 0;
    
    while (i < originalWords.length || j < finalWords.length) {
      if (i >= originalWords.length) {
        // Remaining words are insertions - group consecutive insertions
        const insertions = [];
        while (j < finalWords.length) {
          insertions.push(finalWords[j]);
          j++;
        }
        if (insertions.length > 0) {
          diff.push({ type: 'insert', content: insertions.join(' '), position });
        }
      } else if (j >= finalWords.length) {
        // Remaining words are deletions - group consecutive deletions
        const deletions = [];
        while (i < originalWords.length) {
          deletions.push(originalWords[i]);
          i++;
        }
        if (deletions.length > 0) {
          diff.push({ type: 'delete', content: deletions.join(' '), position });
        }
      } else if (originalWords[i] === finalWords[j]) {
        // Words match exactly
        diff.push({ type: 'equal', content: originalWords[i], position });
        i++;
        j++;
      } else {
        // 🔧 IMPROVED: Look for longer matches first (phrases)
        let foundMatch = false;
        const maxLookAhead = Math.min(5, Math.min(originalWords.length - i, finalWords.length - j));
        
        for (let phraseLen = maxLookAhead; phraseLen >= 1 && !foundMatch; phraseLen--) {
          const originalPhrase = originalWords.slice(i, i + phraseLen).join(' ');
          
          for (let k = 0; k <= 3 && j + k + phraseLen <= finalWords.length; k++) {
            const finalPhrase = finalWords.slice(j + k, j + k + phraseLen).join(' ');
            
            if (originalPhrase === finalPhrase) {
              // Found matching phrase, insert skipped words before it
              if (k > 0) {
                const skipped = finalWords.slice(j, j + k).join(' ');
                diff.push({ type: 'insert', content: skipped, position });
              }
              
              // Add the matching phrase
              diff.push({ type: 'equal', content: originalPhrase, position });
              
              i += phraseLen;
              j += k + phraseLen;
              foundMatch = true;
              break;
            }
          }
        }
        
        if (!foundMatch) {
          // No match found - look for simple word substitution vs insertion/deletion
          const nextOriginalMatch = finalWords.slice(j).findIndex(word => word === originalWords[i]);
          const nextFinalMatch = originalWords.slice(i).findIndex(word => word === finalWords[j]);
          
          if (nextOriginalMatch !== -1 && nextOriginalMatch <= 2) {
            // Original word appears soon in final - treat as insertion
            const insertions = finalWords.slice(j, j + nextOriginalMatch).join(' ');
            diff.push({ type: 'insert', content: insertions, position });
            j += nextOriginalMatch;
          } else if (nextFinalMatch !== -1 && nextFinalMatch <= 2) {
            // Final word appears soon in original - treat as deletion
            const deletions = originalWords.slice(i, i + nextFinalMatch).join(' ');
            diff.push({ type: 'delete', content: deletions, position });
            i += nextFinalMatch;
          } else {
            // Treat as simple substitution (one delete, one insert)
            diff.push({ type: 'delete', content: originalWords[i], position });
            diff.push({ type: 'insert', content: finalWords[j], position });
            i++;
            j++;
          }
        }
      }
      position++;
    }
    
    console.log('🔍 Word diff generated:', {
      originalWordCount: originalWords.length,
      finalWordCount: finalWords.length,
      diffOperations: diff.length,
      insertions: diff.filter(d => d.type === 'insert').length,
      deletions: diff.filter(d => d.type === 'delete').length,
      equal: diff.filter(d => d.type === 'equal').length
    });
    
    return diff;
  }

  /**
   * Extract additions from diff
   */
  private extractAdditions(diff: Array<{ type: string; content: string; position: number }>): DiffChange[] {
    return diff
      .filter(item => item.type === 'insert')
      .map(item => ({
        position: item.position,
        content: item.content,
        context: this.getContext(diff, item.position)
      }));
  }

  /**
   * Extract deletions from diff
   */
  private extractDeletions(diff: Array<{ type: string; content: string; position: number }>): DiffChange[] {
    return diff
      .filter(item => item.type === 'delete')
      .map(item => ({
        position: item.position,
        content: item.content,
        context: this.getContext(diff, item.position)
      }));
  }

  /**
   * Extract modifications from diff
   */
  private extractModifications(diff: Array<{ type: string; content: string; position: number }>): DiffChange[] {
    const modifications: DiffChange[] = [];
    
    for (let i = 0; i < diff.length - 1; i++) {
      if (diff[i].type === 'delete' && diff[i + 1].type === 'insert') {
        modifications.push({
          position: diff[i].position,
          content: `${diff[i].content} → ${diff[i + 1].content}`,
          context: this.getContext(diff, diff[i].position)
        });
      }
    }
    
    return modifications;
  }

  /**
   * Get context around a change
   */
  private getContext(diff: Array<{ type: string; content: string; position: number }>, position: number): string {
    const contextRange = 2;
    const start = Math.max(0, position - contextRange);
    const end = Math.min(diff.length, position + contextRange + 1);
    
    return diff
      .slice(start, end)
      .filter(item => item.type === 'equal')
      .map(item => item.content)
      .join(' ');
  }

  /**
   * Calculate similarity between two texts (0-1 score)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    if (text1 === text2) return 1;
    if (!text1 || !text2) return 0;
    
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }

  /**
   * Assess medical relevance of a change
   */
  private assessMedicalRelevance(content: string, language: 'ar' | 'en'): 'high' | 'medium' | 'low' {
    const medicalKeywords = language === 'ar' ? [
      // Arabic medical terms
      'تشخيص', 'علاج', 'دواء', 'جرعة', 'أعراض', 'فحص', 'تحليل', 'مرض',
      'طبي', 'سريري', 'صحي', 'دم', 'قلب', 'رئة', 'كبد', 'كلى'
    ] : [
      // English medical terms
      'diagnosis', 'treatment', 'medication', 'dosage', 'symptoms', 'examination',
      'test', 'disease', 'medical', 'clinical', 'health', 'blood', 'heart',
      'lung', 'liver', 'kidney', 'mg', 'ml', 'twice', 'daily', 'patient'
    ];

    const lowerContent = content.toLowerCase();
    const matchCount = medicalKeywords.filter(keyword => lowerContent.includes(keyword)).length;
    
    if (matchCount >= 2) return 'high';
    if (matchCount >= 1) return 'medium';
    return 'low';
  }

  /**
   * Extract medical terms from text
   */
  private extractMedicalTerms(text: string, language: 'ar' | 'en'): string[] {
    const medicalPatterns = language === 'ar' ? [
      /\b(?:مرض|داء|متلازمة|التهاب|ورم|سرطان|عدوى|فيروس|بكتيريا)\s+[\u0600-\u06FF\s]+/g,
      /\b(?:دواء|علاج|جرعة)\s+[\u0600-\u06FF\s]+/g,
    ] : [
      /\b(?:disease|syndrome|infection|inflammation|tumor|cancer|virus|bacteria)\s+[A-Za-z\s]+/gi,
      /\b(?:medication|drug|treatment|therapy)\s+[A-Za-z\s]+/gi,
      /\b[A-Z][a-z]+(?:ine|ol|um|ate|ide)\b/g, // Common drug suffixes
    ];

    const terms: string[] = [];
    
    for (const pattern of medicalPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        terms.push(...matches.map(match => match.trim()));
      }
    }

    return [...new Set(terms)]; // Remove duplicates
  }

  /**
   * Check if two terms are similar (for detecting modifications)
   */
  private areTermsSimilar(term1: string, term2: string): boolean {
    if (term1 === term2) return false; // Identical terms, not similar
    
    // Simple similarity check using Levenshtein-like approach
    const maxLength = Math.max(term1.length, term2.length);
    const minLength = Math.min(term1.length, term2.length);
    
    // If length difference is too large, likely not similar
    if ((maxLength - minLength) / maxLength > 0.5) return false;
    
    // Count common characters
    const commonChars = term1.split('').filter(char => term2.includes(char)).length;
    const similarity = commonChars / maxLength;
    
    return similarity > 0.6; // 60% similarity threshold
  }

  /**
   * Generate summary statistics for changes
   */
  public generateChangeSummary(diffResult: DiffResult): {
    totalChanges: number;
    additionsCount: number;
    deletionsCount: number;
    modificationsCount: number;
    highRelevanceChanges: number;
    characterDifference: number;
  } {
    const additionsCount = diffResult.additions.length;
    const deletionsCount = diffResult.deletions.length;
    const modificationsCount = diffResult.modifications.length;
    
    const highRelevanceChanges = [
      ...diffResult.additions,
      ...diffResult.deletions,
      ...diffResult.modifications
    ].filter(change => change.medicalRelevance === 'high').length;

    // 🔧 IMPROVED: Calculate more realistic character differences
    // Count unique words rather than raw word-level changes to avoid inflation
    const addedWords = new Set(
      diffResult.additions.flatMap(change => change.content.split(/\s+/))
    );
    const removedWords = new Set(
      diffResult.deletions.flatMap(change => change.content.split(/\s+/))
    );
    
    const addedChars = Array.from(addedWords).join(' ').length;
    const removedChars = Array.from(removedWords).join(' ').length;
    
    // 🔧 IMPROVED: More realistic total change count
    // Count meaningful changes rather than word-level micro-changes
    const meaningfulChanges = Math.max(
      1, // Minimum 1 if any changes exist
      Math.min(
        additionsCount + deletionsCount + modificationsCount,
        additionsCount + deletionsCount + (modificationsCount * 2) // Modifications count as both add/remove
      )
    );
    
    console.log('📊 Change summary calculation:', {
      rawAdditions: additionsCount,
      rawDeletions: deletionsCount,
      rawModifications: modificationsCount,
      uniqueAddedWords: addedWords.size,
      uniqueRemovedWords: removedWords.size,
      meaningfulChanges,
      addedChars,
      removedChars
    });
    
    return {
      totalChanges: meaningfulChanges,
      additionsCount,
      deletionsCount,
      modificationsCount,
      highRelevanceChanges,
      characterDifference: addedChars - removedChars
    };
  }
}
