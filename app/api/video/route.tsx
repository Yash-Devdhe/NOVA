import { NextResponse } from "next/server"

const videoUsage: Map<string, { count: number; limit: number; resetDate: Date }> = new Map()

const DEFAULT_VIDEO_LIMIT = 3
const LIMIT_PERIOD_DAYS = 1
const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 45

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeOutputToVideoUrl(output: unknown): string | null {
  if (typeof output === "string") return output
  if (Array.isArray(output)) {
    const firstUrl = output.find((item) => typeof item === "string")
    return typeof firstUrl === "string" ? firstUrl : null
  }
  if (output && typeof output === "object" && "url" in output) {
    const value = (output as { url?: unknown }).url
    return typeof value === "string" ? value : null
  }
  return null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { prompt, userId, agentId, apiKey, modelVersion, input = {} } = body

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required for video generation" },
        { status: 400 }
      )
    }

    const replicateApiKey = apiKey || process.env.REPLICATE_API_TOKEN
    const versionToUse = modelVersion || process.env.REPLICATE_VIDEO_MODEL_VERSION

    if (!replicateApiKey) {
      return NextResponse.json(
        { error: "Replicate API key missing. Add Replicate API key in agent settings." },
        { status: 400 }
      )
    }

    if (!versionToUse) {
      return NextResponse.json(
        {
          error:
            "Replicate model version is missing. Set REPLICATE_VIDEO_MODEL_VERSION or pass modelVersion in request.",
        },
        { status: 400 }
      )
    }

    const usageKey = userId || agentId || "anonymous"
    const now = new Date()
    let usage = videoUsage.get(usageKey)

    if (!usage || now > usage.resetDate) {
      usage = {
        count: 0,
        limit: DEFAULT_VIDEO_LIMIT,
        resetDate: new Date(now.getTime() + LIMIT_PERIOD_DAYS * 24 * 60 * 60 * 1000),
      }
      videoUsage.set(usageKey, usage)
    }

    if (usage.count >= usage.limit) {
      return NextResponse.json(
        {
          error: "Video generation limit reached",
          limit: usage.limit,
          remaining: 0,
          resetDate: usage.resetDate.toISOString(),
        },
        { status: 429 }
      )
    }

    // Start the prediction
    const predictionResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${replicateApiKey}`,
      },
      body: JSON.stringify({
        version: versionToUse,
        input: {
          prompt,
          ...input,
        },
      }),
    })

    const predictionData = await predictionResponse.json()
    if (!predictionResponse.ok) {
      return NextResponse.json(
        { error: predictionData.detail || "Video generation request failed" },
        { status: predictionResponse.status }
      )
    }

    // Initial response with status
    let currentPrediction = predictionData
    let attempts = 0
    let lastStatus = "starting"

    // Poll for status updates
    while (
      currentPrediction.status !== "succeeded" &&
      currentPrediction.status !== "failed" &&
      currentPrediction.status !== "canceled" &&
      attempts < MAX_POLL_ATTEMPTS
    ) {
      attempts += 1
      await wait(POLL_INTERVAL_MS)
      
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${currentPrediction.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${replicateApiKey}`,
          },
        }
      )

      currentPrediction = await pollResponse.json()
      if (!pollResponse.ok) {
        return NextResponse.json(
          { error: currentPrediction.detail || "Failed while polling video status" },
          { status: pollResponse.status }
        )
      }

      // Only update status if it changed
      if (currentPrediction.status !== lastStatus) {
        lastStatus = currentPrediction.status
        console.log(`Video generation status: ${currentPrediction.status} (attempt ${attempts})`)
      }

      // Provide intermediate status updates
      if (currentPrediction.status === "processing") {
        // The model is processing, continue polling
      }
    }

    if (currentPrediction.status !== "succeeded") {
      return NextResponse.json(
        {
          error: "Video generation did not complete in time.",
          status: currentPrediction.status,
          id: currentPrediction.id,
        },
        { status: 504 }
      )
    }

    const videoUrl = normalizeOutputToVideoUrl(currentPrediction.output)
    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video generated but output URL was missing.", prediction: currentPrediction },
        { status: 500 }
      )
    }

    usage.count++
    videoUsage.set(usageKey, usage)

    return NextResponse.json({
      provider: "Replicate",
      status: currentPrediction.status,
      id: currentPrediction.id,
      videoUrl,
      type: "video",
      message: "Video generated successfully!",
      usage: {
        limit: usage.limit,
        remaining: usage.limit - usage.count,
        resetDate: usage.resetDate.toISOString(),
      },
    })
  } catch (error) {
    console.error("Video generation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId") || searchParams.get("agentId") || "anonymous"

  const usage = videoUsage.get(userId) || {
    count: 0,
    limit: DEFAULT_VIDEO_LIMIT,
    resetDate: new Date(Date.now() + LIMIT_PERIOD_DAYS * 24 * 60 * 60 * 1000),
  }

  return NextResponse.json({
    userId,
    limit: usage.limit,
    remaining: usage.limit - usage.count,
    resetDate: usage.resetDate.toISOString(),
  })
}

