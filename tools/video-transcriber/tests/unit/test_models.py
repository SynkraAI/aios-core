"""Tests for data models: Segment, Chunk, Metadata, CleaningStats, TranscriptionResult."""

from video_transcriber.models import (
    Chunk,
    CleaningStats,
    Metadata,
    Segment,
    TranscriptionResult,
    _fmt_time,
)


class TestFmtTime:
    def test_seconds_only(self):
        assert _fmt_time(45) == "00:45"

    def test_minutes_and_seconds(self):
        assert _fmt_time(125) == "02:05"

    def test_hours(self):
        assert _fmt_time(3661) == "01:01:01"

    def test_zero(self):
        assert _fmt_time(0) == "00:00"


class TestSegment:
    def test_defaults(self):
        seg = Segment(start=1.0, end=2.0, text="hello")
        assert seg.type == "speech"

    def test_formatted_times(self):
        seg = Segment(start=65.0, end=130.0, text="test")
        assert seg.start_formatted == "01:05"
        assert seg.end_formatted == "02:10"

    def test_to_dict(self):
        seg = Segment(start=0.0, end=5.0, text="hello", type="speech")
        d = seg.to_dict()
        assert d["start"] == 0.0
        assert d["end"] == 5.0
        assert d["text"] == "hello"
        assert d["type"] == "speech"
        assert "start_formatted" in d
        assert "end_formatted" in d


class TestChunk:
    def test_to_dict(self):
        chunk = Chunk(index=1, text="Hello world", start_time=0.0, end_time=10.0, word_count=2)
        d = chunk.to_dict()
        assert d["index"] == 1
        assert d["text"] == "Hello world"
        assert d["word_count"] == 2
        assert "start_formatted" in d
        assert "end_formatted" in d


class TestMetadata:
    def test_defaults(self):
        meta = Metadata()
        assert meta.title == ""
        assert meta.duration == 0.0

    def test_duration_formatted(self):
        meta = Metadata(duration=3661.0)
        assert meta.duration_formatted == "01:01:01"

    def test_to_dict(self, sample_metadata):
        d = sample_metadata.to_dict()
        assert d["title"] == "Test Video Title"
        assert d["channel"] == "Test Channel"
        assert "duration_formatted" in d


class TestCleaningStats:
    def test_removed_total(self):
        stats = CleaningStats(original_count=100, final_count=80)
        assert stats.removed_total == 20

    def test_removed_total_zero(self):
        stats = CleaningStats(original_count=50, final_count=50)
        assert stats.removed_total == 0

    def test_to_dict(self):
        stats = CleaningStats(
            original_count=10, final_count=8, loops_found=1, loop_segments_removed=2
        )
        d = stats.to_dict()
        assert d["removed_total"] == 2
        assert d["loops_found"] == 1


class TestTranscriptionResult:
    def test_defaults(self):
        result = TranscriptionResult()
        assert result.language == "unknown"
        assert result.segments == []
        assert result.full_text == ""

    def test_to_dict(self, sample_transcription_result):
        d = sample_transcription_result.to_dict()
        assert d["language"] == "pt"
        assert len(d["segments"]) == 4
        assert "full_text" in d
