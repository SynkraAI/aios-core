# compile

```yaml
task:
  name: compile
  description: "Compile multiple ETL sources into a single document with TOC"
  squad: etl-squad
  phase: 3
  elicit: false

input:
  required:
    - sources: "2+ file paths to ETL-processed .md or .yaml files, or glob pattern"
  optional:
    - title: "Override compiled document title"
    - toc_depth: "TOC heading depth (default: 2 = H1+H2)"
    - dedup: "true (default) — remove duplicate sections across sources"
    - output_format: "md (default) | yaml | json"
    - sort: "order (default: input order) | date | alpha | source_type"

execution:
  workflow: wf-compile.yaml
  agents: [etl-chief, parser, enricher, validator, loader]

  steps:
    - agent: etl-chief
      action: "Validate inputs"
      rules:
        - "Verify all source files exist"
        - "Verify minimum 2 sources"
        - "Detect if sources have YAML frontmatter (ETL-processed)"
        - "Sources without frontmatter → WARN, treat as raw text"

    - agent: parser
      action: "Read and extract"
      rules:
        - "Read each source file"
        - "Extract frontmatter from each"
        - "Extract body content from each"
        - "Track: title, source_type, word_count, tags, entities per source"

    - agent: parser
      action: "Merge and deduplicate"
      rules:
        - "Sort sources by configured sort order"
        - "Generate TOC from H1/H2 headings of each source"
        - "Add source separator between documents (---)"
        - "If dedup=true: detect duplicate sections (>80% similarity)"
        - "  Keep first occurrence, add note for duplicates removed"
        - "Concatenate body content in order"

    - agent: enricher
      action: "Generate consolidated frontmatter"
      rules:
        - "Merge tags from all sources (deduplicated)"
        - "Merge entities from all sources (deduplicated)"
        - "Sum word_count from all sources"
        - "Calculate new token_estimate"
        - "Set source_type: compiled"
        - "Set source_count: N"
        - "Generate consolidated summary covering all sources"

    - agent: validator
      action: "Quality gate"
      rules:
        - "Standard 6-component scoring"
        - "Extra check: TOC links resolve to actual headings"
        - "Extra check: no orphan sections (content without heading)"

    - agent: loader
      action: "Write compiled document"
      naming: "compile_{slug}_{date}.md"

output_format: markdown

veto_conditions:
  - "Less than 2 sources → FAIL (use *process for single source)"
  - "All sources fail to read → FAIL"
  - "Compiled document >100k words → WARN (consider splitting)"
  - "Zero sources have frontmatter → WARN (output will lack metadata)"

output_example: |
  ---
  source_type: compiled
  title: "Pesquisa Concorrentes - Cosmeticos 2024"
  compiled_at: "2026-03-11T14:30:00Z"
  source_count: 4
  sources:
    - title: "Natura Annual Report 2024"
      source_type: pdf
      pipeline: pdf-to-knowledge
    - title: "O Boticario Brand Strategy"
      source_type: webpage
      pipeline: url-to-markdown
    - title: "Cosmetics Market Trends"
      source_type: youtube
      pipeline: youtube-to-brief
    - title: "Industry Data Q4"
      source_type: spreadsheet
      pipeline: spreadsheet-to-json
  language: pt
  word_count: 8500
  token_estimate: 12750
  tags: [cosmeticos, natura, boticario, tendencias, mercado, 2024]
  entities:
    companies: [Natura, O Boticario, Avon, LOreal]
    people: [Roberto Lima]
  pipeline: compile
  job_id: etl_cmp_ghi789
  ---

  # Pesquisa Concorrentes - Cosmeticos 2024

  > **Sumario:** Compilacao de 4 fontes cobrindo mercado de cosmeticos
  > brasileiro em 2024. Natura lidera com 28% share, seguida por
  > O Boticario (22%). Segmento premium cresce 2x mais rapido.

  ## Indice

  1. [Natura Annual Report 2024](#natura-annual-report-2024)
  2. [O Boticario Brand Strategy](#o-boticario-brand-strategy)
  3. [Cosmetics Market Trends](#cosmetics-market-trends)
  4. [Industry Data Q4](#industry-data-q4)

  ---

  ## Natura Annual Report 2024

  *Fonte: pdf-to-knowledge | 45 paginas | Score: 0.85*

  Conteudo do relatorio...

  ---

  ## O Boticario Brand Strategy

  *Fonte: url-to-markdown | Score: 0.91*

  Conteudo do artigo...

completion_criteria:
  - "TOC gerado com links para cada secao"
  - "Frontmatter consolidado com dados de todas as fontes"
  - "Deduplicacao aplicada se habilitada"
  - "Summary cobrindo todas as fontes"
  - "quality_score >= 0.6"
```
