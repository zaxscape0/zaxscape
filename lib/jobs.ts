import { createServerSupabase } from './supabase'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string })

// Common careers page URL patterns to try
function getCareersUrls(baseUrl: string): string[] {
  const domain = baseUrl.replace(/https?:\/\//, '').replace(/\/.*/, '')
  // Strip www and common subdomains to get root domain
  const rootDomain = domain.replace(/^www\./, '')
  return [
    `https://${domain}/careers`,
    `https://www.${rootDomain}/careers`,
    `https://${domain}/jobs`,
    `https://${domain}/about/careers`,
    `https://${domain}/company/careers`,
    `https://${domain}/en/careers`,
    `https://${domain}/careers/jobs`,
    `https://${domain}/work-here`,
    `https://${domain}/join-us`,
    `https://${domain}/work-with-us`,
    `https://jobs.${rootDomain}`,
    `https://careers.${rootDomain}`,
  ]
}

async function scrapeJobs(url: string): Promise<string> {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZaxScapeBot/1.0)' },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    })
    if (!r.ok) return ''
    const html = await r.text()
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000)
  } catch {
    return ''
  }
}

async function extractJobs(content: string, competitorName: string): Promise<any[]> {
  if (!content || content.length < 100) return []
  
  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Extract job postings from this careers page content. Return JSON array of jobs with fields: title, department, location. If no jobs found, return []. Only return the JSON array, nothing else.`
      },
      {
        role: 'user',
        content: `Company: ${competitorName}\nCareers page content:\n${content}`
      }
    ],
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  })
  
  try {
    const parsed = JSON.parse(r.choices[0].message.content || '{"jobs":[]}')
    return parsed.jobs || []
  } catch {
    return []
  }
}

async function analyzeJobSignal(jobs: any[], competitorName: string): Promise<string> {
  if (jobs.length === 0) return ''
  
  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a competitive intelligence analyst. Analyze these job postings and identify strategic signals about what the company is prioritizing. Be concise and actionable (2-3 sentences max).`
      },
      {
        role: 'user',
        content: `${competitorName} is hiring for:\n${jobs.map(j => `- ${j.title} (${j.department || 'unknown dept'})`).join('\n')}\n\nWhat does this tell us about their strategy?`
      }
    ],
    max_tokens: 200,
  })
  
  return r.choices[0].message.content || ''
}

export async function scanJobsForCompetitor(competitorId: string) {
  const db = createServerSupabase()
  const { data: competitor } = await db.from('competitors').select('*').eq('id', competitorId).single()
  if (!competitor) throw new Error('Competitor not found')

  const careersUrls = getCareersUrls(competitor.url)
  let content = ''
  
  for (const url of careersUrls) {
    content = await scrapeJobs(url)
    if (content.length > 200) break
  }

  if (!content) return { jobs: [], signal: null }

  const jobs = await extractJobs(content, competitor.name)
  if (jobs.length === 0) return { jobs: [], signal: null }

  const signal = await analyzeJobSignal(jobs, competitor.name)

  // Get existing jobs to find new ones
  const { data: existing } = await db
    .from('job_postings')
    .select('title')
    .eq('competitor_id', competitorId)

  const existingTitles = new Set((existing || []).map((j: any) => j.title.toLowerCase()))
  const newJobs = jobs.filter((j: any) => !existingTitles.has(j.title.toLowerCase()))

  // Upsert all jobs
  for (const job of jobs) {
    const isNew = !existingTitles.has(job.title.toLowerCase())
    await db.from('job_postings').upsert({
      competitor_id: competitorId,
      title: job.title,
      department: job.department,
      location: job.location,
      signal: isNew ? signal : null,
      is_new: isNew,
      last_seen_at: new Date().toISOString(),
    }, { onConflict: 'competitor_id,title' })
  }

  return { jobs, newJobs, signal }
}
