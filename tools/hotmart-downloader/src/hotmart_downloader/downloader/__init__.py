"""Downloader registry and factory."""

from __future__ import annotations

from hotmart_downloader.downloader.attachment import AttachmentDownloader
from hotmart_downloader.downloader.base import BaseDownloader
from hotmart_downloader.downloader.hls import HlsDownloader
from hotmart_downloader.downloader.subtitle import SubtitleDownloader
from hotmart_downloader.downloader.text import TextDownloader
from hotmart_downloader.downloader.ytdlp import YtdlpDownloader
from hotmart_downloader.http_client import HttpClient
from hotmart_downloader.models import ContentType


class DownloaderRegistry:
    """Registry that selects the appropriate downloader for content type."""

    def __init__(self, client: HttpClient) -> None:
        self.hls = HlsDownloader(client)
        self.ytdlp = YtdlpDownloader(client)
        self.attachment = AttachmentDownloader(client)
        self.text = TextDownloader(client)
        self.subtitle = SubtitleDownloader(client)

    def get_video_downloader(self, url: str, content_type: ContentType) -> BaseDownloader:
        """Select the right video downloader based on content type and URL."""
        if content_type == ContentType.VIDEO_HLS or self.hls.can_handle(url):
            return self.hls
        if content_type == ContentType.VIDEO_EXTERNAL or self.ytdlp.can_handle(url):
            return self.ytdlp
        # Fallback to yt-dlp for unknown video URLs
        return self.ytdlp


__all__ = [
    "AttachmentDownloader",
    "BaseDownloader",
    "DownloaderRegistry",
    "HlsDownloader",
    "SubtitleDownloader",
    "TextDownloader",
    "YtdlpDownloader",
]
