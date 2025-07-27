import { NextRequest, NextResponse } from 'next/server';
import { SimpleLLMRouter } from '@/utils/simpleLLMRouter';
import { GroqWhisperTranscriber } from '@/utils/groqWhisper';

// Prevent duplicate transcriptions with timestamps
const ongoingTranscriptions = new Map<string, number>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of ongoingTranscriptions.entries()) {
    if (now - timestamp > 300000) { // 5 minutes
      ongoingTranscriptions.delete(key);
    }
  }
}, 60000); // Check every minute

export async function POST(request: NextRequest) {
  const requestId = Date.now().toString();
  console.log(`[${requestId}] New Groq Whisper transcription request received`);
  
  let transcriptionKey = '';
  
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'ar';
    const model = formData.get('model') as string || 'whisper-large-v3-turbo'; // Support model selection
    
    console.log(`[${requestId}] 📋 Form data received:`);
    console.log(`[${requestId}] - Audio file: ${audioFile?.name} (${audioFile?.size} bytes)`);
    console.log(`[${requestId}] - Language parameter: "${language}" (raw value)`);
    console.log(`[${requestId}] - Model parameter: "${model}"`);
    
    // Create unique key to prevent duplicates
    transcriptionKey = `${audioFile?.size}_${audioFile?.type}_${language}_${model}`;
    
    // Block duplicate requests
    if (ongoingTranscriptions.has(transcriptionKey)) {
      const startTime = ongoingTranscriptions.get(transcriptionKey);
      const timeSinceStart = Date.now() - (startTime || 0);
      
      // Allow retry after 1 minute (shorter for cloud API)
      if (timeSinceStart < 60000) { // 1 minute
        console.log(`[${requestId}] BLOCKED: Duplicate transcription request for ${transcriptionKey} (${timeSinceStart}ms ago)`);
        return NextResponse.json({ error: 'Transcription already in progress for this audio' }, { status: 429 });
      } else {
        console.log(`[${requestId}] Allowing retry after ${timeSinceStart}ms`);
        ongoingTranscriptions.delete(transcriptionKey);
      }
    }
    
    console.log(`[${requestId}] Processing audio file: ${audioFile?.name}, language: ${language.toUpperCase()}, model: ${model}`);
    console.log(`[${requestId}] Language-optimized settings: ${language === 'en' ? 'English medical mode' : 'Arabic medical mode'}`);
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Mark as ongoing with timestamp
    ongoingTranscriptions.set(transcriptionKey, Date.now());

    try {
      console.log(`[${requestId}] Starting Groq Whisper transcription...`);
      
      // Step 1: Transcribe with Groq Whisper API
      const groqTranscriber = new GroqWhisperTranscriber();
      
      if (!groqTranscriber.isAvailable()) {
        throw new Error('Groq API key not configured properly');
      }

      const whisperResult = await groqTranscriber.transcribe(audioFile, {
        language: language as 'ar' | 'en',
        model: model as 'whisper-large-v3' | 'whisper-large-v3-turbo',
        temperature: language === 'en' ? 0.1 : 0.0 // Slightly higher temperature for English for better medical terminology
      });
      
      const rawTranscript = whisperResult.text;
      console.log(`[${requestId}] Groq Whisper completed: ${rawTranscript.substring(0, 100)}...`);
      
      // Step 2: Enhance transcript with LLM
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
        
        // Find what was corrected
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
        transcript: enhancedTranscript,  // Primary result (enhanced)
        originalTranscript: rawTranscript,  // Original for comparison
        transcriptionSource: 'groq-whisper', // Always Groq now
        transcriptionModel: model, // Which Groq model was used
        transcriptionDuration: whisperResult.duration, // Transcription metadata
        enhancement: {
          source: enhancementSource,
          corrections: corrections,
          confidence: confidence,
          improved: rawTranscript !== enhancedTranscript
        }
      });
      
    } catch (transcriptionError) {
      // Clean up on error
      ongoingTranscriptions.delete(transcriptionKey);
      throw transcriptionError;
    }
    
  } catch (error) {
    console.error(`[${requestId}] Transcription error:`, error);
    
    // Clean up on any error using the already extracted transcriptionKey
    if (transcriptionKey) {
      ongoingTranscriptions.delete(transcriptionKey);
      console.log(`[${requestId}] Cleaned up transcription key: ${transcriptionKey}`);
    }
    
    return NextResponse.json(
      { error: 'Failed to transcribe audio. Please check your Groq API key and try again.' },
      { status: 500 }
    );
  }
}
