import { useState, useEffect, useMemo } from "react";
import AppShell from "../components/AppShell.jsx";

// ... dein bestehender Code bleibt

export default function Docs() {
  // ... dein bestehender State
  const [items, setItems] = useState(fallbackItems);
  const [active, setActive] = useState(fallbackItems[0] || null);
  const [previewUrl, setPreviewUrl] = useState(null);   // <— neu
  const [loadingPdf, setLoadingPdf] = useState(false);  // optional

  // Wenn aktives Dokument wechselt. PDF als Blob laden und URL bauen
  useEffect(() => {
    let revoked = false;
    let objectUrl = null;

    async function load() {
      setPreviewUrl(null);
      if (!active?.url) return;
      setLoadingPdf(true);
      try {
        const r = await fetch(active.url, { headers: { Accept: "application/pdf" }, cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const blob = await r.blob(); // CORS ist auf raw.githubusercontent.com offen
        objectUrl = URL.createObjectURL(blob);
        if (!revoked) setPreviewUrl(objectUrl);
      } catch (e) {
        // als Fallback zeigen wir gar nichts. der „In neuem Tab öffnen“-Button bleibt
        console.error("PDF preview failed:", e);
      } finally {
        setLoadingPdf(false);
      }
    }
    load();

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [active]);

  // ... dein bestehendes JSX
  // Im Viewer-Teil:
  // {active ? (
  //   <iframe title="PDF" src={active.url} ... />
  // ) : (...)}

  // Ersetze das iframe durch:
  // Wichtig: blob: in CSP erlauben. falls du eine eigene CSP gesetzt hast.
  // Netlify hat standardmäßig keine strenge frame-src. dann passt es.

  /* ... innerhalb des Viewers ... */
  <div style={{ height: "72vh", background: "#F7F8FA" }}>
    {active ? (
      previewUrl ? (
        <iframe title="PDF" src={previewUrl} className="w-full h-full" style={{ border: 0 }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="cp-small" style={{ color: "var(--cp-muted)" }}>
            {loadingPdf ? "PDF wird geladen…" : "Vorschau nicht verfügbar"}
          </div>
        </div>
      )
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <div className="cp-small" style={{ color: "var(--cp-muted)" }}>Kein Dokument ausgewählt</div>
      </div>
    )}
  </div>
}
