import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { useAuth } from "../AuthContext.jsx";
import { interpretationNotes, presentations, faqItems } from "../content/wissenContent";

export default function Wissen() {
  const { user } = useAuth();
  const location = useLocation();

  const [showAllNotes, setShowAllNotes] = useState(false);
  const [annexItems, setAnnexItems] = useState([]);
  const [selectedAnnexId, setSelectedAnnexId] = useState(null);
  const [annexLoading, setAnnexLoading] = useState(true);

  const docPathFilter = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("docPath") || "";
  }, [location.search]);

  const previewCount = 2;
  const previewNotes = interpretationNotes.slice(0, previewCount);
  const restNotes = interpretationNotes.slice(previewCount);

  useEffect(() => {
    async function loadAnnexItems() {
      if (!user?.id) {
        setAnnexItems([]);
        setAnnexLoading(false);
        return;
      }

      setAnnexLoading(true);
      try {
        const query = new URLSearchParams({ ownerUserId: user.id, includeContent: "1" });
        if (user.email) query.set("ownerEmail", user.email);
        const res = await fetch(`/.netlify/functions/annex?${query.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        setAnnexItems(items);

        if (docPathFilter) {
          const match = items.find((item) => item.document_path === docPathFilter);
          setSelectedAnnexId(match?.id || null);
        } else if (items[0]) {
          setSelectedAnnexId(items[0].id);
        }
      } catch (err) {
        console.error("Annex-Liste konnte nicht geladen werden", err);
      } finally {
        setAnnexLoading(false);
      }
    }

    loadAnnexItems();
  }, [user, docPathFilter]);

  const visibleAnnexItems = useMemo(() => {
    if (!docPathFilter) return annexItems;
    return annexItems.filter((item) => item.document_path === docPathFilter);
  }, [annexItems, docPathFilter]);

  const selectedAnnex = visibleAnnexItems.find((item) => item.id === selectedAnnexId) || visibleAnnexItems[0] || null;

  return (
    <AppShell title="Wissen">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ marginBottom: 6 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>WISSEN</h1>
          <p style={{ margin: "10px 0 0", maxWidth: 760, lineHeight: 1.6 }}>
            Alles zum Hintergrund der Städteszenarien, zur Methodik und den verwendeten Quellen.
          </p>
        </div>

        <section style={{ borderRadius: 18, border: "1px solid rgba(245, 158, 11, 0.55)", background: "rgba(253, 230, 138, 0.35)", padding: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800 }}>Hinweise zur Interpretation der Ergebnisse</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>
                Kurzfassung. Details bei Bedarf aufklappen, besonders vor externer Nutzung.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAllNotes((v) => !v)}
              style={{
                background: "#fff",
                border: "1px solid rgba(245, 158, 11, 0.6)",
                padding: "8px 10px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {showAllNotes ? "Weniger anzeigen" : "Mehr anzeigen"}
            </button>
          </div>

          <ul style={{ margin: "12px 0 0", paddingLeft: 18, lineHeight: 1.55 }}>
            {previewNotes.map((item, idx) => (
              <li key={`preview-${idx}`} style={{ marginTop: 6 }}>
                <span style={{ fontWeight: 700 }}>{item.title}:</span> {item.text}
              </li>
            ))}
          </ul>

          {showAllNotes && restNotes.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(245, 158, 11, 0.35)" }}>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.55 }}>
                {restNotes.map((item, idx) => (
                  <li key={`rest-${idx}`} style={{ marginTop: 6 }}>
                    <span style={{ fontWeight: 700 }}>{item.title}:</span> {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section style={{ background: "#fff", border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 18, padding: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Präsentationen</h2>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {presentations.map((p) => (
              <a key={p.id} href={p.fileUrl} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none", color: "inherit", border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 18, overflow: "hidden", background: "#fff" }}>
                {p.previewUrl ? (
                  <img src={p.previewUrl} alt="" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", height: 160, background: "rgba(15, 23, 42, 0.06)" }} />
                )}
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 800 }}>{p.title}</div>
                  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>{p.description}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section style={{ background: "#fff", border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 18, padding: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>FAQ</h2>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {faqItems.map((item, idx) => (
              <details key={idx} style={{ border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 14, padding: 14, background: "#fff" }}>
                <summary style={{ cursor: "pointer", fontWeight: 800 }}>{item.q}</summary>
                <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        <section id="annex" style={{ background: "#fff", border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 18, padding: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Annex</h2>
          {docPathFilter && (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--cp-muted)" }}>
              Gefiltert auf das ausgewählte Dokument.
            </p>
          )}

          {annexLoading && <div style={{ marginTop: 12 }}>Annex wird geladen…</div>}

          {!annexLoading && visibleAnnexItems.length === 0 && (
            <div style={{ marginTop: 12 }}>Derzeit liegt kein Annex für dieses Dokument vor.</div>
          )}

          {!annexLoading && visibleAnnexItems.length > 0 && (
            <div style={{ marginTop: 12, display: "grid", gap: 14, gridTemplateColumns: "320px 1fr" }}>
              <div style={{ border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 14, overflow: "hidden" }}>
                {visibleAnnexItems.map((item) => {
                  const active = item.id === selectedAnnex?.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedAnnexId(item.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        borderBottom: "1px solid rgba(15, 23, 42, 0.12)",
                        padding: "12px 14px",
                        cursor: "pointer",
                        background: active ? "#E7F1FF" : "#fff",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{item.title}</div>
                      <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
                        {item.document_title || item.document_path}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedAnnex && (
                <div style={{ border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 14, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{selectedAnnex.title}</div>
                      <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
                        {selectedAnnex.created_at?.slice(0, 10)} · {selectedAnnex.city || "ohne Stadtbezug"}
                      </div>
                    </div>
                    <a className="cp-btn" href={selectedAnnex.file_url} target="_blank" rel="noreferrer">
                      Markdown öffnen
                    </a>
                  </div>
                  <pre
                    style={{
                      marginTop: 12,
                      whiteSpace: "pre-wrap",
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: 13,
                      lineHeight: 1.5,
                      background: "#F8FAFC",
                      borderRadius: 10,
                      padding: 12,
                      maxHeight: 460,
                      overflow: "auto",
                    }}
                  >
                    {selectedAnnex.markdown || "Kein Inhalt verfügbar."}
                  </pre>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
