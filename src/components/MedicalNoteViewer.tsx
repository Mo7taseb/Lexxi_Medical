'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FileText, Loader2, CheckCircle, Copy, RotateCcw, Edit3 } from 'lucide-react';

// Import our new modular components
import { MedicalNoteViewerProps, Language, FormattedNote } from './medical-note/types';
import { detectLanguage, getTextStats, copyToClipboard, downloadFile, normalizeText } from './medical-note/utils';
import { parseNoteToSections } from './medical-note/templates';
import MedicalSectionRenderer from './medical-note/MedicalSectionRenderer';
import RichTextEditor from './medical-note/RichTextEditor';
import { downloadDocx } from './medical-note/docxExport';
import DownloadDropdown from './medical-note/DownloadDropdown';
import ShareDropdown from './medical-note/ShareDropdown';
import MissingInfoAssist from './medical-note/MissingInfoAssist';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/i18n';
import { useChangeTracking, useEditTimer } from '@/hooks/useChangeTracking';

const MedicalNoteViewer: React.FC<MedicalNoteViewerProps> = ({
  transcript,
  noteType,
  generatedNote,
  isProcessing,
  language = 'en',
  onGenerate,
  onReset
}) => {
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState('');
  const [originalGeneratedNote, setOriginalGeneratedNote] = useState(''); // 🔧 CRITICAL: Store original for comparison
  const [copySuccess, setCopySuccess] = useState(false);
  const [editedSections, setEditedSections] = useState<{ [key: string]: string }>({});
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [originalCaptured, setOriginalCaptured] = useState(false); // 🔧 PROTECTION: Track if original was captured
  const [cumulativeEditDuration, setCumulativeEditDuration] = useState(0); // 🔧 NEW: Track total edit time across sessions

  // Change tracking hooks
  const { trackGeneration, trackEdit } = useChangeTracking({ consentGiven: true });
  const { startTimer, stopTimer, resetTimer, duration, isRunning } = useEditTimer();

  const { t, direction, language: currentLanguage } = useLanguage();

  // Always use English for medical note content to maintain consistent structure
  const detectedLanguage: Language = 'en';

  const isEnglish = true;

  // Memoized note content
  const currentNote = useMemo(() => {
    return editedNote || generatedNote;
  }, [editedNote, generatedNote]);

  // Memoized formatted note sections
  const formattedNote: FormattedNote = useMemo(() => {
    if (!currentNote) {
      return {
        sections: [],
        metadata: {
          wordCount: 0,
          charCount: 0,
          language: 'en',
          noteType
        }
      };
    }

    const normalizedNote = normalizeText(currentNote);
    const sections = parseNoteToSections(normalizedNote, 'en');
    const stats = getTextStats(normalizedNote);

    return {
      sections,
      metadata: {
        ...stats,
        language: 'en',
        noteType
      }
    };
  }, [currentNote, noteType]);

  // Sync editedNote with generatedNote when it changes
  useEffect(() => {
    if (generatedNote && generatedNote !== editedNote) {
      setEditedNote(generatedNote);

      // 🔧 CRITICAL FIX: Capture original note ONLY ONCE per session
      if (!originalCaptured) {
        setOriginalGeneratedNote(generatedNote);
        setOriginalCaptured(true);
        console.log(`🎯 ORIGINAL NOTE CAPTURED:`, {
          length: generatedNote.length,
          preview: generatedNote.substring(0, 200) + '...',
          timestamp: new Date().toISOString()
        });
      } else {
        console.log(`🔒 ORIGINAL ALREADY CAPTURED:`, {
          currentLength: originalGeneratedNote?.length || 0,
          newLength: generatedNote.length,
          skipReason: 'Preventing corruption'
        });
      }

      // 🔧 BEST PRACTICE: Reset timer when new note is generated
      if (isRunning) {
        resetTimer();
        console.log('🔄 Timer reset for new note generation');
      }
    }
  }, [generatedNote, editedNote, originalCaptured, isRunning, resetTimer]);

  // Track note generation when a new note is generated - PRESERVE original
  useEffect(() => {
    if (generatedNote && transcript && noteType && !originalCaptured) {
      // 🔧 CRITICAL FIX: Only track generation once per session
      // Use the protected flag to prevent multiple calls
      setOriginalGeneratedNote(generatedNote);
      setOriginalCaptured(true);
      console.log('🆕 FIRST GENERATION - Setting original note:', generatedNote.length, 'characters');
      trackNoteGeneration();
    } else if (generatedNote && originalCaptured) {
      // 🔧 NEVER overwrite original note after it's set
      console.log('📝 PRESERVING ORIGINAL - Already captured, skipping:', {
        originalLength: originalGeneratedNote.length,
        newGeneratedLength: generatedNote.length,
        preservingOriginal: true
      });
    }
  }, [generatedNote, transcript, noteType, originalCaptured]);

  // 🔧 BEST PRACTICE: Reset protection flag when transcript changes (new session)
  useEffect(() => {
    if (transcript) {
      console.log('🔄 New transcript detected - Resetting original note protection');
      setOriginalCaptured(false);
      setOriginalGeneratedNote('');
      setGenerationId(null);
    }
  }, [transcript]);

  // 🔧 BEST PRACTICE: Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (isRunning) {
        console.log('🧹 Cleaning up running timer on unmount');
        resetTimer();
      }
    };
  }, [isRunning, resetTimer]);

  const trackNoteGeneration = useCallback(async () => {
    if (!generatedNote || !transcript || !noteType) return;

    try {
      const sections = parseNoteToSections(generatedNote, 'en');

      const newGenerationId = await trackGeneration({
        transcript,
        noteType,
        language: 'en', // Always use English for consistency
        generatedNote,
        generatedSections: sections,
        generationSource: 'groq', // Use the actual source
        generationConfidence: 0.9,
        processingTimeMs: 2500 // Reasonable processing time in milliseconds
      });

      if (newGenerationId) {
        setGenerationId(newGenerationId);
        console.log('✅ Note generation tracked:', newGenerationId);
      }
    } catch (error) {
      console.warn('Failed to track note generation:', error);
    }
  }, [generatedNote, transcript, noteType, trackGeneration]);

  // Event handlers
  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(currentNote);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [currentNote]);

  const handleDownload = useCallback(() => {
    const filename = `medical-note-${Date.now()}.txt`;
    downloadFile(currentNote, filename);
  }, [currentNote]);

  const handleDownloadDocx = useCallback(async () => {
    try {
      const sections = parseNoteToSections(currentNote, 'en');
      await downloadDocx(sections, noteType, 'en');
    } catch (error) {
      console.error('Failed to download DOCX:', error);
    }
  }, [currentNote, noteType]);

  // Share handlers
  const handleShareEmail = useCallback((format: 'text' | 'docx') => {
    if (format === 'docx') {
      // Only trigger DOCX download when specifically sharing via DOCX
      handleDownloadDocx();
    }
    // Don't interfere with email opening - that's handled in ShareDropdown
    console.log(`Sharing via email in ${format} format`);
  }, [handleDownloadDocx]);

  const handleShareWhatsApp = useCallback((format: 'text') => {
    console.log('Sharing via WhatsApp');
  }, []);

  const handleCopyLink = useCallback(() => {
    console.log('Medical report content copied to clipboard');
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditedNote(generatedNote);
    startTimer(); // Start tracking edit time
  }, [generatedNote, startTimer]);

  // Debouncing state to prevent duplicate tracking calls
  const [lastSaveHash, setLastSaveHash] = useState<string>('');

  const handleSave = useCallback(async () => {
    // Create a hash to prevent duplicate saves of identical content
    const currentHash = `${generationId}-${editedNote.length}-${editedNote.slice(0, 50)}`;

    if (currentHash === lastSaveHash) {
      console.log('🚫 Duplicate save prevented:', currentHash.slice(0, 30) + '...');
      return;
    }

    // 🔧 BEST PRACTICE: Ensure timer is stopped and get accurate duration
    const currentSessionDuration = isRunning ? stopTimer() : duration || 0;
    const totalEditDuration = cumulativeEditDuration + currentSessionDuration;
    setCumulativeEditDuration(totalEditDuration);
    setIsEditing(false);

    console.log('⏱️ Edit session completed:', {
      duration: totalEditDuration,
      wasTimerRunning: isRunning,
      finalDuration: totalEditDuration
    });

    // Debug logging
    console.log('🔍 Edit tracking debug:', {
      hasGenerationId: !!generationId,
      generationId,
      hasChanges: editedNote !== generatedNote,
      editedLength: editedNote?.length,
      originalLength: generatedNote?.length,
      currentSessionDuration
    });

    // 🔧 CRITICAL FIX: Use original generated note for accurate comparison
    const hasGenerationId = !!generationId;
    const contentLength = editedNote?.length || 0;
    const originalLength = originalGeneratedNote?.length || 0;
    const lengthDifference = Math.abs(contentLength - originalLength);
    const contentDifferent = editedNote !== originalGeneratedNote;
    const trimmedDifferent = editedNote?.trim() !== originalGeneratedNote?.trim();

    // 🔧 DEBUG: Log the actual content being compared
    console.log('🔍 COMPARISON DEBUG:', {
      editedPreview: editedNote?.substring(0, 100) + '...',
      originalPreview: originalGeneratedNote?.substring(0, 100) + '...',
      editedLength: editedNote?.length,
      originalLength: originalGeneratedNote?.length,
      areIdentical: editedNote === originalGeneratedNote
    });
    const hasAnyChange = contentDifferent || trimmedDifferent || lengthDifference > 0;
    const hasEditActivity = currentSessionDuration > 0; // If user spent time editing

    console.log('🔍 Enhanced change detection:', {
      hasGenerationId,
      contentLength,
      originalLength,
      lengthDifference,
      contentDifferent,
      trimmedDifferent,
      hasAnyChange,
      hasEditActivity,
      currentSessionDuration
    });

    // Track if we have generation ID AND (content changed OR user spent time editing)
    if (hasGenerationId && (hasAnyChange || hasEditActivity)) {
      try {
        // Mark this content as saved to prevent duplicates
        setLastSaveHash(currentHash);

        const finalSections = parseNoteToSections(editedNote, 'en');

        console.log('🎯 Tracking edit with generation ID:', generationId, {
          originalLength: originalGeneratedNote.length,
          finalLength: editedNote.length,
          lengthDiff: editedNote.length - originalGeneratedNote.length
        });
        const success = await trackEdit(generationId, {
          finalNote: editedNote,
          originalNote: originalGeneratedNote, // 🔧 CRITICAL: Pass original note
          finalSections,
          editDurationSeconds: currentSessionDuration
        } as any);

        if (success) {
          console.log('✅ Edit tracked successfully!');
        } else {
          console.warn('❌ Edit tracking failed silently');
          // Reset hash on failure so we can retry
          setLastSaveHash('');
        }
      } catch (error) {
        console.error('❌ Failed to track note edit:', error);
        // Reset hash on error so we can retry
        setLastSaveHash('');
      }
    } else {
      console.log('⚠️ Edit not tracked:', {
        reason: !hasGenerationId ? 'No generation ID' : 'No changes or activity detected',
        hasGenerationId,
        hasAnyChange,
        hasEditActivity,
        currentSessionDuration
      });
    }
  }, [generationId, editedNote, generatedNote, stopTimer, trackEdit, lastSaveHash, isRunning, duration]);

  const handleCancel = useCallback(() => {
    setEditedNote(generatedNote);
    setIsEditing(false);
  }, [generatedNote]);

  const handleEditorChange = useCallback((value: string) => {
    setEditedNote(value);
  }, []);

  // 🔧 NEW: Handle save with specific content (for inline edits)
  const handleSaveWithContent = useCallback(async (noteContent: string) => {
    console.log('🎯 handleSaveWithContent called with:', {
      contentLength: noteContent.length,
      hasGenerationId: !!generationId,
      hasOriginalNote: !!originalGeneratedNote
    });

    // Create a hash to prevent duplicate saves of identical content
    const currentHash = `${generationId}-${noteContent.length}-${noteContent.slice(0, 50)}`;

    if (currentHash === lastSaveHash) {
      console.log('🚫 Duplicate save prevented:', currentHash.slice(0, 30) + '...');
      return;
    }

    // 🔧 BEST PRACTICE: Ensure timer is stopped and get accurate duration
    const currentSessionDuration = isRunning ? stopTimer() : duration || 0;
    const totalEditDuration = cumulativeEditDuration + currentSessionDuration;
    setCumulativeEditDuration(totalEditDuration);

    console.log('⏱️ Edit session completed with specific content:', {
      duration: totalEditDuration,
      wasTimerRunning: isRunning,
      finalDuration: totalEditDuration,
      contentLength: noteContent.length
    });

    // 🔧 CRITICAL FIX: Use original generated note for accurate comparison
    const hasGenerationId = !!generationId;
    const contentLength = noteContent?.length || 0;
    const originalLength = originalGeneratedNote?.length || 0;
    const lengthDifference = Math.abs(contentLength - originalLength);
    const contentDifferent = noteContent !== originalGeneratedNote;
    const trimmedDifferent = noteContent?.trim() !== originalGeneratedNote?.trim();

    // 🔧 DEBUG: Log the actual content being compared
    console.log('🔍 SPECIFIC CONTENT COMPARISON DEBUG:', {
      noteContentPreview: noteContent?.substring(0, 100) + '...',
      originalPreview: originalGeneratedNote?.substring(0, 100) + '...',
      noteContentLength: noteContent?.length,
      originalLength: originalGeneratedNote?.length,
      areIdentical: noteContent === originalGeneratedNote
    });

    const hasAnyChange = contentDifferent || trimmedDifferent || lengthDifference > 0;
    const hasEditActivity = totalEditDuration > 0; // If user spent time editing

    console.log('🔍 Enhanced change detection with specific content:', {
      hasGenerationId,
      contentLength,
      originalLength,
      lengthDifference,
      contentDifferent,
      trimmedDifferent,
      hasAnyChange,
      hasEditActivity,
      editDuration: totalEditDuration
    });

    // Track if we have generation ID AND (content changed OR user spent time editing)
    if (hasGenerationId && (hasAnyChange || hasEditActivity)) {
      try {
        // Mark this content as saved to prevent duplicates
        setLastSaveHash(currentHash);

        console.log('🎯 Tracking edit with generation ID and specific content:', generationId, {
          originalLength: originalGeneratedNote?.length,
          finalLength: noteContent.length,
          lengthDiff: lengthDifference
        });

        const finalSections = parseNoteToSections(noteContent, 'en');

        const success = await trackEdit(generationId, {
          finalNote: noteContent, // 🔧 CRITICAL: Use the specific content passed to this function
          originalNote: originalGeneratedNote, // 🔧 CRITICAL: Pass original note for accurate comparison
          finalSections,
          editDurationSeconds: totalEditDuration
        });

        if (success) {
          console.log('✅ Edit tracked successfully with specific content!');
        } else {
          console.warn('❌ Edit tracking failed silently');
          // Reset hash on failure so we can retry
          setLastSaveHash('');
        }
      } catch (error) {
        console.error('❌ Failed to track note edit:', error);
        // Reset hash on error so we can retry
        setLastSaveHash('');
      }
    } else {
      console.log('⚠️ Edit not tracked (specific content):', {
        reason: !hasGenerationId ? 'No generation ID' : 'No changes or activity detected',
        hasGenerationId,
        hasAnyChange,
        hasEditActivity,
        totalEditDuration
      });
    }
  }, [generationId, originalGeneratedNote, stopTimer, trackEdit, lastSaveHash, isRunning, duration, parseNoteToSections]);

  // Inline editing handlers
  const handleSectionStartEdit = useCallback((sectionId: string) => {
    console.log('🎯 INLINE EDIT START DEBUG:', {
      sectionId,
      generationId,
      isTimerRunning: isRunning,
      currentEditedNote: editedNote?.length,
      originalNote: generatedNote?.length
    });

    // 🔧 BEST PRACTICE: Start timer for inline edits if not already running
    if (!isRunning) {
      startTimer();
      console.log('⏱️ Timer started for inline edit on section:', sectionId);
    } else {
      console.log('⏱️ Timer already running, continuing for section:', sectionId);
    }
  }, [isRunning, startTimer, generationId, editedNote, generatedNote]); const handleSectionSaveEdit = useCallback((sectionId: string, newContent: string) => {
    // 🔍 COMPREHENSIVE SECTION EDIT DEBUGGING
    const currentSection = formattedNote.sections.find(s => s.id === sectionId);
    const originalContent = currentSection?.content || '';

    console.log(`🎯 SECTION EDIT DEBUGGING:`, {
      sectionId,
      sectionTitle: currentSection?.title || 'UNKNOWN',
      originalContent,
      newContent,
      originalLength: originalContent.length,
      newLength: newContent.length,
      lengthDiff: newContent.length - originalContent.length,
      contentIdentical: originalContent === newContent,
      currentGenerationId: generationId,
      hasOriginalNote: !!originalGeneratedNote,
      originalNoteLength: originalGeneratedNote?.length || 0,
      isTimerRunning: isRunning
    });

    // Update the edited sections
    setEditedSections(prev => ({
      ...prev,
      [sectionId]: newContent
    }));

    // Reconstruct the full note with the updated section
    const updatedSections = formattedNote.sections.map(section =>
      section.id === sectionId
        ? { ...section, content: newContent }
        : editedSections[section.id]
          ? { ...section, content: editedSections[section.id] }
          : section
    );

    // Convert sections back to text format
    const reconstructedNote = updatedSections.map(section => {
      const title = section.title ? `**${section.title}:**` : '';
      const content = section.content || '';
      return title + (title ? '\n' : '') + content;
    }).join('\n\n');

    // 🔍 NOTE RECONSTRUCTION DEBUGGING
    console.log(`🔧 NOTE RECONSTRUCTION:`, {
      originalNoteLength: editedNote.length,
      reconstructedNoteLength: reconstructedNote.length,
      lengthDiff: reconstructedNote.length - editedNote.length,
      originalNotePreview: editedNote.substring(0, 200) + '...',
      reconstructedPreview: reconstructedNote.substring(0, 200) + '...',
      notesIdentical: editedNote === reconstructedNote
    });

    // Update note and trigger tracking in one atomic operation
    setEditedNote(reconstructedNote);

    // 🎯 FIXED: Immediate change tracking with proper validation
    console.log('🔄 Processing inline edit for tracking...', {
      sectionId,
      originalLength: originalGeneratedNote?.length || 'MISSING',
      newLength: reconstructedNote.length,
      hasGenerationId: !!generationId,
      hasOriginalNote: !!originalGeneratedNote
    });

    // 🔍 CRITICAL TRACKING DECISION DEBUG
    console.log(`🚨 TRACKING DECISION ANALYSIS:`, {
      hasGenerationId: !!generationId,
      hasOriginalNote: !!originalGeneratedNote,
      originalNoteLength: originalGeneratedNote?.length || 0,
      reconstructedLength: reconstructedNote.length,
      contentComparison: reconstructedNote === originalGeneratedNote,
      originalPreview: originalGeneratedNote?.substring(0, 100) + '...' || 'MISSING',
      reconstructedPreview: reconstructedNote.substring(0, 100) + '...'
    });

    // Validate we have the necessary data for tracking
    if (generationId && originalGeneratedNote && reconstructedNote !== originalGeneratedNote) {
      // Lower threshold for change detection - even 1 character is meaningful
      const changeSize = Math.abs(reconstructedNote.length - originalGeneratedNote.length);
      const hasChange = changeSize > 0 || reconstructedNote.trim() !== originalGeneratedNote.trim();

      if (hasChange) {
        console.log('📝 Inline edit change detected - triggering tracking:', {
          sectionId,
          changeSize,
          generationId: generationId.slice(0, 8) + '...',
          isTimerRunning: isRunning
        });

        // 🔧 CRITICAL FIX: Use reconstructed note directly instead of waiting for state update
        console.log('🎯 Triggering tracking with reconstructed note directly');
        handleSaveWithContent(reconstructedNote);
      } else {
        console.log('⚠️ No substantial changes detected for:', sectionId);
      }
    } else {
      console.log('⚠️ Inline edit tracking skipped:', {
        hasGenerationId: !!generationId,
        contentSame: reconstructedNote === generatedNote,
        generationId: generationId?.slice(0, 8) + '...'
      });
    }
  }, [formattedNote.sections, editedSections, generationId, generatedNote, handleSave, isRunning]); const handleSectionCancelEdit = useCallback((sectionId: string) => {
    console.log(`Canceling inline edit for section: ${sectionId}`);
  }, []);

  // Handle missing info field addition
  const handleMissingInfoFieldAdd = useCallback((sectionId: string, fieldName: string, value: string) => {
    console.log(`Adding missing field: ${fieldName} to section: ${sectionId} with value: ${value}`);

    // Find the section and append the new information
    const updatedSections = formattedNote.sections.map(section => {
      if (section.id.includes(sectionId) || section.title?.toLowerCase().includes(sectionId.toLowerCase())) {
        const newContent = section.content
          ? `${section.content}\n\n**${fieldName}:** ${value}`
          : `**${fieldName}:** ${value}`;

        return { ...section, content: newContent };
      }
      return section;
    });

    // Reconstruct the full note with the updated section
    const reconstructedNote = updatedSections.map(section => {
      const title = section.title ? `**${section.title}:**` : '';
      const content = section.content || '';
      return title + (title ? '\n' : '') + content;
    }).join('\n\n');

    setEditedNote(reconstructedNote);
  }, [formattedNote.sections]);

  // Handle missing info field skip
  const handleMissingInfoFieldSkip = useCallback((fieldId: string) => {
    console.log(`Skipping missing field: ${fieldId}`);
    // This is handled internally by the MissingInfoAssist component
  }, []);

  // Inline editing is always enabled - removed toggle function

  return (
    <div id="medical-note-viewer" className="max-w-5xl mx-auto px-2 sm:px-4" dir="ltr">
      {/* Header Section */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 text-left px-2">
          {translations[currentLanguage].noteTypeNames[noteType] || 'Medical Report'}
        </h2>
        {translations[currentLanguage].noteTypeDescriptions[noteType] && (
          <p className="text-xs sm:text-sm text-gray-600 text-left px-2">
            {translations[currentLanguage].noteTypeDescriptions[noteType]}
          </p>
        )}
      </div>

      {/* Original Transcript Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 text-left">
          {t('originalText')}
        </h3>
        <div className="bg-white rounded-lg p-3 sm:p-4 max-h-32 sm:max-h-40 overflow-y-auto">
          <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap text-left">
            {transcript}
          </p>
        </div>
      </div>

      {/* Generate Note Button */}
      {!generatedNote && !isProcessing && (
        <div className="text-center mb-4 sm:mb-6">
          <button
            onClick={onGenerate}
            className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto w-full sm:w-auto text-sm sm:text-base"
          >
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            {t('generateReport')}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 text-center mb-4 sm:mb-6">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4 animate-spin" />
          <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">{t('generating')}</h3>
          <p className="text-blue-600 mb-3 text-sm sm:text-base px-2">{t('generatingDesc')}</p>

          {/* Enhanced loading indicators */}
          <div className="mt-3 sm:mt-4 space-y-2">
            <div className="text-xs sm:text-sm text-blue-600 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <span>Processing medical content...</span>
            </div>
            <div className="text-xs sm:text-sm text-blue-600 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <span>Structuring report sections...</span>
            </div>
            <div className="text-xs sm:text-sm text-blue-600 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span>Applying medical standards...</span>
            </div>
          </div>
        </div>
      )}

      {/* Generated Note Display */}
      {generatedNote && !isProcessing && (
        <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 overflow-hidden">
          {/* Missing Info Assist - Only show after note is generated */}
          <MissingInfoAssist
            transcript={transcript}
            generatedNote={currentNote}
            noteType={noteType}
            language={'en'} // Always use English for medical note content
            onFieldAdd={handleMissingInfoFieldAdd}
            onSkipField={handleMissingInfoFieldSkip}
          />

          {/* Header with actions - Modern Vertical Layout */}
          <div className="flex flex-col items-center justify-center gap-6 mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
            {/* Success Icon and Title */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {translations[currentLanguage].noteTypeNames[noteType] || noteType}
                </h3>
                <p className="text-green-700 font-semibold text-lg">
                  {t('reportGenerated')}
                </p>
              </div>
            </div>

            {/* Action buttons - Modern Grid Layout */}
            <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl">
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="group bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 text-sm shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[120px]"
                >
                  <Edit3 className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>{t('edit')}</span>
                </button>
              )}

              <button
                onClick={handleCopy}
                className={`group px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 text-sm shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[120px] ${copySuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                <Copy className={`h-5 w-5 transition-transform duration-300 ${copySuccess ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span>{copySuccess ? t('copied') : t('copy')}</span>
              </button>

              <DownloadDropdown
                onDownloadTxt={handleDownload}
                onDownloadDocx={handleDownloadDocx}
                downloadText={t('download')}
                downloadDocxText={t('downloadDocx')}
              />

              <ShareDropdown
                medicalNote={currentNote}
                patientInfo={{ name: "Patient" }} // You can make this dynamic if you have patient data
                noteType={noteType}
                language={currentLanguage}
                onShareEmail={handleShareEmail}
                onShareWhatsApp={handleShareWhatsApp}
                onCopyLink={handleCopyLink}
              />
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <RichTextEditor
              value={editedNote}
              onChange={handleEditorChange}
              language={'en'} // Always use English for medical note content
              placeholder={t('editPlaceholder')}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <div className="bg-gray-50 p-3 sm:p-6 rounded-lg">
              {/* Render structured sections - always editable */}
              {formattedNote.sections.map((section) => (
                <MedicalSectionRenderer
                  key={section.id}
                  section={editedSections[section.id] ? { ...section, content: editedSections[section.id] } : section}
                  language={currentLanguage}
                  isInlineEditing={!isEditing}
                  onStartEdit={handleSectionStartEdit}
                  onSaveEdit={handleSectionSaveEdit}
                  onCancelEdit={handleSectionCancelEdit}
                />
              ))}

              {/* Enhancement indicator */}
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-700 flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  Professional medical formatting and structure applied
                </p>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <span className="truncate py-1">{t('wordCount')}: {formattedNote.metadata.wordCount}</span>
              <span className="truncate py-1">{t('charCount')}: {formattedNote.metadata.charCount}</span>
              <span className="truncate py-1">{t('reportType')}: {translations[currentLanguage].noteTypeNames[noteType] || noteType}</span>
            </div>

            {/* Quality indicators */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1 py-1">✅ Structured sections</span>
                <span className="flex items-center gap-1 py-1">✅ Medical terminology</span>
                <span className="flex items-center gap-1 py-1">✅ Professional format</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Buttons */}
      {generatedNote && !isProcessing && !isEditing && (
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:justify-between">
          <button
            onClick={onReset}
            className="bg-gray-600 text-white px-4 py-3 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base order-2 md:order-1 min-h-[48px] w-full md:w-auto"
          >
            <RotateCcw className="h-4 w-4 md:h-5 md:w-5" />
            <span className="truncate">{t('startNew')}</span>
          </button>

          <button
            onClick={onGenerate}
            className="bg-blue-600 text-white px-4 py-3 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base order-1 md:order-2 min-h-[48px] flex items-center justify-center w-full md:w-auto"
          >
            <span className="truncate">{t('regenerate')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicalNoteViewer;
