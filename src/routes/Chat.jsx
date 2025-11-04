import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([{ role: "system", text: "Verbunden über /functions/chat" }]);
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
      const replyText =
        d?.reply?.message || d?.reply?.text || d?.reply?.answer || JSON.stringify(d.reply ?? d);
      setMessages(m => [...m, { role: "assistant", text: replyText }]);
    } catch (err) {
      setMessages(m => [...m, { role: "assistant", text: "Fehler beim Chat-Aufruf." }]);
    } finally { setBusy(false); }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 border-b bg-white"><a href="/" className="text-sm">← Zurück</a></header>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className="inline-block px-3 py-2 rounded-xl bg-white border">{m.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="p-3 border-t bg-white flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Nachricht…" className="flex-1 border rounded-xl px-3 py-2" />
        <button className="border rounded-xl px-4 py-2" disabled={busy}>{busy ? "…" : "Senden"}</button>
      </form>
    </div>
  );
}
