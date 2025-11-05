// functions/documents.js
exports.handler = async () => {
  const { getStore } = await import('@netlify/blobs')
  // Ein Store "docs" genügt für Index + Metadaten + Dateien
  const store = await getStore('docs')

  const index = (await store.getJSON('index.json')) || { docIds: [] }
  const docs = await Promise.all(
    index.docIds.map(id => store.getJSON(`meta/${id}.json`))
  )

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(docs.filter(Boolean)),
  }
}
