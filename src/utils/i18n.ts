export type Language = 'en' | 'ar';

export interface Translations {
    // Header & Navigation
    language: string;

    // Hero Section
    heroTitle: string;
    heroSubtitle: string;

    // Features
    arabicSupport: string;
    seheCompliant: string;
    pdplCompliant: string;
    aiTranscription: string;

    // Steps
    patientInformation: string;
    sessionNotes: string;
    voiceRecording: string;
    reviewTranscript: string;
    selectNoteType: string;
    reviewNote: string;

    // Patient Information
    patientName: string;
    patientNamePlaceholder: string;
    age: string;
    agePlaceholder: string;
    gender: string;
    male: string;
    female: string;
    medicalRecordNumber: string;
    medicalRecordNumberPlaceholder: string;
    phoneNumber: string;
    phoneNumberPlaceholder: string;
    allergies: string;
    allergiesPlaceholder: string;
    currentMedications: string;
    currentMedicationsPlaceholder: string;
    medicalHistory: string;
    medicalHistoryPlaceholder: string;
    chiefComplaint: string;
    chiefComplaintPlaceholder: string;
    startSession: string;

    // Session Notes
    sessionNotesTitle: string;
    sessionNotesSubtitle: string;
    addQuickNote: string;
    quickNotePlaceholder: string;
    addNote: string;
    continueToRecording: string;

    // Voice Recording
    voiceRecordingTitle: string;
    voiceRecordingSubtitle: string;
    recordSessionSummary: string;
    recordFullConversation: string;
    startRecording: string;
    stopRecording: string;
    pauseRecording: string;
    resumeRecording: string;
    recordingTime: string;
    recordingInProgress: string;
    recordingComplete: string;

    // Transcription
    transcriptionTitle: string;
    transcriptionSubtitle: string;
    selectLanguage: string;
    selectTranscriptionLanguage: string;
    processingAudio: string;
    reviewAndEdit: string;
    continueToNoteType: string;

    // Note Types
    selectNoteTypeTitle: string;
    selectNoteTypeSubtitle: string;
    soap: string;
    soapDescription: string;
    progress: string;
    progressDescription: string;
    consultation: string;
    consultationDescription: string;
    discharge: string;
    dischargeDescription: string;
    freeform: string;
    freeformDescription: string;

    // Note Review
    noteReviewTitle: string;
    noteReviewSubtitle: string;
    generateNote: string;
    regeneratingNote: string;
    downloadNote: string;
    shareNote: string;
    startNewSession: string;

    // Common
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    open: string;
    required: string;
    optional: string;
    retry: string;
    copy: string;
    copied: string;
    download: string;
    downloadDocx: string;
    regenerate: string;
    startNew: string;
    generating: string;
    generatingDesc: string;
    reportGenerated: string;
    originalText: string;
    generateReport: string;
    editPlaceholder: string;
    wordCount: string;
    charCount: string;
    reportType: string;

    // Session Management
    newSession: string;
    patientInfo: string;
    medications: string;
    noteType: string;
    observation: string;
    diagnosis: string;
    general: string;
    priority: string;
    low: string;
    medium: string;
    high: string;
    editSession: string;
    deleteSession: string;
    saveChanges: string;
    sessionSummary: string;
    notesCount: string;
    noNotes: string;
    addFirstNote: string;
    recentSessions: string;
    noSessions: string;
    createFirstSession: string;
    deleteConfirm: string;
    deleteAllSessions: string;
    exportSession: string;
    importSession: string;
    sessionId: string;
    createdAt: string;
    lastAccessed: string;
    sessionStatus: string;
    active: string;
    completed: string;
    paused: string;
    searchPlaceholder: string;
    filterByStatus: string;
    all: string;
    sortBy: string;
    name: string;
    date: string;
    noteContent: string;
    noteTypePlaceholder: string;
    priorityLevel: string;
    tags: string;
    addTag: string;
    removeTag: string;
    deleteNote: string;
    editNote: string;
    saveNote: string;
    timestampLabel: string;
    quickNotes: string;
    templates: string;
    useTemplate: string;
    patientInfoComplete: string;
    notesAdded: string;
    readyToRecord: string;

