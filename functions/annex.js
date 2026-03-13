exports.handler = async (event) => {
  try {

    const body = JSON.parse(event.body || "{}")

    const { document_path, title, markdown } = body

    if (!document_path || !markdown) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "document_path and markdown required" })
      }
    }

    const response = await fetch(
      "https://rnkxcsjqldelxsnsfawr.supabase.co/rest/v1/annex",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY,
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          document_path,
          title,
          markdown
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
