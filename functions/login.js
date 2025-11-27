exports.handler = async (event) => {
  const { password } = JSON.parse(event.body || "{}")

  if (password === process.env.SITE_PASSWORD) {
    return {
      statusCode: 200,
      headers: {
        // HttpOnly raus, damit React das Cookie sehen kann
        "Set-Cookie": "session=valid; Path=/; Max-Age=86400; SameSite=Lax"
      },
      body: JSON.stringify({ ok: true })
    }
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ ok: false })
  }
}
