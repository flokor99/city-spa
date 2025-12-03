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

  // Schnellstart-Infos aus der URL
  const [quickstartCityName, setQuickstartCityName] = useState(null);
  const [quickstartCityId, setQuickstartCityId] = useState(null);
  const [forceNewConversation, setForceNewConversation] = useState(false);

  const statusMsg =
    'Ihre Analyse wird erstellt und erscheint in Kürze unter dem Menüpunkt "Dokumente". Dieser Vorgang kann einige Minuten dauern. Bitte haben Sie Geduld.';

  // Namen der aktuell gewählten Stadt finden
  const getSelectedCityName = () => {
    const cityObj = cities.find((c) => c.id === selectedCity);
    return cityObj ? cityObj.name : null;
  };

  const getReplyText = (d) =>
    (typeof d?.reply === "string" && d.reply) ||
    d?.reply?.message ||
    d?.reply?.text ||
    d?.message ||
    d?.text ||
    "…";

  /**
   * sendText
   *  - nutzt optional overrideConversationId (für frisch angelegte Conversations)
   *  - nutzt optional overrideCityName (korrekter City-Name beim Schnellstart)
   */
  const sendText = async (
    text,
    overrideConversationId = null,
    overrideCityName = null
  ) => {
    const t = text.trim();
    if (!t || busy) return;

    const convId = overrideConversationId || conversationId;
    if (!convId) {
      console.warn("Kein conversationId gesetzt, breche sendText ab");
      return;
    }

    // lokale Anzeige der User Nachricht
    setMessages((m) => [...m, { role: "user", text: t }]);
    setBusy(true);

    // User-Nachricht in DB speichern
    if (user) {
      await addMessage({
        conversationId: convId,
        userId: user.id,
        role: "user",
        content: t,
      });
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);

      const cityName = overrideCityName || getSelectedCityName();

      // Payload für Netlify Function
      const payload = {
        message: t,
        conversationId: convId,
      };

      if (user?.email) {
        payload.userEmail = user.email;
      }
      if (cityName) {
        payload.city = cityName;
      }

      const r = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
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
        (typeof d?.reply === "string" &&
          d.reply.toLowerCase() === "accepted")
      ) {
        setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
        return;
      }

      const replyText = getReplyText(d);
      setMessages((m) => [...m, { role: "assistant", text: replyText }]);

      // Antwort in DB speichern
      if (user) {
        await addMessage({
          conversationId: convId,
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

  /**
   * Städte laden
   * - wenn ?city=Name&new=1 in der URL: passende Stadt suchen
   *   -> selectedCity setzen
   *   -> quickstartCityName + quickstartCityId + forceNewConversation setzen
   */
  useEffect(() => {
    async function loadCities() {
      const { data, error } = await fetchCities();
      if (!error && data) {
        setCities(data);

        let initialCityId = null;

        let qsName = null;
        let qsId = null;
        let qsForceNew = false;

        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const cityParam = params.get("city");
          const newParam = params.get("new");

          if (cityParam) {
            const match = data.find(
              (c) =>
                c.name &&
                c.name.toLowerCase() === cityParam.toLowerCase()
            );
            if (match) {
              initialCityId = match.id;
              qsName = match.name;
              qsId = match.id;
              if (newParam === "1") {
                qsForceNew = true;
              }
            }
          }
        }

        if (!initialCityId && data.length > 0) {
          initialCityId = data[0].id;
        }

        if (initialCityId) {
          setSelectedCity(initialCityId);
        }

        if (qsName && qsId && qsForceNew) {
          setQuickstartCityName(qsName);
          setQuickstartCityId(qsId);
          setForceNewConversation(true);
        }
      }
    }
    loadCities();
  }, []);

  /**
   * Conversation laden:
   * - FALL A (Schnellstart): forceNewConversation = true
   *     -> immer neue Conversation für quickstartCityId anlegen
   * - FALL B (normal): Conversation für user + selectedCity laden oder erstellen
   */
  useEffect(() => {
    if (!user || !selectedCity) return;

    let cancelled = false;

    async function loadConversation() {
      setLoadingConversation(true);

      try {
        // FALL A: Schnellstart → forcierte neue Conversation
        if (forceNewConversation && quickstartCityId && quickstartCityName) {
          const { data: convo, error: createError } = await createConversation({
            userId: user.id,
            cityId: quickstartCityId,
            title: quickstartCityName,
          });

          if (cancelled) return;

          if (!createError && convo) {
            const newConvId = Array.isArray(convo) ? convo[0].id : convo.id;

            // neuen Kontext setzen
            setConversationId(newConvId);
            setSelectedCity(quickstartCityId);
            setMessages([
              {
                role: "assistant",
                text: "Hallo, was kann ich für dich tun?",
              },
            ]);

            // Auto-Nachricht in genau diese neue Conversation
            await sendText(
              `Bitte starte eine vollständige Analyse für ${quickstartCityName}. Erzeuge anschließend den PDF-Output.`,
              newConvId,
              quickstartCityName
            );

            // ?city & new aus der URL entfernen
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.delete("city");
              url.searchParams.delete("new");
              window.history.replaceState(
                {},
                "",
                url.pathname + url.search
              );
            }
          }

          // Schnellstart-Flag zurücksetzen
          if (!cancelled) {
            setForceNewConversation(false);
            setQuickstartCityId(null);
            setQuickstartCityName(null);
          }

          return;
        }

        // FALL B: normaler Modus → Conversation für User + Stadt
        const { data: convos, error: convError } = await fetchConversations(
          user.id,
          selectedCity
        );

        if (cancelled) return;

        if (!convError && convos && convos.length > 0) {
          const convo = convos[0];
          const convId = convo.id;
          setConversationId(convId);

          const { data: msgs, error: msgError } = await fetchMessages(
            convId
          );
          if (!msgError && msgs) {
            setMessages(
              msgs.map((m) => ({
                role: m.role,
                text: m.content,
              }))
            );
          }
        } else {
          const { data: convo, error: createError } = await createConversation({
            userId: user.id,
            cityId: selectedCity,
            title: null,
          });

          if (!createError && convo) {
            const newConvId = Array.isArray(convo) ? convo[0].id : convo.id;
            setConversationId(newConvId);
            setMessages([
              {
                role: "assistant",
                text: "Hallo, was kann ich für dich tun?",
              },
            ]);
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingConversation(false);
        }
      }
    }

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [user, selectedCity, forceNewConversation, quickstartCityId, quickstartCityName]);

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

  const handleCityChange = (e) => {
    const newCityId = e.target.value;
    setSelectedCity(newCityId);
    setConversationId(null);
    setMessages([
      { role: "assistant", text: "Hallo, was kann ich für dich tun?" },
    ]);
  };

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
          onChange={handleCityChange}
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
        style={{
          borderColor: "var(--cp-line)",
          background: "#F7F8FA",
        }}
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
