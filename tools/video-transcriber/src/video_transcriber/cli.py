"""CLI interface for video-transcriber using Typer."""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.table import Table

from . import __version__
from .audio import extract_audio
from .chunker import chunk_transcription, save_chunks
from .cleaner import clean_segments, clean_transcription_file
from .config import (CHUNK_MAX_WORDS, DEFAULT_LANGUAGE, DEFAULT_MODEL,
                     TEXT_EXTENSIONS, VIDEO_EXTENSIONS, WHISPER_MODELS)
from .downloader import download_youtube_audio
from .parsers import parse_subtitles, text_to_segments
from .pipeline import PipelineResult, resolve_output_dir, run_pipeline
from .transcriber import load_transcription, save_transcription, transcribe
from .utils import validate_url

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


_MODELS_HELP = f"Whisper model ({', '.join(WHISPER_MODELS)})"


@app.command()
def process(
    source: str = typer.Argument(help="URL or local file path"),
    output: Optional[Path] = typer.Option(None, "-o", "--output", help="Output directory"),
    model: str = typer.Option(DEFAULT_MODEL, "-m", "--model", help=_MODELS_HELP),
    language: str = typer.Option(DEFAULT_LANGUAGE, "-l", "--language", help="Language code"),
    max_words: int = typer.Option(CHUNK_MAX_WORDS, "--max-words", help="Max words per chunk"),
) -> None:
    """Full pipeline: download + transcribe + clean + chunk."""
    output_dir = resolve_output_dir(source, output)
    console.print(f"\n[bold]Output:[/bold] {output_dir}\n")

    try:
        result = run_pipeline(source, output_dir, model, language, max_words)
    except ValueError as e:
        console.print(f"[red]{e}[/red]")
        raise typer.Exit(1)

    _print_summary(result)


def _print_summary(result: PipelineResult) -> None:
    """Print pipeline completion summary."""
    console.print("\n" + "=" * 50)
    console.print("[bold green]COMPLETE[/bold green]")
    console.print("=" * 50)

    table = Table(show_header=False, box=None, padding=(0, 2))
    table.add_column(style="bold")
    table.add_column()
    table.add_row("Output", str(result.output_dir))
    if result.metadata:
        table.add_row("Title", result.metadata.title)
    table.add_row("Segments", f"{result.segments_original} \u2192 {result.segments_cleaned}")
    table.add_row("Words", f"{result.word_count:,}")
    table.add_row("Chunks", str(result.chunks_count))
    table.add_row("Language", result.language)
    console.print(table)
    console.print()


@app.command()
def download(
    url: str = typer.Argument(help="YouTube URL to download"),
    output: Path = typer.Option(Path("/tmp"), "-o", "--output", help="Output directory"),
) -> None:
    """Download audio from YouTube."""
    try:
        validate_url(url)
    except ValueError as e:
        console.print(f"[red]Invalid URL: {e}[/red]")
        raise typer.Exit(1)
    output.mkdir(parents=True, exist_ok=True)
    audio_path = download_youtube_audio(url, output)
    console.print(f"\n[green]Downloaded:[/green] {audio_path}")


@app.command(name="transcribe")
def transcribe_cmd(
    file: Path = typer.Argument(help="Path to audio or video file"),
    model: str = typer.Option(DEFAULT_MODEL, "-m", "--model", help=_MODELS_HELP),
    language: str = typer.Option(DEFAULT_LANGUAGE, "-l", "--language", help="Language code"),
    output: Optional[Path] = typer.Option(None, "-o", "--output", help="Output JSON path"),
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
    output: Optional[Path] = typer.Option(None, "-o", "--output", help="Output directory"),
) -> None:
    """Clean a transcription JSON (remove loops, merge segments)."""
    file = file.resolve()
    if not file.exists():
        console.print(f"[red]File not found: {file}[/red]")
        raise typer.Exit(1)

    result_path = clean_transcription_file(file, output)
    console.print(f"\n[green]Cleaned:[/green] {result_path}")


@app.command()
def chunk(
    file: Path = typer.Argument(help="Path to transcription JSON file"),
    output: Optional[Path] = typer.Option(None, "-o", "--output", help="Output directory"),
    max_words: int = typer.Option(CHUNK_MAX_WORDS, "--max-words", help="Max words per chunk"),
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
    output: Optional[Path] = typer.Option(None, "-o", "--output", help="Output directory"),
    max_words: int = typer.Option(CHUNK_MAX_WORDS, "--max-words", help="Max words per chunk"),
) -> None:
    """Parse a text file (VTT/SRT/TXT/MD/JSON) and produce chunks."""
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

    if ext == ".json":
        result = load_transcription(file)
        console.print(f"  Segments: {len(result.segments)}, Language: {result.language}")
        console.print("  Cleaning...")
        segments, stats = clean_segments(result.segments)
        console.print(f"  Cleaned: {stats.original_count} \u2192 {stats.final_count} segments")
    elif ext in {".vtt", ".srt"}:
        console.print("  Parsing subtitles...")
        text = parse_subtitles(file)
        console.print(f"  Extracted: {len(text.split()):,} words")
        segments = text_to_segments(text)
    else:
        text = file.read_text(encoding="utf-8")
        console.print(f"  Words: {len(text.split()):,}")
        segments = text_to_segments(text)

    console.print(f"  Chunking (max {max_words} words)...")
    chunks = chunk_transcription(segments, max_words=max_words)
    chunks_dir = save_chunks(chunks, out_dir)

    total_words = sum(c.word_count for c in chunks)
    console.print(f"\n[green]Done:[/green] {len(chunks)} chunks, {total_words:,} words")
    console.print(f"  Output: {chunks_dir}")
    console.print(f"  Manifest: {chunks_dir / 'manifest.json'}")


@app.command(name="batch-playlist")
def batch_playlist(
    url: str = typer.Argument(help="YouTube playlist URL"),
    output: Optional[Path] = typer.Option(None, "-o", "--output", help="Output directory"),
    model: str = typer.Option(DEFAULT_MODEL, "-m", "--model", help=_MODELS_HELP),
    language: str = typer.Option(DEFAULT_LANGUAGE, "-l", "--language", help="Language code"),
    max_words: int = typer.Option(CHUNK_MAX_WORDS, "--max-words", help="Max words per chunk"),
) -> None:
    """Process all videos in a YouTube playlist."""
    try:
        validate_url(url)
    except ValueError as e:
        console.print(f"[red]Invalid URL: {e}[/red]")
        raise typer.Exit(1)

    from .batch import process_playlist

    out_dir = output or Path(f"/tmp/vt-playlist")
    batch = process_playlist(url, out_dir, model, language, max_words)

    console.print("\n" + "=" * 50)
    console.print("[bold green]BATCH COMPLETE[/bold green]")
    console.print("=" * 50)

    table = Table(show_header=False, box=None, padding=(0, 2))
    table.add_column(style="bold")
    table.add_column()
    table.add_row("Output", str(batch.output_dir))
    table.add_row("Videos", f"{batch.processed}/{batch.total_videos}")
    if batch.failed:
        table.add_row("Failed", f"[red]{batch.failed}[/red]")
    table.add_row("Total Words", f"{batch.total_words:,}")
    table.add_row("Total Chunks", str(batch.total_chunks))
    console.print(table)
    console.print()


if __name__ == "__main__":
    app()
