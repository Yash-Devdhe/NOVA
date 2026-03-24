import { NextResponse } from 'next/server';

// Audio Generation API - Text to Speech with usage limits
// Supports OpenAI TTS and browser Web Speech API (via client-side)

// In-memory storage for demo (in production, use database)
const audioUsage: Map<string, { count: number; limit: number; resetDate: Date }> = new Map();

// Default limits
const DEFAULT_AUDIO_LIMIT = 10;
const LIMIT_PERIOD_DAYS = 1;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, userId, apiKey, provider, voice, agentId } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required for audio generation' },
        { status: 400 }
      );
    }

    // Use userId or agentId as the usage key
    const usageKey = userId || agentId || 'anonymous';

    // Check and update usage
    const now = new Date();
    let usage = audioUsage.get(usageKey);

    // Reset if it's a new period
    if (!usage || now > usage.resetDate) {
      usage = { count: 0, limit: DEFAULT_AUDIO_LIMIT, resetDate: new Date(now.getTime() + LIMIT_PERIOD_DAYS * 24 * 60 * 60 * 1000) };
      audioUsage.set(usageKey, usage);
    }

    // Check limit
    if (usage.count >= usage.limit) {
      return NextResponse.json(
        { 
          error: 'Audio generation limit reached',
          limit: usage.limit,
          remaining: 0,
          resetDate: usage.resetDate.toISOString(),
          message: `You have reached your daily limit of ${usage.limit} audio generations. Try again tomorrow.`
        },
        { status: 429 }
      );
    }

    let audioResult;

    if (provider === 'openai' && apiKey) {
      // OpenAI TTS API integration
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice || 'alloy',
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.error?.message || 'Audio generation failed' },
          { status: response.status }
        );
      }

      // Get the audio data as base64
      const audioBuffer = await response.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

      audioResult = {
        provider: 'OpenAI TTS',
        audioBase64: `data:audio/mp3;base64,${audioBase64}`,
        format: 'mp3',
        model: 'tts-1',
        voice: voice || 'alloy',
      };
    } else {
      // Demo mode - return placeholder
      // In production, you could use other TTS services or return a demo audio
      
      audioResult = {
        provider: 'Demo Mode',
        message: 'Audio generation in demo mode. Connect OpenAI API key for real TTS.',
        // Using a sample audio file for demo
        audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
        text: text,
        voice: voice || 'alloy (demo)',
        note: 'In production, integrate with OpenAI TTS, ElevenLabs, or Google Cloud TTS',
      };
    }

    // Update usage count
    usage.count++;
    audioUsage.set(usageKey, usage);

    return NextResponse.json({
      ...audioResult,
      usage: {
        limit: usage.limit,
        remaining: usage.limit - usage.count,
        resetDate: usage.resetDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get usage info
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || searchParams.get('agentId') || 'anonymous';

  const usage = audioUsage.get(userId) || { 
    count: 0, 
    limit: DEFAULT_AUDIO_LIMIT, 
    resetDate: new Date(Date.now() + LIMIT_PERIOD_DAYS * 24 * 60 * 60 * 1000) 
  };

  return NextResponse.json({
    userId,
    limit: usage.limit,
    remaining: usage.limit - usage.count,
    resetDate: usage.resetDate.toISOString(),
  });
}

