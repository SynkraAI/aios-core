---
paths:
  - .aiox-core/data/tool-registry.yaml
  - .mcp.json
---
# Tool Response Filtering — Dynamic Token Reduction

When processing responses from MCP tools or large web fetches, apply the filter
configuration defined in `.aiox-core/data/tool-registry.yaml` for the tool that
produced the response.

## Filter Types

### content
Extract main content, discard noise (navigation, ads, boilerplate).
Limit to `max_tokens`, truncate at natural boundary.
**Apply to:** WebFetch, EXA, Context7.

### schema
Select ONLY listed `fields` from JSON objects. Discard other keys.
**Apply to:** Playwright, API responses.

### field
Project ONLY listed `fields`, limit to `max_rows` rows.
**Apply to:** Apify results, database queries, CSV-like data.

## How to Apply

1. Identify tool name from response.
2. Look up in `tool-registry.yaml` → check `filter` key.
3. Apply filter type rules above. No filter → use full response.
4. Present filtered result — do NOT repeat raw payload.
5. If filter produces empty result, fall back to full response.
