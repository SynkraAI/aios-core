# Video to Knowledge Base Task

> Process a video/audio source through video-transcriber and produce output compatible with knowledge-base-builder squad.

---

## Task Definition

```yaml
task: videoToKb()
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

- campo: output_dir
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: Output directory path (defaults to /tmp/vt-<hash>/)

- campo: model
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: Whisper model name (tiny, base, small, medium, large)
  default: medium

- campo: language
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: Language code (pt, en, auto)
  default: pt

**Saida:**
- campo: chunks_dir
  tipo: path
  descricao: Directory with chunked text files and manifest.json
- campo: transcription_clean_md
  tipo: path
  descricao: Clean markdown transcription for KB ingestion
- campo: metadata_json
  tipo: path
  descricao: Video metadata (title, channel, duration)
```

---

## Steps

### Step 1: Run Video-Transcriber Pipeline

Execute the full video-transcriber pipeline on the source:

```bash
video-transcriber process <source> -o <output_dir> -m <model> -l <language>
```

This produces:
- `transcription.json` (raw)
- `transcription_clean.json` (cleaned)
- `transcription_clean.md` (markdown)
- `chunks/` directory with `chunk-001.txt`, `chunk-002.txt`, etc.
- `chunks/manifest.json` (chunk metadata)
- `metadata.json` (video metadata)
- `stats.json` (cleaning statistics)

### Step 2: Validate Output for KB-Builder

Verify the output is compatible with knowledge-base-builder:

1. **Chunks exist**: `chunks/manifest.json` has at least 1 entry
2. **Markdown exists**: `transcription_clean.md` is non-empty
3. **Metadata exists**: `metadata.json` contains title and source URL

### Step 3: Prepare KB-Builder Input

The knowledge-base-builder squad expects source materials in one of these formats:
- **Markdown files** (.md) — use `transcription_clean.md`
- **Text files** (.txt) — use individual chunk files from `chunks/`

Copy or symlink the relevant files to the KB-builder's input directory.

### Step 4: Invoke KB-Builder

Hand off to knowledge-base-builder squad:

```
/knowledge-base-builder:tasks:task-parse-documents
```

With the `transcription_clean.md` as input document.

---

## Output Format

The output directory structure after this task:

```
<output_dir>/
├── metadata.json            # Video metadata
├── transcription.json       # Raw transcription
├── transcription_clean.json # Cleaned transcription
├── transcription_clean.md   # Clean markdown (KB-ready)
├── stats.json               # Cleaning stats
└── chunks/
    ├── manifest.json         # Chunk index
    ├── chunk-001.txt         # Text chunks
    ├── chunk-002.txt
    └── ...
```

---

## Integration Points

| Squad | Receives | Format |
|-------|----------|--------|
| knowledge-base-builder | `transcription_clean.md` | Markdown document |
| knowledge-base-builder | `chunks/*.txt` | Individual text files |

## Dependencies

- `video-transcriber` CLI installed (`pip install video-transcriber`)
- `ffmpeg` for audio extraction (if video input)
- `yt-dlp` for YouTube downloads
- Whisper engine: mlx-whisper, faster-whisper, or openai-whisper
