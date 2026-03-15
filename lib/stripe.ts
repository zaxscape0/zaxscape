import Stripe from 'stripe'

// Lazy init to avoid build-time crash when env vars aren't present
let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2026-02-25.clover',
    })
  }
  return _stripe
}

// Keep backward compat export
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop]
  }
})

export const PLANS: Record<string, { name: string; price: number; priceId: string; competitorLimit: number }> = {
  starter: { name: 'Starter', price: 99, priceId: process.env.STRIPE_PRICE_STARTER as string, competitorLimit: 3 },
  pro: { name: 'Pro', price: 199, priceId: process.env.STRIPE_PRICE_PRO as string, competitorLimit: 10 },
  team: { name: 'Team', price: 399, priceId: process.env.STRIPE_PRICE_TEAM as string, competitorLimit: 999 },
}
