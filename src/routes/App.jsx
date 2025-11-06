import AppShell from "../components/AppShell.jsx";

export default function App() {
  const Card = ({ href, title, desc }) => (
    <a
      href={href}
      className="block rounded-2xl border border-[var(--cp-line)] p-6 shadow-sm hover:shadow-md bg-[var(--cp-bg)]"
    >
      <h2 className="text-xl font-semibold text-[var(--cp-primary)]">{title}</h2>
      <p className="text-sm text-[var(--cp-muted)] mt-1">{desc}</p>
    </a>
  );

  return (
    <AppShell title="City Profiler">
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-[var(--cp-primary)]">
          Willkommen
        </h1>
        <p className="text-sm text-[var(--cp-ink)] mb-4">
          Wähle einen Bereich aus, um fortzufahren:
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card href="/chat" title="Chat" desc="Fragen stellen – Oberfläche nur." />
          <Card href="/dokumente" title="Dokumente" desc="Liste + PDF-Viewer. Platzhalter." />
          <Card href="/wissen" title="Wissen" desc="Texte zu Szenarien." />
        </div>
      </main>
    </AppShell>
  );
}
