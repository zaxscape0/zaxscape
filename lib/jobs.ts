import { createServerSupabase } from './supabase'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string })

// Try Ashby ATS API first - many modern SaaS companies use this
async function fetchAshbyJobs(domain: string): Promise<any[]> {
  const slug = domain.replace(/\.(com|io|app|co|dev|ai|so|net|org)$/, '').replace(/^www\./, '')
  const payload = JSON.stringify({
    operationName: 'ApiJobBoardWithTeams',
    variables: { organizationHostedJobsPageName: slug },
    query: 'query ApiJobBoardWithTeams($organizationHostedJobsPageName:String!){jobBoard:jobBoardWithTeams(organizationHostedJobsPageName:$organizationHostedJobsPageName){jobPostings{id title locationName employmentType team{name}}}}'
  })
  try {
    const r = await fetch('https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'ZaxScapeBot/1.0' },
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
  } catch {
    return []
  }
}

// Also try Lever ATS
async function fetchLeverJobs(domain: string): Promise<any[]> {
  const slug = domain.replace(/\.(com|io|app|co|dev|ai|so|net|org)$/, '').replace(/^www\./, '')
  try {
    const r = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json&limit=50`, {
      signal: AbortSignal.timeout(6000),
    })
    const data = await r.json()
    if (!Array.isArray(data)) return []
    return data.map((j: any) => ({
      title: j.text || j.title,
      department: j.categories?.team || j.categories?.department || '',
      location: j.categories?.location || j.categories?.allLocations?.[0] || '',
    }))
  } catch {
    return []
  }
}

// Also try Greenhouse ATS
async function fetchGreenhouseJobs(domain: string): Promise<any[]> {
  const slug = domain.replace(/\.(com|io|app|co|dev|ai|so|net|org)$/, '').replace(/^www\./, '')
  try {
    const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`, {
      signal: AbortSignal.timeout(6000),
    })
    const data = await r.json()
    const jobs = data?.jobs || []
    return jobs.map((j: any) => ({
      title: j.title,
      department: j.departments?.[0]?.name || '',
      location: j.location?.name || '',
    }))
  } catch {
    return []
  }
}

function getCareersUrls(baseUrl: string): string[] {
  const domain = baseUrl.replace(/https?:\/\//, '').replace(/\/.*/, '')
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
        content: `You are parsing a careers page. Extract all job postings you can find. The content may be dense unformatted text. Look for patterns like "Job Title Location" or department names followed by role names. Return JSON with field "jobs" as array. Each job: {"title": string, "department": string, "location": string}. Extract as many as you can find, up to 50. If genuinely no jobs, return {"jobs":[]}.`
      },
      {
        role: 'user',
        content: `Company: ${competitorName}\n\nCareers page text (extract all job titles you see):\n${content.slice(0, 6000)}`
      }
    ],
    max_tokens: 2000,
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
        content: `${competitorName} is hiring for:\n${jobs.slice(0, 30).map(j => `- ${j.title} (${j.department || 'unknown dept'})`).join('\n')}\n\nWhat does this tell us about their strategy?`
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

  const domain = competitor.url.replace(/https?:\/\//, '').replace(/\/.*/, '').replace(/^www\./, '')

  // Try all ATS APIs in order
  let jobs: any[] = []

  jobs = await fetchAshbyJobs(domain)

  if (jobs.length === 0) {
    jobs = await fetchLeverJobs(domain)
  }

  if (jobs.length === 0) {
    jobs = await fetchGreenhouseJobs(domain)
  }

  // Fall back to scraping
  if (jobs.length === 0) {
    const careersUrls = getCareersUrls(competitor.url)
    let content = ''
    for (const url of careersUrls) {
      content = await scrapeJobs(url)
      if (content.length > 200) break
    }
    if (content) {
      jobs = await extractJobs(content, competitor.name)
    }
  }

  if (jobs.length === 0) return { jobs: [], newJobs: [], signal: null }

  const signal = await analyzeJobSignal(jobs, competitor.name)

  // Get existing jobs to find what's new
  const { data: existing } = await db
    .from('job_postings')
    .select('title')
    .eq('competitor_id', competitorId)
  const existingTitles = new Set((existing || []).map((j: any) => j.title.toLowerCase()))

  const newJobs = jobs.filter((j: any) => !existingTitles.has(j.title.toLowerCase()))
  const now = new Date().toISOString()

  // Mark all existing as last_seen so we can detect removed jobs
  await db.from('job_postings')
    .update({ last_seen_at: now })
    .eq('competitor_id', competitorId)
    .in('title', jobs.map((j: any) => j.title))

  // Insert new jobs
  if (newJobs.length > 0) {
    await db.from('job_postings').insert(
      newJobs.map((job: any) => ({
        competitor_id: competitorId,
        title: job.title,
        department: job.department || null,
        location: job.location || null,
        signal: signal || null,
        is_new: true,
        first_seen_at: now,
        last_seen_at: now,
      }))
    )
  }

  // On very first scan (no existing), insert all jobs
  if (existingTitles.size === 0 && jobs.length > 0) {
    // Already inserted above as newJobs == jobs
  }

  return { jobs, newJobs, signal }
}
