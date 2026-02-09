"""Text/description downloader - saves lesson descriptions and links."""

from __future__ import annotations

import logging
from pathlib import Path

from hotmart_downloader.downloader.base import BaseDownloader
from hotmart_downloader.http_client import HttpClient

logger = logging.getLogger(__name__)


class TextDownloader(BaseDownloader):
    """Saves text descriptions and link lists to files."""

    def __init__(self, client: HttpClient) -> None:
        super().__init__(client)

    def can_handle(self, url: str) -> bool:
        """Text downloader handles all text content."""
        return True

    def download(self, url: str, dest: Path, **kwargs: object) -> Path:
        """Not used for text - use save_description/save_links instead."""
        return dest

    def save_description(self, text: str, dest_dir: Path) -> Path | None:
        """Save lesson description to a text file."""
        if not text.strip():
            return None

        output = dest_dir / "description.txt"
        output.write_text(text, encoding="utf-8")
        logger.debug("Saved description to %s", output)
        return output

    def save_links(self, links: list[str], dest_dir: Path) -> Path | None:
        """Save extracted links to a text file."""
        if not links:
            return None

        output = dest_dir / "links.txt"
        content = "\n".join(links)
        output.write_text(content, encoding="utf-8")
        logger.debug("Saved %d links to %s", len(links), output)
        return output
