const STORE_NAME = "annex";

exports.handler = async (event) => {
  try {
    const { getStore } = await import("@netlify/blobs");

    const siteID = process.env.MY_SITE_ID;
    const token = process.env.NETLIFY_API_TOKEN;

    if (!siteID || !token) {
      return json(500, { error: "Missing MY_SITE_ID or NETLIFY_API_TOKEN" });
    }

    const store = await getStore({ name: STORE_NAME, siteID, token });

    if (event.httpMethod === "POST") {
      const webhookToken = process.env.ANNEX_WEBHOOK_TOKEN;
      if (webhookToken) {
        const provided = event.headers["x-annex-token"] || event.headers["X-Annex-Token"];
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
      const md = buildMarkdown({ title, description, markdown, sources, background, documentTitle, city });

      const meta = {
        id,
        title: title || `Annex zu ${documentTitle || documentPath}`,
        description: description || "Quellen und tiefergehende Hintergrundanalyse",
        document_path: documentPath,
        document_title: documentTitle || null,
        owner_user_id: ownerUserId,
        owner_email: ownerEmail || null,
        city: city || null,
        created_at: createdAt,
      };

      await store.set(`meta/${id}.json`, JSON.stringify(meta), {
        contentType: "application/json",
      });
      await store.set(`files/${id}.md`, md, { contentType: "text/markdown; charset=utf-8" });

      const index = await readIndex(store);
      const next = [id, ...index.ids.filter((x) => x !== id)];
      await store.set("index.json", JSON.stringify({ ids: next }), {
        contentType: "application/json",
      });

      return json(200, { ok: true, annexId: id, ...meta });
    }

    if (event.httpMethod === "GET") {
      const q = event.queryStringParameters || {};
      const ownerUserId = q.ownerUserId || null;
      const ownerEmail = q.ownerEmail || null;
      const documentPath = q.documentPath || null;
      const includeContent = q.includeContent === "1";

      const index = await readIndex(store);
      const td = new TextDecoder();

      const items = [];

      for (const id of index.ids) {
        const rawMeta = await store.get(`meta/${id}.json`);
        if (!rawMeta) continue;

        const metaText = typeof rawMeta === "string" ? rawMeta : td.decode(rawMeta);
        const meta = JSON.parse(metaText);

        if (ownerUserId && meta.owner_user_id !== ownerUserId) continue;

        if (!ownerUserId && ownerEmail && meta.owner_email) {
          if (String(meta.owner_email).toLowerCase() !== String(ownerEmail).toLowerCase()) continue;
        }

        if (documentPath && meta.document_path !== documentPath) continue;

        const item = {
          ...meta,
          file_url: `/.netlify/functions/annex-file?id=${encodeURIComponent(id)}`,
        };

        if (includeContent) {
          const rawContent = await store.get(`files/${id}.md`);
          item.markdown = rawContent
            ? typeof rawContent === "string"
              ? rawContent
              : td.decode(rawContent)
            : "";
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

async function readIndex(store) {
  const td = new TextDecoder();
  const raw = await store.get("index.json");
  if (!raw) return { ids: [] };
  const text = typeof raw === "string" ? raw : td.decode(raw);
  try {
    const parsed = JSON.parse(text);
    return { ids: Array.isArray(parsed.ids) ? parsed.ids : [] };
  } catch {
    return { ids: [] };
  }
}

function buildMarkdown({ title, description, markdown, sources, background, documentTitle, city }) {
  if (markdown && typeof markdown === "string") return markdown;

  const lines = [];
  lines.push(`# ${title || `Annex zu ${documentTitle || "Dokument"}`}`);

  if (description) lines.push(`\n${description}`);
  if (city) lines.push(`\n**Stadt:** ${city}`);
  if (documentTitle) lines.push(`\n**Dokument:** ${documentTitle}`);

  if (background) {
    lines.push("\n## Tiefergehende Analyse");
    lines.push(typeof background === "string" ? background : JSON.stringify(background, null, 2));
  }

  if (Array.isArray(sources) && sources.length > 0) {
    lines.push("\n## Quellen");
    sources.forEach((source, index) => {
      if (typeof source === "string") {
        lines.push(`${index + 1}. ${source}`);
      } else if (source && typeof source === "object") {
        const label = source.title || source.name || source.url || `Quelle ${index + 1}`;
        const url = source.url ? ` (${source.url})` : "";
        lines.push(`${index + 1}. ${label}${url}`);
      }
    });
  }

  if (!background && (!Array.isArray(sources) || sources.length === 0)) {
    lines.push("\n*Keine zusätzlichen Quelleninformationen übermittelt.*");
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
  if (globalThis.crypto?.getRandomValues) crypto.getRandomValues(b);
  else for (let i = 0; i < 16; i += 1) b[i] = (Math.random() * 256) | 0;
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
