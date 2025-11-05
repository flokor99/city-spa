exports.handler = async () => {
  const { getStore } = await import('@netlify/blobs')

  const store = await getStore({
    name: 'docs',
    siteID: process.env.MY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN,
  })

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
