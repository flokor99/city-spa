import { useState, useEffect } from "react";
import AppShell from "../components/AppShell.jsx";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "system", text: "Verbunden über /functions/chat" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const sendText = async (text) => {
    const t = text.trim();
    if (!t || busy) return;

    setMessages((m) => [...m, { role: "user", text: t }]);
    setBusy(true);

    try {
      const r = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: t }),
      });
      const d = await r.json();
      const replyText = d?.reply?.message || d?.reply?.text || "…";
      setMessages((m) => [...m, { role: "assistant", text: replyText }]);
    } catch {
      setMessages((m) => [...m, { role: "system", text: "Fehler beim Senden." }]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    sendText(input);
    setInput("");
  };

  // Auto-Start, wenn ?city=… in der URL steht
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    if (city) {
      sendText(`Bitte starte eine vollständige Analyse für ${city}. Erzeuge anschließend den PDF-Output.`);
      // Query-Param optional entfernen:
      window.history.replaceState({}, "", "/chat");
    }
  }, []);

  const Bubble = ({ role, children }) => {
    const isUser = role === "user";
    const isSystem = role === "system";
    return (
      <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
        <div
          className="max-w-[72ch] rounded-2xl px-4 py-3 border"
          style={{
            background: isUser ? "rgba(0,174,239,0.10)" : "var(--cp-bg)",
            borderColor: "var(--cp-line)",
            color: isSystem ? "var(--cp-muted)" : "var(--cp-ink)",
          }}
        >
          <div className="cp-small mb-1x" style={{ color: "var(--cp-muted)" }}>
            {isUser ? "Du" : isSystem ? "System" : "City Profiler"}
          </div>
          <div className="cp-body">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <AppShell title="Chat">
      <a href="/" className="cp-small cp-link">← Zurück</a>

      <div className="inline-block mt-3 mb-4 rounded-full px-3 py-1 border cp-small"
           style={{ borderColor: "var(--cp-line)", color: "var(--cp-muted)", background: "var(--cp-bg)" }}>
        Verbunden über <span style={{ color: "var(--cp-primary)", fontWeight: 600 }}>/functions/chat</span>
      </div>

      <div className="rounded-2xl border" style={{ borderColor: "var(--cp-line)", background: "#F7F8FA" }}>
        <div className="p-4 h-[56vh] overflow-y-auto">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role}>{m.text}</Bubble>
          ))}
        </div>

        <form onSubmit={onSubmit} className="p-3 border-t flex gap-2 items-center"
              style={{ borderColor: "var(--cp-line)", background: "var(--cp-bg)" }}>
          <input
            type="text"
            placeholder="Nachricht…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="cp-input flex-1"
          />
          <button type="submit" disabled={busy} className="cp-btn">
            {busy ? "Senden…" : "Senden"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
