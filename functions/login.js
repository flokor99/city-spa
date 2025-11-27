exports.handler = async (event) => {
  const { password } = JSON.parse(event.body || '{}')

  if (password === process.env.SITE_PASSWORD) {
    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": `session=valid; HttpOnly; Path=/; Max-Age=86400`
      },
      body: JSON.stringify({ ok: true })
    }
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ ok: false })
  }
}
