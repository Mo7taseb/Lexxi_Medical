// Change Tracking Consent Component
// UI component for managing tracking consent and settings

'use client';

import React, { useState, useEffect } from 'react';
import { useChangeTracking } from '@/hooks/useChangeTracking';
import { Shield, Eye, EyeOff, Settings, Database, BarChart3, Info } from 'lucide-react';

interface ChangeTrackingConsentProps {
    language?: 'ar' | 'en';
    onConsentChange?: (consent: boolean) => void;
}

export const ChangeTrackingConsent: React.FC<ChangeTrackingConsentProps> = ({
    language = 'en',
    onConsentChange
}) => {
    const { config, updateConsent, getStats } = useChangeTracking();
    const [showDetails, setShowDetails] = useState(false);
    const [stats, setStats] = useState<any>(null);

    const isArabic = language === 'ar';

    const texts = {
        ar: {
            title: 'تحسين الذكاء الاصطناعي الطبي',
            subtitle: 'ساعدنا في تحسين دقة النظام',
            description: 'نود جمع بيانات مجهولة عن التعديلات التي تجريها على التقارير المُولدة لتحسين خوارزميات الذكاء الاصطناعي.',
            whatWeCollect: 'ما نجمعه:',
            collectItems: [
                'النص المفرغ (بعد إزالة البيانات الشخصية)',
                'التقرير المُولد من الذكاء الاصطناعي',
                'التعديلات النهائية التي أجريتها',
                'نوع القالب المستخدم (SOAP، استشارة، إلخ)',
                'اللغة المستخدمة (عربي/إنجليزي)'
            ],
            whatWeDoNot: 'ما لا نجمعه:',
            doNotCollectItems: [
                'أسماء المرضى أو أي معلومات شخصية',
                'أرقام الهوية أو السجلات الطبية',
                'معلومات الاتصال',
                'أسماء المستشفيات أو العيادات'
            ],
            benefits: 'الفوائد:',
            benefitItems: [
                'تحسين دقة الذكاء الاصطناعي الطبي',
                'تقليل الأخطاء في التقارير المستقبلية',
                'تخصيص النظام للممارسة الطبية المحلية',
                'المساهمة في التطوير العلمي'
            ],
            privacy: 'الخصوصية والأمان:',
            privacyItems: [
                'جميع البيانات مُجهلة ومُشفرة',
                'لا يمكن ربط البيانات بهويتك',
                'إمكانية إيقاف المشاركة في أي وقت',
                'الامتثال لمعايير حماية البيانات الطبية'
            ],
            enableTracking: 'تفعيل تتبع التحسينات',
            disableTracking: 'إيقاف تتبع التحسينات',
            consentGiven: 'تم منح الموافقة',
            consentNotGiven: 'لم يتم منح الموافقة',
            showMore: 'عرض التفاصيل',
            showLess: 'إخفاء التفاصيل',
            statsTitle: 'إحصائيات المساهمة',
            totalGenerations: 'إجمالي التقارير المُولدة',
            totalEdits: 'إجمالي التعديلات',
            avgEditTime: 'متوسط وقت التعديل',
            topSections: 'الأقسام الأكثر تعديلاً'
        },
        en: {
            title: 'Improve Medical AI',
            subtitle: 'Help us enhance system accuracy',
            description: 'We would like to collect anonymous data about your edits to AI-generated reports to improve our algorithms.',
            whatWeCollect: 'What we collect:',
            collectItems: [
                'Transcribed text (after removing personal information)',
                'AI-generated medical report',
                'Your final edits and corrections',
                'Template type used (SOAP, Consultation, etc.)',
                'Language used (Arabic/English)'
            ],
            whatWeDoNot: 'What we DO NOT collect:',
            doNotCollectItems: [
                'Patient names or any personal information',
                'ID numbers or medical record numbers',
                'Contact information',
                'Hospital or clinic names'
            ],
            benefits: 'Benefits:',
            benefitItems: [
                'Improve medical AI accuracy',
                'Reduce errors in future reports',
                'Customize system for local medical practice',
                'Contribute to scientific advancement'
            ],
            privacy: 'Privacy & Security:',
            privacyItems: [
                'All data is anonymized and encrypted',
                'Data cannot be traced back to you',
                'Can opt out at any time',
                'Compliant with medical data protection standards'
            ],
            enableTracking: 'Enable Improvement Tracking',
            disableTracking: 'Disable Improvement Tracking',
            consentGiven: 'Consent given',
            consentNotGiven: 'Consent not given',
            showMore: 'Show details',
            showLess: 'Hide details',
            statsTitle: 'Contribution Statistics',
            totalGenerations: 'Total Reports Generated',
            totalEdits: 'Total Edits Made',
            avgEditTime: 'Average Edit Time',
            topSections: 'Most Edited Sections'
        }
    };

    const t = texts[language];

    useEffect(() => {
        if (config.consentGiven) {
            loadStats();
        }
    }, [config.consentGiven]);

    const loadStats = async () => {
        try {
            const statsData = await getStats();
            setStats(statsData);
        } catch (error) {
            console.warn('Failed to load stats:', error);
        }
    };

    const handleConsentToggle = () => {
        const newConsent = !config.consentGiven;
        updateConsent(newConsent);
        onConsentChange?.(newConsent);
    };

    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${isArabic ? 'text-right' : 'text-left'}`}>
            {/* Header */}
            <div className={`flex items-center gap-3 mb-4 ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
                    <p className="text-sm text-gray-600">{t.subtitle}</p>
                </div>
                <div className={`flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className={`text-xs px-2 py-1 rounded-full ${config.consentGiven
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                        {config.consentGiven ? t.consentGiven : t.consentNotGiven}
                    </span>
                </div>
            </div>

            {/* Description */}
            <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                    {t.description}
                </p>
            </div>

            {/* Toggle Button */}
            <div className={`flex items-center justify-between mb-4 ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                <button
                    onClick={handleConsentToggle}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${config.consentGiven
                            ? 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100'
                            : 'bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-100'
                        } ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}
                >
                    <div className="relative">
                        {config.consentGiven ? (
                            <Eye className="h-5 w-5" />
                        ) : (
                            <EyeOff className="h-5 w-5" />
                        )}
                    </div>
                    <span>
                        {config.consentGiven ? t.disableTracking : t.enableTracking}
                    </span>
                </button>

                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors ${isArabic ? 'flex-row-reverse' : 'flex-row'
                        }`}
                >
                    <Info className="h-4 w-4" />
                    <span className="text-sm">
                        {showDetails ? t.showLess : t.showMore}
                    </span>
                </button>
            </div>

            {/* Detailed Information */}
            {showDetails && (
                <div className="space-y-6 border-t border-gray-100 pt-6">
                    {/* What we collect */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Database className="h-4 w-4 text-green-600" />
                            {t.whatWeCollect}
                        </h4>
                        <ul className="space-y-1">
                            {t.collectItems.map((item, index) => (
                                <li key={index} className={`text-sm text-gray-600 ${isArabic ? 'pr-6' : 'pl-6'}`}>
                                    <span className={`inline-block w-2 h-2 bg-green-400 rounded-full ${isArabic ? 'ml-2' : 'mr-2'}`}></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* What we don't collect */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-red-600" />
                            {t.whatWeDoNot}
                        </h4>
                        <ul className="space-y-1">
                            {t.doNotCollectItems.map((item, index) => (
                                <li key={index} className={`text-sm text-gray-600 ${isArabic ? 'pr-6' : 'pl-6'}`}>
                                    <span className={`inline-block w-2 h-2 bg-red-400 rounded-full ${isArabic ? 'ml-2' : 'mr-2'}`}></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Benefits */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                            {t.benefits}
                        </h4>
                        <ul className="space-y-1">
                            {t.benefitItems.map((item, index) => (
                                <li key={index} className={`text-sm text-gray-600 ${isArabic ? 'pr-6' : 'pl-6'}`}>
                                    <span className={`inline-block w-2 h-2 bg-blue-400 rounded-full ${isArabic ? 'ml-2' : 'mr-2'}`}></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Privacy */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Settings className="h-4 w-4 text-purple-600" />
                            {t.privacy}
                        </h4>
                        <ul className="space-y-1">
                            {t.privacyItems.map((item, index) => (
                                <li key={index} className={`text-sm text-gray-600 ${isArabic ? 'pr-6' : 'pl-6'}`}>
                                    <span className={`inline-block w-2 h-2 bg-purple-400 rounded-full ${isArabic ? 'ml-2' : 'mr-2'}`}></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Statistics (only if consent given) */}
            {config.consentGiven && stats && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        {t.statsTitle}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.totalGenerations}</div>
                            <div className="text-xs text-gray-600">{t.totalGenerations}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.totalEdits}</div>
                            <div className="text-xs text-gray-600">{t.totalEdits}</div>
                        </div>
                    </div>
                    {stats.averageEditTime > 0 && (
                        <div className="mt-3 text-center">
                            <div className="text-lg font-semibold text-purple-600">{stats.averageEditTime}s</div>
                            <div className="text-xs text-gray-600">{t.avgEditTime}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
