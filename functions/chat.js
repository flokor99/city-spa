export async function handler() {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true, note: "Stub. Wird in Phase 3 an Make weitergeleitet." })
  };
}
