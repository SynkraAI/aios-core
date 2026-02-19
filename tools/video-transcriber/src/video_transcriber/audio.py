"""Audio extraction from video files using ffmpeg."""

from __future__ import annotations

from pathlib import Path

from rich.console import Console

from .config import TIMEOUT_AUDIO_EXTRACT
from .utils import run_command

console = Console(stderr=True)


def extract_audio(video_path: Path, output_path: Path | None = None) -> Path:
    """Extract audio from video file as 16kHz mono WAV (optimal for Whisper).

    Args:
        video_path: Path to the video file.
        output_path: Where to save the WAV. Defaults to same dir as video.

    Returns:
        Path to the extracted WAV file.
    """
    video_path = Path(video_path)
    if output_path is None:
        output_path = video_path.with_suffix(".wav")
    output_path = Path(output_path)

    console.print(f"[bold]Extracting audio:[/bold] {video_path.name}")

    cmd = [
        "ffmpeg", "-i", str(video_path),
        "-vn",                    # No video
        "-acodec", "pcm_s16le",   # WAV format
        "-ar", "16000",           # 16kHz sample rate (Whisper optimal)
        "-ac", "1",               # Mono channel
        "-y",                     # Overwrite output
        str(output_path),
    ]

    result = run_command(cmd, timeout=TIMEOUT_AUDIO_EXTRACT)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr}")

    size_mb = output_path.stat().st_size / (1024 * 1024)
    console.print(f"  [green]Audio extracted:[/green] {output_path.name} ({size_mb:.1f} MB)")
    return output_path
