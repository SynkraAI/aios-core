# enrich

```yaml
task:
  name: enrich
  description: "Enrich raw transcript or text into structured markdown with frontmatter"
  squad: etl-squad
  phase: 1
  elicit: false

input:
  required:
    - source: "Raw text string, file path (.txt, .md without frontmatter), or transcript"
  optional:
    - title: "Override title (default: infer from first line or filename)"
    - language: "Force language (default: auto-detect)"
    - chunk_size: "Token count per chunk (default: 500)"
    - tags: "Manual tags to add alongside auto-detected"
    - source_type: "Override source_type in frontmatter (default: text)"

execution:
  workflow: wf-etl-pipeline.yaml
  note: "Enters pipeline at Phase 3 (Enrich), skipping Phase 0-2 (Route, Extract, Parse)"
  agents: [enricher, validator, loader]

  steps:
    - agent: enricher
      action: "Enrich raw content"
      rules:
        - "Read raw text input"
        - "Generate YAML frontmatter per output-format-spec.md"
        - "  source_type, title, extracted_at, language, word_count, token_estimate"
        - "Generate summary (2-3 sentences, factual)"
        - "Chunk semantically (section boundaries > paragraph > sentence)"
        - "Extract entities (people, companies, products, places)"
        - "Extract topics and generate tags"
        - "Detect language if not forced"

    - agent: validator
      action: "Quality gate"
      rules:
        - "Run standard 6-component quality scoring"
        - "Frontmatter complete, encoding clean, content coherent"
        - "Score >= 0.6 → PASS"

    - agent: loader
      action: "Write output"
      naming: "enrich_{slug}_{date}.md"

output_format: markdown

veto_conditions:
  - "Input is empty or <10 words → FAIL"
  - "Input is already enriched (has YAML frontmatter) → WARN, ask to re-enrich or skip"
  - "Language detection confidence <0.3 → WARN, set language to unknown"

output_example: |
  ---
  source_type: text
  title: "Transcricao Reuniao de Planejamento Q2"
  extracted_at: "2026-03-11T14:30:00Z"
  language: pt
  word_count: 1800
  token_estimate: 2700
  quality_score: 0.85
  tags: [planejamento, q2, metas, equipe]
  entities:
    people: [Carlos Silva, Ana Mendes]
    companies: [Acme Corp]
  topics: [planejamento trimestral, metas de vendas]
  chunks: 4
  pipeline: enrich
  job_id: etl_enr_def456
  ---

  # Transcricao Reuniao de Planejamento Q2

  > **Sumario:** Reuniao de planejamento do Q2 abordou metas de vendas,
  > alocacao de equipe e timeline de lancamento. Carlos Silva apresentou
  > projecoes e Ana Mendes definiu prioridades.

  ## Abertura

  Carlos: Vamos comecar pelo review do Q1...

  ## Metas Q2

  Ana: As metas para o Q2 sao...

  ## Proximos Passos

  - Finalizar alocacao ate sexta
  - Revisar projecoes com financeiro

completion_criteria:
  - "YAML frontmatter completo com todos os campos"
  - "Summary gerado (2-3 frases)"
  - "Chunks gerados respeitando secoes"
  - "Entities extraidas quando presentes"
  - "quality_score >= 0.6"
```
