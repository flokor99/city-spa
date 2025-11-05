// functions/peek.js – prüft die ersten Bytes einer gespeicherten Datei
exports.handler = async (event) => {
  const { getStore } = await import('@netlify/blobs')
  const store = await getStore({
    name: 'docs',
    siteID: process.env.MY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN,
  })

  const id = new URL(event.rawUrl).searchParams.get('id')
  if (!id) return { statusCode: 400, body: 'Missing id' }

  const bytes = await store.get(`files/${id}.pdf`)
  if (!bytes) return { statusCode: 404, body: 'Not found' }

  const buf = Buffer.from(typeof bytes === 'string' ? Buffer.from(bytes) : bytes)
  const ascii = buf.subarray(0, 8).toString('ascii')     // sollte mit %PDF- beginnen
  const b64 = buf.subarray(0, 8).toString('base64')      // sollte mit JVBERi0… beginnen
  const len = buf.length

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ len, ascii8: ascii, b64_8: b64 })
  }
}
