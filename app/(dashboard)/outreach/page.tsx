"use client"
import { useState, useEffect, useCallback } from "react"

const m = { fontFamily: "IBM Plex Mono, monospace" }
const SC: Record<string,string> = { new:"#555", contacted:"#3b82f6", responded:"#f59e0b", claimed:"#4ade80", dead:"#ef4444" }
const SL: Record<string,string> = { new:"New", contacted:"Contacted", responded:"Responded", claimed:"Claimed", dead:"Dead" }
function fmt(n: number) { return n >= 1000 ? "$" + Math.round(n/1000) + "k" : "$" + n }

export default function OutreachPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const PAGE = 50

  const load = useCallback(async (pg: number, sf: string) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(pg) })
    if (sf !== "all") params.set("status", sf)
    const res = await fetch("/api/outreach?" + params)
    const json = await res.json()
    setContacts(json.data || [])
    setTotal(json.count || 0)
    setLoading(false)
  }, [])

  useEffect(() => { load(0, "all") }, [load])

  const statuses = ["all","new","contacted","responded","claimed","dead"]

  return (
    <div style={{ padding: "24px", background: "#0a0a0a", minHeight: "100vh" }}>
      <h1 style={{ ...m, color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 24px" }}>
        Outreach Pipeline <span style={{ color: "#555", fontSize: 13 }}>({total} contacts)</span>
      </h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {statuses.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); load(0, s) }}
            style={{ ...m, fontSize: 11, padding: "5px 12px", borderRadius: 20,
              background: statusFilter === s ? (SC[s] || "#4ade80") : "#1a1a1a",
              color: statusFilter === s ? "#000" : "#666",
              border: "1px solid " + (statusFilter === s ? "transparent" : "#333"),
              cursor: "pointer" }}>
            {s === "all" ? "All" : SL[s]}
          </button>
        ))}
      </div>
      {loading && <div style={{ ...m, color: "#444", textAlign: "center", marginTop: 40 }}>Loading...</div>}
      {!loading && contacts.length === 0 && (
        <div style={{ ...m, color: "#444", fontSize: 13, textAlign: "center", marginTop: 80 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div>No contacts in pipeline yet.</div>
          <div style={{ color: "#333", marginTop: 8 }}>Add records from the Overages tab using the + button.</div>
        </div>
      )}
      {!loading && contacts.length > 0 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "8px 12px", borderBottom: "1px solid #222", marginBottom: 4 }}>
            {["Owner","Amount","County","Status","Last Contact"].map(h => (
              <div key={h} style={{ ...m, fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: 1 }}>{h}</div>
            ))}
          </div>
          {contacts.map(c => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "10px 12px", borderBottom: "1px solid #111", alignItems: "center" }}>
              <div>
                <div style={{ ...m, fontSize: 12, color: "#ccc" }}>{c.owner_name}</div>
                {c.mailing_address && <div style={{ ...m, fontSize: 10, color: "#3b82f6" }}>✉ {c.mailing_address}</div>}
              </div>
              <div style={{ ...m, fontSize: 13, fontWeight: 700, color: "#a3e635" }}>{fmt(c.surplus_amount)}</div>
              <div style={{ ...m, fontSize: 11, color: "#666" }}>{c.county}, {c.state}</div>
              <span style={{ ...m, fontSize: 10, padding: "2px 8px", borderRadius: 12, background: SC[c.status] + "22", color: SC[c.status], border: "1px solid " + SC[c.status] + "44" }}>{SL[c.status]}</span>
              <div style={{ ...m, fontSize: 10, color: "#444" }}>{c.last_contact_at ? new Date(c.last_contact_at).toLocaleDateString() : "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