    // Medical Terms
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    vitalSigns: string;
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    respiratoryRate: string;
    oxygenSaturation: string;
    weight: string;
    height: string;
    bmi: string;

    // File Operations
    uploadFile: string;
    dragAndDrop: string;
    orClickToBrowse: string;
    fileTooLarge: string;
    unsupportedFileType: string;
    downloadAsWord: string;
    downloadAsPdf: string;

    // Notifications
    sessionCreated: string;
    sessionUpdated: string;
    sessionDeleted: string;
    noteGenerated: string;
    noteSaved: string;
    noteShared: string;
    recordingStarted: string;
    recordingStopped: string;
    transcriptionStarted: string;
    transcriptionComplete: string;

    // Errors
    networkError: string;
    serverError: string;
    fileUploadError: string;
    transcriptionError: string;
    noteGenerationError: string;
    sessionLoadError: string;

    // Validation
    fieldRequired: string;
    invalidEmail: string;
    invalidPhone: string;
    invalidAge: string;
    invalidMedicalRecordNumber: string;

    // Accessibility
    accessibilityMenu: string;
    accessibilitySettings: string;
    increaseFontSize: string;
    decreaseFontSize: string;
    highContrast: string;
    screenReader: string;

    // Medical Note specific
    noteTypeNames: Record<string, string>;
    noteTypeDescriptions: Record<string, string>;
}

