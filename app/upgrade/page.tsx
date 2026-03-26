'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const m = { fontFamily: '"IBM Plex Mono", monospace' }

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)

  const checkout = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'agent', email: session?.user?.email }),
    })
    const { url, error } = await res.json()
    if (error) { alert(error); setLoading(false); return }
    window.location.href = url
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <div style={{ ...m, fontSize: 12, color: '#4ade80', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 24 }}>// upgrade your plan</div>
        <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: -2, margin: '0 0 16px', lineHeight: 1 }}>Agent Plan</h1>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#4ade80', marginBottom: 8 }}>$49<span style={{ fontSize: 20, color: '#555', fontWeight: 400 }}>/mo</span></div>
        <div style={{ ...m, fontSize: 13, color: '#555', marginBottom: 40 }}>Cancel anytime. Instant access.</div>

        <div style={{ border: '1px solid #222', padding: 32, marginBottom: 32 }}>
          {[
            '5,991 unclaimed surplus records',
            'Full owner names + property addresses',
            '25+ Georgia counties + Harris TX',
            'Deadline tracking on every case',
            'CSV export for BatchSkipTracing',
            'Built-in outreach CRM',
            'Auto-generated claim letters',
            'Filter by county, amount, status',
          ].map(item => (
            <div key={item} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center' }}>
              <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 16 }}>✓</span>
              <span style={{ ...m, color: '#bbb', fontSize: 14 }}>{item}</span>
            </div>
          ))}
        </div>

        <button
          onClick={checkout}
          disabled={loading}
          style={{ ...m, width: '100%', background: '#4ade80', color: '#000', border: 'none', padding: '20px 32px', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Redirecting...' : 'Get full access →'}
        </button>

        <div style={{ ...m, fontSize: 12, color: '#333', textAlign: 'center', marginTop: 16 }}>
          Powered by Stripe · Secure checkout · Cancel anytime
        </div>

        <div style={{ marginTop: 40, padding: '20px 24px', background: '#0a1a0a', border: '1px solid #1a3a1a' }}>
          <div style={{ ...m, fontSize: 12, color: '#4ade80', marginBottom: 8 }}>// the math</div>
          <div style={{ ...m, fontSize: 13, color: '#888', lineHeight: 1.8 }}>
            One recovered case at $50k × 35% fee = $17,500.<br />
            That&apos;s 357x your monthly subscription cost.<br />
            <span style={{ color: '#4ade80' }}>The tool pays for itself on the first case.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
