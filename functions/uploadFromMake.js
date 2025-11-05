// …
  // Datei laden
  let saveAsBase64 = null
  let bytes = null

  if (fileUrl) {
    // Wenn du per URL lädst, bleiben wir bei Bytes
    const r = await fetch(fileUrl)
    if (!r.ok) return { statusCode: 400, body: 'Fetch failed' }
    bytes = new Uint8Array(await r.arrayBuffer())
  } else {
    // WICHTIG: Base64 nicht selbst dekodieren,
    // sondern direkt als base64 in den Blob schreiben.
    saveAsBase64 = contentB64
  }

  // Datei speichern
  if (saveAsBase64) {
    await store.set(`files/${docId}.pdf`, saveAsBase64, {
      contentType: mime,
      encoding: 'base64',        // <- entscheidend
    })
  } else {
    await store.set(`files/${docId}.pdf`, bytes, {
      contentType: mime,
    })
  }
// …

