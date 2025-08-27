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

          {/* Header with actions */}
          <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                {translations[currentLanguage].noteTypeNames[noteType] || noteType} - {t('reportGenerated')}
              </h3>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="bg-gray-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm min-h-[40px]"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>{t('edit')}</span>
                </button>
              )}

              <button
                onClick={handleCopy}
                className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm min-h-[40px] ${copySuccess ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                <Copy className="h-4 w-4" />
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
                language={'en'} // Always use English for medical note content
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
                  language={'en'} // Always use English for medical note content
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
