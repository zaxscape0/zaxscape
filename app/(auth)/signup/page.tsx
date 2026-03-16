"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"

const PLANS = [
  { id: "starter", name: "Starter", price: "$99/mo", features: "3 competitors" },
  { id: "pro", name: "Pro", price: "$199/mo", features: "10 competitors" },
  { id: "team", name: "Team", price: "$399/mo", features: "Unlimited" },
]

function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const [plan, setPlan] = useState(params.get("plan") || "starter")

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin + "/dashboard" },
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
      else setDone(true)
    }
    setLoading(false)
  }

  if (done) return (
    <div style={{ background: "#0a0a0a", border: "1px solid #222", padding: "32px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "16px" }}>// check your email</div>
      <p style={{ color: "#888", fontSize: "15px", margin: 0 }}>Confirmation sent to <span style={{ color: "#fff" }}>{email}</span></p>
    </div>
  )

  return (
    <form onSubmit={handleSignup}>
      {error && (
        <div style={{ background: "#0a0a0a", border: "1px solid #ff4444", padding: "12px 16px", marginBottom: "24px" }}>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#ff6666" }}>{error}</span>
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <label className="zax-label">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com" className="zax-input" />
      </div>
      <div style={{ marginBottom: "32px" }}>
        <label className="zax-label">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min 8 characters" className="zax-input" />
      </div>

      {/* Plan selector */}
      <div style={{ marginBottom: "32px" }}>
        <label className="zax-label">Select plan</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "#222" }}>
          {PLANS.map(p => (
            <button key={p.id} type="button" onClick={() => setPlan(p.id)}
              style={{
                background: plan === p.id ? "#fff" : "#000",
                color: plan === p.id ? "#000" : "#666",
                border: "none",
                padding: "16px 12px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s, color 0.15s",
              }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px", color: plan === p.id ? "#000" : "#666" }}>{p.name}</div>
              <div style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em", color: plan === p.id ? "#000" : "#fff", marginBottom: "4px" }}>{p.price}</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", color: plan === p.id ? "#444" : "#444" }}>{p.features}</div>
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading} className="zax-btn zax-btn-primary" style={{ width: "100%", textAlign: "center" }}>
        {loading ? "Creating account..." : "Start free trial →"}
      </button>
    </form>
  )
}

export default function SignupPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ borderBottom: "1px solid #222", paddingBottom: "24px", marginBottom: "40px" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>// zaxscape</div>
          <Link href="/"><img src="/logo.jpg" alt="ZaxScape" style={{ height: "73px", display: "block" }} /></Link>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>// get started</div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>Start your 14-day free trial.</h1>
        </div>

        <Suspense fallback={<div style={{ color: "#666", fontFamily: "monospace", fontSize: "12px" }}>Loading...</div>}>
          <SignupForm />
        </Suspense>

        <div style={{ marginTop: "24px", borderTop: "1px solid #1a1a1a", paddingTop: "24px" }}>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#444" }}>
            Card required. Cancel anytime. No charge for 14 days.</span>
        </div>
        <div style={{ marginTop: "24px", borderTop: "1px solid #1a1a1a", paddingTop: "24px" }}>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#444" }}>Have an account?{" "}
            <Link href="/login" style={{ color: "#888", textDecoration: "none" }}>Sign in</Link>
          </span>
        </div>
      </div>
    </div>
  )
}
