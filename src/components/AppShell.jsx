export default function AppShell({ title, children }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--cp-bg)", color: "var(--cp-ink)", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "var(--cp-navy)", color: "#fff", borderBottom: "3px solid var(--cp-orange)" }}>
  <div style={{ maxWidth: 1120, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#fff", letterSpacing: ".2px" }}>
      City Profiler
    </h1>
    <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
      City Profiler
    </div>
  </div>
</header>


      {/* Content */}
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px" }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--cp-line)", marginTop: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "12px 24px", fontSize: 12, color: "var(--cp-muted)" }}>
          Quelle: OECD Regional Well-Being (2025)
        </div>
      </footer>
    </div>
  );
}
