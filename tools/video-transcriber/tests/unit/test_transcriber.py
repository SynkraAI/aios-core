"""Tests for transcriber module (parse, save, load)."""

import json
import tempfile
from pathlib import Path

from video_transcriber.models import Segment, TranscriptionResult
from video_transcriber.transcriber import (
    _parse_whisper_result,
    load_transcription,
    save_transcription,
)


class TestParseWhisperResult:
    def test_parses_segments(self, whisper_raw_result):
        result = _parse_whisper_result(whisper_raw_result)
        assert result.language == "pt"
        assert len(result.segments) == 2
        assert result.segments[0].text == "Olá mundo."
        assert result.segments[1].text == "Segundo segmento."

    def test_strips_whitespace(self, whisper_raw_result):
        result = _parse_whisper_result(whisper_raw_result)
        for seg in result.segments:
            assert seg.text == seg.text.strip()

    def test_empty_segments(self):
        result = _parse_whisper_result({"language": "en", "text": "", "segments": []})
        assert result.segments == []
        assert result.language == "en"

    def test_missing_language(self):
        result = _parse_whisper_result({"segments": []})
        assert result.language == "unknown"


class TestSaveAndLoadTranscription:
    def test_round_trip(self, sample_transcription_result):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "transcription.json"
            save_transcription(sample_transcription_result, path)

            assert path.exists()
            loaded = load_transcription(path)

            assert loaded.language == sample_transcription_result.language
            assert len(loaded.segments) == len(sample_transcription_result.segments)
            assert loaded.full_text == sample_transcription_result.full_text

    def test_save_creates_parent_dirs(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "deep" / "nested" / "transcription.json"
            result = TranscriptionResult(language="en", segments=[], full_text="")
            save_transcription(result, path)
            assert path.exists()

    def test_load_preserves_segment_type(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "test.json"
            data = {
                "language": "pt",
                "full_text": "hello",
                "segments": [
                    {"start": 0, "end": 1, "text": "hello", "type": "silence"}
                ],
            }
            path.write_text(json.dumps(data))
            loaded = load_transcription(path)
            assert loaded.segments[0].type == "silence"

    def test_file_not_found(self):
        import pytest
        with pytest.raises(FileNotFoundError):
            from video_transcriber.transcriber import transcribe
            transcribe(Path("/nonexistent/audio.wav"))
