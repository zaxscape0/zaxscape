import Stripe from 'stripe'

let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2026-02-25.clover',
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop]
  }
})

export const PLANS: Record<string, { name: string; price: number; priceId: string }> = {
  access: { name: 'ZaxScape Access', price: 499, priceId: process.env.STRIPE_PRICE_ACCESS as string },
}
