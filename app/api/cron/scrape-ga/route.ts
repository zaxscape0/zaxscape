import { createServerSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const CRON_SECRET = process.env.CRON_SECRET

const GA_COUNTIES = [
  { county: 'Carroll',    slug: 'carrollcountyga',    doc: 'Excess_Funds.pdf' },
  { county: 'Cherokee',   slug: 'cherokeecountyga',   doc: 'Excess_Funds.pdf' },
  { county: 'DeKalb',     slug: 'dekalbcountyga',     doc: 'Excess_Funds.pdf' },
  { county: 'Forsyth',    slug: 'forsythcountyga',    doc: 'Excess_Funds.pdf' },
  { county: 'Gwinnett',   slug: 'gwinnettcountyga',   doc: 'Excess_Funds.pdf' },
  { county: 'Habersham',  slug: 'habersham',           doc: 'Excess_Funds.pdf' },
  { county: 'Hall',       slug: 'hallcountyga',        doc: 'Excess_Funds.pdf' },
  { county: 'Harris',     slug: 'harriscountyga',      doc: 'Excess_Funds.pdf' },
  { county: 'Henry',      slug: 'henry',               doc: 'Excess_Funds.pdf' },
  { county: 'Jackson',    slug: 'jacksoncountyga',     doc: 'Excess_Funds.pdf' },
  { county: 'Liberty',    slug: 'libertycountyga',     doc: 'Excess_Funds.pdf' },
  { county: 'Liberty2',   slug: 'liberty',             doc: 'Excess_Funds.pdf' },
  { county: 'Lumpkin',    slug: 'lumpkincountyga',     doc: 'Excess_Funds.pdf' },
  { county: 'Meriwether', slug: 'meriwethercountyga',  doc: 'Excess_Funds.pdf' },
  { county: 'Mitchell',   slug: 'mitchellcountyga',    doc: 'Excess_Funds.pdf' },
  { county: 'Pickens',    slug: 'pickenscountyga',     doc: 'Excess_Funds.pdf' },
  { county: 'Polk',       slug: 'polkcountyga',        doc: 'Excess_Funds.pdf' },
  { county: 'Troup',      slug: 'troupcountyga',       doc: 'Excess_Funds.pdf' },
  { county: 'Walton',     slug: 'waltoncountyga',      doc: 'Excess_Funds.pdf' },
  { county: 'Wayne',      slug: 'waynecountyga',       doc: 'Excess_Funds.pdf' },
]

const S3 = 'https://images-governmentwindow.s3.us-east-1.amazonaws.com/resources/sites'

async function fetchPdf(slug: string, doc: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(`${S3}/${slug}/docs/${doc}`, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) return null
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('html')) return null
    return res.arrayBuffer()
  } catch { return null }
}

function extractText(buffer: ArrayBuffer): string {
  const str = new TextDecoder('latin1').decode(new Uint8Array(buffer))
  const texts: string[] = []
  for (const m of str.matchAll(/BT([\s\S]*?)ET/g)) {
    for (const s of m[1].matchAll(/\(([^)]{1,200})\)/g)) texts.push(s[1])
    for (const h of m[1].matchAll(/<([0-9A-Fa-f]{2,})>/g)) {
      const hex = h[1]
      let t = ''
      for (let i = 0; i < hex.length - 1; i += 2)
        t += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16))
      texts.push(t)
    }
  }
  return texts.join(' ')
}

function parseRows(text: string, county: string) {
  const rows: object[] = []
  const amountRe = /\$\s*([\d,]+(?:\.\d{1,2})?)/g
  const dateRe = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/

  const chunks = text.split(/(?=\$)/)
  for (const chunk of chunks) {
    const amtMatch = chunk.match(/^\$\s*([\d,]+(?:\.\d{1,2})?)/)
    if (!amtMatch) continue
    const amount = parseFloat(amtMatch[1].replace(/,/g, ''))
    if (amount < 50) continue

    const nearby = chunk.substring(0, 300)
    const dateMatch = nearby.match(dateRe)
    const nameMatch = nearby.replace(/\$[\d,. ]+/, '').trim().substring(0, 120)

    rows.push({
      owner_name: nameMatch || 'Unknown',
      surplus_amount: amount,
      sale_date: dateMatch ? normalizeDate(dateMatch[1]) : null,
      deadline_date: null,
      county,
      state: 'GA',
      status: 'unclaimed',
      source: `${county} County`,
      city: '',
    })
  }
  return rows
}

function normalizeDate(d: string): string | null {
  try {
    const parts = d.split(/[\/\-]/)
    if (parts.length !== 3) return null
    const [m, day, yr] = parts
    const year = yr.length === 2 ? (parseInt(yr) > 50 ? '19' + yr : '20' + yr) : yr
    return `${year}-${m.padStart(2,'0')}-${day.padStart(2,'0')}`
  } catch { return null }
}

async function run() {
  const db = createServerSupabase()
  const log: Record<string, object> = {}
  let totalNew = 0

  for (const { county, slug, doc } of GA_COUNTIES) {
    const buf = await fetchPdf(slug, doc)
    if (!buf) { log[county] = { ok: false }; continue }

    const text = extractText(buf)
    const rows = parseRows(text, county.replace('2',''))

    if (rows.length === 0) { log[county] = { ok: true, parsed: 0 }; continue }

    const { data, error } = await db.from('overages')
      .upsert(rows as never[], { onConflict: 'owner_name,county,surplus_amount', ignoreDuplicates: true })
      .select('id')

    const added = data?.length || 0
    totalNew += added
    log[county] = { ok: !error, parsed: rows.length, new: added, err: error?.message }
  }

  return { totalNew, log, ts: new Date().toISOString() }
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${CRON_SECRET}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return NextResponse.json(await run())
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  if (body.secret !== CRON_SECRET) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return NextResponse.json(await run())
}
