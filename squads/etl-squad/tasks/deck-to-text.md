# deck-to-text

```yaml
task:
  name: deck-to-text
  description: "Extract presentation slides into structured markdown"
  squad: etl-squad
  phase: 2
  elicit: false

input:
  required:
    - source: ".pptx or .ppt file path"

execution:
  steps:
    - agent: extractor
      method: "python-pptx (pptx), LibreOffice CLI (ppt)"
      extract_per_slide: [text, speaker_notes, images_alt_text]
      also_extract: "slide_count, title slide, metadata"

    - agent: parser
      rules:
        - "Each slide = one H2 section"
        - "Slide title = section heading"
        - "Bullet points preserved as lists"
        - "Tables preserved as GFM tables"
        - "Speaker notes in blockquote"
        - "Image alt text noted"

    - agent: enricher
      action: "Frontmatter, summary of key points"

    - agent: validator
    - agent: loader
      naming: "deck-to-text_{slug}_{date}.md"

output_format: markdown

veto_conditions:
  - "Zero text on all slides (image-only deck) → WARN, attempt image OCR"
  - "Corrupted file → FAIL"

output_example: |
  ---
  source_type: presentation
  source_file: "./estrategia-2025.pptx"
  title: "Estrategia de Marca 2025"
  slide_count: 18
  has_notes: true
  extracted_at: "2025-03-05T14:30:00Z"
  language: pt
  word_count: 800
  pipeline: deck-to-text
  job_id: etl_dk_7g8h
  ---

  # Estrategia de Marca 2025

  > **Sumario:** Deck de 18 slides cobrindo...

  ---

  ## Slide 1: Capa

  Estrategia de Marca 2025 — Empresa XYZ

  ---

  ## Slide 2: Agenda

  - Contexto de mercado
  - Analise competitiva
  - Posicionamento proposto
  - Roadmap de execucao

  ---

  ## Slide 3: Contexto de Mercado

  O mercado brasileiro de cosmeticos cresceu 12% em 2024...

  | Segmento | Crescimento | Share |
  |----------|-------------|-------|
  | Premium  | +18%        | 23%   |
  | Mass     | +8%         | 77%   |

  > **Notas:** Destacar que premium cresce 2x mais rapido

completion_criteria:
  - "Todos os slides extraidos"
  - "Notas do apresentador preservadas"
  - "Tabelas formatadas"
```
