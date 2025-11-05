exports.handler = async (event) => {
  try {
    const { getStore } = await import('@netlify/blobs')

    const siteID = process.env.MY_SITE_ID
    const token  = process.env.NETLIFY_API_TOKEN
    if (!siteID || !token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok:false, error:'Missing env', hasSiteID:!!siteID, hasToken:!!token })
      }
    }

    const store = await getStore({ name: 'docs', siteID, token })

    // Body parsen
    let body
    try {
      body = JSON.parse(event.body || '{}')
    } catch (e) {
      return { statusCode: 400, body: JSON.stringify({ ok:false, error:'Invalid JSON', detail:e.message }) }
    }

    const { title = 'Report.pdf', mime = 'application/pdf', contentB64, fileUrl, meta = {} } = body
    if (!contentB64 && !fileUrl) {
      return { statusCode: 400, body: JSON.stringify({ ok:false, error:'Provide contentB64 or fileUrl' }) }
    }

    const docId = cryptoRandomId()

    // Meta speichern
    await store.set(`meta/${docId}.json`, JSON.stringify({ title, mime, meta }))

    // Datei speichern
    if (contentB64) {
      await store.set(`files/${docId}.pdf`, contentB64, { contentType: mime, encoding: 'base64' })
    } else {
      const r = await fetch(fileUrl)
      if (!r.ok) return { statusCode: 400, body: JSON.stringify({ ok:false, error:'Fetch failed', status:r.status }) }
      const bytes = new Uint8Array(await r.arrayBuffer())
      await store.set(`files/${docId}.pdf`, bytes, { contentType: mime })
    }

    return { statusCode: 200, body: JSON.stringify({ ok:true, docId }) }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok:false, error:err.message, where:'top' })
    }
  }
}

function cryptoRandomId() {
  const b = new Uint8Array(16)
  if (globalThis.crypto?.getRandomValues) crypto.getRandomValues(b)
  else for (let i = 0; i < 16; i++) b[i] = (Math.random() * 256) | 0
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('')
}
