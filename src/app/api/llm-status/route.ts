import { NextResponse } from 'next/server';
import { SimpleLLMRouter } from '@/utils/simpleLLMRouter';

export async function GET() {
  try {
    const router = new SimpleLLMRouter();
    
    // Check Ollama status
    let ollamaStatus = false;
    let ollamaModels: string[] = [];
    
    try {
      const ollamaResponse = await fetch('http://localhost:11434/api/tags');
      if (ollamaResponse.ok) {
        const models = await ollamaResponse.json();
        ollamaStatus = true;
        ollamaModels = models.models?.map((m: any) => m.name) || [];
      }
    } catch {
      ollamaStatus = false;
    }
    
    // Check API keys
    const groqAvailable = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10);
    const hfAvailable = !!(process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY.length > 10);
    const openaiAvailable = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'openai_api_key_here');
    
    return NextResponse.json({
      ollama: ollamaStatus,
      ollamaModels,
      groq: groqAvailable,
      huggingface: hfAvailable,
      openai: openaiAvailable,
      status: {
        primary: ollamaStatus ? 'local' : groqAvailable ? 'groq' : 'template',
        fallback: 'template',
        available: groqAvailable || hfAvailable || ollamaStatus || openaiAvailable
      }
    });
    
  } catch (error) {
    console.error('LLM status check failed:', error);
    return NextResponse.json({ 
      error: 'Failed to check LLM status', 
      ollama: false,
      groq: false,
      huggingface: false,
      openai: false
    }, { status: 500 });
  }
}
