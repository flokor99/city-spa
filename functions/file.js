import { blobs } from '@netlify/blobs'

export const handler = async (event) => {
  const id = new URL(event.rawUrl).searchParams.get('id')
  if (!id) return { statusCode: 400, body: 'Bad Request' }

  const meta = await blobs.getJSON(`docs/${id}.json`)
  if (!meta) return { statusCode: 404, body: 'Not found' }

  const file = await blobs.get(`files/${id}.pdf`, { raw: true })
  if (!file) return { statusCode: 404, body: 'Not found' }

  return {
    statusCode: 200,
    headers: { 'Content-Type': meta.mime || 'application/pdf' },
    body: file.body,
    isBase64Encoded: false,
  }
}
