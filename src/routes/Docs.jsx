import { useState, useEffect, useMemo } from "react";
import AppShell from "../components/AppShell.jsx";

export default function Docs() {
  // Deine bisherige feste Liste als Fallback
  const fallbackItems = useMemo(
    () => [
      {
        id: "hamburg-profiler",
        titel: "City Profiler – Hamburg",
        stadt: "Hamburg",
        datum: "2025",
        url: "/docs/Cityprofiler_Hamburg.pdf",
      },
      {
        id: "hh-szenario",
        titel: "Szenario 2 – Vorlage",
        stadt: "Hamburg",
        datum: "2025",
        url: "/Szenario2_Vorlage.pdf",
      },
    ],
    []
  );

  const [items, setItems] = useState(fallbackItems);
  const [active, setActive] = useState(fallbackItems[0] || null);

  useEffect(() => {
    let cancelled = false;
    fetch("/docs/index.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((arr) => {
        if (cancelled) return;
        if (Array.isArray(arr) && arr.length > 0) {
          setItems(arr);
          setActive(arr[0]);
        }
      })
      .catch(() => {
        /* still use fallbackItems */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell title="Dokumente">
      <a href="/" className="cp-small cp-link">← Zurück</a>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Sidebar */}
        <aside
          className="rounded-2xl border p-4"
          style={{ borderColor: "var(--cp-line)", background: "var(--cp-bg)" }}
        >
          <h2 className="cp-h2 mb-2x">Dokumente</h2>

          <ul className="space-y-2">
            {items.map((it) => {
              const selected = active && active.id === it.id;
              return (
                <li key={it.id}>
                  <button
                    onClick={() => setActive(it)}
                    className="w-full text-left rounded-xl px-3 py-3 transition"
                    style={{
                      border: "1px solid var(--cp-line)",
                      background: selected
                        ? "rgba(28,117,188,0.06)"
                        : "var(--cp-bg)",
                      color: selected ? "var(--cp-primary)" : "var(--cp-ink)",
                    }}
                  >
                    <div className="font-medium truncate">{it.titel}</div>
                    <div className="cp-small mt-1x" style={{ color: "var(--cp-muted)" }}>
                      {it.stadt} · {it.datum}
                    </div>
                  </button>
                </li>
              );
            })}
            {items.length === 0 && (
              <li className="cp-small" style={{ color: "var(--cp-muted)" }}>
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
            <div
              className="flex items-center justify-between px-3 py-2 border-b"
              style={{ borderColor: "var(--cp-line)", background: "var(--cp-bg)" }}
            >
              <div className="cp-body" style={{ fontWeight: 600, color: "var(--cp-ink)" }}>
                {active ? active.titel : "Kein Dokument ausgewählt"}
              </div>
              {active && (
                <a
                  href={active.url}
                  target="_blank"
                  rel="noreferrer"
                  className="cp-btn text-sm"
                  style={{ padding: "6px 12px" }}
                >
                  In neuem Tab öffnen
                </a>
              )}
            </div>

            <div style={{ height: "72vh", background: "#F7F8FA" }}>
              {active ? (
                <iframe title="PDF" src={active.url} className="w-full h-full" style={{ border: 0 }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="cp-small" style={{ color: "var(--cp-muted)" }}>
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
