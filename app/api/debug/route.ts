import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  // Try creating client and making a direct query
  try {
    const db = createClient(url, key)
    const { data, error } = await db.from('competitors').select('id,name').limit(3)
    return NextResponse.json({
      urlLength: url.length,
      keyLength: key.length,
      urlOk: url.startsWith('https://'),
      keyOk: !key.includes(' ') && !key.includes('\n'),
      data,
      error: error?.message
    })
  } catch(e) {
    return NextResponse.json({ caught: String(e) })
  }
}
