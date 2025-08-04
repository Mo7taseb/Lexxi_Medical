'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Loader2, AlertCircle, CheckCircle, Copy, Download, RotateCcw, Edit3, Save, X } from 'lucide-react';

interface MedicalNoteViewerProps {
    transcript: string;
    noteType: string;
    generatedNote: string;
    isProcessing: boolean;
    language?: string; // Add language prop
    onGenerate: () => void;
    onReset: () => void;
}

const MedicalNoteViewer: React.FC<MedicalNoteViewerProps> = ({
    transcript,
    noteType,
    generatedNote,
    isProcessing,
    language = 'ar', // Default to Arabic for backwards compatibility
    onGenerate,
    onReset
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedNote, setEditedNote] = useState(generatedNote);
    const [copySuccess, setCopySuccess] = useState(false);

    // Sync editedNote with generatedNote when it changes
    useEffect(() => {
        if (generatedNote && generatedNote !== editedNote) {
            console.log('🔄 [MedicalNoteViewer] Syncing editedNote with new generatedNote');
            setEditedNote(generatedNote);
        }
    }, [generatedNote]);

    // Detect language from transcript if not provided
    const detectedLanguage = language || detectLanguage(transcript);
    const isEnglish = detectedLanguage === 'en';
    const isArabic = detectedLanguage === 'ar';

    // Language-specific text
    const texts = {
        ar: {
            noteTypeNames: {
                soap: 'تقرير SOAP',
                progress: 'تقرير متابعة',
                consultation: 'تقرير استشارة',
                discharge: 'تقرير خروج',
                freeform: 'تقرير حر'
            },
            noteTypeDescriptions: {
                soap: 'تنسيق منظم: الأعراض، الفحص، التقييم، الخطة',
                progress: 'تحديثات حالة المريض وتقدم العلاج',
                consultation: 'إحالة المختص ونتائج الاستشارة',
                discharge: 'ملخص خروج المستشفى والتعليمات',
                freeform: 'تنسيق توثيق طبي مرن'
            },
            originalText: 'النص الأصلي',
            generateReport: 'إنشاء التقرير الطبي',
            generating: 'جاري إنشاء التقرير...',
            generatingDesc: 'يتم تحليل النص وإنشاء التقرير الطبي المناسب',
            reportGenerated: 'تم الإنشاء',
            edit: 'تحرير',
            copy: 'نسخ',
            copied: 'تم النسخ!',
            download: 'تحميل',
            cancel: 'إلغاء',
            save: 'حفظ',
            editPlaceholder: 'قم بتحرير التقرير هنا...',
            wordCount: 'عدد الكلمات',
            charCount: 'عدد الأحرف',
            reportType: 'نوع التقرير',
            startNew: 'بدء جديد',
            regenerate: 'إعادة إنشاء التقرير'
        },
        en: {
            noteTypeNames: {
                soap: 'SOAP Note',
                progress: 'Progress Note',
                consultation: 'Consultation Note',
                discharge: 'Discharge Summary',
                freeform: 'Free-form Note'
            },
            noteTypeDescriptions: {
                soap: 'Structured format: Subjective, Objective, Assessment, Plan',
                progress: 'Patient status updates and treatment progress',
                consultation: 'Specialist referral and consultation findings',
                discharge: 'Hospital discharge summary and instructions',
                freeform: 'Flexible medical documentation format'
            },
            originalText: 'Original Text',
            generateReport: 'Generate Medical Note',
            generating: 'Generating Report...',
            generatingDesc: 'Analyzing text and creating appropriate medical report',
            reportGenerated: 'Generated',
            edit: 'Edit',
            copy: 'Copy',
            copied: 'Copied!',
            download: 'Download',
            cancel: 'Cancel',
            save: 'Save',
            editPlaceholder: 'Edit the report here...',
            wordCount: 'Word count',
            charCount: 'Character count',
            reportType: 'Report type',
            startNew: 'Start New',
            regenerate: 'Regenerate Report'
        }
    };

    const t = texts[isEnglish ? 'en' : 'ar'];

    // Simple language detection function
    function detectLanguage(text: string): string {
        const arabicPattern = /[\u0600-\u06FF]/;
        const arabicMatches = text.match(/[\u0600-\u06FF]/g);
        const totalChars = text.length;
        const arabicRatio = arabicMatches ? arabicMatches.length / totalChars : 0;
        return arabicRatio > 0.3 ? 'ar' : 'en';
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(editedNote || generatedNote);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleDownload = () => {
        const content = editedNote || generatedNote;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `medical-note-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedNote(generatedNote);
    };

    const handleSave = () => {
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedNote(generatedNote);
        setIsEditing(false);
    };

    const formatNote = (note: string) => {
        if (!note) return '';

        // Enhanced formatting for English notes
        if (isEnglish) {
            console.log('🔍 [MedicalNoteViewer] Processing English note...');
            console.log('📝 Original note (first 300 chars):', note.substring(0, 300));

            let formatted = note
                // First, normalize line breaks
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                // FIX: Add spaces between words that got stuck together
                .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
                .replace(/([a-zA-Z])(\d)/g, '$1 $2') // Add space between letter and number
                .replace(/(\d)([a-zA-Z])/g, '$1 $2') // Add space between number and letter
                .replace(/([a-z])([A-Z][a-z])/g, '$1 $2') // Split camelCase words
                .replace(/([a-zA-Z])(work|tests?|laboratory|pending|routine|specified|chest|site|result|unremarkable)/gi, '$1 $2') // Fix specific stuck words
                .replace(/(work)(Routine|Laboratory|Tests?)/gi, '$1 $2') // Fix "workRoutine" etc
                .replace(/(lab|work)(Routine|Laboratory|Tests?)/gi, '$1 $2') // Fix "labRoutine" etc
                .replace(/(Date)(Not)/gi, '$1 $2') // Fix "DateNot"
                // CRITICAL FIX: Handle markdown bold formatting BEFORE other processing
                // Convert **Text:** patterns to clean section headers without extra colons
                .replace(/\*\*(.*?):\*\*/g, (match, p1) => {
                    console.log('🔧 Fixed markdown bold:', match, '→', `${p1.replace(/^:+\s*/, '').replace(/\s*:+$/, '')}:`);
                    // Clean up the section title and ensure no extra colons, but DON'T wrap in markdown
                    const cleanTitle = p1.replace(/^:+\s*/, '').replace(/\s*:+$/, '');
                    return `${cleanTitle}:`; // Remove ** wrapper to avoid nested formatting later
                })
                // Enhanced colon cleaning - remove stray colons from beginning of lines and after line breaks  
                .replace(/^\s*:\s*/gm, '')  // Remove colons at start of lines
                .replace(/(\n|^)\s*:\s*/g, '$1')  // Remove colons after line breaks
                .replace(/:\s*([A-Z][^:]*?:)/g, '$1')  // Remove colons before section headers that end with colon
                .replace(/:\s*(Past medical|Home medications|Social history|Patient identification|History of presenting|Physical examination|Investigation|Assessment|Plan|Date of consultation|Patient location|Reason for consultation|Allergies)/gi, '$1')  // Remove colons before key section titles
                // Convert text to proper HTML structure with better detection (handle both markdown and clean formats)
                .replace(/(Date of consult(?:ation)?:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Patient location:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Patient identification:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Reason (?:for )?consult(?:ation)?:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Past medical history.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Home medications?:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Allergies:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Social history:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(History of presenting illness:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #10b981; padding: 8px 0 8px 12px; background: #f0fdf4;">$1</strong></div>')
                .replace(/(Physical examination.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #0066cc; padding: 8px 0 8px 12px; background: #f8fafc;">$1</strong></div>')
                .replace(/(Investigation:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #7c3aed; padding: 8px 0 8px 12px; background: #faf5ff;">$1</strong></div>')
                .replace(/(Lab work:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 12px 0 6px 0; border-left: 3px solid #f59e0b; padding: 6px 0 6px 10px; background: #fffbeb;">$1</strong></div>')
                .replace(/(Imaging:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 12px 0 6px 0; border-left: 3px solid #ef4444; padding: 6px 0 6px 10px; background: #fef2f2;">$1</strong></div>')
                .replace(/(Microbiology:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 12px 0 6px 0; border-left: 3px solid #06b6d4; padding: 6px 0 6px 10px; background: #f0f9ff;">$1</strong></div>')
                .replace(/(Others?:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 12px 0 6px 0; border-left: 3px solid #8b5cf6; padding: 6px 0 6px 10px; background: #f5f3ff;">$1</strong></div>')
                .replace(/(Assessment.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #f59e0b; padding: 8px 0 8px 12px; background: #fffbeb;">$1</strong></div>')
                .replace(/(Plan.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-left: 4px solid #10b981; padding: 8px 0 8px 12px; background: #f0fdf4;">$1</strong></div>')
                // Enhanced medication formatting to highlight dosages
                .replace(/(\w+)\s+(\d+\s*(?:mg|mcg|g|ml|units?|tablets?|capsules?))\s+((?:once|twice|three times|four times|daily|weekly|monthly|as needed|PRN|bid|tid|qid|qd|q\d+h?|every \d+ hours?|every \d+ days?).*?)(?=\n|$|\.)/gi,
                    '<div style="margin: 6px 0; padding: 6px 8px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px; font-size: 13px; word-break: break-word;"><strong style="color: #92400e;">$1</strong> <span style="background: #fed7aa; padding: 2px 4px; border-radius: 3px; font-weight: 600; color: #9a3412; font-size: 12px;">$2</span> <em style="color: #78350f; font-size: 12px;">$3</em></div>')
                // Enhanced formatting for Date, Type, Site, Result patterns in Imaging and Microbiology
                .replace(/(Date:\s*)(.*?)(\n|$)/gi, '<div style="margin: 4px 0; font-size: 13px;"><strong style="color: #374151;">📅 Date:</strong> <span style="background: #dbeafe; padding: 2px 4px; border-radius: 3px; color: #1e40af; font-size: 12px;">$2</span></div>')
                .replace(/(Type:\s*)(.*?)(\n|$)/gi, '<div style="margin: 4px 0; font-size: 13px;"><strong style="color: #374151;">🔬 Type:</strong> <span style="background: #ecfdf5; padding: 2px 4px; border-radius: 3px; color: #065f46; font-size: 12px;">$2</span></div>')
                .replace(/(Site:\s*)(.*?)(\n|$)/gi, '<div style="margin: 4px 0; font-size: 13px;"><strong style="color: #374151;">📍 Site:</strong> <span style="background: #fef3c7; padding: 2px 4px; border-radius: 3px; color: #92400e; font-size: 12px;">$2</span></div>')
                .replace(/(Result:\s*)(.*?)(\n|$)/gi, '<div style="margin: 4px 0 12px 0; font-size: 13px;"><strong style="color: #374151;">📋 Result:</strong> <span style="background: #f3e8ff; padding: 2px 4px; border-radius: 3px; color: #6b21a8; font-size: 12px; word-break: break-word;">$2</span></div>')
                // ADDITIONAL FIX: Clean up any remaining stuck words in the final content
                .replace(/([a-z])([A-Z])/g, '$1 $2') // Final pass to separate any remaining camelCase
                .replace(/(pending|routine|laboratory|chest|site|result|date|type)(tests?|work|x-ray|specified|not)/gi, '$1 $2') // Fix specific medical term combinations
                // Format any remaining bold text (but NOT the section headers we already processed)
                .replace(/\*(?!\*)(.*?)\*/g, '<em style="color: #374151;">$1</em>') // Handle single asterisk for italics
                // Highlight important medical terms more aggressively
                .replace(/\b(tuberculosis|lymphadenitis|anti-tubercular|medication|Nepal|Canada|London|Ontario|Miss X|31-year-old|female|male|diagnosis|diagnosed|treated|months|years|history|consultation|patient|examination|assessment|plan)\b/gi,
                    '<span style="background: #dbeafe; padding: 2px 6px; border-radius: 4px; font-weight: 500; color: #1e40af;">$1</span>')
                // Format numbered lists with FORCED LTR direction and proper left alignment
                .replace(/^(\d+)\.\s*(.+)$/gm, '<div style="margin: 12px 0; direction: ltr !important; text-align: left !important; display: flex !important; flex-direction: row !important; align-items: flex-start; justify-content: flex-start; border-left: 2px solid #e5e7eb; padding-left: 12px;"><span style="display: inline-block !important; min-width: 40px; text-align: left !important; font-weight: 700; color: #374151; margin-right: 16px; flex-shrink: 0; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">$1.</span><span style="flex: 1; text-align: left !important; line-height: 1.6;">$2</span></div>')
                // Better bullet point formatting for both • and - patterns
                .replace(/^• (.+)$/gm, '<div style="margin: 8px 0; padding-left: 24px; direction: ltr !important; text-align: left !important; position: relative;"><span style="position: absolute; left: 0; color: #0066cc; font-weight: bold;">•</span>$1</div>')
                .replace(/^- (.+)$/gm, '<div style="margin: 8px 0; padding-left: 24px; direction: ltr !important; text-align: left !important; position: relative;"><span style="position: absolute; left: 0; color: #0066cc; font-weight: bold;">•</span>$1</div>')
                // Handle standalone dashes that might be separated from their content
                .replace(/^-\s*$/gm, '') // Remove standalone dashes
                .replace(/^-([A-Za-z])/gm, '• $1') // Convert "-DateNot" to "• DateNot"
                // Convert sentences into proper divs instead of invalid nested p tags
                .replace(/\.\s+([A-Z][a-z])/g, '.</div><div style="margin: 12px 0; text-align: left; direction: ltr; line-height: 1.7; color: #374151;">$1')
                // Handle remaining line breaks
                .replace(/\n/g, '<br style="margin: 6px 0;">');

            console.log('✅ [MedicalNoteViewer] Final formatted content (first 300 chars):', formatted.substring(0, 300));

            // Wrap the content properly in a container div, not p tag
            return `<div style="direction: ltr; text-align: left; font-family: 'Inter', sans-serif; color: #374151; line-height: 1.7;"><div style="margin: 12px 0; text-align: left; direction: ltr; line-height: 1.7; color: #374151;">${formatted}</div></div>`;
        }

        // Arabic formatting (enhanced)
        return note
            .replace(/\n/g, '<br>')
            // CRITICAL FIX: Handle markdown bold formatting BEFORE other processing for Arabic
            .replace(/\*\*(.*?):\*\*/g, (match, p1) => {
                // Clean up the section title and ensure no extra colons
                const cleanTitle = p1.replace(/^:+\s*/, '').replace(/\s*:+$/, '');
                return `**${cleanTitle}:**`;
            })
            // Enhanced colon cleaning for Arabic - remove stray colons at the beginning of lines and before section headers
            .replace(/^\s*:\s*/gm, '')  // Remove colons at start of lines
            .replace(/(\n|^)\s*:\s*/g, '$1')  // Remove colons after line breaks
            .replace(/:\s*([تاريخ الاستشارة|سبب الاستشارة|تعريف المريض|التاريخ المرضي السابق|أدوية المنزل|الحساسية|التاريخ الاجتماعي|تاريخ المرض الحالي|الفحص البدني|الفحوصات|التقييم|الخطة])/gi, '$1')  // Remove colons before Arabic section titles
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Enhanced Arabic section headers
            .replace(/(تاريخ الاستشارة:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-right: 4px solid #0066cc; padding: 8px 12px 8px 0; background: #f8fafc; text-align: right;">$1</strong></div>')
            .replace(/(سبب الاستشارة:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-right: 4px solid #0066cc; padding: 8px 12px 8px 0; background: #f8fafc; text-align: right;">$1</strong></div>')
            .replace(/(تعريف المريض:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-right: 4px solid #0066cc; padding: 8px 12px 8px 0; background: #f8fafc; text-align: right;">$1</strong></div>')
            .replace(/(التاريخ المرضي السابق.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-right: 4px solid #0066cc; padding: 8px 12px 8px 0; background: #f8fafc; text-align: right;">$1</strong></div>')
            .replace(/(أدوية المنزل:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-right: 4px solid #0066cc; padding: 8px 12px 8px 0; background: #f8fafc; text-align: right;">$1</strong></div>')
            .replace(/(الحساسية:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-right: 4px solid #0066cc; padding: 8px 12px 8px 0; background: #f8fafc; text-align: right;">$1</strong></div>')
            .replace(/(التاريخ الاجتماعي:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-right: 4px solid #0066cc; padding: 8px 12px 8px 0; background: #f8fafc; text-align: right;">$1</strong></div>')
            .replace(/(تاريخ المرض الحالي:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-right: 4px solid #10b981; padding: 8px 12px 8px 0; background: #f0fdf4; text-align: right;">$1</strong></div>')
            .replace(/(الفحص البدني.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-right: 4px solid #0066cc; padding: 8px 12px 8px 0; background: #f8fafc; text-align: right;">$1</strong></div>')
            .replace(/(الفحوصات:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-right: 4px solid #7c3aed; padding: 8px 12px 8px 0; background: #faf5ff; text-align: right;">$1</strong></div>')
            .replace(/(الفحوصات المخبرية:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 12px 0 6px 0; border-right: 3px solid #f59e0b; padding: 6px 10px 6px 0; background: #fffbeb; text-align: right;">$1</strong></div>')
            .replace(/(التصوير:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 12px 0 6px 0; border-right: 3px solid #ef4444; padding: 6px 10px 6px 0; background: #fef2f2; text-align: right;">$1</strong></div>')
            .replace(/(علم الأحياء الدقيقة:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 12px 0 6px 0; border-right: 3px solid #06b6d4; padding: 6px 10px 6px 0; background: #f0f9ff; text-align: right;">$1</strong></div>')
            .replace(/(أخرى:.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 12px 0 6px 0; border-right: 3px solid #8b5cf6; padding: 6px 10px 6px 0; background: #f5f3ff; text-align: right;">$1</strong></div>')
            .replace(/(التقييم.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-right: 4px solid #f59e0b; padding: 8px 12px 8px 0; background: #fffbeb; text-align: right;">$1</strong></div>')
            .replace(/(الخطة.*?)(\n|$)/gi, '<div class="medical-header"><strong style="color: #1f2937; font-weight: 700; display: block; margin: 16px 0 8px 0; border-right: 4px solid #10b981; padding: 8px 12px 8px 0; background: #f0fdf4; text-align: right;">$1</strong></div>')
            // Enhanced Arabic formatting for Date, Type, Site, Result patterns
            .replace(/(التاريخ:\s*)(.*?)(\n|$)/gi, '<div style="margin: 4px 0; text-align: right;"><strong style="color: #374151;">📅 التاريخ:</strong> <span style="background: #dbeafe; padding: 2px 6px; border-radius: 3px; color: #1e40af;">$2</span></div>')
            .replace(/(النوع:\s*)(.*?)(\n|$)/gi, '<div style="margin: 4px 0; text-align: right;"><strong style="color: #374151;">🔬 النوع:</strong> <span style="background: #ecfdf5; padding: 2px 6px; border-radius: 3px; color: #065f46;">$2</span></div>')
            .replace(/(الموقع:\s*)(.*?)(\n|$)/gi, '<div style="margin: 4px 0; text-align: right;"><strong style="color: #374151;">📍 الموقع:</strong> <span style="background: #fef3c7; padding: 2px 6px; border-radius: 3px; color: #92400e;">$2</span></div>')
            .replace(/(النتيجة:\s*)(.*?)(\n|$)/gi, '<div style="margin: 4px 0 12px 0; text-align: right;"><strong style="color: #374151;">📋 النتيجة:</strong> <span style="background: #f3e8ff; padding: 2px 6px; border-radius: 3px; color: #6b21a8;">$2</span></div>')
            // Enhanced Arabic medication formatting
            .replace(/(\w+)\s+(\d+\s*(?:ملغ|مكغ|غ|مل|وحدة|وحدات|أقراص|كبسولات))\s+((?:مرة واحدة|مرتين|ثلاث مرات|أربع مرات|يومياً|أسبوعياً|شهرياً|عند الحاجة).*?)(?=\n|$|\.)/gi,
                '<div style="margin: 6px 0; padding: 8px 12px; background: #fef3c7; border-right: 3px solid #f59e0b; border-radius: 4px; text-align: right;"><strong style="color: #92400e;">$1</strong> <span style="background: #fed7aa; padding: 2px 6px; border-radius: 3px; font-weight: 600; color: #9a3412;">$2</span> <em style="color: #78350f;">$3</em></div>')
            // Format numbered lists for Arabic with RTL direction
            .replace(/^(\d+)\.\s*(.+)$/gm, '<div style="margin: 4px 0; padding-right: 0; direction: rtl; text-align: right; display: flex; align-items: flex-start;"><span style="flex: 1;">$2</span><span style="display: inline-block; min-width: 32px; text-align: right; font-weight: 500; color: #374151; margin-left: 8px; flex-shrink: 0;">$1.</span></div>')
            .replace(/^(\d+)\s+(.+)$/gm, '<div style="margin: 4px 0; padding-right: 0; direction: rtl; text-align: right; display: flex; align-items: flex-start;"><span style="flex: 1;">$2</span><span style="display: inline-block; min-width: 32px; text-align: right; font-weight: 500; color: #374151; margin-left: 8px; flex-shrink: 0;">$1</span></div>');
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-4 sm:mb-6">
                <h2 className={`text-xl sm:text-2xl font-bold text-gray-800 mb-2 ${isEnglish ? 'text-left' : 'text-right'} px-2`}>
                    {(t.noteTypeNames as any)[noteType] || (isEnglish ? 'Medical Report' : 'التقرير الطبي')}
                </h2>
                {/* Note type description */}
                {(t as any).noteTypeDescriptions && (t as any).noteTypeDescriptions[noteType] && (
                    <p className={`text-xs sm:text-sm text-gray-600 ${isEnglish ? 'text-left' : 'text-right'} px-2`}>
                        {(t as any).noteTypeDescriptions[noteType]}
                    </p>
                )}
            </div>

            {/* Original Transcript Preview - Mobile optimized */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className={`text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 ${isEnglish ? 'text-left' : 'text-right'}`}>
                    {t.originalText}
                </h3>
                <div className="bg-white rounded-lg p-3 sm:p-4 max-h-32 sm:max-h-40 overflow-y-auto">
                    <p className={`text-xs sm:text-sm text-gray-700 whitespace-pre-wrap ${isEnglish ? 'text-left' : 'text-right'}`}
                        dir={isEnglish ? 'ltr' : 'rtl'}>
                        {transcript}
                    </p>
                </div>
            </div>

            {/* Generate Note Button - Mobile responsive */}
            {!generatedNote && !isProcessing && (
                <div className="text-center mb-4 sm:mb-6">
                    <button
                        onClick={onGenerate}
                        className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto w-full sm:w-auto text-sm sm:text-base"
                        dir={isEnglish ? 'ltr' : 'rtl'}
                    >
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        {t.generateReport}
                    </button>
                </div>
            )}

            {/* Loading State - Mobile optimized */}
            {isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 text-center mb-4 sm:mb-6">
                    <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4 animate-spin" />
                    <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">{t.generating}</h3>
                    <p className="text-blue-600 mb-3 text-sm sm:text-base px-2">{t.generatingDesc}</p>

                    {/* English-specific loading indicators - Mobile responsive */}
                    {isEnglish && (
                        <div className="mt-3 sm:mt-4 space-y-2">
                            <div className="text-xs sm:text-sm text-blue-600 flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                <span>Applying medical terminology corrections...</span>
                            </div>
                            <div className="text-xs sm:text-sm text-blue-600 flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <span>Formatting professional medical structure...</span>
                            </div>
                            <div className="text-xs sm:text-sm text-blue-600 flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <span>Ensuring clinical accuracy...</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Generated Note Display - Mobile optimized */}
            {generatedNote && !isProcessing && (
                <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                    {/* Header with title and action buttons - Mobile responsive */}
                    <div className={`flex flex-col gap-3 sm:gap-4 mb-4 ${isEnglish ? 'sm:flex-row sm:items-center sm:justify-between' : 'sm:flex-row-reverse sm:items-center sm:justify-between'}`}>
                        {/* Title section */}
                        <div className={`flex items-center gap-2 ${isEnglish ? 'flex-row' : 'flex-row-reverse'}`}>
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                                {(t.noteTypeNames as any)[noteType] || noteType} - {t.reportGenerated}
                            </h3>
                        </div>

                        {/* Action buttons - Mobile stacked, desktop horizontal */}
                        <div className={`flex flex-col sm:flex-row gap-2 sm:gap-2 ${isEnglish ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                            {!isEditing && (
                                <button
                                    onClick={handleEdit}
                                    className="bg-gray-600 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] sm:min-h-[40px]"
                                >
                                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="truncate">{t.edit}</span>
                                </button>
                            )}

                            <button
                                onClick={handleCopy}
                                className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] sm:min-h-[40px] ${copySuccess
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="truncate">{copySuccess ? t.copied : t.copy}</span>
                            </button>

                            <button
                                onClick={handleDownload}
                                className="bg-purple-600 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] sm:min-h-[40px]"
                            >
                                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="truncate">{t.download}</span>
                            </button>
                        </div>
                    </div>

                    {isEditing ? (
                        <div>
                            {/* Mobile-optimized textarea for editing */}
                            <textarea
                                value={editedNote}
                                onChange={(e) => setEditedNote(e.target.value)}
                                className={`w-full h-64 sm:h-96 p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-sm sm:text-base ${isEnglish ? 'text-left' : 'text-right'}`}
                                placeholder={t.editPlaceholder}
                                dir={isEnglish ? 'ltr' : 'rtl'}
                                style={{
                                    color: '#1f2937',
                                    fontSize: isEnglish ? '14px' : '15px',
                                    lineHeight: isEnglish ? '1.6' : '1.5',
                                    fontFamily: isEnglish ? 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' : 'Cairo, sans-serif',
                                    letterSpacing: isEnglish ? '0.2px' : 'normal',
                                    unicodeBidi: isEnglish ? 'embed' : 'normal',
                                    textAlign: isEnglish ? 'left' : 'right'
                                }}
                            />

                            {/* English editing helper - Mobile responsive */}
                            {isEnglish && isEditing && (
                                <div className="mt-2 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded text-xs sm:text-sm text-blue-700">
                                    💡 Tip: Use **bold** for section headers and • for bullet points. Medical terminology will be enhanced automatically.
                                </div>
                            )}

                            {/* Editing action buttons - Mobile responsive */}
                            <div className={`flex flex-col sm:flex-row gap-2 sm:gap-2 mt-4 ${isEnglish ? 'sm:justify-end' : 'sm:justify-end'}`}>
                                <button
                                    onClick={handleCancel}
                                    className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base order-2 sm:order-1"
                                >
                                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="truncate">{t.cancel}</span>
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
                                >
                                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="truncate">{t.save}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-3 sm:p-6 rounded-lg">
                            <div
                                className={`medical-note-content leading-relaxed text-gray-800 ${isEnglish ? 'text-left' : 'text-right'} ${isEnglish ? 'font-sans' : 'font-cairo'} break-words overflow-hidden`}
                                dangerouslySetInnerHTML={{
                                    __html: (() => {
                                        const noteToFormat = editedNote || generatedNote;
                                        console.log('🎯 [MedicalNoteViewer] About to format note:', {
                                            hasEditedNote: !!editedNote,
                                            hasGeneratedNote: !!generatedNote,
                                            noteLength: noteToFormat?.length || 0,
                                            isEnglish,
                                            notePreview: noteToFormat?.substring(0, 100)
                                        });
                                        return formatNote(noteToFormat);
                                    })()
                                }}
                                dir={isEnglish ? 'ltr' : 'rtl'}
                                style={{
                                    fontSize: isEnglish ? '14px' : '15px',
                                    lineHeight: isEnglish ? '1.6' : '1.5',
                                    letterSpacing: isEnglish ? '0.2px' : 'normal',
                                    unicodeBidi: isEnglish ? 'embed' : 'normal',
                                    textAlign: isEnglish ? 'left' : 'right',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word'
                                }}
                            />

                            {/* English note enhancement indicator */}
                            {isEnglish && generatedNote && (
                                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-xs sm:text-sm text-blue-700 flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                        Professional medical terminology and formatting applied
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Note Statistics - Mobile responsive */}
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 ${isEnglish ? '' : 'text-right'}`}>
                            <span className="truncate py-1">{t.wordCount}: {(editedNote || generatedNote).split(/\s+/).filter(word => word.trim()).length}</span>
                            <span className="truncate py-1">{t.charCount}: {(editedNote || generatedNote).length}</span>
                            <span className="truncate py-1">{t.reportType}: {(t.noteTypeNames as any)[noteType] || noteType}</span>
                        </div>

                        {/* English-specific quality indicators - Mobile responsive */}
                        {isEnglish && generatedNote && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1 py-1">✅ Medical terminology enhanced</span>
                                    <span className="flex items-center gap-1 py-1">✅ Professional formatting applied</span>
                                    <span className="flex items-center gap-1 py-1">✅ English medical standards</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bottom Action Buttons - Mobile responsive */}
            {generatedNote && !isProcessing && !isEditing && (
                <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${isEnglish ? 'sm:justify-between' : 'sm:justify-between sm:flex-row-reverse'}`}>
                    <button
                        onClick={onReset}
                        className="bg-gray-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base order-2 sm:order-1 min-h-[48px]"
                    >
                        <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="truncate">{t.startNew}</span>
                    </button>

                    <button
                        onClick={onGenerate}
                        className="bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base order-1 sm:order-2 min-h-[48px] flex items-center justify-center"
                    >
                        <span className="truncate">{t.regenerate}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default MedicalNoteViewer;
