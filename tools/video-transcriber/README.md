# video-transcriber

CLI tool that downloads, transcribes, cleans, chunks, and **batch-processes** video/audio content. Includes Whisper hallucination loop cleaning and optional HTML dashboard.

**Version:** 1.1.0

## Install

```bash
pip install -e tools/video-transcriber/
```

For transcription support (Apple Silicon):
```bash
pip3 install mlx-whisper
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
video-transcriber process "https://youtube.com/watch?v=xxx" --output /tmp/vt-result/
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

### Download only

```bash
video-transcriber download "https://youtube.com/watch?v=xxx" --output /tmp/
```

### Transcribe local file

```bash
video-transcriber transcribe /path/to/audio.wav --model medium --language pt
```

### Clean existing transcription

```bash
video-transcriber clean /path/to/transcription.json
```

### Batch transcribe a directory

```bash
# Scan and list pending videos
vt batch ~/Dropbox/Cursos/MeuCurso --dry-run

# Transcribe all videos with dashboard
vt batch ~/Dropbox/Cursos/MeuCurso --dashboard

# Custom model and language
vt batch ~/Dropbox/Cursos/MeuCurso --model turbo --language pt --dashboard
```

Output per video: `{video-stem}-transcricao.md` alongside the original file.

Features:
- Recursive directory scan
- Automatic resume (skips videos with existing `-transcricao.md`)
- Whisper hallucination loop cleaning via `clean_segments()`
- Atomic status JSON writes (`batch-status.json`)
- Graceful Ctrl+C (re-run to resume)
- Optional HTML dashboard (`--dashboard`)

## Options

### Single-file commands

| Flag | Default | Description |
|------|---------|-------------|
| `--model` | `medium` | Whisper model: tiny, base, small, medium, large, turbo |
| `--language` | `pt` | Language code (pt, en, auto) |
| `--output` | `/tmp/vt-<hash>/` | Output directory |
| `--max-words` | `2000` | Max words per chunk |

### Batch command

| Flag | Default | Description |
|------|---------|-------------|
| `--model` | `turbo` | Whisper model |
| `--language` | `pt` | Language code |
| `--output-dir` | alongside video | Centralized output directory |
| `--dashboard` | off | Start HTML dashboard |
| `--port` | `8765` | Dashboard server port |
| `--chunk` | off | Generate chunks per video |
| `--max-words` | `2000` | Max words per chunk |
| `--dry-run` | off | List videos without processing |

## Deprecated Scripts

The following standalone scripts in `tools/` are **deprecated**. Use `vt batch` instead.

| Script | Replacement |
|--------|-------------|
| `batch-transcribe.py` | `vt batch <dir> --model turbo --language pt` |
| `transcription-status-generator.py` | Status JSON generated automatically by `vt batch` |
| `transcription-dashboard.html` | `vt batch --dashboard` |
