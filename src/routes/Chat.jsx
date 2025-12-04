// src/routes/Chat.jsx
import { useState, useEffect } from "react";
import AppShell from "../components/AppShell.jsx";
import { useAuth } from "../AuthContext.jsx";
import {
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
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  // Schnellstart
  const [urlCity, setUrlCity] = useState(null);
  const [autoInserted, setAutoInserted] = useState(false);

  // Conversation aus der DB
  const [conversationId, setConversationId] = useState(null);
  const [loadingConversation, setLoadingConversation] = useState(true);

  const statusMsg =
    'Ihre Anfrage wird verarbeitet. Falls es sich um eine Analyse handelt, erscheint das fertige Dokument in Kürze unter "Dokumente". Bitte etwas Geduld.';

  const extractReply = (data, raw) =>
    data?.reply || data?.message || data?.text || raw || "…";

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
  // Conversation + Nachrichten aus Supabase laden
  // pro User. wir nehmen einfach die letzte Conversation
  // oder erzeugen eine neue
  // -------------------------------------------
  useEffect(() => {
    const initConversation = async () => {
      if (!user) {
        setLoadingConversation(false);
        return;
      }

      // 1. vorhandene Conversations holen
      const { data: convs, error } = await fetchConversations(user.id);

      if (error) {
        console.error("fetchConversations error", error);
      }

      let conv = convs && convs.length > 0 ? convs[0] : null;

      // 2. falls keine Conversation vorhanden, neue anlegen
      if (!conv) {
        const { data: newConv, error: createError } = await createConversation({
          userId: user.id,
          cityId: null, // fürs erste ignorieren wir die Stadtbindung
          title: urlCity || "Chat",
        });

        if (createError) {
          console.error("createConversation error", createError);
          setLoadingConversation(false);
          return;
        }

        conv = newConv;
      }

      setConversationId(conv.id);

      // 3. Nachrichten zu dieser Conversation laden
      const { data: msgs, error: msgError } = await fetchMessages(conv.id);

      if (msgError) {
        console.error("fetchMessages error", msgError);
      }

      if (msgs && msgs.length > 0) {
        setMessages(
          msgs.map((m) => ({
            role: m.role,
            text: m.content,
          }))
        );
      } else {
        // keine Messages gespeichert, Standard-Begrüßung
        const welcome = "Hallo, was kann ich für dich tun?";
        setMessages([{ role: "assistant", text: welcome }]);

        // optional auch in der DB speichern
        await addMessage({
          conversationId: conv.id,
          userId: user.id,
          role: "assistant",
          content: welcome,
        });
      }

      setLoadingConversation(false);
    };

    initConversation();
  }, [user, urlCity]);

  // -------------------------------------------
  // Wenn URL Stadt gesetzt → Text ins Input-Feld
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
  // Nachricht senden
  // -------------------------------------------
  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    if (!user) {
      alert("Bitte zuerst einloggen, um den Chat zu nutzen.");
      return;
    }
    if (!conversationId) {
      console.error("Kein conversationId gesetzt. Conversation konnte nicht geladen werden.");
      return;
    }

    // 1. User Nachricht direkt im UI anzeigen
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setBusy(true);

    // 2. User Nachricht in Supabase speichern
    addMessage({
      conversationId,
      userId: user.id,
      role: "user",
      content: text,
    }).catch((err) => console.error("addMessage user error", err));

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          city: urlCity || null,
          conversationId, // Backend kann das nutzen, ignoriert es sonst einfach
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.status === 202) {
        setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
        addMessage({
          conversationId,
          userId: user.id,
          role: "assistant",
          content: statusMsg,
        }).catch((err) => console.error("addMessage assistant 202 error", err));
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
        addMessage({
          conversationId,
          userId: user.id,
          role: "assistant",
          content: statusMsg,
        }).catch((err) =>
          console.error("addMessage assistant accepted error", err)
        );
        return;
      }

      const reply = extractReply(data, raw);

      setMessages((m) => [...m, { role: "assistant", text: reply }]);

      addMessage({
        conversationId,
        userId: user.id,
        role: "assistant",
        content: reply,
      }).catch((err) => console.error("addMessage assistant error", err));
    } catch (err) {
      console.error("sendMessage fetch error", err);
      setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
      addMessage({
        conversationId,
        userId: user.id,
        role: "assistant",
        content: statusMsg,
      }).catch((e2) => console.error("addMessage assistant catch error", e2));
    } finally {
      setBusy(false);
    }
  };

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
      <a href="/" className="cp-small cp-link">
        ← Zurück
      </a>

      <div
        className="rounded-2xl border mt-4"
        style={{
          borderColor: "var(--cp-line)",
          background: "#F7F8FA",
        }}
      >
        <div className="p-4 h-[60vh] overflow-y-auto">
          {loadingConversation ? (
            <div className="cp-small text-[var(--cp-muted)]">
              Lade bisherigen Chatverlauf…
            </div>
          ) : (
            messages.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.text}
              </Bubble>
            ))
          )}
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
            placeholder={
              user
                ? "Nachricht…"
                : "Bitte einloggen, um den Chat zu nutzen."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="cp-input flex-1"
            disabled={busy || loadingConversation || !user}
          />
          <button
            type="submit"
            disabled={busy || loadingConversation || !user}
            className="cp-btn"
          >
            {busy ? "Senden…" : "Senden"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
