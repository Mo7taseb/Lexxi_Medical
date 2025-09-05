'use client';

import React from 'react';
import { Zap, User, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { PatientSession } from '@/components/patient-session/types';

interface QuickRecordBadgeProps {
  session: PatientSession;
  language: 'ar' | 'en';
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

const QuickRecordBadge: React.FC<QuickRecordBadgeProps> = ({
  session,
  language,
  size = 'md',
  showStatus = true
}) => {
  if (!session.isQuickRecord) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const getStatusInfo = () => {
    if (session.patientInfo.isAnonymous) {
      return {
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: <Zap className={iconSizes[size]} />,
        text: language === 'ar' ? 'تسجيل سريع' : 'Quick Record'
      };
    } else {
      return {
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: <CheckCircle className={iconSizes[size]} />,
        text: language === 'ar' ? 'تسجيل سريع مُعين' : 'Assigned Quick Record'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses[size]} ${statusInfo.color}`}>
        {statusInfo.icon}
        {statusInfo.text}
      </span>

      {showStatus && (
        <div className="flex items-center gap-1">
          {session.recordingCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200">
              <FileText className="h-3 w-3" />
              {language === 'ar' ? 'مسجل' : 'Recorded'}
            </span>
          )}

          {session.transcriptGenerated && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full border border-purple-200">
              <CheckCircle className="h-3 w-3" />
              {language === 'ar' ? 'مفرغ' : 'Transcribed'}
            </span>
          )}

          {session.finalNoteGenerated && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">
              <CheckCircle className="h-3 w-3" />
              {language === 'ar' ? 'ملاحظة' : 'Note'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickRecordBadge;
