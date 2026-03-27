import { NextRequest, NextResponse } from 'next/server'

async function stripeRequest(path: string, body: Record<string, string>) {
  const params = new URLSearchParams(body)
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  return res.json()
}

const PRICE_IDS: Record<string, string> = {
  agent:    process.env.STRIPE_PRICE_AGENT    || 'price_1TFNukH13TBMWbWrMVvxc8Ht',
  access:   process.env.STRIPE_PRICE_ACCESS   || '',
  monthly:  process.env.STRIPE_PRICE_MONTHLY  || '',
  yearly:   process.env.STRIPE_PRICE_YEARLY   || '',
  lifetime: process.env.STRIPE_PRICE_LIFETIME || '',
}

export async function POST(req: NextRequest) {
  try {
    const { plan, email, propertyType } = await req.json()
    const planKey = plan || 'access'
    const priceId = PRICE_IDS[planKey]
    if (!priceId) return NextResponse.json({ error: 'Invalid plan: ' + planKey }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.zaxscape.com'
    const isLifetime = planKey === 'lifetime'

    const body: Record<string, string> = {
      'customer_email': email || '',
      'payment_method_types[0]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'mode': isLifetime ? 'payment' : 'subscription',
      'success_url': appUrl + '/dashboard?success=true',
      'cancel_url': appUrl + '/upgrade',
      'metadata[plan]': planKey,
      'metadata[propertyType]': propertyType || 'commercial',
    }

    if (!isLifetime) {
      if (planKey === 'access' || planKey === 'agent') {
        body['subscription_data[trial_period_days]'] = '7'
        body['subscription_data[trial_settings][end_behavior][missing_payment_method]'] = 'cancel'
      }
      body['payment_method_collection'] = 'always'
    }

    const session = await stripeRequest('checkout/sessions', body)
    if (session.error) {
      return NextResponse.json({ error: session.error.message }, { status: 400 })
    }

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
