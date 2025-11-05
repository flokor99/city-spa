exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      method: event.httpMethod,
      headers: event.headers,
      rawBodyLen: (event.body || '').length,
      isBase64: !!event.isBase64Encoded
    })
  }
}
