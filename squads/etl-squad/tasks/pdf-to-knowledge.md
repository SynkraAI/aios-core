# pdf-to-knowledge

```yaml
task:
  name: pdf-to-knowledge
  description: "Extract PDF content, structure hierarchically, chunk for RAG"
  squad: etl-squad
  phase: 1
  elicit: false

input:
  required:
    - source: "PDF file path or URL"
  optional:
    - chunk_size: 500
    - extract_tables: true
    - extract_images: false

execution:
  workflow: wf-etl-pipeline.yaml

  steps:
    - agent: extractor
      method: "pdfjs-dist (text layer)"
      fallback_scanned: "Tesseract OCR (page-by-page)"
      fallback_complex: "Claude Vision (diagrams, complex tables)"
      also_extract: "page_count, metadata (author, title, creation_date)"

    - agent: parser
      action: "Structure PDF content"
      rules:
        - "Detect heading hierarchy by font size changes"
        - "Remove page headers/footers (repeated text per page)"
        - "Linearize multi-column layouts (left→right)"
        - "Extract tables into GFM format"
        - "Move footnotes to end of section"
        - "Detect and merge hyphenated words at line breaks"

    - agent: enricher
      action: "Frontmatter, summary, semantic chunks"
      chunking_strategy: "section-aware (prefer section boundaries)"

    - agent: validator
      action: "Quality gate — extra checks for PDF-specific issues"
      extra_checks:
        - "OCR quality (if used): garbled text ratio"
        - "Table extraction accuracy: column alignment"
        - "Page ordering: sequential, no gaps"

    - agent: loader
      naming: "pdf-to-knowledge_{slug}_{date}.md"
      also_generate: "chunks .jsonl if chunk_size configured"

output_format: markdown
secondary_output: "jsonl (chunks for RAG)"

veto_conditions:
  - "PDF is encrypted/password-protected → FAIL"
  - "PDF has 0 extractable text and OCR fails → FAIL"
  - "PDF >200 pages without --large flag → WARN, ask to proceed"
  - "OCR quality <50% readable → WARN"

output_example: |
  ---
  source_type: pdf
  source_file: "./relatorio-anual-2024.pdf"
  title: "Relatorio Anual 2024 — Empresa XYZ"
  author: "Departamento Financeiro"
  published_at: "2024-12-15"
  extracted_at: "2025-03-05T14:30:00Z"
  language: pt
  page_count: 45
  word_count: 12000
  token_estimate: 18000
  quality_score: 0.85
  extraction_method: pdfjs-dist
  tags: [relatorio anual, financeiro, 2024]
  entities:
    companies: [Empresa XYZ]
  chunks: 24
  pipeline: pdf-to-knowledge
  job_id: etl_pdf_3c4d
  ---

  # Relatorio Anual 2024 — Empresa XYZ

  > **Sumario:** Relatorio cobre resultados financeiros de 2024...

  ## Mensagem do CEO

  Conteudo limpo extraido do PDF...

  ## Resultados Financeiros

  | Indicador | 2023 | 2024 | Variacao |
  |-----------|------|------|----------|
  | Receita   | 50M  | 65M  | +30%     |

completion_criteria:
  - "Conteudo extraido de todas as paginas"
  - "Tabelas formatadas corretamente"
  - "Headers/footers removidos"
  - "Chunks gerados respeitando secoes"
```
