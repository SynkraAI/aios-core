"""Text file parsers — VTT, SRT, TXT, MD to segments."""

from __future__ import annotations

import re

from .models import Segment

# ---------------------------------------------------------------------------
# Subtitle regex patterns
# ---------------------------------------------------------------------------

VTT_TIMESTAMP = re.compile(
    r"^\d{2}:\d{2}[:\.]\d{3}\s*-->\s*\d{2}:\d{2}[:\.]\d{3}",
)
SRT_TIMESTAMP = re.compile(
    r"^\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}",
)
VTT_HEADER = re.compile(r"^(WEBVTT|Kind:|Language:)")
SRT_INDEX = re.compile(r"^\d+$")
VTT_TAG = re.compile(r"<[^>]+>")

# Synthetic timestamp config
WORDS_PER_SECOND = 3.0


def parse_subtitles(file_path) -> str:
    """Extract plain text from a VTT or SRT file, stripping timestamps and cues."""
    from pathlib import Path

    file_path = Path(file_path)
    raw = file_path.read_text(encoding="utf-8")
    lines: list[str] = []
    prev_line = ""

    for line in raw.splitlines():
        stripped = line.strip()

        if not stripped:
            continue
        if VTT_HEADER.match(stripped):
            continue
        if VTT_TIMESTAMP.match(stripped) or SRT_TIMESTAMP.match(stripped):
            continue
        if SRT_INDEX.match(stripped):
            continue

        cleaned = VTT_TAG.sub("", stripped)
        if not cleaned:
            continue

        if cleaned == prev_line:
            continue

        lines.append(cleaned)
        prev_line = cleaned

    return "\n\n".join(lines)


def text_to_segments(text: str) -> list[Segment]:
    """Convert plain text into Segment objects using paragraph breaks.

    Assigns synthetic sequential timestamps (1s per 3 words) so the
    chunker can still operate on segment boundaries.
    """
    paragraphs = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]
    if not paragraphs:
        return []

    segments: list[Segment] = []
    cursor = 0.0

    for para in paragraphs:
        word_count = len(para.split())
        duration = max(word_count / WORDS_PER_SECOND, 1.0)
        segments.append(Segment(
            start=cursor,
            end=cursor + duration,
            text=para,
            type="speech",
        ))
        cursor += duration

    return segments
