'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic,
  User,
  Clock,
  FileText,
  Play,
  Pause,
  Volume2,
  Eye,
  EyeOff,
  UserPlus,
  ArrowRight,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Music
} from 'lucide-react';
import { useSession } from './SessionContext';
import { PatientSession, PatientInfo } from './types';
import { STANDARD_INPUT_CLASSES } from '../../styles/inputStyles';

interface QuickRecordsManagerProps {
  language: 'ar' | 'en';
  onRecordSelect?: (session: PatientSession) => void;
  onAssignComplete?: (sessionId: string, patientInfo: PatientInfo) => void;
}

const QuickRecordsManager: React.FC<QuickRecordsManagerProps> = ({
  language,
  onRecordSelect,
  onAssignComplete
}) => {
  const {
    getQuickRecordSessions,
    assignQuickRecordToPatient,
    convertToFullSession,
    deleteSession,
    sessions
  } = useSession();

  const [quickRecords, setQuickRecords] = useState<PatientSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processed'>('all');

  // Form data for assigning to patient
  const [assignForm, setAssignForm] = useState({
    name: '',
    age: '',
    gender: '' as 'male' | 'female' | '',
    phoneNumber: '',
    chiefComplaint: ''
  });

  useEffect(() => {
    setQuickRecords(getQuickRecordSessions());
  }, [sessions, getQuickRecordSessions]);

  const formatDuration = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return language === 'ar' ? 'الآن' : 'now';
    if (diffInMinutes < 60) return language === 'ar' ? `${diffInMinutes} د` : `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return language === 'ar' ? `${Math.floor(diffInMinutes / 60)} س` : `${Math.floor(diffInMinutes / 60)}h`;
    return language === 'ar' ? `${Math.floor(diffInMinutes / 1440)} ي` : `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getStatusIcon = (session: PatientSession) => {
    const status = session.quickRecordMetadata?.processingStatus;

    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'transcribing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'generating':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleAssignToPatient = (sessionId: string) => {
    if (!assignForm.name.trim()) return;

    const patientInfo: Partial<PatientInfo> = {
      name: assignForm.name.trim(),
      age: assignForm.age ? Number(assignForm.age) : undefined,
      gender: assignForm.gender || undefined,
      phoneNumber: assignForm.phoneNumber.trim() || undefined,
      chiefComplaint: assignForm.chiefComplaint.trim() || undefined
    };

    assignQuickRecordToPatient(sessionId, patientInfo);
    setShowAssignModal(null);
    setAssignForm({ name: '', age: '', gender: '', phoneNumber: '', chiefComplaint: '' });

    if (onAssignComplete) {
      const session = quickRecords.find(r => r.id === sessionId);
      if (session) {
        onAssignComplete(sessionId, { ...session.patientInfo, ...patientInfo } as PatientInfo);
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedRecords.size === 0) return;

    const confirmMsg = language === 'ar'
      ? `هل تريد حذف ${selectedRecords.size} تسجيل؟`
      : `Delete ${selectedRecords.size} records?`;

    if (window.confirm(confirmMsg)) {
      selectedRecords.forEach(recordId => {
        deleteSession(recordId);
      });
      setSelectedRecords(new Set());
    }
  };

  const filteredRecords = quickRecords.filter(record => {
    const matchesSearch = record.patientInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.transcriptContent?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'pending' && record.canAssignToPatient) ||
      (filterStatus === 'processed' && !record.canAssignToPatient);

    return matchesSearch && matchesFilter;
  });

  const pendingCount = quickRecords.filter(r => r.canAssignToPatient).length;

  if (quickRecords.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center border border-gray-200">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {language === 'ar' ? 'لا توجد تسجيلات سريعة' : 'No Quick Records'}
        </h3>
        <p className="text-gray-600 text-sm">
          {language === 'ar'
            ? 'ستظهر التسجيلات السريعة هنا عند إنشائها'
            : 'Quick records will appear here when created'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {language === 'ar' ? '⚡ التسجيلات السريعة' : '⚡ Quick Records'}
              </h3>
              <p className="text-blue-100 text-sm">
                {language === 'ar'
                  ? `${quickRecords.length} تسجيل • ${pendingCount} في الانتظار`
                  : `${quickRecords.length} records • ${pendingCount} pending`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedRecords.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {language === 'ar' ? `حذف (${selectedRecords.size})` : `Delete (${selectedRecords.size})`}
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isExpanded ?
                (language === 'ar' ? 'إخفاء' : 'Collapse') :
                (language === 'ar' ? 'عرض' : 'Expand')
              }
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        {isExpanded && (
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={STANDARD_INPUT_CLASSES.search}
                placeholder={language === 'ar' ? 'البحث في التسجيلات...' : 'Search records...'}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className={STANDARD_INPUT_CLASSES.select}
            >
              <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
              <option value="pending">{language === 'ar' ? 'في الانتظار' : 'Pending'}</option>
              <option value="processed">{language === 'ar' ? 'تم المعالجة' : 'Processed'}</option>
            </select>
          </div>
        )}
      </div>

      {/* Records List */}
      {isExpanded && (
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {filteredRecords.map((record) => (
            <QuickRecordCard
              key={record.id}
              record={record}
              language={language}
              isSelected={selectedRecords.has(record.id)}
              onSelect={(id) => {
                const newSelected = new Set(selectedRecords);
                if (newSelected.has(id)) {
                  newSelected.delete(id);
                } else {
                  newSelected.add(id);
                }
                setSelectedRecords(newSelected);
              }}
              onAssign={() => setShowAssignModal(record.id)}
              onView={() => onRecordSelect?.(record)}
              formatDuration={formatDuration}
              getStatusIcon={getStatusIcon}
            />
          ))}
        </div>
      )}

      {/* Compact View */}
      {!isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {filteredRecords.slice(0, 3).map((record) => (
              <div key={record.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setIsExpanded(true)}>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(record)}
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {record.patientInfo.name.replace('🎙️ Quick Record - ', '')}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{formatDuration(record.createdAt)}</p>
              </div>
            ))}

            {filteredRecords.length > 3 && (
              <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setIsExpanded(true)}>
                <span className="text-sm">+{filteredRecords.length - 3} more</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <AssignmentModal
          recordId={showAssignModal}
          record={quickRecords.find(r => r.id === showAssignModal)}
          language={language}
          assignForm={assignForm}
          setAssignForm={setAssignForm}
          onAssign={handleAssignToPatient}
          onClose={() => setShowAssignModal(null)}
        />
      )}
    </div>
  );
};

