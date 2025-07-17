import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'ar';
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Create temporary file
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = process.cwd();
    const tempFile = join(tempDir, `temp_audio_${Date.now()}.webm`);
    
    await writeFile(tempFile, buffer);

    // Run Python transcription script
    const transcript = await runWhisperTranscription(tempFile, language);
    
    // Clean up temporary file
    await unlink(tempFile);
    
    return NextResponse.json({ transcript });
    
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

async function runWhisperTranscription(filePath: string, language: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const scriptPath = join(process.cwd(), 'whisper_transcribe.py');
    
    const pythonProcess = spawn('python', [scriptPath, filePath, '--language', language, '--model', 'base'], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString('utf8');
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString('utf8');
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Enhanced transcription failed: ${stderr}`));
      } else {
        resolve(stdout.trim());
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(error);
    });
  });
}
