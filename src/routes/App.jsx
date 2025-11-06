import AppShell from "../components/AppShell.jsx";

export default function App() {
  const Card = ({ href, title, desc }) => (
    <a
      href={href}
      className="block rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow bg-[var(--cp-bg)]"
      style={{ borderColor: "var(--cp-line)" }}
    >
      <h2 className="text-xl font-semibold text-[var(--cp-primary)]">{title}</h2>
      <p className="text-sm text-[var(--cp-muted)] mt-1">{desc}</p>
    </a>
  );

  return (
    <AppShell title="City Profiler">
      {/* Hero / Einleitung */}
      <section
        className="rounded-2xl border mb-8"
        style={{ borderColor: "var(--cp-line)", background: "var(--cp-bg)" }}
      >
        <div className="px-6 py-7">
         <h1 className="cp-h1 mb-2x">Willkommen</h1>
<p className="cp-body mb-4x">Wähle einen Bereich aus, um fortzufahren:</p>

          <div
            className="mt-4"
            style={{ height: 2, background: "var(--cp-line)", width: 72 }}
          />
        </div>

        {/* Optionales Screenshot-Element (rechts) */}
        <div className="px-6 pb-6">
          <div className="grid md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2">
              {/* Leer – hier bleibt nur der Textbereich aus dem Block oben */}
            </div>

            {/* Bild-Panel: Leichtes „Report“-Feeling */}
            <figure className="block rounded-xl overflow-hidden border"
              style={{ borderColor: "var(--cp-line)", background: "#F7F8FA" }}
            >
              {/* Lege eine Vorschau deines PDF-Outputs unter /public/assets/output-thumb.jpg ab */}
              <img
                src="/assets/output-thumb.jpg"
                alt="City Profiler Output (Vorschau)"
                className="w-full h-40 object-cover opacity-90"
                onError={(e)=>{ e.currentTarget.style.display='none'; }}
              />
              <figcaption className="px-3 py-2 text-xs text-[var(--cp-muted)]">
                Beispielhafter Output-Ausschnitt (Szenarien/KPIs)
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Drei Funktions-Kacheln */}
      <section className="max-w-5xl">
        <div className="grid sm:grid-cols-3 gap-4">
          <Card href="/chat" title="Chat" desc="Fragen stellen – Oberfläche nur." />
          <Card href="/dokumente" title="Dokumente" desc="Liste + PDF-Viewer. Platzhalter." />
          <Card href="/wissen" title="Wissen" desc="Texte zu Szenarien." />
        </div>
      </section>
    </AppShell>
  );
}
