// Datei: netlify/functions/chat-background.js
// Zweck: Startet Analyse, antwortet sofort mit 202, stößt Make an.

export async function handler(event) {
  // 1. Fehler wenn Variable oder Body fehlt
  if (!process.env.MAKE_GATEWAY_URL)
    return { statusCode: 400, body: JSON.stringify({ error: 'MAKE_GATEWAY_URL not set' }) };
  if (!event.body)
    return { statusCode: 400, body: JSON.stringify({ error: 'Empty body' }) };

  // 2. Eingehende Daten parsen
  const input = JSON.parse(event.body);
  const jobId = crypto.randomUUID();

  // 3. Sofortige Antwort an Frontend zurückgeben
  const response = {
    statusCode: 202,
    body: JSON.stringify({
      status: 'started',
      jobId,
      conversation_id: input.conversation_id
    })
  };

  // 4. Make-Webhook im Hintergrund starten
  fetch(process.env.MAKE_GATEWAY_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...input, jobId })
  }).catch(err => console.error('Make call failed:', err));

  return response;
}
