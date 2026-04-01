# url-to-markdown

```yaml
task:
  name: url-to-markdown
  description: "Extract any URL and convert to clean markdown with frontmatter"
  squad: etl-squad
  phase: 1
  elicit: false

input:
  required:
    - source_url: "Any HTTP/HTTPS URL"
  optional:
    - chunk_size: 500
    - language: "auto"

execution:
  workflow: wf-etl-pipeline.yaml
  agents: [extractor, parser, enricher, validator, loader]

  steps:
    - agent: extractor
      method: "HTTP GET → Readability (extract article)"
      fallback: "Playwright (render JS) → archive.org"
      output: "raw HTML string"

    - agent: parser
      action: "HTML → Markdown"
      rules:
        - "Remove nav, footer, sidebar, ads, social buttons"
        - "Preserve headings hierarchy"
        - "Preserve links as inline markdown"
        - "Preserve tables as GFM tables"
        - "Preserve images as ![alt](src)"
        - "Preserve code blocks with language tag"
        - "Remove tracking params from URLs (?utm_*)"

    - agent: enricher
      action: "Add frontmatter, summary, chunks, entities, tags"

    - agent: validator
      action: "Quality gate (score >= 0.6)"

    - agent: loader
      action: "Write .md file"
      naming: "url-to-markdown_{slug}_{date}.md"

output_format: markdown
template: markdown-output-tmpl.md

veto_conditions:
  - "URL returns 4xx/5xx after retries → FAIL"
  - "Extracted content <100 chars after noise removal → FAIL"
  - "Content is login/paywall page → WARN"

output_example: |
  ---
  source_type: webpage
  source_url: "https://hbr.org/2024/brand-strategy"
  title: "The New Rules of Brand Strategy"
  author: "Jane Smith"
  published_at: "2024-11-20"
  extracted_at: "2025-03-05T14:30:00Z"
  language: en
  word_count: 2100
  token_estimate: 2730
  quality_score: 0.91
  tags: [brand strategy, differentiation, positioning]
  entities:
    people: [Philip Kotler]
    companies: [Nike, Apple]
  topics: [brand strategy, market positioning]
  chunks: 5
  pipeline: url-to-markdown
  job_id: etl_7f3a2b
  ---

  # The New Rules of Brand Strategy

  > **Sumario:** Article explores modern brand strategy...

  ## The Shift

  Content here...

completion_criteria:
  - "Markdown file with complete frontmatter"
  - "Zero HTML tags in body"
  - "quality_score >= 0.6"
  - "Links preserved and functional"
```
