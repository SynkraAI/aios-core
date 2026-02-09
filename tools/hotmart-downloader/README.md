# Hotmart Downloader

CLI tool to download courses from Hotmart, including videos, subtitles, attachments, and text content.

## Features

- **Video download** via HLS (ffmpeg) with quality selection
- **External video support** (Vimeo, YouTube, Wistia) via yt-dlp
- **Akamai CDN** token handling (hdnts/hdntl)
- **Subtitles** from multiple sources (API, HLS manifest, yt-dlp)
- **Audio-only extraction** (`.m4a`)
- **Attachments** (PDF, DOCX, ZIP, etc.)
- **Automatic authentication** via Playwright browser + token caching
- **Rich CLI** with progress bars and colored output

## Requirements

- Python 3.10+
- [ffmpeg](https://ffmpeg.org/) installed and available in PATH
- [Playwright](https://playwright.dev/python/) with Chromium

## Installation

```bash
cd tools/hotmart-downloader

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install package
pip install -e .

# Install Playwright browser
playwright install chromium
```

## Configuration

Copy the example `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
# Required
HOTMART_EMAIL=your-email@example.com
HOTMART_PASSWORD=your-password

# Optional
HOTMART_OUTPUT_DIR=downloads     # Default: downloads
HOTMART_QUALITY=best             # best | 1080p | 720p | 480p | 360p
HOTMART_MAX_RETRIES=3            # Default: 3
HOTMART_TIMEOUT=30               # Default: 30 (seconds)
```

## Usage

```bash
# Verify authentication
hotmart-dl auth-check

# List your courses
hotmart-dl courses

# Show course structure
hotmart-dl info <subdomain>

# Download a course (interactive selection)
hotmart-dl download

# Download with options
hotmart-dl download -c <subdomain> -q 720p --subtitles

# Download specific module
hotmart-dl download -c <subdomain> -m 3

# Audio only
hotmart-dl download -c <subdomain> -a

# Preview without downloading
hotmart-dl download -c <subdomain> --dry-run

# Enable debug logging
hotmart-dl download -c <subdomain> --debug
```

## Output Structure

```
downloads/
└── Course Name/
    ├── 01 - Module Name/
    │   ├── 01 - Lesson Name/
    │   │   ├── video.mp4
    │   │   ├── video.pt-BR.vtt
    │   │   ├── description.txt
    │   │   └── attachment.pdf
    │   └── 02 - Lesson Name/
    │       └── ...
    └── 02 - Module Name/
        └── ...
```

## Architecture

```
src/hotmart_downloader/
├── cli.py              # Typer CLI commands
├── api.py              # Hotmart Club API client
├── auth.py             # SSO authentication (Playwright)
├── config.py           # Settings from .env
├── models.py           # Data models (Course, Module, Lesson)
├── parser.py           # HTML/API response parser
├── video_resolver.py   # Browser-based m3u8 URL capture
├── http_client.py      # HTTP requests wrapper
├── filesystem.py       # Path/file utilities
├── console.py          # Rich UI output
├── exceptions.py       # Custom exceptions
├── logging_config.py   # Logger setup
└── downloader/
    ├── base.py         # BaseDownloader (abstract)
    ├── hls.py          # HLS/m3u8 + ffmpeg
    ├── ytdlp.py        # yt-dlp for external videos
    ├── attachment.py   # File downloads (PDF, etc.)
    ├── subtitle.py     # Subtitle track handler
    └── text.py         # HTML/text content
```

## Authentication Flow

1. Checks for cached token in `.hotmart-token-cache.json`
2. If expired or missing, opens Playwright browser for Hotmart SSO login
3. User solves CAPTCHA if required
4. JWT token is extracted from network traffic and cached

## Development

```bash
# Run tests
pytest

# Run with coverage
pytest --cov

# Lint
ruff check src/

# Type check
mypy src/
```

## Known Limitations

- `hdnts` token expires in ~500s; long courses may need re-authentication
- No resume support for partial downloads
- Browser stays open during entire download session for embed video resolution
