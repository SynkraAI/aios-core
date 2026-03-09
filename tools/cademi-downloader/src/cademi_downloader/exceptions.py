"""Exception hierarchy for Cademi Downloader."""


class CademiDownloaderError(Exception):
    """Base exception for all downloader errors."""


class AuthenticationError(CademiDownloaderError):
    """Failed to authenticate with Cademi."""


class ConfigError(CademiDownloaderError):
    """Missing or invalid configuration."""


class ScraperError(CademiDownloaderError):
    """Failed to scrape content from Cademi pages."""

    def __init__(self, message: str, url: str = "") -> None:
        self.url = url
        super().__init__(message)


class DownloadError(CademiDownloaderError):
    """Failed to download content."""


class ParserError(CademiDownloaderError):
    """Failed to parse content."""
