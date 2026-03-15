"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [competitors, setCompetitors] = useState<any[]>([])
  const [changes, setChanges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (!session && event !== "INITIAL_SESSION")) {
        router.push("/login")
      } else if (session) {
        loadData()
      }
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadData()
      else setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) router.push("/login")
        })
      }, 1500)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadData() {
    const { data: c } = await supabase.from("competitors").select("*").order("created_at", { ascending: false })
    const { data: s } = await supabase.from("snapshots").select("*, competitors(name,url)")
      .not("changes_detected", "is", null).order("scanned_at", { ascending: false }).limit(10)
    setCompetitors(c || [])
    setChanges(s || [])
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#444", letterSpacing: "0.1em" }}>loading...</span>
    </div>
  )

  const active = competitors.filter(c => c.status === "active").length

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #222", padding: "0 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
            <Link href="/dashboard"><img src="/logo.jpg" alt="ZaxScape" style={{ height: "62px", display: "block" }} /></Link>
            <Link href="/dashboard" style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>Dashboard</Link>
            <Link href="/competitors" style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#666", textDecoration: "none" }}>Competitors</Link>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login") }}
            style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#444", background: "none", border: "none", cursor: "pointer" }}>
            Sign out
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 40px" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #222", paddingBottom: "40px", marginBottom: "60px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>// overview</div>
            <h1 style={{ fontSize: "36px", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Dashboard</h1>
          </div>
          <Link href="/competitors" className="zax-btn zax-btn-primary">+ Add competitor</Link>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "#222", marginBottom: "60px" }}>
          <div style={{ background: "#000", padding: "32px" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: "16px" }}>01 — monitored</div>
            <div style={{ fontSize: "48px", fontWeight: 700, letterSpacing: "-0.02em" }}>{active}</div>
          </div>
          <div style={{ background: "#000", padding: "32px" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: "16px" }}>02 — changes detected</div>
            <div style={{ fontSize: "48px", fontWeight: 700, letterSpacing: "-0.02em" }}>{changes.length}</div>
          </div>
          <div style={{ background: "#000", padding: "32px" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: "16px" }}>03 — last scan</div>
            <div style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em" }}>
              {competitors[0]?.last_scanned_at ? new Date(competitors[0].last_scanned_at).toLocaleDateString() : "—"}
            </div>
          </div>
        </div>

        {/* Recent Changes */}
        <div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "24px" }}>// recent changes</div>
          {changes.length === 0 ? (
            <div style={{ border: "1px solid #222", padding: "60px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#444", marginBottom: "16px" }}>// no changes detected yet</div>
              <p style={{ color: "#666", margin: "0 0 24px", fontSize: "15px" }}>Add competitors to start monitoring.</p>
              <Link href="/competitors" className="zax-btn zax-btn-secondary">Add competitor →</Link>
            </div>
          ) : (
            <div style={{ border: "1px solid #222" }}>
              {changes.map((s: any, i: number) => (
                <div key={s.id} style={{ padding: "24px 32px", borderBottom: i < changes.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <span style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#666", marginRight: "16px" }}>{s.competitors?.name}</span>
                    </div>
                    <span style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#444" }}>{new Date(s.scanned_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6, margin: "0 0 12px" }}>{s.changes_detected?.summary}</p>
                  <a href={s.competitors?.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#555", textDecoration: "none" }}>
                    View site →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
