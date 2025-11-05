// functions/uploadFromMake.js  (CommonJS + Netlify Blobs Store)
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }

  const { getStore } = await import('@netlify/blobs')
  const store = await getStore({
    name: 'docs',
    siteID: process.env.MY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN,
  })

  const { title, mime = 'application/pdf', fileUrl, contentB64, meta = {} } =
    JSON.parse(event.body || '{}')
  if (!title || (!fileUrl && !contentB64)) return { statusCode: 400, body: 'Bad Request' }

  // neue ID
  const docId = (globalThis.crypto ?? require('crypto').webcrypto).randomUUID()

  // Datei laden
  let bytes
  if (fileUrl) {
    const r = await fetch(fileUrl)
    if (!r.ok) return { statusCode: 400, body: 'Fetch failed' }
    bytes = new Uint8Array(await r.arrayBuffer())
  } else {
    bytes = Buffer.from(contentB64, 'base64')
  }

  // Datei speichern
  await store.set(`files/${docId}.pdf`, bytes, { contentType: mime })

  // Metadaten speichern
  const td = new TextDecoder(); const te = new TextEncoder()
  const metaObj = {
    id: docId, title, mime, size: bytes.length,
    createdAt: new Date().toISOString(), meta
  }
  await store.set(`meta/${docId}.json`, te.encode(JSON.stringify(metaObj)), { contentType: 'application/json' })

  // Index aktualisieren
  const idxBuf = await store.get('index.json')
  const index = idxBuf ? JSON.parse(td.decode(idxBuf)) : { docIds: [] }
  if (!index.docIds.includes(docId)) index.docIds.unshift(docId)
  await store.set('index.json', te.encode(JSON.stringify(index)), { contentType: 'application/json' })

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, docId })
  }
}
