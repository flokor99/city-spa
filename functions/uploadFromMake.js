exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method' }

  const { blobs } = await import('@netlify/blobs')
  const { title, mime = 'application/pdf', fileUrl, contentB64, meta = {} } =
    JSON.parse(event.body || '{}')
  if (!title || (!fileUrl && !contentB64)) return { statusCode: 400, body: 'Bad Request' }

  const docId = (globalThis.crypto ?? require('crypto').webcrypto).randomUUID()

  let buf
  if (fileUrl) {
    const r = await fetch(fileUrl)
    if (!r.ok) return { statusCode: 400, body: 'Fetch failed' }
    buf = new Uint8Array(await r.arrayBuffer())
  } else {
    buf = Buffer.from(contentB64, 'base64')
  }

  await blobs.set(`files/${docId}.pdf`, buf, { contentType: mime })
  const docMeta = { id: docId, title, mime, size: buf.length, createdAt: new Date().toISOString(), meta }
  await blobs.setJSON(`docs/${docId}.json`, docMeta)

  const idxKey = 'docs/index.json'
  const idx = (await blobs.getJSON(idxKey)) || { docIds: [] }
  idx.docIds.unshift(docId)
  await blobs.setJSON(idxKey, idx)

  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, docId }) }
}
