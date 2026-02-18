"""Whisper transcription with auto-detect device (MPS > CUDA > CPU).

Tries mlx-whisper first (Apple Silicon), falls back to openai-whisper.
"""

from __future__ import annotations

import json
from pathlib import Path

from rich.console import Console

from .models import Segment, TranscriptionResult

console = Console(stderr=True)

MLX_MODEL_MAP = {
    "tiny": "mlx-community/whisper-tiny-mlx",
    "base": "mlx-community/whisper-base-mlx",
    "small": "mlx-community/whisper-small-mlx",
    "medium": "mlx-community/whisper-medium-mlx",
    "large": "mlx-community/whisper-large-v3-mlx",
}


def transcribe(
    audio_path: Path,
    model_name: str = "medium",
    language: str | None = None,
) -> TranscriptionResult:
    """Transcribe audio file using the best available Whisper backend.

    Tries mlx-whisper first (Apple Silicon), falls back to openai-whisper.
    """
    audio_path = Path(audio_path)
    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    # Try mlx-whisper first
    try:
        return _transcribe_mlx(audio_path, model_name, language)
    except ImportError:
        console.print("  [yellow]mlx-whisper not available, trying openai-whisper...[/yellow]")

    # Fallback to openai-whisper
    return _transcribe_openai(audio_path, model_name, language)


def _transcribe_mlx(
    audio_path: Path,
    model_name: str,
    language: str | None,
) -> TranscriptionResult:
    """Transcribe using mlx-whisper (Apple Silicon GPU)."""
    import mlx_whisper  # type: ignore[import-untyped]

    mlx_model = MLX_MODEL_MAP.get(model_name, MLX_MODEL_MAP["medium"])
    console.print(f"  [bold]Engine:[/bold] mlx-whisper (Apple Silicon GPU)")
    console.print(f"  [bold]Model:[/bold] {mlx_model}")

    options: dict = {"path_or_hf_repo": mlx_model, "verbose": True}
    if language and language != "auto":
        options["language"] = language

    result = mlx_whisper.transcribe(str(audio_path), **options)
    return _parse_whisper_result(result)


def _transcribe_openai(
    audio_path: Path,
    model_name: str,
    language: str | None,
) -> TranscriptionResult:
    """Transcribe using openai-whisper with auto-detect device."""
    import torch  # type: ignore[import-untyped]
    import whisper  # type: ignore[import-untyped]

    # Select best available device
    if torch.backends.mps.is_available():
        device = "mps"
        console.print("  [bold]Engine:[/bold] openai-whisper (MPS)")
    elif torch.cuda.is_available():
        device = "cuda"
        console.print("  [bold]Engine:[/bold] openai-whisper (CUDA)")
    else:
        device = "cpu"
        console.print("  [bold]Engine:[/bold] openai-whisper (CPU)")

    console.print(f"  [bold]Model:[/bold] {model_name}")

    model = whisper.load_model(model_name, device=device)

    options: dict = {"fp16": False, "verbose": True}
    if language and language != "auto":
        options["language"] = language

    result = model.transcribe(str(audio_path), **options)
    return _parse_whisper_result(result)


def _parse_whisper_result(result: dict) -> TranscriptionResult:
    """Convert raw Whisper output to TranscriptionResult."""
    segments = []
    for seg in result.get("segments", []):
        segments.append(Segment(
            start=seg["start"],
            end=seg["end"],
            text=seg["text"].strip(),
        ))

    return TranscriptionResult(
        language=result.get("language", "unknown"),
        segments=segments,
        full_text=result.get("text", ""),
    )


def save_transcription(result: TranscriptionResult, output_path: Path) -> None:
    """Save transcription result as JSON."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result.to_dict(), f, ensure_ascii=False, indent=2)

    console.print(f"  [green]Transcription saved:[/green] {output_path.name}")


def load_transcription(json_path: Path) -> TranscriptionResult:
    """Load transcription from JSON file."""
    json_path = Path(json_path)
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    segments = []
    for seg in data.get("segments", []):
        segments.append(Segment(
            start=seg["start"],
            end=seg["end"],
            text=seg["text"],
            type=seg.get("type", "speech"),
        ))

    return TranscriptionResult(
        language=data.get("language", "unknown"),
        segments=segments,
        full_text=data.get("full_text", ""),
    )
