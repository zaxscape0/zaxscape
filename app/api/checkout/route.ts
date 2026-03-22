import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { plan, email, propertyType } = await req.json()
    const planKey = plan || 'access'
    const p = PLANS[planKey]
    if (!p) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    if (email && propertyType) {
      const db = createServerSupabase()
      await db.from('profiles').update({ property_type: propertyType }).eq('email', email)
    }

    const isLifetime = planKey === 'lifetime'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.zaxscape.com'

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [{ price: p.priceId, quantity: 1 }],
      mode: isLifetime ? 'payment' : 'subscription',
      ...(!isLifetime && {
        subscription_data: {
          trial_period_days: planKey === 'access' ? 14 : 0,
          ...(planKey === 'access' && { trial_settings: { end_behavior: { missing_payment_method: 'cancel' } } }),
        },
        payment_method_collection: 'always',
      }),
      success_url: appUrl + '/dashboard?success=true',
      cancel_url: appUrl + '/upgrade',
      metadata: { plan: planKey, propertyType: propertyType || 'commercial' },
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    console.error('checkout error:', e?.message || e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
