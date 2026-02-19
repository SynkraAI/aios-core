"""Tests for transcription cleaner module."""

import json
import tempfile
from pathlib import Path

from video_transcriber.cleaner import (
    clean_segments,
    clean_transcription_file,
    detect_gaps,
    detect_loops,
    detect_silence_runs,
    generate_clean_markdown,
    merge_short_segments,
    normalize_text,
)
from video_transcriber.models import CleaningStats, Segment


class TestNormalizeText:
    def test_strips_whitespace(self):
        assert normalize_text("  hello  ") == "hello"

    def test_lowercases(self):
        assert normalize_text("HELLO") == "hello"

    def test_removes_punctuation(self):
        assert normalize_text("Hello, world!") == "hello world"

    def test_removes_ellipsis(self):
        assert normalize_text("hello...") == "hello"

    def test_empty_string(self):
        assert normalize_text("") == ""

    def test_only_punctuation(self):
        assert normalize_text("...!?") == ""


class TestDetectLoops:
    def test_detects_loop(self, looping_segments):
        loops = detect_loops(looping_segments)
        assert len(loops) == 1
        assert loops[0]["count"] == 4
        assert loops[0]["text"] == "Thanks for watching."

    def test_no_loops(self, sample_segments):
        loops = detect_loops(sample_segments)
        assert loops == []

    def test_empty_input(self):
        assert detect_loops([]) == []

    def test_two_repeats_not_a_loop(self):
        segs = [
            Segment(start=0, end=1, text="hello"),
            Segment(start=1, end=2, text="hello"),
        ]
        assert detect_loops(segs) == []

    def test_three_repeats_is_a_loop(self):
        segs = [
            Segment(start=0, end=1, text="hello"),
            Segment(start=1, end=2, text="hello"),
            Segment(start=2, end=3, text="hello"),
        ]
        loops = detect_loops(segs)
        assert len(loops) == 1
        assert loops[0]["count"] == 3


class TestDetectSilenceRuns:
    def test_detects_silence(self, silence_segments):
        runs = detect_silence_runs(silence_segments)
        assert len(runs) == 1
        assert runs[0]["count"] == 4

    def test_no_silence(self, sample_segments):
        runs = detect_silence_runs(sample_segments)
        assert runs == []

    def test_ellipsis_variants(self):
        segs = [
            Segment(start=0, end=1, text="\u2026"),
            Segment(start=1, end=2, text="\u2026"),
            Segment(start=2, end=3, text="\u2026"),
        ]
        runs = detect_silence_runs(segs)
        assert len(runs) == 1


class TestDetectGaps:
    def test_detects_gap(self):
        segs = [
            Segment(start=0, end=10, text="before"),
            Segment(start=50, end=60, text="after"),
        ]
        gaps = detect_gaps(segs)
        assert len(gaps) == 1
        assert gaps[0]["duration"] == 40.0

    def test_no_gap(self, sample_segments):
        gaps = detect_gaps(sample_segments)
        assert gaps == []

    def test_empty_input(self):
        assert detect_gaps([]) == []


class TestMergeShortSegments:
    def test_merges_short_segments(self):
        segs = [
            Segment(start=0, end=1, text="Hi"),
            Segment(start=1, end=2, text="there"),
            Segment(start=2, end=3, text="friend"),
        ]
        merged = merge_short_segments(segs)
        assert len(merged) == 1
        assert merged[0].text == "Hi there friend"

    def test_no_merge_if_long(self):
        long_text = "a " * 30  # 60 chars
        segs = [
            Segment(start=0, end=1, text=long_text),
            Segment(start=1, end=2, text=long_text),
        ]
        merged = merge_short_segments(segs)
        assert len(merged) == 2

    def test_no_merge_if_gap_too_large(self):
        segs = [
            Segment(start=0, end=1, text="Hi"),
            Segment(start=5, end=6, text="there"),
        ]
        merged = merge_short_segments(segs)
        assert len(merged) == 2

    def test_empty_input(self):
        assert merge_short_segments([]) == []


