import { useEffect, useState } from "react";
import AppShell from "../components/AppShell.jsx";

export default function Docs() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetch("/docs/index.json");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        // Safety: falls jemand kein Array reinschreibt
        setDocs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fehler beim Laden der Dokumente", err);
        setError("Dokumentenliste konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    loadDocs();
  }, []);

  return (
    <AppShell title="Dokumente">
      <a href="/" className="cp-small cp-link">
        ← Zurück
      </a>

      <div className="mt-4">
        {loading && <div>Lade Dokumente…</div>}

        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              background: "#FFE5E5",
              color: "#8A1F1F",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && docs.length === 0 && (
          <div>Es sind derzeit keine Dokumente vorhanden.</div>
        )}

        {!loading && !error && docs.length > 0 && (
          <div className="space-y-3">
            {docs.map((doc, i) => (
              <div
                key={i}
                className="rounded-2xl border p-3 flex items-center justify-between"
                style={{ borderColor: "var(--cp-line)" }}
              >
                <div>
                  <div className="cp-body">
                    {doc.title || doc.path || "Unbenanntes Dokument"}
                  </div>
                  <div className="cp-small" style={{ color: "var(--cp-muted)" }}>
                    {doc.city_slug ? `Stadt: ${doc.city_slug}` : null}
                    {doc.created_at ? ` · ${doc.created_at}` : null}
                  </div>
                </div>
                <a
                  href={`/${doc.path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="cp-btn"
                >
                  Öffnen
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
