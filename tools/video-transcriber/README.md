# video-transcriber

CLI tool that downloads, transcribes, cleans, and chunks video/audio content. Designed to work with AIOS squads (knowledge-base-builder, mind-cloning, content-engine).

## Install

```bash
pip install -e tools/video-transcriber/
```

For transcription support (Apple Silicon — recommended):
```bash
pip3 install mlx-whisper
```

Fallback (CTranslate2 — ~4x faster than openai-whisper):
```bash
pip install faster-whisper
```

Fallback (CPU):
```bash
pip install openai-whisper
```

System dependencies:
```bash
brew install ffmpeg yt-dlp
pip3 install gdown  # for Google Drive
```

## Usage

### Full pipeline

```bash
video-transcriber process "https://youtube.com/watch?v=xxx" -o /tmp/vt-result/
```

Output:
```
/tmp/vt-result/
├── metadata.json              # title, url, duration, channel
├── transcription.json         # Whisper raw output
├── transcription_clean.json   # Cleaned (no loops, merged)
├── transcription_clean.md     # Markdown with timestamps
├── stats.json                 # Cleaning statistics
└── chunks/
    ├── chunk-001.txt          # ~2000 words each
    ├── chunk-002.txt
    └── manifest.json          # Chunk metadata
```

### Batch playlist

Process all videos in a YouTube playlist:

```bash
video-transcriber batch-playlist "https://youtube.com/playlist?list=xxx" -o /tmp/vt-playlist/
```

Generates per-video output + consolidated `batch-index.json`.

### Download only

```bash
video-transcriber download "https://youtube.com/watch?v=xxx" -o /tmp/
```

### Transcribe local file

```bash
video-transcriber transcribe /path/to/audio.wav -m medium -l pt
```

### Clean existing transcription

```bash
video-transcriber clean /path/to/transcription.json
```

### Chunk transcription

```bash
video-transcriber chunk /path/to/transcription.json --max-words 2000
```

### Ingest text files

Parse VTT, SRT, TXT, MD, or JSON files and produce chunks:

```bash
video-transcriber ingest /path/to/subtitles.vtt -o /tmp/vt-output/
```

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `-m, --model` | `medium` | Whisper model: tiny, base, small, medium, large |
| `-l, --language` | `pt` | Language code (pt, en, auto) |
| `-o, --output` | `/tmp/vt-<hash>/` | Output directory |
| `--max-words` | `2000` | Max words per chunk |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VT_YOUTUBE_OUTPUT` | Default output dir for YouTube downloads |
| `VT_COURSES_OUTPUT` | Default output dir for course downloads |
| `VT_LOG_FILE` | Path to log file (enables file logging) |
| `VT_LOG_LEVEL` | Log level: DEBUG, INFO, WARNING, ERROR (default: INFO) |

## Whisper Engine Fallback

The transcriber automatically selects the best available engine:

1. **mlx-whisper** — Apple Silicon native (fastest on M1/M2/M3)
2. **faster-whisper** — CTranslate2 backend (~4x faster than openai-whisper)
3. **openai-whisper** — Original implementation (CPU fallback)

## AIOS Integration

Task definitions for squad integration:

| Task | Squad | Description |
|------|-------|-------------|
| `video-to-kb` | knowledge-base-builder | Transcribe + chunk for KB ingestion |
| `video-to-clone` | mind-cloning | Transcribe + prepare source material for cloning |

## Development

```bash
# Install with dev dependencies
pip install -e "tools/video-transcriber[dev]"

# Run tests
pytest tools/video-transcriber/tests/

# Run with coverage
pytest tools/video-transcriber/tests/ --cov=video_transcriber --cov-report=term-missing

# Lint
ruff check tools/video-transcriber/src/
ruff format --check tools/video-transcriber/src/
```
