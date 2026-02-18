"""Video downloader using yt-dlp for external sources (Vimeo, YouTube, Wistia)."""

from __future__ import annotations

import logging
import re
import subprocess
from pathlib import Path

from hotmart_downloader.downloader.base import BaseDownloader
from hotmart_downloader.exceptions import DownloadError
from hotmart_downloader.filesystem import file_exists_and_valid, sanitize_filename
from hotmart_downloader.http_client import HttpClient

logger = logging.getLogger(__name__)

EXTERNAL_VIDEO_PATTERNS = [
    re.compile(r"vimeo\.com"),
    re.compile(r"youtube\.com|youtu\.be"),
    re.compile(r"wistia\.(?:com|net)"),
]


class YtdlpDownloader(BaseDownloader):
    """Downloads videos via yt-dlp (Vimeo, YouTube, Wistia, etc)."""

    def __init__(self, client: HttpClient) -> None:
        super().__init__(client)

    def can_handle(self, url: str) -> bool:
        """Check if URL is from a supported external video platform."""
        return any(pattern.search(url) for pattern in EXTERNAL_VIDEO_PATTERNS)

    def download(self, url: str, dest: Path, **kwargs: object) -> Path:
        """Download a video using yt-dlp.

        Args:
            url: Video URL (Vimeo, YouTube, Wistia, etc)
            dest: Directory to save the video in
            **kwargs: Optional 'filename', 'quality', 'audio_only', 'download_subs'
        """
        filename = sanitize_filename(str(kwargs.get("filename", "video")))
        quality = str(kwargs.get("quality", "best"))
        audio_only = bool(kwargs.get("audio_only", False))
        download_subs = bool(kwargs.get("download_subs", False))
        output_template = str(dest / f"{filename}.%(ext)s")

        # Check if already downloaded (any video/audio extension)
        check_exts = (".m4a", ".opus", ".mp3") if audio_only else (".mp4", ".mkv", ".webm")
        for ext in check_exts:
            candidate = dest / f"{filename}{ext}"
            if file_exists_and_valid(candidate):
                logger.info("Skipping (exists): %s", candidate.name)
                return candidate

        # Build yt-dlp command
        cmd = [
            "yt-dlp",
            "--no-warnings",
            "--no-playlist",
            "-o", output_template,
        ]

        if audio_only:
            cmd.extend(["-x", "--audio-format", "m4a"])
        else:
            # Map quality preference to yt-dlp format
            format_str = _quality_to_format(quality)
            if format_str:
                cmd.extend(["-f", format_str])

        if download_subs:
            cmd.extend([
                "--write-subs", "--write-auto-subs",
                "--sub-langs", "all",
                "--convert-subs", "srt",
            ])

        # Add referer for Vimeo embeds
        if "vimeo.com" in url:
            cmd.extend(["--referer", url])

        cmd.append(url)

        logger.info("Downloading with yt-dlp: %s", url)

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600,  # 10 minute timeout
            )
        except FileNotFoundError as e:
            raise DownloadError(
                "yt-dlp not found. Install it: pip install yt-dlp"
            ) from e
        except subprocess.TimeoutExpired as e:
            raise DownloadError(f"yt-dlp timed out downloading: {url}") from e

        if result.returncode != 0:
            raise DownloadError(f"yt-dlp failed: {result.stderr.strip()}")

        # Find the downloaded file
        search_exts = (".m4a", ".opus", ".mp3") if audio_only else (".mp4", ".mkv", ".webm", ".m4a")
        for ext in search_exts:
            candidate = dest / f"{filename}{ext}"
            if candidate.exists():
                logger.info("Downloaded: %s", candidate.name)
                return candidate

        raise DownloadError(f"yt-dlp completed but output file not found for: {url}")

    def download_subtitles_only(self, url: str, dest: Path, **kwargs: object) -> list[Path]:
        """Download only subtitles (no video) using yt-dlp.

        Args:
            url: Video URL
            dest: Directory to save subtitles in
            **kwargs: Optional 'filename'

        Returns:
            List of downloaded subtitle file paths.
        """
        filename = sanitize_filename(str(kwargs.get("filename", "video")))
        output_template = str(dest / f"{filename}.%(ext)s")

        cmd = [
            "yt-dlp",
            "--no-warnings",
            "--no-playlist",
            "--skip-download",
            "--write-subs", "--write-auto-subs",
            "--sub-langs", "all",
            "--convert-subs", "srt",
            "-o", output_template,
        ]

        # Add referer for Vimeo embeds
        if "vimeo.com" in url:
            cmd.extend(["--referer", url])

        cmd.append(url)

        logger.info("Downloading subtitles with yt-dlp: %s", url)

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,
            )
        except FileNotFoundError:
            logger.debug("yt-dlp not found, skipping subtitle download")
            return []
        except subprocess.TimeoutExpired:
            logger.debug("yt-dlp subtitle download timed out")
            return []

        if result.returncode != 0:
            logger.debug("yt-dlp subtitle download failed: %s", result.stderr.strip())
            return []

        # Find downloaded subtitle files
        found: list[Path] = []
        for path in dest.iterdir():
            if path.stem.startswith(filename) and path.suffix in (".srt", ".vtt"):
                found.append(path)
                logger.info("Downloaded subtitle: %s", path.name)

        return found


def _quality_to_format(quality: str) -> str:
    """Convert quality preference to yt-dlp format string."""
    quality_map = {
        "best": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "1080p": "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]/best",
        "720p": "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]/best",
        "480p": "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]/best",
        "360p": "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360]/best",
    }
    return quality_map.get(quality, "")
