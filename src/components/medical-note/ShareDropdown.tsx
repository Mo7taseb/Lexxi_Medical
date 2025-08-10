'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Share2, Mail, MessageCircle } from 'lucide-react';
import { Language } from './types';
import { languageTexts } from './constants';
import {
    generateShareContent,
    createGmailUrl,
    createWhatsAppUrl,
    copyToClipboard as utilCopyToClipboard,
    trackShareAction,
    PatientInfo
} from './shareUtils';

interface ShareDropdownProps {
    medicalNote: string;
    patientInfo?: PatientInfo;
    noteType: string;
    language: Language;
    onShareEmail: (format: 'text' | 'docx') => void;
    onShareWhatsApp: (format: 'text') => void;
    onCopyLink: () => void;
    className?: string;
}

const ShareDropdown: React.FC<ShareDropdownProps> = ({
    medicalNote,
    patientInfo = { name: 'Patient' },
    noteType,
    language,
    onShareEmail,
    onShareWhatsApp,
    onCopyLink,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const t = languageTexts[language];
    const isEnglish = language === 'en';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Email sharing function (plain text format)
    const handleEmailShare = async () => {
        const shareContent = generateShareContent(medicalNote, noteType, patientInfo, language, 'full', 'text');

        try {
            const gmailUrl = createGmailUrl(shareContent.subject, shareContent.body);
            window.open(gmailUrl, '_blank');
            onShareEmail('text');
        } catch (error) {
            console.error('Failed to open Gmail:', error);
            
            // Fallback: Copy formatted text to clipboard
            const success = await utilCopyToClipboard(shareContent.body);

            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);

                const fallbackMessage = isEnglish
                    ? `Gmail could not be opened. Formatted report copied to clipboard!\n\nNext steps:\n1. Open Gmail manually\n2. Create new email\n3. Paste the formatted content (Ctrl+V)\n\nSubject suggestion: ${shareContent.subject}`
                    : `لا يمكن فتح Gmail. تم نسخ التقرير المنسق للحافظة!\n\nالخطوات التالية:\n1. افتح Gmail يدوياً\n2. إنشاء بريد إلكتروني جديد\n3. لصق المحتوى المنسق (Ctrl+V)\n\nاقتراح الموضوع: ${shareContent.subject}`;

                alert(fallbackMessage);
            }
        }

        trackShareAction('email', 'text');
        setIsOpen(false);
    };

    // WhatsApp sharing function
    const handleWhatsAppShare = () => {
        const shareContent = generateShareContent(medicalNote, noteType, patientInfo, language, 'full', 'whatsapp');
        const whatsappUrl = createWhatsAppUrl(shareContent.body);

        try {
            window.open(whatsappUrl, '_blank');
            onShareWhatsApp('text');
            trackShareAction('whatsapp');
        } catch (error) {
            console.error('Failed to open WhatsApp:', error);
            // Fallback: copy to clipboard
            utilCopyToClipboard(shareContent.body);
            alert(isEnglish
                ? 'WhatsApp could not be opened. Formatted content copied to clipboard.'
                : 'لا يمكن فتح واتساب. تم نسخ المحتوى المنسق للحافظة.');
        }

        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Share Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-green-600 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] sm:min-h-[40px]"
            >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">
                    {isEnglish ? 'Share' : 'مشاركة'}
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={`absolute top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${isEnglish ? 'left-0' : 'right-0'
                    }`}>
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <Share2 className="h-4 w-4" />
                            {isEnglish ? 'Share Medical Report' : 'مشاركة التقرير الطبي'}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                            {isEnglish
                                ? 'Choose how to share this medical report'
                                : 'اختر طريقة مشاركة التقرير الطبي'
                            }
                        </p>
                    </div>

                    {/* Share Options */}
                    <div className="py-2">
                        {/* Email - Text Format */}
                        <button
                            onClick={handleEmailShare}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${isEnglish ? 'text-left' : 'text-right flex-row-reverse'
                                }`}
                        >
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Mail className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-800">
                                    {isEnglish ? 'Email' : 'البريد الإلكتروني'}
                                </div>
                                <div className="text-xs text-gray-600">
                                    {isEnglish
                                        ? 'Open Gmail with formatted medical report'
                                        : 'فتح Gmail مع التقرير الطبي المنسق'
                                    }
                                </div>
                            </div>
                        </button>

                        {/* WhatsApp */}
                        <button
                            onClick={handleWhatsAppShare}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${isEnglish ? 'text-left' : 'text-right flex-row-reverse'
                                }`}
                        >
                            <div className="p-2 bg-green-100 rounded-lg">
                                <MessageCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-800">
                                    {isEnglish ? 'WhatsApp' : 'واتساب'}
                                </div>
                                <div className="text-xs text-gray-600">
                                    {isEnglish
                                        ? 'Share complete medical report via WhatsApp'
                                        : 'مشاركة التقرير الطبي الكامل عبر واتساب'
                                    }
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-600 text-center">
                            {isEnglish
                                ? '⚡ Instant sharing for medical professionals'
                                : '⚡ مشاركة فورية للمختصين الطبيين'
                            }
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShareDropdown;
