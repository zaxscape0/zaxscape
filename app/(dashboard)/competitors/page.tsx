"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<any[]>([])
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [scanning, setScanning] = useState<string | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }
    const { data } = await supabase.from("competitors").select("*").order("created_at", { ascending: false })
    setCompetitors(data || [])
    setLoading(false)
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError("")
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from("competitors").insert({
      user_id: user.id, name,
      url: url.startsWith("http") ? url : "https://" + url,
      status: "active",
    })
    if (err) { setError(err.message); setAdding(false); return }
    setName(""); setUrl("")
    load()
    setAdding(false)
  }

  async function del(id: string) {
    await supabase.from("competitors").delete().eq("id", id)
    setCompetitors(p => p.filter(c => c.id !== id))
  }

  async function scan(id: string) {
    setScanning(id)
    await fetch("/api/monitor/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ competitorId: id }),
    })
    setScanning(null)
    load()
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#444", letterSpacing: "0.1em" }}>loading...</span>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #222", padding: "0 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
            <Link href="/dashboard"><img src="/logo.jpg" alt="ZaxScape" style={{ height: "62px", display: "block" }} /></Link>
            <Link href="/dashboard" style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#666", textDecoration: "none" }}>Dashboard</Link>
            <Link href="/competitors" style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>Competitors</Link>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login") }}
            style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#444", background: "none", border: "none", cursor: "pointer" }}>
            Sign out
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 40px" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #222", paddingBottom: "40px", marginBottom: "60px" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>// tracking</div>
          <h1 style={{ fontSize: "36px", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Competitors</h1>
        </div>

        {/* Add form */}
        <div style={{ border: "1px solid #222", padding: "32px", marginBottom: "48px" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "24px" }}>// add competitor</div>
          {error && (
            <div style={{ background: "#0a0a0a", border: "1px solid #ff4444", padding: "12px 16px", marginBottom: "20px" }}>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#ff6666" }}>{error}</span>
            </div>
          )}
          <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "16px", alignItems: "end" }}>
            <div>
              <label className="zax-label">Company name</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="Acme Corp" className="zax-input" />
            </div>
            <div>
              <label className="zax-label">Website URL</label>
              <input value={url} onChange={e => setUrl(e.target.value)} required placeholder="competitor.com" className="zax-input" />
            </div>
            <button type="submit" disabled={adding} className="zax-btn zax-btn-primary" style={{ whiteSpace: "nowrap" }}>
              {adding ? "Adding..." : "+ Add"}
            </button>
          </form>
        </div>

        {/* Competitors list */}
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "16px" }}>// monitoring {competitors.length} competitor{competitors.length !== 1 ? "s" : ""}</div>
        {competitors.length === 0 ? (
          <div style={{ border: "1px solid #222", padding: "60px", textAlign: "center" }}>
            <p style={{ color: "#666", margin: 0, fontSize: "15px" }}>No competitors added yet.</p>
          </div>
        ) : (
          <div style={{ border: "1px solid #222" }}>
            {competitors.map((c: any, i: number) => (
              <div key={c.id} style={{ padding: "24px 32px", borderBottom: i < competitors.length - 1 ? "1px solid #1a1a1a" : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <Link href={`/competitors/${c.id}`} style={{ fontWeight: 600, fontSize: "16px", marginBottom: "4px", color: "#fff", textDecoration: "none", display: "block" }}>{c.name} →</Link>
                  <a href={c.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#555", textDecoration: "none" }}>{c.url}</a>
                  {c.last_scanned_at && (
                    <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#444", marginTop: "4px" }}>
                      Last scan: {new Date(c.last_scanned_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button onClick={() => scan(c.id)} disabled={scanning === c.id}
                    className="zax-btn zax-btn-secondary" style={{ fontSize: "11px", padding: "8px 16px" }}>
                    {scanning === c.id ? "Scanning..." : "Scan now"}
                  </button>
                  <button onClick={() => del(c.id)}
                    style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#444", background: "none", border: "none", cursor: "pointer" }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
