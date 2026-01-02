// AppShell.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../authActions.js";

export default function AppShell({ title, children }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

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
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexShrink: 0,
            }}
          >
            {/* Titel + Skyline */}
            <div
              style={{
                position: "relative",
                fontSize: 14,
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
                letterSpacing: ".2px",
                textAlign: "right",
                paddingRight: "70px", // Platz für Skyline + kleinen Abstand
                flexShrink: 0,
              }}
            >
              <span style={{ position: "relative", zIndex: 2 }}>
                {title || "City Profiler"}
              </span>

              <img
                src="/assets/skyline.png"
                alt=""
                aria-hidden="true"
                style={{
                  position: "absolute",
                  right: "215px", // Skyline endet leicht links vom Text "Dokumente"
                  bottom: "-24px", // untere Kante genau am orangenen Strich
                  height: "58px",
                  opacity: 0.9,
                  zIndex: 1,
                }}
              />
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "rgba(255,255,255,0.9)",
                padding: "8px 10px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                cursor: loggingOut ? "not-allowed" : "pointer",
                opacity: loggingOut ? 0.7 : 1,
              }}
              aria-label="Logout"
              title="Logout"
            >
              {loggingOut ? "Logout…" : "Logout"}
            </button>
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
        ></div>
      </footer>
    </div>
  );
}
