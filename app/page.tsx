import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ZaxScape — Unclaimed Surplus Fund Database for Georgia',
  description: 'Find unclaimed tax sale surplus funds across Georgia counties. 5,991 records. Filter by county, deadline, and amount. Built for surplus fund recovery agents.',
  openGraph: {
    title: 'ZaxScape — Georgia Surplus Fund Recovery Tool',
    description: 'The fastest way to find unclaimed tax deed surplus funds in Georgia. 5,991 records across 25+ counties with deadlines, amounts, and owner names.',
    url: 'https://app.zaxscape.com',
  },
}

const mono = "'Courier New', monospace"

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <nav style={{ borderBottom: "1px solid #111", padding: "0 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="/logo.jpg" alt="ZaxScape" style={{ height: "52px" }} />
          </div>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <Link href="/login" style={{ fontFamily: mono, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#666", textDecoration: "none" }}>Sign in</Link>
            <Link href="/signup" style={{ fontFamily: mono, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", background: "#fff", color: "#000", padding: "10px 20px", textDecoration: "none", fontWeight: 700 }}>Get access →</Link>
          </div>
        </div>
      </nav>

      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 40px 60px" }}>
        <div style={{ fontFamily: mono, fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4ade80", marginBottom: "24px" }}>// Georgia surplus fund recovery</div>
        <h1 style={{ fontSize: "clamp(38px, 6vw, 72px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 32px", maxWidth: "800px" }}>
          Stop searching county<br />websites one by one.
        </h1>
        <p style={{ fontSize: "21px", color: "#999", lineHeight: 1.6, maxWidth: "580px", margin: "0 0 48px" }}>
          5,991 unclaimed tax deed surplus records across 25+ Georgia counties — with owner names, amounts, and deadlines — all in one place.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
          <Link href="/signup" style={{ fontFamily: mono, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", background: "#4ade80", color: "#000", padding: "16px 32px", textDecoration: "none", fontWeight: 700 }}>Start for free →</Link>
          <Link href="/login" style={{ fontFamily: mono, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid #333", color: "#888", padding: "16px 32px", textDecoration: "none" }}>Sign in</Link>
        </div>
        <div style={{ fontFamily: mono, fontSize: "13px", color: "#444" }}>
          No credit card · Free to browse · Updated regularly
        </div>
      </section>

      <section style={{ borderTop: "1px solid #111", borderBottom: "1px solid #111" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "#111" }}>
          {[
            { n: "5,991", label: "Unclaimed surplus records" },
            { n: "25+", label: "Georgia counties covered" },
            { n: "$0", label: "To start searching" },
          ].map(({ n, label }) => (
            <div key={label} style={{ background: "#000", padding: "48px 40px" }}>
              <div style={{ fontSize: "52px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "8px", color: "#fff" }}>{n}</div>
              <div style={{ fontFamily: mono, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#555" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "100px 40px" }}>
        <div style={{ fontFamily: mono, fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: "48px" }}>// built for recovery agents</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1px", background: "#111" }}>
          {[
            {
              n: "01",
              title: "All counties in one search",
              body: "Filter across Cherokee, Gwinnett, Forsyth, DeKalb, Cobb, Liberty, and 20+ more counties simultaneously. No more jumping between county websites."
            },
            {
              n: "02",
              title: "Deadlines that matter",
              body: "Georgia law gives claimants 5 years from the sale date. We show you exactly how many days are left on each record so you can prioritize urgent cases."
            },
            {
              n: "03",
              title: "Owner names & amounts",
              body: "See the previous owner of record, the surplus amount, property address, and case number — everything you need to identify and contact a claimant."
            },
            {
              n: "04",
              title: "Built-in outreach pipeline",
              body: "Add cases to your pipeline, track contact status, generate claim letters, and mark cases as contacted, responded, or claimed. Your CRM for surplus recovery."
            },
          ].map(({ n, title, body }) => (
            <div key={n} style={{ background: "#000", padding: "40px" }}>
              <div style={{ fontFamily: mono, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#4ade80", marginBottom: "16px" }}>{n}</div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.01em" }}>{title}</h3>
              <p style={{ color: "#888", fontSize: "16px", lineHeight: 1.6, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ borderTop: "1px solid #111", padding: "100px 40px" }}>
        <div style={{ maxWidth: "540px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: "24px" }}>// pricing</div>
          <h2 style={{ fontSize: "42px", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 16px" }}>Free to start</h2>
          <p style={{ color: "#888", fontSize: "18px", margin: "0 0 40px", lineHeight: 1.6 }}>
            Browse all 5,991 records for free. Upgrade for advanced filters, bulk export, and outreach tools.
          </p>
          <div style={{ border: "1px solid #222", padding: "32px", marginBottom: "32px", textAlign: "left" }}>
            {[
              "5,991 unclaimed surplus records",
              "25+ Georgia counties",
              "Owner names + amounts",
              "Deadline countdown",
              "Filter by county, amount, status",
              "Built-in outreach CRM",
              "Auto-generated claim letters",
            ].map(item => (
              <div key={item} style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <span style={{ color: "#4ade80", fontWeight: 700 }}>✓</span>
                <span style={{ color: "#bbb", fontSize: "16px" }}>{item}</span>
              </div>
            ))}
          </div>
          <Link href="/signup" style={{ display: "block", fontFamily: mono, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", background: "#4ade80", color: "#000", padding: "18px 32px", textDecoration: "none", fontWeight: 700, textAlign: "center" }}>
            Get started free →
          </Link>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #111", padding: "40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: mono, fontSize: "13px", color: "#333" }}>© 2026 ZaxScape · Georgia surplus fund recovery</div>
          <Link href="/login" style={{ fontFamily: mono, fontSize: "13px", color: "#444", textDecoration: "none" }}>Sign in</Link>
        </div>
      </footer>
    </div>
  )
}
