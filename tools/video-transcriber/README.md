# video-transcriber

CLI tool that downloads, transcribes, cleans, and chunks video/audio content. Designed to work with the `video-media-content-downloader` skill.

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

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--model` | `medium` | Whisper model: tiny, base, small, medium, large |
| `--language` | `pt` | Language code (pt, en, auto) |
| `--output` | `/tmp/vt-<hash>/` | Output directory |
| `--max-words` | `2000` | Max words per chunk |
