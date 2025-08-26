'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, getDirection, getFontFamily } from '@/utils/i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: keyof typeof translations.en) => string;
    direction: 'ltr' | 'rtl';
    fontFamily: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('ar');

    // Initialize language from localStorage or default to Arabic
    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
            setLanguageState(savedLanguage);
        }
    }, []);

    const setLanguage = (newLanguage: Language) => {
        setLanguageState(newLanguage);
        localStorage.setItem('language', newLanguage);

        // Update document direction and font family
        document.documentElement.dir = getDirection(newLanguage);
        document.documentElement.lang = newLanguage;
        document.documentElement.style.fontFamily = getFontFamily(newLanguage);
    };

    // Only allow string-valued keys through t()
    type StringKeys = {
        [K in keyof typeof translations.en]: (typeof translations.en)[K] extends string ? K : never
    }[keyof typeof translations.en];

    const t = (key: StringKeys): string => {
        return translations[language][key] as string;
    };

    const direction = getDirection(language);
    const fontFamily = getFontFamily(language);

    // Update document attributes when language changes
    useEffect(() => {
        document.documentElement.dir = direction;
        document.documentElement.lang = language;
        document.documentElement.style.fontFamily = fontFamily;
    }, [language, direction, fontFamily]);

    const value: LanguageContextType = {
        language,
        setLanguage,
        t: t as unknown as LanguageContextType['t'],
        direction,
        fontFamily,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
