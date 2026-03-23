import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const state = searchParams.get('state') || ''
  const status = searchParams.get('status') || ''
  const search = searchParams.get('search') || ''
  const minSurplus = parseInt(searchParams.get('min_surplus') || '0')
  const showExpired = searchParams.get('show_expired') === '1'
  const page = parseInt(searchParams.get('page') || '0')
  const PAGE = 25

  const supabase = createServerSupabase()
  let q = supabase.from('overages').select('*', { count: 'exact' })

  if (state) q = q.eq('state', state)
  if (status) q = q.eq('status', status)
  if (search) q = q.ilike('owner_name', `%${search}%`)
  if (minSurplus > 0) q = q.gte('surplus_amount', minSurplus)

  if (!showExpired) {
    const today = new Date().toISOString().slice(0, 10)
    q = q.or(`deadline_date.gt.${today},deadline_date.is.null`)
  }

  q = q.order('surplus_amount', { ascending: false })
       .range(page * PAGE, page * PAGE + PAGE - 1)

  const { data, count, error } = await q

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get expired count
  const today2 = new Date().toISOString().slice(0, 10)
  const { count: expiredCount } = await supabase
    .from('overages')
    .select('*', { count: 'exact', head: true })
    .lte('deadline_date', today2)
    .eq('status', status || 'unclaimed')

  return NextResponse.json({ data, count, expiredCount: expiredCount || 0 })
}
