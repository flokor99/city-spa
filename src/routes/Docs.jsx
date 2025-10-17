import { useEffect, useState } from "react";

export default function Docs() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    fetch("/.netlify/functions/inbox")
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-3">
      <aside className="border-r bg-white p-4">
        <a href="/" className="text-sm block mb-4">← Zurück</a>
        <button
  onClick={() => setActive({ url: "/Szenario2_Vorlage.pdf" })}
  className="underline text-blue-600 mb-3 block text-left"
>
  Szenario 2 – Vorlage (anzeigen)
</button>
<h2 className="font-semibold mb-3">Dokumente</h2>

<a
  href="/Szenario2_Vorlage.pdf"
  target="_blank"
  rel="noreferrer"
  className="block mb-3 text-blue-600 underline"
>
  Szenario 2 – Vorlage (PDF öffnen)
</a>
<button
  onClick={() => setActive({ url: "/Szenario2_Vorlage.pdf" })}
  className="underline text-blue-600 mb-3 block text-left"
>
  Szenario 2 – Vorlage (anzeigen)
</button>

        <ul className="space-y-2">
          {items.map(it => (
            <li key={it.id}>
              <button onClick={()=>setActive(it)} className="w-full text-left border rounded-xl p-3 hover:bg-gray-50">
                <div className="font-medium">{it.titel}</div>
                <div className="text-xs text-gray-600">{it.stadt} · {it.datum}</div>
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="text-sm text-gray-500">Noch keine Dokumente.</li>}
        </ul>
      </aside>
      <main className="md:col-span-2 p-4">
        {!active ? (
          <div className="h-full border rounded-xl flex items-center justify-center bg-gray-50">
            Kein Dokument ausgewählt
          </div>
        ) : (
          <iframe title="PDF" src={active.url || "about:blank"} className="w-full h-full border rounded-xl" />
        )}
      </main>
    </div>
  );
}

