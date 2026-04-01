# feed-to-items

```yaml
task:
  name: feed-to-items
  description: "Parse RSS/Atom feeds and sitemaps into structured item lists"
  squad: etl-squad
  phase: 3
  elicit: false

input:
  required:
    - source: "RSS/Atom feed URL or sitemap URL"
  optional:
    - limit: "Max items to extract (default: all)"
    - since: "ISO date — only items after this date"
    - fetch_content: false

execution:
  steps:
    - agent: extractor
      method: "XML parser (RSS 2.0, Atom 1.0, Sitemap)"
      detect: "Auto-detect feed type from XML namespace/structure"

    - agent: parser
      rules:
        - "Extract: title, link, published_at, author, description, categories"
        - "Normalize dates to ISO 8601"
        - "Strip HTML from descriptions"
        - "Deduplicate items by URL"

    - agent: enricher
      action: "Generate _meta, apply filters (since, limit)"
      optional: "If fetch_content=true → run url-to-markdown for each item"

    - agent: validator
    - agent: loader
      naming: "feed-to-items_{slug}_{date}.yaml"

output_format: yaml

veto_conditions:
  - "URL is not valid XML/RSS/Atom → FAIL"
  - "Zero items in feed → WARN"
  - "fetch_content + >50 items → WARN (batch overhead)"

output_example: |
  _meta:
    source_type: rss_feed
    source_url: "https://blog.exemplo.com/feed"
    feed_title: "Blog Exemplo"
    feed_type: rss_2.0
    extracted_at: "2025-03-05T14:30:00Z"
    pipeline: feed-to-items
    job_id: etl_fd_5m6n
    quality_score: 0.95
    item_count: 25

  items:
    - title: "Como Construir uma Marca Forte"
      url: "https://blog.exemplo.com/marca-forte"
      published_at: "2025-02-20T10:00:00Z"
      author: "Maria Silva"
      description: "Artigo sobre os pilares de branding..."
      categories: [branding, estrategia]

    - title: "Tendencias de Marketing 2025"
      url: "https://blog.exemplo.com/tendencias-2025"
      published_at: "2025-02-15T08:00:00Z"
      author: "Joao Santos"
      description: "As 10 tendencias que vao dominar..."
      categories: [marketing, tendencias]

completion_criteria:
  - "All items extracted with required fields"
  - "Dates normalized to ISO 8601"
  - "No HTML in descriptions"
  - "No duplicate items"
```
