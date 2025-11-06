// src/routes/Wissen.jsx
import AppShell from "../components/AppShell.jsx";

export default function Wissen() {
  const sections = [
    {
      title: "Was sind die Szenarien?",
      text:
        "Die vier Szenarien beschreiben mögliche Entwicklungsrichtungen deutscher Städte bis 2035 – von digital-partizipativ bis unternehmensdominiert. Sie dienen der Einordnung, zeigen Optionen und machen Zielbilder vergleichbar."
    },
    {
      title: "Methodik",
      text:
        "Die Ableitung kombiniert Desk Research, Expert*innen-Workshops und eine quantitative Bewertung relevanter Indikatoren. Ziel ist keine exakte Prognose, sondern robuste Orientierung und Vergleichbarkeit."
    },
    {
      title: "Kriterien",
      text:
        "Bewertet werden u. a. Bürgerbeteiligung, Bürgerzentrierung, Mobilität, KI-Einsatz, Transparenz, Nachhaltigkeit sowie soziale Gleichheit. Je Szenario sind Gewichtungen und Ausprägungen unterschiedlich."
    }
  ];

  return (
    <AppShell title="Wissen">
      {/* Zurück */}
      <a href="/" className="cp-small cp-link">← Zurück</a>

      {/* Intro */}
      <section className="mt-4 mb-5x">
        <h1 className="cp-h1 mb-2x">Wissen</h1>
        <p className="cp-body">
          Kurze, verlässliche Erläuterungen zu Szenarien, Kriterien und Methodik –
          im Stil des City-Profiler-Reports.
        </p>
      </section>

      {/* Artikelabschnitte */}
      <section className="space-y-4">
        {sections.map((s, i) => (
          <article
            key={i}
            className="rounded-2xl border p-6"
            style={{ borderColor: "var(--cp-line)", background: "var(--cp-bg)" }}
          >
            <h2 className="cp-h2 mb-2x">{s.title}</h2>
            <p className="cp-body">{s.text}</p>
          </article>
        ))}
      </section>

      {/* Quellenbox */}
      <section
        className="mt-6x rounded-xl border px-4 py-3 cp-small"
        style={{ borderColor: "var(--cp-line)", background: "#F7F8FA" }}
      >
        <strong style={{ color: "var(--cp-primary)" }}>Quelle:</strong>{" "}
        City Profiler Report 2025 · Ströer Corporate Strategy & Innovation
      </section>
    </AppShell>
  );
}
