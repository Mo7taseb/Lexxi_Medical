# Lexxi Medical - Voice-to-Medical-Note System

🩺 **Lexxi Medical** is an AI-powered web application that converts voice recordings into structured medical notes. It supports both Arabic and English transcription and can generate various types of medical reports (SOAP, Progress Notes, Consultation Notes, etc.).

## 🚀 Features

- **Voice Recording**: Record audio directly in the browser with pause/resume functionality
- **File Upload**: Upload existing audio files for transcription
- **Multi-language Support**: Arabic and English transcription
- **Medical Note Types**:
  - SOAP Notes
  - Progress Notes
  - Consultation Notes
  - Discharge Summaries
  - Free-form Notes
- **AI-Powered**: Uses OpenAI GPT for intelligent note generation
- **Cloud Transcription**: Ultra-fast Groq Whisper API for accurate transcription (5-15 seconds)
- **Medical Term Corrections**: Specialized Arabic medical terminology correction
- **RTL Support**: Full Arabic language support with proper text direction
- **Professional UI**: Clean, medical-focused interface

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Transcription**: Groq Whisper API (cloud-based)
- **AI**: OpenAI GPT-3.5/4 for note generation
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with RTL support

## 📦 Installation

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Groq API Key** (for transcription)
3. **OpenAI API Key** (for note generation)

### Setup Instructions

1. **Clone and install dependencies**:

   ```bash
   cd lexxi-medical-app
   npm install
   ```

2. **Environment Configuration**:

   - Copy `.env.local` file
   - Add your API keys:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     GROQ_API_KEY=your_groq_api_key_here
     ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Open the app**:
   Navigate to `http://localhost:3000`

## 🎯 Usage Guide

### Step 1: Choose Input Mode

- **Full Conversation**: Record the entire doctor-patient conversation (requires patient consent)
- **Doctor Summary**: Record only the doctor's summary

### Step 2: Record Audio

- Click "Start Recording" to begin
- Use pause/resume controls as needed
- Or upload an existing audio file

### Step 3: Review Transcript

- The system will automatically transcribe your audio using Groq Whisper API
- Transcription happens in the cloud for ultra-fast processing (5-15 seconds)
- Medical terminology is automatically corrected for Arabic
- Edit the transcript if needed
- Choose between Arabic and English transcription

### Step 4: Select Note Type

- Choose from various medical note formats:
  - **SOAP Note**: Structured with Subjective, Objective, Assessment, Plan
  - **Progress Note**: For follow-up appointments
  - **Consultation Note**: For referrals and consultations
  - **Discharge Summary**: For hospital discharge
  - **Free Form**: Custom format

### Step 5: Generate & Review Note

- AI will generate a structured medical note
- Edit the note if needed
- Copy or download the final note

## 🔧 Configuration

### Groq Whisper API

The app uses Groq's ultra-fast Whisper API for transcription:

- **Speed**: 5-15 seconds for most audio files
- **Languages**: Supports Arabic and English
- **Medical Corrections**: Automatic Arabic medical term correction
- **Quality**: High accuracy with medical terminology

### OpenAI Configuration

The app uses GPT-3.5-turbo by default. You can modify the model in:

```typescript
// src/app/api/generate-note/route.ts
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo", // or "gpt-4"
  // ...
});
```

## 📁 Project Structure

```
lexxi-medical-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── transcribe/
│   │   │   └── generate-note/
│   │   ├── globals.css
│   │   └── page.tsx
│   ├── components/
│   │   ├── VoiceRecorder.tsx
│   │   ├── TranscriptionViewer.tsx
│   │   ├── NoteTypeSelector.tsx
│   │   └── MedicalNoteViewer.tsx
│   └── utils/
│       └── groqWhisper.ts
├── .env.local
└── README.md
```

## 🌐 API Endpoints

### POST /api/transcribe

Transcribe audio file to text using Groq Whisper API

- **Body**: FormData with audio file and language
- **Response**: `{ transcript: string, transcriptionSource: string, enhancement?: object }`

### POST /api/generate-note

Generate medical note from transcript

- **Body**: `{ transcript: string, noteType: string }`
- **Response**: `{ note: string }`

## 🔒 Privacy & Security

- **No Data Storage**: Audio and transcripts are processed but not stored
- **Client-side Processing**: Voice recording happens entirely in the browser
- **Cloud Processing**: Transcription processed securely via Groq API
- **Patient Consent**: Built-in consent checkbox for full conversations

## 🚀 Deployment

### Local Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Deployment Options

- **Vercel**: Recommended for Next.js apps
- **Docker**: Container-based deployment
- **Traditional Server**: Node.js hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is for educational and prototype purposes. Please ensure compliance with healthcare regulations (HIPAA, etc.) before using in production.

## 📁 Project Structure

```
lexxi/
├── docs/                          # Documentation
│   ├── GROQ_WHISPER_GUIDE.md     # Groq Whisper integration guide
│   ├── LLM_INTEGRATION_GUIDE.md  # LLM setup and integration
│   └── README.md                  # Documentation index
├── scripts/                       # Utility scripts
│   ├── generate-favicons.ps1     # Favicon generation script
│   ├── setup-llm.bat            # LLM setup script
│   └── README.md                 # Scripts documentation
├── test-assets/                   # Test audio files
│   ├── ar2.mp3                   # Arabic test audio
│   ├── en.mp3                    # English test audio
│   ├── mix1.mp3                  # Mixed language audio
│   ├── consultation-voice-note.mp3 # Medical consultation
│   └── README.md                 # Test assets documentation
├── public/                        # Static assets
│   ├── emblem.png                # Main logo/emblem
│   ├── logo.png                  # Alternative logo
│   └── favicon_io/               # Favicon files
├── src/                          # Source code
│   ├── app/                      # Next.js app directory
│   ├── components/               # React components
│   └── utils/                    # Utility functions
├── package.json                  # Dependencies
├── next.config.ts               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS config
└── README.md                    # This file
```

