import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function createLocalFallbackReply(prompt: string, systemPrompt?: string) {
  const normalized = prompt.toLowerCase();
  const hasBuildIntent =
    normalized.includes('agent') ||
    normalized.includes('workflow') ||
    normalized.includes('tool') ||
    normalized.includes('api');

  if (hasBuildIntent) {
    return `I can help you design this agent right away.\n\n1. Define the user goal in one sentence.\n2. Add required tools (LLM/API/Approval) in order.\n3. Set clear success/failure conditions.\n4. Test with 3 real prompts and refine outputs.\n\n${systemPrompt ? 'Your current instructions are loaded for this preview.' : 'Add instructions in settings to make responses more specific.'}`;
  }

  return `Preview response (local mode): ${prompt}\n\nAdd an OpenAI API key to switch to live model responses.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, type, providerApiKey, systemPrompt } = body;
    const apiKeyToUse = providerApiKey || OPENAI_API_KEY;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (type === 'image') {
      if (!apiKeyToUse) {
        const placeholderText = encodeURIComponent(prompt.slice(0, 80) || 'Generated Image');
        return NextResponse.json({
          url: `https://placehold.co/1024x1024/png?text=${placeholderText}`,
          type: 'image',
          provider: 'placeholder',
          warning: 'OpenAI API key not configured, using placeholder image.',
        });
      }

      // Real image generation via OpenAI Images API
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeyToUse}`,
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: data.error?.message || 'Failed to generate image' },
          { status: response.status }
        );
      }

      const imagePayload = data?.data?.[0];
      const imageUrl =
        imagePayload?.url ||
        (imagePayload?.b64_json
          ? `data:image/png;base64,${imagePayload.b64_json}`
          : null);

      if (!imageUrl) {
        return NextResponse.json(
          { error: 'Image generated but no output URL was returned.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        url: imageUrl,
        type: 'image',
      });
    } else {
      if (!apiKeyToUse) {
        return NextResponse.json({
          message: createLocalFallbackReply(prompt, systemPrompt),
          type: 'chat',
          provider: 'local-fallback',
          warning: 'OpenAI API key not configured, using local preview mode.',
        });
      }

      // Chat completion for general conversation
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeyToUse}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                systemPrompt ||
                'You are a helpful AI assistant for a no-code virtual agent platform. Help users understand how to build AI agents, explain tools, and assist with their workflow creation.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: data.error?.message || 'Failed to get response' },
          { status: response.status }
        );
      }

      return NextResponse.json({
        message: data.choices[0].message.content,
        type: 'chat',
      });
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
