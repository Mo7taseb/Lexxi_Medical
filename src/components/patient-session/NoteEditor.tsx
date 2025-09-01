'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Edit,
  Save,
  X,
  Trash2,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Tag,
  Lightbulb,
  Settings,
  FileText
} from 'lucide-react';
import { NoteEditorProps, SessionNote, NoteType, NotePriority, CustomTemplate } from './types';
import { sessionLanguageTexts } from './constants';
import { useSession } from './SessionContext';
import TemplateManager from './TemplateManager';

const NoteEditor: React.FC<NoteEditorProps> = ({
  session,
  onUpdateSession,
  language,
  className = ''
}) => {
  const { addNote, updateNote, deleteNote } = useSession();
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({
    content: '',
    type: 'general' as NoteType,
    priority: 'medium' as NotePriority,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [allTemplates, setAllTemplates] = useState<CustomTemplate[]>([]);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [isHoveringScroll, setIsHoveringScroll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = sessionLanguageTexts[language];

  // Load all templates (system + custom)
  useEffect(() => {
    const loadTemplates = () => {
      try {
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

        // Load custom templates
        const savedTemplates = localStorage.getItem('lexxi-custom-templates');
        const customTemplates = savedTemplates ? JSON.parse(savedTemplates) : [];

        setAllTemplates([...defaultTemplates, ...customTemplates]);
      } catch (error) {
        console.error('Error loading templates:', error);
        setAllTemplates([]);
      }
    };

    loadTemplates();
  }, [language]);

  // Add wheel event listener to prevent page scroll when over templates
  useEffect(() => {
    const handleWheelCapture = (e: WheelEvent) => {
      if (scrollContainerRef.current && !showAllTemplates && isHoveringScroll) {
        const container = scrollContainerRef.current;
        const rect = container.getBoundingClientRect();
        const isOverContainer = e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom;

        if (isOverContainer) {
          e.preventDefault();
          e.stopPropagation();

          // Calculate template card width + gap for precise scrolling
          // Template cards are min-w-[240px] max-w-[260px] with gap-4 (16px)
          const templateWidth = 260 + 16; // card width + gap
          
          // Determine scroll direction and amount (one template per scroll)
          const scrollDirection = e.deltaY > 0 ? 1 : -1;
          const scrollAmount = templateWidth * scrollDirection;
          
          container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
          });
        }
      }
    };

    // Add listener with capture: true to intercept early
    document.addEventListener('wheel', handleWheelCapture, { passive: false, capture: true });

    return () => {
      document.removeEventListener('wheel', handleWheelCapture, { capture: true });
    };
  }, [showAllTemplates, isHoveringScroll]);

  const handleTemplateRefresh = () => {
    // Reload templates when template manager closes
    const loadTemplates = () => {
      try {
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

        const savedTemplates = localStorage.getItem('lexxi-custom-templates');
        const customTemplates = savedTemplates ? JSON.parse(savedTemplates) : [];

        setAllTemplates([...defaultTemplates, ...customTemplates]);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    loadTemplates();
  };

  // Scroll functions for desktop
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      // Template card width + gap for precise scrolling
      const templateWidth = 260 + 16; // card width + gap
      scrollContainerRef.current.scrollBy({ left: -templateWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      // Template card width + gap for precise scrolling
      const templateWidth = 260 + 16; // card width + gap
      scrollContainerRef.current.scrollBy({ left: templateWidth, behavior: 'smooth' });
    }
  };

  // Handle wheel scrolling on desktop
  const handleWheel = (e: React.WheelEvent) => {
    // This is now handled by the document event listener for better control
    // Keeping this as a fallback
    if (scrollContainerRef.current && !showAllTemplates) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Enhanced mouse enter/leave for better UX
  const handleMouseEnter = () => {
    if (!showAllTemplates) {
      setIsHoveringScroll(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHoveringScroll(false);
  };

  const handleAddNote = () => {
    if (!newNote.content.trim()) return;

    addNote(session.id, {
      content: newNote.content.trim(),
      type: newNote.type,
      priority: newNote.priority,
      tags: newNote.tags
    });

    setNewNote({
      content: '',
      type: 'general',
      priority: 'medium',
      tags: []
    });
    setIsAddingNote(false);
  };

  const handleEditNote = (note: SessionNote) => {
    setEditingNoteId(note.id);
    setNewNote({
      content: note.content,
      type: note.type,
      priority: note.priority,
      tags: note.tags || []
    });
  };

  const handleSaveEdit = () => {
    if (!editingNoteId || !newNote.content.trim()) return;

    updateNote(session.id, editingNoteId, {
      content: newNote.content.trim(),
      type: newNote.type,
      priority: newNote.priority,
      tags: newNote.tags
    });

    setEditingNoteId(null);
    setNewNote({
      content: '',
      type: 'general',
      priority: 'medium',
      tags: []
    });
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setIsAddingNote(false);
    setNewNote({
      content: '',
      type: 'general',
      priority: 'medium',
      tags: []
    });
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الملاحظة؟' : 'Are you sure you want to delete this note?')) {
      deleteNote(session.id, noteId);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !newNote.tags.includes(newTag.trim())) {
      setNewNote(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleTemplateSelect = (template: CustomTemplate) => {
    setNewNote(prev => ({
      ...prev,
      content: template.content,
      type: template.type
    }));
    setShowTemplateManager(false);
  };

  const toggleNoteExpansion = (noteId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority: NotePriority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: NoteType) => {
    switch (type) {
      case 'observation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'diagnosis':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'plan':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'general':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric'
      }) + ' ' + date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className={`text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 flex-shrink-0 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
          <span className="whitespace-nowrap min-w-0">{t.sessionNotes}</span>
        </h3>
        {!isAddingNote && !editingNoteId && (
          <button
            onClick={() => setIsAddingNote(true)}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm flex-shrink-0 min-w-[120px] sm:min-w-[140px] max-w-full text-center break-words"
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap text-sm sm:text-base">{t.addNote}</span>
          </button>
        )}
      </div>

      {/* Templates Section */}
      {isAddingNote && !editingNoteId && (
        <div className="mb-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className={`flex items-center justify-between mb-4 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <h4 className="font-bold text-gray-800 text-base sm:text-lg">{t.templates}</h4>
            </div>
            <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              {allTemplates.length > 8 && (
                <button
                  onClick={() => setShowAllTemplates(!showAllTemplates)}
                  className={`text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all duration-200 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {showAllTemplates ? (language === 'ar' ? 'عرض أقل' : 'Show Less') : (language === 'ar' ? 'عرض الكل' : 'Show All')}
                  <div className={`transform transition-transform duration-200 ${showAllTemplates ? 'rotate-180' : 'rotate-0'}`}>
                    ▼
                  </div>
                </button>
              )}
              <button
                onClick={() => {
                  setShowTemplateManager(true);
                }}
                className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Plus className="h-4 w-4" />
                {language === 'ar' ? 'إنشاء قالب' : 'Create Template'}
              </button>
            </div>
          </div>

          {/* Templates Horizontal Scroll Container */}
          <div className="relative px-1 py-2">
            {/* Desktop Scroll Buttons */}
            {!showAllTemplates && allTemplates.length > 4 && (
              <>
                <button
                  onClick={scrollLeft}
                  className={`absolute ${language === 'ar' ? 'right-2' : 'left-2'} top-1/2 transform -translate-y-1/2 z-20 
                    bg-white/70 hover:bg-white border border-gray-200/50 hover:border-gray-300 rounded-full p-2 shadow-sm hover:shadow-lg 
                    transition-all duration-300 hover:scale-110 opacity-30 hover:opacity-100 hidden md:flex items-center justify-center
                    backdrop-blur-sm`}
                  title={language === 'ar' ? 'السابق' : 'Previous'}
                >
                  <div className={`transform text-gray-600 hover:text-blue-600 transition-colors ${language === 'ar' ? 'rotate-180' : ''}`}>
                    ◀
                  </div>
                </button>
                <button
                  onClick={scrollRight}
                  className={`absolute ${language === 'ar' ? 'left-2' : 'right-2'} top-1/2 transform -translate-y-1/2 z-20 
                    bg-white/70 hover:bg-white border border-gray-200/50 hover:border-gray-300 rounded-full p-2 shadow-sm hover:shadow-lg 
                    transition-all duration-300 hover:scale-110 opacity-30 hover:opacity-100 hidden md:flex items-center justify-center
                    backdrop-blur-sm`}
                  title={language === 'ar' ? 'التالي' : 'Next'}
                >
                  <div className={`transform text-gray-600 hover:text-blue-600 transition-colors ${language === 'ar' ? 'rotate-180' : ''}`}>
                    ▶
                  </div>
                </button>
              </>
            )}

            <div
              ref={scrollContainerRef}
              onWheel={handleWheel}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={`flex gap-4 py-3 px-2 transition-all duration-300 ease-in-out horizontal-scroll ${showAllTemplates
                ? 'flex-wrap'
                : 'overflow-x-auto scrollbar-hide'
                } ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'} 
              relative`}
            >
              {(showAllTemplates ? allTemplates : allTemplates.slice(0, 8)).map((template, index) => (
                <div
                  key={template.id}
                  className={`${showAllTemplates ? 'w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] xl:w-[calc(25%-12px)] m-1' : 'min-w-[240px] max-w-[260px] flex-shrink-0 m-1'} 
                    bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-3 cursor-pointer 
                    transition-all duration-300 transform hover:scale-101 hover:shadow-xl hover:z-10 group relative
                    ${template.category === 'system'
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 hover:border-green-300'
                      : 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300'
                    }
                    shadow-sm hover:shadow-2xl`}
                  onClick={() => {
                    setNewNote(prev => ({
                      ...prev,
                      content: template.content,
                      type: template.type
                    }));
                  }}
                >
                  {/* Template Header */}
                  <div className={`flex items-start justify-between mb-2 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-1 min-w-0 pr-2">
                      <h5 className={`font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-800 transition-colors leading-tight ${language === 'ar' ? 'text-right pr-0 pl-2' : 'text-left'}`}>
                        {template.title}
                      </h5>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${template.category === 'system'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}>
                        {template.category === 'system' ? (language === 'ar' ? 'نظام' : 'System') : (language === 'ar' ? 'مخصص' : 'Custom')}
                      </span>
                    </div>
                  </div>

                  {/* Template Type Badge */}
                  <div className="mb-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${template.type === 'observation' ? 'bg-purple-100 text-purple-700' :
                      template.type === 'diagnosis' ? 'bg-green-100 text-green-700' :
                        template.type === 'plan' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {t[template.type]}
                    </span>
                  </div>

                  {/* Template Content Preview */}
                  <div className="mb-2">
                    <p className={`text-xs text-gray-600 line-clamp-2 leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {template.content.replace(/\n/g, ' ').substring(0, 80)}...
                    </p>
                  </div>

                  {/* Template Tags */}
                  {template.tags && template.tags.length > 0 && (
                    <div className={`flex flex-wrap gap-1 mb-2 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {template.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span key={tagIndex} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 2 && (
                        <span className="text-gray-500 text-xs">
                          +{template.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Use Button */}
                  <div className={`flex items-center justify-between ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`text-xs text-gray-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {template.usageCount !== undefined && (
                        <span>{template.usageCount} {language === 'ar' ? 'استخدام' : 'uses'}</span>
                      )}
                    </div>
                    <div className={`bg-gradient-to-r ${template.category === 'system'
                      ? 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      } text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 
                    transform group-hover:scale-101 shadow-sm hover:shadow-md flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <FileText className="h-3 w-3" />
                      {language === 'ar' ? 'استخدم' : 'Use'}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Template Card */}
              <div
                className={`${showAllTemplates ? 'w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] xl:w-[calc(25%-12px)] m-1' : 'min-w-[240px] max-w-[260px] flex-shrink-0 m-1'} 
                  bg-gradient-to-br from-gray-50 to-gray-100 border border-dashed border-gray-300 
                  hover:border-indigo-400 hover:from-indigo-50 hover:to-purple-50 rounded-xl p-3 cursor-pointer 
                  transition-all duration-300 transform hover:scale-101 hover:shadow-xl hover:z-10 group flex flex-col items-center justify-center text-center
                  shadow-sm hover:shadow-2xl relative`}
                onClick={() => setShowTemplateManager(true)}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 group-hover:from-indigo-200 group-hover:to-purple-200 rounded-full flex items-center justify-center mb-2 transition-colors">
                  <Plus className="h-4 w-4 text-indigo-600 group-hover:text-indigo-700" />
                </div>
                <h5 className="font-semibold text-gray-700 group-hover:text-indigo-700 text-sm mb-1 transition-colors">
                  {language === 'ar' ? 'إنشاء قالب' : 'Create Template'}
                </h5>
                <p className="text-xs text-gray-500 group-hover:text-indigo-600 transition-colors leading-tight">
                  {language === 'ar' ? 'اضغط للإنشاء' : 'Click to create'}
                </p>
              </div>
            </div>

            {/* Enhanced Scroll Indicators */}
            {!showAllTemplates && allTemplates.length > 4 && (
              <>
                {/* Subtle fade effect at edges */}
                <div className={`absolute top-0 bottom-0 w-8 bg-gradient-to-r ${language === 'ar' ? 'from-transparent to-blue-50/50' : 'from-blue-50/50 to-transparent'} pointer-events-none z-5 ${language === 'ar' ? 'left-0' : 'right-0'} transition-opacity duration-300 ${isHoveringScroll ? 'opacity-100' : 'opacity-60'}`}></div>
              </>
            )}
          </div>

          {/* Quick Stats */}
          <div className={`mt-4 pt-3 border-t border-blue-200 flex items-center justify-between text-xs text-blue-600 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <span>
              {allTemplates.length} {language === 'ar' ? 'قالب متاح' : 'templates available'}
            </span>
            <div className={`flex items-center gap-4 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="hidden md:block">
                {language === 'ar' ? 'استخدم عجلة الماوس أو الأزرار للتمرير' : 'Use mouse wheel or buttons to scroll'}
              </span>
              <span className="md:hidden">
                {language === 'ar' ? 'مرر أفقياً لعرض المزيد' : 'Swipe horizontally for more'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Note Form */}
      {(isAddingNote || editingNoteId) && (
        <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 border border-gray-200 shadow-sm overflow-hidden">
          <div className="space-y-4">
            {/* Note Type and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className={language === 'ar' ? 'order-2 sm:order-1' : ''}>
                <label className={`block text-sm font-semibold text-gray-700 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t.noteType}
                </label>
                <select
                  value={newNote.type}
                  onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value as NoteType }))}
                  className="placeholder-gray-600 text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="general">{t.general}</option>
                  <option value="observation">{t.observation}</option>
                  <option value="diagnosis">{t.diagnosis}</option>
                  <option value="plan">{t.plan}</option>
                </select>
              </div>

              <div className={language === 'ar' ? 'order-1 sm:order-2' : ''}>
                <label className={`block text-sm font-semibold text-gray-700 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t.priority}
                </label>
                <select
                  value={newNote.priority}
                  onChange={(e) => setNewNote(prev => ({ ...prev, priority: e.target.value as NotePriority }))}
                  className="placeholder-gray-600 text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="low">{t.low}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="high">{t.high}</option>
                </select>
              </div>
            </div>

            {/* Note Content */}
            <div>
              <label className={`block text-sm font-semibold text-gray-700 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t.noteContent}
              </label>
              <textarea
                ref={textareaRef}
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none placeholder-gray-600 text-gray-900"
                placeholder={language === 'ar' ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
              />
            </div>

            {/* Tags */}
            <div>
              <label className={`block text-sm font-semibold text-gray-700 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t.tags}
              </label>
              <div className={`flex flex-wrap gap-2 mb-2 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                {newNote.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-200 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className={`flex gap-2 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm placeholder-gray-600 text-gray-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder={language === 'ar' ? 'إضافة علامة' : 'Add tag'}
                />
                <button
                  onClick={addTag}
                  className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
              <button
                onClick={editingNoteId ? handleSaveEdit : handleAddNote}
                disabled={!newNote.content.trim()}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Save className="h-4 w-4" />
                <span className="whitespace-nowrap">{editingNoteId ? t.saveNote : t.addNote}</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <X className="h-4 w-4" />
                <span className="whitespace-nowrap">{t.cancel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4 relative">
        {session.notes.length === 0 ? (
          <div className="text-center py-6 sm:py-8 bg-white rounded-xl border border-gray-200">
            <Edit className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mx-auto mb-2 sm:mb-3" />
            <h4 className="text-sm sm:text-base font-medium text-gray-600 mb-1">
              {t.noNotes}
            </h4>
            <p className="text-gray-500 text-xs sm:text-sm">
              {t.addFirstNote}
            </p>
          </div>
        ) : (
          session.notes
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                {/* Note Header */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                  {/* Left side - Action buttons with better spacing */}
                  <div className={`flex items-center gap-3 flex-shrink-0 self-start ${language === 'ar' ? 'order-last sm:order-first' : 'order-first sm:order-last'}`}>
                    <button
                      onClick={() => toggleNoteExpansion(note.id)}
                      className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-transparent hover:border-gray-200 bg-gray-50"
                      title={expandedNotes.has(note.id) ? (language === 'ar' ? 'طي' : 'Collapse') : (language === 'ar' ? 'توسيع' : 'Expand')}
                    >
                      {expandedNotes.has(note.id) ? (
                        <EyeOff className="h-5 w-5 text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-2.5 hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-blue-200 bg-blue-50"
                      title={t.editNote}
                    >
                      <Edit className="h-5 w-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2.5 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-red-200 bg-red-50"
                      title={t.deleteNote}
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  </div>

                  {/* Center - Tags and timestamp with better alignment */}
                  <div className={`flex flex-col gap-3 flex-1 min-w-0 ${language === 'ar' ? 'items-end' : 'items-start'}`}>
                    {/* Tags row */}
                    <div className={`flex items-center gap-3 flex-wrap ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                      <span className={`px-4 py-2 text-sm font-medium rounded-full border ${getTypeColor(note.type)} whitespace-nowrap flex-shrink-0`}>
                        {t[note.type]}
                      </span>
                      <span className={`px-4 py-2 text-sm font-medium rounded-full border ${getPriorityColor(note.priority)} whitespace-nowrap flex-shrink-0`}>
                        {t[note.priority]}
                      </span>
                    </div>
                    {/* Timestamp row - centered below tags */}
                    <div className={`flex items-center justify-center gap-2 text-sm text-gray-500 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap font-medium">{formatDateTime(note.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Note Content */}
                <div className={`mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                    {expandedNotes.has(note.id) || note.content.length <= 100
                      ? note.content
                      : truncateText(note.content, 100)
                    }
                  </p>
                  {note.content.length > 100 && !expandedNotes.has(note.id) && (
                    <button
                      onClick={() => toggleNoteExpansion(note.id)}
                      className={`text-blue-600 hover:text-blue-800 text-sm font-medium mt-3 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors duration-200 ${language === 'ar' ? 'block w-full text-right' : 'block w-full text-left'}`}
                    >
                      {language === 'ar' ? 'اقرأ المزيد' : 'Read more'}
                    </button>
                  )}
                </div>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mt-3 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs border border-gray-200 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <Tag className="h-3 w-3" />
                        <span className="whitespace-nowrap">{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
        )}
      </div>

      {/* Template Manager Modal */}
      <TemplateManager
        isOpen={showTemplateManager}
        onClose={() => {
          setShowTemplateManager(false);
          handleTemplateRefresh();
        }}
        language={language}
        onTemplateSelect={handleTemplateSelect}
      />
    </div>
  );
};

export default NoteEditor;
