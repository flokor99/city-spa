import { blobs } from '@netlify/blobs'

export async function handler() {
  const idx = (await blobs.getJSON('docs/index.json')) || { docIds: [] }
  const docs = await Promise.all(idx.docIds.map(id => blobs.getJSON(`docs/${id}.json`)))
  return new Response(JSON.stringify(docs.filter(Boolean)), {
    headers: { 'Content-Type': 'application/json' }
  })
}
