import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET() {
  const db = createServerSupabase()
  const { data, error } = await db.from('competitors').select('id, name').limit(5)
  return NextResponse.json({
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    keyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20),
    competitors: data,
    error: error?.message
  })
}
