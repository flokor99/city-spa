import { useState, useEffect } from "react";
import AppShell from "../components/AppShell.jsx";
import { useAuth } from "../AuthContext.jsx";
import {
  fetchCities,
  fetchConversations,
  createConversation,
  fetchMessages,
  addMessage,
} from "../supabaseData";

export default function Chat() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hallo, was kann ich für dich tun?" },
  ]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(""); // uuid String
  const [conversationId, setConversationId] = useState(null);
  const [loadingConversation, setLoadingConversation] = useState(true);

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

    // lokale Anzeige der User Nachricht
    setMessages((m) => [...m, { role: "user", text: t }]);
    setBusy(true);

    // in DB speichern, falls Conversation existiert
    if (conversationId) {
      await addMessage({
        conversationId,
        userId: user.id,
        role: "user",
        content: t,
      });
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);

      const r = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: t }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (r.status === 202) {
        setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
        return;
      }

      if (!r.ok) {
        setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
        return;
      }

      const d = await r.json();

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

      // Antwort in DB speichern
      if (conversationId) {
        await addMessage({
          conversationId,
          userId: user.id,
          role: "assistant",
          content: replyText,
        });
      }
    } catch (err) {
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

  // Städte laden
  useEffect(() => {
    async function loadCities() {
      const { data, error } = await fetchCities();
      if (!error && data) {
        setCities(data);
        if (data.length > 0) setSelectedCity(data[0].id);
      }
    }
    loadCities();
  }, []);

  // Conversation pro User + Stadt laden oder anlegen
  useEffect(() => {
    if (!user || !selectedCity) return;

    async function loadOrCreateConversation() {
      setLoadingConversation(true);

      // 1. gibt es schon eine Conversation für diesen User + diese Stadt
      const { data: convos, error: convError } = await fetchConversations(
        user.id,
        selectedCity
      );

      if (!convError && convos && convos.length > 0) {
        const convo = convos[0];
        setConversationId(convo.id);

        const { data: msgs, error: msgError } = await fetchMessages(convo.id);
        if (!msgError && msgs) {
          setMessages(
            msgs.map((m) => ({
              role: m.role,
              text: m.content,
            }))
          );
        }
      } else {
        // 2. neue Conversation anlegen
        const { data: convo, error: createError } = await createConversation({
          userId: user.id,
          cityId: selectedCity,
          title: null,
        });

        if (!createError && convo) {
          setConversationId(convo.id);
          setMessages([
            {
              role: "assistant",
              text: "Hallo, was kann ich für dich tun?",
            },
          ]);
        }
      }

      setLoadingConversation(false);
    }

    loadOrCreateConversation();
  }, [user, selectedCity]);

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
            color: isSystem ? "var(--cp-muted)" : "var(--cp-ink)",
          }}
        >
          <div
            className="cp-small mb-1x"
            style={{ color: "var(--cp-muted)" }}
          >
            {isUser ? "Du" : isSystem ? "System" : "City Profiler"}
          </div>
          <div className="cp-body">{children}</div>
        </div>
      </div>
    );
  };

  if (loadingConversation) {
    return (
      <AppShell title="Chat">
        <a href="/" className="cp-small cp-link">
          ← Zurück
        </a>
        <div style={{ padding: "2rem" }}>Conversation wird geladen…</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Chat">
      <a href="/" className="cp-small cp-link">
        ← Zurück
      </a>

      {/* Stadt wählen */}
      <div className="mt-4 mb-4">
        <label className="cp-small">Stadt auswählen:</label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="cp-input"
          style={{ maxWidth: 250 }}
        >
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div
        className="rounded-2xl border"
        style={{ borderColor: "var(--cp-line)", background: "#F7F8FA" }}
      >
        {/* Nachrichten */}
        <div className="p-4 h-[56vh] overflow-y-auto">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role}>
              {m.text}
            </Bubble>
          ))}
        </div>

        {/* Eingabe */}
        <form
          onSubmit={onSubmit}
          className="p-3 border-t flex gap-2 items-center"
          style={{ borderColor: "var(--cp-line)", background: "var(--cp-bg)" }}
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
