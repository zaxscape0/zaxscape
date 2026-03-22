import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { propertyId, email } = await req.json()
    if (!propertyId || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.zaxscape.com'

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Owner Contact Unlock',
            description: 'Phone and email for one property owner via skip tracing',
          },
          unit_amount: 99,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: appUrl + '/properties/' + propertyId + '?unlocked=true',
      cancel_url: appUrl + '/properties/' + propertyId,
      metadata: { propertyId, type: 'contact_unlock' },
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    console.error('unlock-contact error:', e?.message || e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
