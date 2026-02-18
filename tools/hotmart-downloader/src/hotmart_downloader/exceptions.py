"""Exception hierarchy for Hotmart Downloader."""


class HotmartDownloaderError(Exception):
    """Base exception for all downloader errors."""


class AuthenticationError(HotmartDownloaderError):
    """Failed to authenticate with Hotmart API."""


class ConfigError(HotmartDownloaderError):
    """Missing or invalid configuration."""


class APIError(HotmartDownloaderError):
    """Hotmart API returned an error."""

    def __init__(self, message: str, status_code: int | None = None) -> None:
        self.status_code = status_code
        super().__init__(message)


class DownloadError(HotmartDownloaderError):
    """Failed to download content."""


class FFmpegError(DownloadError):
    """FFmpeg processing failed."""


class ParserError(HotmartDownloaderError):
    """Failed to parse content."""
