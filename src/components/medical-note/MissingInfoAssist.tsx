'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    MissingInfoAssistProps,
    MissingInfoDetectionResult,
    MissingInfoItem
} from './missingInfoTypes';
import { detectMissingInfo, missingInfoLanguageTexts } from './missingInfoDetection';
import CompletionPill from './CompletionPill';
import ChecklistModal from './ChecklistModal';
import MicroForm from './MicroForm';
import InlineHint from './InlineHint';

const MissingInfoAssist: React.FC<MissingInfoAssistProps> = ({
    transcript,
    generatedNote,
    noteType,
    language,
    onFieldAdd,
    onSkipField
}) => {
    const [detectionResult, setDetectionResult] = useState<MissingInfoDetectionResult | null>(null);
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);
    const [activeMicroForm, setActiveMicroForm] = useState<string | null>(null);
    const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
    const [skippedFields, setSkippedFields] = useState<Set<string>>(new Set());

    const t = missingInfoLanguageTexts[language];

    // Detect missing info when inputs change
    useEffect(() => {
        if (transcript && generatedNote && noteType) {
            const result = detectMissingInfo(transcript, generatedNote, noteType);
            setDetectionResult(result);
        }
    }, [transcript, generatedNote, noteType]);

    // Calculate current completion status
    const currentCompletionData = useMemo(() => {
        if (!detectionResult) return { completed: 0, total: 0, percentage: 100 };

        const totalRelevantFields = detectionResult.totalFields;
        const originalCompleted = detectionResult.completedFields;
        const newCompleted = completedFields.size;
        const skipped = skippedFields.size;

        const totalCompleted = originalCompleted + newCompleted + skipped;
        const percentage = totalRelevantFields > 0 ? Math.round((totalCompleted / totalRelevantFields) * 100) : 100;

        return {
            completed: totalCompleted,
            total: totalRelevantFields,
            percentage
        };
    }, [detectionResult, completedFields, skippedFields]);

    // Filter out completed and skipped items
    const activeMissingItems = useMemo(() => {
        if (!detectionResult) return [];

        return detectionResult.missingItems.filter(item =>
            !completedFields.has(item.field.id) && !skippedFields.has(item.field.id)
        );
    }, [detectionResult, completedFields, skippedFields]);

    // Group missing items by section
    const missingItemsBySection = useMemo(() => {
        const grouped: Record<string, MissingInfoItem[]> = {};
        activeMissingItems.forEach(item => {
            if (!grouped[item.field.section]) {
                grouped[item.field.section] = [];
            }
            grouped[item.field.section].push(item);
        });
        return grouped;
    }, [activeMissingItems]);

    const handleFieldAdd = (fieldId: string, value: string) => {
        const missingItem = activeMissingItems.find(item => item.field.id === fieldId);
        if (missingItem) {
            onFieldAdd(missingItem.field.section, missingItem.field.fieldName, value);
            setCompletedFields(prev => new Set([...prev, fieldId]));
            setActiveMicroForm(null);
        }
    };

    const handleFieldSkip = (fieldId: string) => {
        setSkippedFields(prev => new Set([...prev, fieldId]));
        onSkipField(fieldId);
        setActiveMicroForm(null);
    };

    const handleScrollToSection = (sectionId: string) => {
        // First try to find by exact section ID
        let element = document.getElementById(`section-${sectionId}`);

        if (!element) {
            // If not found, try to find by section title using mapping
            const sectionMappings: Record<string, string[]> = {
                'subjective': ['History of Present Illness', 'history', 'main complaint', 'subjective'],
                'objective': ['Physical Examination', 'objective', 'examination', 'vital signs'],
                'assessment': ['Assessment', 'assessment', 'diagnosis', 'impression'],
                'plan': ['Plan', 'plan', 'treatment', 'recommendations'],
                'consultation_details': ['Consultation Details', 'consultation details', 'consultation', 'details'],
                'history': ['History', 'Past Medical History', 'history', 'medical history']
            };

            const possibleTitles = sectionMappings[sectionId] || [sectionId];

            // Try to find section by matching title text
            for (const title of possibleTitles) {
                const sections = document.querySelectorAll('.medical-section');
                for (const section of sections) {
                    const titleElement = section.querySelector('.section-title');
                    if (titleElement && titleElement.textContent?.toLowerCase().includes(title.toLowerCase())) {
                        element = section as HTMLElement;
                        break;
                    }
                }
                if (element) break;
            }
        }

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add highlight effect
            element.style.transition = 'all 0.3s ease';
            element.style.backgroundColor = '#dbeafe';
            element.style.border = '2px solid #60a5fa';
            element.style.borderRadius = '8px';

            // Remove highlight after 2 seconds
            setTimeout(() => {
                element!.style.backgroundColor = '';
                element!.style.border = '';
                element!.style.borderRadius = '';
            }, 2000);
        } else {
            // Fallback: scroll to the medical note viewer
            const noteViewer = document.getElementById('medical-note-viewer');
            if (noteViewer) {
                noteViewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        setIsChecklistOpen(false);
    };

    const handleOpenMicroForm = (fieldId: string) => {
        setActiveMicroForm(fieldId);
    };

    // Don't render if no missing info or still loading
    if (!detectionResult || activeMissingItems.length === 0) {
        return null;
    }

    return (
        <div className="missing-info-assist">
            {/* Completion Pill - Properly contained and centered */}
            <div className="mb-4 flex justify-center">
                <div className="w-full max-w-lg">
                    <CompletionPill
                        completed={currentCompletionData.completed}
                        total={currentCompletionData.total}
                        onViewChecklist={() => setIsChecklistOpen(true)}
                        language={language}
                    />
                </div>
            </div>

            {/* Inline Hints - Render for each section with missing info */}
            {Object.entries(missingItemsBySection).map(([sectionId, items]) => (
                <InlineHint
                    key={sectionId}
                    sectionId={sectionId}
                    missingFields={items.map(item => item.field)}
                    onAddField={handleOpenMicroForm}
                    language={language}
                />
            ))}

            {/* Checklist Modal */}
            {isChecklistOpen && (
                <ChecklistModal
                    isOpen={isChecklistOpen}
                    onClose={() => setIsChecklistOpen(false)}
                    missingItems={activeMissingItems}
                    onScrollToSection={handleScrollToSection}
                    onFillField={handleOpenMicroForm}
                    language={language}
                />
            )}

            {/* Micro Form */}
            {activeMicroForm && (
                <MicroForm
                    field={activeMissingItems.find(item => item.field.id === activeMicroForm)?.field!}
                    isOpen={true}
                    onClose={() => setActiveMicroForm(null)}
                    onSave={(value: string | Record<string, string>) => handleFieldAdd(activeMicroForm, typeof value === 'string' ? value : JSON.stringify(value))}
                    onSkip={() => handleFieldSkip(activeMicroForm)}
                    onVoiceInput={() => {
                        // Voice input is now handled directly in MicroForm component
                    }}
                    language={language}
                />
            )}

            {/* Mobile-friendly spacing */}
            <div className="h-4" />
        </div>
    );
};

export default MissingInfoAssist;
