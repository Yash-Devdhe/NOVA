import crypto from "crypto"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = await req.json()
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ verified: false, error: "Invalid payload." }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json(
        { verified: false, error: "Payment secret missing in environment." },
        { status: 500 }
      )
    }

    const generated = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex")

    const verified =
      generated.length === razorpaySignature.length &&
      crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(razorpaySignature))

    return NextResponse.json({ verified })
  } catch (error) {
    return NextResponse.json(
      {
        verified: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
