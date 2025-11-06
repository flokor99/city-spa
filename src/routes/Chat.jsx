import { useState } from "react";
import AppShell from "../components/AppShell.jsx";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "system", text: "Verbunden über /functions/chat" }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setBusy(true);

    try {
      const r = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const d = await r.json();
      const replyText = d?.reply?.message || d?.reply?.text || "…";
      setMessages(m => [...m, { role: "assistant", text: replyText }]);
    } catch (err) {
      setMessages(m => [...m, { role: "system", text: "Fehler beim Senden." }]);
    } finally {
      setBusy(false);
    }
  };

  const Bubble = ({ role, children }) => {
    const isUser = role === "user";
    const isSystem = role === "system";
    return (
      <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
        <div
          className="max-w-[72ch] rounded-2xl px-4 py-3 border"
          style={{
            background: isUser ? "rgba(0,174,239,0.10)" : "var(--cp-bg)",
            borderColor: isSystem ? "var(--cp-line)" : "var(--cp-line)",
            color: isSystem ? "var(--cp-muted)" : "var(--cp-ink)"
          }}
        >
          {/* Kopf-Zeile klein & dezent */}
          <div className="text-[11px] mb-1" style={{ color: "var(--cp-muted)" }}>
            {isUser ? "Du" : isSystem ? "System" : "City Profiler"}
          </div>
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <AppShell title="Chat">
      {/* Zurück-Link */}
      <a href="/" className="text-sm" style={{ color: "var(--cp-muted)" }}>
        ← Zurück
      </a>

      {/* Info-Badge */}
      <div
        className="inline-block mt-3 mb-4 rounded-full px-3 py-1 border text-xs"
        style={{ borderColor: "var(--cp-line)", color: "var(--cp-muted)", background: "var(--cp-bg)" }}
      >
        Verbunden über <span style={{ color: "var(--cp-primary)", fontWeight: 600 }}>/functions/chat</span>
      </div>

      {/* Chatfläche */}
      <div
        className="rounded-2xl border"
        style={{ borderColor: "var(--cp-line)", background: "#F7F8FA" }}
      >
        <div className="p-4 h-[56vh] overflow-y-auto">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role}>{m.text}</Bubble>
          ))}
        </div>

        {/* Eingabezeile */}
        <form onSubmit={send} className="p-3 border-t flex gap-2 items-center"
          style={{ borderColor: "var(--cp-line)", background: "var(--cp-bg)" }}
        >
          <input
            type="text"
            placeholder="Nachricht…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl px-3 py-2 border outline-none"
            style={{ borderColor: "var(--cp-line)" }}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl px-4 py-2 font-semibold"
            style={{
              background: busy ? "rgba(28,117,188,0.5)" : "var(--cp-primary)",
              color: "white",
              cursor: busy ? "not-allowed" : "pointer"
            }}
          >
            Senden
          </button>
        </form>
      </div>
    </AppShell>
  );
}
