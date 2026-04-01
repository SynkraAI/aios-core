# youtube-to-brief

```yaml
task:
  name: youtube-to-brief
  description: "Extract YouTube video transcript + metadata into structured brief"
  squad: etl-squad
  phase: 1
  elicit: false

input:
  required:
    - source_url: "YouTube URL (youtube.com/watch?v= or youtu.be/)"
  optional:
    - include_full_transcript: true
    - chunk_size: 500

execution:
  workflow: wf-etl-pipeline.yaml

  steps:
    - agent: extractor
      method: "YouTube Transcript API (captions)"
      fallback: "yt-dlp audio download → Whisper local"
      also_extract: "title, channel, duration, chapters, description, published_at"

    - agent: parser
      action: "Structure transcript"
      rules:
        - "If chapters exist → use as section boundaries"
        - "If no chapters → segment by topic shifts (3-5 min blocks)"
        - "Add timestamps to transcript"
        - "Format speakers if diarization available"

    - agent: enricher
      action: "Generate executive summary, key insights, frontmatter"
      sections:
        - "Sumario Executivo (3-5 sentences)"
        - "Capitulos (with timestamps and content)"
        - "Transcricao Completa (in <details> tag)"
        - "Insights Chave (bullet list)"

    - agent: validator
      action: "Quality gate"

    - agent: loader
      action: "Write .md brief"
      naming: "youtube-to-brief_{slug}_{date}.md"

output_format: markdown

veto_conditions:
  - "Video has no captions and audio download fails → FAIL"
  - "Transcript is <50 words → WARN (might be music-only)"
  - "Video is >4 hours → WARN, proceed with increased timeout"

output_example: |
  ---
  source_type: youtube
  video_id: "dQw4w9WgXcQ"
  title: "Masterclass: Brand Positioning"
  channel: "Marketing Academy"
  duration_seconds: 2400
  published_at: "2024-12-01T00:00:00Z"
  extracted_at: "2025-03-05T14:30:00Z"
  chapters: true
  language: pt
  word_count: 3500
  token_estimate: 5250
  quality_score: 0.88
  tags: [branding, positioning, masterclass]
  pipeline: youtube-to-brief
  job_id: etl_yt_9a2b
  ---

  # Masterclass: Brand Positioning

  > **Canal:** Marketing Academy | **Duracao:** 40:00 | **Publicado:** 01 Dez 2024

  ## Sumario Executivo

  Masterclass cobre os fundamentos de posicionamento...

  ## Capitulos

  ### [00:00] Introducao
  Apresentacao do tema...

  ### [10:15] O Framework de Posicionamento
  Detalhamento do framework...

  ## Insights Chave

  - Posicionamento nao e o que voce faz, e o que o cliente percebe
  - Framework de 4 quadrantes para mapear posicao competitiva

  ## Transcricao Completa

  <details>
  <summary>Expandir (3.500 palavras)</summary>

  [00:00] Bem vindos a esta masterclass...

  </details>

completion_criteria:
  - "Frontmatter com video_id, channel, duration"
  - "Sumario executivo presente"
  - "Capitulos com timestamps"
  - "Transcricao completa em <details>"
```
