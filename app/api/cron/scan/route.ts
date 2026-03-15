import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { runMonitorForCompetitor } from '@/lib/monitor'
import { sendChangeAlert } from '@/lib/email'

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerSupabase()
  const { data: competitors } = await db
    .from('competitors')
    .select('*, profiles(email)')
    .eq('status', 'active')

  if (!competitors || competitors.length === 0) {
    return NextResponse.json({ message: 'No active competitors', scanned: 0 })
  }

  const results = []
  for (const competitor of competitors) {
    try {
      const result = await runMonitorForCompetitor(competitor.id)
      if (result.hasChanged && result.changesDetected && competitor.profiles?.email) {
        await sendChangeAlert(
          competitor.profiles.email,
          competitor.name,
          result.changesDetected.summary,
          competitor.url
        )
      }
      results.push({ id: competitor.id, name: competitor.name, hasChanged: result.hasChanged })
    } catch (e) {
      results.push({ id: competitor.id, name: competitor.name, error: String(e) })
    }
  }

  return NextResponse.json({ scanned: results.length, results })
}
