import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const db = createServerSupabase()
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await db.from('competitors').select('*').eq('user_id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const db = createServerSupabase()
  const { name, url, user_id, email } = await req.json()
  if (!name || !url || !user_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Enforce plan limits
  if (email) {
    const { data: profile } = await db.from('profiles').select('competitor_limit, plan').eq('email', email).single()
    const limit = profile?.competitor_limit ?? 3
    const { count } = await db.from('competitors').select('*', { count: 'exact', head: true }).eq('user_id', user_id).eq('status', 'active')
    if ((count ?? 0) >= limit) {
      return NextResponse.json({
        error: `Plan limit reached. Your ${profile?.plan || 'starter'} plan allows ${limit} competitor${limit === 1 ? '' : 's'}. Upgrade to add more.`,
        limitReached: true,
      }, { status: 403 })
    }
  }

  const { data, error } = await db
    .from('competitors')
    .insert({ name, url: url.startsWith('http') ? url : 'https://' + url, user_id, status: 'active' })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const db = createServerSupabase()
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const { error } = await db.from('competitors').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
