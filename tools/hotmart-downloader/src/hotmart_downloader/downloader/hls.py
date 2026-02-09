"""HLS downloader for Hotmart native videos (m3u8 + ffmpeg)."""

from __future__ import annotations

import logging
import shutil
import subprocess
import tempfile
from pathlib import Path

import m3u8

from hotmart_downloader.downloader.base import BaseDownloader
from hotmart_downloader.exceptions import DownloadError, FFmpegError
from hotmart_downloader.filesystem import file_exists_and_valid, sanitize_filename
from hotmart_downloader.http_client import HttpClient
from hotmart_downloader.models import SubtitleTrack

logger = logging.getLogger(__name__)


class HlsDownloader(BaseDownloader):
    """Downloads Hotmart native HLS videos (m3u8 + ffmpeg concat)."""

    def __init__(self, client: HttpClient) -> None:
        super().__init__(client)

    def can_handle(self, url: str) -> bool:
        """Check if URL is an m3u8 playlist."""
        return ".m3u8" in url.lower()

    def download(self, url: str, dest: Path, **kwargs: object) -> Path:
        """Download an HLS stream and convert to MP4.

        Flow:
        1. Parse master playlist → select quality
        2. Parse quality playlist → get segments + key URL
        3. Download encryption key + all .ts segments
        4. Concat with ffmpeg → output.mp4
        5. Cleanup temp files

        Args:
            url: URL of the master m3u8 playlist
            dest: Directory to save the video in
            **kwargs: Optional 'filename', 'quality'
        """
        filename = sanitize_filename(str(kwargs.get("filename", "video")))
        quality = str(kwargs.get("quality", "best"))
        output = dest / f"{filename}.mp4"

        if file_exists_and_valid(output, min_size=1024):
            logger.info("Skipping (exists): %s", output.name)
            return output

        tmpdir = None
        try:
            tmpdir = Path(tempfile.mkdtemp(prefix="hotmart_hls_"))

            # Step 1: Parse master playlist and select quality
            quality_url = self._select_quality(url, quality)

            # Step 2: Parse quality playlist
            quality_playlist = self._parse_playlist(quality_url)

            # Step 3: Download encryption key if present
            key_file = None
            if quality_playlist.keys and quality_playlist.keys[0]:
                key = quality_playlist.keys[0]
                if key.uri:
                    key_file = tmpdir / "key.bin"
                    self.client.download_file(key.uri, str(key_file))
                    logger.debug("Downloaded encryption key")

            # Step 4: Download all segments
            segment_files = self._download_segments(
                quality_playlist, quality_url, tmpdir
            )

            # Step 5: Concat with ffmpeg
            self._ffmpeg_concat(segment_files, key_file, output)

            logger.info("Downloaded HLS video: %s", output.name)
            return output

        except (DownloadError, FFmpegError):
            # Clean up partial output
            if output.exists():
                output.unlink()
            raise

        except Exception as e:
            if output.exists():
                output.unlink()
            raise DownloadError(f"HLS download failed: {e}") from e

        finally:
            if tmpdir and tmpdir.exists():
                shutil.rmtree(tmpdir, ignore_errors=True)

    def _select_quality(self, master_url: str, quality: str) -> str:
        """Parse master playlist and select the best matching quality."""
        playlist = self._parse_playlist(master_url)

        # If it's not a master playlist (no variants), use it directly
        if not playlist.playlists:
            return master_url

        # Sort by bandwidth (resolution)
        variants = sorted(
            playlist.playlists,
            key=lambda p: p.stream_info.bandwidth if p.stream_info else 0,
            reverse=True,
        )

        if quality == "best":
            selected = variants[0]
        else:
            # Try to match requested resolution
            target_height = int(quality.replace("p", ""))
            selected = variants[0]  # fallback to best
            for variant in variants:
                resolution = variant.stream_info.resolution if variant.stream_info else None
                if resolution and resolution[1] <= target_height:
                    selected = variant
                    break

        # Build absolute URL
        selected_url = selected.absolute_uri
        if not selected_url.startswith("http"):
            base = master_url.rsplit("/", 1)[0]
            selected_url = f"{base}/{selected.uri}"

        logger.debug("Selected quality: %s", selected_url)
        return selected_url

    def _parse_playlist(self, url: str) -> m3u8.M3U8:
        """Download and parse an m3u8 playlist."""
        try:
            response = self.client.get(url)
            return m3u8.loads(response.text, uri=url)
        except Exception as e:
            raise DownloadError(f"Failed to parse playlist {url}: {e}") from e

    def _download_segments(
        self,
        playlist: m3u8.M3U8,
        playlist_url: str,
        tmpdir: Path,
    ) -> list[Path]:
        """Download all .ts segments from a quality playlist."""
        base_url = playlist_url.rsplit("/", 1)[0]
        segment_files: list[Path] = []

        for i, segment in enumerate(playlist.segments):
            seg_url = segment.absolute_uri
            if not seg_url.startswith("http"):
                seg_url = f"{base_url}/{segment.uri}"

            seg_file = tmpdir / f"segment_{i:05d}.ts"

            try:
                self.client.download_file(seg_url, str(seg_file))
                segment_files.append(seg_file)
            except Exception as e:
                raise DownloadError(
                    f"Failed to download segment {i}: {e}"
                ) from e

        logger.debug("Downloaded %d segments", len(segment_files))
        return segment_files

    def _ffmpeg_concat(
        self,
        segments: list[Path],
        key_file: Path | None,
        output: Path,
    ) -> None:
        """Concatenate .ts segments into a single MP4 using ffmpeg."""
        if not segments:
            raise DownloadError("No segments to concatenate")

        # Create concat file list
        concat_file = segments[0].parent / "concat.txt"
        with open(concat_file, "w") as f:
            for seg in segments:
                f.write(f"file '{seg}'\n")

        cmd = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_file),
            "-c", "copy",
            "-movflags", "+faststart",
            str(output),
        ]

        logger.debug("Running ffmpeg concat: %d segments -> %s", len(segments), output.name)

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
            )
        except FileNotFoundError as e:
            raise FFmpegError(
                "ffmpeg not found. Install it: brew install ffmpeg"
            ) from e
        except subprocess.TimeoutExpired as e:
            raise FFmpegError("ffmpeg timed out during concatenation") from e

        if result.returncode != 0:
            raise FFmpegError(f"ffmpeg failed: {result.stderr.strip()}")

    def extract_subtitle_tracks(self, master_url: str) -> list[SubtitleTrack]:
        """Extract subtitle tracks from an HLS master playlist.

        Parses #EXT-X-MEDIA TYPE=SUBTITLES entries from the master playlist.
        """
        try:
            playlist = self._parse_playlist(master_url)
        except DownloadError:
            return []

        tracks: list[SubtitleTrack] = []
        for media in getattr(playlist, "media", []):
            if media.type == "SUBTITLES" and media.uri:
                # Build absolute URL
                sub_url = media.uri
                if not sub_url.startswith("http"):
                    base = master_url.rsplit("/", 1)[0]
                    sub_url = f"{base}/{media.uri}"

                tracks.append(SubtitleTrack(
                    url=sub_url,
                    language=media.language or "",
                    label=media.name or "",
                    format="vtt",  # HLS subtitles are typically WebVTT
                ))
                logger.debug("Found HLS subtitle track: %s (%s)", media.name, media.language)

        return tracks

    def download_audio_only(self, url: str, dest: Path, **kwargs: object) -> Path:
        """Extract audio-only from an HLS stream using ffmpeg.

        Uses ffmpeg directly with the m3u8 URL for efficiency.

        Args:
            url: URL of the master m3u8 playlist
            dest: Directory to save the audio in
            **kwargs: Optional 'filename'
        """
        filename = sanitize_filename(str(kwargs.get("filename", "audio")))
        output = dest / f"{filename}.m4a"

        if file_exists_and_valid(output, min_size=1024):
            logger.info("Skipping (exists): %s", output.name)
            return output

        cmd = [
            "ffmpeg", "-y",
            "-i", url,
            "-vn",
            "-acodec", "aac",
            "-b:a", "192k",
            str(output),
        ]

        logger.info("Extracting audio from HLS: %s", url)

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600,
            )
        except FileNotFoundError as e:
            raise FFmpegError(
                "ffmpeg not found. Install it: brew install ffmpeg"
            ) from e
        except subprocess.TimeoutExpired as e:
            raise FFmpegError("ffmpeg timed out during audio extraction") from e

        if result.returncode != 0:
            # Clean up partial output
            if output.exists():
                output.unlink()
            raise FFmpegError(f"ffmpeg audio extraction failed: {result.stderr.strip()}")

        logger.info("Extracted audio: %s", output.name)
        return output
