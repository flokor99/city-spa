import { useState, useMemo } from "react";
import AppShell from "../components/AppShell.jsx";

export default function Docs() {
  // Beispiel-Daten (du kannst/ sollst das später durch echte Daten ersetzen)
  const items = useMemo(() => ([
    {
      id: "hh-szenario",
      titel: "Szenario 2 – Vorlage",
      stadt: "Hamburg",
      datum: "2025",
      // Liegt bei dir bereits im public-Ordner
      url: "/Szenario2_Vorlage.pdf"
    }
    // Weitere Einträge hier …
  ]), []);

  const [active, setActive] = useState(items[0] || null);

  return (
    <AppShell title="Dokumente">
      {/* Zurück */}
      <a href="/" className="text-sm" style={{ color: "var(--cp-muted)" }}>
        ← Zurück
      </a>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Sidebar */}
        <aside
          className="rounded-2xl border p-4"
          style={{ borderColor: "var(--cp-line)", background: "var(--cp-bg)" }}
        >
          <h2 className="text-base font-semibold text-[var(--cp-primary)] mb-3">Dokumente</h2>

          <ul className="space-y-2">
            {items.map((it) => {
              const selected = active && active.id === it.id;
              return (
                <li key={it.id}>
                  <button
                    onClick={() => setActive(it)}
                    className="w-full text-left rounded-xl border px-3 py-3 transition"
                    style={{
                      borderColor: "var(--cp-line)",
                      background: selected ? "rgba(28,117,188,0.06)" : "var(--cp-bg)"
                    }}
                  >
                    <div
                      className="font-medium truncate"
                      style={{ color: selected ? "var(--cp-primary)" : "var(--cp-ink)" }}
                    >
                      {it.titel}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--cp-muted)" }}>
                      {it.stadt} · {it.datum}
                    </div>
                  </button>
                </li>
              );
            })}
            {items.length === 0 && (
              <li className="text-sm" style={{ color: "var(--cp-muted)" }}>
                Noch keine Dokumente.
              </li>
            )}
          </ul>
        </aside>

        {/* Viewer */}
        <main className="md:col-span-2">
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "var(--cp-line)", background: "#F7F8FA" }}
          >
            {/* Toolbar */}
            <div
              className="flex items-center justify-between px-3 py-2 border-b"
              style={{ borderColor: "var(--cp-line)", background: "var(--cp-bg)" }}
            >
              <div className="text-sm font-medium" style={{ color: "var(--cp-ink)" }}>
                {active ? active.titel : "Kein Dokument ausgewählt"}
              </div>
              {active && (
                <div className="flex items-center gap-2">
                  <a
                    href={active.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold px-3 py-1 rounded-lg"
                    style={{
                      color: "white",
                      background: "var(--cp-primary)"
                    }}
                  >
                    In neuem Tab öffnen
                  </a>
                </div>
              )}
            </div>

            {/* PDF-Frame */}
            <div style={{ height: "72vh", background: "#F7F8FA" }}>
              {active ? (
                <iframe
                  title="PDF"
                  src={active.url}
                  className="w-full h-full"
                  style={{ border: "0" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-sm" style={{ color: "var(--cp-muted)" }}>
                    Kein Dokument ausgewählt
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
