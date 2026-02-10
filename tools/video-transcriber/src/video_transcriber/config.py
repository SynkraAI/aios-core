"""Configuration and default settings for video-transcriber."""

from pathlib import Path

# Output paths
YOUTUBE_OUTPUT = Path.home() / "Dropbox" / "Downloads" / "YT"
COURSES_OUTPUT = Path.home() / "Dropbox" / "Downloads" / "Cursos"

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
