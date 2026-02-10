"""CLI interface for video-transcriber using Typer."""

from __future__ import annotations

import hashlib
import json
import re
import tempfile
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.table import Table

from . import __version__
from .audio import extract_audio
from .chunker import chunk_transcription, save_chunks
from .cleaner import clean_segments, clean_transcription_file, generate_clean_markdown
from .config import (
    AUDIO_EXTENSIONS,
    CHUNK_MAX_WORDS,
    DEFAULT_LANGUAGE,
    DEFAULT_MODEL,
    MEDIA_EXTENSIONS,
    TEXT_EXTENSIONS,
    VIDEO_EXTENSIONS,
    WHISPER_MODELS,
)
from .downloader import download_youtube_audio, download_youtube_metadata
from .models import Segment
from .transcriber import load_transcription, save_transcription, transcribe

app = typer.Typer(
    name="video-transcriber",
    help="Download, transcribe, clean, chunk, and ingest video/audio/text content.",
    no_args_is_help=True,
)

console = Console()


def _version_callback(value: bool) -> None:
    if value:
        console.print(f"video-transcriber {__version__}")
        raise typer.Exit()


@app.callback()
def main(
    version: Optional[bool] = typer.Option(
        None, "--version", "-v",
        help="Show version and exit.",
        callback=_version_callback,
        is_eager=True,
    ),
) -> None:
    """Video Transcriber — Download, transcribe, clean, and chunk media content."""


