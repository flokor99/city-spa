// src/routes/AuthTest.jsx
import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { login, logout, register } from "../authActions.js";

export default function AuthTest() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  if (loading) {
    return <div>Prüfe Login Status...</div>;
  }

  const handleLogin = async () => {
    setMsg("");
    const { error } = await login(email, password);
    if (error) setMsg(error.message);
  };

  const handleRegister = async () => {
    setMsg("");
    const { error } = await register(email, password);
    if (error) setMsg(error.message);
    else setMsg("User registriert. Du solltest jetzt eingeloggt sein");
  };

  const handleLogout = async () => {
    setMsg("");
    const { error } = await logout();
    if (error) setMsg(error.message);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Auth Test</h1>

      {user ? (
        <>
          <p>Eingeloggt als <strong>{user.email}</strong></p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <div>
              <label>
                Email
                <br />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </label>
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              <label>
                Passwort
                <br />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </label>
            </div>
          </div>

          <button onClick={handleLogin} style={{ marginRight: "0.5rem" }}>
            Login
          </button>
          <button onClick={handleRegister}>
            Registrieren
          </button>
        </>
      )}

      {msg && (
        <p style={{ marginTop: "1rem", color: "red" }}>
          {msg}
        </p>
      )}
    </div>
  );
}
