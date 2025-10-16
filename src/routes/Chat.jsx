import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([{ role: "system", text: "Noch ohne Backend." }]);
  const [input, setInput] = useState("");

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(m => [...m, { role: "user", text: input }]);
    setInput("");
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
        <button className="border rounded-xl px-4 py-2">Senden</button>
      </form>
    </div>
  );
}
