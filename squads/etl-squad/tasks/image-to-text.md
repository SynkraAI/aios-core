# image-to-text

```yaml
task:
  name: image-to-text
  description: "OCR images or generate semantic descriptions"
  squad: etl-squad
  phase: 2
  elicit: false

input:
  required:
    - source: ".jpg, .png, .gif, .webp, .svg file path or URL"
  optional:
    - mode: "auto | ocr | describe"
    - languages: [pt, en]

execution:
  steps:
    - agent: extractor
      method: "Tesseract OCR"
      fallback: "Claude Vision (semantic description)"
      auto_detect: "If >50 chars extracted by OCR → OCR mode. Else → describe mode"

    - agent: parser
      rules_ocr:
        - "Clean OCR artifacts (random chars, broken words)"
        - "Detect layout (single column, multi-column, table)"
        - "Preserve structure where detectable"
      rules_describe:
        - "Generate factual description of image content"
        - "Note colors, layout, text visible, subjects"
        - "For diagrams: extract flow/relationships as text"

    - agent: enricher
      action: "Frontmatter with image metadata"

    - agent: validator
    - agent: loader
      naming: "image-to-text_{slug}_{date}.md"

output_format: markdown

veto_conditions:
  - "Image file corrupted → FAIL"
  - "OCR returns 0 characters and describe mode also fails → FAIL"
  - "Image is >20MB → WARN"

output_example: |
  ---
  source_type: image
  source_file: "./infografico-mercado.png"
  title: "Infografico - Mercado de Cosmeticos 2024"
  extraction_mode: ocr
  language: pt
  word_count: 180
  quality_score: 0.75
  pipeline: image-to-text
  job_id: etl_im_3k4l
  ---

  # Infografico - Mercado de Cosmeticos 2024

  > **Modo:** OCR | **Confianca:** 75%

  ## Conteudo Extraido

  Mercado Brasileiro de Cosmeticos
  Crescimento: +12% em 2024
  Segmentos:
  - Premium: 23% share (+18%)
  - Mass market: 77% share (+8%)

  Top 3 marcas:
  1. Natura — 28% share
  2. O Boticario — 22% share
  3. Avon — 11% share

completion_criteria:
  - "Text extraido ou descricao semantica gerada"
  - "Modo de extracao documentado no frontmatter"
  - "Quality score reflete confianca do OCR"
```
