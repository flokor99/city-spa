exports.handler = async (event) => {
  try {

    const body = JSON.parse(event.body || "{}")

    const { document_id, markdown } = body

    if (!document_id || !markdown) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "document_id and markdown required" })
      }
    }

    const response = await fetch(
      "https://rnkxcsjqldelxsnsfawr.supabase.co/rest/v1/documents?id=eq." + document_id,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          annex_markdown: markdown
        })
      }
    )

    const data = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, data })
    }

  } catch (e) {
    return {
      statusCode: 500,
      body: e.message
    }
  }
}
