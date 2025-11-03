// Datei: netlify/functions/chat.js
// Zweck: Hybrid-Flow – synchron bis 8 s, sonst 202 + Async-Callback.

export async function handler(event) {
  if (!process.env.MAKE_GATEWAY_URL)
    return { statusCode: 500, body: JSON.stringify({ error: 'MAKE_GATEWAY_URL not set' }) };

  const body = JSON.parse(event.body || '{}');

  // Pflichtfelder prüfen
  if (!body.conversation_id) 
    return { statusCode: 400, body: JSON.stringify({ error: 'conversation_id missing' }) };
  if (!body.callback_url) 
    return { statusCode: 400, body: JSON.stringify({ error: 'callback_url missing' }) };

  const jobId = (globalThis.crypto ?? require('crypto')).randomUUID?.() 
    || Math.random().toString(36).slice(2);

  // 8 s "synchrones Fenster"
  const controller = new AbortController();
  const kill = setTimeout(() => controller.abort(), 8000);

  try {
    const resp = await fetch(process.env.MAKE_GATEWAY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...body, jobId }),
      signal: controller.signal
    });

    clearTimeout(kill);

    // Make war schnell → direkt durchreichen
    const text = await resp.text();
    return { statusCode: resp.status, body: text };

  } catch (e) {
    clearTimeout(kill);

    // Zu langsam oder abgebrochen → asynchron weiterlaufen lassen
    return {
      statusCode: 202,
      body: JSON.stringify({
        status: 'accepted',
        jobId,
        conversation_id: body.conversation_id,
        note: 'Antwort folgt in Kürze.'
      })
    };
  }
}
