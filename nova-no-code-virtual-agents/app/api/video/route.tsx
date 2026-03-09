import { NextResponse } from 'next/server';

// Video Generation API - with usage limits (similar to Gemini's 2-3 video limit)
// This is a demo implementation. In production, integrate with Replicate, RunwayML, or Pika Labs

// In-memory storage for demo (in production, use database)
const videoUsage: Map<string, { count: number; limit: number; resetDate: Date }> = new Map();

// Default limits
const DEFAULT_VIDEO_LIMIT = 3; // Like Gemini
const LIMIT_PERIOD_DAYS = 1;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, userId, apiKey, provider, agentId } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required for video generation' },
        { status: 400 }
      );
    }

    // Use userId or agentId as the usage key
    const usageKey = userId || agentId || 'anonymous';

    // Check and update usage
    const now = new Date();
    let usage = videoUsage.get(usageKey);

    // Reset if it's a new period
    if (!usage || now > usage.resetDate) {
      usage = { count: 0, limit: DEFAULT_VIDEO_LIMIT, resetDate: new Date(now.getTime() + LIMIT_PERIOD_DAYS * 24 * 60 * 60 * 1000) };
      videoUsage.set(usageKey, usage);
    }

    // Check limit
    if (usage.count >= usage.limit) {
      return NextResponse.json(
        { 
          error: 'Video generation limit reached',
          limit: usage.limit,
          remaining: 0,
          resetDate: usage.resetDate.toISOString(),
          message: `You have reached your daily limit of ${usage.limit} videos. Try again tomorrow.`
        },
        { status: 429 }
      );
    }

    let videoResult;

    if (provider === 'replicate' && apiKey) {
      // Replicate API integration (production)
      // Note: You'd need to set up a Replicate webhook for real implementation
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          version: 'video-model-version-id', // Replace with actual model
          input: { prompt },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: data.detail || 'Video generation failed' },
          { status: response.status }
        );
      }

      videoResult = {
        provider: 'Replicate',
        status: data.status,
        output: data.output,
        id: data.id,
      };
    } else {
      // Demo mode - simulate video generation
      // In production, this would generate actual videos
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a sample video URL (using sample videos for demo)
      const sampleVideos = [
        'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
        'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
      ];

      videoResult = {
        provider: 'Demo Mode',
        status: 'completed',
        prompt: prompt,
        // In production, this would be the actual generated video URL
        videoUrl: sampleVideos[Math.floor(Math.random() * sampleVideos.length)],
        thumbnailUrl: 'https://via.placeholder.com/640x360/000000/FFFFFF?text=Generated+Video',
        message: 'This is a demo video. In production, connect your Replicate API key for real video generation.',
        duration: '5-10 seconds',
        model: 'Demo Model',
      };
    }

    // Update usage count
    usage.count++;
    videoUsage.set(usageKey, usage);

    return NextResponse.json({
      ...videoResult,
      usage: {
        limit: usage.limit,
        remaining: usage.limit - usage.count,
        resetDate: usage.resetDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Video generation error:', error);
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

  const usage = videoUsage.get(userId) || { 
    count: 0, 
    limit: DEFAULT_VIDEO_LIMIT, 
    resetDate: new Date(Date.now() + LIMIT_PERIOD_DAYS * 24 * 60 * 60 * 1000) 
  };

  return NextResponse.json({
    userId,
    limit: usage.limit,
    remaining: usage.limit - usage.count,
    resetDate: usage.resetDate.toISOString(),
  });
}