// Quick Record Card Component
const QuickRecordCard: React.FC<{
  record: PatientSession;
  language: 'ar' | 'en';
  isSelected: boolean;
  onSelect: (id: string) => void;
  onAssign: () => void;
  onView: () => void;
  formatDuration: (date: string) => string;
  getStatusIcon: (session: PatientSession) => React.ReactNode;
}> = ({ record, language, isSelected, onSelect, onAssign, onView, formatDuration, getStatusIcon }) => {
  return (
    <div className={`border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
      }`}>
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(record.id)}
          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(record)}
            <h4 className="font-semibold text-gray-900 truncate">
              {record.patientInfo.name.replace('🎙️ Quick Record - ', '')}
            </h4>
            <span className="text-xs text-gray-500">
              {formatDuration(record.createdAt)}
            </span>
          </div>

          {record.transcriptContent && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {record.transcriptContent.slice(0, 100)}...
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {record.canAssignToPatient && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                {language === 'ar' ? 'في الانتظار' : 'Pending'}
              </span>
            )}

            {record.recordingCompleted && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                {language === 'ar' ? 'تم التسجيل' : 'Recorded'}
              </span>
            )}

            {record.transcriptGenerated && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {language === 'ar' ? 'تم التفريغ' : 'Transcribed'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={language === 'ar' ? 'عرض' : 'View'}
          >
            <Eye className="h-4 w-4" />
          </button>

          {record.canAssignToPatient && (
            <button
              onClick={onAssign}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title={language === 'ar' ? 'تعيين لمريض' : 'Assign to Patient'}
            >
              <UserPlus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Assignment Modal Component
const AssignmentModal: React.FC<{
  recordId: string;
  record?: PatientSession;
  language: 'ar' | 'en';
  assignForm: any;
  setAssignForm: (form: any) => void;
  onAssign: (recordId: string) => void;
  onClose: () => void;
}> = ({ recordId, record, language, assignForm, setAssignForm, onAssign, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            {language === 'ar' ? 'تعيين لمريض' : 'Assign to Patient'}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {language === 'ar' ? 'أدخل معلومات المريض' : 'Enter patient information'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={STANDARD_INPUT_CLASSES.label}>
              {language === 'ar' ? 'اسم المريض' : 'Patient Name'} *
            </label>
            <input
              type="text"
              value={assignForm.name}
              onChange={(e) => setAssignForm({ ...assignForm, name: e.target.value })}
              className={STANDARD_INPUT_CLASSES.base}
              placeholder={language === 'ar' ? 'أدخل اسم المريض' : 'Enter patient name'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={STANDARD_INPUT_CLASSES.label}>
                {language === 'ar' ? 'العمر' : 'Age'}
              </label>
              <input
                type="number"
                value={assignForm.age}
                onChange={(e) => setAssignForm({ ...assignForm, age: e.target.value })}
                className={STANDARD_INPUT_CLASSES.base}
                placeholder={language === 'ar' ? 'العمر' : 'Age'}
              />
            </div>

            <div>
              <label className={STANDARD_INPUT_CLASSES.label}>
                {language === 'ar' ? 'الجنس' : 'Gender'}
              </label>
              <select
                value={assignForm.gender}
                onChange={(e) => setAssignForm({ ...assignForm, gender: e.target.value })}
                className={STANDARD_INPUT_CLASSES.select}
              >
                <option value="">{language === 'ar' ? 'اختر' : 'Select'}</option>
                <option value="male">{language === 'ar' ? 'ذكر' : 'Male'}</option>
                <option value="female">{language === 'ar' ? 'أنثى' : 'Female'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className={STANDARD_INPUT_CLASSES.label}>
              {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <input
              type="tel"
              value={assignForm.phoneNumber}
              onChange={(e) => setAssignForm({ ...assignForm, phoneNumber: e.target.value })}
              className={STANDARD_INPUT_CLASSES.base}
              placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
            />
          </div>

          <div>
            <label className={STANDARD_INPUT_CLASSES.label}>
              {language === 'ar' ? 'الشكوى الرئيسية' : 'Chief Complaint'}
            </label>
            <textarea
              value={assignForm.chiefComplaint}
              onChange={(e) => setAssignForm({ ...assignForm, chiefComplaint: e.target.value })}
              rows={3}
              className={STANDARD_INPUT_CLASSES.textarea}
              placeholder={language === 'ar' ? 'وصف الشكوى' : 'Describe the complaint'}
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            onClick={() => onAssign(recordId)}
            disabled={!assignForm.name.trim()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {language === 'ar' ? 'تعيين المريض' : 'Assign Patient'}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickRecordsManager;
