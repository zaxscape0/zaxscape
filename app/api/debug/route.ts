import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return NextResponse.json({
    length: key.length,
    hasNewline: key.includes('\n'),
    hasCarriageReturn: key.includes('\r'),
    hasSpace: key.includes(' '),
    first30: key.slice(0, 30),
    last30: key.slice(-30),
    charCodesAround210: Array.from(key.slice(205, 220)).map(c => c.charCodeAt(0))
  })
}
