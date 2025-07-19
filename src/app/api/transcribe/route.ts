import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

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
  console.log(`[${requestId}] New transcription request received`);
  
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'ar';
    const accuracy = formData.get('accuracy') as string || 'medical';
    
    // Create unique key to prevent duplicates (include accuracy mode)
    const transcriptionKey = `${audioFile?.size}_${audioFile?.type}_${language}_${accuracy}`;
    
    // Block duplicate requests
    if (ongoingTranscriptions.has(transcriptionKey)) {
      const startTime = ongoingTranscriptions.get(transcriptionKey);
      const timeSinceStart = Date.now() - (startTime || 0);
      
      // Allow retry after 2 minutes or if it's been too long
      if (timeSinceStart < 120000) { // 2 minutes
        console.log(`[${requestId}] BLOCKED: Duplicate transcription request for ${transcriptionKey} (${timeSinceStart}ms ago)`);
        return NextResponse.json({ error: 'Transcription already in progress for this audio' }, { status: 429 });
      } else {
        console.log(`[${requestId}] Allowing retry after ${timeSinceStart}ms`);
        ongoingTranscriptions.delete(transcriptionKey);
      }
    }
    
    console.log(`[${requestId}] Processing audio file: ${audioFile?.name}, language: ${language}`);
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Mark as ongoing with timestamp
    ongoingTranscriptions.set(transcriptionKey, Date.now());

    // Create temporary file
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = process.cwd();
    const tempFile = join(tempDir, `temp_audio_${requestId}.webm`);
    
    await writeFile(tempFile, buffer);
    console.log(`[${requestId}] Temp file created: ${tempFile}`);

    try {
      // Run Python transcription script with selected accuracy
      const transcript = await runWhisperTranscription(tempFile, language, accuracy, requestId);
      
      // Clean up temporary file
      await unlink(tempFile);
      console.log(`[${requestId}] Temp file cleaned up`);
      
      // Remove from ongoing transcriptions
      ongoingTranscriptions.delete(transcriptionKey);
      
      return NextResponse.json({ transcript });
      
    } catch (transcriptionError) {
      // Clean up on error
      await unlink(tempFile).catch(() => {});
      ongoingTranscriptions.delete(transcriptionKey);
      throw transcriptionError;
    }
    
  } catch (error) {
    console.error(`[${requestId}] Transcription error:`, error);
    
    // Always clean up on any error
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'ar';
    const accuracy = formData.get('accuracy') as string || 'medical';
    const transcriptionKey = `${audioFile?.size}_${audioFile?.type}_${language}_${accuracy}`;
    ongoingTranscriptions.delete(transcriptionKey);
    
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

async function runWhisperTranscription(filePath: string, language: string, accuracy: string, requestId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Choose script based on accuracy mode
    let scriptPath: string;
    let modelName: string;
    let timeout: number;
    
    switch (accuracy) {
      case 'fast':
        scriptPath = join(process.cwd(), 'whisper_transcribe_instant.py');
        modelName = 'tiny';
        timeout = 90000; // 1.5 minutes
        break;
      case 'accurate':
        scriptPath = join(process.cwd(), 'whisper_transcribe_accurate.py');
        modelName = 'base';
        timeout = 120000; // 2 minutes
        break;
      case 'medical':
      default:
        scriptPath = join(process.cwd(), 'whisper_transcribe_medical.py');
        modelName = 'small';
        timeout = 180000; // 3 minutes
        break;
    }
    
    console.log(`[${requestId}] Starting ${accuracy} transcription: ${scriptPath}`);
    
    const pythonProcess = spawn('python', [scriptPath, filePath, '--language', language, '--model', modelName], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout
    });
    
    // Set process timeout
    const timeoutId = setTimeout(() => {
      pythonProcess.kill('SIGTERM');
      reject(new Error(`[${requestId}] Transcription timeout - process took too long`));
    }, timeout);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString('utf8');
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString('utf8');
      // Log status messages
      if (stderr.includes('✓') || stderr.includes('🚀') || stderr.includes('⏱️') || stderr.includes('Loading') || stderr.includes('model')) {
        console.log(`[${requestId}] Status:`, stderr.split('\n').pop()?.trim());
      }
    });
    
    pythonProcess.on('close', (code) => {
      clearTimeout(timeoutId);
      if (code !== 0) {
        console.error(`[${requestId}] ${accuracy} transcription failed:`, stderr);
        reject(new Error(`${accuracy} transcription failed: ${stderr}`));
      } else {
        console.log(`[${requestId}] ${accuracy} transcription completed successfully`);
        resolve(stdout.trim());
      }
    });
    
    pythonProcess.on('error', (error) => {
      clearTimeout(timeoutId);
      console.error(`[${requestId}] Process error:`, error);
      reject(error);
    });
  });
}
