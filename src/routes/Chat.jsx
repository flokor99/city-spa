import { useState, useEffect } from "react";
import AppShell from "../components/AppShell.jsx";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hallo, was kann ich für dich tun?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const statusMsg =
    'Ihre Analyse wird erstellt und erscheint in Kürze unter dem Menüpunkt "Dokumente". Dieser Vorgang kann einige Minuten dauern. Bitte haben Sie Geduld.';

  const getReplyText = (d) =>
    (typeof d?.reply === "string" && d.reply) ||
    d?.reply?.message ||
    d?.reply?.text ||
    d?.message ||
    d?.text ||
    "…";

  const sendText = async (text) => {
    const t = text.trim();
    if (!t || busy) return;

    setMessages((m) => [...m, { role: "user", text: t }]);
    setBusy(true);

    try {
      // optional: kleines client-Timeout, um Hänger elegant abzufangen
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000); // 30s

      const r = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: t }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      // 1) „Accepted“ / Long-running → zeige Status
      if (r.status === 202) {
        setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
        return;
      }
      // 2) Nicht-ok → Statusmeldung statt Fehler
      if (!r.ok) {
        setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
        return;
      }

      const d = await r.json();

      // Falls der Backend-Flow „Accepted“ als Feld zurückgibt
      if (
        d?.accepted === true ||
        d?.status === "Accepted" ||
        (typeof d?.reply === "string" && d.reply.toLowerCase() === "accepted")
      ) {
        setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
        return;
      }

      const replyText = getReplyText(d);
      setMessages((m) => [...m, { role: "assistant", text: replyText }]);
    } catch (err) {
      // 3) Netzwerk/Timeout/etc. → Statusmeldung statt Fehlermeldung
      setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
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
      sendText(
        `Bitte starte eine vollständige Analyse für ${city}. Erzeuge anschließend den PDF-Output.`
      );
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

      <div className="rounded-2xl border mt-4" style={{ borderColor: "var(--cp-line)", background: "#F7F8FA" }}>
        {/* Nachrichten */}
        <div className="p-4 h-[56vh] overflow-y-auto">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role}>{m.text}</Bubble>
          ))}
        </div>

        {/* Eingabe */}
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
