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
  AlertCircle
} from 'lucide-react';
import { PatientFormData, SessionManagerProps } from './types';
import { sessionLanguageTexts } from './constants';
import { useSession } from './SessionContext';

const SessionManager: React.FC<SessionManagerProps> = ({
  onSessionReady,
  currentStep,
  language
}) => {
  const { createNewSession, currentSession, sessions } = useSession();
  const [showForm, setShowForm] = useState(false);
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

  const t = sessionLanguageTexts[language];

  // Language selector component
  const LanguageSelector = () => (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm font-medium text-gray-700">
        {language === 'ar' ? 'اللغة:' : 'Language:'}
      </span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => {/* Language will be controlled by parent */ }}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === 'ar'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          العربية
        </button>
        <button
          onClick={() => {/* Language will be controlled by parent */ }}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === 'en'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          English
        </button>
      </div>
    </div>
  );

  const validateForm = (): boolean => {
    const errors: Partial<PatientFormData> = {};

    if (!formData.name.trim()) {
      errors.name = t.required;
    }

    if (!formData.chiefComplaint.trim()) {
      errors.chiefComplaint = t.required;
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
      gender: formData.gender as 'male' | 'female' | 'other' | undefined,
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
      .slice(0, 3)
      .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime());
  };

  if (currentStep !== 1) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {t.newSession}
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          {language === 'ar'
            ? 'ابدأ جلسة جديدة مع المريض أو تابع جلسة سابقة'
            : 'Start a new patient session or continue a previous one'
          }
        </p>
      </div>

      {/* Current Session Status */}
      {currentSession && (
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  {language === 'ar' ? 'جلسة نشطة' : 'Active Session'}
                </h3>
                <p className="text-green-600 text-sm">
                  {currentSession.patientInfo.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleContinueSession}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
            >
              {t.continueToRecording}
              <CheckCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="text-sm text-green-700">
            <span className="font-medium">{t.chiefComplaint}:</span> {currentSession.patientInfo.chiefComplaint}
          </div>
          {currentSession.notes.length > 0 && (
            <div className="text-sm text-green-700 mt-1">
              <span className="font-medium">{t.notesCount}:</span> {currentSession.notes.length}
            </div>
          )}
        </div>
      )}

      {/* Recent Sessions */}
      {!currentSession && getRecentSessions().length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {t.recentSessions}
          </h3>
          <div className="grid gap-4">
            {getRecentSessions().map((session) => (
              <div
                key={session.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => onSessionReady(session)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {session.patientInfo.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {session.patientInfo.chiefComplaint}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(session.lastAccessedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {session.notes.length} {language === 'ar' ? 'ملاحظة' : 'notes'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              {t.newSession}
            </span>
            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      )}

      {/* Patient Information Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <User className="h-8 w-8 text-blue-600" />
              {t.patientInfo}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Name and Age Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.patientName} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`text-gray-700 w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${formErrors.name ? 'border-red-500' : 'border-gray-300'
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
                  {t.age} <span className="text-gray-500">({t.optional})</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className={`text-gray-700 w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${formErrors.age ? 'border-red-500' : 'border-gray-300'
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.gender} <span className="text-gray-500">({t.optional})</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="text-gray-700 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">{language === 'ar' ? 'اختر الجنس' : 'Select gender'}</option>
                  <option value="male">{t.male}</option>
                  <option value="female">{t.female}</option>
                  <option value="other">{t.other}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.medicalRecordNumber} <span className="text-gray-500">({t.optional})</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.medicalRecordNumber}
                    onChange={(e) => handleInputChange('medicalRecordNumber', e.target.value)}
                    className="text-gray-700 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={language === 'ar' ? 'رقم السجل الطبي' : 'Medical record number'}
                  />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.phoneNumber} <span className="text-gray-500">({t.optional})</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="text-gray-700 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
                />
              </div>
            </div>

            {/* Chief Complaint */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.chiefComplaint} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <textarea
                  value={formData.chiefComplaint}
                  onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                  rows={3}
                  className={`text-gray-700 w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${formErrors.chiefComplaint ? 'border-red-500' : 'border-gray-300'
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
                  {t.allergies} <span className="text-gray-500">({t.optional})</span>
                </label>
                <div className="relative">
                  <Heart className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    rows={3}
                    className="text-gray-700 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder={language === 'ar' ? 'اكتب الحساسيات مفصولة بفواصل' : 'Enter allergies separated by commas'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.medications} <span className="text-gray-500">({t.optional})</span>
                </label>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <textarea
                    value={formData.medications}
                    onChange={(e) => handleInputChange('medications', e.target.value)}
                    rows={3}
                    className="text-gray-700 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder={language === 'ar' ? 'اكتب الأدوية الحالية مفصولة بفواصل' : 'Enter current medications separated by commas'}
                  />
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.medicalHistory} <span className="text-gray-500">({t.optional})</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  rows={4}
                  className="text-gray-700 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
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
                {t.startSession}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 sm:flex-none bg-gray-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center gap-3"
              >
                <X className="h-5 w-5" />
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SessionManager;
