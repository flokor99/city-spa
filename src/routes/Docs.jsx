import { useState, useEffect, useMemo } from "react";
import AppShell from "../components/AppShell.jsx";

// ← falls du Repo/Branch mal änderst, hier zentral anpassen:
const GITHUB_DOCS_API =
  "https://api.github.com/repos/flokor99/city-spa/contents/public/docs?ref=main";

export default function Docs() {
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const filenameToTitle = (name) =>
    name
      .replace(/\.pdf$/i, "")
      .replace(/_/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const r = await fetch(GITHUB_DOCS_API, {
          headers: { Accept: "application/vnd.github.v3+json" },
          cache: "no-store",
        });
        if (!r.ok) throw new Error(`GitHub API ${r.status}`);
        const data = await r.json();
        if (!Array.isArray(data)) throw new Error("No array");

        const pdfs = data
          .filter((f) => f.type === "file" && /\.pdf$/i.test(f.name))
          .map((f) => ({
            id: f.sha,
            titel: filenameToTitle(f.name),
            stadt: filenameToTitle(f.name),
            datum: "",
            url: f.download_url,
          }))
          .sort((a, b) => a.titel.localeCompare(b.titel));

        if (!cancelled && pdfs.length > 0) {
          setItems(pdfs);
          setActive(pdfs[0]);
          return;
        }
      } catch {
        // still try index.json
      }

      try {
        const r = await fetch("/docs/index.json", { cache: "no-store" });
        if (!r.ok) throw new Error("no index.json");
        const arr = await r.json();
        if (!cancelled && Array.isArray(arr) && arr.length > 0) {
          setItems(arr);
          setActive(arr[0]);
          return;
        }
      } catch {
        // fallback bleibt
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- PDF Vorschau als Blob laden, um Autodownload zu verhindern ----
  useEffect(() => {
    let objectUrl = null;
    const ctrl = new AbortController();

    async function loadPdf() {
      setPreviewUrl(null);
      if (!active?.url) return;
      setLoadingPdf(true);
      try {
        const r = await fetch(active.url, {
          headers: { Accept: "application/pdf" },
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const blob = await r.blob();
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (e) {
        console.error("PDF preview failed:", e);
      } finally {
        setLoadingPdf(false);
      }
    }

    loadPdf();

    return () => {
      ctrl.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [active]);

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
                      {it.stadt}{it.datum ? ` · ${it.datum}` : ""}
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
                  href={previewUrl || active.url}
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
                previewUrl ? (
                  <iframe
                    title="PDF"
                    src={previewUrl}
                    className="w-full h-full"
                    style={{ border: 0 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="cp-small" style={{ color: "var(--cp-muted)" }}>
                      {loadingPdf ? "PDF wird geladen…" : "Vorschau nicht verfügbar"}
                    </div>
                  </div>
                )
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
