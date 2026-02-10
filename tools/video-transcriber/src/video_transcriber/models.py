"""Data models for video-transcriber."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Segment:
    """A single transcription segment."""

    start: float
    end: float
    text: str
    type: str = "speech"

    @property
    def start_formatted(self) -> str:
        return _fmt_time(self.start)

    @property
    def end_formatted(self) -> str:
        return _fmt_time(self.end)

    def to_dict(self) -> dict:
        return {
            "start": self.start,
            "end": self.end,
            "start_formatted": self.start_formatted,
            "end_formatted": self.end_formatted,
            "text": self.text,
            "type": self.type,
        }


@dataclass
class Chunk:
    """A chunk of transcription text."""

    index: int
    text: str
    start_time: float
    end_time: float
    word_count: int

    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "text": self.text,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "start_formatted": _fmt_time(self.start_time),
            "end_formatted": _fmt_time(self.end_time),
            "word_count": self.word_count,
        }


@dataclass
class Metadata:
    """Video/audio metadata."""

    title: str = ""
    url: str = ""
    duration: float = 0.0
    channel: str = ""
    thumbnail_url: str = ""
    description: str = ""

    @property
    def duration_formatted(self) -> str:
        return _fmt_time(self.duration)

    def to_dict(self) -> dict:
        return {
            "title": self.title,
            "url": self.url,
            "duration": self.duration,
            "duration_formatted": _fmt_time(self.duration),
            "channel": self.channel,
            "thumbnail_url": self.thumbnail_url,
            "description": self.description,
        }


@dataclass
class CleaningStats:
    """Statistics from the cleaning process."""

    original_count: int = 0
    final_count: int = 0
    loops_found: int = 0
    loop_segments_removed: int = 0
    silence_runs_found: int = 0
    silence_segments_removed: int = 0
    gaps_found: int = 0

    @property
    def removed_total(self) -> int:
        return self.original_count - self.final_count

    def to_dict(self) -> dict:
        return {
            "original_count": self.original_count,
            "final_count": self.final_count,
            "removed_total": self.removed_total,
            "loops_found": self.loops_found,
            "loop_segments_removed": self.loop_segments_removed,
            "silence_runs_found": self.silence_runs_found,
            "silence_segments_removed": self.silence_segments_removed,
            "gaps_found": self.gaps_found,
        }


@dataclass
class TranscriptionResult:
    """Full transcription result."""

    language: str = "unknown"
    segments: list[Segment] = field(default_factory=list)
    full_text: str = ""

    def to_dict(self) -> dict:
        return {
            "language": self.language,
            "full_text": self.full_text,
            "segments": [s.to_dict() for s in self.segments],
        }


def _fmt_time(seconds: float) -> str:
    """Format seconds as HH:MM:SS or MM:SS."""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"
