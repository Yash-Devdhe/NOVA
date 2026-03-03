export type CreditPlan = {
  id: string
  name: string
  amountInr: number
  credits: number
  description: string
}

export const CREDIT_PLANS: CreditPlan[] = [
  {
    id: "starter_plus",
    name: "Starter Plus",
    amountInr: 199,
    credits: 3000,
    description: "Best for testing more agents with extra credits.",
  },
  {
    id: "growth",
    name: "Growth",
    amountInr: 499,
    credits: 10000,
    description: "For active users building multiple production agents.",
  },
  {
    id: "scale",
    name: "Scale",
    amountInr: 999,
    credits: 25000,
    description: "High-volume usage with long-running workflows.",
  },
]

export function getCreditPlan(planId: string) {
  return CREDIT_PLANS.find((plan) => plan.id === planId)
}
