# city-spa
Frontend für ein Multiagentensystem

## Annex-Webhook (Make → Wissen)

Es gibt jetzt zwei Netlify Functions für Annex-Dateien:

- `/.netlify/functions/annex`  
  - `POST`: legt einen neuen Annex (Markdown) an.
  - `GET`: listet Annex-Einträge (optional gefiltert nach `ownerUserId`, `ownerEmail`, `documentPath`).
- `/.netlify/functions/annex-file?id=<annexId>`  
  liefert die gespeicherte Markdown-Datei.

### POST Payload (Beispiel)

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
