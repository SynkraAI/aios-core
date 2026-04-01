# audio-to-transcript

```yaml
task:
  name: audio-to-transcript
  description: "Transcribe audio/video files with timestamps and speaker detection"
  squad: etl-squad
  phase: 2
  elicit: false

input:
  required:
    - source: ".mp3, .mp4, .wav, .m4a file path"
  optional:
    - diarization: false
    - whisper_model: "base"
    - language: "auto"

execution:
  steps:
    - agent: extractor
      method: "Whisper local (model: config.transcription.model)"
      fallback: "Deepgram API"
      output: "Timestamped transcript + audio metadata (duration, format, bitrate)"

    - agent: parser
      rules:
        - "Format timestamps as [HH:MM:SS]"
        - "Group by speaker if diarization enabled"
        - "Segment into 3-5 minute topic blocks"
        - "Clean filler words (uh, um) if excessive"

    - agent: enricher
      action: "Summary, key topics, frontmatter"

    - agent: validator
      extra_checks:
        - "Transcript word count reasonable for duration (expect ~130 words/min)"
        - "No long gaps in transcript (missing segments)"

    - agent: loader
      naming: "audio-to-transcript_{slug}_{date}.md"

output_format: markdown

veto_conditions:
  - "Audio file corrupted or unreadable → FAIL"
  - "Transcript <10 words for >1min audio → FAIL (likely silence or music)"
  - "Audio >4 hours → WARN, expect long processing time"

output_example: |
  ---
  source_type: audio
  source_file: "./podcast-ep42.mp3"
  title: "Podcast EP42 - Futuro do Marketing"
  duration_seconds: 2700
  speakers: [Host, Convidado]
  transcript_method: whisper
  whisper_model: base
  language: pt
  word_count: 5800
  token_estimate: 8700
  quality_score: 0.82
  pipeline: audio-to-transcript
  job_id: etl_au_1i2j
  ---

  # Podcast EP42 - Futuro do Marketing

  > **Duracao:** 45:00 | **Speakers:** 2 | **Metodo:** Whisper base

  ## Sumario

  Episodio discute tendencias de marketing digital para 2025...

  ## Transcricao

  **[00:00] Host:** Bem vindos ao episodio 42...

  **[00:30] Convidado:** Obrigado pelo convite. Hoje quero falar sobre...

  **[05:12] Host:** Interessante. E como isso se aplica ao mercado brasileiro?

completion_criteria:
  - "Timestamps presentes"
  - "Speakers identificados (se diarization=true)"
  - "Sumario gerado"
  - "Duracao coerente com word_count"
```
