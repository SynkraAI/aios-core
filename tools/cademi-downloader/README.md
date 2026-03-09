# Cademi Downloader

Download courses from Cademi platforms via browser automation (Playwright) + yt-dlp.

## Prerequisites

- Python 3.10+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (for video downloads)
- [ffmpeg](https://ffmpeg.org/) (for HLS/audio processing)

## Installation

```bash
cd tools/cademi-downloader
pip install -e .
playwright install chromium
```

## Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `CADEMI_EMAIL` | Your Cademi login email |
| `CADEMI_PASSWORD` | Your Cademi password |
| `CADEMI_BASE_URL` | Platform URL (e.g., `https://renanvieira.cademi.com.br`) |

Optional variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `CADEMI_OUTPUT_DIR` | `downloads` | Where to save downloaded content |
| `CADEMI_QUALITY` | `best` | Video quality: best, 1080p, 720p, 480p, 360p |

## Usage

### Check authentication

```bash
cademi-dl auth-check
```

### List courses

```bash
cademi-dl courses
```

### Show course structure

```bash
cademi-dl info "https://renanvieira.cademi.com.br/area/curso/..."
```

### Download a course

```bash
# Interactive (prompts for course and content selection)
cademi-dl download

# Specific course
cademi-dl download -c "https://renanvieira.cademi.com.br/area/curso/..."

# Only module 3
cademi-dl download -c "URL" -m 3

# Preview without downloading
cademi-dl download -c "URL" --dry-run

# With debug logs
cademi-dl download -c "URL" --debug
```

### Download flow

1. Authenticate (uses cached cookies when available)
2. Select course (interactive or via `-c` flag)
3. **Always asks**: What to download (videos/materials/transcriptions/all/custom)
4. Scrape course structure
5. Download selected content

## Output structure

```
downloads/
└── Course Name/
    ├── 01 - Module Name/
    │   ├── 01 - Lesson Name/
    │   │   ├── video.mp4
    │   │   ├── video.pt-BR.srt
    │   │   ├── description.txt
    │   │   └── material.pdf
    │   └── 02 - Another Lesson/
    │       └── ...
    └── 02 - Another Module/
        └── ...
```

## How it works

- **No API**: Cademi has no public API, so everything uses Playwright browser automation
- **Cookie caching**: Session cookies are cached in `.cademi-session-cache.json` (12h TTL)
- **yt-dlp**: Universal video engine that handles Vimeo, YouTube, Bunny CDN, HLS, and direct MP4
- **Defensive scraping**: Multiple selector strategies with fallbacks and debug screenshots on failure

## Compatibility

Output is compatible with:
- `video-transcriber` (for generating transcriptions)
- `transcript-sculptor` (for processing transcriptions)
