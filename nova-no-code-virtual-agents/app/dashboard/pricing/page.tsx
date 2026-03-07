"use client"

import { useContext, useMemo, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { UserDetailContext } from "@/context/UserDetailsContext"
import { CREDIT_PLANS, type CreditPlan } from "@/lib/pricing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void
      on: (event: string, callback: (payload: unknown) => void) => void
    }
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existing) return resolve(true)

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function PricingPage() {
  const { userDetail, setUserDetail } = useContext(UserDetailContext)
  const upgradeCredits = useMutation(api.user.UpgradeCredits)
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const currentCredits = useMemo(() => userDetail?.token ?? 0, [userDetail?.token])

  const handleSubscribe = async (plan: CreditPlan) => {
    if (!userDetail?._id) {
      setErrorMessage("User not found. Please sign in again.")
      return
    }

    setErrorMessage("")
    setSuccessMessage("")
    setLoadingPlanId(plan.id)
    try {
      const scriptReady = await loadRazorpayScript()
      if (!scriptReady) {
        throw new Error("Could not load payment gateway.")
      }

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      })

      const orderJson = await orderRes.json()
      if (!orderRes.ok) {
        throw new Error(orderJson.error || "Could not create payment order.")
      }

      const razorpay = new window.Razorpay({
        key: orderJson.keyId,
        amount: orderJson.amount,
        currency: orderJson.currency,
        name: "NOVA Credits",
        description: `${plan.name} subscription`,
        order_id: orderJson.orderId,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: true,
          paylater: true,
        },
        handler: async (response: Record<string, string>) => {
          try {
            setLoadingPlanId(plan.id)
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })
            const verifyJson = await verifyRes.json()
            if (!verifyJson.verified) {
              throw new Error("Payment verification failed.")
            }

            const result = await upgradeCredits({
              userId: userDetail._id as Id<"UserTable">,
              credits: plan.credits,
              planName: plan.name,
              paymentId: response.razorpay_payment_id,
            })

            setUserDetail((prev) =>
              prev
                ? {
                    ...prev,
                    token: result.token,
                  }
                : prev
            )
            setSuccessMessage(`Payment successful. ${plan.credits.toLocaleString()} credits added.`)
          } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Payment verification failed.")
          } finally {
            setLoadingPlanId(null)
          }
        },
        prefill: {
          name: userDetail.name || "",
          email: userDetail.email || "",
        },
        notes: {
          userId: userDetail._id,
          planId: plan.id,
          credits: String(plan.credits),
        },
        modal: {
          ondismiss: () => {
            setErrorMessage("Payment cancelled.")
            setLoadingPlanId(null)
          },
        },
        theme: {
          color: "#0f172a",
        },
      })

      razorpay.on("payment.failed", () => {
        setErrorMessage("Payment failed. Please retry with another method.")
        setLoadingPlanId(null)
      })

      razorpay.open()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Payment failed.")
      setLoadingPlanId(null)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Pricing & Subscription</h2>
        <p className="text-slate-600">
          Default account includes 5000 credits. Purchase additional credits to continue building.
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">Current credits: {currentCredits}</p>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {CREDIT_PLANS.map((plan) => (
          <Card key={plan.id} className="border-slate-200">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold">Rs. {plan.amountInr}</p>
              <p className="text-sm text-slate-600">{plan.description}</p>
              <p className="text-sm font-semibold">{plan.credits.toLocaleString()} extra credits</p>
              <Button className="w-full" onClick={() => handleSubscribe(plan)} disabled={loadingPlanId === plan.id}>
                {loadingPlanId === plan.id ? "Processing..." : "Subscribe"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
