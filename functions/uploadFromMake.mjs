import { blobs } from '@netlify/blobs'

export async function handler(event) {
  if (event.httpMethod !== 'POST') return new Response('Method', { status: 405 })

  const { title, mime = 'application/pdf', fileUrl, contentB64, meta = {} } =
    JSON.parse(event.body || '{}')
  if (!title || (!fileUrl && !contentB64)) return new Response('Bad Request', { status: 400 })

  const docId = crypto.randomUUID()

  // Datei holen
  let buf
  if (fileUrl) {
    const r = await fetch(fileUrl)
    if (!r.ok) return new Response('Fetch failed', { status: 400 })
    buf = new Uint8Array(await r.arrayBuffer())
  } else {
    buf = Buffer.from(contentB64, 'base64')
  }

  // Speichern
  await blobs.set(`files/${docId}.pdf`, buf, { contentType: mime })

  const docMeta = {
    id: docId, title, mime, size: buf.length,
    createdAt: new Date().toISOString(), meta
  }
  await blobs.setJSON(`docs/${docId}.json`, docMeta)

  // Index
  const idxKey = 'docs/index.json'
  const idx = (await blobs.getJSON(idxKey)) || { docIds: [] }
  idx.docIds.unshift(docId)
  await blobs.setJSON(idxKey, idx)

  return new Response(JSON.stringify({ ok: true, docId }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
