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
          position: "relative",
          background: "#081830", // dunkles PDF-Blau
          color: "#fff",
          borderBottom: "4px solid var(--cp-orange)",
          overflow: "hidden",
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
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Linke Seite – Logo */}
          <img
            src="/assets/stroeer-logo.png"
            alt="Ströer Logo"
            style={{ height: "42px", width: "auto" }}
          />

          {/* Rechte Seite – Titel + Skyline im selben Container */}
          <div
            style={{
              position: "relative",
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: ".2px",
              textAlign: "right",
              paddingRight: "120px", // Platz für die Skyline
              flexShrink: 0,
            }}
          >
            {/* Titel selbst */}
            <span
              style={{
                position: "relative",
                zIndex: 2,
              }}
            >
              {title || "City Profiler"}
            </span>

            {/* Skyline, jetzt an den Titel-Container gebunden */}
            <img
              src="/assets/skyline.png"
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                right: 0,
                bottom: "-2px",
                height: "58px",
                opacity: 0.9,
                zIndex: 1,
              }}
            />
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
