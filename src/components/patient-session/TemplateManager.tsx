'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Plus,
    Edit3,
    Trash2,
    Save,
    FileText,
    Tag,
    Search,
    Grid,
    List,
    Copy,
    Check,
    Star,
    StarOff,
    Filter,
    ChevronDown,
    ChevronUp,
    AlertTriangle
} from 'lucide-react';
import { CustomTemplate, TemplateManagerProps, NoteType } from './types';
import { getSessionTexts } from './constants';

const TemplateManager: React.FC<TemplateManagerProps> = ({
    isOpen,
    onClose,
    language,
    onTemplateCreate,
    onTemplateSelect,
    editingTemplate: externalEditingTemplate,
    onTemplateUpdate
}) => {
    const [templates, setTemplates] = useState<CustomTemplate[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'system' | 'custom'>('all');
    const [selectedType, setSelectedType] = useState<'all' | NoteType>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

    const [newTemplate, setNewTemplate] = useState({
        title: '',
        content: '',
        type: 'general' as NoteType,
        description: '',
        tags: [] as string[],
        isPublic: false
    });

    const t = getSessionTexts(language);
    const direction = language === 'ar' ? 'rtl' : 'ltr';

    // Default system templates
    const defaultTemplates: CustomTemplate[] = [
        {
            id: 'sys-physical-exam',
            title: language === 'ar' ? 'فحص سريري شامل' : 'Comprehensive Physical Examination',
            content: language === 'ar'
                ? 'الفحص السريري:\n\nالعلامات الحيوية:\n- ضغط الدم: \n- النبض: \n- درجة الحرارة: \n- التنفس: \n\nالفحص العام:\n- الحالة العامة: \n- التغذية: \n- الوعي: \n\nالفحص الموضعي:\n- الرأس والرقبة: \n- الصدر: \n- البطن: \n- الأطراف: '
                : 'Physical Examination:\n\nVital Signs:\n- Blood pressure: \n- Pulse: \n- Temperature: \n- Respiratory rate: \n\nGeneral Examination:\n- General condition: \n- Nutrition: \n- Consciousness: \n\nLocal Examination:\n- Head and neck: \n- Chest: \n- Abdomen: \n- Extremities: ',
            type: 'observation',
            category: 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            description: language === 'ar' ? 'قالب شامل للفحص السريري' : 'Comprehensive physical examination template',
            tags: language === 'ar' ? ['فحص', 'سريري', 'عام'] : ['examination', 'physical', 'general'],
            usageCount: 0
        },
        {
            id: 'sys-treatment-plan',
            title: language === 'ar' ? 'خطة العلاج المفصلة' : 'Detailed Treatment Plan',
            content: language === 'ar'
                ? 'خطة العلاج:\n\nالأدوية:\n- الدواء الأول: \n- الجرعة: \n- مدة العلاج: \n\nالتعليمات:\n- تعليمات عامة: \n- احتياطات: \n- نصائح غذائية: \n\nالمتابعة:\n- موعد المراجعة: \n- الفحوصات المطلوبة: \n- علامات التحذير: '
                : 'Treatment Plan:\n\nMedications:\n- Primary medication: \n- Dosage: \n- Duration: \n\nInstructions:\n- General instructions: \n- Precautions: \n- Dietary advice: \n\nFollow-up:\n- Next appointment: \n- Required tests: \n- Warning signs: ',
            type: 'plan',
            category: 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            description: language === 'ar' ? 'قالب مفصل لخطة العلاج' : 'Detailed treatment plan template',
            tags: language === 'ar' ? ['علاج', 'خطة', 'أدوية'] : ['treatment', 'plan', 'medications'],
            usageCount: 0
        },
        {
            id: 'sys-diagnosis',
            title: language === 'ar' ? 'التشخيص والتقييم' : 'Diagnosis and Assessment',
            content: language === 'ar'
                ? 'التشخيص والتقييم:\n\nالتشخيص الأولي:\n- التشخيص المحتمل: \n- درجة الثقة: \n\nالتشخيص التفريقي:\n1. \n2. \n3. \n\nالفحوصات المطلوبة:\n- فحوصات مخبرية: \n- تصوير طبي: \n- استشارات: \n\nالتقييم:\n- شدة الحالة: \n- المضاعفات المحتملة: \n- التوقعات: '
                : 'Diagnosis and Assessment:\n\nPrimary Diagnosis:\n- Probable diagnosis: \n- Confidence level: \n\nDifferential Diagnosis:\n1. \n2. \n3. \n\nRequired Investigations:\n- Laboratory tests: \n- Imaging: \n- Consultations: \n\nAssessment:\n- Severity: \n- Potential complications: \n- Prognosis: ',
            type: 'diagnosis',
            category: 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            description: language === 'ar' ? 'قالب للتشخيص والتقييم الطبي' : 'Medical diagnosis and assessment template',
            tags: language === 'ar' ? ['تشخيص', 'تقييم', 'طبي'] : ['diagnosis', 'assessment', 'medical'],
            usageCount: 0
        }
    ];

    // Load templates from localStorage
    useEffect(() => {
        if (isOpen) {
            try {
                const savedTemplates = localStorage.getItem('lexxi-custom-templates');
                if (savedTemplates) {
                    const parsed = JSON.parse(savedTemplates);
                    setTemplates([...defaultTemplates, ...parsed]);
                } else {
                    setTemplates(defaultTemplates);
                }
            } catch (error) {
                console.error('Error loading templates:', error);
                setTemplates(defaultTemplates);
            }
        }
    }, [language, isOpen]);

    // Handle external editing template
    useEffect(() => {
        if (externalEditingTemplate && isOpen) {
            setEditingTemplate(externalEditingTemplate);
            setIsCreating(false);
        }
    }, [externalEditingTemplate, isOpen]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent body scroll when modal is open
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen, onClose]);

    // Save templates to localStorage
    const saveTemplates = (newTemplates: CustomTemplate[]) => {
        try {
            const customTemplates = newTemplates.filter(t => t.category === 'custom');
            localStorage.setItem('lexxi-custom-templates', JSON.stringify(customTemplates));
            
            // Call the update callback to refresh parent component
            if (onTemplateUpdate) {
                onTemplateUpdate();
            }
        } catch (error) {
            console.error('Error saving templates:', error);
        }
    };

    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const handleCreateTemplate = () => {
        if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
            return;
        }

        const template: CustomTemplate = {
            id: generateId(),
            title: newTemplate.title.trim(),
            content: newTemplate.content.trim(),
            type: newTemplate.type,
            category: 'custom',
            description: newTemplate.description.trim(),
            tags: newTemplate.tags,
            isPublic: newTemplate.isPublic,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0
        };

        const updatedTemplates = [...templates, template];
        setTemplates(updatedTemplates);
        saveTemplates(updatedTemplates);

        // Reset form
        setNewTemplate({
            title: '',
            content: '',
            type: 'general',
            description: '',
            tags: [],
            isPublic: false
        });
        setIsCreating(false);

        if (onTemplateCreate) {
            onTemplateCreate(template);
        }
    };

    const handleEditTemplate = (template: CustomTemplate) => {
        setEditingTemplate(template);
        setNewTemplate({
            title: template.title,
            content: template.content,
            type: template.type,
            description: template.description || '',
            tags: template.tags || [],
            isPublic: template.isPublic || false
        });
    };

    const handleUpdateTemplate = () => {
        if (!editingTemplate || !newTemplate.title.trim() || !newTemplate.content.trim()) {
            return;
        }

        const updatedTemplate: CustomTemplate = {
            ...editingTemplate,
            title: newTemplate.title.trim(),
            content: newTemplate.content.trim(),
            type: newTemplate.type,
            description: newTemplate.description.trim(),
            tags: newTemplate.tags,
            isPublic: newTemplate.isPublic,
            updatedAt: new Date().toISOString()
        };

        const updatedTemplates = templates.map(t =>
            t.id === editingTemplate.id ? updatedTemplate : t
        );
        setTemplates(updatedTemplates);
        saveTemplates(updatedTemplates);

        setEditingTemplate(null);
        setNewTemplate({
            title: '',
            content: '',
            type: 'general',
            description: '',
            tags: [],
            isPublic: false
        });
    };

    const handleDeleteTemplate = (templateId: string) => {
        if (window.confirm(t.confirmDeleteTemplate)) {
            const updatedTemplates = templates.filter(t => t.id !== templateId);
            setTemplates(updatedTemplates);
            saveTemplates(updatedTemplates);
        }
    };

    const handleUseTemplate = (template: CustomTemplate) => {
        // Increment usage count
        const updatedTemplates = templates.map(t =>
            t.id === template.id ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t
        );
        setTemplates(updatedTemplates);
        saveTemplates(updatedTemplates);

        if (onTemplateSelect) {
            onTemplateSelect(template);
        }
        onClose();
    };

    const handleCopyTemplate = (template: CustomTemplate) => {
        navigator.clipboard.writeText(template.content);
        setCopiedTemplateId(template.id);
        setTimeout(() => setCopiedTemplateId(null), 2000);
    };

    const addTag = (tag: string) => {
        if (tag.trim() && !newTemplate.tags.includes(tag.trim())) {
            setNewTemplate(prev => ({
                ...prev,
                tags: [...prev.tags, tag.trim()]
            }));
        }
    };

    const removeTag = (tagToRemove: string) => {
        setNewTemplate(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        const matchesType = selectedType === 'all' || template.type === selectedType;

        return matchesSearch && matchesCategory && matchesType;
    });

    if (!isOpen) return null;

    const modalContent = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-7xl h-[95vh] sm:h-[90vh] overflow-hidden transform transition-all duration-300 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                dir={direction}
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: '#ffffff',
                    minHeight: '500px',
                    maxHeight: '95vh'
                }}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
                        <h2 className={`text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            <span className="hidden sm:inline">{t.manageTemplates}</span>
                            <span className="sm:hidden">{language === 'ar' ? 'القوالب' : 'Templates'}</span>
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0"
                            title={language === 'ar' ? 'إغلاق' : 'Close'}
                        >
                            <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Toolbar */}
                    <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                        <div className={`flex flex-col gap-3 sm:gap-4 ${language === 'ar' ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                                <input
                                    type="text"
                                    placeholder={language === 'ar' ? 'البحث...' : 'Search...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full ${language === 'ar' ? 'pr-9 pl-3 sm:pr-10 sm:pl-4' : 'pl-9 pr-3 sm:pl-10 sm:pr-4'} py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm sm:text-base`}
                                />
                            </div>

                            {/* Actions */}
                            <div className={`flex items-center gap-2 sm:gap-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <Filter className="h-4 w-4" />
                                    <span className="hidden sm:inline">{language === 'ar' ? 'فلترة' : 'Filter'}</span>
                                    {showFilters ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />}
                                </button>

                                <div className={`flex items-center border border-gray-300 rounded-lg ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 sm:p-2.5 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                                    >
                                        <Grid className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 sm:p-2.5 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setIsCreating(true)}
                                    className={`bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t.createTemplate}</span>
                                    <span className="sm:hidden">{language === 'ar' ? 'جديد' : 'New'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className={`mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 ${language === 'ar' ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                                    className="px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-sm sm:text-base"
                                >
                                    <option value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                                    <option value="system">{t.systemTemplates}</option>
                                    <option value="custom">{t.customTemplates}</option>
                                </select>

                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value as any)}
                                    className="px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-sm sm:text-base"
                                >
                                    <option value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
                                    <option value="observation">{t.observation}</option>
                                    <option value="diagnosis">{t.diagnosis}</option>
                                    <option value="plan">{t.plan}</option>
                                    <option value="general">{t.general}</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-white" style={{ minHeight: 0 }}>
                        {/* Create/Edit Form */}
                        {(isCreating || editingTemplate) && (
                            <div className="mb-6 sm:mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                                <h3 className={`text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2 sm:gap-3 ${language === 'ar' ? 'text-right flex-row-reverse' : 'text-left flex-row'}`}>
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                                    </div>
                                    {editingTemplate ? t.editTemplate : t.createTemplate}
                                </h3>

                                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                                    {/* Title and Type */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <label className={`block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                {t.templateTitle} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={newTemplate.title}
                                                onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white text-sm sm:text-base"
                                                placeholder={language === 'ar' ? 'عنوان القالب' : 'Template title'}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                {t.noteType}
                                            </label>
                                            <select
                                                value={newTemplate.type}
                                                onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value as NoteType }))}
                                                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-sm sm:text-base"
                                            >
                                                <option value="general">{t.general}</option>
                                                <option value="observation">{t.observation}</option>
                                                <option value="diagnosis">{t.diagnosis}</option>
                                                <option value="plan">{t.plan}</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className={`block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {t.templateDescription}
                                        </label>
                                        <input
                                            type="text"
                                            value={newTemplate.description}
                                            onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white text-sm sm:text-base"
                                            placeholder={language === 'ar' ? 'وصف مختصر' : 'Brief description'}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <label className={`block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {t.templateContent} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={newTemplate.content}
                                            onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                                            rows={4}
                                            className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-500 bg-white text-sm sm:text-base sm:rows-6"
                                            placeholder={language === 'ar' ? 'محتوى القالب...' : 'Template content...'}
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className={`block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {t.tags}
                                        </label>
                                        <div className={`flex flex-wrap gap-1.5 sm:gap-2 mb-2 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {newTemplate.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className={`bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
                                                >
                                                    {tag}
                                                    <button
                                                        onClick={() => removeTag(tag)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={language === 'ar' ? 'إضافة علامة + Enter' : 'Add tag + Enter'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white text-sm sm:text-base"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addTag(e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 pt-3 sm:pt-4 lg:pt-6 border-t border-blue-200 ${language === 'ar' ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
                                        <button
                                            onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                                            disabled={!newTemplate.title.trim() || !newTemplate.content.trim()}
                                            className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-101 disabled:transform-none text-sm sm:text-base ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                                            {t.saveTemplate}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsCreating(false);
                                                setEditingTemplate(null);
                                                setNewTemplate({
                                                    title: '',
                                                    content: '',
                                                    type: 'general',
                                                    description: '',
                                                    tags: [],
                                                    isPublic: false
                                                });
                                            }}
                                            className="bg-gray-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                                        >
                                            {t.cancel}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Templates Grid/List */}
                        {filteredTemplates.length === 0 ? (
                            <div className={`text-center py-16 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={direction}>
                                <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                    <FileText className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                                    {searchQuery ? (language === 'ar' ? 'لا توجد نتائج' : 'No results found') : t.noCustomTemplates}
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
                                    {searchQuery
                                        ? (language === 'ar' ? 'جرب البحث بكلمات مختلفة أو قم بتغيير الفلاتر' : 'Try searching with different keywords or adjust your filters')
                                        : (language === 'ar' ? 'قم بإنشاء قوالب مخصصة لتسريع عملية كتابة الملاحظات الطبية' : 'Create custom templates to speed up your medical note-taking process')
                                    }
                                </p>
                                {!searchQuery && (
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-101 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <Plus className="h-5 w-5" />
                                        {t.createTemplate}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6' : 'space-y-2 sm:space-y-3 lg:space-y-4'}>
                                {filteredTemplates.map((template) => (
                                    <div
                                        key={template.id}
                                        className={`bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-101 ${viewMode === 'grid' ? 'p-3 sm:p-4 lg:p-5' : 'p-3 sm:p-4 flex items-center gap-3 sm:gap-4'
                                            }`}
                                    >
                                        {viewMode === 'grid' ? (
                                            <>
                                                {/* Grid View */}
                                                <div className={`flex items-start justify-between mb-2 sm:mb-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-semibold text-gray-800 mb-1 truncate text-sm sm:text-base ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {template.title}
                                                        </h4>
                                                        {template.description && (
                                                            <p className={`text-xs sm:text-sm text-gray-600 line-clamp-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                {template.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className={`flex items-center gap-1 ml-2 ${language === 'ar' ? 'mr-2 ml-0' : ''}`}>
                                                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${template.category === 'system'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {template.category === 'system' ? (language === 'ar' ? 'نظام' : 'System') : (language === 'ar' ? 'مخصص' : 'Custom')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={`text-xs text-gray-500 mb-2 sm:mb-3 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                    <span className="capitalize">{template.type}</span>
                                                    {template.usageCount !== undefined && (
                                                        <span className={language === 'ar' ? 'mr-2 sm:mr-3' : 'ml-2 sm:ml-3'}>
                                                            {template.usageCount} {language === 'ar' ? 'استخدام' : 'uses'}
                                                        </span>
                                                    )}
                                                </div>

                                                {template.tags && template.tags.length > 0 && (
                                                    <div className={`flex flex-wrap gap-1 mb-2 sm:mb-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        {template.tags.slice(0, 3).map((tag, index) => (
                                                            <span key={index} className="bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {template.tags.length > 3 && (
                                                            <span className="text-gray-500 text-xs">
                                                                +{template.tags.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 ${language === 'ar' ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
                                                    <button
                                                        onClick={() => handleUseTemplate(template)}
                                                        className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 flex-1 justify-center shadow-md hover:shadow-lg transform hover:scale-101 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
                                                    >
                                                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        {t.useTemplate}
                                                    </button>

                                                    <div className={`flex items-center gap-1 justify-center sm:justify-start ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <button
                                                            onClick={() => handleCopyTemplate(template)}
                                                            className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title={language === 'ar' ? 'نسخ المحتوى' : 'Copy content'}
                                                        >
                                                            {copiedTemplateId === template.id ? (
                                                                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                                            ) : (
                                                                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            )}
                                                        </button>

                                                        {template.category === 'custom' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEditTemplate(template)}
                                                                    className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title={t.editTemplate}
                                                                >
                                                                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteTemplate(template.id)}
                                                                    className="p-1.5 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title={t.deleteTemplate}
                                                                >
                                                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* List View */}
                                                <div className="flex-1 min-w-0">
                                                    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 ${language === 'ar' ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
                                                        <h4 className={`font-semibold text-gray-800 truncate text-sm sm:text-base ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {template.title}
                                                        </h4>
                                                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium flex-shrink-0 self-start sm:self-center ${template.category === 'system'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {template.category === 'system' ? (language === 'ar' ? 'نظام' : 'System') : (language === 'ar' ? 'مخصص' : 'Custom')}
                                                        </span>
                                                    </div>
                                                    {template.description && (
                                                        <p className={`text-xs sm:text-sm text-gray-600 line-clamp-1 mb-1 sm:mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {template.description}
                                                        </p>
                                                    )}
                                                    <div className={`text-xs text-gray-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <span className="capitalize">{template.type}</span>
                                                        {template.usageCount !== undefined && (
                                                            <span className={language === 'ar' ? 'mr-2 sm:mr-3' : 'ml-2 sm:ml-3'}>
                                                                {template.usageCount} {language === 'ar' ? 'استخدام' : 'uses'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0 ${language === 'ar' ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
                                                    <button
                                                        onClick={() => handleUseTemplate(template)}
                                                        className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 justify-center shadow-md hover:shadow-lg transform hover:scale-101 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
                                                    >
                                                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        {t.useTemplate}
                                                    </button>

                                                    <div className={`flex items-center gap-1 justify-center sm:justify-start ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <button
                                                            onClick={() => handleCopyTemplate(template)}
                                                            className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title={language === 'ar' ? 'نسخ المحتوى' : 'Copy content'}
                                                        >
                                                            {copiedTemplateId === template.id ? (
                                                                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                                            ) : (
                                                                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            )}
                                                        </button>

                                                        {template.category === 'custom' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEditTemplate(template)}
                                                                    className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title={t.editTemplate}
                                                                >
                                                                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteTemplate(template.id)}
                                                                    className="p-1.5 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title={t.deleteTemplate}
                                                                >
                                                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // Use portal to render modal at document root level
    return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default TemplateManager;
