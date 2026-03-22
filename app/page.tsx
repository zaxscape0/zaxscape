import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #111", padding: "0 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="/logo.jpg" alt="ZaxScape" style={{ height: "52px" }} />
          </div>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <Link href="/login" style={{ fontFamily: "'Courier New', monospace", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#666", textDecoration: "none" }}>Sign in</Link>
            <Link href="/signup" style={{ fontFamily: "'Courier New', monospace", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", background: "#fff", color: "#000", padding: "10px 20px", textDecoration: "none", fontWeight: 700 }}>Get started →</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 20px 60px" }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: "24px" }}>// Massachusetts property intelligence</div>
        <h1 style={{ fontSize: "clamp(38px, 6vw, 74px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 32px", maxWidth: "800px" }}>
          Find motivated sellers<br />before anyone else does.
        </h1>
        <p style={{ fontSize: "22px", color: "#999", lineHeight: 1.6, maxWidth: "560px", margin: "0 0 48px" }}>
          Live property data from Boston public records. Filter by motivation score, property type, and location. Unlock owner contact info on demand.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Link href="/signup" style={{ fontFamily: "'Courier New', monospace", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", background: "#fff", color: "#000", padding: "16px 32px", textDecoration: "none", fontWeight: 700 }}>Get started free →</Link>
          <Link href="/login" style={{ fontFamily: "'Courier New', monospace", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid #333", color: "#888", padding: "16px 32px", textDecoration: "none" }}>Sign in</Link>
        </div>
        <div style={{ marginTop: "24px", fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#444" }}>
          21,000+ Boston properties · Commercial or residential free · Both for $4.99/mo
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: "1px solid #111", borderBottom: "1px solid #111" }}>
        <div className="stats-grid" style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "#111" }}>
          {[
            { n: "21,000+", label: "Boston properties" },
            { n: "2,500+", label: "High-motivation leads" },
            { n: "Free", label: "Commercial or residential" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#000", padding: "48px 40px" }}>
              <div style={{ fontSize: "50px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "8px" }}>{s.n}</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#555" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "100px 40px" }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: "48px" }}>// what you get</div>
        <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1px", background: "#111" }}>
          {[
            { title: "Motivation scoring", body: "Every property is scored on 5 signals: individual ownership, age, absentee status, land value ratio, and equity. Filter to only the most motivated sellers." },
            { title: "Commercial or residential", body: "Choose your focus when you sign up. Commercial mixed-use, retail, and industrial — or residential single/multi-family. Switch anytime." },
            { title: "Live Boston data", body: "Pulled directly from the City of Boston's open data portal. Owner name, mailing address, assessed value, year built, property type." },
            { title: "Contact unlock", body: "See every property free. Pay per contact to unlock owner phone and email via skip tracing — only pay for leads you actually want." },
          ].map((f, i) => (
            <div key={i} style={{ background: "#000", padding: "40px" }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#555", marginBottom: "16px" }}>0{i+1}</div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.01em" }}>{f.title}</h3>
              <p style={{ color: "#888", fontSize: "17px", lineHeight: 1.6, margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ borderTop: "1px solid #111", padding: "100px 40px" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: "24px" }}>// pricing</div>
          <h2 style={{ fontSize: "42px", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 16px" }}>Free to start</h2>
          <p style={{ color: "#888", fontSize: "18px", margin: "0 0 40px", lineHeight: 1.6 }}>Commercial or residential access is free. Unlock both for $4.99/mo. Contact info unlocked separately per lead.</p>
          <div style={{ border: "1px solid #222", padding: "32px", marginBottom: "32px", textAlign: "left" }}>
            {["21,000+ Boston properties","Commercial or residential — free","Both property types — $4.99/mo","Motivation score + signals","Filter by zip, value, year built","Owner name + mailing address","Contact unlock $0.99/lead"].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: i < 5 ? "12px" : 0 }}>
                <span style={{ color: "#4ade80", fontWeight: 700 }}>✓</span>
                <span style={{ color: "#bbb", fontSize: "16px" }}>{f}</span>
              </div>
            ))}
          </div>
          <Link href="/signup" style={{ display: "block", fontFamily: "'Courier New', monospace", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", background: "#fff", color: "#000", padding: "18px 32px", textDecoration: "none", fontWeight: 700, textAlign: "center" }}>Get started →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #111", padding: "40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#333" }}>© 2026 ZaxScape · Massachusetts property intelligence</div>
          <Link href="/login" style={{ fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#444", textDecoration: "none" }}>Sign in</Link>
        </div>
      </footer>
    </div>
  )
}
