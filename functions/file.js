// functions/file.js  — CommonJS, ohne exotische Syntax
exports.handler = async (event) => {
  const { getStore } = await import('@netlify/blobs')

  const store = await getStore({
    name: 'docs',
    siteID: process.env.MY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN
  })

  const id = new URL(event.rawUrl).searchParams.get('id')
  if (!id) return { statusCode: 400, body: 'Bad Request' }

  // Metadaten lesen (String ODER Bytes)
  const metaRaw = await store.get(`meta/${id}.json`)
  if (metaRaw == null) return { statusCode: 404, body: 'Not found' }
  const metaText =
    typeof metaRaw === 'string' ? metaRaw : Buffer.from(metaRaw).toString('utf8')

  let meta
  try {
    meta = JSON.parse(metaText)
  } catch {
    return { statusCode: 500, body: 'Meta parse error' }
  }

  // PDF lesen (String ODER Bytes)
  const dataRaw = await store.get(`files/${id}.pdf`)
  if (dataRaw == null) return { statusCode: 404, body: 'Not found' }

  const b64 =
    typeof dataRaw === 'string'
      ? Buffer.from(dataRaw, 'utf8').toString('base64')
      : Buffer.from(dataRaw).toString('base64')

  return {
    statusCode: 200,
    headers: { 'Content-Type': meta.mime || 'application/pdf' },
    body: b64,
    isBase64Encoded: true
  }
}
