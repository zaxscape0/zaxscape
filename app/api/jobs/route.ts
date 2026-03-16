import { NextRequest, NextResponse } from 'next/server'
import { scanJobsForCompetitor } from '@/lib/jobs'

export async function POST(req: NextRequest) {
  try {
    const { competitorId } = await req.json()
    if (!competitorId) return NextResponse.json({ error: 'Missing competitorId' }, { status: 400 })
    const result = await scanJobsForCompetitor(competitorId)
    return NextResponse.json({ success: true, ...result })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
