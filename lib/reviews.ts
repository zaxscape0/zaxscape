import { createServerSupabase } from './supabase'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string })

async function scrapeReviews(url: string): Promise<string> {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZaxScapeBot/1.0)' },
      signal: AbortSignal.timeout(12000),
    })
    if (!r.ok) return ''
    const html = await r.text()
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 10000)
  } catch {
    return ''
  }
}

function getReviewUrls(competitorName: string, domain: string): Record<string, string> {
  const slug = competitorName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
  return {
    g2: `https://www.g2.com/products/${slug}/reviews`,
    capterra: `https://www.capterra.com/p/search?q=${encodeURIComponent(competitorName)}`,
    trustpilot: `https://www.trustpilot.com/search?query=${encodeURIComponent(domain)}`,
  }
}

async function extractReviews(content: string, source: string, competitorName: string): Promise<any[]> {
  if (!content || content.length < 100) return []
  
  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Extract user reviews from this ${source} page. Return JSON with field "reviews" as array. Each review: {title, body (max 200 chars), rating (1-5), sentiment ("positive"|"negative"|"neutral"), pain_point (if negative, what specifically frustrated them), reviewer_role}. Max 10 reviews. Only return JSON.`
      },
      {
        role: 'user',
        content: `${source} reviews for ${competitorName}:\n${content}`
      }
    ],
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  })
  
  try {
    const parsed = JSON.parse(r.choices[0].message.content || '{"reviews":[]}')
    return parsed.reviews || []
  } catch {
    return []
  }
}

export async function scanReviewsForCompetitor(competitorId: string) {
  const db = createServerSupabase()
  const { data: competitor } = await db.from('competitors').select('*').eq('id', competitorId).single()
  if (!competitor) throw new Error('Competitor not found')

  const domain = competitor.url.replace(/https?:\/\//, '').replace(/\/.*/, '')
  const reviewUrls = getReviewUrls(competitor.name, domain)
  
  const allReviews: any[] = []
  
  for (const [source, url] of Object.entries(reviewUrls)) {
    const content = await scrapeReviews(url)
    if (content.length > 200) {
      const reviews = await extractReviews(content, source, competitor.name)
      for (const review of reviews) {
        allReviews.push({ ...review, source })
      }
    }
  }

  // Store reviews
  for (const review of allReviews) {
    await db.from('reviews').upsert({
      competitor_id: competitorId,
      source: review.source,
      rating: review.rating,
      title: review.title,
      body: review.body,
      sentiment: review.sentiment,
      pain_point: review.pain_point,
      reviewer_role: review.reviewer_role,
      fetched_at: new Date().toISOString(),
    }, { onConflict: 'competitor_id,source,title' })
  }

  const painPoints = allReviews.filter(r => r.sentiment === 'negative' && r.pain_point).map(r => r.pain_point)
  return { reviews: allReviews, painPoints }
}
