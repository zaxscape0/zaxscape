import { createServerSupabase } from './supabase'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string })

// Known ATS slugs for companies whose slug differs from domain
const KNOWN_SLUGS: Record<string, { ats: string; slug: string }> = {
  'stryker.com': { ats: 'workday', slug: 'stryker' },
  'stryker': { ats: 'workday', slug: 'stryker' },
  'anduril.com': { ats: 'greenhouse', slug: 'andurilindustries' },
  'anduril': { ats: 'greenhouse', slug: 'andurilindustries' },
  'notion.so': { ats: 'ashby', slug: 'notion' },
  'notion': { ats: 'ashby', slug: 'notion' },
  'lifetime.life': { ats: 'phenom', slug: 'LITIGLOBAL' },
  'lifetime': { ats: 'phenom', slug: 'LITIGLOBAL' },
}

async function fetchAshbyJobs(slug: string): Promise<any[]> {
  const payload = JSON.stringify({
    operationName: 'ApiJobBoardWithTeams',
    variables: { organizationHostedJobsPageName: slug },
    query: 'query ApiJobBoardWithTeams($organizationHostedJobsPageName:String!){jobBoard:jobBoardWithTeams(organizationHostedJobsPageName:$organizationHostedJobsPageName){jobPostings{id title locationName employmentType team{name}}}}'
  })
  try {
    const r = await fetch('https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      body: payload,
      signal: AbortSignal.timeout(8000),
    })
    const data = await r.json()
    const postings = data?.data?.jobBoard?.jobPostings || []
    return postings.map((j: any) => ({
      title: j.title,
      department: j.team?.name || '',
      location: j.locationName || '',
    }))
  } catch { return [] }
}

async function fetchLeverJobs(slug: string): Promise<any[]> {
  try {
    const r = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json&limit=100`, {
      signal: AbortSignal.timeout(6000),
    })
    const data = await r.json()
    if (!Array.isArray(data) || data.length === 0) return []
    return data.map((j: any) => ({
      title: j.text || j.title,
      department: j.categories?.team || j.categories?.department || '',
      location: j.categories?.location || j.categories?.allLocations?.[0] || '',
    }))
  } catch { return [] }
}

async function fetchGreenhouseJobs(slug: string): Promise<any[]> {
  try {
    const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`, {
      signal: AbortSignal.timeout(8000),
    })
    const data = await r.json()
    return (data?.jobs || []).map((j: any) => ({
      title: j.title,
      department: j.departments?.[0]?.name || '',
      location: j.location?.name || '',
    }))
  } catch { return [] }
}

async function fetchWorkdayJobs(slug: string): Promise<any[]> {
  // Try common Workday URL patterns
  const wdNumbers = ['1', '5', '3', '9']
  for (const n of wdNumbers) {
    const wdDomain = `${slug}.wd${n}.myworkdayjobs.com`
    const boardSlug = `${slug}Careers`
    try {
      const r = await fetch(`https://${wdDomain}/wday/cxs/${slug}/${boardSlug}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        body: JSON.stringify({ limit: 50, offset: 0, searchText: '', appliedFacets: {} }),
        signal: AbortSignal.timeout(8000),
      })
      if (!r.ok) continue
      const data = await r.json()
      const jobs = data.jobPostings || []
      if (jobs.length > 0) return jobs.slice(0, 50).map((j: any) => ({
        title: j.title,
        department: j.jobFamilyGroup || '',
        location: j.locationsText || '',
      }))
    } catch { continue }
  }
  return []
}

async function fetchPhenomJobs(slug: string): Promise<any[]> {
  try {
    const r = await fetch(`https://careers.lifetime.life/api/apply/v2/jobs?domain=${slug}&start=0&num=50&exclude_fields=requisition_misc`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    const data = await r.json()
    const jobs = data?.positions || data?.jobs || []
    return jobs.map((j: any) => ({
      title: j.name || j.title,
      department: j.department || j.category || '',
      location: j.location || j.city || '',
    }))
  } catch { return [] }
}

function getCareersUrls(baseUrl: string): string[] {
  const domain = baseUrl.replace(/https:\/\//, '').replace(/\/.*/, '')
  const rootDomain = domain.replace(/^www\./, '')
  return [
    `https://${domain}/careers`,
    `https://www.${rootDomain}/careers`,
    `https://${domain}/jobs`,
    `https://${domain}/about/careers`,
    `https://${domain}/company/careers`,
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
  } catch { return '' }
}

async function extractJobs(content: string, competitorName: string): Promise<any[]> {
  if (!content || content.length < 100) return []
  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Extract all job postings from this careers page text. Return JSON {jobs: [{title, department, location}]}. Extract up to 50 jobs. If no jobs return {jobs:[]}.' },
      { role: 'user', content: `Company: ${competitorName}\n\n${content.slice(0, 6000)}` }
    ],
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })
  try {
    return JSON.parse(r.choices[0].message.content || '{"jobs":[]}').jobs || []
  } catch { return [] }
}

