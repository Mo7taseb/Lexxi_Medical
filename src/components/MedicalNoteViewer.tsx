'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FileText, Loader2, CheckCircle, Copy, RotateCcw, Edit3 } from 'lucide-react';

// Import our new modular components
import { MedicalNoteViewerProps, Language, FormattedNote } from './medical-note/types';
import { detectLanguage, getTextStats, copyToClipboard, downloadFile, normalizeText } from './medical-note/utils';
import { parseNoteToSections } from './medical-note/templates';
import MedicalSectionRenderer from './medical-note/MedicalSectionRenderer';
import RichTextEditor from './medical-note/RichTextEditor';
import { languageTexts } from './medical-note/constants';
import { downloadDocx } from './medical-note/docxExport';
import DownloadDropdown from './medical-note/DownloadDropdown';
import ShareDropdown from './medical-note/ShareDropdown';

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
  const [copySuccess, setCopySuccess] = useState(false);
  const [editedSections, setEditedSections] = useState<{ [key: string]: string }>({});

  // Memoized language detection and text selection
  const detectedLanguage: Language = useMemo(() => {
    return (language as Language) || detectLanguage(transcript);
  }, [language, transcript]);

  const isEnglish = detectedLanguage === 'en';
  const t = languageTexts[detectedLanguage];

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
          language: detectedLanguage,
          noteType
        }
      };
    }

    const normalizedNote = normalizeText(currentNote);
    const sections = parseNoteToSections(normalizedNote, detectedLanguage);
    const stats = getTextStats(normalizedNote);

    return {
      sections,
      metadata: {
        ...stats,
        language: detectedLanguage,
        noteType
      }
    };
  }, [currentNote, detectedLanguage, noteType]);

  // Sync editedNote with generatedNote when it changes
  useEffect(() => {
    if (generatedNote && generatedNote !== editedNote) {
      setEditedNote(generatedNote);
    }
  }, [generatedNote]);

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
      const sections = parseNoteToSections(currentNote, detectedLanguage);
      await downloadDocx(sections, noteType, detectedLanguage);
    } catch (error) {
      console.error('Failed to download DOCX:', error);
    }
  }, [currentNote, noteType, detectedLanguage]);

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
  }, [generatedNote]);

  const handleSave = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleCancel = useCallback(() => {
    setEditedNote(generatedNote);
    setIsEditing(false);
  }, [generatedNote]);

  const handleEditorChange = useCallback((value: string) => {
    setEditedNote(value);
  }, []);

  // Inline editing handlers
  const handleSectionStartEdit = useCallback((sectionId: string) => {
    console.log(`Starting inline edit for section: ${sectionId}`);
  }, []);

  const handleSectionSaveEdit = useCallback((sectionId: string, newContent: string) => {
    console.log(`Saving inline edit for section: ${sectionId}`);

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

    setEditedNote(reconstructedNote);
  }, [formattedNote.sections, editedSections]);

  const handleSectionCancelEdit = useCallback((sectionId: string) => {
    console.log(`Canceling inline edit for section: ${sectionId}`);
  }, []);

  // Inline editing is always enabled - removed toggle function

  return (
    <div className="max-w-5xl mx-auto" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
      {/* Header Section */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className={`text-xl sm:text-2xl font-bold text-gray-800 mb-2 ${isEnglish ? 'text-left' : 'text-right'} px-2`}>
          {t.noteTypeNames[noteType] || (isEnglish ? 'Medical Report' : 'التقرير الطبي')}
        </h2>
        {t.noteTypeDescriptions[noteType] && (
          <p className={`text-xs sm:text-sm text-gray-600 ${isEnglish ? 'text-left' : 'text-right'} px-2`}>
            {t.noteTypeDescriptions[noteType]}
          </p>
        )}
      </div>

      {/* Original Transcript Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <h3 className={`text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 ${isEnglish ? 'text-left' : 'text-right'}`}>
          {t.originalText}
        </h3>
        <div className="bg-white rounded-lg p-3 sm:p-4 max-h-32 sm:max-h-40 overflow-y-auto">
          <p className={`text-xs sm:text-sm text-gray-700 whitespace-pre-wrap ${isEnglish ? 'text-left' : 'text-right'}`}>
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
            {t.generateReport}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 text-center mb-4 sm:mb-6">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4 animate-spin" />
          <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">{t.generating}</h3>
          <p className="text-blue-600 mb-3 text-sm sm:text-base px-2">{t.generatingDesc}</p>

          {/* Enhanced loading indicators */}
          <div className="mt-3 sm:mt-4 space-y-2">
            <div className="text-xs sm:text-sm text-blue-600 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <span>{isEnglish ? 'Processing medical content...' : 'معالجة المحتوى الطبي...'}</span>
            </div>
            <div className="text-xs sm:text-sm text-blue-600 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <span>{isEnglish ? 'Structuring report sections...' : 'تنظيم أقسام التقرير...'}</span>
            </div>
            <div className="text-xs sm:text-sm text-blue-600 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span>{isEnglish ? 'Applying medical standards...' : 'تطبيق المعايير الطبية...'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Generated Note Display */}
      {generatedNote && !isProcessing && (
        <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Header with actions */}
          <div className={`flex flex-col gap-3 sm:gap-4 mb-4 ${isEnglish ? 'sm:flex-row sm:items-center sm:justify-between' : 'sm:flex-row-reverse sm:items-center sm:justify-between'}`}>
            <div className={`flex items-center gap-2 ${isEnglish ? 'flex-row' : 'flex-row-reverse'}`}>
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                {t.noteTypeNames[noteType] || noteType} - {t.reportGenerated}
              </h3>
            </div>

            {/* Action buttons */}
            <div className={`grid grid-cols-2 gap-3 md:flex md:flex-row md:gap-2 ${isEnglish ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="bg-gray-600 text-white px-4 py-3 md:px-4 md:py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base min-h-[48px] md:min-h-[40px] w-full md:w-auto"
                >
                  <Edit3 className="h-4 w-4 md:h-4 md:w-4" />
                  <span className="truncate">{t.edit}</span>
                </button>
              )}

              <button
                onClick={handleCopy}
                className={`px-4 py-3 md:px-4 md:py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base min-h-[48px] md:min-h-[40px] w-full md:w-auto ${copySuccess ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                <Copy className="h-4 w-4 md:h-4 md:w-4" />
                <span className="truncate">{copySuccess ? t.copied : t.copy}</span>
              </button>

              <DownloadDropdown
                onDownloadTxt={handleDownload}
                onDownloadDocx={handleDownloadDocx}
                downloadText={t.download}
                downloadDocxText={t.downloadDocx}
              />

              <ShareDropdown
                medicalNote={currentNote}
                patientInfo={{ name: "Patient" }} // You can make this dynamic if you have patient data
                noteType={noteType}
                language={detectedLanguage}
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
              language={detectedLanguage}
              placeholder={t.editPlaceholder}
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
                  language={detectedLanguage}
                  isInlineEditing={!isEditing} // Always allow inline editing when not in full edit mode
                  onStartEdit={handleSectionStartEdit}
                  onSaveEdit={handleSectionSaveEdit}
                  onCancelEdit={handleSectionCancelEdit}
                />
              ))}

              {/* Enhancement indicator */}
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-700 flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  {isEnglish
                    ? 'Professional medical formatting and structure applied'
                    : 'تم تطبيق التنسيق والهيكل الطبي المحترف'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 ${isEnglish ? '' : 'text-right'}`}>
              <span className="truncate py-1">{t.wordCount}: {formattedNote.metadata.wordCount}</span>
              <span className="truncate py-1">{t.charCount}: {formattedNote.metadata.charCount}</span>
              <span className="truncate py-1">{t.reportType}: {t.noteTypeNames[noteType] || noteType}</span>
            </div>

            {/* Quality indicators */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1 py-1">✅ {isEnglish ? 'Structured sections' : 'أقسام منظمة'}</span>
                <span className="flex items-center gap-1 py-1">✅ {isEnglish ? 'Medical terminology' : 'مصطلحات طبية'}</span>
                <span className="flex items-center gap-1 py-1">✅ {isEnglish ? 'Professional format' : 'تنسيق محترف'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Buttons */}
      {generatedNote && !isProcessing && !isEditing && (
        <div className={`flex flex-col md:flex-row gap-3 md:gap-4 ${isEnglish ? 'md:justify-between' : 'md:justify-between md:flex-row-reverse'}`}>
          <button
            onClick={onReset}
            className="bg-gray-600 text-white px-4 py-3 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base order-2 md:order-1 min-h-[48px] w-full md:w-auto"
          >
            <RotateCcw className="h-4 w-4 md:h-5 md:w-5" />
            <span className="truncate">{t.startNew}</span>
          </button>

          <button
            onClick={onGenerate}
            className="bg-blue-600 text-white px-4 py-3 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base order-1 md:order-2 min-h-[48px] flex items-center justify-center w-full md:w-auto"
          >
            <span className="truncate">{t.regenerate}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicalNoteViewer;
