'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const m = { fontFamily: '"IBM Plex Mono", monospace' }
const STATES = ['All','FL','TX','GA','OH','NC','IL','MA','CA','NY']

function fmt(n: number) {
  if (n >= 1000000) return `$${(n/1000000).toFixed(2)}M`
  if (n >= 1000) return `$${Math.round(n/1000)}k`
  return `$${n.toLocaleString()}`
}

function daysLeft(deadline: string | null) {
  if (!deadline) return null
  const d = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  return d
}

export default function OveragesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [state, setState] = useState('')
  const [search, setSearch] = useState('')
  const [minSurplus, setMinSurplus] = useState('0')
  const [statusFilter, setStatusFilter] = useState('unclaimed')
  const [showExpired, setShowExpired] = useState(false)
  const [expiredCount, setExpiredCount] = useState(0)
  const PAGE = 25

  const load = useCallback(async (pg: number, st: string, s: string, ms: string, sf: string, se: boolean = false) => {
    setLoading(true)
    const db = supabase
    let q = db.from('overages').select('*', { count: 'exact' })
    if (st) q = q.eq('state', st)
    if (sf) q = q.eq('status', sf)
    if (s) q = q.ilike('owner_name', `%${s}%`)
    if (ms && parseInt(ms) > 0) q = q.gte('surplus_amount', parseInt(ms))
    if (!se) {
      const today = new Date().toISOString().slice(0, 10)
      q = q.or(`deadline_date.gt.${today},deadline_date.is.null`)
    }
    q = q.order('surplus_amount', { ascending: false })
         .range(pg * PAGE, pg * PAGE + PAGE - 1)
    const { data, count } = await q
    setRows(data || [])
    setTotal(count || 0)
    // Count expired for toggle badge
    if (!se) {
      const { count: ec } = await supabase.from('overages').select('*', { count: 'exact', head: true })
        .lte('deadline_date', today)
        .eq('status', sf || 'unclaimed')
      setExpiredCount(ec || 0)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load(0, '', '', '0', 'unclaimed', false) }, [load])

  function applyFilters() { setPage(0); load(0, state, search, minSurplus, statusFilter, showExpired) }
  function goPage(p: number) { setPage(p); load(p, state, search, minSurplus, statusFilter, showExpired) }

  const totalPages = Math.ceil(total / PAGE)

  return (
    <div style={{ ...m, background: '#0a0a0a', minHeight: '100vh', padding: '32px 24px', color: '#e0e0e0' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Tax Deed Overages</span>
          <span style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em' }}>surplus fund tracker</span>
        </div>
        <p style={{ ...m, fontSize: '12px', color: '#666', margin: 0, maxWidth: '520px' }}>
          When a property sells at tax auction for more than what's owed, the surplus belongs to the former owner. Most never claim it. These are the unclaimed funds.
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Unclaimed Funds', value: `${total.toLocaleString()} cases` },
          { label: 'Avg Surplus', value: rows.length ? fmt(rows.reduce((a,r)=>a+r.surplus_amount,0)/rows.length) : '--' },
          { label: 'Largest', value: rows.length ? fmt(Math.max(...rows.map(r=>r.surplus_amount))) : '--' },
          { label: 'States', value: '10+' },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid #1a1a1a', padding: '14px 16px' }}>
            <div style={{ ...m, fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ ...m, fontSize: '16px', fontWeight: 700, color: '#fff' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ border: '1px solid #1a1a1a', padding: '20px 16px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
        <div>
          <label style={{ ...m, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#555', display: 'block', marginBottom: '8px' }}>State</label>
          <select value={state} onChange={e => setState(e.target.value)} className="zax-input" style={{ marginBottom: 0 }}>
            {STATES.map(s => <option key={s} value={s === 'All' ? '' : s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ ...m, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#555', display: 'block', marginBottom: '8px' }}>Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="zax-input" style={{ marginBottom: 0 }}>
            <option value="unclaimed">Unclaimed only</option>
            <option value="">All</option>
            <option value="claimed">Claimed</option>
          </select>
        </div>
        <div>
          <label style={{ ...m, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#555', display: 'block', marginBottom: '8px' }}>Min Surplus ($)</label>
          <input value={minSurplus} onChange={e => setMinSurplus(e.target.value)} placeholder="10000" className="zax-input" style={{ marginBottom: 0 }} />
        </div>
        <div>
          <label style={{ ...m, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#555', display: 'block', marginBottom: '8px' }}>Search Owner</label>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Last name..." className="zax-input" style={{ marginBottom: 0 }} />
        </div>
        <button onClick={applyFilters} className="zax-btn" style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>Search</button>
      </div>

      {/* Results count */}
      <div style={{ ...m, fontSize: '11px', color: '#666', marginBottom: '12px' }}>
        {total.toLocaleString()} records · sorted by largest surplus
        {expiredCount > 0 && !showExpired && (
          <button onClick={() => { setShowExpired(true); load(page, state, search, minSurplus, statusFilter, true) }}
            style={{ ...m, marginLeft: '16px', background: 'none', border: '1px solid #333', color: '#555', padding: '3px 12px', fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase' as any, letterSpacing: '0.1em' }}>
            + {expiredCount} expired (hidden)
          </button>
        )}
        {showExpired && (
          <button onClick={() => { setShowExpired(false); load(page, state, search, minSurplus, statusFilter, false) }}
            style={{ ...m, marginLeft: '16px', background: 'none', border: '1px solid #f59e0b', color: '#f59e0b', padding: '3px 12px', fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase' as any, letterSpacing: '0.1em' }}>
            ✓ showing expired
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #1a1a1a', overflowX: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr', gap: '0', borderBottom: '1px solid #1a1a1a', padding: '10px 16px', background: '#111' }}>
          {['Owner','Property','County','State','Surplus','Sale Date','Deadline'].map(h => (
            <div key={h} style={{ ...m, fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#555' }}>Loading...</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#555' }}>No records found</div>
        ) : rows.map((r, i) => {
          const dl = daysLeft(r.deadline_date)
          const urgent = dl !== null && dl < 90 && dl > 0
          const expired = dl !== null && dl <= 0
          return (
            <div key={r.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr',
              gap: '0', padding: '12px 16px',
              borderBottom: '1px solid #111',
              background: i % 2 === 0 ? '#0a0a0a' : '#0d0d0d',
              alignItems: 'center'
            }}>
              <div style={{ ...m, fontSize: '13px', color: '#ccc' }}>{r.owner_name}</div>
              <div>
                <div style={{ ...m, fontSize: '12px', color: '#aaa' }}>{r.property_address}</div>
                <div style={{ ...m, fontSize: '11px', color: '#555' }}>{r.city}</div>
              </div>
              <div style={{ ...m, fontSize: '12px', color: '#777' }}>{r.county}</div>
              <div style={{ ...m, fontSize: '12px', color: '#777' }}>{r.state}</div>
              <div style={{ ...m, fontSize: '14px', fontWeight: 700, color: r.surplus_amount >= 50000 ? '#4ade80' : '#a3e635' }}>
                {fmt(r.surplus_amount)}
              </div>
              <div style={{ ...m, fontSize: '11px', color: '#666' }}>{r.sale_date?.slice(0,10) || '--'}</div>
              <div style={{ ...m, fontSize: '11px', color: expired ? '#ef4444' : urgent ? '#f59e0b' : '#666' }}>
                {expired ? 'EXPIRED' : dl !== null ? `${dl}d left` : '--'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
          <button onClick={() => goPage(Math.max(0, page-1))} disabled={page === 0} className="zax-btn" style={{ padding: '6px 12px', opacity: page === 0 ? 0.4 : 1 }}>←</button>
          <span style={{ ...m, fontSize: '11px', color: '#666' }}>Page {page+1} of {totalPages}</span>
          <button onClick={() => goPage(Math.min(totalPages-1, page+1))} disabled={page >= totalPages-1} className="zax-btn" style={{ padding: '6px 12px', opacity: page >= totalPages-1 ? 0.4 : 1 }}>→</button>
        </div>
      )}

      {/* Info box */}
      <div style={{ border: '1px solid #1a1a1a', padding: '20px', marginTop: '32px', borderLeft: '3px solid #3b82f6' }}>
        <div style={{ ...m, fontSize: '12px', color: '#888', lineHeight: 1.8 }}>
          <strong style={{ color: '#aaa' }}>How to claim:</strong> Contact the county clerk where the property was sold. 
          Most counties require proof of former ownership (deed) and a claim form. 
          Deadlines vary by state — typically 1–5 years. After expiration, funds revert to the county.
          A surplus recovery attorney can help for a percentage fee (typically 20–40%).
        </div>
      </div>
    </div>
  )
}
