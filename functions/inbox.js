import fs from "fs";
import path from "path";

const file = "/tmp/docs.json"; // tmp-Speicher pro Deploy

export async function handler(event) {
  if (event.httpMethod === "POST") {
    const data = JSON.parse(event.body || "{}");
    const id = Date.now().toString();
    const item = {
      id,
      titel: data.title || "Ohne Titel",
      stadt: data.city || "",
      datum: data.date || new Date().toISOString().slice(0, 10),
      url: data.url || ""
    };

    const list = readList();
    list.push(item);
    fs.writeFileSync(file, JSON.stringify(list));
    return json({ ok: true, item });
  }

  if (event.httpMethod === "GET") {
    const list = readList();
    return json({ ok: true, items: list });
  }

  return { statusCode: 405, body: "Method not allowed" };
}

function readList() {
  try {
    if (!fs.existsSync(file)) return [];
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

function json(obj) {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(obj)
  };
}
