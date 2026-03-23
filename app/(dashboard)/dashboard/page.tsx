"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [city, setCity] = useState("")
  const [zip, setZip] = useState("")
  const [minScore, setMinScore] = useState("0")
  const [minValue, setMinValue] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [unlimited, setUnlimited] = useState(false)
  const router = useRouter()
  const PAGE = 25
  const FREE_LIMIT = 20

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return }
      supabase.from("profiles").select("*").eq("id", session.user.id).single()
        .then(({ data }) => { setProfile(data); setUnlimited(!!data?.unlimited); load(data?.property_type || "commercial", 0, "", "", "0", "", "") })
    })
  }, [])

  async function load(ptype: string, pg: number, c: string, z: string, ms: string, mv: string, sr: string) {
    setLoading(true)
    let q = supabase.from("properties")
      .select("id,address,zip,owner,assessed_value,yr_built,motivation_score,signals", { count: "exact" })
      .order("motivation_score", { ascending: false })
      .order("assessed_value", { ascending: false })
      .range(pg * PAGE, unlimited ? (pg + 1) * PAGE - 1 : FREE_LIMIT - 1)
    if (ptype && ptype !== "both") q = q.eq("property_type", ptype)
    if (c) q = q.eq("city", c)
    if (z) q = q.eq("zip", z)
    if (parseInt(ms) > 0) q = q.gte("motivation_score", parseInt(ms))
    if (mv) q = q.gte("assessed_value", parseInt(mv))
    if (sr) q = q.ilike("owner", "%" + sr + "%")
    const { data, count } = await q
    setProperties(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  function applyFilter() {
    setPage(0)
    load(profile?.property_type || "commercial", 0, city, zip, minScore, minValue, search)
  }

  function goPage(p: number) {
    setPage(p)
    load(profile?.property_type || "commercial", p, city, zip, minScore, minValue, search)
  }

  const m: any = { fontFamily: "'Courier New', monospace" }
  const scoreColor = (s: number) => s >= 6 ? "#4ade80" : s >= 4 ? "#facc15" : "#888"

  if (loading) return (
    <div style={{ minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <span style={{ ...m,fontSize: "14px",color:"#555" }}>loading...</span>
    </div>
  )

  return (
    <div style={{ minHeight:"100vh",background:"#000",color:"#fff" }}>
      <nav style={{ borderBottom:"1px solid #222",padding:"0 40px" }}>
        <div style={{ maxWidth:"1200px",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px" }}>
          <Link href="/dashboard"><img src="/logo.jpg" alt="ZaxScape" style={{ height:"52px" }} /></Link>
            <div style={{ display:"flex",gap:"20px",alignItems:"center" }}>
              <Link href="/dashboard" style={{ fontFamily:'IBM Plex Mono, monospace',fontSize:"12px",color:"#888",textDecoration:"none" }}>Properties</Link>
              <Link href="/overages" style={{ fontFamily:'IBM Plex Mono, monospace',fontSize:"12px",color:"#888",textDecoration:"none" }}>Overages</Link>
              <Link href="/outreach" style={{ fontFamily:'IBM Plex Mono, monospace',fontSize:"12px",color:"#888",textDecoration:"none" }}>Outreach</Link>
            </div>
          <div style={{ display:"flex",alignItems:"center",gap:"24px" }}>
            <span style={{ ...m,fontSize: "13px",color:"#666",textTransform:"uppercase" }}>{(profile?.property_type || "commercial")} · Boston MA</span>
            <button onClick={async () => { await supabase.auth.signOut(); router.push("/login") }}
              style={{ ...m,fontSize: "13px",textTransform:"uppercase",color:"#555",background:"none",border:"none",cursor:"pointer" }}>Sign out</button>
          </div>
        </div>
      </nav>
      <main style={{ maxWidth:"1200px",margin:"0 auto",padding:"48px 40px" }}>
        <div style={{ marginBottom:"40px" }}>
          <div style={{ ...m,fontSize: "12px",letterSpacing:"0.2em",textTransform:"uppercase",color:"#555",marginBottom:"8px" }}>// motivated sellers · Boston MA</div>
          <h1 style={{ fontSize: "34px",fontWeight:700,margin:"0 0 4px",letterSpacing:"-0.02em" }}>Property Intelligence</h1>
          <div style={{ ...m,fontSize: "13px",color:"#666" }}>{total.toLocaleString()} properties · sorted by motivation score</div>
        </div>
        <div className="filter-grid" style={{ border:"1px solid #1a1a1a",padding:"20px 16px",marginBottom:"32px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr auto",gap:"12px",alignItems:"end" }}>
          <div><label style={{ ...m,fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.15em",color:"#555",display:"block",marginBottom:"8px" }}>City</label>
          <select value={city} onChange={e => setCity(e.target.value)} className="zax-input" style={{ marginBottom:0 }}>
            <option value="">All cities</option>
            <option value="Boston">Boston</option>
            <option value="Cambridge">Cambridge</option>
            <option value="Worcester">Worcester</option>
            <option value="Springfield">Springfield</option>
          </select></div>
          {([["Search owner", search, setSearch, "Owner name..."],["ZIP code", zip, setZip, "02101"],["Min value ($)", minValue, setMinValue, "200000"]] as any[]).map(([lbl,val,set,ph]: any) => (
            <div key={lbl}><label style={{ ...m,fontSize: "12px",textTransform:"uppercase",letterSpacing:"0.15em",color:"#555",display:"block",marginBottom:"8px" }}>{lbl}</label>
            <input value={val} onChange={e => set(e.target.value)} onKeyDown={e => e.key === "Enter" && applyFilter()} placeholder={ph} className="zax-input" style={{ marginBottom:0 }} /></div>
          ))}
          <div><label style={{ ...m,fontSize: "12px",textTransform:"uppercase",letterSpacing:"0.15em",color:"#555",display:"block",marginBottom:"8px" }}>Min score</label>
          <select value={minScore} onChange={e => setMinScore(e.target.value)} className="zax-input" style={{ marginBottom:0 }}>
            <option value="0">Any</option><option value="3">3+ good</option><option value="5">5+ strong</option><option value="7">7+ hot</option>
          </select></div>
          <button onClick={applyFilter} className="zax-btn zax-btn-primary" style={{ whiteSpace:"nowrap",padding:"12px 20px",fontSize: "13px" }}>Filter</button>
        </div>
        {!unlimited && total > 0 && (
          <div style={{ background:"#0a0a0a",border:"1px solid #333",padding:"16px 20px",marginBottom:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px" }}>
            <div>
              <div style={{ ...m,fontSize:"12px",textTransform:"uppercase",letterSpacing:"0.1em",color:"#888",marginBottom:"4px" }}>// free preview — 20 of {total.toLocaleString()} properties</div>
              <div style={{ fontSize:"15px",color:"#ccc" }}>Upgrade to unlock all <strong style={{ color:"#fff" }}>{total.toLocaleString()}</strong> properties.</div>
            </div>
            <a href="/upgrade" className="zax-btn zax-btn-primary" style={{ fontSize:"12px",padding:"10px 20px",whiteSpace:"nowrap" }}>Upgrade →</a>
          </div>
        )}
        <div style={{ border:"1px solid #1a1a1a" }}>
          <div className="prop-table-header" style={{ display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1fr 72px",borderBottom:"1px solid #1a1a1a",padding:"10px 24px",background:"#040404" }}>
            {["Address","Owner","Value","Year","City","Score"].map(h => (
              <div key={h} style={{ ...m,fontSize: "12px",textTransform:"uppercase",letterSpacing:"0.15em",color:"#444" }}>{h}</div>
            ))}
          </div>
          {properties.length === 0 ? (
            <div style={{ padding:"60px",textAlign:"center",color:"#555" }}>No properties found.</div>
          ) : properties.map((p, i) => (
            <Link key={p.id} href={"/properties/" + p.id}
              className="prop-table-row" style={{ display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1fr 72px",padding:"14px 24px",borderBottom:i<properties.length-1?"1px solid #0d0d0d":"none",textDecoration:"none",color:"inherit" }}>
              <div>
                <div style={{ fontSize: "16px",fontWeight:500,color:"#ddd",marginBottom:"2px" }}>{p.address}</div>
                {p.signals && <div style={{ ...m,fontSize: "12px",color:"#555" }}>{p.signals.split(",")[0]}</div>}
              </div>
              <div style={{ fontSize: "15px",color:"#999",alignSelf:"center" }}>{p.owner || "—"}</div>
              <div style={{ ...m,fontSize: "15px",color:"#bbb",alignSelf:"center" }}>{p.assessed_value ? (p.assessed_value >= 1000000 ? "$"+(p.assessed_value/1000000).toFixed(1)+"M" : "$"+Math.round(p.assessed_value/1000)+"k") : "—"}</div>
              <div style={{ ...m,fontSize: "15px",color:"#777",alignSelf:"center" }}>{p.yr_built || "—"}</div>
              <div style={{ ...m,fontSize: "15px",color:"#777",alignSelf:"center" }}>{p.zip}</div>
              <div style={{ alignSelf:"center" }}>
                <span style={{ ...m,fontSize: "15px",fontWeight:700,color:scoreColor(p.motivation_score) }}>{p.motivation_score}</span>
                <span style={{ ...m,fontSize: "12px",color:"#333" }}>/8</span>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"24px" }}>
          <div style={{ ...m,fontSize: "13px",color:"#555" }}>Showing {page*PAGE+1}–{Math.min((page+1)*PAGE,total)} of {total.toLocaleString()}</div>
          <div style={{ display:"flex",gap:"8px" }}>
            <button onClick={() => goPage(page-1)} disabled={page===0} className="zax-btn zax-btn-secondary" style={{ fontSize: "13px",padding:"8px 16px",opacity:page===0?0.3:1 }}>← Prev</button>
            <button onClick={() => goPage(page+1)} disabled={(page+1)*PAGE>=total} className="zax-btn zax-btn-secondary" style={{ fontSize: "13px",padding:"8px 16px",opacity:(page+1)*PAGE>=total?0.3:1 }}>Next →</button>
          </div>
        </div>
      </main>
    </div>
  )
}