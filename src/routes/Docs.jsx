import { useState } from "react";

const mock = [
  { id: 1, titel: "Beispiel PDF", stadt: "Bonn", datum: "2025-10-16", url: "" }
];

export default function Docs() {
  const [items] = useState(mock);
  const [active, setActive] = useState(null);

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-3">
      <aside className="border-r bg-white p-4">
        <a href="/" className="text-sm block mb-4">← Zurück</a>
        <h2 className="font-semibold mb-3">Dokumente</h2>
        <ul className="space-y-2">
          {items.map(it => (
            <li key={it.id}>
              <button onClick={()=>setActive(it)} className="w-full text-left border rounded-xl p-3 hover:bg-gray-50">
                <div className="font-medium">{it.titel}</div>
                <div className="text-xs text-gray-600">{it.stadt} · {it.datum}</div>
              </button>
            </li>
          ))}
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
