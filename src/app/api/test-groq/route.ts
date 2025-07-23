import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test Groq API connectivity
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey || groqApiKey === 'your_new_groq_api_key_here' || groqApiKey.length < 10) {
      return NextResponse.json({ 
        error: 'No valid Groq API key found',
        suggestion: 'Set GROQ_API_KEY in your environment variables with a real API key from https://console.groq.com/'
      });
    }

    // Test the API
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
      },
    });

    if (response.ok) {
      const models = await response.json();
      return NextResponse.json({ 
        status: 'Groq API working correctly',
        availableModels: models.data?.slice(0, 3).map((m: any) => m.id) || [],
        totalModels: models.data?.length || 0
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: `Groq API error: ${response.status}`,
        details: errorText,
        suggestion: 'Check your API key validity'
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to connect to Groq API',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Check your internet connection and API key'
    });
  }
}
