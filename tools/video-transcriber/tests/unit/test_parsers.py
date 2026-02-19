"""Tests for parsers module (subtitle and text parsing)."""

import tempfile
from pathlib import Path

from video_transcriber.parsers import parse_subtitles, text_to_segments


class TestParseSubtitles:
    def test_parses_srt(self):
        srt_content = """1
00:00:00,000 --> 00:00:03,000
Hello world.

2
00:00:03,000 --> 00:00:06,000
Second line.
"""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".srt", delete=False) as f:
            f.write(srt_content)
            f.flush()
            result = parse_subtitles(Path(f.name))
        assert "Hello world." in result
        assert "Second line." in result

    def test_parses_vtt(self):
        vtt_content = """WEBVTT
Kind: captions
Language: en

00:00.000 --> 00:03.000
Hello world.

00:03.000 --> 00:06.000
Second line.
"""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".vtt", delete=False) as f:
            f.write(vtt_content)
            f.flush()
            result = parse_subtitles(Path(f.name))
        assert "Hello world." in result
        assert "Second line." in result

    def test_strips_vtt_tags(self):
        vtt_content = """WEBVTT

00:00.000 --> 00:03.000
<v Speaker>Hello</v> <c>world</c>.
"""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".vtt", delete=False) as f:
            f.write(vtt_content)
            f.flush()
            result = parse_subtitles(Path(f.name))
        assert "<v" not in result
        assert "<c>" not in result
        assert "Hello" in result

    def test_deduplicates_consecutive_lines(self):
        srt_content = """1
00:00:00,000 --> 00:00:03,000
Same line.

2
00:00:03,000 --> 00:00:06,000
Same line.

3
00:00:06,000 --> 00:00:09,000
Different line.
"""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".srt", delete=False) as f:
            f.write(srt_content)
            f.flush()
            result = parse_subtitles(Path(f.name))
        assert result.count("Same line.") == 1


class TestTextToSegments:
    def test_splits_paragraphs(self):
        text = "First paragraph.\n\nSecond paragraph."
        segments = text_to_segments(text)
        assert len(segments) == 2
        assert segments[0].text == "First paragraph."
        assert segments[1].text == "Second paragraph."

    def test_sequential_timestamps(self):
        text = "One.\n\nTwo.\n\nThree."
        segments = text_to_segments(text)
        for i in range(1, len(segments)):
            assert segments[i].start >= segments[i - 1].end

    def test_empty_input(self):
        assert text_to_segments("") == []
        assert text_to_segments("   ") == []

    def test_single_paragraph(self):
        segments = text_to_segments("Just one paragraph.")
        assert len(segments) == 1
        assert segments[0].type == "speech"

    def test_minimum_duration(self):
        segments = text_to_segments("Hi.")
        assert segments[0].end - segments[0].start >= 1.0
