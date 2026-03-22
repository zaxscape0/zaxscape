"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

export default function PropertyPage() {
  const { id } = useParams() as { id: string }
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!id) return
    supabase.from("properties").select("*").eq("id", id).single()
      .then(({ data }) => { setProperty(data); setLoading(false) })
  }, [id])

  async function unlockContact() {
    setUnlocking(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push("/login"); return }
    const res = await fetch("/api/unlock-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId: id, email: session.user.email }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setUnlocking(false)
  }

  const m: any = { fontFamily: "'Courier New', monospace" }
  const scoreColor = (s: number) => s >= 6 ? "#4ade80" : s >= 4 ? "#facc15" : "#777"

  if (loading) return <div style={{ minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ ...m,color:"#444",fontSize: "14px" }}>loading...</span></div>
  if (!property) return <div style={{ minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ color:"#666" }}>Not found.</span></div>

  const fields = [
    ["Owner", property.owner || "—"],
    ["Assessed value", property.assessed_value ? "$" + property.assessed_value.toLocaleString() : "—"],
    ["Year built", property.yr_built || "—"],
    ["Gross area", property.gross_area ? property.gross_area + " sqft" : "—"],
    ["Land value", property.av_land ? "$" + property.av_land.toLocaleString() : "—"],
    ["Building value", property.av_bldg ? "$" + property.av_bldg.toLocaleString() : "—"],
  ]

  return (
    <div style={{ minHeight:"100vh",background:"#000",color:"#fff" }}>
      <nav style={{ borderBottom:"1px solid #222",padding:"0 40px" }}>
        <div style={{ maxWidth:"900px",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px" }}>
          <Link href="/dashboard"><img src="/logo.jpg" alt="ZaxScape" style={{ height:"52px" }} /></Link>
          <Link href="/dashboard" style={{ ...m,fontSize: "13px",textTransform:"uppercase",color:"#555",textDecoration:"none" }}>← Back</Link>
        </div>
      </nav>
      <main style={{ maxWidth:"900px",margin:"0 auto",padding:"40px 20px" }}>
        <div style={{ borderBottom:"1px solid #222",paddingBottom:"32px",marginBottom:"40px" }}>
          <div style={{ ...m,fontSize: "12px",textTransform:"uppercase",letterSpacing:"0.2em",color:"#555",marginBottom:"12px" }}>Boston, MA · {property.zip}</div>
          <h1 style={{ fontSize: "38px",fontWeight:700,margin:"0 0 8px",letterSpacing:"-0.02em" }}>{property.address}</h1>
          <div style={{ display:"flex",gap:"12px",alignItems:"center" }}>
            <span style={{ ...m,fontSize: "14px",color:"#666",textTransform:"uppercase" }}>{property.land_use}</span>
            <span style={{ color:"#333" }}>·</span>
            <span style={{ ...m,fontSize: "15px",fontWeight:700,color:scoreColor(property.motivation_score) }}>Motivation {property.motivation_score}/8</span>
          </div>
        </div>
        <div className="detail-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px",background:"#1a1a1a",marginBottom:"40px" }}>
          {fields.map(([label, val]) => (
            <div key={String(label)} style={{ background:"#000",padding:"24px 28px" }}>
              <div style={{ ...m,fontSize: "12px",textTransform:"uppercase",letterSpacing:"0.15em",color:"#555",marginBottom:"8px" }}>{label}</div>
              <div style={{ fontSize: "18px",fontWeight:600,color:"#ddd" }}>{val}</div>
            </div>
          ))}
        </div>
        {property.signals && (
          <div style={{ border:"1px solid #1a1a1a",padding:"24px",marginBottom:"40px" }}>
            <div style={{ ...m,fontSize: "12px",textTransform:"uppercase",letterSpacing:"0.2em",color:"#555",marginBottom:"16px" }}>// motivation signals</div>
            <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
              {property.signals.split(",").map((s: string) => (
                <span key={s} style={{ ...m,fontSize: "13px",textTransform:"uppercase",background:"#111",border:"1px solid #222",padding:"4px 10px",color:"#999" }}>{s.trim()}</span>
              ))}
            </div>
          </div>
        )}
        {property.mail_address && (
          <div style={{ border:"1px solid #1a1a1a",padding:"24px",marginBottom:"40px" }}>
            <div style={{ ...m,fontSize: "12px",textTransform:"uppercase",letterSpacing:"0.2em",color:"#555",marginBottom:"8px" }}>// mailing address</div>
            <div style={{ fontSize: "17px",color:"#bbb" }}>{property.mail_address}</div>
          </div>
        )}
        <div style={{ border:"1px solid #333",padding:"32px",textAlign:"center" }}>
          <div style={{ ...m,fontSize: "12px",textTransform:"uppercase",letterSpacing:"0.2em",color:"#555",marginBottom:"12px" }}>// owner contact info</div>
          <p style={{ color:"#888",fontSize: "17px",margin:"0 0 24px",lineHeight:1.6 }}>Unlock owner phone and email via skip tracing. One-time charge.</p>
          <button onClick={unlockContact} disabled={unlocking} className="zax-btn zax-btn-primary" style={{ fontSize: "14px",padding:"14px 32px" }}>
            {unlocking ? "Redirecting..." : "Unlock contact — $0.99"}
          </button>
        </div>
      </main>
    </div>
  )
}