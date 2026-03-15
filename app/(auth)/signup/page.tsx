"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"

function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const plan = params.get("plan") || "starter"

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
      <div style={{ marginBottom: "20px" }}>
        <label className="zax-label">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min 8 characters" className="zax-input" />
      </div>
      <div style={{ background: "#0a0a0a", border: "1px solid #222", padding: "12px 16px", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#666" }}>Selected plan</span>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#fff", textTransform: "uppercase" }}>{plan}</span>
      </div>
      <button type="submit" disabled={loading} className="zax-btn zax-btn-primary" style={{ width: "100%", textAlign: "center" }}>
        {loading ? "Creating account..." : "Create account →"}
      </button>
    </form>
  )
}

export default function SignupPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ borderBottom: "1px solid #222", paddingBottom: "24px", marginBottom: "40px" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>// zaxscape</div>
          <Link href="/"><img src="/logo.jpg" alt="ZaxScape" style={{ height: "56px", display: "block" }} /></Link>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>// get started</div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>Start monitoring.</h1>
        </div>

        <Suspense fallback={<div style={{ color: "#666", fontFamily: "monospace", fontSize: "12px" }}>Loading...</div>}>
          <SignupForm />
        </Suspense>

        <div style={{ marginTop: "24px", borderTop: "1px solid #1a1a1a", paddingTop: "24px" }}>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#444" }}>
            Have an account?{" "}
            <Link href="/login" style={{ color: "#888", textDecoration: "none" }}>Sign in</Link>
          </span>
        </div>
      </div>
    </div>
  )
}
