exports.handler = async (event) => {
  const { getStore } = await import('@netlify/blobs')
  const store = await getStore({
    name: 'docs',
    siteID: process.env.MY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN
  })

  const id = new URL(event.rawUrl).searchParams.get('id')
  if (!id) return { statusCode: 400, body: 'Bad Request' }

  const metaRaw = await store.get(`meta/${id}.json`)
  if (!metaRaw) return { statusCode: 404, body: 'Not found' }
  const meta = JSON.parse(typeof metaRaw === 'string' ? metaRaw : Buffer.from(metaRaw).toString('utf8'))

  const fileRaw = await store.get(`files/${id}.pdf`)
  if (!fileRaw) return { statusCode: 404, body: 'Not found' }
  const buf = Buffer.isBuffer(fileRaw) ? fileRaw : Buffer.from(fileRaw)

  // Download statt Inline
  return {
    statusCode: 200,
    headers: {
      'Content-Type': meta.mime || 'application/pdf',
      'Content-Disposition': `attachment; filename="${meta.title || id}.pdf"`,
      'Cache-Control': 'no-store'
    },
    body: buf.toString('base64'),
    isBase64Encoded: true
  }
}

