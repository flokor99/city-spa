import { useState } from "react";
import AppShell from "../components/AppShell.jsx";
import {
  interpretationNotes,
  presentations,
  faqItems,
  annexItems,
} from "../content/wissenContent";

export default function Wissen() {
  const [showAllNotes, setShowAllNotes] = useState(false);

  const previewCount = 2;
  const previewNotes = interpretationNotes.slice(0, previewCount);
  const restNotes = interpretationNotes.slice(previewCount);

  return (
    <AppShell title="Wissen">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Intro-Text im gleichen Stil wie andere Seiten */}
        <div style={{ marginBottom: 6 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
            WISSEN
          </h1>
          <p style={{ margin: "10px 0 0", maxWidth: 760, lineHeight: 1.6 }}>
            Alles zum Hintergrund der Städteszenarien, zur Methodik und den verwendeten Quellen.
          </p>
        </div>

        {/* Gelber Hinweisblock. Preview + Ausklappen */}
        <section
          style={{
            borderRadius: 18,
            border: "1px solid rgba(245, 158, 11, 0.55)",
            background: "rgba(253, 230, 138, 0.35)",
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 800 }}>
                Hinweise zur Interpretation der Ergebnisse
              </div>
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
                <span style={{ fontWeight: 700 }}>{item.title}:</span>{" "}
                {item.text}
              </li>
            ))}
          </ul>

          {showAllNotes && restNotes.length > 0 && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid rgba(245, 158, 11, 0.35)",
              }}
            >
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.55 }}>
                {restNotes.map((item, idx) => (
                  <li key={`rest-${idx}`} style={{ marginTop: 6 }}>
                    <span style={{ fontWeight: 700 }}>{item.title}:</span>{" "}
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Präsentationen */}
        <section
          style={{
            background: "#fff",
            border: "1px solid rgba(15, 23, 42, 0.12)",
            borderRadius: 18,
            padding: 18,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
            Präsentationen
          </h2>

          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {presentations.map((p) => (
              <a
                key={p.id}
                href={p.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid rgba(15, 23, 42, 0.12)",
                  borderRadius: 18,
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                {p.previewUrl ? (
                  <img
                    src={p.previewUrl}
                    alt=""
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 160,
                      background: "rgba(15, 23, 42, 0.06)",
                    }}
                  />
                )}

                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 800 }}>{p.title}</div>
                  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
                    {p.description}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section
          style={{
            background: "#fff",
            border: "1px solid rgba(15, 23, 42, 0.12)",
            borderRadius: 18,
            padding: 18,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>FAQ</h2>

          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                style={{
                  border: "1px solid rgba(15, 23, 42, 0.12)",
                  borderRadius: 14,
                  padding: 14,
                  background: "#fff",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: 800 }}>
                  {item.q}
                </summary>
                <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Anhang */}
        <section
          style={{
            background: "#fff",
            border: "1px solid rgba(15, 23, 42, 0.12)",
            borderRadius: 18,
            padding: 18,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Anhang</h2>

          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {annexItems.map((a) => (
              <a
                key={a.id}
                href={a.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid rgba(15, 23, 42, 0.12)",
                  borderRadius: 14,
                  padding: 14,
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 800 }}>{a.title}</div>
                <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
                  {a.description}
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
