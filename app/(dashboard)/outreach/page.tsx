'use client'
import { useState, useEffect, useCallback } from 'react'

const m = { fontFamily: '"IBM Plex Mono", monospace' }
const SC: Record<string,string> = {
  new: '#555', contacted: '#3b82f6',
  responded: '#f59e0b', claimed: '#4ade80', dead: '#ef4444'
}
const SL: Record<string,string> = {
  new: 'New', contacted: 'Contacted',
  responded: 'Responded', claimed: 'Claimed', dead: 'Dead'
}
function fmt(n: number) {
  if (n >= 1000000) return '$' + (n/1000000).toFixed(2) + 'M'
  if (n >= 1000) return '$' + Math.round(n/1000) + 'k'
  return '$' + n.toLocaleString()
}

function LetterModal({ c, onClose }: { c: any, onClose: () => void }) {
  const amt = fmt(c.surplus_amount)
  const county = c.county + ' County, ' + c.state
  const deadline = c.deadline_date ? new Date(c.deadline_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '[DEADLINE DATE]'
  const parts = [
    '[Your Name]',
    '[Your Address, City, State ZIP]',
    '[Phone] | [Email]',
    '',
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    '',
    'Re: Unclaimed Funds of ' + amt + ' — ' + c.county + ' County, Georgia',
    (c.case_number ? 'Case No: ' + c.case_number : ''),
    '',
    'Dear ' + c.owner_name + ',',
    '',
    'I am writing to inform you that ' + amt + ' is being held in your name by the ' + c.county + ' County Tax Commissioner\u2019s office in Georgia.',
    '',
    'These funds resulted from the tax deed sale of your property' + (c.property_address ? ' at ' + c.property_address : '') + '. When the property sold for more than the taxes owed, the difference — ' + amt + ' — became legally yours. The county is required by law to hold this money until you claim it.',
    '',
    'YOU HAVE A DEADLINE.',
    '',
    'Under Georgia law (O.C.G.A. § 48-4-5), unclaimed surplus funds are transferred to the state after five years. Your deadline to claim these funds is ' + deadline + '. After that date, this money is gone permanently.',
    '',
    'WHAT I DO:',
    '',
    'I am a surplus fund recovery specialist. I help property owners navigate the county claim process — handling all paperwork, filing requirements, and county correspondence on your behalf. My fee is a percentage of the recovered funds, paid only after you receive your money. There is no cost to you upfront, and no risk.',
    '',
    'NEXT STEPS:',
    '',
    'Call or text me at [PHONE] or reply to this letter. I will verify your eligibility at no charge and walk you through exactly what happens next. The process typically takes 4-8 weeks once paperwork is filed.',
    '',
    'This letter is time-sensitive. Please respond before ' + deadline + '.',
    '',
    'Sincerely,',
    '',
    '[Your Name]',
    '[Phone] | [Email]',
    '',
    'This is not a government communication. I am a private recovery specialist.',
  ].filter(l => l !== null && l !== undefined)
  const txt = parts.join('\n')
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#111', border: '1px solid #333', borderRadius: 8, padding: 24, width: '90%', maxWidth: 600, maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ ...m, color: '#4ade80', fontWeight: 700 }}>Letter Template</span>
          <button onClick={onClose} style={{ ...m, background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18 }}>x</button>
        </div>
        <textarea defaultValue={txt} style={{ ...m, width: '100%', height: 280, background: '#1a1a1a', border: '1px solid #333', color: '#ccc', fontSize: 12, padding: 12, borderRadius: 4, resize: 'vertical', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={() => navigator.clipboard.writeText(txt)} style={{ ...m, background: '#4ade80', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Copy</button>
          <button onClick={onClose} style={{ ...m, background: '#222', color: '#888', border: '1px solid #333', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Close</button>
        </div>
      </div>
    </div>
  )
}

function EditModal({ c, onSave, onClose }: { c: any, onSave: (id: string, u: any) => void, onClose: () => void }) {
  const [f, setF] = useState({
    mailing_address: c.mailing_address || '',
    phone: c.phone || '',
    email: c.email || '',
    status: c.status || 'new',
    contact_method: c.contact_method || '',
    notes: c.notes || '',
  })
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#111', border: '1px solid #333', borderRadius: 8, padding: 24, width: '90%', maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ ...m, color: '#ccc', fontWeight: 700, fontSize: 13 }}>{c.owner_name}</span>
          <button onClick={onClose} style={{ ...m, background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18 }}>x</button>
        </div>
        {(['mailing_address', 'phone', 'email'] as const).map(k => (
          <div key={k} style={{ marginBottom: 10 }}>
            <label style={{ ...m, color: '#555', fontSize: 11, display: 'block', marginBottom: 3 }}>{k.replace('_', ' ')}</label>
            <input value={(f as any)[k]} onChange={e => setF(p => ({ ...p, [k]: e.target.value }))}
              style={{ ...m, width: '100%', background: '#1a1a1a', border: '1px solid #333', color: '#ccc', fontSize: 12, padding: '7px 10px', borderRadius: 4, boxSizing: 'border-box' }} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ ...m, color: '#555', fontSize: 11, display: 'block', marginBottom: 3 }}>Status</label>
            <select value={f.status} onChange={e => setF(p => ({ ...p, status: e.target.value }))}
              style={{ ...m, width: '100%', background: '#1a1a1a', border: '1px solid #333', color: SC[f.status] || '#ccc', fontSize: 12, padding: '7px 10px', borderRadius: 4 }}>
              {Object.entries(SL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ ...m, color: '#555', fontSize: 11, display: 'block', marginBottom: 3 }}>Method</label>
            <select value={f.contact_method} onChange={e => setF(p => ({ ...p, contact_method: e.target.value }))}
              style={{ ...m, width: '100%', background: '#1a1a1a', border: '1px solid #333', color: '#ccc', fontSize: 12, padding: '7px 10px', borderRadius: 4 }}>
              <option value=''>none</option>
              <option value='mail'>Mail</option>
              <option value='phone'>Phone</option>
              <option value='email'>Email</option>
            </select>
          </div>
        </div>
        <textarea value={f.notes} onChange={e => setF(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder='Notes...'
          style={{ ...m, width: '100%', background: '#1a1a1a', border: '1px solid #333', color: '#ccc', fontSize: 12, padding: '7px 10px', borderRadius: 4, resize: 'vertical', boxSizing: 'border-box', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { onSave(c.id, f); onClose() }} style={{ ...m, background: '#4ade80', color: '#000', border: 'none', padding: '8px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Save</button>
          <button onClick={onClose} style={{ ...m, background: '#222', color: '#888', border: '1px solid #333', padding: '8px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function OutreachPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sf, setSf] = useState('all')
  const [editC, setEditC] = useState<any | null>(null)
  const [letterC, setLetterC] = useState<any | null>(null)
  const [page, setPage] = useState(0)
  const PAGE = 50

  const load = useCallback(async (pg: number, s: string) => {
    setLoading(true)
    const p = new URLSearchParams({ page: String(pg) })
    if (s !== 'all') p.set('status', s)
    const r = await fetch('/api/outreach?' + p)
    const j = await r.json()
    setContacts(j.data || [])
    setTotal(j.count || 0)
    setLoading(false)
  }, [])

  useEffect(() => { load(0, 'all') }, [load])

  const update = async (id: string, u: any) => {
    await fetch('/api/outreach/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...u, last_contact_at: new Date().toISOString() }) })
    load(page, sf)
  }
  const remove = async (id: string) => {
    if (!confirm('Remove?')) return
    await fetch('/api/outreach/' + id, { method: 'DELETE' })
    load(page, sf)
  }
  const markSent = async (id: string) => {
    await fetch('/api/outreach/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'contacted', contact_method: 'mail', letter_sent_at: new Date().toISOString(), last_contact_at: new Date().toISOString() }) })
    load(page, sf)
  }

  const tv = contacts.reduce((s, c) => s + (c.surplus_amount || 0), 0)
  const statuses = ['all', 'new', 'contacted', 'responded', 'claimed', 'dead']

  return (
    <div style={{ padding: '24px', background: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ ...m, color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>Outreach Pipeline</h1>
        <div style={{ ...m, color: '#555', fontSize: 12, marginTop: 4 }}>{total} contacts &middot; {fmt(tv)} in pipeline</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => { setSf(s); setPage(0); load(0, s) }}
            style={{ ...m, fontSize: 11, padding: '5px 12px', borderRadius: 20, background: sf === s ? (SC[s] || '#4ade80') : '#1a1a1a', color: sf === s ? '#000' : '#666', border: '1px solid ' + (sf === s ? 'transparent' : '#333'), cursor: 'pointer', fontWeight: sf === s ? 700 : 400 }}>
            {s === 'all' ? 'All' : SL[s]}
          </button>
        ))}
      </div>
      {!loading && contacts.length === 0 && (
        <div style={{ ...m, color: '#444', fontSize: 13, textAlign: 'center', marginTop: 80 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>&#x1F4CB;</div>
          <div>{sf === 'all' ? 'No contacts yet.' : 'No ' + SL[sf]?.toLowerCase() + ' contacts.'}</div>
          {sf === 'all' && <div style={{ color: '#333', marginTop: 8 }}>Add from Overages tab using + Pipeline</div>}
        </div>
      )}
      {contacts.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 110px', padding: '8px 12px', borderBottom: '1px solid #222', marginBottom: 4 }}>
            {['Owner', 'Amount', 'County', 'Status', 'Last Contact', ''].map(h => (
              <div key={h} style={{ ...m, fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</div>
            ))}
          </div>
          {contacts.map(c => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 110px', padding: '10px 12px', borderBottom: '1px solid #111', alignItems: 'center', background: c.status === 'claimed' ? 'rgba(74,222,128,0.04)' : 'transparent' }}>
              <div>
                <div style={{ ...m, fontSize: 12, color: '#ccc' }}>{c.owner_name}</div>
                {c.mailing_address && <div style={{ ...m, fontSize: 10, color: '#3b82f6' }}>{c.mailing_address}</div>}
              </div>
              <div style={{ ...m, fontSize: 13, fontWeight: 700, color: '#a3e635' }}>{fmt(c.surplus_amount)}</div>
              <div style={{ ...m, fontSize: 11, color: '#666' }}>{c.county}, {c.state}</div>
              <div>
                <span style={{ ...m, fontSize: 10, padding: '2px 8px', borderRadius: 12, background: SC[c.status] + '22', color: SC[c.status], border: '1px solid ' + SC[c.status] + '44' }}>{SL[c.status]}</span>
              </div>
              <div style={{ ...m, fontSize: 10, color: '#444' }}>{c.last_contact_at ? new Date(c.last_contact_at).toLocaleDateString() : '-'}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setLetterC(c)} style={{ ...m, background: '#1a2a1a', color: '#4ade80', border: '1px solid #2a4a2a', padding: '4px 7px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Letter</button>
                <button onClick={() => markSent(c.id)} style={{ ...m, background: '#1a1a2a', color: '#3b82f6', border: '1px solid #2a2a4a', padding: '4px 7px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Sent</button>
                <button onClick={() => setEditC(c)} style={{ ...m, background: '#1a1a1a', color: '#888', border: '1px solid #333', padding: '4px 7px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Edit</button>
                <button onClick={() => remove(c.id)} style={{ ...m, background: 'none', color: '#333', border: 'none', padding: '4px 6px', cursor: 'pointer', fontSize: 11 }}>x</button>
              </div>
            </div>
          ))}
          {total > PAGE && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
              <button disabled={page === 0} onClick={() => { setPage(p => p - 1); load(page - 1, sf) }} style={{ ...m, background: '#1a1a1a', color: page === 0 ? '#333' : '#888', border: '1px solid #333', padding: '6px 14px', borderRadius: 4, fontSize: 12 }}>Prev</button>
              <span style={{ ...m, color: '#555', fontSize: 12, lineHeight: '32px' }}>{page * PAGE + 1}-{Math.min((page + 1) * PAGE, total)} of {total}</span>
              <button disabled={(page + 1) * PAGE >= total} onClick={() => { setPage(p => p + 1); load(page + 1, sf) }} style={{ ...m, background: '#1a1a1a', color: (page + 1) * PAGE >= total ? '#333' : '#888', border: '1px solid #333', padding: '6px 14px', borderRadius: 4, fontSize: 12 }}>Next</button>
            </div>
          )}
        </>
      )}
      {editC && <EditModal c={editC} onSave={update} onClose={() => setEditC(null)} />}
      {letterC && <LetterModal c={letterC} onClose={() => setLetterC(null)} />}
    </div>
  )
}
