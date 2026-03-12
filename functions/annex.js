const STORE_PREFIX = "annex";

exports.handler = async (event) => {
  try {
    const { get, set } = await import("@netlify/kv");

    if (event.httpMethod === "POST") {
      const webhookToken = process.env.ANNEX_WEBHOOK_TOKEN;

      if (webhookToken) {
        const provided =
          event.headers["x-annex-token"] || event.headers["X-Annex-Token"];

        if (provided !== webhookToken) {
          return json(401, { error: "Unauthorized" });
        }
      }

      const body = JSON.parse(event.body || "{}");

      const {
        title,
        description,
        markdown,
        sources,
        background,
        documentPath,
        documentTitle,
        ownerUserId,
        ownerEmail,
        city,
      } = body;

      if (!documentPath || !ownerUserId) {
        return json(400, {
          error: "documentPath und ownerUserId sind erforderlich",
        });
      }

      const id = cryptoId();
      const createdAt = new Date().toISOString();

      const md = buildMarkdown({
        title,
        description,
        markdown,
        sources,
        background,
        documentTitle,
        city,
      });

      const meta = {
        id,
        title: title || `Annex zu ${documentTitle || documentPath}`,
        description:
          description || "Quellen und tiefergehende Hintergrundanalyse",
        document_path: documentPath,
        document_title: documentTitle || null,
        owner_user_id: ownerUserId,
        owner_email: ownerEmail || null,
        city: city || null,
        created_at: createdAt,
      };

      await set(`${STORE_PREFIX}:meta:${id}`, JSON.stringify(meta));
      await set(`${STORE_PREFIX}:file:${id}`, md);

      const rawIndex = (await get(`${STORE_PREFIX}:index`)) || "[]";
      const index = JSON.parse(rawIndex);

      const next = [id, ...index.filter((x) => x !== id)];

      await set(`${STORE_PREFIX}:index`, JSON.stringify(next));

      return json(200, { ok: true, annexId: id, ...meta });
    }

    if (event.httpMethod === "GET") {
      const { get } = await import("@netlify/kv");

      const q = event.queryStringParameters || {};

      const ownerUserId = q.ownerUserId || null;
      const ownerEmail = q.ownerEmail || null;
      const documentPath = q.documentPath || null;
      const includeContent = q.includeContent === "1";

      const rawIndex = (await get(`${STORE_PREFIX}:index`)) || "[]";
      const ids = JSON.parse(rawIndex);

      const items = [];

      for (const id of ids) {
        const rawMeta = await get(`${STORE_PREFIX}:meta:${id}`);
        if (!rawMeta) continue;

        const meta = JSON.parse(rawMeta);

        if (ownerUserId && meta.owner_user_id !== ownerUserId) continue;

        if (!ownerUserId && ownerEmail && meta.owner_email) {
          if (
            String(meta.owner_email).toLowerCase() !==
            String(ownerEmail).toLowerCase()
          )
            continue;
        }

        if (documentPath && meta.document_path !== documentPath) continue;

        const item = {
          ...meta,
          file_url: `/.netlify/functions/annex-file?id=${encodeURIComponent(
            id
          )}`,
        };

        if (includeContent) {
          item.markdown = (await get(`${STORE_PREFIX}:file:${id}`)) || "";
        }

        items.push(item);
      }

      return json(200, { ok: true, items });
    }

    return json(405, { error: "Method not allowed" });
  } catch (error) {
    console.error("annex function error", error);
    return json(500, { error: error.message || "Server error" });
  }
};

function buildMarkdown({
  title,
  description,
  markdown,
  sources,
  background,
  documentTitle,
  city,
}) {
  if (markdown && typeof markdown === "string") return markdown;

  const lines = [];

  lines.push(`# ${title || `Annex zu ${documentTitle || "Dokument"}`}`);

  if (description) lines.push(`\n${description}`);
  if (city) lines.push(`\n**Stadt:** ${city}`);
  if (documentTitle) lines.push(`\n**Dokument:** ${documentTitle}`);

  if (background) {
    lines.push("\n## Tiefergehende Analyse");
    lines.push(
      typeof background === "string"
        ? background
        : JSON.stringify(background, null, 2)
    );
  }

  if (Array.isArray(sources) && sources.length > 0) {
    lines.push("\n## Quellen");

    sources.forEach((source, index) => {
      if (typeof source === "string") {
        lines.push(`${index + 1}. ${source}`);
      } else if (source && typeof source === "object") {
        const label =
          source.title || source.name || source.url || `Quelle ${index + 1}`;
        const url = source.url ? ` (${source.url})` : "";

        lines.push(`${index + 1}. ${label}${url}`);
      }
    });
  }

  return lines.join("\n");
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

function cryptoId() {
  const b = new Uint8Array(16);

  if (globalThis.crypto?.getRandomValues) {
    crypto.getRandomValues(b);
  } else {
    for (let i = 0; i < 16; i++) {
      b[i] = (Math.random() * 256) | 0;
    }
  }

  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
