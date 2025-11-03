// Datei: netlify/functions/chat.js
// Hybrid: synchron bis 8s, sonst 202 Accepted und Make läuft weiter.

const j = (c, o) => ({
  statusCode: c,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(o),
});

export async function handler(event) {
  const body = JSON.parse(event.body || "{}");

  // 1) Env-Var wie vorher: NICHT umbenennen
  const makeUrl = process.env.MAKE_WEBHOOK_URL;
  if (!makeUrl) return j(500, { ok: false, error: "MAKE_WEBHOOK_URL missing" });

  // 2) Optional prüfen, ob für spätere Async-Rückgabe ein Callback mitgeliefert wird
  //    (Dein Make-Szenario sollte am Ende an body.callback_url posten)
  const hasCallback = typeof body.callback_url === "string" && body.callback_url.startsWith("http");

  // 3) Bis zu 8s auf schnelle Antwort warten
  const controller = new AbortController();
  const kill = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(makeUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal, // bricht NUR unsere Wartezeit ab; Make rechnet weiter
    });

    clearTimeout(kill);

    // Make hat schnell geantwortet → wie früher durchreichen
    const text = await res.text();
    let reply = text;
    try { reply = JSON.parse(text); } catch {}
    return j(res.status || 200, { ok: true, reply });

  } catch (err) {
    clearTimeout(kill);

    // 4) Zu langsam / Timeout → sofort 202 zurückgeben
    //    Make verarbeitet im Hintergrund weiter.
    //    ACHTUNG: Damit später etwas im Chat ankommt, muss dein Make-Flow am Ende
    //    ein HTTP-Request auf body.callback_url schicken.
    return j(202, {
      ok: true,
      status: "accepted",
      note: "Antwort folgt in Kürze.",
      requires_callback: hasCallback, // true, wenn callback_url im Request war
    });
  }
}
