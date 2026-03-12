# city-spa
Frontend für ein Multiagentensystem

## Annex-Webhook (Make → Wissen)

Es gibt jetzt zwei Netlify Functions für Annex-Dateien:

- `/.netlify/functions/annex`  
  - `POST`: legt einen neuen Annex (Markdown) an. Unterstützt **zwei Modi**:
    1) `text/markdown` Body (empfohlen)
    2) `application/json` Body (Legacy-kompatibel)
  - `GET`: listet Annex-Einträge (optional gefiltert nach `ownerUserId`, `ownerEmail`, `documentPath`).
- `/.netlify/functions/annex-file?id=<annexId>`  
  liefert die gespeicherte Markdown-Datei.

### POST (empfohlen): Markdown direkt senden

`POST /.netlify/functions/annex?documentPath=docs/outputs/hamburg.pdf&ownerUserId=<supabase-user-id>&documentTitle=Hamburg%20Output&city=Hamburg`

- Header: `Content-Type: text/markdown`
- Body: kompletter Markdown-Text
- Optionale Meta-Felder via Query oder Header:
  - `title`, `description`, `ownerEmail`, `documentTitle`, `city`
  - als Header-Alternative: `x-annex-title`, `x-annex-description`, `x-owner-email`, `x-document-title`, `x-city`, `x-document-path`, `x-owner-user-id`

### POST (Legacy): JSON senden

```json
{
  "title": "Annex – Hamburg Analyse",
  "description": "Quellen und Deep-Dive",
  "markdown": "# Annex ...",
  "sources": ["https://example.com"],
  "background": "Weitere Hintergründe",
  "documentPath": "docs/outputs/hamburg.pdf",
  "documentTitle": "Hamburg Output",
  "ownerUserId": "<supabase-user-id>",
  "ownerEmail": "user@example.com",
  "city": "Hamburg"
}
```

Header optional für Absicherung: `x-annex-token` (muss zu `ANNEX_WEBHOOK_TOKEN` passen, falls gesetzt).
