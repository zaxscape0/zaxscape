import { NextRequest, NextResponse } from 'next/server'
import { generateBattlecard } from '@/lib/battlecard'

export async function POST(req: NextRequest) {
  try {
    const { competitorId } = await req.json()
    if (!competitorId) return NextResponse.json({ error: 'Missing competitorId' }, { status: 400 })
    const result = await generateBattlecard(competitorId)
    return NextResponse.json({ success: true, battlecard: result })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
