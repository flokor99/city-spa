import { useState } from "react";
import AppShell from "../components/AppShell.jsx";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hallo, was kann ich für dich tun?" }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const statusMsg =
    'Ihre Analyse wird erstellt und erscheint in Kürze unter dem Menüpunkt "Dokumente". Dieser Vorgang kann einige Minuten dauern. Bitte haben Sie Geduld.';

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setInput("");
    setBusy(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      // --- Accepted-Fall (Analyse dauert im Backend) ---
      if (res.status === 202) {
        setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
        return;
      }

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { reply: raw };
      }

      // Falls das Backend so etwas sendet wie {status:"Accepted"} etc.
      if (
        data?.accepted === true ||
        data?.status === "Accepted" ||
        (typeof data?.reply === "string" &&
          data.reply.toLowerCase() === "accepted")
      ) {
        setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
        return;
      }

      const reply =
        data.reply ??
        data.message ??
        data.text ??
        raw ??
        "Keine Antwort erhalten";

      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (err) {
      // Falls wirklich etwas schiefgeht: auch Status anzeigen
      setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
    } finally {
      setBusy(false);
    }
  };

  // -- UI Bubble, wie früher --
  const Bubble = ({ role, children }) => {
    const isUser = role === "user";
    const isSystem = role === "system";
    return (
      <div
        className={`w-full flex ${
          isUser ? "justify-end" : "justify-start"
        } my-2`}
      >
        <div
          className="max-w-[72ch] rounded-2xl px-4 py-3 border"
          style={{
            background: isUser ? "rgba(0,174,239,0.10)" : "var(--cp-bg)",
            borderColor: "var(--cp-line)",
            color: isSystem ? "var(--cp-muted)" : "var(--cp-ink)"
          }}
        >
          <div className="cp-small mb-1x" style={{ color: "var(--cp-muted)" }}>
            {isUser ? "Du" : "City Profiler"}
          </div>
          <div className="cp-body">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <AppShell title="Chat Test 3">
      <h2>Chat Test – mit Analyse-Handling</h2>

      <div
        className="rounded-2xl border"
        style={{ borderColor: "var(--cp-line)", background: "#F7F8FA" }}
      >
        <div className="p-4 h-[56vh] overflow-y-auto">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role}>
              {m.text}
            </Bubble>
          ))}
        </div>

        <form
          onSubmit={send}
          className="p-3 border-t flex gap-2 items-center"
          style={{
            borderColor: "var(--cp-line)",
            background: "var(--cp-bg)"
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nachricht…"
            className="cp-input flex-1"
          />
          <button disabled={busy} className="cp-btn">
            {busy ? "Senden…" : "Senden"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
