exports.handler = async (event) => {
  try {
    const { getStore } = await import('@netlify/blobs')

    const siteID = process.env.MY_SITE_ID
    const token  = process.env.NETLIFY_API_TOKEN
    if (!siteID || !token) {
      return { statusCode: 500, body: 'Missing env' }
    }

    const store = await getStore({ name: 'docs', siteID, token })

    const body = JSON.parse(event.body || '{}')
    const { title = 'Report.pdf', mime = 'application/pdf', contentB64, fileUrl, meta = {} } = body
    if (!contentB64 && !fileUrl) {
      return { statusCode: 400, body: 'Provide contentB64 or fileUrl' }
    }

    const id = cryptoId()

    // Meta speichern
    await store.set(`meta/${id}.json`, JSON.stringify({ title, mime, meta }))

    // Datei speichern
    if (contentB64) {
      // Base64 unverändert speichern
      await store.set(`files/${id}.pdf`, contentB64, {
        contentType: mime,
        encoding: 'base64'
      })
    } else {
      // Von URL als Bytes speichern
      const r = await fetch(fileUrl)
      if (!r.ok) return { statusCode: 400, body: 'Fetch failed' }
      const bytes = new Uint8Array(await r.arrayBuffer())
      await store.set(`files/${id}.pdf`, bytes, { contentType: mime })
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, docId: id })
    }
  } catch (e) {
    return { statusCode: 500, body: e.message }
  }
}

function cryptoId () {
  const b = new Uint8Array(16)
  if (globalThis.crypto?.getRandomValues) crypto.getRandomValues(b)
  else for (let i=0;i<16;i++) b[i] = (Math.random()*256)|0
  return [...b].map(x=>x.toString(16).padStart(2,'0')).join('')
}
