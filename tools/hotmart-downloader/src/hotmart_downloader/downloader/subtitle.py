"""Subtitle downloader for .srt/.vtt files."""

from __future__ import annotations

import logging
from pathlib import Path

from hotmart_downloader.downloader.base import BaseDownloader
from hotmart_downloader.filesystem import file_exists_and_valid, sanitize_filename
from hotmart_downloader.http_client import HttpClient
from hotmart_downloader.models import SubtitleTrack

logger = logging.getLogger(__name__)


class SubtitleDownloader(BaseDownloader):
    """Downloads subtitle files (.srt, .vtt) via HTTP."""

    def __init__(self, client: HttpClient) -> None:
        super().__init__(client)

    def can_handle(self, url: str) -> bool:
        """Check if URL points to a subtitle file."""
        lower = url.lower().split("?")[0]
        return lower.endswith((".srt", ".vtt", ".webvtt"))

    def download(self, url: str, dest: Path, **kwargs: object) -> Path:
        """Download a subtitle file.

        Args:
            url: URL of the subtitle file
            dest: Directory to save the file in
            **kwargs: Optional 'filename', 'language', 'format'
        """
        filename = sanitize_filename(str(kwargs.get("filename", "subtitle")))
        language = str(kwargs.get("language", ""))
        fmt = str(kwargs.get("format", "srt"))

        # Build filename: video_name.lang.ext
        if language:
            output = dest / f"{filename}.{language}.{fmt}"
        else:
            output = dest / f"{filename}.{fmt}"

        if file_exists_and_valid(output):
            logger.info("Skipping (exists): %s", output.name)
            return output

        self.client.download_file(url, str(output))
        logger.info("Downloaded subtitle: %s", output.name)
        return output

    def download_track(
        self, track: SubtitleTrack, dest: Path, video_name: str = "video"
    ) -> Path:
        """Convenience wrapper to download a SubtitleTrack.

        Args:
            track: The SubtitleTrack to download
            dest: Directory to save the file in
            video_name: Base name of the associated video
        """
        fmt = track.format or "srt"
        return self.download(
            track.url,
            dest,
            filename=video_name,
            language=track.language,
            format=fmt,
        )
