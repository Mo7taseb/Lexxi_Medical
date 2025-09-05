/**
 * 🎨 LEXXI INPUT COMPONENT
 * 
 * Standardized input component with perfect visibility and styling
 * Always use this instead of raw HTML inputs to maintain consistency!
 */

import React from 'react';
import { STANDARD_INPUT_CLASSES } from '../../styles/inputStyles';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: 'base' | 'error' | 'success' | 'search';
    label?: string;
    error?: string;
    required?: boolean;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    required?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}

// ✅ PERFECT INPUT COMPONENT
export const Input: React.FC<InputProps> = ({
    variant = 'base',
    label,
    error,
    required,
    className,
    ...props
}) => {
    const inputClass = className || STANDARD_INPUT_CLASSES[variant];
    const errorClass = error ? STANDARD_INPUT_CLASSES.error : inputClass;

    return (
        <div className="w-full">
            {label && (
                <label className={STANDARD_INPUT_CLASSES.label}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                className={errorClass}
                {...props}
            />
            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
};

// ✅ PERFECT TEXTAREA COMPONENT
export const Textarea: React.FC<TextareaProps> = ({
    label,
    error,
    required,
    className,
    ...props
}) => {
    const textareaClass = className || STANDARD_INPUT_CLASSES.textarea;
    const errorClass = error ? STANDARD_INPUT_CLASSES.error : textareaClass;

    return (
        <div className="w-full">
            {label && (
                <label className={STANDARD_INPUT_CLASSES.label}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <textarea
                className={errorClass}
                {...props}
            />
            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
};

// ✅ PERFECT SELECT COMPONENT
export const Select: React.FC<SelectProps> = ({
    label,
    error,
    required,
    className,
    children,
    ...props
}) => {
    const selectClass = className || STANDARD_INPUT_CLASSES.select;
    const errorClass = error ? STANDARD_INPUT_CLASSES.error : selectClass;

    return (
        <div className="w-full">
            {label && (
                <label className={STANDARD_INPUT_CLASSES.label}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <select
                className={errorClass}
                {...props}
            >
                {children}
            </select>
            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
};

// Export for easy usage
export default { Input, Textarea, Select };