async function analyzeJobSignal(jobs: any[], competitorName: string): Promise<string> {
  if (jobs.length === 0) return ''
  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: "Competitive intelligence analyst. In 2-3 sentences, what do these job postings reveal about this company's strategic priorities?" },
      { role: 'user', content: `${competitorName} is hiring:\n${jobs.slice(0, 30).map((j: any) => `- ${j.title}`).join('\n')}` }
    ],
    max_tokens: 200,
  })
  return r.choices[0].message.content || ''
}

export async function scanJobsForCompetitor(competitorId: string) {
  const db = createServerSupabase()
  const { data: competitor } = await db.from('competitors').select('*').eq('id', competitorId).single()
  if (!competitor) throw new Error('Competitor not found')

  const domain = competitor.url.replace(/https?:\/\//, '').replace(/\/.*/, '').replace(/^www\./, '').toLowerCase()
  const slug = domain.replace(/\.(com|io|app|co|dev|ai|so|net|org|life|industries)$/, '')

  let jobs: any[] = []

  // Check known slugs first (companies where slug != domain)
  const known = KNOWN_SLUGS[domain] || KNOWN_SLUGS[slug]
  if (known) {
    if (known.ats === 'ashby') jobs = await fetchAshbyJobs(known.slug)
    else if (known.ats === 'lever') jobs = await fetchLeverJobs(known.slug)
    else if (known.ats === 'greenhouse') jobs = await fetchGreenhouseJobs(known.slug)
    else if (known.ats === 'workday') jobs = await fetchWorkdayJobs(known.slug)
    else if (known.ats === 'phenom') jobs = await fetchPhenomJobs(known.slug)
  }

  // Auto-detect ATS by trying each in order
  if (jobs.length === 0) jobs = await fetchAshbyJobs(slug)
  if (jobs.length === 0) jobs = await fetchLeverJobs(slug)
  if (jobs.length === 0) jobs = await fetchGreenhouseJobs(slug)
  if (jobs.length === 0) jobs = await fetchGreenhouseJobs(domain.replace(/\./g, ''))
  if (jobs.length === 0) jobs = await fetchGreenhouseJobs(`${slug}industries`)
  if (jobs.length === 0) jobs = await fetchWorkdayJobs(slug)

  // Fallback: scrape careers pages
  if (jobs.length === 0) {
    for (const url of getCareersUrls(competitor.url)) {
      const content = await scrapeJobs(url)
      if (content.length > 200) {
        jobs = await extractJobs(content, competitor.name)
        if (jobs.length > 0) break
      }
    }
  }

  if (jobs.length === 0) return { jobs: [], newJobs: [], signal: null }

  const signal = await analyzeJobSignal(jobs, competitor.name)

  const { data: existing } = await db
    .from('job_postings')
    .select('title')
    .eq('competitor_id', competitorId)
  const existingTitles = new Set((existing || []).map((j: any) => j.title.toLowerCase()))
  const isFirstScan = existingTitles.size === 0
  const newJobs = jobs.filter((j: any) => !existingTitles.has(j.title.toLowerCase()))
  const now = new Date().toISOString()

  if (newJobs.length > 0) {
    await db.from('job_postings').insert(
      newJobs.map((job: any) => ({
        competitor_id: competitorId,
        title: job.title,
        department: job.department || null,
        location: job.location || null,
        signal: signal || null,
        is_new: !isFirstScan,
        first_seen_at: now,
        last_seen_at: now,
      }))
    )
  }

  // Update last_seen on existing active jobs
  const activeTitles = jobs.map((j: any) => j.title)
  if (activeTitles.length > 0) {
    await db.from('job_postings')
      .update({ last_seen_at: now, is_new: false })
      .eq('competitor_id', competitorId)
      .in('title', activeTitles)
  }

  return { jobs, newJobs, signal }
}
