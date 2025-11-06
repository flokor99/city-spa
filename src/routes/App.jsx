import AppShell from "../components/AppShell.jsx";

export default function App() {
  const Card = ({ href, title, desc }) => (
    <a href={href} className="cp-card block p-6">
      <h2 className="text-xl font-semibold text-[var(--cp-primary)]">{title}</h2>
      <p className="text-sm text-[var(--cp-muted)] mt-1">{desc}</p>
    </a>
  );

  return (
    <AppShell title="City Profiler">
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Titel */}
        <h1 className="cp-h1 mb-2x">Willkommen</h1>

        {/* Einleitungstext */}
        <p className="cp-body mb-5x">
          Der <strong>Ströer City Profiler</strong> ordnet Städte anhand von vier
          Zukunftsszenarien ein, die in der Foresight Academy entstanden sind. Er
          vergleicht die aktuelle Position und Entwicklung einer Stadt mit der
          kommunizierten Zielrichtung – und macht daraus konkreten Handlungsbedarf
          sichtbar. Zudem liefert er Ideen und bewertet deren Wirkung zur
          Zielerreichung. So unterstützt er die Kommunikation mit der Stadt
          und trägt dazu bei, Ströer als strategischen Partner zu positionieren.
        </p>

        {/* Kacheln */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card
            href="/chat"
            title="Chat"
            desc="Stelle Fragen oder interagiere direkt mit dem City Profiler."
          />
          <Card
            href="/dokumente"
            title="Dokumente"
            desc="Greife auf generierte PDF-Analysen und Stadtberichte zu."
          />
          <Card
            href="/wissen"
            title="Wissen"
            desc="Erhalte Hintergrundwissen zu Szenarien, Kriterien und Methodik."
          />
        </div>
      </main>
    </AppShell>
  );
}

