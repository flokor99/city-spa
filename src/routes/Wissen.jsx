import {
  toolLimits,
  presentations,
  faqItems,
  annexItems,
} from "../content/wissenContent";

export default function Wissen() {
  return (
    <div className="p-6 space-y-10">
      {/* Hinweisblock. Grenzen */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <div className="font-medium text-amber-900">Grenzen des Tools</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-amber-900 space-y-1">
          {toolLimits.map((x, idx) => (
            <li key={idx}>{x}</li>
          ))}
        </ul>
      </div>

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
                <div className="text-sm text-slate-600">{p.description}</div>
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
