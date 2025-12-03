// src/routes/Chat.jsx
import { useState, useEffect } from "react";
import AppShell from "../components/AppShell.jsx";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hallo, was kann ich für dich tun?" }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  // Schnellstart
  const [urlCity, setUrlCity] = useState(null);
  const [autoInserted, setAutoInserted] = useState(false);

  const statusMsg =
    'Ihre Anfrage wird verarbeitet. Falls es sich um eine Analyse handelt, erscheint das fertige Dokument in Kürze unter "Dokumente". Bitte etwas Geduld.';

  const extractReply = (data, raw) =>
    data?.reply ||
    data?.message ||
    data?.text ||
    raw ||
    "…";

  // -------------------------------------------
  // Nachricht senden
  // -------------------------------------------
  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setBusy(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          city: urlCity || null,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.status === 202) {
        setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
        return;
      }

      const raw = await res.text();
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { reply: raw };
      }

      const isAccepted =
        data?.accepted === true ||
        data?.status === "Accepted" ||
        (typeof data?.reply === "string" &&
          data.reply.toLowerCase() === "accepted");

      if (isAccepted) {
        setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
        return;
      }

      const reply = extractReply(data, raw);
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
    } finally {
      setBusy(false);
    }
  };

  // -------------------------------------------
  // Schnellstart aus URL lesen (?city=Köln)
  // -------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("city");

    if (c) {
      setUrlCity(c);
      window.history.replaceState({}, "", "/chat");
    }
  }, []);

  // -------------------------------------------
  // Wenn URL-Stadt gesetzt → Auto-Start-Text ins Input-Feld
  // -------------------------------------------
  useEffect(() => {
    if (!urlCity) return;
    if (autoInserted) return;

    setInput(
      `Bitte starte eine vollständige Analyse für ${urlCity}. Erzeuge anschließend den PDF-Output.`
    );

    setAutoInserted(true);
  }, [urlCity, autoInserted]);

  // -------------------------------------------
  // UI
  // -------------------------------------------
  const Bubble = ({ role, children }) => {
    const isUser = role === "user";
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
    <AppShell title="Chat">
      <a href="/" className="cp-small cp-link">← Zurück</a>

      <div
        className="rounded-2xl border mt-4"
        style={{
          borderColor: "var(--cp-line)",
          background: "#F7F8FA",
        }}
      >
        <div className="p-4 h-[60vh] overflow-y-auto">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role}>{m.text}</Bubble>
          ))}
        </div>

        <form
          onSubmit={sendMessage}
          className="p-3 border-t flex gap-2 items-center"
          style={{
            borderColor: "var(--cp-line)",
            background: "var(--cp-bg)",
          }}
        >
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
