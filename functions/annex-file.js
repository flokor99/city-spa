exports.handler = async (event) => {
  try {
    const { getStore } = await import("@netlify/blobs");

    const siteID = process.env.MY_SITE_ID;
    const token = process.env.NETLIFY_API_TOKEN;

    if (!siteID || !token) {
      return { statusCode: 500, body: "Missing env" };
    }

    const id = new URL(event.rawUrl).searchParams.get("id");
    if (!id) {
      return { statusCode: 400, body: "Missing id" };
    }

    const store = await getStore({ name: "annex", siteID, token });

    const rawMeta = await store.get(`meta/${id}.json`);
    if (!rawMeta) return { statusCode: 404, body: "Not found" };

    const rawFile = await store.get(`files/${id}.md`);
    if (!rawFile) return { statusCode: 404, body: "Not found" };

    const td = new TextDecoder();
    const metaText = typeof rawMeta === "string" ? rawMeta : td.decode(rawMeta);
    const meta = JSON.parse(metaText);

    const content = typeof rawFile === "string" ? rawFile : td.decode(rawFile);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `inline; filename="${(meta.title || id).replace(/\"/g, "")}.md"`,
      },
      body: content,
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
};