@app.command()
def process(
    source: str = typer.Argument(help="URL or local file path"),
    output: Optional[Path] = typer.Option(
        None, "--output", "-o",
        help="Output directory. Defaults to /tmp/vt-<hash>/",
    ),
    model: str = typer.Option(
        DEFAULT_MODEL, "--model", "-m",
        help=f"Whisper model size ({', '.join(WHISPER_MODELS)})",
    ),
    language: str = typer.Option(
        DEFAULT_LANGUAGE, "--language", "-l",
        help="Language code (e.g., 'pt', 'en', 'auto')",
    ),
    max_words: int = typer.Option(
        CHUNK_MAX_WORDS, "--max-words",
        help="Max words per chunk",
    ),
) -> None:
    """Full pipeline: download + transcribe + clean + chunk."""
    # Determine output directory
    if output is None:
        hash_str = hashlib.md5(source.encode()).hexdigest()[:8]
        output = Path(tempfile.gettempdir()) / f"vt-{hash_str}"
    output.mkdir(parents=True, exist_ok=True)

    console.print(f"\n[bold]Output:[/bold] {output}\n")

    is_youtube = "youtube.com" in source or "youtu.be" in source
    is_local = Path(source).exists() if not is_youtube else False

    # Step 1: Get metadata + audio
    metadata = None
    audio_path: Path | None = None

    if is_youtube:
        console.print("[bold blue]Step 1/5:[/bold blue] Fetching metadata...")
        metadata = download_youtube_metadata(source)
        console.print(f"  Title: {metadata.title}")
        console.print(f"  Channel: {metadata.channel}")
        console.print(f"  Duration: {metadata.duration_formatted}")

        # Save metadata
        meta_path = output / "metadata.json"
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata.to_dict(), f, ensure_ascii=False, indent=2)

        console.print("\n[bold blue]Step 2/5:[/bold blue] Downloading audio...")
        audio_path = download_youtube_audio(source, output)

    elif is_local:
        local_path = Path(source).resolve()
        ext = local_path.suffix.lower()

        if ext not in MEDIA_EXTENSIONS:
            console.print(f"[red]Unsupported format: {ext}[/red]")
            raise typer.Exit(1)

        console.print(f"[bold blue]Step 1/5:[/bold blue] Local file: {local_path.name}")

        if ext in VIDEO_EXTENSIONS:
            console.print("\n[bold blue]Step 2/5:[/bold blue] Extracting audio...")
            audio_path = extract_audio(local_path, output / f"{local_path.stem}.wav")
        else:
            audio_path = local_path
            console.print("  Audio file — skipping extraction")
    else:
        console.print(f"[red]Source not recognized: {source}[/red]")
        console.print("Provide a YouTube URL or a local file path.")
        raise typer.Exit(1)

    # Step 3: Transcribe
    console.print(f"\n[bold blue]Step 3/5:[/bold blue] Transcribing ({model})...")
    result = transcribe(audio_path, model_name=model, language=language)

    word_count = len(result.full_text.split())
    console.print(f"  [green]Done:[/green] {len(result.segments)} segments, {word_count:,} words")
    console.print(f"  Language: {result.language}")

    # Save raw transcription
    raw_json = output / "transcription.json"
    save_transcription(result, raw_json)

    # Step 4: Clean
    console.print(f"\n[bold blue]Step 4/5:[/bold blue] Cleaning transcription...")
    cleaned_segs, stats = clean_segments(result.segments)
    console.print(
        f"  [green]Cleaned:[/green] {stats.original_count} \u2192 {stats.final_count} segments"
    )
    console.print(f"  Removed: {stats.removed_total} ({stats.loop_segments_removed} loops)")

    # Save cleaned outputs
    clean_data = {
        "language": result.language,
        "original_segments": stats.original_count,
        "cleaned_segments": stats.final_count,
        "segments": [s.to_dict() for s in cleaned_segs],
    }
    clean_json = output / "transcription_clean.json"
    with open(clean_json, "w", encoding="utf-8") as f:
        json.dump(clean_data, f, ensure_ascii=False, indent=2)

    title = metadata.title if metadata else Path(source).stem
    md_content = generate_clean_markdown(cleaned_segs, stats, title)
    clean_md = output / "transcription_clean.md"
    with open(clean_md, "w", encoding="utf-8") as f:
        f.write(md_content)

    # Save stats
    stats_path = output / "stats.json"
    with open(stats_path, "w", encoding="utf-8") as f:
        json.dump(stats.to_dict(), f, ensure_ascii=False, indent=2)

    # Step 5: Chunk
    console.print(f"\n[bold blue]Step 5/5:[/bold blue] Chunking (max {max_words} words)...")
    chunks = chunk_transcription(cleaned_segs, max_words=max_words)
    save_chunks(chunks, output)

    # Summary
    console.print("\n" + "=" * 50)
    console.print("[bold green]COMPLETE[/bold green]")
    console.print("=" * 50)

    table = Table(show_header=False, box=None, padding=(0, 2))
    table.add_column(style="bold")
    table.add_column()
    table.add_row("Output", str(output))
    if metadata:
        table.add_row("Title", metadata.title)
    table.add_row("Segments", f"{stats.original_count} \u2192 {stats.final_count}")
    table.add_row("Words", f"{word_count:,}")
    table.add_row("Chunks", str(len(chunks)))
    table.add_row("Language", result.language)
    console.print(table)
    console.print()


@app.command()
def download(
    url: str = typer.Argument(help="YouTube URL to download"),
    output: Path = typer.Option(
        Path(tempfile.gettempdir()), "--output", "-o",
        help="Output directory",
    ),
) -> None:
    """Download audio from YouTube."""
    output.mkdir(parents=True, exist_ok=True)
    audio_path = download_youtube_audio(url, output)
    console.print(f"\n[green]Downloaded:[/green] {audio_path}")


