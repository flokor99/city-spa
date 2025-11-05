// functions/file.js  – robustes Lesen (String ODER Bytes)
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

  // Metadaten lesen (können String ODER Bytes sein)
  const rawMeta = await store.get(`meta/${id}.json`)
  if (rawMeta == null) return { statusCode: 404, body: 'Not found' }
  const metaText = typeof rawMeta === 'string' ? rawMeta : td.decode(rawMeta)
  const meta = JSON.parse(metaText)

  // Datei lesen (PDF als Bytes)
  const fileBytes = await store.get(`files/${id}.pdf`)
  if (!fileBytes) return { statusCode: 404, body: 'Not found' }

  const b64 = Buffer.from(
    typeof fileBytes === 'string' ? Buffer.from(fileBytes) : fileBytes
  ).toString('base64')

  return {
    statusCode: 200,
    headers: { 'Content-Type': meta.mime || 'application/pdf' },
    body: b64,
    isBase64Encoded: true,
  }
}

    headers: { 'Content-Type': meta.mime || 'application/pdf' },
    body: b64,
    isBase64Encoded: true,
  }
}
