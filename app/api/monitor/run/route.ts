import { NextRequest, NextResponse } from 'next/server'
import { runMonitorForCompetitor } from '@/lib/monitor'
import { scanJobsForCompetitor } from '@/lib/jobs'
import { sendChangeAlert } from '@/lib/email'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { competitorId } = await req.json()
    if (!competitorId) return NextResponse.json({ error: 'Missing competitorId' }, { status: 400 })

    // Run site monitor + jobs scan in parallel
    const [monitorResult, jobsResult] = await Promise.allSettled([
      runMonitorForCompetitor(competitorId),
      scanJobsForCompetitor(competitorId),
    ])

    const monitor = monitorResult.status === 'fulfilled' ? monitorResult.value : { hasChanged: false, changesDetected: null }
    const jobs = jobsResult.status === 'fulfilled' ? jobsResult.value : { jobs: [], newJobs: [], signal: null }

    if (monitor.hasChanged && monitor.changesDetected) {
      const db = createServerSupabase()
      const { data: c } = await db
        .from('competitors')
        .select('*, profiles(email)')
        .eq('id', competitorId)
        .single()
      if (c?.profiles?.email) {
        await sendChangeAlert(c.profiles.email, c.name, monitor.changesDetected.summary, c.url)
      }
    }

    return NextResponse.json({
      success: true,
      ...monitor,
      jobsFound: jobs.jobs?.length ?? 0,
      newJobs: jobs.newJobs?.length ?? 0,
      jobSignal: jobs.signal,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
