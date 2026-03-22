import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { propertyId, email } = await req.json()
    if (!propertyId || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.zaxscape.com'

    const body = new URLSearchParams({
      'customer_email': email,
      'payment_method_types[0]': 'card',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': 'Owner Contact Unlock',
      'line_items[0][price_data][product_data][description]': 'Phone and email for one property owner',
      'line_items[0][price_data][unit_amount]': '99',
      'line_items[0][quantity]': '1',
      'mode': 'payment',
      'success_url': appUrl + '/properties/' + propertyId + '?unlocked=true',
      'cancel_url': appUrl + '/properties/' + propertyId,
      'metadata[propertyId]': propertyId,
      'metadata[type]': 'contact_unlock',
    })

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })
    const session = await res.json()

    if (session.error) {
      return NextResponse.json({ error: session.error.message }, { status: 400 })
    }

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
