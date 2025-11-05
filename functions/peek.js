exports.handler = async (event) => {
  const { getStore } = await import('@netlify/blobs')
  const store = await getStore({
    name: 'docs',
    siteID: process.env.MY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN,
  })

  const id = new URL(event.rawUrl).searchParams.get('id')
  if (!id) return { statusCode: 400, body: 'Missing id' }

  const raw = await store.get(`files/${id}.pdf`)
  if (!raw) return { statusCode: 404, body: 'Not found' }

  const buf = Buffer.isBuffer(raw) ? raw : Buffer.from(raw)
  const headAscii = buf.subarray(0, 8).toString('ascii')       // %PDF-1.x
  const tailAscii = buf.subarray(Math.max(0, buf.length - 20)).toString('ascii') // Ende
  const hasEOF = /%%EOF/.test(tailAscii)

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ len: buf.length, headAscii, tailAscii, hasEOF })
  }
}
