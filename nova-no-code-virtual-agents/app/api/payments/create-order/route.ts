import { NextResponse } from "next/server"
import { getCreditPlan } from "@/lib/pricing"

export async function POST(req: Request) {
  try {
    const { planId } = await req.json()
    const plan = getCreditPlan(planId)

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment gateway keys are missing in environment." },
        { status: 500 }
      )
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64")
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: plan.amountInr * 100,
        currency: "INR",
        receipt: `nova-${plan.id}-${Date.now()}`,
        notes: {
          planId: plan.id,
          planName: plan.name,
          credits: String(plan.credits),
        },
      }),
    })

    if (!orderRes.ok) {
      const details = await orderRes.text()
      return NextResponse.json({ error: "Could not create order.", details }, { status: 500 })
    }

    const order = await orderRes.json()
    return NextResponse.json({
      orderId: order.id,
      amount: plan.amountInr * 100,
      currency: "INR",
      keyId,
      plan,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create payment order.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
