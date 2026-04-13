# Video to Mind Clone Task

> Process a video/audio source through video-transcriber and produce output compatible with mind-cloning squad.

---

## Task Definition

```yaml
task: videoToClone()
responsavel: Dev Agent
responsavel_type: Agente
atomic_layer: Integration
elicit: true

**Entrada:**
- campo: source
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: YouTube URL or local file path (audio/video)

- campo: clone_name
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Name of the mind clone being built

- campo: output_dir
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: Output directory path

- campo: model
  tipo: string
  origem: User Input
  obrigatorio: false
  default: medium

- campo: language
  tipo: string
  origem: User Input
  obrigatorio: false
  default: pt

**Saida:**
- campo: source_material_md
  tipo: path
  descricao: Clean markdown transcription ready for mind-cloning extraction
- campo: source_metadata
  tipo: object
  descricao: Metadata about the source (title, duration, channel)
```

---

## Steps

### Step 1: Run Video-Transcriber Pipeline

Execute the full pipeline:

```bash
video-transcriber process <source> -o <output_dir> -m <model> -l <language>
```

### Step 2: Prepare Source Material for Mind-Cloning

The mind-cloning squad expects source materials as rich text documents. The `transcription_clean.md` from video-transcriber is the ideal format because:

1. **Timestamps preserved** — helps identify speaking patterns
2. **Loops removed** — no Whisper hallucinations
3. **Markdown structure** — compatible with extraction prompts

### Step 3: Register as Source Material

Create a source material entry compatible with mind-cloning:

```yaml
source:
  type: video_transcription
  name: "<video_title>"
  clone: "<clone_name>"
  path: "<output_dir>/transcription_clean.md"
  metadata:
    original_url: "<source_url>"
    duration: "<duration>"
    channel: "<channel>"
    language: "<detected_language>"
    word_count: <word_count>
    transcription_engine: "<whisper_engine_used>"
  quality:
    segments_original: <N>
    segments_cleaned: <N>
    loops_removed: <N>
```

### Step 4: Hand Off to Mind-Cloning

Invoke the mind-cloning extraction pipeline:

```
/mind-cloning:tasks:collect-sources
```

With the transcription as a new source document for the specified clone.

---

## Output Format

```
<output_dir>/
├── metadata.json              # Video metadata
├── transcription_clean.md     # Primary source material for cloning
├── transcription_clean.json   # Structured data (segments + timestamps)
├── stats.json                 # Quality metrics
└── source-material.yaml       # Mind-cloning source registration
```

---

## Integration Points

| Squad | Receives | Purpose |
|-------|----------|---------|
| mind-cloning | `transcription_clean.md` | Source material for extraction |
| mind-cloning | `metadata.json` | Source attribution |
| icp-cloning | `transcription_clean.md` | Voice DNA extraction |

## Use Cases

1. **Clone from YouTube**: Process a creator's videos to extract their speaking patterns, frameworks, and mental models
2. **Clone from podcast**: Process podcast episodes to build source material
3. **Batch clone**: Process an entire playlist to build comprehensive source material

## Dependencies

- `video-transcriber` CLI installed
- `ffmpeg`, `yt-dlp`
- Whisper engine (mlx-whisper preferred on Apple Silicon)
