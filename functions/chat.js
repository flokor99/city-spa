export async function handler(event) {
  const body = JSON.parse(event.body || "{}");
  const message = body.message || "";

  // Beispiel: an deinen Make-Webhook weiterleiten
  const makeUrl = "https://hook.eu2.make.com/55nfe6owtq9pw9ib93ucbzb2tmdh0rwx";

  const res = await fetch(makeUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

  const reply = await res.json().catch(() => ({}));

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true, reply })
  };
}
