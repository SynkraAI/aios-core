"""Batch processing — process all videos in a YouTube playlist."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

from .downloader import list_playlist
from .pipeline import PipelineResult, run_pipeline
from .utils import sanitize_filename, validate_url

console = Console(stderr=True)


@dataclass
class BatchResult:
    """Aggregated result from batch processing."""

    playlist_url: str
    output_dir: Path
    total_videos: int = 0
    processed: int = 0
    failed: int = 0
    total_words: int = 0
    total_chunks: int = 0
    results: list[dict] = field(default_factory=list)
    errors: list[dict] = field(default_factory=list)


def process_playlist(
    url: str,
    output_dir: Path,
    model: str = "medium",
    language: str = "pt",
    max_words: int = 2000,
) -> BatchResult:
    """Process all videos in a YouTube playlist sequentially.

    Args:
        url: YouTube playlist URL.
        output_dir: Root output directory.
        model: Whisper model name.
        language: Language code.
        max_words: Max words per chunk.

    Returns:
        BatchResult with aggregated statistics.
    """
    validate_url(url)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    console.print("[bold]Fetching playlist...[/bold]")
    entries = list_playlist(url)

    batch = BatchResult(
        playlist_url=url,
        output_dir=output_dir,
        total_videos=len(entries),
    )

    console.print(f"  Found [bold]{len(entries)}[/bold] videos\n")

    for i, entry in enumerate(entries, 1):
        video_id = entry.get("id", f"video-{i}")
        title = entry.get("title", video_id)
        video_url = entry.get("url") or entry.get("webpage_url", "")

        if not video_url:
            video_url = f"https://www.youtube.com/watch?v={video_id}"

        safe_title = sanitize_filename(title)
        video_dir = output_dir / f"{i:03d}-{safe_title}"

        console.print(f"[bold blue]({i}/{len(entries)})[/bold blue] {title}")

        try:
            result = run_pipeline(
                source=video_url,
                output_dir=video_dir,
                model=model,
                language=language,
                max_words=max_words,
            )
            batch.processed += 1
            batch.total_words += result.word_count
            batch.total_chunks += result.chunks_count
            batch.results.append({
                "index": i,
                "title": title,
                "video_id": video_id,
                "output_dir": str(video_dir),
                "words": result.word_count,
                "chunks": result.chunks_count,
                "language": result.language,
            })
            console.print(f"  [green]OK[/green] — {result.word_count:,} words, {result.chunks_count} chunks\n")

        except Exception as e:
            batch.failed += 1
            batch.errors.append({
                "index": i,
                "title": title,
                "video_id": video_id,
                "error": str(e),
            })
            console.print(f"  [red]FAILED:[/red] {e}\n")

    # Save batch index
    _save_batch_index(batch)

    return batch


def _save_batch_index(batch: BatchResult) -> None:
    """Save batch processing index and stats."""
    index = {
        "playlist_url": batch.playlist_url,
        "total_videos": batch.total_videos,
        "processed": batch.processed,
        "failed": batch.failed,
        "total_words": batch.total_words,
        "total_chunks": batch.total_chunks,
        "videos": batch.results,
        "errors": batch.errors,
    }

    index_path = batch.output_dir / "batch-index.json"
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    console.print(f"  [green]Index saved:[/green] {index_path}")
