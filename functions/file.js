// functions/file.js — sendet echtes Binary mit Content-Length
exports.handler = async (event) => {
  const { getStore } = await import('@netlify/blobs')

  const store = await getStore({
    name: 'docs',
    siteID: process.env.MY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN
  })

  const id = new URL(event.rawUrl).searchParams.get('id')
  if (!id) return new Response('Bad Request', { status: 400 })

  // Meta lesen
  const metaRaw = await store.get(`meta/${id}.json`)
  if (metaRaw == null) return new Response('Not found', { status: 404 })
  const metaStr = typeof metaRaw === 'string' ? metaRaw : Buffer.from(metaRaw).toString('utf8')
  let meta; try { meta = JSON.parse(metaStr) } catch { return new Response('Meta parse error', { status: 500 }) }

  // PDF lesen
  const fileRaw = await store.get(`files/${id}.pdf`)
  if (fileRaw == null) return new Response('Not found', { status: 404 })
  const buf = Buffer.isBuffer(fileRaw) ? fileRaw : Buffer.from(fileRaw)

  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': meta.mime || 'application/pdf',
      'Content-Disposition': `inline; filename="${meta.title || id}.pdf"`,
      'Content-Length': String(buf.length),
      'Cache-Control': 'no-store'
    }
  })
}

