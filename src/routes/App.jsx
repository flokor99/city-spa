export default function App() {
  const Card = ({ href, title, desc }) => (
    <a href={href} className="block rounded-2xl border p-6 shadow-sm hover:shadow-md bg-white">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-gray-600 mt-1">{desc}</p>
    </a>
  );
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">City Profiler</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card href="/chat" title="Chat" desc="Fragen stellen. Oberfläche nur." />
        <Card href="/dokumente" title="Dokumente" desc="Liste + PDF-Viewer. Platzhalter." />
        <Card href="/wissen" title="Wissen" desc="Texte zu Szenarien." />
      </div>
    </main>
  );
}
