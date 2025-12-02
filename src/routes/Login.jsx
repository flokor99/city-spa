// src/routes/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { login } from "../authActions.js";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  // Solange Auth Zustand noch lädt
  if (loading) {
    return <div style={{ padding: "2rem" }}>Prüfe Login Status…</div>;
  }

  // Wenn User schon eingeloggt ist → direkt zur Mainseite
  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const { error } = await login(email, password);
    if (error) {
      setMsg(error.message);
      return;
    }

    // Falls ein "from" in state gesetzt ist (z.B. /chat), dahin zurück
    // sonst Standard: Mainseite "/"
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 320, marginTop: "1rem" }}>
        <div style={{ marginBottom: "0.75rem" }}>
          <label>
            Email
            <br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "0.75rem" }}>
          <label>
            Passwort
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>
        <button type="submit">Login</button>
      </form>

      {msg && (
        <p style={{ marginTop: "1rem", color: "red" }}>
          {msg}
        </p>
      )}
    </div>
  );
}
