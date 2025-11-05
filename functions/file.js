exports.handler = async (event) => {
  try {
    const { getStore } = await import('@netlify/blobs')
    const store = await getStore({
      name: 'docs',
      siteID: process.env.MY_SITE_ID,
      token: process.env.NETLIFY_API_TOKEN
    })

    const id = new URL(event.rawUrl).searchParams.get('id')
    if (!id) return { statusCode: 400, body: 'Bad Request' }

    // Meta lesen
    const metaRaw = await store.get(`meta/${id}.json`)
    if (!metaRaw) return { statusCode: 404, body: 'Not found' }
    const metaStr = typeof metaRaw === 'string' ? metaRaw : Buffer.from(metaRaw).toString('utf8')
    let meta; try { meta = JSON.parse(metaStr) } catch { meta = { mime:'application/pdf', title: 'file.pdf' } }

    // Datei lesen (kann string base64 oder Bytes sein)
    const fileRaw = await store.get(`files/${id}.pdf`)
    if (!fileRaw) return { statusCode: 404, body: 'Not found' }

    let bodyB64
    if (typeof fileRaw === 'string') {
      // Als base64 gespeichert → direkt durchreichen
      bodyB64 = fileRaw
    } else if (fileRaw instanceof Uint8Array || Buffer.isBuffer(fileRaw)) {
      bodyB64 = Buffer.from(fileRaw).toString('base64')
    } else if (fileRaw?.arrayBuffer) {
      bodyB64 = Buffer.from(await fileRaw.arrayBuffer()).toString('base64')
    } else {
      return { statusCode: 500, body: 'Unknown blob format' }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': meta.mime || 'application/pdf',
        'Content-Disposition': `inline; filename="${meta.title || id}.pdf"`
      },
      body: bodyB64,
      isBase64Encoded: true
    }
  } catch (e) {
    return { statusCode: 500, body: e.message }
  }
}
