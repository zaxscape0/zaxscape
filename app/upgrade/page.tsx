"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function UpgradePage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  async function checkout(plan: string) {
    setLoading(plan)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push("/login"); return }
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, email: session.user.email }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoading(null)
  }

  const m: any = { fontFamily: "'Courier New', monospace" }

  const plans = [
    { id: "monthly",  label: "Monthly",  price: "$199",     sub: "per month",        badge: null,           desc: "Cancel anytime" },
    { id: "yearly",   label: "Annual",   price: "$2,149.99", sub: "per year",        badge: "Save 10%",     desc: "~$179/mo · best value" },
    { id: "lifetime", label: "Lifetime", price: "$5,000",    sub: "one-time",        badge: "Forever",      desc: "Pay once, own it" },
  ]

  return (
    <div style={{ minHeight:"100vh",background:"#000",color:"#fff" }}>
      <nav style={{ borderBottom:"1px solid #222",padding:"0 40px" }}>
        <div style={{ maxWidth:"900px",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px" }}>
          <Link href="/dashboard"><img src="/logo.jpg" alt="ZaxScape" style={{ height:"48px" }} /></Link>
          <Link href="/dashboard" style={{ ...m,fontSize:"13px",textTransform:"uppercase",color:"#555",textDecoration:"none" }}>← Back</Link>
        </div>
      </nav>
      <main style={{ maxWidth:"860px",margin:"0 auto",padding:"60px 20px" }}>
        <div style={{ textAlign:"center",marginBottom:"56px" }}>
          <div style={{ ...m,fontSize:"12px",letterSpacing:"0.2em",textTransform:"uppercase",color:"#555",marginBottom:"16px" }}>// upgrade</div>
          <h1 style={{ fontSize:"38px",fontWeight:700,letterSpacing:"-0.02em",margin:"0 0 16px" }}>Unlock unlimited properties</h1>
          <p style={{ color:"#888",fontSize:"17px",margin:0,lineHeight:1.6 }}>You've hit the 20 property preview limit. Upgrade to see all 21,000+ Boston properties.</p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1px",background:"#222",marginBottom:"48px" }}>
          {plans.map(p => (
            <div key={p.id} style={{ background:"#000",padding:"32px 24px",display:"flex",flexDirection:"column",gap:"16px" }}>
              <div>
                {p.badge && <div style={{ ...m,fontSize:"11px",textTransform:"uppercase",background:"#fff",color:"#000",display:"inline-block",padding:"3px 8px",fontWeight:700,marginBottom:"12px" }}>{p.badge}</div>}
                <div style={{ ...m,fontSize:"11px",textTransform:"uppercase",letterSpacing:"0.15em",color:"#555",marginBottom:"8px" }}>{p.label}</div>
                <div style={{ fontSize:"32px",fontWeight:700,letterSpacing:"-0.02em" }}>{p.price}</div>
                <div style={{ ...m,fontSize:"12px",color:"#666" }}>{p.sub}</div>
              </div>
              <div style={{ ...m,fontSize:"12px",color:"#777",flexGrow:1 }}>{p.desc}</div>
              <button onClick={() => checkout(p.id)} disabled={loading === p.id}
                className="zax-btn zax-btn-primary" style={{ width:"100%",textAlign:"center",fontSize:"12px",padding:"14px" }}>
                {loading === p.id ? "Loading..." : "Select →"}
              </button>
            </div>
          ))}
        </div>
        <div style={{ border:"1px solid #1a1a1a",padding:"28px",marginBottom:"24px" }}>
          <div style={{ ...m,fontSize:"12px",textTransform:"uppercase",letterSpacing:"0.15em",color:"#555",marginBottom:"16px" }}>// all plans include</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px" }}>
            {["21,000+ Boston properties","Commercial & residential","Motivation score + signals","Filter by ZIP, value, year, score","Owner name + mailing address","Contact unlock available","Daily data refresh","Mobile-friendly"].map(f => (
              <div key={f} style={{ display:"flex",gap:"10px",alignItems:"flex-start" }}>
                <span style={{ color:"#4ade80",fontWeight:700,fontSize:"15px" }}>✓</span>
                <span style={{ color:"#bbb",fontSize:"15px" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign:"center" }}>
          <Link href="/dashboard" style={{ ...m,fontSize:"12px",color:"#444",textDecoration:"none" }}>Continue with 20 free properties</Link>
        </div>
      </main>
    </div>
  )
}