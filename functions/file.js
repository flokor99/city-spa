// functions/file.js — liest Base64 aus Netlify Blobs korrekt und liefert PDF (inkl. Range)
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

  // Datei lesen und ggf. Base64 -> Binär dekodieren
  const fileRaw = await store.get(`files/${id}.pdf`)
  if (!fileRaw) return { statusCode: 404, body: 'Not found' }

  let buf
  if (typeof fileRaw === 'string') {
    // wurde mit encoding:'base64' gespeichert -> jetzt dekodieren
    buf = Buffer.from(fileRaw, 'base64')
  } else if (fileRaw instanceof Uint8Array || Buffer.isBuffer(fileRaw)) {
    buf = Buffer.from(fileRaw)
  } else if (fileRaw?.arrayBuffer) {
    buf = Buffer.from(await fileRaw.arrayBuffer())
  } else {
    return { statusCode: 500, body: 'Unknown blob format' }
  }

  const total = buf.length
  const headers = event.headers || {}
  const range = headers.range || headers.Range || null

  // Byte-Range unterstützen (Viewer von Edge/Chrome)
  if (range && /^bytes=\d*-\d*$/.test(range)) {
    const [s, e] = range.replace('bytes=', '').split('-')
    const start = Math.max(0, parseInt(s || '0', 10))
    const end = Math.min(total - 1, e ? parseInt(e, 10) : start + 1024 * 1024 - 1)
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
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
      'Cache-Control': 'no-store'
    },
    body: buf.toString('base64'),
    isBase64Encoded: true
  }
}
