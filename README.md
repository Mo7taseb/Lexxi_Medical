# 🩺 Lexxi Medical - Voice-to-Medical-Note System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-lexxi.vercel.app-blue?style=for-the-badge)](https://lexxi.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**Lexxi Medical** is an AI-powered web application that converts voice recordings into structured medical notes. It supports both Arabic and English transcription and can generate various types of medical reports (SOAP, Progress Notes, Consultation Notes, etc.).

## 🌐 Live Demo

👉 **[https://lexxi.vercel.app/](https://lexxi.vercel.app/)**

Try it out — record your voice or upload an audio file and watch it get transcribed and converted into a professional medical note in seconds.

---

## 🚀 Features

- **Voice Recording** — Record audio directly in the browser with pause/resume functionality
- **File Upload** — Upload existing audio files for transcription
- **Multi-language Support** — Arabic and English transcription with RTL support
- **Medical Note Types**:
  - SOAP Notes
  - Progress Notes
  - Consultation Notes
  - Discharge Summaries
  - Free-form Notes
- **AI-Powered** — Uses OpenAI GPT for intelligent note generation
- **Cloud Transcription** — Ultra-fast Groq Whisper API (5-15 seconds)
- **Medical Term Corrections** — Specialized Arabic medical terminology correction
- **PWA Ready** — Installable on mobile devices

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (Node.js) |
| Transcription | Groq Whisper API |
| AI / NLP | OpenAI GPT-3.5 / GPT-4 |
| Database | Supabase |
| Deployment | Vercel |
| Icons | Lucide React |

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** v18 or higher
- **Groq API Key** — [Get one here](https://console.groq.com/)
- **OpenAI API Key** — [Get one here](https://platform.openai.com/)

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mo7taseb/Lexxi_Medical.git
   cd Lexxi_Medical
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables** — create a `.env.local` file:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app** at `http://localhost:3000`

---

## 🎯 How It Works

```
1. Choose Input Mode   →   Full conversation or doctor summary only
2. Record / Upload     →   Record live audio or upload an existing file
3. Transcription       →   Groq Whisper transcribes in 5-15 seconds
4. Select Note Type    →   SOAP, Progress, Consultation, Discharge, or Free Form
5. Generate Note       →   OpenAI GPT generates a structured medical note
6. Review & Export     →   Edit, copy, or download the final note
```

---

## 🌐 API Endpoints

### `POST /api/transcribe`
Transcribes an audio file using Groq Whisper API.
- **Body**: `FormData` with audio file and language
- **Response**: `{ transcript, transcriptionSource, enhancement? }`

### `POST /api/generate-note`
Generates a structured medical note from a transcript.
- **Body**: `{ transcript: string, noteType: string }`
- **Response**: `{ note: string }`

---

## 📁 Project Structure

```
lexxi/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── transcribe/        # Groq Whisper transcription
│   │   │   └── generate-note/     # OpenAI note generation
│   │   └── page.tsx               # Main app page
│   ├── components/                # React components
│   │   ├── VoiceRecorder.tsx
│   │   ├── TranscriptionViewer.tsx
│   │   ├── NoteTypeSelector.tsx
│   │   └── MedicalNoteViewer.tsx
│   ├── contexts/                  # Language & session context
│   ├── services/                  # Change tracking service
│   └── utils/                     # Groq, LLM router utilities
├── docs/                          # Integration guides
├── test-assets/                   # Sample audio files (AR/EN)
├── public/                        # Static assets & favicons
├── next.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🔒 Privacy & Security

- **No Data Storage** — Audio and transcripts are processed but never stored
- **Client-side Recording** — Voice recording happens entirely in the browser
- **Secure Cloud Processing** — Transcription processed via Groq API
- **Patient Consent** — Built-in consent checkbox for full conversation mode

---

## 🚀 Deployment

```bash
# Production build
npm run build
npm start
```

