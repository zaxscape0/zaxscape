"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

type Tab = "overview" | "jobs" | "reviews" | "battlecard"

export default function CompetitorDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [competitor, setCompetitor] = useState<any>(null)
  const [tab, setTab] = useState<Tab>("overview")
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [battlecard, setBattlecard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState<string | null>(null)

  useEffect(() => { if (id) load() }, [id])

  async function load() {
    const { data: c } = await supabase.from("competitors").select("*").eq("id", id).single()
    if (!c) { router.push("/competitors"); return }
    setCompetitor(c)
    const [{ data: s }, { data: j }, { data: r }, { data: b }] = await Promise.all([
      supabase.from("snapshots").select("*").eq("competitor_id", id).not("changes_detected", "is", null).order("scanned_at", { ascending: false }).limit(10),
      supabase.from("job_postings").select("*").eq("competitor_id", id).order("first_seen_at", { ascending: false }),
      supabase.from("reviews").select("*").eq("competitor_id", id).order("fetched_at", { ascending: false }),
      supabase.from("battlecards").select("*").eq("competitor_id", id).maybeSingle(),
    ])
    setSnapshots(s || [])
    setJobs(j || [])
    setReviews(r || [])
    setBattlecard(b?.content || null)
    setLoading(false)
  }

  async function runScan(type: string) {
    setScanning(type)
    const ep: Record<string, string> = {
      monitor: "/api/monitor/run", jobs: "/api/jobs",
      reviews: "/api/reviews", battlecard: "/api/battlecard",
    }
    await fetch(ep[type], { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ competitorId: id }) })
    setScanning(null)
    load()
  }

  if (loading) return <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: "monospace", fontSize: "12px", color: "#444" }}>loading...</span></div>

  const m = { fontFamily: "'Courier New', monospace" }
  const lbl: any = { ...m, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: "24px" }
  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Changes", count: snapshots.length },
    { id: "jobs", label: "Job Postings", count: jobs.length },
    { id: "reviews", label: "Reviews", count: reviews.length },
    { id: "battlecard", label: "Battlecard" },
  ]
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <nav style={{ borderBottom: "1px solid #222", padding: "0 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
            <Link href="/dashboard"><img src="/logo.jpg" alt="ZaxScape" style={{ height: "48px" }} /></Link>
            <Link href="/dashboard" style={{ ...m, fontSize: "11px", textTransform: "uppercase", color: "#666", textDecoration: "none" }}>Dashboard</Link>
            <Link href="/competitors" style={{ ...m, fontSize: "11px", textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>Competitors</Link>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login") }} style={{ ...m, fontSize: "11px", textTransform: "uppercase", color: "#444", background: "none", border: "none", cursor: "pointer" }}>Sign out</button>
        </div>
      </nav>
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 40px" }}>
        <div style={{ borderBottom: "1px solid #222", paddingBottom: "32px", marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <Link href="/competitors" style={{ ...m, fontSize: "10px", textTransform: "uppercase", color: "#444", textDecoration: "none" }}>← Back</Link>
            <h1 style={{ fontSize: "36px", fontWeight: 700, margin: "8px 0 4px", letterSpacing: "-0.02em" }}>{competitor.name}</h1>
            <a href={competitor.url} target="_blank" rel="noopener noreferrer" style={{ ...m, fontSize: "11px", color: "#555", textDecoration: "none" }}>{competitor.url}</a>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => runScan("monitor")} disabled={!!scanning} className="zax-btn zax-btn-secondary" style={{ fontSize: "11px", padding: "8px 16px" }}>{scanning === "monitor" ? "Scanning..." : "Scan site"}</button>
            <button onClick={() => { runScan("jobs"); runScan("reviews") }} disabled={!!scanning} className="zax-btn zax-btn-secondary" style={{ fontSize: "11px", padding: "8px 16px" }}>{scanning ? "Gathering..." : "Gather intel"}</button>
            <button onClick={() => runScan("battlecard")} disabled={!!scanning} className="zax-btn zax-btn-primary" style={{ fontSize: "11px", padding: "8px 16px" }}>{scanning === "battlecard" ? "Generating..." : "Generate battlecard"}</button>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid #222", marginBottom: "40px" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 24px", background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #fff" : "2px solid transparent", color: tab === t.id ? "#fff" : "#444", cursor: "pointer", ...m, fontSize: "11px", textTransform: "uppercase", marginBottom: "-1px" }}>
              {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
            </button>
          ))}
        </div>
        {tab === "overview" && (
          <div>
            <div style={lbl}>// detected changes</div>
            {snapshots.length === 0
              ? <div style={{ border: "1px solid #222", padding: "60px", textAlign: "center" }}><p style={{ color: "#666", margin: 0 }}>No changes yet. Run a scan.</p></div>
              : <div style={{ border: "1px solid #222" }}>{snapshots.map((s, i) => (
                  <div key={s.id} style={{ padding: "24px 32px", borderBottom: i < snapshots.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ ...m, fontSize: "10px", color: "#444" }}>CHANGE DETECTED</span>
                      <span style={{ ...m, fontSize: "11px", color: "#444" }}>{new Date(s.scanned_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>{s.changes_detected?.summary}</p>
                  </div>
                ))}</div>
            }
          </div>
        )}
        {tab === "jobs" && (
          <div>
            <div style={lbl}>// job postings — strategic hiring signals</div>
            {jobs.length === 0
              ? <div style={{ border: "1px solid #222", padding: "60px", textAlign: "center" }}>
                  <p style={{ color: "#666", margin: "0 0 24px" }}>No job postings found yet.</p>
                  <button onClick={() => runScan("jobs")} className="zax-btn zax-btn-secondary" disabled={!!scanning}>{scanning ? "Scanning..." : "Scan careers page"}</button>
                </div>
              : <div>
                  {jobs.find((j: any) => j.signal) && (
                    <div style={{ background: "#0a0a0a", border: "1px solid #333", padding: "24px", marginBottom: "24px" }}>
                      <div style={{ ...m, fontSize: "10px", textTransform: "uppercase", color: "#666", marginBottom: "12px" }}>// strategic signal</div>
                      <p style={{ color: "#ccc", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>{(jobs.find((j: any) => j.signal) as any)?.signal}</p>
                    </div>
                  )}
                  <div style={{ border: "1px solid #222" }}>{jobs.map((j: any, i: number) => (
                    <div key={j.id} style={{ padding: "20px 32px", borderBottom: i < jobs.length - 1 ? "1px solid #1a1a1a" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                          <span style={{ fontWeight: 600, fontSize: "15px" }}>{j.title}</span>
                          {j.is_new && <span style={{ ...m, fontSize: "9px", textTransform: "uppercase", background: "#fff", color: "#000", padding: "2px 6px" }}>NEW</span>}
                        </div>
                        <span style={{ ...m, fontSize: "10px", color: "#444" }}>{j.department}{j.location ? ` · ${j.location}` : ""}</span>
                      </div>
                      <span style={{ ...m, fontSize: "10px", color: "#333" }}>{new Date(j.first_seen_at).toLocaleDateString()}</span>
                    </div>
                  ))}</div>
                </div>
            }
          </div>
        )}
        {tab === "reviews" && (
          <div>
            <div style={lbl}>// customer reviews — their weaknesses are your opportunities</div>
            {reviews.length === 0
              ? <div style={{ border: "1px solid #222", padding: "60px", textAlign: "center" }}>
                  <p style={{ color: "#666", margin: "0 0 24px" }}>No reviews yet.</p>
                  <button onClick={() => runScan("reviews")} className="zax-btn zax-btn-secondary" disabled={!!scanning}>{scanning ? "Gathering..." : "Gather reviews"}</button>
                </div>
              : <div>
                  {reviews.filter((r: any) => r.sentiment === "negative" && r.pain_point).length > 0 && (
                    <div style={{ background: "#0a0a0a", border: "1px solid #333", padding: "24px", marginBottom: "24px" }}>
                      <div style={{ ...m, fontSize: "10px", textTransform: "uppercase", color: "#666", marginBottom: "16px" }}>// pain points to use in sales</div>
                      {reviews.filter((r: any) => r.sentiment === "negative" && r.pain_point).slice(0, 4).map((r: any, i: number) => (
                        <div key={i} style={{ color: "#ccc", fontSize: "14px", lineHeight: 1.6, marginBottom: "8px" }}>— {r.pain_point}</div>
                      ))}
                    </div>
                  )}
                  <div style={{ border: "1px solid #222" }}>{reviews.map((r: any, i: number) => (
                    <div key={r.id} style={{ padding: "20px 32px", borderBottom: i < reviews.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <span style={{ ...m, fontSize: "9px", textTransform: "uppercase", padding: "2px 8px", border: "1px solid", borderColor: r.sentiment === "negative" ? "#f44" : r.sentiment === "positive" ? "#4f4" : "#444", color: r.sentiment === "negative" ? "#f66" : r.sentiment === "positive" ? "#6f6" : "#666" }}>{r.sentiment}</span>
                          <span style={{ ...m, fontSize: "10px", color: "#444", textTransform: "uppercase" }}>{r.source}</span>
                        </div>
                        {r.reviewer_role && <span style={{ ...m, fontSize: "10px", color: "#444" }}>{r.reviewer_role}</span>}
                      </div>
                      {r.title && <div style={{ fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>{r.title}</div>}
                      <p style={{ color: "#888", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{r.body}</p>
                    </div>
                  ))}</div>
                </div>
            }
          </div>
        )}
        {tab === "battlecard" && (
          <div>
            <div style={lbl}>// battlecard — how to beat {competitor.name}</div>
            {!battlecard
              ? <div style={{ border: "1px solid #222", padding: "60px", textAlign: "center" }}>
                  <p style={{ color: "#666", margin: "0 0 24px" }}>No battlecard yet. Gather intel first.</p>
                  <button onClick={() => runScan("battlecard")} className="zax-btn zax-btn-primary" disabled={!!scanning}>{scanning === "battlecard" ? "Generating..." : "Generate battlecard"}</button>
                </div>
              : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#222" }}>
                  {battlecard.overview && <div style={{ background: "#000", padding: "32px", gridColumn: "1 / -1" }}>
                    <div style={{ ...m, fontSize: "10px", textTransform: "uppercase", color: "#444", marginBottom: "12px" }}>// overview</div>
                    <p style={{ color: "#ccc", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>{battlecard.overview}</p>
                  </div>}
                  {battlecard.how_to_win && <div style={{ background: "#000", padding: "32px" }}>
                    <div style={{ ...m, fontSize: "10px", textTransform: "uppercase", color: "#444", marginBottom: "16px" }}>// how to win</div>
                    {battlecard.how_to_win.map((x: string, i: number) => <div key={i} style={{ color: "#ccc", fontSize: "14px", lineHeight: 1.6, marginBottom: "10px" }}>— {x}</div>)}
                  </div>}
                  {battlecard.weaknesses && <div style={{ background: "#000", padding: "32px" }}>
                    <div style={{ ...m, fontSize: "10px", textTransform: "uppercase", color: "#444", marginBottom: "16px" }}>// their weaknesses</div>
                    {battlecard.weaknesses.map((x: string, i: number) => <div key={i} style={{ color: "#ccc", fontSize: "14px", lineHeight: 1.6, marginBottom: "10px" }}>— {x}</div>)}
                  </div>}
                  {battlecard.strategic_moves && <div style={{ background: "#000", padding: "32px" }}>
                    <div style={{ ...m, fontSize: "10px", textTransform: "uppercase", color: "#444", marginBottom: "16px" }}>// strategic moves</div>
                    {battlecard.strategic_moves.map((x: string, i: number) => <div key={i} style={{ color: "#ccc", fontSize: "14px", lineHeight: 1.6, marginBottom: "10px" }}>— {x}</div>)}
                  </div>}
                  {battlecard.watch_out_for && <div style={{ background: "#000", padding: "32px" }}>
                    <div style={{ ...m, fontSize: "10px", textTransform: "uppercase", color: "#444", marginBottom: "16px" }}>// watch out for</div>
                    {battlecard.watch_out_for.map((x: string, i: number) => <div key={i} style={{ color: "#ccc", fontSize: "14px", lineHeight: 1.6, marginBottom: "10px" }}>— {x}</div>)}
                  </div>}
                  <div style={{ background: "#000", padding: "16px 32px", gridColumn: "1 / -1", borderTop: "1px solid #1a1a1a" }}>
                    <span style={{ ...m, fontSize: "10px", color: "#333" }}>Last updated: {battlecard.last_updated ? new Date(battlecard.last_updated).toLocaleDateString() : "—"}</span>
                    <button onClick={() => runScan("battlecard")} disabled={!!scanning} style={{ ...m, marginLeft: "16px", fontSize: "10px", color: "#555", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" }}>{scanning === "battlecard" ? "Regenerating..." : "Regenerate →"}</button>
                  </div>
                </div>
            }
          </div>
        )}
      </main>
    </div>
  )
}
