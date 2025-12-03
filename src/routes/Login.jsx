// src/routes/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { login } from "../authActions.js";
import AppShell from "../components/AppShell.jsx";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // Solange Auth Zustand noch lädt
  if (loading) {
    return (
      <AppShell title="Login">
        <div style={{ padding: "2rem" }}>Prüfe Login Status…</div>
      </AppShell>
    );
  }

  // Wenn User schon eingeloggt ist → direkt zur Mainseite
  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setBusy(true);

    const { error } = await login(email, password);
    if (error) {
      setMsg(error.message);
      setBusy(false);
      return;
    }

    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  return (
    <AppShell title="Login">
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "40px 24px 64px",
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          gap: "48px",
          alignItems: "flex-start",
        }}
      >
        {/* Linke Seite: Textblock */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              marginBottom: "12px",
              color: "var(--cp-ink)",
            }}
          >
            Willkommen im Ströer City Profiler
          </h1>
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.6,
              color: "var(--cp-muted, #4b5563)",
              maxWidth: "520px",
            }}
          >
            Bitte melde dich mit deinem persönlichen Zugang an. 
            Du erhältst Zugriff auf deine bisherigen Chats, Dokumente 
            und Analysen für deine Städte.
          </p>
        </div>

        {/* Rechte Seite: Login Card */}
        <div
          style={{
            flexBasis: "360px",
            maxWidth: "380px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.15)",
            padding: "28px 24px 24px",
            border: "1px solid rgba(148, 163, 184, 0.35)",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "4px",
              color: "var(--cp-ink)",
            }}
          >
            Login
          </h2>
          <p
            style={{
              fontSize: "13px",
              marginBottom: "20px",
              color: "var(--cp-muted, #6b7280)",
            }}
          >
            Nur für registrierte interne Nutzerinnen und Nutzer.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                E Mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                Passwort
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {msg && (
              <div
                style={{
                  marginBottom: "12px",
                  fontSize: "13px",
                  color: "#b91c1c",
                }}
              >
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "999px",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                cursor: busy ? "default" : "pointer",
                background: "var(--cp-primary, #2563eb)",
                color: "#fff",
                boxShadow: "0 10px 25px rgba(37, 99, 235, 0.45)",
              }}
            >
              {busy ? "Wird eingeloggt…" : "Login"}
            </button>
          </form>

          <p
            style={{
              marginTop: "16px",
              fontSize: "12px",
              color: "var(--cp-muted, #6b7280)",
              lineHeight: 1.5,
            }}
          >
    
          </p>
        </div>
      </div>
    </AppShell>
  );
}
