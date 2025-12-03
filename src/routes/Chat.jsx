// src/routes/Chat.jsx
import { useState, useEffect } from "react";
import AppShell from "../components/AppShell.jsx";
import { useAuth } from "../AuthContext.jsx";
import {
  fetchCities,
  fetchConversations,
  createConversation,
  fetchMessages,
  addMessage,
  getOrCreateCityByName, // neu
} from "../supabaseData";

export default function Chat() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hallo, was kann ich für dich tun?" },
  ]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(""); // city_id
  const [conversationId, setConversationId] = useState(null);
  const [loadingConversation, setLoadingConversation] = useState(true);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const [urlCity, setUrlCity] = useState(null); // Stadt aus ?city=
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  const getSelectedCityName = () => {
    const cityObj = cities.find((c) => c.id === selectedCity);
    return cityObj ? cityObj.name : null;
  };

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

    // Timeout. wenn keine „normale“ Antwort kommt, zeigen wir nach 25s den Status
    const statusTimeoutId = setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
    }, 25000);

    try {
      if (conversationId && user) {
        await addMessage({
          conversationId,
          userId: user.id,
          role: "user",
          content: t,
        });
      }

      const controller = new AbortController();
      const abortTimer = setTimeout(() => controller.abort(), 30000);

      const cityName = getSelectedCityName();

      const payload = { message: t };
      if (user?.email) payload.userEmail = user.email;
      if (cityName) payload.city = cityName;
      if (conversationId) payload.conversationId = conversationId;

      const r = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(abortTimer);

      if (!r.ok) {
        console.error("Chat Funktion Fehlerstatus:", r.status);
        // Kein sofortiger Status. Timeout übernimmt es
        return;
      }

      const d = await r.json();

      const isAccepted =
        r.status === 202 ||
        d?.accepted === true ||
        d?.status === "Accepted" ||
        (typeof d?.reply === "string" &&
          d.reply.toLowerCase() === "accepted");

      if (isAccepted) {
        // Analyse wurde angenommen. wir lassen den Timeout laufen
        return;
      }

      // Normale Antwort. Status Timeout abbrechen
      clearTimeout(statusTimeoutId);

      const replyText = getReplyText(d);
      setMessages((m) => [...m, { role: "assistant", text: replyText }]);

      if (conversationId && user) {
        await addMessage({
          conversationId,
          userId: user.id,
          role: "assistant",
          content: replyText,
        });
      }
    } catch (err) {
      console.error("Fehler im sendText:", err);
      // Timeout zeigt Status an
    } finally {
      // Falls schon eine Antwort kam, ist der Timeout bereits gecleart
      // Falls nicht, soll er weiterlaufen
      setBusy(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    sendText(input);
    setInput("");
  };

  // Stadt aus URL lesen
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    if (city) {
      setUrlCity(city);
      window.history.replaceState({}, "", "/chat");
    }
  }, []);

  // Städte laden + Schnellstart-Stadt anlegen/auswählen
  useEffect(() => {
    async function loadCities() {
      const { data, error } = await fetchCities();
      if (error) {
        console.error("Fehler beim Laden der Städte:", error);
        return;
      }

      let list = data || [];
      let initialCityId = null;

      if (urlCity) {
        const lower = urlCity.toLowerCase();
        const match = list.find((c) => c.name.toLowerCase() === lower);

        if (match) {
          initialCityId = match.id;
        } else {
          // noch nicht vorhanden. in Supabase anlegen
          const { data: newCity, error: cityErr } = await getOrCreateCityByName(
            urlCity
          );
          if (!cityErr && newCity) {
            const exists = list.some((c) => c.id === newCity.id);
            if (!exists) list = [...list, newCity];
            initialCityId = newCity.id;
          }
        }
      } else if (list.length > 0) {
        initialCityId = list[0].id;
      }

      setCities(list);
      if (initialCityId) {
        setSelectedCity(initialCityId);
      }
    }

    loadCities();
  }, [urlCity]);

  // Conversation laden/erstellen
  useEffect(() => {
    if (!user || !selectedCity || cities.length === 0) return;

    async function loadOrCreateConversation() {
      setLoadingConversation(true);

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
        const cityObj = cities.find((c) => c.id === selectedCity);
        const cityNameForTitle = cityObj ? cityObj.name : null;

        const { data: convo, error: createError } = await createConversation({
          userId: user.id,
          cityId: selectedCity,
          title: cityNameForTitle,
        });

        if (!createError && convo) {
          setConversationId(convo.id);
          setMessages([
            { role: "assistant", text: "Hallo, was kann ich für dich tun?" },
          ]);
        }
      }

      setLoadingConversation(false);
    }

    loadOrCreateConversation();
  }, [user, selectedCity, cities]);

  // Schnellstart. sobald Conversation bereit ist, Text NUR ins Eingabefeld schreiben
  useEffect(() => {
    if (!urlCity) return;
    if (!conversationId) return;
    if (hasAutoStarted) return;

    setHasAutoStarted(true);
    setInput(
      `Bitte starte eine vollständige Analyse für ${urlCity}. Erzeuge anschließend den PDF-Output.`
    );
  }, [urlCity, conversationId, hasAutoStarted]);

  // Wechsel im Dropdown inkl. „+ Neue Stadt…“
  const handleCityChange = async (e) => {
    const value = e.target.value;

    if (value === "__new__") {
      const name = window.prompt(
        "Für welche Stadt soll ein neuer Chat angelegt werden?"
      );
      if (!name || !name.trim()) return;

      const trimmed = name.trim();

      const { data: city, error } = await getOrCreateCityByName(trimmed);
      if (error || !city) {
        alert("Die Stadt konnte nicht angelegt werden.");
        return;
      }

      setCities((prev) => {
        const exists = prev.some((c) => c.id === city.id);
        return exists ? prev : [...prev, city];
      });

      setSelectedCity(city.id);
      return;
    }

    setSelectedCity(value);
  };

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
          <div className="cp-small mb-1x" style={{ color: "var(--cp-muted)" }}>
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
          onChange={handleCityChange}
          className="cp-input"
          style={{ maxWidth: 250 }}
        >
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="__new__">+ Neue Stadt…</option>
        </select>
      </div>

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
