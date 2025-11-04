export async function handler(event) {
  const body = JSON.parse(event.body || "{}");
  const makeUrl = process.env.MAKE_WEBHOOK_URL;
  if (!makeUrl) return j(500, { ok:false, error:"MAKE_WEBHOOK_URL missing" });

  const res = await fetch(makeUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000)
  });

  const text = await res.text();
  let reply = text;
  try { reply = JSON.parse(text); } catch {}
  return j(200, { ok:true, reply });
}
const j=(c,o)=>({ statusCode:c, headers:{ "content-type":"application/json" }, body:JSON.stringify(o) });
