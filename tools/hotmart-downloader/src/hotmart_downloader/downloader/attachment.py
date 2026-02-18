"""Attachment downloader for PDFs and other files."""

from __future__ import annotations

import logging
from pathlib import Path

from hotmart_downloader.downloader.base import BaseDownloader
from hotmart_downloader.exceptions import DownloadError
from hotmart_downloader.filesystem import (
    file_exists_and_valid,
    get_safe_extension,
    sanitize_filename,
)
from hotmart_downloader.http_client import HttpClient

logger = logging.getLogger(__name__)


class AttachmentDownloader(BaseDownloader):
    """Downloads file attachments (PDFs, docs, etc)."""

    def __init__(self, client: HttpClient) -> None:
        super().__init__(client)

    def can_handle(self, url: str) -> bool:
        """Attachment downloader handles any direct file URL."""
        return True

    def download(self, url: str, dest: Path, **kwargs: object) -> Path:
        """Download an attachment file.

        Args:
            url: URL of the file to download
            dest: Directory to save the file in
            **kwargs: Optional 'filename' for the output file name
        """
        filename = str(kwargs.get("filename", "attachment"))
        filename = sanitize_filename(filename)

        # Add extension if missing
        ext = get_safe_extension(url)
        if ext and not filename.lower().endswith(ext):
            filename = f"{filename}{ext}"

        output = dest / filename

        if file_exists_and_valid(output):
            logger.info("Skipping (exists): %s", output.name)
            return output

        try:
            size = self.client.download_file(url, str(output))
            logger.info("Downloaded attachment: %s (%d bytes)", output.name, size)
        except Exception as e:
            # Clean up partial download
            if output.exists():
                output.unlink()
            raise DownloadError(f"Failed to download {filename}: {e}") from e

        return output
