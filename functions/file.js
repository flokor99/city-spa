exports.handler = async (event) => {
  const { blobs } = await import('@netlify/blobs')
  const id = new URL(event.rawUrl).searchParams.get('id')
  if (!id) return { statusCode: 400, body: 'Bad Request' }

  const meta = await blobs.getJSON(`docs/${id}.json`)
  if (!meta) return { statusCode: 404, body: 'Not found' }

  const file = await blobs.get(`files/${id}.pdf`, { raw: true })
  return {
    statusCode: 200,
    headers: { 'Content-Type': meta.mime || 'application/pdf' },
    body: file.body,
    isBase64Encoded: false,
  }
}
