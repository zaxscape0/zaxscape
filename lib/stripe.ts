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
  get(_target, prop) { return (getStripe() as any)[prop] }
})

export const PLANS: Record<string, { name: string; price: number; priceId: string; mode: 'subscription' | 'payment' }> = {
  access:   { name: 'ZaxScape Access',          price: 499,    priceId: process.env.STRIPE_PRICE_ACCESS   as string, mode: 'subscription' },
  monthly:  { name: 'ZaxScape Unlimited',        price: 19900,  priceId: process.env.STRIPE_PRICE_MONTHLY  as string, mode: 'subscription' },
  yearly:   { name: 'ZaxScape Unlimited Annual', price: 214999, priceId: process.env.STRIPE_PRICE_YEARLY   as string, mode: 'subscription' },
  lifetime: { name: 'ZaxScape Lifetime',         price: 500000, priceId: process.env.STRIPE_PRICE_LIFETIME as string, mode: 'payment' },
}
