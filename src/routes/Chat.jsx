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

  // Schnellstart: wenn /chat?city=Name aufgerufen wird
  // merken wir uns Name + CityId
  const [pendingCityName, setPendingCityName] = useState(null);
  const [pendingCityId, setPendingCityId] = useState(null);

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
   *  - nutzt optional overrideCityName (für korrekten City-Namen beim Schnellstart)
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
      console.warn("Keine conversationId gesetzt, breche sendText ab");
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
   * - wenn ?city=Name in der URL: passende Stadt suchen
   *   -> selectedCity + pendingCityName + pendingCityId setzen
   */
  useEffect(() => {
    async function loadCities() {
      const { data, error } = await fetchCities();
      if (!error && data) {
        setCities(data);

        let initialCityId = null;
        let pName = null;
        let pId = null;

        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const cityParam = params.get("city");
          if (cityParam) {
            const match = data.find(
              (c) =>
                c.name &&
                c.name.toLowerCase() === cityParam.toLowerCase()
            );
            if (match) {
              initialCityId = match.id;
              pName = match.name;
              pId = match.id;
            }
          }
        }

        if (!initialCityId && data.length > 0) {
          initialCityId = data[0].id;
        }

        if (initialCityId) {
          setSelectedCity(initialCityId);
        }
        if (pName && pId) {
          setPendingCityName(pName);
          setPendingCityId(pId);
        }
      }
    }
    loadCities();
  }, []);

  /**
   * Normalfall: Conversation pro User + Stadt laden oder anlegen
   * Wichtig: wenn pendingCityId == selectedCity (Schnellstart),
   *          dann NICHT hier laden, sondern der Schnellstart-Effect übernimmt.
   */
  useEffect(() => {
    if (!user || !selectedCity) return;
    if (pendingCityId && pendingCityId === selectedCity) return;

    let cancelled = false;

    async function loadOrCreateConversation() {
      setLoadingConversation(true);

      try {
        const { data: convos, error: convError } = await fetchConversations(
          user.id,
          selectedCity
        );

        if (cancelled) return;

        if (!convError && convos && convos.length > 0) {
          const convo = convos[0];
          setConversationId(convo.id);

          const { data: msgs, error: msgError } = await fetchMessages(
            convo.id
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
            setConversationId(convo.id);
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

    loadOrCreateConversation();

    return () => {
      cancelled = true;
    };
  }, [user, selectedCity, pendingCityId]);

  /**
   * Schnellstart-Flow:
   * - wenn pendingCityId gesetzt ist, wird IMMER eine neue Conversation angelegt
   * - Auto-Nachricht geht in diese neue Conversation
   */
  useEffect(() => {
    if (!user) return;
    if (!pendingCityId || !pendingCityName) return;

    let cancelled = false;

    async function runQuickstart() {
      setLoadingConversation(true);

      try {
        const { data: convo, error: createError } = await createConversation({
          userId: user.id,
          cityId: pendingCityId,
          title: pendingCityName,
        });

        if (cancelled) return;

        if (!createError && convo) {
          const newConvId = convo.id;

          // neuen Kontext setzen
          setConversationId(newConvId);
          setSelectedCity(pendingCityId);
          setMessages([
            {
              role: "assistant",
              text: "Hallo, was kann ich für dich tun?",
            },
          ]);

          // Auto-Nachricht in genau diese neue Conversation
          await sendText(
            `Bitte starte eine vollständige Analyse für ${pendingCityName}. Erzeuge anschließend den PDF-Output.`,
            newConvId,
            pendingCityName
          );

          // ?city aus der URL entfernen
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.delete("city");
            window.history.replaceState(
              {},
              "",
              url.pathname + url.search
            );
          }
        }
      } finally {
        if (!cancelled) {
          setPendingCityId(null);
          setPendingCityName(null);
          setLoadingConversation(false);
        }
      }
    }

    runQuickstart();

    return () => {
      cancelled = true;
    };
  }, [user, pendingCityId, pendingCityName]);

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
