import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { plan, email, propertyType } = await req.json()
  const planKey = plan || 'access'
  if (!PLANS[planKey]) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  // Save property type preference to profile if user exists
  if (email && propertyType) {
    const db = createServerSupabase()
    await db.from('profiles').update({ property_type: propertyType }).eq('email', email)
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    payment_method_types: ['card'],
    line_items: [{ price: PLANS[planKey].priceId, quantity: 1 }],
    mode: 'subscription',
    subscription_data: {
      trial_period_days: 14,
      trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
    },
    payment_method_collection: 'always',
    success_url: (process.env.NEXT_PUBLIC_APP_URL as string) + '/dashboard?success=true',
    cancel_url: (process.env.NEXT_PUBLIC_APP_URL as string) + '/signup',
    metadata: { plan: planKey, propertyType: propertyType || 'commercial' },
  })

  return NextResponse.json({ url: session.url })
}
