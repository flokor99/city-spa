// functions/file.js — korrektes Binary-Response für PDF
exports.handler = async (event) => {
  const { getStore } = await import('@netlify/blobs')

  const store = await getStore({
    name: 'docs',
    siteID: process.env.MY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN
  })

  const id = new URL(event.rawUrl).searchParams.get('id')
  if (!id) return { statusCode: 400, body: 'Bad Request' }

  // Metadaten lesen
  const metaRaw = await store.get(`meta/${id}.json`)
  if (metaRaw == null) return { statusCode: 404, body: 'Not found' }
  const metaStr = typeof metaRaw === 'string' ? metaRaw : Buffer.from(metaRaw).toString('utf8')
  let meta
  try { meta = JSON.parse(metaStr) } catch { return { statusCode: 500, body: 'Meta parse error' } }

  // PDF lesen, immer in Buffer wandeln
  const fileRaw = await store.get(`files/${id}.pdf`)
  if (fileRaw == null) return { statusCode: 404, body: 'Not found' }
  const buf = Buffer.isBuffer(fileRaw) ? fileRaw : Buffer.from(fileRaw)

  // Base64-Body + Binary-Header
  const b64 = buf.toString('base64')
  return {
    statusCode: 200,
    headers: {
      'Content-Type': meta.mime || 'application/pdf',
      'Content-Disposition': `inline; filename="${meta.title || id}.pdf"`,
      'Cache-Control': 'no-store'
    },
    body: b64,
    isBase64Encoded: true
  }
}