class TestCleanSegments:
    def test_removes_loops(self, looping_segments):
        cleaned, stats = clean_segments(looping_segments)
        assert stats.loops_found == 1
        assert stats.loop_segments_removed == 3
        assert stats.final_count < stats.original_count

    def test_removes_silence(self, silence_segments):
        cleaned, stats = clean_segments(silence_segments)
        assert stats.silence_runs_found == 1

    def test_passthrough_clean_input(self, sample_segments):
        cleaned, stats = clean_segments(sample_segments)
        assert stats.loops_found == 0
        assert stats.silence_runs_found == 0

    def test_empty_input(self):
        cleaned, stats = clean_segments([])
        assert cleaned == []
        assert stats.original_count == 0
        assert stats.final_count == 0


class TestGenerateCleanMarkdown:
    def test_generates_markdown(self, sample_segments):
        stats = CleaningStats(original_count=4, final_count=4)
        md = generate_clean_markdown(sample_segments, stats, "Test Title")
        assert "# Test Title" in md
        assert "4 segmentos" in md

    def test_includes_timestamps(self, sample_segments):
        stats = CleaningStats(original_count=4, final_count=4)
        md = generate_clean_markdown(sample_segments, stats, "Test")
        assert "`[00:00]`" in md

    def test_silence_marker_in_markdown(self):
        segs = [
            Segment(start=0, end=5, text="Speech.", type="speech"),
            Segment(start=5, end=10, text="[SIL\u00caNCIO - 00:05]", type="silence"),
            Segment(start=10, end=15, text="More speech.", type="speech"),
        ]
        stats = CleaningStats(original_count=3, final_count=3)
        md = generate_clean_markdown(segs, stats, "Test")
        assert "SIL\u00caNCIO" in md

    def test_gap_marker_in_markdown(self):
        segs = [
            Segment(start=0, end=5, text="Before gap."),
            Segment(start=40, end=45, text="After gap."),
        ]
        stats = CleaningStats(original_count=2, final_count=2)
        md = generate_clean_markdown(segs, stats, "Test")
        assert "INTERVALO" in md

    def test_hour_headers(self):
        segs = [
            Segment(start=0, end=5, text="Hour zero."),
            Segment(start=3600, end=3605, text="Hour one."),
        ]
        stats = CleaningStats(original_count=2, final_count=2)
        md = generate_clean_markdown(segs, stats, "Test")
        assert "In\u00edcio" in md
        assert "Hora 1" in md


class TestCleanTranscriptionFile:
    def test_cleans_json_file(self):
        data = {
            "language": "pt",
            "segments": [
                {"start": 0, "end": 2, "text": "Hello."},
                {"start": 2, "end": 4, "text": "Hello."},
                {"start": 4, "end": 6, "text": "Hello."},
                {"start": 6, "end": 8, "text": "Hello."},
                {"start": 8, "end": 10, "text": "World."},
            ],
        }
        with tempfile.TemporaryDirectory() as tmpdir:
            json_path = Path(tmpdir) / "transcription.json"
            json_path.write_text(json.dumps(data))
            result_path = clean_transcription_file(json_path)
            assert result_path.exists()
            result_data = json.loads(result_path.read_text())
            assert result_data["cleaned_segments"] < 5

    def test_creates_markdown_and_stats(self):
        data = {
            "language": "en",
            "segments": [
                {"start": 0, "end": 5, "text": "Test segment."},
            ],
        }
        with tempfile.TemporaryDirectory() as tmpdir:
            json_path = Path(tmpdir) / "transcription.json"
            json_path.write_text(json.dumps(data))
            clean_transcription_file(json_path)
            assert (Path(tmpdir) / "transcription_clean.md").exists()
            assert (Path(tmpdir) / "stats.json").exists()

    def test_empty_segments_raises(self):
        import pytest
        data = {"language": "pt", "segments": []}
        with tempfile.TemporaryDirectory() as tmpdir:
            json_path = Path(tmpdir) / "empty.json"
            json_path.write_text(json.dumps(data))
            with pytest.raises(ValueError, match="No segments"):
                clean_transcription_file(json_path)

    def test_custom_output_dir(self):
        data = {
            "language": "pt",
            "segments": [{"start": 0, "end": 5, "text": "Hello."}],
        }
        with tempfile.TemporaryDirectory() as tmpdir:
            json_path = Path(tmpdir) / "input.json"
            json_path.write_text(json.dumps(data))
            out_dir = Path(tmpdir) / "output"
            clean_transcription_file(json_path, out_dir)
            assert (out_dir / "transcription_clean.json").exists()
