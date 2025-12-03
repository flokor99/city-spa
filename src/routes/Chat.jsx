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
  getOrCreateCityByName,
} from "../supabaseData";

export default function Chat() {
  const { user } = useAuth();

  // UI / Chat State
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hallo, was kann ich für dich tun?" },
  ]);

  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [conversationId, setConversationId] = useState(null);

  const [loadingConversation, setLoadingConversation] = useState(true);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  // Schnellstart city aus ?city=
  const [urlCity, setUrlCity] = useState(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  // --------------------------------------------
  // Hilfsfunktionen
  // --------------------------------------------
  const getSelectedCityName = () => {
    const c = cities.find((x) => x.id === selectedCity);
    return c ? c.name : null;
  };

  const statusMsg =
    'Ihre Analyse wird erstellt und erscheint in Kürze unter dem Menüpunkt "Dokumente". Bitte haben Sie etwas Geduld.';

  const extractReply = (d, raw) =>
    d?.reply ||
    d?.message ||
    d?.text ||
    raw ||
    "…";

  // --------------------------------------------
  // Nachricht senden
  // --------------------------------------------
  const sendText = async (text) => {
    const t = text.trim();
    if (!t || busy) return;

    // direkt in der UI anzeigen
    setMessages((m) => [...m, { role: "user", text: t }]);
    setBusy(true);

    // in DB speichern
    if (conversationId && user) {
      await addMessage({
        conversationId,
        userId: user.id,
        role: "user",
        content: t,
      });
    }

    try {
      // Timeout für lange Antworten
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);

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

      clearTimeout(timer);

      // Analyse wurde angenommen, Backend läuft weiter
      if (r.status === 202) {
        setMessages((m) => [...m, { role: "assistant", text: statusMsg }]);
        return;
      }

      // normale Antwort
      const raw = await r.text();
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

      const replyText = extractReply(data, raw);
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
      // Falls das Backend wirklich abstürzt
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

  // --------------------------------------------
  // Schnellstart: ?city= auslesen
  // --------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("city");
    if (c) {
      setUrlCity(c);
      window.history.replaceState({}, "", "/chat");
    }
  }, []);

  // --------------------------------------------
  // Städte laden + Schnellstart-Stadt anlegen
  // --------------------------------------------
  useEffect(() => {
    async function loadCities() {
      const { data, error } = await fetchCities();
      if (error || !data) return;

      let list = data;
      let initialCityId = null;

      if (urlCity) {
        const match = list.find(
          (c) => c.name.toLowerCase() === urlCity.toLowerCase()
        );

        if (match) {
          initialCityId = match.id;
        } else {
          // anlegen
          const { data: newCity } = await getOrCreateCityByName(urlCity);
          if (newCity) {
            if (!list.some((c) => c.id === newCity.id)) {
              list = [...list, newCity];
            }
            initialCityId = newCity.id;
          }
        }
      } else {
        if (list.length > 0) initialCityId = list[0].id;
      }

      setCities(list);
      if (initialCityId) setSelectedCity(initialCityId);
    }

    loadCities();
  }, [urlCity]);

  // --------------------------------------------
  // Conversation für Stadt laden oder erstellen
  // --------------------------------------------
  useEffect(() => {
    if (!user || !selectedCity || cities.length === 0) return;

    async function loadConv() {
      setLoadingConversation(true);

      const { data: convos } = await fetchConversations(
        user.id,
        selectedCity
      );

      if (convos && convos.length > 0) {
        const convo = convos[0];
        setConversationId(convo.id);

        const { data: msgs } = await fetchMessages(convo.id);
        if (msgs) {
          setMessages(
            msgs.map((m) => ({
              role: m.role,
              text: m.content,
            }))
          );
        }
      } else {
        const city = cities.find((c) => c.id === selectedCity);
        const title = city ? city.name : null;

        const { data: convo } = await createConversation({
          userId: user.id,
          cityId: selectedCity,
          title,
        });

        if (convo) {
          setConversationId(convo.id);
          setMessages([
            { role: "assistant", text: "Hallo, was kann ich für dich tun?" },
          ]);
        }
      }

      setLoadingConversation(false);
    }

    loadConv();
  }, [user, selectedCity, cities]);

  // --------------------------------------------
  // Schnellstart: automatische Nachricht setzen
  // --------------------------------------------
  useEffect(() => {
    if (!urlCity) return;
    if (!conversationId) return;
    if (hasAutoStarted) return;

    setHasAutoStarted(true);
    setInput(
      `Bitte starte eine vollständige Analyse für ${urlCity}. Erzeuge anschließend den PDF-Output.`
    );
  }, [urlCity, conversationId, hasAutoStarted]);

  // --------------------------------------------
  // Dropdown Logik inkl. „+ Neue Stadt…“
  // --------------------------------------------
  const handleCityChange = async (e) => {
    const value = e.target.value;

    if (value === "__new__") {
      const name = window.prompt(
        "Für welche Stadt soll ein neuer Chat angelegt werden?"
      );
      if (!name || !name.trim()) return;

      const { data: city } = await getOrCreateCityByName(name.trim());
      if (city) {
        setCities((prev) =>
          prev.some((c) => c.id === city.id) ? prev : [...prev, city]
        );
        setSelectedCity(city.id);
      }
      return;
    }

    setSelectedCity(value);
  };

  // --------------------------------------------
  // UI Bubble
  // --------------------------------------------
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

  // --------------------------------------------
  // Laden-UI
  // --------------------------------------------
  if (loadingConversation) {
    return (
      <AppShell title="Chat">
        <a href="/" className="cp-small cp-link">← Zurück</a>
        <div style={{ padding: "2rem" }}>Conversation wird geladen…</div>
      </AppShell>
    );
  }

  // --------------------------------------------
  // HAUPT-UI
  // --------------------------------------------
  return (
    <AppShell title="Chat">
      <a href="/" className="cp-small cp-link">← Zurück</a>

      {/* Dropdown */}
      <div className="mt-4 mb-4">
        <label className="cp-small">Stadt auswählen:</label>
        <select
          value={selectedCity}
          onChange={handleCityChange}
          className="cp-input"
          style={{ maxWidth: 250 }}
        >
          {cities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
          <option value="__new__">+ Neue Stadt…</option>
        </select>
      </div>

      {/* Chatfenster */}
      <div
        className="rounded-2xl border"
        style={{ borderColor: "var(--cp-line)", background: "#F7F8FA" }}
      >
        <div className="p-4 h-[56vh] overflow-y-auto">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role}>{m.text}</Bubble>
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
