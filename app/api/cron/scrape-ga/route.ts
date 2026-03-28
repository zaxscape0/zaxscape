import { createServerSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const CRON_SECRET = process.env.CRON_SECRET
const S3 = 'https://images-governmentwindow.s3.us-east-1.amazonaws.com/resources/sites'

// Each entry: county name, S3 slug, exact doc filename (confirmed from bucket listing)
const GA_SOURCES = [
  { county: 'Cherokee',   slug: 'cherokeecountyga',  doc: 'ExcessFunds.xlsx',                              type: 'xlsx' },
  { county: 'Polk',       slug: 'polkcountyga',       doc: 'MasterList-Polk-November_2025_10.14.25.xlsx',  type: 'xlsx' },
  { county: 'Carroll',    slug: 'carrollcountyga',    doc: 'EXCESS_FUNDS_LIST.xls',                        type: 'xls'  },
  { county: 'Forsyth',    slug: 'forsythcountyga',    doc: 'FORSYTH_CO_EXCESS_FUNDS_LIST.pdf',             type: 'pdf'  },
  { county: 'Jackson',    slug: 'jacksoncountyga',    doc: 'Tax_Sale_Overage_ORR_UPDATED_LIST.pdf',        type: 'pdf'  },
  { county: 'Liberty',    slug: 'libertycountyga',    doc: 'Excess_Funds.xlsx',                            type: 'xlsx' },
  { county: 'Lumpkin',    slug: 'lumpkincountyga',    doc: 'excess_funds_list.pdf',                        type: 'pdf'  },
  { county: 'Meriwether', slug: 'meriwethercountyga', doc: 'EXCESS_FUNDS_LIST_FOR_WEB.pdf',                type: 'pdf'  },
  { county: 'Mitchell',   slug: 'mitchellcountyga',   doc: 'EXCESS FUNDS.pdf',                             type: 'pdf'  },
  { county: 'Pickens',    slug: 'pickenscountyga',    doc: 'excess_funds.xlsx',                            type: 'xlsx' },
  { county: 'Walton',     slug: 'waltoncountyga',     doc: 'Excess_funds.pdf',                             type: 'pdf'  },
  { county: 'Wayne',      slug: 'waynecountyga',      doc: 'excessfunds.pdf',                              type: 'pdf'  },
  { county: 'Habersham',  slug: 'habersham',           doc: 'Excess Funds List.pdf',                       type: 'pdf'  },
]

async function fetchDoc(slug: string, doc: string): Promise<ArrayBuffer | null> {
  const url = `${S3}/${slug}/docs/${encodeURIComponent(doc)}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
    if (!res.ok) return null
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('html')) return null
    return res.arrayBuffer()
  } catch { return null }
}

// Extract raw text from PDF binary
function pdfToText(buf: ArrayBuffer): string {
  const str = new TextDecoder('latin1').decode(new Uint8Array(buf))
  const parts: string[] = []
  for (const m of str.matchAll(/BT([\s\S]*?)ET/g)) {
    for (const s of m[1].matchAll(/\(([^)]{1,200})\)/g)) parts.push(s[1])
    for (const h of m[1].matchAll(/<([0-9A-Fa-f]{4,})>/g)) {
      let t = ''
      const hex = h[1]
      for (let i = 0; i < hex.length - 1; i += 2)
        t += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16))
      parts.push(t)
    }
  }
  return parts.join(' ')
}

// Parse XLSX/XLS binary — extract cells with dollar amounts
function xlsToText(buf: ArrayBuffer): string {
  // XLS/XLSX: just extract printable ASCII strings ≥4 chars
  const bytes = new Uint8Array(buf)
  const parts: string[] = []
  let current = ''
  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i]
    if (c >= 32 && c < 127) {
      current += String.fromCharCode(c)
    } else {
      if (current.length >= 3) parts.push(current)
      current = ''
    }
  }
  return parts.join(' ')
}

interface Row {
  owner_name: string
  surplus_amount: number
  sale_date: string | null
  deadline_date: string | null
  county: string
  state: string
  status: string
  source: string
  city: string
}

function parseRows(text: string, county: string): Row[] {
  const rows: Row[] = []
  const dateRe = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/

  // Split on dollar amounts as anchors
  const chunks = text.split(/(?=\$[\d,]+)/)
  for (const chunk of chunks) {
    const amtMatch = chunk.match(/^\$\s*([\d,]+(?:\.\d{1,2})?)/)
    if (!amtMatch) continue
    const amount = parseFloat(amtMatch[1].replace(/,/g, ''))
    if (amount < 100 || amount > 50_000_000) continue

    const nearby = chunk.substring(0, 400)
    const dateMatch = nearby.match(dateRe)
    const name = nearby
      .replace(/\$[\d,. ]+/, '')
      .replace(/[^\w\s'.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 120)

    rows.push({
      owner_name: name || 'Unknown',
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
    return `${year}-${m.padStart(2, '0')}-${day.padStart(2, '0')}`
  } catch { return null }
}

async function scrape() {
  const db = createServerSupabase()
  const log: Record<string, object> = {}
  let totalNew = 0

  for (const { county, slug, doc, type } of GA_SOURCES) {
    const buf = await fetchDoc(slug, doc)
    if (!buf) {
      log[county] = { ok: false, doc }
      continue
    }

    const text = type === 'pdf' ? pdfToText(buf) : xlsToText(buf)
    const rows = parseRows(text, county)
    log[county] = { ok: true, parsed: rows.length, doc }

    if (rows.length === 0) continue

    const { data, error } = await db.from('overages')
      .upsert(rows as never[], {
        onConflict: 'owner_name,county,surplus_amount',
        ignoreDuplicates: true,
      })
      .select('id')

    const added = data?.length || 0
    totalNew += added
    log[county] = { ok: !error, parsed: rows.length, new: added, err: error?.message }
  }

  return { ok: true, totalNew, counties: log, ts: new Date().toISOString() }
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${CRON_SECRET}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return NextResponse.json(await scrape())
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  if (body.secret !== CRON_SECRET) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return NextResponse.json(await scrape())
}
