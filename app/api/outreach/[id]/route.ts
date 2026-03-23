import { createServerSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const db = createServerSupabase()
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.status !== undefined) update.status = body.status
  if (body.notes !== undefined) update.notes = body.notes
  if (body.mailing_address !== undefined) update.mailing_address = body.mailing_address
  if (body.phone !== undefined) update.phone = body.phone
  if (body.email !== undefined) update.email = body.email
  if (body.contact_method !== undefined) update.contact_method = body.contact_method
  if (body.letter_sent_at !== undefined) update.letter_sent_at = body.letter_sent_at
  if (body.last_contact_at !== undefined) update.last_contact_at = body.last_contact_at

  const { data, error } = await db.from('outreach_contacts')
    .update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServerSupabase()
  const { error } = await db.from('outreach_contacts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
