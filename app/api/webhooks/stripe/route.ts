import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string
  let event: any

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET as string)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = createServerSupabase()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const email = session.customer_email
    const plan = session.metadata?.plan || 'access'
    const propertyType = session.metadata?.propertyType || 'commercial'
    const unlimited = ['monthly', 'yearly', 'lifetime', 'agent'].includes(plan)

    if (email) {
      await db.from('profiles').update({
        plan_active: true,
        plan: plan,
        unlimited: unlimited,
        property_type: propertyType,
      }).eq('email', email)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    const customer = await stripe.customers.retrieve(sub.customer as string)
    const email = (customer as any).email
    if (email) {
      await db.from('profiles').update({ plan_active: false, unlimited: false }).eq('email', email)
    }
  }

  return NextResponse.json({ received: true })
}
