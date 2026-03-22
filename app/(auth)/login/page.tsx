"use client"
import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push("/dashboard") }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #222", paddingBottom: "24px", marginBottom: "40px" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>// zaxscape</div>
          <Link href="/"><img src="/logo.jpg" alt="ZaxScape" style={{ height: "73px", display: "block" }} /></Link>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>// sign in</div>
          <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>Welcome back.</h1>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div style={{ background: "#0a0a0a", border: "1px solid #ff4444", padding: "12px 16px", marginBottom: "24px" }}>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: "14px", color: "#ff6666" }}>{error}</span>
            </div>
          )}
          <div style={{ marginBottom: "20px" }}>
            <label className="zax-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com" className="zax-input" />
          </div>
          <div style={{ marginBottom: "32px" }}>
            <label className="zax-label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="zax-input" />
          </div>
          <button type="submit" disabled={loading} className="zax-btn zax-btn-primary" style={{ width: "100%", textAlign: "center" }}>
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <div style={{ marginTop: "24px", borderTop: "1px solid #1a1a1a", paddingTop: "24px" }}>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#444" }}>
            No account?{" "}
            <Link href="/signup" style={{ color: "#888", textDecoration: "none" }}>Sign up</Link>
          </span>
        </div>
      </div>
    </div>
  )
}
