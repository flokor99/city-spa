exports.handler = async (event) => {
  try {
    const { get } = await import("@netlify/kv");

    const id = new URL(event.rawUrl).searchParams.get("id");

    if (!id) {
      return { statusCode: 400, body: "Missing id" };
    }

    const metaRaw = await get(`annex:meta:${id}`);
    const fileRaw = await get(`annex:file:${id}`);

    if (!metaRaw || !fileRaw) {
      return { statusCode: 404, body: "Not found" };
    }

    const meta = JSON.parse(metaRaw);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `inline; filename="${(meta.title || id).replace(
          /\"/g,
          ""
        )}.md"`,
      },
      body: fileRaw,
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
};