export const translations: Record<Language, Translations> = {
    en: {
        // Header & Navigation
        language: 'Language',

        // Hero Section
        heroTitle: 'Convert Medical Voices to Professional Reports Using AI',
        heroSubtitle: 'Advanced AI-powered medical transcription and note generation',

        // Features
        arabicSupport: 'Arabic Support',
        seheCompliant: 'SeHE Compliant',
        pdplCompliant: 'PDPL Compliant',
        aiTranscription: 'AI Transcription',

        // Steps
        patientInformation: 'Patient Information',
        sessionNotes: 'Session Notes',
        voiceRecording: 'Voice Recording',
        reviewTranscript: 'Review Transcript',
        selectNoteType: 'Select Note Type',
        reviewNote: 'Review Note',

        // Patient Information
        patientName: 'Patient Name',
        patientNamePlaceholder: 'Enter patient name',
        age: 'Age',
        agePlaceholder: 'Enter age',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        medicalRecordNumber: 'Medical Record Number',
        medicalRecordNumberPlaceholder: 'Enter medical record number',
        phoneNumber: 'Phone Number',
        phoneNumberPlaceholder: 'Enter phone number',
        allergies: 'Allergies',
        allergiesPlaceholder: 'List any allergies',
        currentMedications: 'Current Medications',
        currentMedicationsPlaceholder: 'List current medications',
        medicalHistory: 'Medical History',
        medicalHistoryPlaceholder: 'Enter relevant medical history',
        chiefComplaint: 'Chief Complaint',
        chiefComplaintPlaceholder: 'Enter chief complaint',
        startSession: 'Start Session',

        // Session Notes
        sessionNotesTitle: 'Session Notes',
        sessionNotesSubtitle: 'Add quick notes during the session to remember important points',
        addQuickNote: 'Add Quick Note',
        quickNotePlaceholder: 'Type your quick note here...',
        addNote: 'Add Note',
        continueToRecording: 'Continue to Recording',

        // Voice Recording
        voiceRecordingTitle: 'Voice Recording',
        voiceRecordingSubtitle: 'Record session summary or complete conversation',
        recordSessionSummary: 'Record Session Summary',
        recordFullConversation: 'Record Full Conversation',
        startRecording: 'Start Recording',
        stopRecording: 'Stop Recording',
        pauseRecording: 'Pause Recording',
        resumeRecording: 'Resume Recording',
        recordingTime: 'Recording Time',
        recordingInProgress: 'Recording in Progress',
        recordingComplete: 'Recording Complete',

        // Transcription
        transcriptionTitle: 'Review Transcript',
        transcriptionSubtitle: 'Review and edit the transcribed text',
        selectLanguage: 'Select Language',
        selectTranscriptionLanguage: 'Select Transcription Language',
        processingAudio: 'Processing audio...',
        reviewAndEdit: 'Review and Edit',
        continueToNoteType: 'Continue to Note Type',

        // Note Types
        selectNoteTypeTitle: 'Select Note Type',
        selectNoteTypeSubtitle: 'Choose the type of medical note to generate',
        soap: 'SOAP Note',
        soapDescription: 'Subjective, Objective, Assessment, Plan format',
        progress: 'Progress Note',
        progressDescription: 'Daily progress and treatment updates',
        consultation: 'Consultation Note',
        consultationDescription: 'Specialist consultation and recommendations',
        discharge: 'Discharge Summary',
        dischargeDescription: 'Hospital discharge and follow-up instructions',
        freeform: 'Free Form Note',
        freeformDescription: 'Custom note format',

        // Note Review
        noteReviewTitle: 'Review Generated Note',
        noteReviewSubtitle: 'Review and finalize the generated medical note',
        generateNote: 'Generate Note',
        regeneratingNote: 'Regenerating Note...',
        downloadNote: 'Download Note',
        shareNote: 'Share Note',
        startNewSession: 'Start New Session',

        // Common
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        close: 'Close',
        open: 'Open',
        required: 'Required',
        optional: 'Optional',
        retry: 'Retry',
        copy: 'Copy',
        copied: 'Copied',
        download: 'Download',
        downloadDocx: 'Download as DOCX',
        regenerate: 'Regenerate',
        startNew: 'Start New',
        generating: 'Generating...',
        generatingDesc: 'Generating medical note...',
        reportGenerated: 'Medical note generated successfully',
        originalText: 'Original Text',
        generateReport: 'Generate Report',
        editPlaceholder: 'Edit note...',
        wordCount: 'Word Count',
        charCount: 'Character Count',
        reportType: 'Report Type',

        // Session Management
        newSession: 'New Session',
        patientInfo: 'Patient Info',
        medications: 'Medications',
        noteType: 'Note Type',
        observation: 'Observation',
        diagnosis: 'Diagnosis',
        general: 'General',
        priority: 'Priority',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        editSession: 'Edit Session',
        deleteSession: 'Delete Session',
        saveChanges: 'Save Changes',
        sessionSummary: 'Session Summary',
        notesCount: 'Notes Count',
        noNotes: 'No Notes',
        addFirstNote: 'Add First Note',
        recentSessions: 'Recent Sessions',
        noSessions: 'No Sessions',
        createFirstSession: 'Create First Session',
        deleteConfirm: 'Are you sure you want to delete this session?',
        deleteAllSessions: 'Are you sure you want to delete all sessions?',
        exportSession: 'Export Session',
        importSession: 'Import Session',
        sessionId: 'Session ID',
        createdAt: 'Created At',
        lastAccessed: 'Last Accessed',
        sessionStatus: 'Session Status',
        active: 'Active',
        completed: 'Completed',
        paused: 'Paused',
        searchPlaceholder: 'Search sessions...',
        filterByStatus: 'Filter by Status',
        all: 'All',
        sortBy: 'Sort By',
        name: 'Name',
        date: 'Date',
        noteContent: 'Note Content',
        noteTypePlaceholder: 'Select note type...',
        priorityLevel: 'Priority Level',
        tags: 'Tags',
        addTag: 'Add Tag',
        removeTag: 'Remove Tag',
        deleteNote: 'Delete Note',
        editNote: 'Edit Note',
        saveNote: 'Save Note',
        timestampLabel: 'Timestamp',
        quickNotes: 'Quick Notes',
        templates: 'Templates',
        useTemplate: 'Use Template',
        patientInfoComplete: 'Patient Info Complete',
        notesAdded: 'Notes Added',
        readyToRecord: 'Ready to Record',

        // Medical Terms
        subjective: 'Subjective',
        objective: 'Objective',
        assessment: 'Assessment',
        plan: 'Plan',
        vitalSigns: 'Vital Signs',
        bloodPressure: 'Blood Pressure',
        heartRate: 'Heart Rate',
        temperature: 'Temperature',
        respiratoryRate: 'Respiratory Rate',
        oxygenSaturation: 'Oxygen Saturation',
        weight: 'Weight',
        height: 'Height',
        bmi: 'BMI',

        // File Operations
        uploadFile: 'Upload File',
        dragAndDrop: 'Drag and drop audio file here',
        orClickToBrowse: 'or click to browse',
        fileTooLarge: 'File is too large',
        unsupportedFileType: 'Unsupported file type',
        downloadAsWord: 'Download as Word',
        downloadAsPdf: 'Download as PDF',

        // Notifications
        sessionCreated: 'Session created successfully',
        sessionUpdated: 'Session updated successfully',
        sessionDeleted: 'Session deleted successfully',
        noteGenerated: 'Note generated successfully',
        noteSaved: 'Note saved successfully',
        noteShared: 'Note shared successfully',
        recordingStarted: 'Recording started',
        recordingStopped: 'Recording stopped',
        transcriptionStarted: 'Transcription started',
        transcriptionComplete: 'Transcription complete',

        // Errors
        networkError: 'Network error occurred',
        serverError: 'Server error occurred',
        fileUploadError: 'File upload failed',
        transcriptionError: 'Transcription failed',
        noteGenerationError: 'Note generation failed',
        sessionLoadError: 'Failed to load session',

        // Validation
        fieldRequired: 'This field is required',
        invalidEmail: 'Invalid email address',
        invalidPhone: 'Invalid phone number',
        invalidAge: 'Invalid age',
        invalidMedicalRecordNumber: 'Invalid medical record number',

        // Accessibility
        accessibilityMenu: 'Accessibility Menu',
        accessibilitySettings: 'Accessibility Settings',
        increaseFontSize: 'Increase Font Size',
        decreaseFontSize: 'Decrease Font Size',
        highContrast: 'High Contrast',
        screenReader: 'Screen Reader',

        // Medical Note specific
        noteTypeNames: {
            soap: 'SOAP Note',
            progress: 'Progress Note',
            consultation: 'Consultation Note',
            discharge: 'Discharge Summary',
            freeform: 'Free Form Note',
        },
        noteTypeDescriptions: {
            soap: 'Subjective, Objective, Assessment, Plan format',
            progress: 'Daily progress and treatment updates',
            consultation: 'Specialist consultation and recommendations',
            discharge: 'Hospital discharge and follow-up instructions',
            freeform: 'Custom note format',
        },
    },
    ar: {
        // Header & Navigation
        language: 'اللغة',

        // Hero Section
        heroTitle: 'تحويل الأصوات الطبية إلى تقارير احترافية باستخدام الذكاء الاصطناعي',
        heroSubtitle: 'نظام متقدم للتفريغ الطبي وإنشاء الملاحظات بالذكاء الاصطناعي',

        // Features
        arabicSupport: 'دعم اللغة العربية',
        seheCompliant: 'متوافق مع SeHE',
        pdplCompliant: 'متوافق مع PDPL',
        aiTranscription: 'التفريغ بالذكاء الاصطناعي',

        // Steps
        patientInformation: 'معلومات المريض',
        sessionNotes: 'ملاحظات الجلسة',
        voiceRecording: 'تسجيل الصوت',
        reviewTranscript: 'راجع النص',
        selectNoteType: 'اختر نوع التقرير',
        reviewNote: 'مراجعة التقرير',

        // Patient Information
        patientName: 'اسم المريض',
        patientNamePlaceholder: 'أدخل اسم المريض',
        age: 'العمر',
        agePlaceholder: 'أدخل العمر',
        gender: 'الجنس',
        male: 'ذكر',
        female: 'أنثى',
        medicalRecordNumber: 'رقم السجل الطبي',
        medicalRecordNumberPlaceholder: 'أدخل رقم السجل الطبي',
        phoneNumber: 'رقم الهاتف',
        phoneNumberPlaceholder: 'أدخل رقم الهاتف',
        allergies: 'الحساسيات',
        allergiesPlaceholder: 'اذكر أي حساسيات',
        currentMedications: 'الأدوية الحالية',
        currentMedicationsPlaceholder: 'اذكر الأدوية الحالية',
        medicalHistory: 'التاريخ المرضي',
        medicalHistoryPlaceholder: 'أدخل التاريخ المرضي ذو الصلة',
        chiefComplaint: 'الشكوى الرئيسية',
        chiefComplaintPlaceholder: 'أدخل الشكوى الرئيسية',
        startSession: 'بدء الجلسة',

        // Session Notes
        sessionNotesTitle: 'ملاحظات الجلسة',
        sessionNotesSubtitle: 'أضف ملاحظات سريعة أثناء الجلسة لتذكر النقاط المهمة',
        addQuickNote: 'إضافة ملاحظة سريعة',
        quickNotePlaceholder: 'اكتب ملاحظتك السريعة هنا...',
        addNote: 'إضافة ملاحظة',
        continueToRecording: 'متابعة إلى التسجيل',

        // Voice Recording
        voiceRecordingTitle: 'تسجيل الصوت',
        voiceRecordingSubtitle: 'سجل ملخص الجلسة أو المحادثة الكاملة',
        recordSessionSummary: 'تسجيل ملخص الجلسة',
        recordFullConversation: 'تسجيل المحادثة الكاملة',
        startRecording: 'بدء التسجيل',
        stopRecording: 'إيقاف التسجيل',
        pauseRecording: 'إيقاف مؤقت للتسجيل',
        resumeRecording: 'استئناف التسجيل',
        recordingTime: 'وقت التسجيل',
        recordingInProgress: 'التسجيل جارٍ',
        recordingComplete: 'اكتمل التسجيل',

        // Transcription
        transcriptionTitle: 'راجع النص',
        transcriptionSubtitle: 'راجع وحرر النص المفروغ',
        selectLanguage: 'اختر اللغة',
        selectTranscriptionLanguage: 'اختر لغة التفريغ',
        processingAudio: 'معالجة الصوت...',
        reviewAndEdit: 'راجع وحرر',
        continueToNoteType: 'متابعة إلى نوع الملاحظة',

        // Note Types
        selectNoteTypeTitle: 'اختر نوع التقرير',
        selectNoteTypeSubtitle: 'اختر نوع الملاحظة الطبية المراد إنشاؤها',
        soap: 'ملاحظة SOAP',
        soapDescription: 'تنسيق ذاتي، موضوعي، تقييم، خطة',
        progress: 'ملاحظة التقدم',
        progressDescription: 'التقدم اليومي وتحديثات العلاج',
        consultation: 'ملاحظة الاستشارة',
        consultationDescription: 'استشارة المختص والتوصيات',
        discharge: 'ملخص الخروج',
        dischargeDescription: 'تعليمات الخروج من المستشفى والمتابعة',
        freeform: 'ملاحظة حرة',
        freeformDescription: 'تنسيق ملاحظة مخصص',

        // Note Review
        noteReviewTitle: 'مراجعة التقرير المُنشأ',
        noteReviewSubtitle: 'راجع وأكمل الملاحظة الطبية المُنشأة',
        generateNote: 'إنشاء الملاحظة',
        regeneratingNote: 'إعادة إنشاء الملاحظة...',
        downloadNote: 'تحميل الملاحظة',
        shareNote: 'مشاركة الملاحظة',
        startNewSession: 'بدء جلسة جديدة',

        // Common
        loading: 'جاري التحميل...',
        error: 'خطأ',
        success: 'نجح',
        cancel: 'إلغاء',
        save: 'حفظ',
        edit: 'تحرير',
        delete: 'حذف',
        confirm: 'تأكيد',
        back: 'رجوع',
        next: 'التالي',
        previous: 'السابق',
        close: 'إغلاق',
        open: 'فتح',
        required: 'مطلوب',
        optional: 'اختياري',
        retry: 'إعادة المحاولة',
        copy: 'نسخ',
        copied: 'تم النسخ',
        download: 'تحميل',
        downloadDocx: 'تحميل كملف DOCX',
        regenerate: 'إعادة التوليد',
        startNew: 'بدء جديد',
        generating: 'جاري التوليد...',
        generatingDesc: 'جاري إنشاء الملاحظة...',
        reportGenerated: 'تم إنشاء الملاحظة بنجاح',
        originalText: 'النص الأصلي',
        generateReport: 'إنشاء التقرير',
        editPlaceholder: 'تحرير الملاحظة...',
        wordCount: 'عدد الكلمات',
        charCount: 'عدد الأحرف',
        reportType: 'نوع التقرير',

        // Session Management
        newSession: 'جلسة جديدة',
        patientInfo: 'معلومات المريض',
        medications: 'الأدوية',
        noteType: 'نوع الملاحظة',
        observation: 'الملاحظة',
        diagnosis: 'التشخيص',
        general: 'عام',
        priority: 'الأولوية',
        low: 'منخفض',
        medium: 'متوسط',
        high: 'عالي',
        editSession: 'تعديل الجلسة',
        deleteSession: 'حذف الجلسة',
        saveChanges: 'حفظ التغييرات',
        sessionSummary: 'ملخص الجلسة',
        notesCount: 'عدد الملاحظات',
        noNotes: 'لا توجد ملاحظات',
        addFirstNote: 'أضف ملاحظة أولى',
        recentSessions: 'الجلسات الأخيرة',
        noSessions: 'لا توجد جلسات',
        createFirstSession: 'أنشئ جلسة أولى',
        deleteConfirm: 'هل أنت متأكد من حذف هذه الجلسة؟',
        deleteAllSessions: 'هل أنت متأكد من حذف جميع الجلسات؟',
        exportSession: 'تصدير الجلسة',
        importSession: 'استيراد الجلسة',
        sessionId: 'معرف الجلسة',
        createdAt: 'تاريخ الإنشاء',
        lastAccessed: 'آخر دخول',
        sessionStatus: 'حالة الجلسة',
        active: 'نشط',
        completed: 'مكتمل',
        paused: 'موقوف',
        searchPlaceholder: 'ابحث في الجلسات...',
        filterByStatus: 'تصفية حسب الحالة',
        all: 'الكل',
        sortBy: 'ترتيب حسب',
        name: 'الاسم',
        date: 'التاريخ',
        noteContent: 'محتوى الملاحظة',
        noteTypePlaceholder: 'اختر نوع الملاحظة...',
        priorityLevel: 'مستوى الأولوية',
        tags: 'العلامات',
        addTag: 'إضافة علامة',
        removeTag: 'إزالة العلامة',
        deleteNote: 'حذف الملاحظة',
        editNote: 'تعديل الملاحظة',
        saveNote: 'حفظ الملاحظة',
        timestampLabel: 'الوقت',
        quickNotes: 'ملاحظات سريعة',
        templates: 'القوالب',
        useTemplate: 'استخدام القالب',
        patientInfoComplete: 'تكملة معلومات المريض',
        notesAdded: 'تمت إضافة الملاحظات',
        readyToRecord: 'جاهز للتسجيل',

        // Medical Terms
        subjective: 'ذاتي',
        objective: 'موضوعي',
        assessment: 'تقييم',
        plan: 'خطة',
        vitalSigns: 'العلامات الحيوية',
        bloodPressure: 'ضغط الدم',
        heartRate: 'معدل ضربات القلب',
        temperature: 'درجة الحرارة',
        respiratoryRate: 'معدل التنفس',
        oxygenSaturation: 'تشبع الأكسجين',
        weight: 'الوزن',
        height: 'الطول',
        bmi: 'مؤشر كتلة الجسم',

        // File Operations
        uploadFile: 'رفع ملف',
        dragAndDrop: 'اسحب وأفلت ملف الصوت هنا',
        orClickToBrowse: 'أو انقر للتصفح',
        fileTooLarge: 'الملف كبير جداً',
        unsupportedFileType: 'نوع ملف غير مدعوم',
        downloadAsWord: 'تحميل كملف Word',
        downloadAsPdf: 'تحميل كملف PDF',

        // Notifications
        sessionCreated: 'تم إنشاء الجلسة بنجاح',
        sessionUpdated: 'تم تحديث الجلسة بنجاح',
        sessionDeleted: 'تم حذف الجلسة بنجاح',
        noteGenerated: 'تم إنشاء الملاحظة بنجاح',
        noteSaved: 'تم حفظ الملاحظة بنجاح',
        noteShared: 'تم مشاركة الملاحظة بنجاح',
        recordingStarted: 'بدأ التسجيل',
        recordingStopped: 'توقف التسجيل',
        transcriptionStarted: 'بدأ التفريغ',
        transcriptionComplete: 'اكتمل التفريغ',

        // Errors
        networkError: 'حدث خطأ في الشبكة',
        serverError: 'حدث خطأ في الخادم',
        fileUploadError: 'فشل رفع الملف',
        transcriptionError: 'فشل التفريغ',
        noteGenerationError: 'فشل إنشاء الملاحظة',
        sessionLoadError: 'فشل تحميل الجلسة',

        // Validation
        fieldRequired: 'هذا الحقل مطلوب',
        invalidEmail: 'عنوان بريد إلكتروني غير صحيح',
        invalidPhone: 'رقم هاتف غير صحيح',
        invalidAge: 'عمر غير صحيح',
        invalidMedicalRecordNumber: 'رقم سجل طبي غير صحيح',

        // Accessibility
        accessibilityMenu: 'قائمة إمكانية الوصول',
        accessibilitySettings: 'إعدادات إمكانية الوصول',
        increaseFontSize: 'زيادة حجم الخط',
        decreaseFontSize: 'تقليل حجم الخط',
        highContrast: 'تباين عالي',
        screenReader: 'قارئ الشاشة',

        // Medical Note specific
        noteTypeNames: {
            soap: 'ملاحظة SOAP',
            progress: 'ملاحظة التقدم',
            consultation: 'ملاحظة الاستشارة',
            discharge: 'ملخص الخروج',
            freeform: 'ملاحظة حرة',
        },
        noteTypeDescriptions: {
            soap: 'تنسيق ذاتي، موضوعي، تقييم، خطة',
            progress: 'التقدم اليومي وتحديثات العلاج',
            consultation: 'استشارة المختص والتوصيات',
            discharge: 'تعليمات الخروج من المستشفى والمتابعة',
            freeform: 'تنسيق ملاحظة مخصص',
        },
    },
};

export const getDirection = (language: Language): 'ltr' | 'rtl' => {
    return language === 'ar' ? 'rtl' : 'ltr';
};

export const getFontFamily = (language: Language): string => {
    return language === 'ar'
        ? "'Cairo', 'Inter', system-ui, sans-serif"
        : "'Inter', system-ui, sans-serif";
};

export const formatDate = (date: Date, language: Language): string => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatTime = (date: Date, language: Language): string => {
    return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatNumber = (number: number, language: Language): string => {
    return number.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');
};
