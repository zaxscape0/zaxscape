import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const state = searchParams.get('state') || ''
  const county = searchParams.get('county') || ''
  const search = searchParams.get('search') || ''
  const minSurplus = parseInt(searchParams.get('min_surplus') || '0')

  const supabase = createServerSupabase()
  let q = supabase.from('overages')
    .select('owner_name,property_address,city,state,county,surplus_amount,sale_date,deadline_date,case_number,source')
    .order('surplus_amount', { ascending: false })
    .limit(1000)

  if (state) q = q.eq('state', state)
  if (county) q = q.eq('county', county)
  if (search) q = q.ilike('owner_name', `%${search}%`)
  if (minSurplus > 0) q = q.gte('surplus_amount', minSurplus)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const headers = ['owner_name','property_address','city','state','county','surplus_amount','sale_date','deadline_date','case_number']
  const rows = (data || []).map(r =>
    headers.map(h => `"${String((r as any)[h] ?? '').replace(/"/g, '""')}"`).join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="zaxscape-surplus-export.csv"',
    },
  })
}
