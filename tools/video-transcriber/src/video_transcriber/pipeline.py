"""Pipeline orchestration — full process flow from source to chunks."""

from __future__ import annotations

import hashlib
import json
import tempfile
from dataclasses import dataclass
from pathlib import Path

from rich.console import Console

from .audio import extract_audio
from .chunker import chunk_transcription, save_chunks
from .cleaner import clean_segments, generate_clean_markdown
from .config import (
    AUDIO_EXTENSIONS,
    CHUNK_MAX_WORDS,
    MEDIA_EXTENSIONS,
    VIDEO_EXTENSIONS,
)
from .downloader import download_youtube_audio, download_youtube_metadata
from .models import Metadata
from .transcriber import save_transcription, transcribe
from .utils import validate_url

console = Console(stderr=True)


@dataclass
class PipelineResult:
    """Result from a full pipeline run."""

    output_dir: Path
    metadata: Metadata | None
    segments_original: int
    segments_cleaned: int
    word_count: int
    chunks_count: int
    language: str


def resolve_output_dir(source: str, output: Path | None) -> Path:
    """Determine output directory from source and optional override."""
    if output is not None:
        output.mkdir(parents=True, exist_ok=True)
        return output
    hash_str = hashlib.md5(source.encode()).hexdigest()[:8]
    out = Path(tempfile.gettempdir()) / f"vt-{hash_str}"
    out.mkdir(parents=True, exist_ok=True)
    return out


def run_pipeline(
    source: str,
    output_dir: Path,
    model: str = "medium",
    language: str = "pt",
    max_words: int = CHUNK_MAX_WORDS,
) -> PipelineResult:
    """Execute the full pipeline: download + transcribe + clean + chunk.

    Args:
        source: YouTube URL or local file path.
        output_dir: Where to save all outputs.
        model: Whisper model name.
        language: Language code.
        max_words: Max words per chunk.

    Returns:
        PipelineResult with summary statistics.
    """
    is_youtube = "youtube.com" in source or "youtu.be" in source

    if is_youtube:
        validate_url(source)

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

        meta_path = output_dir / "metadata.json"
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata.to_dict(), f, ensure_ascii=False, indent=2)

        console.print("\n[bold blue]Step 2/5:[/bold blue] Downloading audio...")
        audio_path = download_youtube_audio(source, output_dir)

    elif is_local:
        local_path = Path(source).resolve()
        ext = local_path.suffix.lower()

        if ext not in MEDIA_EXTENSIONS:
            raise ValueError(f"Unsupported format: {ext}")

        console.print(f"[bold blue]Step 1/5:[/bold blue] Local file: {local_path.name}")

        if ext in VIDEO_EXTENSIONS:
            console.print("\n[bold blue]Step 2/5:[/bold blue] Extracting audio...")
            audio_path = extract_audio(local_path, output_dir / f"{local_path.stem}.wav")
        else:
            audio_path = local_path
            console.print("  Audio file — skipping extraction")
    else:
        raise ValueError(f"Source not recognized: {source}")

    # Step 3: Transcribe
    console.print(f"\n[bold blue]Step 3/5:[/bold blue] Transcribing ({model})...")
    result = transcribe(audio_path, model_name=model, language=language)

    word_count = len(result.full_text.split())
    console.print(f"  [green]Done:[/green] {len(result.segments)} segments, {word_count:,} words")
    console.print(f"  Language: {result.language}")

    raw_json = output_dir / "transcription.json"
    save_transcription(result, raw_json)

    # Step 4: Clean
    console.print(f"\n[bold blue]Step 4/5:[/bold blue] Cleaning transcription...")
    cleaned_segs, stats = clean_segments(result.segments)
    console.print(
        f"  [green]Cleaned:[/green] {stats.original_count} \u2192 {stats.final_count} segments"
    )
    console.print(f"  Removed: {stats.removed_total} ({stats.loop_segments_removed} loops)")

    clean_data = {
        "language": result.language,
        "original_segments": stats.original_count,
        "cleaned_segments": stats.final_count,
        "segments": [s.to_dict() for s in cleaned_segs],
    }
    clean_json = output_dir / "transcription_clean.json"
    with open(clean_json, "w", encoding="utf-8") as f:
        json.dump(clean_data, f, ensure_ascii=False, indent=2)

    title = metadata.title if metadata else Path(source).stem
    md_content = generate_clean_markdown(cleaned_segs, stats, title)
    clean_md = output_dir / "transcription_clean.md"
    with open(clean_md, "w", encoding="utf-8") as f:
        f.write(md_content)

    stats_path = output_dir / "stats.json"
    with open(stats_path, "w", encoding="utf-8") as f:
        json.dump(stats.to_dict(), f, ensure_ascii=False, indent=2)

    # Step 5: Chunk
    console.print(f"\n[bold blue]Step 5/5:[/bold blue] Chunking (max {max_words} words)...")
    chunks = chunk_transcription(cleaned_segs, max_words=max_words)
    save_chunks(chunks, output_dir)

    return PipelineResult(
        output_dir=output_dir,
        metadata=metadata,
        segments_original=stats.original_count,
        segments_cleaned=stats.final_count,
        word_count=word_count,
        chunks_count=len(chunks),
        language=result.language,
    )
