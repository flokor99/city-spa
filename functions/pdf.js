// netlify/functions/pdf.js
// Holt eine PDF von GitHub RAW und liefert sie mit inline-Headern zurück.
// Damit kann sie im <iframe> angezeigt werden, ohne Download.

export async function handler(event) {
  try {
    const { url } = event.queryStringParameters || {};
    if (!url) {
      return { statusCode: 400, body: "Missing ?url=" };
    }

    // Nur bestimmte Hosts erlauben
    const u = new URL(url);
    const allowed = new Set(["raw.githubusercontent.com", "github.com"]);
    if (!allowed.has(u.hostname)) {
      return { statusCode: 400, body: "Host not allowed" };
    }

    // PDF von GitHub laden
    const res = await fetch(u.toString(), { redirect: "follow" });
    if (!res.ok) {
      return { statusCode: res.status, body: `Upstream ${res.status}` };
    }

    // Binärdaten holen und inline zurückgeben
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline", // zeigt an, nicht herunterladen
        "Cache-Control": "public, max-age=120",
        "Access-Control-Allow-Origin": "*",
      },
      body: buf.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: `Error: ${err.message}` };
  }
}
