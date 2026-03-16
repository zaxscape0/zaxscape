import { createServerSupabase } from './supabase'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string })

export async function generateBattlecard(competitorId: string) {
  const db = createServerSupabase()
  
  // Gather all intelligence
  const [{ data: competitor }, { data: snapshots }, { data: jobs }, { data: reviews }] = await Promise.all([
    db.from('competitors').select('*').eq('id', competitorId).single(),
    db.from('snapshots').select('*').eq('competitor_id', competitorId).not('changes_detected', 'is', null).order('scanned_at', { ascending: false }).limit(5),
    db.from('job_postings').select('*').eq('competitor_id', competitorId).order('first_seen_at', { ascending: false }).limit(20),
    db.from('reviews').select('*').eq('competitor_id', competitorId).order('fetched_at', { ascending: false }).limit(20),
  ])

  if (!competitor) throw new Error('Competitor not found')

  const negativeReviews = (reviews || []).filter(r => r.sentiment === 'negative')
  const recentChanges = (snapshots || []).map(s => s.changes_detected?.summary).filter(Boolean)
  const recentJobs = (jobs || []).slice(0, 10).map(j => j.title)
  const painPoints = negativeReviews.map(r => r.pain_point).filter(Boolean)

  const prompt = `You are a competitive intelligence analyst. Generate a sales battlecard for beating ${competitor.name} (${competitor.url}).

Available intelligence:
- Recent website changes: ${recentChanges.join('; ') || 'None detected'}
- Currently hiring for: ${recentJobs.join(', ') || 'No data'}
- Customer pain points from reviews: ${painPoints.join('; ') || 'No data'}

Generate a battlecard JSON with these fields:
{
  "overview": "1-2 sentence summary of who they are and their positioning",
  "strengths": ["up to 3 things they do well"],
  "weaknesses": ["up to 4 customer complaints/weaknesses based on reviews"],
  "strategic_moves": ["up to 3 signals from job postings or site changes about where they're heading"],
  "how_to_win": ["up to 5 specific talking points to use against them in sales"],
  "watch_out_for": ["up to 3 things they might do that could hurt you"],
  "last_updated": "${new Date().toISOString()}"
}`

  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a competitive intelligence analyst. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  })

  const content = JSON.parse(r.choices[0].message.content || '{}')

  await db.from('battlecards').upsert({
    competitor_id: competitorId,
    content,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'competitor_id' })

  return content
}
