'use client';

import React, { useState, useRef } from 'react';
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
  Lightbulb
} from 'lucide-react';
import { NoteEditorProps, SessionNote, NoteType, NotePriority } from './types';
import { sessionLanguageTexts } from './constants';
import { useSession } from './SessionContext';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = sessionLanguageTexts[language];

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

  // Quick note templates
  const quickTemplates = [
    {
      title: language === 'ar' ? 'فحص سريري' : 'Physical Examination',
      content: language === 'ar'
        ? 'الفحص السريري:\n- العلامات الحيوية: \n- الفحص العام: \n- الفحص الموضعي: '
        : 'Physical Examination:\n- Vital signs: \n- General examination: \n- Local examination: ',
      type: 'observation' as NoteType
    },
    {
      title: language === 'ar' ? 'خطة العلاج' : 'Treatment Plan',
      content: language === 'ar'
        ? 'خطة العلاج:\n- الأدوية: \n- التعليمات: \n- المتابعة: '
        : 'Treatment Plan:\n- Medications: \n- Instructions: \n- Follow-up: ',
      type: 'plan' as NoteType
    },
    {
      title: language === 'ar' ? 'تشخيص أولي' : 'Preliminary Diagnosis',
      content: language === 'ar'
        ? 'التشخيص الأولي:\n- التشخيص المحتمل: \n- التشخيص التفريقي: \n- الفحوصات المطلوبة: '
        : 'Preliminary Diagnosis:\n- Probable diagnosis: \n- Differential diagnosis: \n- Required tests: ',
      type: 'diagnosis' as NoteType
    }
  ];

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 overflow-x-hidden ${className}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <Edit className="h-6 w-6 text-blue-600" />
          {t.sessionNotes}
        </h3>
        {!isAddingNote && !editingNoteId && (
          <button
            onClick={() => setIsAddingNote(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t.addNote}
          </button>
        )}
      </div>

      {/* Quick Templates */}
      {isAddingNote && !editingNoteId && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800">{t.templates}</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => setNewNote(prev => ({
                  ...prev,
                  content: template.content,
                  type: template.type
                }))}
                className="text-left p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all duration-200"
              >
                <div className="font-medium text-blue-800 text-sm">{template.title}</div>
                <div className="text-xs text-blue-600 mt-1">{t.useTemplate}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Note Form */}
      {(isAddingNote || editingNoteId) && (
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm overflow-hidden">
          <div className="space-y-4">
            {/* Note Type and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.tags}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newNote.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-200"
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm placeholder-gray-600 text-gray-900"
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
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={editingNoteId ? handleSaveEdit : handleAddNote}
                disabled={!newNote.content.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 w-full sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {editingNoteId ? t.saveNote : t.addNote}
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2 w-full sm:w-auto"
              >
                <X className="h-4 w-4" />
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4 relative">
        {session.notes.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
            <Edit className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h4 className="text-base font-medium text-gray-600 mb-1">
              {t.noNotes}
            </h4>
            <p className="text-gray-500 text-sm">
              {t.addFirstNote}
            </p>
          </div>
        ) : (
          session.notes
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                {/* Note Header */}
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(note.type)}`}>
                        {t[note.type]}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(note.priority)}`}>
                        {t[note.priority]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="whitespace-nowrap">{formatDateTime(note.timestamp)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleNoteExpansion(note.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                      title={expandedNotes.has(note.id) ? (language === 'ar' ? 'طي' : 'Collapse') : (language === 'ar' ? 'توسيع' : 'Expand')}
                    >
                      {expandedNotes.has(note.id) ? (
                        <EyeOff className="h-4 w-4 text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                      title={t.editNote}
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                      title={t.deleteNote}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                <div className="mb-4">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                    {expandedNotes.has(note.id) || note.content.length <= 100
                      ? note.content
                      : truncateText(note.content, 100)
                    }
                  </p>
                  {note.content.length > 100 && !expandedNotes.has(note.id) && (
                    <button
                      onClick={() => toggleNoteExpansion(note.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                    >
                      {language === 'ar' ? 'اقرأ المزيد' : 'Read more'}
                    </button>
                  )}
                </div>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border border-gray-200"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
        )}
      </div>


    </div>
  );
};

export default NoteEditor;
