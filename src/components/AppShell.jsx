export default function AppShell({ title, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--cp-bg)",
        color: "var(--cp-ink)",
        fontFamily: "Inter, system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
     {/* Header */}
<header
  style={{
    background: "var(--cp-navy)", // Dunkelblau
    color: "#fff",
    borderBottom: "4px solid var(--cp-orange)", // Orange Linie unten
  }}
>
  <div
    style={{
      maxWidth: 1120,
      margin: "0 auto",
      padding: "14px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    {/* Linke Seite – Logo + Text */}
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <img
        src="/assets/stroeer-logo.png"
        alt="Ströer Logo"
        style={{ height: "28px", width: "auto" }}
      />
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: ".2px",
          color: "#fff",
        }}
      >
        City Profiler
      </div>
    </div>

    {/* Rechte Seite – optionaler Titel */}
    <div
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: "rgba(255,255,255,0.85)",
        letterSpacing: ".2px",
      }}
    >
      {title || "City Profiler"}
    </div>
  </div>
</header>

      {/* Hauptinhalt */}
      <main
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--cp-line)",
          marginTop: 48,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "12px 24px",
            fontSize: 12,
            color: "var(--cp-muted)",
          }}
        >
          Quelle: OECD Regional Well-Being (2025)
        </div>
      </footer>
    </div>
  );
}

