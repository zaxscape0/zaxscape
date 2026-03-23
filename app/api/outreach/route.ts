import { createServerSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET - list outreach contacts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '0')
  const PAGE = 50

  const db = createServerSupabase()
  let q = db.from('outreach_contacts')
    .select('*', { count: 'exact' })
    .order('surplus_amount', { ascending: false })
    .range(page * PAGE, page * PAGE + PAGE - 1)

  if (status && status !== 'all') q = q.eq('status', status)

  const { data, count, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count })
}

// POST - add overage to outreach pipeline
export async function POST(req: Request) {
  const body = await req.json()
  const db = createServerSupabase()
  const { data, error } = await db.from('outreach_contacts').insert({
    overage_id: body.overage_id,
    owner_name: body.owner_name,
    surplus_amount: body.surplus_amount,
    county: body.county,
    state: body.state,
    property_address: body.property_address,
    mailing_address: body.mailing_address || null,
    status: 'new',
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
