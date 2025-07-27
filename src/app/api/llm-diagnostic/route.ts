import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check Ollama status and models
    const ollamaStatus = await fetch('http://localhost:11434/api/tags');
    
    if (!ollamaStatus.ok) {
      return NextResponse.json({ 
        error: 'Ollama not running',
        suggestion: 'Run: ollama serve'
      });
    }

    const models = await ollamaStatus.json();
    
    // Test if phi3:mini is available
    const phi3Available = models.models?.some((model: any) => 
      model.name.includes('phi3:mini')
    );

    // Test API keys
    const groqAvailable = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10);
    const hfAvailable = !!(process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY.length > 10);

    return NextResponse.json({
      ollama: {
        running: true,
        models: models.models?.map((m: any) => m.name) || [],
        phi3Available
      },
      apis: {
        groq: groqAvailable,
        huggingface: hfAvailable
      },
      recommendations: {
        ...(phi3Available ? {} : { installPhi3: 'Run: ollama pull phi3:mini' }),
        ...(groqAvailable ? {} : { getGroqKey: 'Get free key at https://console.groq.com/keys' })
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check LLM status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
