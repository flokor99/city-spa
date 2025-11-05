// functions/file.js  (CommonJS + Netlify Blobs Store)
exports.handler = async (event) => {
  const { getStore } = await import('@netlify/blobs')
  const store = await getStore({
    name: 'docs',
    siteID: process.env.MY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN,
  })

  const id = new URL(event.rawUrl).searchParams.get('id')
  if (!id) return { statusCode: 400, body: 'Bad Request' }

  const td = new TextDecoder()

  // Metadaten lesen
  const metaBuf = await store.get(`meta/${id}.json`)
  if (!metaBuf) return { statusCode: 404, body: 'Not found' }
  const meta = JSON.parse(td.decode(metaBuf))

  // Datei lesen
  const fileBytes = await store.get(`files/${id}.pdf`)
  if (!fileBytes) return { statusCode: 404, body: 'Not found' }

  // Als Base64 zurückgeben
  const b64 = Buffer.from(fileBytes).toString('base64')
  return {
    statusCode: 200,
    headers: { 'Content-Type': meta.mime || 'application/pdf' },
    body: b64,
    isBase64Encoded: true,
  }
}
