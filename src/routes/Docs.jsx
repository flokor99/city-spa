import { useEffect, useState } from "react";
import AppShell from "../components/AppShell.jsx";
import { useAuth } from "../AuthContext.jsx";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function Docs() {
  const { user } = useAuth();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    async function loadDocs() {
      if (!user) {
        setDocs([]);
        setSelectedDoc(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        // 1) Supabase REST: documents Tabelle
        // select=* reicht. Wichtig ist nur, dass owner_user_id in den rows enthalten ist.
        const url = `${SUPABASE_URL}/rest/v1/documents?select=*`;

        // 2) Request an Supabase senden
        const res = await fetch(url, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const rows = await res.json();

        // 3) Rows in das bisherige Format umwandeln
        const list = Array.isArray(rows)
          ? rows.map((row) => ({
              path: row.pdf_path,
              title: row.title,
              city_slug: row.city,
              created_at: row.created_at?.slice(0, 10),
              owner_email: row.owner_email,
              owner_user_id: row.owner_user_id, // NEU
            }))
          : [];

        // 4) Benutzerbezogene Filterung
        // Primär: owner_user_id. Fallback: owner_email (für alte Docs ohne Migration)
        const myDocs = list.filter((doc) => {
          if (doc.owner_user_id && user?.id) return doc.owner_user_id === user.id;

          if (doc.owner_email && user?.email)
            return doc.owner_email.toLowerCase() === user.email.toLowerCase();

          return false;
        });

        setDocs(myDocs);
        setSelectedDoc(myDocs.length > 0 ? myDocs[0] : null);
      } catch (err) {
        console.error("Fehler beim Laden der Dokumente", err);
        setError("Dokumentenliste konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    loadDocs();
  }, [user]);

  const handleSelect = (doc) => {
    setSelectedDoc(doc);
  };

  return (
    <AppShell title="Dokumente">
      <a href="/" className="cp-small cp-link">
        ← Zurück
      </a>

      {loading && <div className="mt-4">Lade Dokumente…</div>}

      {error && (
        <div
          className="mt-4"
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            background: "#FFE5E5",
            color: "#8A1F1F",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && docs.length === 0 && (
        <div className="mt-4">
          Es sind derzeit keine Dokumente für deinen Account vorhanden.
        </div>
      )}

      {!loading && !error && docs.length > 0 && selectedDoc && (
        <div className="mt-4 grid gap-4 md:grid-cols-[320px,1fr]">
          {/* linke Spalte. Liste der Dokumente */}
          <div
            className="rounded-2xl border"
            style={{ borderColor: "var(--cp-line)", background: "var(--cp-bg)" }}
          >
            <div
              className="px-4 py-3 border-b"
              style={{ borderColor: "var(--cp-line)" }}
            >
              <div className="cp-heading">Dokumente</div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {docs.map((doc, i) => {
                const isActive = doc.path === selectedDoc.path;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(doc)}
                    className="w-full text-left"
                    style={{ padding: 0, border: "none", background: "transparent" }}
                  >
                    <div
                      className="px-4 py-3 border-b"
                      style={{
                        borderColor: "var(--cp-line)",
                        background: isActive ? "#E7F1FF" : "transparent",
                      }}
                    >
                      <div className="cp-body">
                        {doc.title || "Unbenanntes Dokument"}
                      </div>
                      <div className="cp-small" style={{ color: "var(--cp-muted)" }}>
                        {doc.city_slug || ""}
                        {doc.created_at ? ` · ${doc.created_at}` : ""}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* rechte Spalte. Viewer */}
          <div
            className="rounded-2xl border flex flex-col"
            style={{ borderColor: "var(--cp-line)", background: "#F7F8FA" }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between border-b"
              style={{ borderColor: "var(--cp-line)", background: "var(--cp-bg)" }}
            >
              <div className="cp-heading">{selectedDoc.title || selectedDoc.path}</div>
              <a
                href={`/${selectedDoc.path}`}
                target="_blank"
                rel="noreferrer"
                className="cp-btn"
              >
                In neuem Tab öffnen
              </a>
            </div>
            <div className="flex-1">
              <iframe
                title={selectedDoc.title || selectedDoc.path}
                src={`/${selectedDoc.path}`}
                style={{
                  width: "100%",
                  height: "70vh",
                  border: "none",
                  borderRadius: "0 0 1rem 1rem",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
