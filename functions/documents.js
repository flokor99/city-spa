// funktioniert auch, wenn die Function als CommonJS läuft
exports.handler = async () => {
  const { blobs } = await import('@netlify/blobs') // dynamischer Import von ESM
  const idx = (await blobs.getJSON('docs/index.json')) || { docIds: [] }
  const docs = await Promise.all(idx.docIds.map(id => blobs.getJSON(`docs/${id}.json`)))
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(docs.filter(Boolean)),
  }
}