@app.command(name="transcribe")
def transcribe_cmd(
    file: Path = typer.Argument(help="Path to audio or video file"),
    model: str = typer.Option(
        DEFAULT_MODEL, "--model", "-m",
        help=f"Whisper model ({', '.join(WHISPER_MODELS)})",
    ),
    language: str = typer.Option(
        DEFAULT_LANGUAGE, "--language", "-l",
        help="Language code",
    ),
    output: Optional[Path] = typer.Option(
        None, "--output", "-o",
        help="Output JSON path",
    ),
) -> None:
    """Transcribe a local audio/video file."""
    file = file.resolve()
    if not file.exists():
        console.print(f"[red]File not found: {file}[/red]")
        raise typer.Exit(1)

    ext = file.suffix.lower()
    audio_path = file

    if ext in VIDEO_EXTENSIONS:
        console.print("Extracting audio...")
        audio_path = extract_audio(file)

    console.print(f"Transcribing with model={model}, language={language}...")
    result = transcribe(audio_path, model_name=model, language=language)

    if output is None:
        output = file.parent / f"{file.stem}_transcription.json"

    save_transcription(result, output)
    console.print(f"\n[green]Saved:[/green] {output}")
    console.print(f"Segments: {len(result.segments)}, Language: {result.language}")


@app.command()
def clean(
    file: Path = typer.Argument(help="Path to transcription JSON file"),
    output: Optional[Path] = typer.Option(
        None, "--output", "-o",
        help="Output directory",
    ),
) -> None:
    """Clean a transcription JSON (remove loops, merge segments)."""
    file = file.resolve()
    if not file.exists():
        console.print(f"[red]File not found: {file}[/red]")
        raise typer.Exit(1)

    result_path = clean_transcription_file(file, output)
    console.print(f"\n[green]Cleaned:[/green] {result_path}")


# ---------------------------------------------------------------------------
# Helpers for text ingestion
# ---------------------------------------------------------------------------

_VTT_TIMESTAMP = re.compile(
    r"^\d{2}:\d{2}[:.]\d{3}\s*-->\s*\d{2}:\d{2}[:.]\d{3}",
)
_SRT_TIMESTAMP = re.compile(
    r"^\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}",
)
_VTT_HEADER = re.compile(r"^(WEBVTT|Kind:|Language:)")
_SRT_INDEX = re.compile(r"^\d+$")
_VTT_TAG = re.compile(r"<[^>]+>")


def _parse_subtitles(file_path: Path) -> str:
    """Extract plain text from a VTT or SRT file, stripping timestamps and cues."""
    raw = file_path.read_text(encoding="utf-8")
    lines: list[str] = []
    prev_line = ""

    for line in raw.splitlines():
        stripped = line.strip()

        # Skip empty, headers, timestamps, SRT numeric indices
        if not stripped:
            continue
        if _VTT_HEADER.match(stripped):
            continue
        if _VTT_TIMESTAMP.match(stripped) or _SRT_TIMESTAMP.match(stripped):
            continue
        if _SRT_INDEX.match(stripped):
            continue

        # Remove inline VTT tags like <c>, </c>, <v Name>
        cleaned = _VTT_TAG.sub("", stripped)
        if not cleaned:
            continue

        # Deduplicate consecutive identical lines (common in VTT)
        if cleaned == prev_line:
            continue

        lines.append(cleaned)
        prev_line = cleaned

    return "\n\n".join(lines)


def _text_to_segments(text: str) -> list[Segment]:
    """Convert plain text into Segment objects using paragraph breaks.

    Assigns synthetic sequential timestamps (1s per 3 words) so the
    chunker can still operate on segment boundaries.
    """
    # Split on double newlines (paragraphs) or treat as single block
    paragraphs = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]
    if not paragraphs:
        return []

    segments: list[Segment] = []
    cursor = 0.0
    words_per_second = 3.0  # rough estimate for timestamp generation

    for para in paragraphs:
        word_count = len(para.split())
        duration = max(word_count / words_per_second, 1.0)
        segments.append(Segment(
            start=cursor,
            end=cursor + duration,
            text=para,
            type="speech",
        ))
        cursor += duration

    return segments


# ---------------------------------------------------------------------------
# Commands: chunk & ingest
# ---------------------------------------------------------------------------

