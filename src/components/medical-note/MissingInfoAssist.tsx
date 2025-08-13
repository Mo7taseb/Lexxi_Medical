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
        const element = document.getElementById(`section-${sectionId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
                        // TODO: Implement voice input functionality
                        console.log('Voice input requested for field:', activeMicroForm);
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
