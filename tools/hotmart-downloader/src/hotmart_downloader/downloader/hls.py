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

        For Akamai CDN URLs (with hdnts/hdntl tokens), uses ffmpeg's native
        HLS demuxer directly — Python HTTP clients mangle the Akamai auth
        tokens during URL normalization, causing 403 errors.

        For other streams: encrypted (AES-128) also uses ffmpeg natively;
        unencrypted downloads segments individually for progress control.

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
            # Akamai CDN URLs must be passed directly to ffmpeg to preserve
            # the exact URL encoding (hdnts/hdntl auth tokens).
            if _is_akamai_url(url):
                logger.info("Akamai CDN detected, using ffmpeg direct")
                self._ffmpeg_hls_direct(url, output)
                logger.info("Downloaded HLS video: %s", output.name)
                return output

            tmpdir = Path(tempfile.mkdtemp(prefix="hotmart_hls_"))

            # Step 1: Parse master playlist and select quality
            quality_url = self._select_quality(url, quality)

            # Step 2: Parse quality playlist to check for encryption
            quality_playlist = self._parse_playlist(quality_url)

            is_encrypted = (
                quality_playlist.keys
                and quality_playlist.keys[0]
                and quality_playlist.keys[0].uri
            )

            if is_encrypted:
                # Encrypted stream: let ffmpeg handle HLS + AES-128 natively
                logger.info("Encrypted HLS detected, using ffmpeg HLS demuxer")
                self._ffmpeg_hls_direct(quality_url, output)
            else:
                # Unencrypted: download segments + concat (better progress control)
                segment_files = self._download_segments(
                    quality_playlist, quality_url, tmpdir
                )
                self._ffmpeg_concat(segment_files, output)

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

    def _ffmpeg_hls_direct(self, hls_url: str, output: Path) -> None:
        """Download an HLS stream directly with ffmpeg's native HLS demuxer.

        This handles encrypted (AES-128) streams automatically, as ffmpeg
        resolves the key URI and decrypts segments internally.

        For Akamai CDN, a Referer header is required (CDN validates origin).
        """
        cmd = [
            "ffmpeg", "-y",
            *_akamai_headers_args(hls_url),
            "-i", hls_url,
            "-c", "copy",
            "-movflags", "+faststart",
            str(output),
        ]

        logger.debug("Running ffmpeg HLS direct: %s -> %s", hls_url, output.name)

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600,  # 10 minute timeout for direct HLS
            )
        except FileNotFoundError as e:
            raise FFmpegError(
                "ffmpeg not found. Install it: brew install ffmpeg"
            ) from e
        except subprocess.TimeoutExpired as e:
            raise FFmpegError("ffmpeg timed out during HLS download") from e

        if result.returncode != 0:
            raise FFmpegError(f"ffmpeg HLS download failed: {result.stderr.strip()}")

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

    def download_subtitle_track(
        self,
        track: SubtitleTrack,
        dest: Path,
        video_name: str = "video",
        master_url: str = "",
    ) -> Path:
        """Download an HLS subtitle track by resolving its m3u8 playlist.

        HLS subtitle URIs point to m3u8 playlists containing multiple WebVTT
        segments. This method parses the playlist, downloads each segment,
        and concatenates them into a single valid VTT file.

        For Akamai CDN URLs, extracts subtitles from the master playlist
        via ffmpeg (direct subtitle URLs return 403 from Akamai).

        Args:
            track: The SubtitleTrack with a URL pointing to a subtitle m3u8.
            dest: Directory to save the subtitle file in.
            video_name: Base name for the output file.
            master_url: Optional master playlist URL for Akamai extraction.

        Returns:
            Path to the downloaded subtitle file.
        """
        from hotmart_downloader.filesystem import sanitize_filename

        name = sanitize_filename(video_name)
        lang_part = f".{track.language}" if track.language else ""
        output = dest / f"{name}{lang_part}.vtt"

        if output.exists() and output.stat().st_size > 0:
            logger.info("Skipping (exists): %s", output.name)
            return output

        url = track.url

        # Akamai CDN: extract subtitles from master playlist via ffmpeg.
        # Direct subtitle URLs return 403 from Akamai CDN, but ffmpeg can
        # access subtitle streams through the master playlist.
        if _is_akamai_url(url) and master_url:
            self._ffmpeg_subtitle_from_master(master_url, output)
            logger.info("Downloaded subtitle (from master): %s", output.name)
            return output

        # If the URL points directly to a .vtt file (not m3u8), download it directly
        lower_url = url.lower().split("?")[0]
        if lower_url.endswith((".vtt", ".webvtt", ".srt")):
            self.client.download_file(url, str(output))
            logger.info("Downloaded subtitle (direct): %s", output.name)
            return output

        # Otherwise, treat as m3u8 playlist and resolve segments
        try:
            subtitle_playlist = self._parse_playlist(url)
        except DownloadError:
            # Fallback: maybe it's a direct VTT file with wrong extension
            self.client.download_file(url, str(output))
            logger.info("Downloaded subtitle (fallback): %s", output.name)
            return output

        # If the playlist has no segments, it might be a direct file
        if not subtitle_playlist.segments:
            self.client.download_file(url, str(output))
            logger.info("Downloaded subtitle (no segments): %s", output.name)
            return output

        # Download and concatenate all VTT segments
        base_url = url.rsplit("/", 1)[0]
        vtt_parts: list[str] = []

        for i, segment in enumerate(subtitle_playlist.segments):
            seg_url = segment.absolute_uri
            if not seg_url.startswith("http"):
                seg_url = f"{base_url}/{segment.uri}"

            try:
                response = self.client.get(seg_url)
                segment_text = response.text
            except Exception as e:
                logger.warning("Failed to download subtitle segment %d: %s", i, e)
                continue

            if i == 0:
                # Keep the first segment as-is (includes WEBVTT header)
                vtt_parts.append(segment_text.strip())
            else:
                # Strip WEBVTT header and NOTE blocks from subsequent segments
                lines = segment_text.strip().splitlines()
                content_lines: list[str] = []
                skip_header = True
                for line in lines:
                    if skip_header:
                        # Skip WEBVTT header, X-TIMESTAMP-MAP, and NOTE lines
                        if (
                            line.startswith("WEBVTT")
                            or line.startswith("X-TIMESTAMP-MAP")
                            or line.startswith("NOTE")
                            or line == ""
                        ):
                            continue
                        skip_header = False
                    content_lines.append(line)
                if content_lines:
                    vtt_parts.append("\n".join(content_lines))

        if not vtt_parts:
            raise DownloadError(f"No subtitle content extracted from: {url}")

        # Write the concatenated VTT file
        with open(output, "w", encoding="utf-8") as f:
            f.write("\n\n".join(vtt_parts) + "\n")

        logger.info(
            "Downloaded HLS subtitle (%d segments): %s",
            len(subtitle_playlist.segments), output.name,
        )
        return output

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
            *_akamai_headers_args(url),
            "-i", url,
            "-vn",
            "-c:a", "copy",
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

    def _ffmpeg_subtitle_from_master(
        self, master_url: str, output: Path, stream_index: int = 0
    ) -> None:
        """Extract subtitles from an HLS master playlist via ffmpeg.

        Akamai CDN blocks direct access to subtitle m3u8 playlists (403),
        but ffmpeg can access them through the master playlist which uses
        the short-lived hdnts token.

        Args:
            master_url: URL of the HLS master playlist (with hdnts token).
            output: Path to save the VTT file.
            stream_index: Subtitle stream index to extract (default: 0).
        """
        cmd = [
            "ffmpeg", "-y",
            *_akamai_headers_args(master_url),
            "-i", master_url,
            "-map", f"0:s:{stream_index}",
            "-c:s", "webvtt",
            str(output),
        ]

        logger.debug(
            "Extracting subtitle stream %d from master: %s",
            stream_index, output.name,
        )

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,
            )
        except FileNotFoundError as e:
            raise FFmpegError(
                "ffmpeg not found. Install it: brew install ffmpeg"
            ) from e
        except subprocess.TimeoutExpired as e:
            raise FFmpegError("ffmpeg timed out during subtitle extraction") from e

        if result.returncode != 0:
            raise FFmpegError(
                f"ffmpeg subtitle extraction failed: {result.stderr.strip()}"
            )


def _is_akamai_url(url: str) -> bool:
    """Check if a URL is an Akamai CDN URL that requires ffmpeg direct download.

    Akamai URLs contain auth tokens (hdnts/hdntl) that get mangled by Python
    HTTP clients during URL normalization (e.g. %7E decoded to ~), causing 403s.
    """
    lower = url.lower()
    return "play.hotmart.com" in lower or "hdnts=" in lower or "hdntl=" in lower


def _akamai_headers_args(url: str) -> list[str]:
    """Return ffmpeg -headers args if the URL is an Akamai CDN URL.

    Akamai CDN validates the Referer header — requests without it get 403.
    """
    if not _is_akamai_url(url):
        return []
    return [
        "-headers",
        "Referer: https://hotmart.com/\r\n",
    ]
