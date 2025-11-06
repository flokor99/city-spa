import AppShell from "../components/AppShell.jsx";

export default function Wissen() {
  const sections = [
    {
      title: "Was sind die Szenarien?",
      text: "Die vier Szenarien beschreiben mögliche Entwicklungsrichtungen deutscher Städte bis 2035 – von digital-partizipativ bis unternehmensdominiert. Sie dienen der Einordnung und zeigen Handlungsspielräume auf."
    },
    {
      title: "Methodik",
      text: "Die Szenarien basieren auf einer Kombination aus qualitativer Forschung, Expert*innen-Workshops und einer quantitativen Bewertung von Zukunftsindikatoren. Ziel ist nicht Prognose, sondern Orientierung."
    },
    {
      title: "Kriterien",
      text: "Zu den bewerteten Kriterien zählen Bürgerbeteiligung, Mobilität, KI-Einsatz, Nachhaltigkeit, Transparenz und soziale Gleichheit. Jedes Szenario gewichtet diese Faktoren unterschiedlich."
    }
  ];

  return (
    <AppShell title="Wissen">
      {/* Zurück */}
      <a href="/" className="text-sm" style={{ color: "var(--cp-muted)" }}>
        ← Zurück
      </a>

      {/* Intro */}
      <section className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-[var(--cp-primary)] mb-2">
          Wissen
        </h1>
        <p className="text-[15px] leading-relaxed text-[var(--cp-ink)]">
          Kurztexte zu Szenarien, Kriterien und Methodik – gestaltet im Stil
          des City-Profiler-Reports.
        </p>
      </section>

      {/* Artikelabschnitte */}
      <section className="space-y-6">
        {sections.map((s, i) => (
          <article
            key={i}
            className="rounded-2xl border p-6"
            style={{ borderColor: "var(--cp-line)", background: "var(--cp-bg)" }}
          >
            <h2 className="text-lg font-semibold text-[var(--cp-primary)] mb-2">
              {s.title}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--cp-ink)]">
              {s.text}
            </p>
          </article>
        ))}
      </section>

      {/* Quellenbox */}
      <section
        className="mt-10 rounded-xl border px-4 py-3 text-xs"
        style={{ borderColor: "var(--cp-line)", background: "#F7F8FA", color: "var(--cp-muted)" }}
      >
        <strong style={{ color: "var(--cp-primary)" }}>Quelle:</strong>{" "}
        City Profiler Report 2025 · Ströer Corporate Strategy & Innovation
      </section>
    </AppShell>
  );
}
