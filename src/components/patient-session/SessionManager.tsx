'use client';

import React, { useState } from 'react';
import {
  User,
  Calendar,
  Phone,
  Heart,
  Pill,
  FileText,
  Stethoscope,
  Plus,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PatientFormData, SessionManagerProps } from './types';
import { useSession } from './SessionContext';
import { useLanguage } from '@/contexts/LanguageContext';

const SessionManager: React.FC<SessionManagerProps> = ({
  onSessionReady,
  currentStep,
  language
}) => {
  const { createNewSession, currentSession, sessions, deleteSession } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [sessionsExpanded, setSessionsExpanded] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    age: '',
    gender: '',
    medicalRecordNumber: '',
    phoneNumber: '',
    allergies: '',
    medications: '',
    medicalHistory: '',
    chiefComplaint: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<PatientFormData>>({});

  const { t, direction } = useLanguage();


  const validateForm = (): boolean => {
    const errors: Partial<PatientFormData> = {};

    if (!formData.name.trim()) {
      errors.name = t('required');
    }

    if (!formData.chiefComplaint.trim()) {
      errors.chiefComplaint = t('required');
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 0 || Number(formData.age) > 150)) {
      errors.age = language === 'ar' ? 'عمر غير صحيح' : 'Invalid age';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const patientInfo = {
      name: formData.name.trim(),
      age: formData.age ? Number(formData.age) : undefined,
      gender: formData.gender as 'male' | 'female' | undefined,
      medicalRecordNumber: formData.medicalRecordNumber.trim() || undefined,
      phoneNumber: formData.phoneNumber.trim() || undefined,
      allergies: formData.allergies.trim() ? formData.allergies.split(',').map(a => a.trim()) : [],
      medications: formData.medications.trim() ? formData.medications.split(',').map(m => m.trim()) : [],
      medicalHistory: formData.medicalHistory.trim() || undefined,
      chiefComplaint: formData.chiefComplaint.trim()
    };

    createNewSession(patientInfo);
    setShowForm(false);

    // Reset form
    setFormData({
      name: '',
      age: '',
      gender: '',
      medicalRecordNumber: '',
      phoneNumber: '',
      allergies: '',
      medications: '',
      medicalHistory: '',
      chiefComplaint: ''
    });
  };

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleContinueSession = () => {
    if (currentSession) {
      onSessionReady(currentSession);
    }
  };

  const getRecentSessions = () => {
    return sessions
      .filter(session => session.status === 'active' || session.status === 'paused')
      .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime());
  };

  if (currentStep !== 1) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto" dir={direction}>
      {/* Header */}
      <div className={`text-center mb-8 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <h2 className={`text-3xl font-bold text-gray-800 mb-4 ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
          {t('newSession')}
        </h2>
        <p className={`text-gray-600 text-lg leading-relaxed ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
          {language === 'ar'
            ? 'ابدأ جلسة جديدة مع المريض أو تابع جلسة سابقة'
            : 'Start a new patient session or continue a previous one'
          }
        </p>
      </div>

      {/* Current Session Status */}
      {currentSession && (
        <div className={`mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className={`flex items-center justify-between mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
              <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                <h3 className={`text-lg font-bold text-green-800 ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
                  {language === 'ar' ? 'جلسة نشطة' : 'Active Session'}
                </h3>
                <p className={`text-green-700 text-sm font-medium ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
                  {currentSession.patientInfo.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleContinueSession}
              className={`bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl ${language === 'ar' ? 'flex-row-reverse' : ''}`}
            >
              {t('continueToRecording')}
              <CheckCircle className="h-5 w-5" />
            </button>
          </div>

          <div className={`text-sm text-green-700 ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
            <span className="font-bold">{t('chiefComplaint')}:</span> {currentSession.patientInfo.chiefComplaint}
          </div>
          {currentSession.notes.length > 0 && (
            <div className={`text-sm text-green-700 mt-2 ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
              <span className="font-bold">{t('notesCount')}:</span> {currentSession.notes.length}
            </div>
          )}
        </div>
      )}

      {/* All Sessions List */}
      {getRecentSessions().length > 0 && (
        <div className="mb-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className={`flex items-center justify-between mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <h3 className={`text-xl font-bold text-gray-800 ${language === 'ar' ? 'font-cairo text-right' : 'font-inter text-left'}`}>
              {t('recentSessions')} <span className="text-blue-600 font-semibold">({getRecentSessions().length})</span>
            </h3>
            <button
              type="button"
              onClick={() => setSessionsExpanded(prev => !prev)}
              className={`px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
              aria-expanded={sessionsExpanded}
            >
              {sessionsExpanded ? (
                <>
                  {language === 'ar' ? 'إخفاء' : 'Collapse'}
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  {language === 'ar' ? 'عرض' : 'Expand'}
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {sessionsExpanded && (
            <div className="grid gap-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {getRecentSessions().map((session) => (
                <div
                  key={session.id}
                  className={`bg-white border rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group ${session.id === currentSession?.id ? 'border-blue-400 ring-2 ring-blue-200 shadow-lg' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => onSessionReady(session)}
                >
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
                    <div className={`flex items-start gap-3 min-w-0 flex-1 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${session.status === 'active' ? 'bg-gradient-to-br from-green-100 to-green-200' : 'bg-gradient-to-br from-blue-100 to-blue-200'}`}>
                        <User className={`h-6 w-6 ${session.status === 'active' ? 'text-green-700' : 'text-blue-700'}`} />
                      </div>
                      <div className={`min-w-0 flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <h4 className={`font-bold text-gray-900 text-base sm:text-lg mb-2 ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
                          {session.patientInfo.name || (language === 'ar' ? 'بدون اسم' : 'Unnamed')}
                        </h4>
                        <p className={`text-sm sm:text-base text-gray-600 line-clamp-2 mb-3 leading-relaxed ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
                          {session.patientInfo.chiefComplaint || (language === 'ar' ? 'لا توجد شكوى مسجلة' : 'No complaint recorded')}
                        </p>
                        <div className={`flex items-center gap-2 flex-wrap ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                          <span className={`px-3 py-1 rounded-full border text-xs font-medium ${session.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            {session.status === 'active' ? (language === 'ar' ? 'نشطة' : 'Active') : (language === 'ar' ? 'متوقفة مؤقتًا' : 'Paused')}
                          </span>
                          <span className={`text-xs text-gray-500 ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
                            {new Date(session.lastAccessedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                              year: 'numeric',
                              month: language === 'ar' ? 'long' : 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 sm:gap-3 flex-shrink-0 ${language === 'ar' ? 'justify-start sm:justify-start' : 'justify-end sm:justify-end'}`}>
                      <div className={`text-xs sm:text-sm font-semibold text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-full border border-blue-200 ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
                        {session.notes.length} {language === 'ar' ? 'ملاحظة' : 'notes'}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const confirmMsg = language === 'ar' ? 'هل تريد حذف هذه الجلسة؟' : 'Delete this session?';
                          if (window.confirm(confirmMsg)) {
                            deleteSession(session.id);
                          }
                        }}
                        className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 group-hover:scale-105"
                        title={language === 'ar' ? 'حذف الجلسة' : 'Delete Session'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Session Button */}
      {!showForm && (
        <div className="text-center">
          <button
            onClick={() => setShowForm(true)}
            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            <span className="flex items-center justify-center gap-3">
              <Plus className="h-6 w-6" />
              {t('newSession')}
            </span>
            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      )}

      {/* Patient Information Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              {t('patientInfo')}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name and Age Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('patientName')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`text-gray-900 w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder={language === 'ar' ? 'أدخل اسم المريض' : 'Enter patient name'}
                  />
                </div>
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('age')} <span className="text-gray-500">({t('optional')})</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className={`text-gray-900 w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base ${formErrors.age ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder={language === 'ar' ? 'العمر' : 'Age'}
                  />
                </div>
                {formErrors.age && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.age}
                  </p>
                )}
              </div>
            </div>

            {/* Gender and MRN Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('gender')} <span className="text-gray-500">({t('optional')})</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="text-gray-900 w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                >
                  <option value="">{language === 'ar' ? 'اختر الجنس' : 'Select gender'}</option>
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('medicalRecordNumber')} <span className="text-gray-500">({t('optional')})</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.medicalRecordNumber}
                    onChange={(e) => handleInputChange('medicalRecordNumber', e.target.value)}
                    className="text-gray-900 w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    placeholder={language === 'ar' ? 'رقم السجل الطبي' : 'Medical record number'}
                  />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('phoneNumber')} <span className="text-gray-500">({t('optional')})</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="text-gray-900 w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
                />
              </div>
            </div>

            {/* Chief Complaint */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('chiefComplaint')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <textarea
                  value={formData.chiefComplaint}
                  onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                  rows={3}
                  className={`text-gray-900 w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${formErrors.chiefComplaint ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder={language === 'ar' ? 'اكتب الشكوى الرئيسية للمريض' : 'Enter patient\'s chief complaint'}
                />
              </div>
              {formErrors.chiefComplaint && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.chiefComplaint}
                </p>
              )}
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('allergies')} <span className="text-gray-500">({t('optional')})</span>
                </label>
                <div className="relative">
                  <Heart className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    rows={3}
                    className="text-gray-900 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder={language === 'ar' ? 'اكتب الحساسيات مفصولة بفواصل' : 'Enter allergies separated by commas'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('medications')} <span className="text-gray-500">({t('optional')})</span>
                </label>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <textarea
                    value={formData.medications}
                    onChange={(e) => handleInputChange('medications', e.target.value)}
                    rows={3}
                    className="text-gray-900 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder={language === 'ar' ? 'اكتب الأدوية الحالية مفصولة بفواصل' : 'Enter current medications separated by commas'}
                  />
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div>
              <label className="block text sm font-semibold text-gray-700 mb-2">
                {t('medicalHistory')} <span className="text-gray-500">({t('optional')})</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  rows={4}
                  className="text-gray-900 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder={language === 'ar' ? 'اكتب التاريخ المرضي السابق' : 'Enter previous medical history'}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                <Save className="h-5 w-5" />
                {t('startSession')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 sm:flex-none bg-gray-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center gap-3"
              >
                <X className="h-5 w-5" />
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SessionManager;

