'use client';

import React, { useState } from 'react';
import {
  User,
  Clock,
  FileText,
  Edit,
  Eye,
  EyeOff,
  Tag,
  Stethoscope,
  Heart,
  Pill,
  Phone,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SessionSummaryProps } from './types';
import { sessionLanguageTexts } from './constants';

const SessionSummary: React.FC<SessionSummaryProps> = ({
  session,
  language,
  onEdit,
  onContinue
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const t = sessionLanguageTexts[language];

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getPriorityColor = (priority: string) => {
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

  const getTypeColor = (type: string) => {
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

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              {session.patientInfo.name}
            </h3>
            <p className="text-sm text-blue-600">
              {language === 'ar' ? 'جلسة نشطة' : 'Active Session'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200"
            title={isExpanded ? (language === 'ar' ? 'طي' : 'Collapse') : (language === 'ar' ? 'توسيع' : 'Expand')}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-blue-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-blue-600" />
            )}
          </button>
          <button
            onClick={onEdit}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200"
            title={t.editSession}
          >
            <Edit className="h-5 w-5 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">{t.chiefComplaint}:</span>
        </div>
        <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-blue-100">
          {session.patientInfo.chiefComplaint}
        </p>
      </div>

      {/* Notes Summary */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{t.sessionNotes}:</span>
          </div>
          <span className="text-sm text-blue-600 font-medium">
            {session.notes.length} {language === 'ar' ? 'ملاحظة' : 'notes'}
          </span>
        </div>

        {session.notes.length > 0 ? (
          <div className="space-y-2">
            {session.notes.slice(0, isExpanded ? session.notes.length : 2).map((note) => (
              <div key={note.id} className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getTypeColor(note.type)}`}>
                      {t[note.type as keyof typeof t] || note.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(note.priority)}`}>
                      {t[note.priority as keyof typeof t] || note.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(note.timestamp)}
                    </span>
                    {note.content.length > 80 && (
                      <button
                        onClick={() => toggleNoteExpansion(note.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        {expandedNotes.has(note.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {expandedNotes.has(note.id) || note.content.length <= 80
                    ? note.content
                    : truncateText(note.content, 80)
                  }
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {!isExpanded && session.notes.length > 2 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
              >
                {language === 'ar'
                  ? `عرض ${session.notes.length - 2} ملاحظة إضافية`
                  : `Show ${session.notes.length - 2} more notes`
                }
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            {t.noNotes}
          </p>
        )}
      </div>

      {/* Expanded Patient Details */}
      {isExpanded && (
        <div className="space-y-4 bg-white rounded-lg p-4 border border-blue-100">
          <h4 className="font-semibold text-gray-800 mb-3">{t.patientInfo}</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {session.patientInfo.age && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">{t.age}:</span>
                <span className="font-medium">{session.patientInfo.age}</span>
              </div>
            )}

            {session.patientInfo.gender && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">{t.gender}:</span>
                <span className="font-medium">
                  {t[session.patientInfo.gender as keyof typeof t] || session.patientInfo.gender}
                </span>
              </div>
            )}

            {session.patientInfo.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">{t.phoneNumber}:</span>
                <span className="font-medium">{session.patientInfo.phoneNumber}</span>
              </div>
            )}

            {session.patientInfo.medicalRecordNumber && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">{t.medicalRecordNumber}:</span>
                <span className="font-medium">{session.patientInfo.medicalRecordNumber}</span>
              </div>
            )}
          </div>

          {session.patientInfo.allergies && session.patientInfo.allergies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-600" />
                <span className="text-gray-600 font-medium">{t.allergies}:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {session.patientInfo.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm border border-red-200"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {session.patientInfo.medications && session.patientInfo.medications.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pill className="h-4 w-4 text-green-600" />
                <span className="text-gray-600 font-medium">{t.medications}:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {session.patientInfo.medications.map((medication, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm border border-green-200"
                  >
                    {medication}
                  </span>
                ))}
              </div>
            </div>
          )}

          {session.patientInfo.medicalHistory && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600 font-medium">{t.medicalHistory}:</span>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                {session.patientInfo.medicalHistory}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Stethoscope className="h-5 w-5" />
          {t.continueToRecording}
        </button>
      </div>
    </div>
  );
};

export default SessionSummary;
