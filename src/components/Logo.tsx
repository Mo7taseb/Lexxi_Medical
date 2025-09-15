'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface LogoProps {
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    showGlow?: boolean;
    animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({
    width = 100,
    height = 16,
    className = '',
    priority = false,
    showGlow = false,
    animated = true
}) => {
    const { language } = useLanguage();

    return (
        <div className={`relative group logo-container ${className}`}>
            {/* Glow Effect (Optional) */}
            {showGlow && (
                <>
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/40 via-blue-500/40 to-indigo-600/40 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                </>
            )}

            {/* Logo Container with Perfect Alignment - No Overflow Issues */}
            <div className={`relative w-full h-full flex items-center justify-center ${animated ? 'rounded-xl' : ''}`}>
                {/* English Logo */}
                <Image
                    src="/logo.png"
                    alt="Lexxi"
                    width={width}
                    height={height}
                    className={`logo-responsive transition-all duration-700 ${language === 'ar'
                        ? 'opacity-0 scale-95 rotate-y-90'
                        : 'opacity-100 scale-100 rotate-y-0'
                        }`}
                    priority={priority}
                    style={{
                        objectFit: 'contain',
                        maxWidth: '100%',
                        maxHeight: '100%'
                    }}
                />

                {/* Arabic Logo */}
                <Image
                    src="/logo-ar.png"
                    alt="ليكسي"
                    width={width}
                    height={height}
                    className={`logo-perfect-center logo-responsive transition-all duration-700 ${language === 'ar'
                        ? 'opacity-100 scale-100 rotate-y-0'
                        : 'opacity-0 scale-95 rotate-y-90'
                        }`}
                    priority={priority}
                    style={{
                        objectFit: 'contain',
                        maxWidth: '100%',
                        maxHeight: '100%'
                    }}
                />
            </div>
        </div>
    );
};

export default Logo;
