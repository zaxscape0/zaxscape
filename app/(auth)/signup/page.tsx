"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [propertyType, setPropertyType] = useState<"commercial" | "residential" | null>(null)
  const [step, setStep] = useState<"account" | "type">("account")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAccount(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setStep("type")
  }

  async function handleSubmit() {
    if (!propertyType) return
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
        body: JSON.stringify({ plan: "access", email, propertyType }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
      else router.push("/dashboard")
    }
    setLoading(false)
  }

  const m: any = { fontFamily: "'Courier New', monospace" }

  return (
    <div>
      {error && (
        <div style={{ background: "#0a0a0a", border: "1px solid #f44", padding: "12px 16px", marginBottom: "24px" }}>
          <span style={{ ...m, fontSize: "12px", color: "#f66" }}>{error}</span>
        </div>
      )}

      {step === "account" ? (
        <form onSubmit={handleAccount}>
          <div style={{ marginBottom: "20px" }}>
            <label className="zax-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@email.com" className="zax-input" />
          </div>
          <div style={{ marginBottom: "32px" }}>
            <label className="zax-label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min 8 characters" className="zax-input" />
          </div>
          <button type="submit" className="zax-btn zax-btn-primary" style={{ width: "100%", textAlign: "center" }}>
            Continue →
          </button>
        </form>
      ) : (
        <div>
          <div style={{ ...m, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "20px" }}>// what are you looking for?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#222", marginBottom: "32px" }}>
            {([
              { id: "commercial", label: "Commercial", desc: "Retail, office, industrial, mixed-use" },
              { id: "residential", label: "Residential", desc: "Single & multi-family homes" },
            ] as const).map(opt => (
              <button key={opt.id} type="button" onClick={() => setPropertyType(opt.id)}
                style={{
                  background: propertyType === opt.id ? "#fff" : "#000",
                  color: propertyType === opt.id ? "#000" : "#fff",
                  border: "none", padding: "28px 20px", cursor: "pointer", textAlign: "left",
                }}>
                <div style={{ ...m, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: propertyType === opt.id ? "#444" : "#666", marginBottom: "8px" }}>{opt.id === "commercial" ? "01" : "02"}</div>
                <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>{opt.label}</div>
                <div style={{ ...m, fontSize: "10px", color: propertyType === opt.id ? "#555" : "#555" }}>{opt.desc}</div>
              </button>
            ))}
          </div>
          <div style={{ ...m, fontSize: "11px", color: "#555", marginBottom: "24px" }}>
            You can change this anytime in settings.
          </div>
          <button onClick={handleSubmit} disabled={!propertyType || loading}
            className="zax-btn zax-btn-primary" style={{ width: "100%", textAlign: "center", opacity: !propertyType ? 0.4 : 1 }}>
            {loading ? "Creating account..." : "Start for $4.99/mo →"}
          </button>
          <button onClick={() => setStep("account")} style={{ ...m, marginTop: "16px", width: "100%", fontSize: "11px", color: "#444", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" }}>
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}

export default function SignupPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ borderBottom: "1px solid #222", paddingBottom: "24px", marginBottom: "40px" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>// zaxscape</div>
          <Link href="/"><img src="/logo.jpg" alt="ZaxScape" style={{ height: "60px", display: "block" }} /></Link>
        </div>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>// get started</div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>Find motivated sellers in Boston.</h1>
        </div>
        <Suspense fallback={null}>
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
