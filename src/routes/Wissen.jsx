import { useState } from "react";
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
    <div className="p-6 space-y-10">
      {/* Gelber Hinweisblock. Preview + Ausklappen */}
      <section className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-medium text-amber-900">
              Hinweise zur Interpretation der Ergebnisse
            </div>
            <div className="mt-1 text-sm text-amber-900">
              Kurzfassung. Details aufklappen, wenn du es extern nutzt oder diskutierst.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAllNotes((v) => !v)}
            className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:shadow-sm transition"
          >
            {showAllNotes ? "Weniger anzeigen" : "Mehr anzeigen"}
          </button>
        </div>

        <ul className="mt-3 list-disc pl-5 text-sm text-amber-900 space-y-1">
          {previewNotes.map((item, idx) => (
            <li key={`preview-${idx}`}>
              <span className="font-medium">{item.title}:</span>{" "}
              {item.text}
            </li>
          ))}
        </ul>

        {showAllNotes && restNotes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-amber-200">
            <ul className="list-disc pl-5 text-sm text-amber-900 space-y-1">
              {restNotes.map((item, idx) => (
                <li key={`rest-${idx}`}>
                  <span className="font-medium">{item.title}:</span>{" "}
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Präsentationen */}
      <section>
        <h1 className="text-xl font-semibold">Präsentationen</h1>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presentations.map((p) => (
            <a
              key={p.id}
              href={p.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border bg-white hover:shadow-sm transition overflow-hidden"
            >
              {p.previewUrl ? (
                <img
                  src={p.previewUrl}
                  alt=""
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-slate-100" />
              )}

              <div className="p-4 space-y-1">
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-slate-600">
                  {p.description}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-xl font-semibold">FAQ</h2>

        <div className="mt-4 space-y-3">
          {faqItems.map((item, idx) => (
            <details key={idx} className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium">{item.q}</summary>
              <div className="mt-2 text-sm text-slate-700">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Anhang */}
      <section>
        <h2 className="text-xl font-semibold">Anhang</h2>

        <div className="mt-4 space-y-3">
          {annexItems.map((a) => (
            <a
              key={a.id}
              href={a.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border bg-white hover:shadow-sm transition p-4"
            >
              <div className="font-medium">{a.title}</div>
              <div className="text-sm text-slate-600">{a.description}</div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
