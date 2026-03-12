"use client"

import { useContext, useMemo, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { UserDetailContext } from "@/context/UserDetailsContext"
import { CREDIT_PLANS, type CreditPlan } from "@/lib/pricing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const DUMMY_METHODS = [
  { id: "phonepe", label: "PhonePe" },
  { id: "paytm", label: "Paytm" },
  { id: "gpay", label: "Google Pay" },
  { id: "upi", label: "UPI" },
]

export default function PricingPage() {
  const { userDetail, setUserDetail } = useContext(UserDetailContext)
  const upgradeCredits = useMutation(api.user.UpgradeCredits)

  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<CreditPlan | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  const currentCredits = useMemo(() => userDetail?.token ?? 0, [userDetail?.token])

  const handleSubscribe = (plan: CreditPlan) => {
    setErrorMessage("")
    setSuccessMessage("")
    setSelectedPlan(plan)
    setPaymentDialogOpen(true)
  }

  const handleDummyPayment = async (methodId: string) => {
    if (!userDetail?._id || !selectedPlan) {
      setErrorMessage("User or plan not found. Please retry.")
      return
    }

    setLoadingPlanId(selectedPlan.id)
    try {
      const paymentId = `dummy_${methodId}_${Date.now()}`
      const result = await upgradeCredits({
        userId: userDetail._id as Id<"UserTable">,
        credits: selectedPlan.credits,
        planName: `${selectedPlan.name} (${methodId.toUpperCase()})`,
        paymentId,
      })

      setUserDetail((prev) =>
        prev
          ? {
              ...prev,
              token: result.token,
            }
          : prev
      )

      setSuccessMessage(
        `${selectedPlan.credits.toLocaleString()} credits added via ${methodId.toUpperCase()}.`
      )
      setPaymentDialogOpen(false)
      setSelectedPlan(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to add credits.")
    } finally {
      setLoadingPlanId(null)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Pricing & Subscription</h2>
        <p className="text-slate-600">
          Select a dummy payment method to instantly add credits to your profile.
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
              <Button className="w-full" onClick={() => handleSubscribe(plan)}>
                Subscribe
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
            <DialogDescription>
              {selectedPlan
                ? `Dummy payment for ${selectedPlan.name} (Rs. ${selectedPlan.amountInr})`
                : "Select a payment method"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            {DUMMY_METHODS.map((method) => (
              <Button
                key={method.id}
                variant="outline"
                onClick={() => handleDummyPayment(method.id)}
                disabled={!selectedPlan || loadingPlanId === selectedPlan?.id}
              >
                {loadingPlanId === selectedPlan?.id
                  ? "Processing..."
                  : `Pay with ${method.label}`}
              </Button>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setPaymentDialogOpen(false)
                setSelectedPlan(null)
              }}
              disabled={!!loadingPlanId}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
