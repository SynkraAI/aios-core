# batch-urls

```yaml
task:
  name: batch-urls
  description: "Process multiple sources in parallel with consolidated output"
  squad: etl-squad
  phase: 3
  elicit: false

input:
  required:
    - sources: "File (.txt, .json, .yaml) with list of URLs/paths, or inline array"
  optional:
    - pipeline: "Force same pipeline for all (default: auto per source)"
    - parallel: 3
    - fail_strategy: "continue"
    - rate_limit_ms: 1000

execution:
  workflow: wf-batch-processing.yaml

output_format: directory

veto_conditions:
  - "Sources file is empty or unreadable → FAIL"
  - ">100 sources without explicit --parallel → WARN, cap at 5"
  - "All sources fail → FAIL with consolidated error report"

output_example: |
  data/etl-output/batch/pesquisa-concorrentes_2025-03-05/
    index.yaml
    items/
      url-to-markdown_artigo-nike_2025-03-05.md
      url-to-markdown_artigo-adidas_2025-03-05.md
      youtube-to-brief_entrevista-ceo_2025-03-05.md
      pdf-to-knowledge_relatorio-2024_2025-03-05.md

  # index.yaml content:
  batch_id: etl_batch_9q0r
  total: 12
  success: 10
  warn: 1
  fail: 1
  items:
    - source: "https://nike.com/strategy"
      status: success
      pipeline: url-to-markdown
      output_file: "items/url-to-markdown_artigo-nike_2025-03-05.md"
      quality_score: 0.91
    - source: "https://dead-link.com"
      status: fail
      error: "HTTP 404 after 3 retries"

completion_criteria:
  - "All sources attempted"
  - "index.yaml with status for every source"
  - "Individual files for successful extractions"
  - "Failed sources documented with error details"
```