@app.command()
def chunk(
    file: Path = typer.Argument(help="Path to transcription JSON file"),
    output: Optional[Path] = typer.Option(
        None, "--output", "-o",
        help="Output directory (default: same as input file)",
    ),
    max_words: int = typer.Option(
        CHUNK_MAX_WORDS, "--max-words",
        help="Max words per chunk",
    ),
) -> None:
    """Chunk an existing transcription JSON into text files."""
    file = file.resolve()
    if not file.exists():
        console.print(f"[red]File not found: {file}[/red]")
        raise typer.Exit(1)

    if file.suffix.lower() != ".json":
        console.print("[red]Expected a .json transcription file[/red]")
        raise typer.Exit(1)

    out_dir = output or file.parent
    out_dir.mkdir(parents=True, exist_ok=True)

    console.print(f"Loading: {file.name}")
    result = load_transcription(file)
    console.print(f"  Segments: {len(result.segments)}, Language: {result.language}")

    console.print(f"Chunking (max {max_words} words)...")
    chunks = chunk_transcription(result.segments, max_words=max_words)
    chunks_dir = save_chunks(chunks, out_dir)

    console.print(f"\n[green]Done:[/green] {len(chunks)} chunks saved to {chunks_dir}")


@app.command()
def ingest(
    file: Path = typer.Argument(help="Path to VTT, SRT, TXT, MD, or JSON file"),
    output: Optional[Path] = typer.Option(
        None, "--output", "-o",
        help="Output directory (default: same as input file)",
    ),
    max_words: int = typer.Option(
        CHUNK_MAX_WORDS, "--max-words",
        help="Max words per chunk",
    ),
) -> None:
    """Parse a text file (VTT/SRT/TXT/MD/JSON) and produce chunks.

    This is the entry point for 'ready text' — content that is already
    transcribed or written and just needs to be chunked for LLM processing.
    """
    file = file.resolve()
    if not file.exists():
        console.print(f"[red]File not found: {file}[/red]")
        raise typer.Exit(1)

    ext = file.suffix.lower()
    if ext not in TEXT_EXTENSIONS:
        console.print(f"[red]Unsupported format: {ext}[/red]")
        console.print(f"Supported: {', '.join(sorted(TEXT_EXTENSIONS))}")
        raise typer.Exit(1)

    out_dir = output or file.parent
    out_dir.mkdir(parents=True, exist_ok=True)

    console.print(f"[bold]Ingesting:[/bold] {file.name} ({ext})")

    # --- Parse based on format ---
    if ext == ".json":
        # Assume transcription JSON — load, clean, chunk
        result = load_transcription(file)
        console.print(f"  Segments: {len(result.segments)}, Language: {result.language}")

        console.print("  Cleaning...")
        cleaned_segs, stats = clean_segments(result.segments)
        console.print(
            f"  Cleaned: {stats.original_count} → {stats.final_count} segments"
        )
        segments = cleaned_segs

    elif ext in {".vtt", ".srt"}:
        # Parse subtitles → plain text → segments
        console.print("  Parsing subtitles...")
        text = _parse_subtitles(file)
        word_count = len(text.split())
        console.print(f"  Extracted: {word_count:,} words")
        segments = _text_to_segments(text)

    else:
        # Plain text (.txt, .md) — read and convert
        text = file.read_text(encoding="utf-8")
        word_count = len(text.split())
        console.print(f"  Words: {word_count:,}")
        segments = _text_to_segments(text)

    # --- Chunk ---
    console.print(f"  Chunking (max {max_words} words)...")
    chunks = chunk_transcription(segments, max_words=max_words)
    chunks_dir = save_chunks(chunks, out_dir)

    # --- Summary ---
    total_words = sum(c.word_count for c in chunks)
    console.print(f"\n[green]Done:[/green] {len(chunks)} chunks, {total_words:,} words")
    console.print(f"  Output: {chunks_dir}")
    console.print(f"  Manifest: {chunks_dir / 'manifest.json'}")


if __name__ == "__main__":
    app()
