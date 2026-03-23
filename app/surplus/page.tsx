'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const m = { fontFamily: '"IBM Plex Mono", monospace' }
const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

export default function SurplusPage() {
  const [lastName, setLastName] = useState('')
  const [state, setState] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function search(e: React.FormEvent) {
    e.preventDefault()
    if (!lastName.trim()) return
    setLoading(true)
    const params = new URLSearchParams({ name: lastName.trim() })
    if (state) params.set('state', state)
    router.push(`/surplus/results?${params.toString()}`)
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#e0e0e0' }}>
      {/* Nav */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '0 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ ...m, fontSize: '14px', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>ZaxScape</a>
          <a href="/dashboard" style={{ ...m, fontSize: '12px', color: '#555', textDecoration: 'none' }}>Property Intelligence →</a>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 40px' }}>
        <div style={{ ...m, fontSize: '11px', color: '#3b82f6', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>
          Tax Deed Surplus Recovery
        </div>
        <h1 style={{ ...m, fontSize: '36px', fontWeight: 700, color: '#fff', margin: '0 0 20px', lineHeight: 1.2 }}>
          The government may owe you money.
        </h1>
        <p style={{ ...m, fontSize: '15px', color: '#888', lineHeight: 1.8, margin: '0 0 48px' }}>
          When a property is sold at a tax deed auction for more than what was owed in taxes,
          the surplus belongs to the former owner. Millions of dollars go unclaimed every year
          because people don't know it exists.
        </p>

        {/* Search form */}
        <div style={{ border: '1px solid #2a2a2a', padding: '36px', background: '#0f0f0f' }}>
          <div style={{ ...m, fontSize: '13px', color: '#aaa', marginBottom: '24px', fontWeight: 600 }}>
            Search for unclaimed funds by name
          </div>
          <form onSubmit={search}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', alignItems: 'end' }}>
              <div>
                <label style={{ ...m, fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '8px' }}>Last Name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Enter last name..."
                  required
                  style={{ ...m, width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '12px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ ...m, fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '8px' }}>State (optional)</label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  style={{ ...m, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '12px 14px', fontSize: '14px', outline: 'none' }}
                >
                  <option value="">All states</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ ...m, background: '#fff', color: '#000', border: 'none', padding: '12px 28px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}
              >
                {loading ? 'Searching...' : 'Search →'}
              </button>
            </div>
          </form>
        </div>

        {/* How it works */}
        <div style={{ marginTop: '64px' }}>
          <div style={{ ...m, fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '28px' }}>How it works</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
            {[
              { n: '01', title: 'Search your name', desc: 'Enter your last name and state to search our database of unclaimed tax deed surplus funds.' },
              { n: '02', title: 'Found a match?', desc: 'Click "Claim This Surplus" and fill out a short form. We review your case within 24 hours.' },
              { n: '03', title: 'We file, you collect', desc: 'We handle all the paperwork with the county. You receive your funds minus our recovery fee.' },
            ].map(s => (
              <div key={s.n} style={{ borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
                <div style={{ ...m, fontSize: '11px', color: '#3b82f6', marginBottom: '10px' }}>{s.n}</div>
                <div style={{ ...m, fontSize: '13px', color: '#ccc', fontWeight: 600, marginBottom: '8px' }}>{s.title}</div>
                <div style={{ ...m, fontSize: '12px', color: '#666', lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust signals */}
        <div style={{ borderTop: '1px solid #1a1a1a', marginTop: '64px', paddingTop: '32px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {[
            '✓ No upfront cost',
            '✓ Recovery fee only on success',
            '✓ Licensed in all 50 states',
            '✓ 24-hour response',
          ].map(t => <span key={t} style={{ ...m, fontSize: '12px', color: '#555' }}>{t}</span>)}
        </div>
      </div>
    </div>
  )
}
