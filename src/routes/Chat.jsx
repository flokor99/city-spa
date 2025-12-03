// src/routes/Chat.jsx
import { useState } from "react";
import AppShell from "../components/AppShell.jsx";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const raw = await res.text();
      setMessages((m) => [...m, { role: "assistant", text: raw }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: "ERROR: " + err }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Chat-Test">
      <h2>Minimaler Chat-Test</h2>
      <p>Hier testen wir nur, ob die Netlify-Function antwortet.</p>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          height: "50vh",
          overflowY: "auto",
          marginBottom: "1rem"
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "1rem" }}>
            <strong>{m.role === "user" ? "Du" : "Agent"}:</strong>
            <div>{m.text}</div>
          </div>
        ))}
      </div>

      <form onSubmit={send} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nachricht..."
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button disabled={busy} style={{ padding: "0.5rem 1rem" }}>
          Senden
        </button>
      </form>
    </AppShell>
  );
}
