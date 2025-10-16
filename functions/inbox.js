export async function handler() {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true, note: "Stub. Speichern folgt in Phase 3." })
  };
}
