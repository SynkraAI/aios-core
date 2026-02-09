"""Abstract base class for all downloaders."""

from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

from hotmart_downloader.http_client import HttpClient


class BaseDownloader(ABC):
    """Abstract base for content downloaders."""

    def __init__(self, client: HttpClient) -> None:
        self.client = client

    @abstractmethod
    def download(self, url: str, dest: Path, **kwargs: object) -> Path:
        """Download content from url to dest. Returns the output path."""

    @abstractmethod
    def can_handle(self, url: str) -> bool:
        """Check if this downloader can handle the given URL."""
