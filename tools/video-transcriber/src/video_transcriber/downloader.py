"""Download wrappers for YouTube (yt-dlp) and Google Drive (gdown)."""

from __future__ import annotations

import json
from pathlib import Path

from rich.console import Console

from .config import (
    TIMEOUT_DOWNLOAD,
    TIMEOUT_GDRIVE,
    TIMEOUT_METADATA,
    TIMEOUT_SUBTITLE,
)
from .models import Metadata
from .utils import retry_on_failure, run_command, validate_url

console = Console(stderr=True)


@retry_on_failure(max_attempts=3, delay=2, backoff=2)
def download_youtube_metadata(url: str) -> Metadata:
    """Extract video metadata without downloading."""
    validate_url(url)

    result = run_command(
        ["yt-dlp", "--dump-json", "--no-download", url],
        timeout=TIMEOUT_METADATA,
    )
    if result.returncode != 0:
        raise RuntimeError(f"yt-dlp metadata failed: {result.stderr}")

    data = json.loads(result.stdout)
    video_id = data.get("id", "")

    return Metadata(
        title=data.get("title", "Unknown"),
        url=url,
        duration=float(data.get("duration", 0)),
        channel=data.get("channel", data.get("uploader", "")),
        thumbnail_url=f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg" if video_id else "",
        description=data.get("description", ""),
    )


@retry_on_failure(max_attempts=3, delay=2, backoff=2)
def download_youtube_audio(url: str, output_dir: Path) -> Path:
    """Download audio from YouTube video using yt-dlp.

    Returns:
        Path to the downloaded audio file.
    """
    validate_url(url)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    console.print("[bold]Downloading audio from YouTube...[/bold]")

    # Use wav output for Whisper compatibility
    output_template = str(output_dir / "%(title)s.%(ext)s")

    result = run_command(
        [
            "yt-dlp", "-x",
            "--audio-format", "wav",
            "--audio-quality", "0",
            "-o", output_template,
            url,
        ],
        timeout=TIMEOUT_DOWNLOAD,
    )
    if result.returncode != 0:
        raise RuntimeError(f"yt-dlp download failed: {result.stderr}")

    # Find the downloaded file
    wav_files = sorted(output_dir.glob("*.wav"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not wav_files:
        raise RuntimeError(f"No WAV file found in {output_dir} after download")

    audio_path = wav_files[0]
    size_mb = audio_path.stat().st_size / (1024 * 1024)
    console.print(f"  [green]Downloaded:[/green] {audio_path.name} ({size_mb:.1f} MB)")
    return audio_path


def download_youtube_subtitles(url: str, output_dir: Path) -> Path | None:
    """Try to download auto-generated subtitles. Returns path or None if unavailable."""
    validate_url(url)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    output_template = str(output_dir / "%(title)s.%(ext)s")

    result = run_command(
        [
            "yt-dlp",
            "--write-auto-sub",
            "--sub-lang", "pt,en",
            "--skip-download",
            "--convert-subs", "srt",
            "-o", output_template,
            url,
        ],
        timeout=TIMEOUT_SUBTITLE,
    )

    if result.returncode != 0:
        return None

    # Look for .srt files
    srt_files = sorted(output_dir.glob("*.srt"), key=lambda p: p.stat().st_mtime, reverse=True)
    if srt_files:
        console.print(f"  [green]Subtitles found:[/green] {srt_files[0].name}")
        return srt_files[0]

    return None


@retry_on_failure(max_attempts=3, delay=2, backoff=2)
def list_playlist(url: str) -> list[dict]:
    """List all videos in a YouTube playlist."""
    validate_url(url)

    result = run_command(
        ["yt-dlp", "--flat-playlist", "--dump-json", url],
        timeout=TIMEOUT_METADATA,
    )
    if result.returncode != 0:
        raise RuntimeError(f"yt-dlp playlist failed: {result.stderr}")

    entries = []
    for line in result.stdout.strip().split("\n"):
        if line.strip():
            entries.append(json.loads(line))
    return entries


@retry_on_failure(max_attempts=2, delay=3, backoff=2)
def download_gdrive(url: str, output_dir: Path) -> Path:
    """Download Google Drive folder using gdown."""
    validate_url(url)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    console.print("[bold]Downloading from Google Drive...[/bold]")

    result = run_command(
        ["gdown", "--folder", url, "-O", str(output_dir), "--remaining-ok"],
        timeout=TIMEOUT_GDRIVE,
    )

    if result.returncode != 0:
        # Retry with --fuzzy
        console.print("  [yellow]Retrying with --fuzzy flag...[/yellow]")
        result = run_command(
            ["gdown", "--folder", url, "-O", str(output_dir), "--remaining-ok", "--fuzzy"],
            timeout=TIMEOUT_GDRIVE,
        )
        if result.returncode != 0:
            raise RuntimeError(f"gdown failed: {result.stderr}")

    console.print(f"  [green]Download complete:[/green] {output_dir}")
    return output_dir
