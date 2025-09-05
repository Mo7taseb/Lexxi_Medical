'use client';

import React from 'react';
import { useSession } from './SessionContext';

interface DemoSetupProps {
  language: 'ar' | 'en';
}

const DemoSetup: React.FC<DemoSetupProps> = ({ language }) => {
  const { createQuickRecordSession, updateSession, createNewSession } = useSession();

  const createDemoQuickRecords = () => {
    // Create demo quick record 1 - Pending assignment
    const quickRecord1 = createQuickRecordSession();
    updateSession(quickRecord1.id, {
      transcriptContent: "Patient complaining of chest pain, difficulty breathing. Ahmed Hassan, 45 years old, diabetic patient.",
      transcriptGenerated: true,
      recordingCompleted: true,
      quickRecordMetadata: {
        processingStatus: 'completed',
        autoProcessed: true
      }
    });

    // Create demo quick record 2 - Transcribing
    const quickRecord2 = createQuickRecordSession();
    updateSession(quickRecord2.id, {
      recordingCompleted: true,
      quickRecordMetadata: {
        processingStatus: 'transcribing',
        autoProcessed: false
      }
    });

    // Create demo quick record 3 - Already assigned
    const quickRecord3 = createQuickRecordSession();
    updateSession(quickRecord3.id, {
      patientInfo: {
        ...quickRecord3.patientInfo,
        name: 'Sara Mohamed',
        age: 32,
        gender: 'female' as const,
        isAnonymous: false,
        chiefComplaint: 'Follow-up for hypertension'
      },
      transcriptContent: "Follow-up visit for Sara Mohamed, blood pressure is controlled with medication.",
      transcriptGenerated: true,
      recordingCompleted: true,
      canAssignToPatient: false,
      quickRecordMetadata: {
        processingStatus: 'completed',
        autoProcessed: true
      }
    });

    // Create demo regular session
    createNewSession({
      name: 'Mohammad Al-Ahmad',
      age: 55,
      gender: 'male',
      phoneNumber: '+966501234567',
      chiefComplaint: 'Scheduled diabetes consultation',
      allergies: ['Penicillin'],
      medications: ['Metformin 500mg']
    });

    console.log('✅ Demo data created successfully!');
  };

  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-yellow-800">
            {language === 'ar' ? '🧪 بيانات تجريبية' : '🧪 Demo Data'}
          </h4>
          <p className="text-yellow-700 text-sm mt-1">
            {language === 'ar'
              ? 'إنشاء تسجيلات سريعة تجريبية لاختبار النظام'
              : 'Create demo quick records to test the system'
            }
          </p>
        </div>
        <button
          onClick={createDemoQuickRecords}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
        >
          {language === 'ar' ? 'إنشاء بيانات تجريبية' : 'Create Demo Data'}
        </button>
      </div>
    </div>
  );
};

export default DemoSetup;
