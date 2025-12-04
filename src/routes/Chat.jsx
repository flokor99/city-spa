// src/routes/Chat.jsx
import { useState, useEffect } from "react";
import AppShell from "../components/AppShell.jsx";
import { useAuth } from "../AuthContext.jsx";
import {
  fetchConversations,
  createConversation,
  fetchMessages,
  addMessage,
  getOrCreateCityByName,
  deleteConversationAndMessages,
} from "../supabaseData";

export default function Chat() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hallo, was kann ich für dich tun?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  // Stadt aus URL (Name) und dazugehörige ID aus DB
  const [urlCity, setUrlCity] = useState(null); // z.B. "Köln"
  const [cityId, setCityId] = useState(null);   // UUID aus cities
  const [cityName, setCityName] = useState(null);

  // Quickstart-Flag aus URL (?quick=1)
  const [isQuickStart, setIsQuickStart] = useState(false);

  const [autoInserted, setAutoInserted] = useState(false);

  const [conversationId, setConversationId] = useState(null);
  const [loadingConversation, setLoadingConversation] = useState(true);

  // alle Conversations des Users für die Sidebar
  const [conversations, setConversations] = useState([]);

  // Eingabefeld in der Sidebar für neuen Stadt-Chat
  const [newCityInput, setNewCityInput] = useState("");

  const statusMsg =
    'Ihre Anfrage wird verarbeitet. Falls es sich um eine Analyse handelt, erscheint das fertige Dokument in Kürze unter "Dokumente". Bitte etwas Geduld.';

  const extractReply = (data, raw) =>
    data?.reply || data?.message || data?.text || raw || "…";

  // -------------------------------------------
  // Stadt + Quickstart aus URL lesen (?city=Köln&quick=1)
  // -------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("city");
    const q = params.get("quick");

    if (c) {
      setUrlCity(c);
      window.history.replaceState({}, "", "/chat");
    } else {
      setUrlCity(null);
    }

    setIsQuickStart(q === "1" || q === "true");
  }, []);

  // -------------------------------------------
  // Aus Stadtname → cityId (cities-Tabelle)
  // nutzt dein getOrCreateCityByName
  // -------------------------------------------
  useEffect(() => {
    const resolveCity = async () => {
      if (!urlCity) {
        setCityId(null);
        setCityName(null);
        return;
      }

      try {
        const { data, error } = await getOrCreateCityByName(urlCity);
        if (error) {
          console.error("getOrCreateCityByName error", error);
          return;
        }
        if (data) {
          setCityId(data.id);
          setCityName(data.name);
        }
      } catch (err) {
        console.error("resolveCity error", err);
      }
    };

    resolveCity();
  }, [urlCity]);

  // -------------------------------------------
  // Conversation + Nachrichten aus Supabase laden
  // genau eine Conversation pro (user, city_id)
  // und alle Conversations für die Sidebar
  // -------------------------------------------
  useEffect(() => {
    const initConversation = async () => {
      if (!user) {
        setLoadingConversation(false);
        setConversations([]);
        return;
      }

      // Wenn es eine Stadt aus der URL gibt, warten bis cityId da ist
      if (urlCity && !cityId) {
        return;
      }

      setLoadingConversation(true);
      setMessages([
        { role: "assistant", text: "Hallo, was kann ich für dich tun?" },
      ]);

      // 1. Conversation für (user, cityId) holen/anlegen
      const { data: convsForCity, error } = await fetchConversations(
        user.id,
        cityId || null
      );

      if (error) {
        console.error("fetchConversations (by city) error", error);
      }

      let conv = convsForCity && convsForCity.length > 0 ? convsForCity[0] : null;

      if (!conv) {
        const { data: newConv, error: createError } = await createConversation({
          userId: user.id,
          cityId: cityId || null,
          title: cityName || urlCity || "Chat",
        });

        if (createError) {
          console.error("createConversation error", createError);
          setLoadingConversation(false);
          return;
        }

        conv = newConv;
      }

      setConversationId(conv.id);

      // 2. Nachrichten zu dieser Conversation laden
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
        const welcome = "Hallo, was kann ich für dich tun?";
        setMessages([{ role: "assistant", text: welcome }]);

        await addMessage({
          conversationId: conv.id,
          userId: user.id,
          role: "assistant",
          content: welcome,
        });
      }

      // 3. Alle Conversations des Users für die Sidebar laden
      const { data: allConvs, error: allError } = await fetchConversations(
        user.id
      );
      if (allError) {
        console.error("fetchConversations (all) error", allError);
      } else if (allConvs) {
        setConversations(allConvs);
      }

      setLoadingConversation(false);
    };

    initConversation();
  }, [user, cityId, urlCity, cityName]);

  // -------------------------------------------
  // Quickstart-Autotext NUR wenn ?quick=1 gesetzt ist
  // -------------------------------------------
  useEffect(() => {
    if (!isQuickStart) return;
    if (!urlCity) return;
    if (autoInserted) return;

    setInput(
      `Bitte starte eine vollständige Analyse für ${urlCity}. Erzeuge anschließend den PDF-Output.`
    );

    setAutoInserted(true);
  }, [isQuickStart, urlCity, autoInserted]);

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
      console.error("Kein conversationId gesetzt.");
      return;
    }

    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setBusy(true);

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
          cityId: cityId || null,
          conversationId,
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
  // UI-Helfer: Bubble
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

  // -------------------------------------------
  // UI-Helfer: Label & Link für Conversations
  // -------------------------------------------
  const getConversationLabel = (conv) => {
    if (conv.title) return conv.title;
    if (conv.city_id) return "Stadt-Chat";
    return "Allgemein";
  };

  const getConversationHref = (conv) => {
    if (conv.city_id && conv.title) {
      return `/chat?city=${encodeURIComponent(conv.title)}`;
    }
    return "/chat";
  };

  // -------------------------------------------
  // Sidebar: neuen Stadt-Chat anlegen (nur Frontend)
  // -------------------------------------------
  const handleNewCityChat = (e) => {
    e.preventDefault();
    const c = newCityInput.trim();
    if (!c) return;
    // Navigation ohne quick=1 → kein Autotext
    window.location.href = `/chat?city=${encodeURIComponent(c)}`;
  };

  // -------------------------------------------
  // Sidebar: Chat löschen
  // -------------------------------------------
  const handleDeleteConversation = async (conv) => {
    if (!user) return;
    if (!window.confirm("Diesen Chat wirklich löschen?")) return;

    const { error } = await deleteConversationAndMessages(conv.id, user.id);
    if (error) {
      console.error("deleteConversationAndMessages error", error);
      alert("Chat konnte nicht gelöscht werden.");
      return;
    }

    // lokalen State updaten
    const remaining = conversations.filter((c) => c.id !== conv.id);
    setConversations(remaining);

    if (conv.id === conversationId) {
      // aktuellen Chat gelöscht → wohin navigieren?
      if (remaining.length > 0) {
        const target = remaining[0];
        window.location.href = getConversationHref(target);
      } else {
        window.location.href = "/chat";
      }
    }
  };

  return (
    <AppShell title="Chat">
      <a href="/" className="cp-small cp-link">
        ← Zurück
      </a>

      <div className="mt-4 flex gap-4">
        {/* Sidebar: Conversations-Auswahl */}
        <div
          className="w-72 rounded-2xl border p-3 cp-small flex flex-col gap-3"
          style={{
            borderColor: "var(--cp-line)",
            background: "var(--cp-bg)",
          }}
        >
          <div>
            <div className="font-semibold mb-2">Deine Chats</div>
            {user ? (
              conversations.length === 0 ? (
                <div className="text-[var(--cp-muted)]">
                  Es gibt noch keine Chats.
                </div>
              ) : (
                <ul className="space-y-1 max-h-60 overflow-y-auto pr-1">
                  {conversations.map((conv) => (
                    <li
                      key={conv.id}
                      className="flex items-center justify-between gap-1"
                    >
                      <a
                        href={getConversationHref(conv)}
                        className={`flex-1 px-2 py-1 rounded-md border text-[13px] ${
                          conv.id === conversationId
                            ? "bg-[rgba(0,174,239,0.08)] border-[var(--cp-line)]"
                            : "border-transparent hover:border-[var(--cp-line)]"
                        }`}
                      >
                        {getConversationLabel(conv)}
                      </a>
                      <button
                        type="button"
                        className="cp-small"
                        title="Chat löschen"
                        onClick={() => handleDeleteConversation(conv)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <div className="text-[var(--cp-muted)]">
                Bitte einloggen, um deine Chats zu sehen.
              </div>
            )}
          </div>

          {/* Neuer Stadt-Chat */}
          {user && (
            <form onSubmit={handleNewCityChat} className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Neue Stadt…"
                value={newCityInput}
                onChange={(e) => setNewCityInput(e.target.value)}
                className="cp-input flex-1"
              />
              <button type="submit" className="cp-btn cp-small">
                Neu
              </button>
            </form>
          )}
        </div>

        {/* Hauptbereich: Chat */}
        <div
          className="flex-1 rounded-2xl border"
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
      </div>
    </AppShell>
  );
}
