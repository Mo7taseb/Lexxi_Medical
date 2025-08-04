import { NextRequest, NextResponse } from 'next/server';
import { SimpleLLMRouter } from '@/utils/simpleLLMRouter';

export async function POST(request: NextRequest) {
  try {
    const { transcript, language } = await request.json();
    
    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const router = new SimpleLLMRouter();
    
    console.log(`🔄 Enhancing transcript (${language}): ${transcript.substring(0, 100)}...`);
    
    const enhancementResult = await router.enhanceTranscription(
      transcript, 
      language as 'ar' | 'en'
    );
    
    console.log(`✅ Enhancement completed using ${enhancementResult.source} (confidence: ${enhancementResult.confidence})`);
    
    return NextResponse.json({
      original: transcript,
      enhanced: enhancementResult.text,
      source: enhancementResult.source,
      confidence: enhancementResult.confidence,
      improvement: enhancementResult.text !== transcript
    });
    
  } catch (error) {
    console.error('Transcript enhancement error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance transcript', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
