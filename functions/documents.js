// functions/documents.js  (CommonJS + manueller JSON-Parse)
exports.handler = async () => {
  const { getStore } = await import('@netlify/blobs')

  const store = await getStore({
    name: 'docs',
    siteID: process.env.MY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN,
  })

  const td = new TextDecoder()

  // Index laden
  const idxBuf = await store.get('index.json') // Uint8Array oder null
  const index = idxBuf ? JSON.parse(td.decode(idxBuf)) : { docIds: [] }

  // Metadaten je Dokument laden
  const docs = await Promise.all(
    index.docIds.map(async (id) => {
      const metaBuf = await store.get(`meta/${id}.json`)
      return metaBuf ? JSON.parse(td.decode(metaBuf)) : null
    })
  )

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(docs.filter(Boolean)),
  }
}
