"""Chunk transcription into manageable pieces for LLM processing."""

from __future__ import annotations

import json
from pathlib import Path

from rich.console import Console

from .config import CHUNK_MAX_WORDS
from .models import Chunk, Segment

console = Console(stderr=True)


def chunk_transcription(
    segments: list[Segment],
    max_words: int = CHUNK_MAX_WORDS,
) -> list[Chunk]:
    """Divide transcription segments into chunks of ~max_words words.

    Respects segment boundaries (never cuts mid-sentence).
    Each chunk contains: text, start_time, end_time, word_count.
    """
    if not segments:
        return []

    chunks: list[Chunk] = []
    current_texts: list[str] = []
    current_words = 0
    chunk_start = segments[0].start
    chunk_index = 1

    for seg in segments:
        if seg.type != "speech":
            continue

        text = seg.text.strip()
        if not text:
            continue

        words = len(text.split())

        # If adding this segment would exceed the limit and we already have content,
        # finalize the current chunk first
        if current_words > 0 and current_words + words > max_words:
            chunk_text = " ".join(current_texts)
            chunks.append(Chunk(
                index=chunk_index,
                text=chunk_text,
                start_time=chunk_start,
                end_time=seg.start,
                word_count=current_words,
            ))
            chunk_index += 1
            current_texts = []
            current_words = 0
            chunk_start = seg.start

        current_texts.append(text)
        current_words += words

    # Finalize last chunk
    if current_texts:
        chunk_text = " ".join(current_texts)
        last_seg = segments[-1]
        chunks.append(Chunk(
            index=chunk_index,
            text=chunk_text,
            start_time=chunk_start,
            end_time=last_seg.end,
            word_count=current_words,
        ))

    return chunks


def save_chunks(chunks: list[Chunk], output_dir: Path) -> Path:
    """Save chunks as individual .txt files and a manifest.

    Returns:
        Path to the chunks directory.
    """
    chunks_dir = Path(output_dir) / "chunks"
    chunks_dir.mkdir(parents=True, exist_ok=True)

    manifest: list[dict] = []

    for chunk in chunks:
        filename = f"chunk-{chunk.index:03d}.txt"
        filepath = chunks_dir / filename
        filepath.write_text(chunk.text, encoding="utf-8")

        manifest.append(chunk.to_dict())

    # Save manifest
    manifest_path = chunks_dir / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    total_words = sum(c.word_count for c in chunks)
    console.print(
        f"  [green]Chunks:[/green] {len(chunks)} files, "
        f"{total_words:,} words total"
    )

    return chunks_dir
