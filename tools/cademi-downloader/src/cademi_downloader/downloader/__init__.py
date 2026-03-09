"""Downloader registry and factory."""

from __future__ import annotations

from cademi_downloader.downloader.attachment import AttachmentDownloader
from cademi_downloader.downloader.base import BaseDownloader
from cademi_downloader.downloader.subtitle import SubtitleDownloader
from cademi_downloader.downloader.text import TextDownloader
from cademi_downloader.downloader.video import VideoDownloader
from cademi_downloader.http_client import HttpClient


class DownloaderRegistry:
    """Registry that provides access to all content downloaders."""

    def __init__(self, client: HttpClient) -> None:
        self.video = VideoDownloader(client)
        self.attachment = AttachmentDownloader(client)
        self.text = TextDownloader(client)
        self.subtitle = SubtitleDownloader(client)


__all__ = [
    "AttachmentDownloader",
    "BaseDownloader",
    "DownloaderRegistry",
    "SubtitleDownloader",
    "TextDownloader",
    "VideoDownloader",
]
