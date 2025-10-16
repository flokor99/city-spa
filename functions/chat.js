export async function handler(event) {
  const body = JSON.parse(event.body || "{}");
  const makeUrl = process.env.MAKE_WEBHOOK_URL;
  if (!makeUrl) return json(500, { ok: false, error: "MAKE_WEBHOOK_URL missing" });

  const res = await fetch(makeUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  let reply = text;
  try { reply = JSON.parse(text); } catch {}

  return json(200, { ok: true, reply });
}

function json(code, obj) {
  return { statusCode: code, headers: { "content-type": "application/json" }, body: JSON.stringify(obj) };
}
