// functions/documents.js – robustes Laden (String ODER Bytes)
exports.handler = async () => {
  const { getStore } = await import('@netlify/blobs')
  const store = await getStore({
    name: 'docs',
    siteID: process.env.MY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN,
  })

  const td = new TextDecoder()

  // Index laden (kann String ODER Uint8Array sein)
  const rawIdx = await store.get('index.json')
  const idxText =
    rawIdx == null
      ? null
      : (typeof rawIdx === 'string' ? rawIdx : td.decode(rawIdx))
  const index = idxText ? JSON.parse(idxText) : { docIds: [] }

  // Metadaten je Dokument (ebenfalls String ODER Bytes)
  const docs = await Promise.all(
    index.docIds.map(async (id) => {
      const rawMeta = await store.get(`meta/${id}.json`)
      if (rawMeta == null) return null
      const metaText = typeof rawMeta === 'string' ? rawMeta : td.decode(rawMeta)
      return JSON.parse(metaText)
    })
  )

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(docs.filter(Boolean)),
  }
}
