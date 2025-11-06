import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";

export default function App() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");

  const Card = ({ href, title, desc, img, children }) => (
    <a href={href} className="cp-card block p-5 hover:shadow-md transition flex flex-col justify-between h-full">
      <div>
        <h2 className="text-xl font-semibold text-[var(--cp-primary)] mb-1x">{title}</h2>
        <p className="text-sm text-[var(--cp-muted)] mb-3x">{desc}</p>
      </div>

      {/* Vorschau-Bild */}
      {img && (
        <div className="rounded-lg overflow-hidden border mt-auto"
             style={{ borderColor: "var(--cp-line)", background: "#F7F8FA", height: "144px",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={img} alt={`${title} Vorschau`} className="object-contain w-full h-full" />
        </div>
      )}

      {/* Optionaler Footer-Bereich (z. B. Formular) */}
      {children}
    </a>
  );

  const startAnalysis = (e) => {
    e.preventDefault();
    const c = city.trim();
    if (!c) return;
    navigate(`/chat?city=${encodeURIComponent(c)}`);
  };

  return (
    <AppShell title="City Profiler">
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="cp-h1 mb-2x">Willkommen</h1>
        <p className="cp-body mb-5x">
          Der <strong>Ströer City Profiler</strong> ordnet Städte anhand von vier Zukunftsszenarien ein, die in der Foresight Academy entstanden sind.
          Er vergleicht die aktuelle Position und Entwicklung einer Stadt mit der kommunizierten Zielrichtung – und macht daraus konkreten
          Handlungsbedarf sichtbar. Zudem liefert er Ideen und bewertet deren Wirkung zur Zielerreichung. <strong>So unterstützt er die Kommunikation
          mit der Stadt und trägt dazu bei, Ströer als strategischen Partner zu positionieren.</strong>
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          {/* Chat-Kachel mit Schnellstart */}
          <Card
            href="/chat"
            title="Chat"
            desc="Starte die Analyse für eine gewünschte Stadt und lass den Profiler den Output generieren. Der Agent steht anschließend für Rückfragen zur Verfügung."
            img="/assets/preview-chat.png"
          >
            <form onSubmit={startAnalysis} className="mt-3x flex gap-2">
              <input
                className="cp-input"
                placeholder="Stadt eingeben…"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <button className="cp-btn" type="submit">Analyse starten</button>
            </form>
          </Card>

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
