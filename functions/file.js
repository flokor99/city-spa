// functions/file.js — PDF mit Byte-Range Support (Edge/Chrome Viewer)
exports.handler = async (event) => {
  const { getStore } = await import('@netlify/blobs')

  const store = await getStore({
    name: 'docs',
    siteID: process.env.MY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN
  })

  const id = new URL(event.rawUrl).searchParams.get('id')
  if (!id) return { statusCode: 400, body: 'Bad Request' }

  // Metadaten
  const metaRaw = await store.get(`meta/${id}.json`)
  if (!metaRaw) return { statusCode: 404, body: 'Not found' }
  const metaStr = typeof metaRaw === 'string' ? metaRaw : Buffer.from(metaRaw).toString('utf8')
  let meta; try { meta = JSON.parse(metaStr) } catch { return { statusCode: 500, body: 'Meta parse error' } }

  // PDF bytes
  const fileRaw = await store.get(`files/${id}.pdf`)
  if (!fileRaw) return { statusCode: 404, body: 'Not found' }
  const buf = Buffer.isBuffer(fileRaw) ? fileRaw : Buffer.from(fileRaw)
  const total = buf.length

  // Range-Header parsen
  const range = (event.headers && (event.headers.range || event.headers.Range)) || null
  if (range && /^bytes=\d*-\d*$/.test(range)) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-')
    const start = Math.max(0, parseInt(startStr || '0', 10))
    const end = Math.min(total - 1, endStr ? parseInt(endStr, 10) : start + 1024 * 1024 - 1) // ~1MB
    if (isNaN(start) || isNaN(end) || start > end) {
      return { statusCode: 416, headers: { 'Content-Range': `bytes */${total}` }, body: '' }
    }
    const chunk = buf.subarray(start, end + 1)
    return {
      statusCode: 206,
      headers: {
        'Content-Type': meta.mime || 'application/pdf',
        'Content-Disposition': `inline; filename="${meta.title || id}.pdf"`,
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Length': String(chunk.length),
        'Cache-Control': 'no-store'
      },
      body: chunk.toString('base64'),
      isBase64Encoded: true
    }
  }

  // Vollständige Antwort
  return {
    statusCode: 200,
    headers: {
      'Content-Type': meta.mime || 'application/pdf',
      'Content-Disposition': `inline; filename="${meta.title || id}.pdf"`,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(total),
      'Cache-Control': 'no-store'
    },
    body: buf.toString('base64'),
    isBase64Encoded: true
  }
}

