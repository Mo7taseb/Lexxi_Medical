// API Route: Track Note Generation
// Server-side endpoint to securely store note generation data

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DataRedactionService } from '@/services/dataRedaction';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const redactionService = DataRedactionService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      doctorAnonId,
      transcript,
      noteType,
      language,
      generatedNote,
      generatedSections,
      generationSource,
      generationConfidence,
      templateUsed,
      processingTimeMs
    } = body;

    // Validate required fields
    if (!sessionId || !doctorAnonId || !transcript || !noteType || !generatedNote) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure doctor session exists
    const { data: existingSession } = await supabase
      .from('doctor_sessions')
      .select('id')
      .eq('doctor_anon_id', doctorAnonId)
      .single();

    if (!existingSession) {
      // Create new doctor session
      await supabase
        .from('doctor_sessions')
        .insert({
          doctor_anon_id: doctorAnonId,
          device_fingerprint: body.deviceFingerprint,
          session_count: 1
        });
    }

    // Redact PHI from all content
    const redactedTranscript = redactionService.redactTranscript(transcript, language);
    const redactedNote = redactionService.redactMedicalNote(generatedNote, language);
    const redactedSections = redactionService.redactMedicalSections(generatedSections, language);

    // Validate redaction quality
    const transcriptValidation = redactionService.validateRedaction(redactedTranscript, language);
    const noteValidation = redactionService.validateRedaction(redactedNote, language);

    if (!transcriptValidation.isValid || !noteValidation.isValid) {
      console.warn('Potential PHI detected after redaction:', {
        transcriptLeaks: transcriptValidation.potentialLeaks,
        noteLeaks: noteValidation.potentialLeaks
      });
      
      // In production, you might want to be more strict and return an error
      // return NextResponse.json({ error: 'Content contains potential PHI' }, { status: 400 });
    }

    // Get redaction statistics for monitoring
    const redactionStats = redactionService.getRedactionStats(transcript, redactedTranscript);

    // Store in database
    const { data: generation, error } = await supabase
      .from('note_generations')
      .insert({
        session_id: sessionId,
        doctor_anon_id: doctorAnonId,
        transcript_redacted: redactedTranscript,
        note_type: noteType,
        language: language || 'ar',
        generated_note: redactedNote, // 🔧 Store redacted for privacy (edit comparison will use frontend original)
        generated_sections: redactedSections, // 🔧 Store redacted for privacy
        generation_source: generationSource,
        generation_confidence: generationConfidence,
        template_used: templateUsed,
        processing_time_ms: processingTimeMs,
        model_version: getModelVersion(generationSource)
      })
      .select()
      .single();

    if (error) {
      console.error('Database error storing generation:', error);
      return NextResponse.json(
        { error: 'Failed to store generation data' },
        { status: 500 }
      );
    }

    // Log successful tracking (for monitoring)
    console.log(`✅ Note generation tracked: ${generation.id} (${noteType}, ${language})`);
    console.log(`📊 Redaction stats: ${redactionStats.totalRedactions} redactions, ${redactionStats.redactionPercentage}% content redacted`);

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      redactionStats,
      message: 'Note generation tracked successfully'
    });

  } catch (error) {
    console.error('Error in track-generation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getModelVersion(source: string): string {
  const versions: Record<string, string> = {
    'groq': 'llama-3.1-70b-versatile',
    'openai': 'gpt-3.5-turbo',
    'fallback': 'template-v1.0'
  };
  return versions[source] || 'unknown';
}
