export async function handler(event) {
  const data = JSON.parse(event.body || "{}");
  console.log("Empfangen:", data);

  // Später: Speicherung in Netlify Blobs.
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true, received: data })
  };
}
