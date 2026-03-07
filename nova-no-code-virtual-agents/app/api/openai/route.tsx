import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, type } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    if (type === 'image') {
      // DALL-E for image generation
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
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

      return NextResponse.json({
        url: data.data[0].url,
        type: 'image',
      });
    } else if (type === 'video') {
      // Using DALL-E 3 for generating image frames that can simulate video
      // Note: OpenAI doesn't have a native video API yet, so we'll generate an animated image description
      // or we can use a different approach - generate a sequence of images
      
      // For now, return a message about video generation
      // In production, you could integrate with other video APIs like RunwayML, Pika, etc.
      return NextResponse.json({
        message: 'Video generation is not yet available via OpenAI. Please use DALL-E 3 for image generation.',
        type: 'video',
        suggestion: 'Try using the image generation with a detailed prompt for animation concepts.',
      });
    } else {
      // Chat completion for general conversation
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant for a no-code virtual agent platform. Help users understand how to build AI agents, explain tools, and assist with their workflow creation.',
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
