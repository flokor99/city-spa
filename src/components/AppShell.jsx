export default function AppShell({ title, children }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--cp-bg)", color: "var(--cp-ink)", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--cp-line)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--cp-primary)", margin: 0 }}>
            {title}
          </h1>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-muted)" }}>
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
