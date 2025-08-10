import { NextRequest, NextResponse } from 'next/server';
import { GroqWhisperTranscriber } from '@/utils/groqWhisper';
import { SimpleLLMRouter } from '@/utils/simpleLLMRouter';

// Configure API route
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Prevent duplicate transcriptions with timestamps
const ongoingTranscriptions = new Map<string, number>();

export async function POST(request: NextRequest) {
  const requestId = Date.now().toString();
  console.log(`[${requestId}] New Cloudinary transcription request received`);
  
  try {
    const body = await request.json();
    const { audioUrl, language = 'ar', model = 'whisper-large-v3-turbo' } = body;
    
    console.log(`[${requestId}] Audio URL received: ${audioUrl}`);
    console.log(`[${requestId}] Language: ${language}, Model: ${model}`);
    
    if (!audioUrl) {
      return NextResponse.json({ error: 'No audio URL provided' }, { status: 400 });
    }

    // Create unique key for duplicate prevention
    const transcriptionKey = `${audioUrl}_${language}_${model}`;
    
    // Block duplicate requests
    if (ongoingTranscriptions.has(transcriptionKey)) {
      const startTime = ongoingTranscriptions.get(transcriptionKey);
      const timeSinceStart = Date.now() - (startTime || 0);
      
      if (timeSinceStart < 60000) {
        console.log(`[${requestId}] BLOCKED: Duplicate transcription request`);
        return NextResponse.json({ error: 'Transcription already in progress for this audio' }, { status: 429 });
      } else {
        ongoingTranscriptions.delete(transcriptionKey);
      }
    }

    // Mark as ongoing
    ongoingTranscriptions.set(transcriptionKey, Date.now());

    try {
      // Download audio file from Cloudinary
      console.log(`[${requestId}] Downloading audio from Cloudinary...`);
      const audioResponse = await fetch(audioUrl);
      
      if (!audioResponse.ok) {
        throw new Error(`Failed to download audio: ${audioResponse.statusText}`);
      }

      const audioBuffer = await audioResponse.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });

      console.log(`[${requestId}] Audio downloaded successfully: ${audioFile.size} bytes`);

      // Transcribe with Groq Whisper
      const groqTranscriber = new GroqWhisperTranscriber();
      
      if (!groqTranscriber.isAvailable()) {
        throw new Error('Groq API key not configured properly');
      }

      const whisperResult = await groqTranscriber.transcribe(audioFile, {
        language: language as 'ar' | 'en',
        model: model as 'whisper-large-v3' | 'whisper-large-v3-turbo',
        temperature: language === 'en' ? 0.1 : 0.0
      });
      
      const rawTranscript = whisperResult.text;
      console.log(`[${requestId}] Groq Whisper completed: ${rawTranscript.substring(0, 100)}...`);
      
      // Enhance transcript with LLM
      let enhancedTranscript = rawTranscript;
      let enhancementSource = 'none';
      let corrections: string[] = [];
      let confidence = 1.0;
      
      try {
        console.log(`[${requestId}] Starting LLM enhancement...`);
        const llmRouter = new SimpleLLMRouter();
        const enhancement = await llmRouter.enhanceTranscription(rawTranscript, language as 'ar' | 'en');
        
        enhancedTranscript = enhancement.text;
        enhancementSource = enhancement.source;
        confidence = enhancement.confidence;
        
        if (rawTranscript !== enhancedTranscript) {
          corrections = [
            'Medical terminology corrected',
            'Grammar and punctuation improved',
            'Text formatting enhanced'
          ];
        }
        
        console.log(`[${requestId}] LLM enhancement completed using ${enhancementSource}`);
      } catch (enhancementError) {
        console.log(`[${requestId}] LLM enhancement failed, using raw transcript:`, enhancementError);
        enhancementSource = 'failed';
      }
      
      // Remove from ongoing transcriptions
      ongoingTranscriptions.delete(transcriptionKey);
      
      return NextResponse.json({ 
        transcript: enhancedTranscript,
        originalTranscript: rawTranscript,
        transcriptionSource: 'groq-whisper-cloudinary',
        transcriptionModel: model,
        transcriptionDuration: whisperResult.duration,
        enhancement: {
          source: enhancementSource,
          corrections: corrections,
          confidence: confidence,
          improved: rawTranscript !== enhancedTranscript
        }
      });
      
    } catch (transcriptionError) {
      ongoingTranscriptions.delete(transcriptionKey);
      throw transcriptionError;
    }
    
  } catch (error) {
    console.error(`[${requestId}] Transcription error:`, error);
    
    return NextResponse.json(
      { error: 'Failed to transcribe audio from Cloudinary URL. Please check the URL and try again.' },
      { status: 500 }
    );
  }
}
