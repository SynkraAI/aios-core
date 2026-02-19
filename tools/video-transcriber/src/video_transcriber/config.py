"""Configuration and default settings for video-transcriber."""

import os
import tempfile
from pathlib import Path

# Output paths — configurable via env vars, XDG fallback
_data_home = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local" / "share"))
_vt_data = _data_home / "video-transcriber"

YOUTUBE_OUTPUT = Path(os.environ.get("VT_YOUTUBE_OUTPUT", _vt_data / "youtube"))
COURSES_OUTPUT = Path(os.environ.get("VT_COURSES_OUTPUT", _vt_data / "courses"))

# Subprocess timeouts (seconds)
TIMEOUT_METADATA = 30
TIMEOUT_DOWNLOAD = 600
TIMEOUT_AUDIO_EXTRACT = 300
TIMEOUT_SUBTITLE = 60
TIMEOUT_GDRIVE = 900

# Retry config
RETRY_MAX_ATTEMPTS = 3
RETRY_DELAY = 2
RETRY_BACKOFF = 2

# Whisper defaults
DEFAULT_MODEL = "medium"
DEFAULT_LANGUAGE = "pt"
WHISPER_MODELS = ("tiny", "base", "small", "medium", "large")

# Chunking
CHUNK_MAX_WORDS = 2000

# Supported formats
AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".flac", ".ogg", ".aac", ".wma", ".opus"}
VIDEO_EXTENSIONS = {".mp4", ".mkv", ".webm", ".avi", ".mov", ".wmv", ".flv", ".m4v"}
MEDIA_EXTENSIONS = AUDIO_EXTENSIONS | VIDEO_EXTENSIONS
TEXT_EXTENSIONS = {".vtt", ".srt", ".txt", ".md", ".json"}
