import { getStore } from "@netlify/blobs";

export async function handler(event) {
  const store = getStore("docs"); // Site-weiter Bucket

  if (event.httpMethod === "POST") {
    const data = JSON.parse(event.body || "{}");
    const id = (globalThis.crypto?.randomUUID?.() || String(Date.now()));
    const item = {
      id,
      titel: data.title || data.titel || "Ohne Titel",
      stadt: data.city || data.stadt || "",
      datum: data.date || data.datum || new Date().toISOString().slice(0, 10),
      url: data.url || ""
    };
    await store.setJSON(`doc-${id}.json`, item);
    return resp({ ok: true, item });
  }

  if (event.httpMethod === "GET") {
    const list = await store.list();
    const items = await Promise.all(
      list.blobs.map(b => store.get(b.key, { type: "json" }))
    );
    // Neueste zuerst
    items.sort((a, b) => (b.datum || "").localeCompare(a.datum || ""));
    return resp({ ok: true, items });
  }

  return { statusCode: 405, body: "Method not allowed" };
}

function resp(obj) {
  return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(obj) };
}
