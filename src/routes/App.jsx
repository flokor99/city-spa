import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";

export default function App() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");

  const startAnalysis = (e) => {
    e.preventDefault();
    const c = city.trim();
    if (!c) return;
    navigate(`/chat?city=${encodeURIComponent(c)}`);
  };

  const Card = ({ href, title, desc, img }) => (
    <a
      href={href}
      className="cp-card block p-5 hover:shadow-md transition flex flex-col justify-between h-full"
    >
      <div>
        <h2 className="text-xl font-semibold text-[var(--cp-primary)] mb-1x">
          {title}
        </h2>
        <p className="text-sm text-[var(--cp-muted)] mb-3x">{desc}</p>
      </div>
      {img && (
        <div
          className="rounded-lg overflow-hidden border mt-auto"
          style={{
            borderColor: "var(--cp-line)",
            background: "#F7F8FA",
            height: "144px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={img}
            alt={`${title} Vorschau`}
            className="object-contain w-full h-full"
          />
        </div>
      )}
    </a>
  );

  return (
    <AppShell>
      <main className="max-w-5xl mx-auto p-6 space-y-10">
        {/* Oberer Bereich: Text links, Schnellstart rechts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Textblock (2 Spalten breit) */}
          <div className="md:col-span-2">
            <h1 className="cp-h1 mb-2x">Willkommen</h1>
            <p className="cp-body">
              Der <strong>Ströer City Profiler</strong> ordnet Städte anhand von vier
              Zukunftsszenarien ein, welche im Rahmen der Foresight Academy entstanden sind.
              Er vergleicht die aktuelle Position und Entwicklung einer Stadt mit
              der kommunizierten Zielrichtung – und macht daraus konkreten
              Handlungsbedarf sichtbar. Zudem liefert er Ideen und bewertet deren
              Wirkung zur Zielerreichung.{" "}
            
                So unterstützt er die Kommunikation mit der Stadt und trägt dazu bei,
                Ströer als strategischen Partner zu positionieren.
      
            </p>
          </div>

{/* Schnellstart-Kachel (kompakt, feste Eigenhöhe) */}
<form
  onSubmit={startAnalysis}
  className="cp-card p-5 flex flex-col gap-3"
  style={{
    alignSelf: "flex-start",
    width: "100%",
    maxWidth: "360px",   // gleiche Breite wie Wissen-Kachel
  }}
>
  <div
    className="cp-small"
    style={{
      color: "var(--cp-muted)",
      fontWeight: 600,
      marginBottom: "4px",
    }}
  >
    Schnellstart · Stadtanalyse
  </div>

  <div className="flex gap-2">
    <input
      className="cp-input flex-1"
      placeholder="Stadt eingeben…"
      value={city}
      onChange={(e) => setCity(e.target.value)}
    />
    <button className="cp-btn" type="submit">
      Start
    </button>
  </div>
</form>

        </div>

        {/* Drei Hauptkacheln */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card
            href="/chat"
            title="Chat"
            desc="Starte die Analyse für eine gewünschte Stadt und lass den Profiler den Output generieren. Der Agent steht anschließend für Rückfragen zur Verfügung."
            img="/assets/preview-chat.png"
          />
          <Card
            href="/dokumente"
            title="Dokumente"
            desc="Hier findest du deine zuvor erstellten Dokumente und Outputs – inklusive Analysen, Stadtprofile und Handlungsempfehlungen."
            img="/assets/preview-dokumente.png"
          />
          <Card
            href="/wissen"
            title="Wissen"
            desc="Alles zum Hintergrund der Städteszenarien, zur Methodik und den verwendeten Quellen."
            img="/assets/preview-wissen.png"
          />
        </div>
      </main>
    </AppShell>
  );
}
