import { blobs } from '@netlify/blobs'

export async function handler(event) {
  const url = new URL(event.rawUrl)
  const id = url.searchParams.get('id')
  if (!id) return new Response('Bad Request', { status: 400 })

  const meta = await blobs.getJSON(`docs/${id}.json`)
  if (!meta) return new Response('Not found', { status: 404 })

  const file = await blobs.get(`files/${id}.pdf`, { raw: true })
  if (!file) return new Response('Not found', { status: 404 })

  return new Response(file.body, { headers: { 'Content-Type': meta.mime || 'application/pdf' } })
}
