"""Tests for pipeline module — orchestration with all dependencies mocked."""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from video_transcriber.models import (
    Chunk,
    CleaningStats,
    Metadata,
    Segment,
    TranscriptionResult,
)
from video_transcriber.pipeline import PipelineResult, resolve_output_dir, run_pipeline


class TestResolveOutputDir:
    """Test output directory resolution."""

    def test_uses_explicit_output(self, tmp_path):
        out = tmp_path / "explicit"
        result = resolve_output_dir("https://youtube.com/watch?v=x", out)
        assert result == out
        assert result.exists()

    def test_creates_temp_dir_from_source(self):
        result = resolve_output_dir("https://youtube.com/watch?v=test123", None)
        assert result.exists()
        assert result.name.startswith("vt-")

    def test_same_source_same_dir(self):
        source = "https://youtube.com/watch?v=deterministic"
        r1 = resolve_output_dir(source, None)
        r2 = resolve_output_dir(source, None)
        assert r1 == r2

    def test_different_source_different_dir(self):
        r1 = resolve_output_dir("https://youtube.com/watch?v=aaa", None)
        r2 = resolve_output_dir("https://youtube.com/watch?v=bbb", None)
        assert r1 != r2

    def test_creates_parent_dirs(self, tmp_path):
        deep = tmp_path / "a" / "b" / "c"
        result = resolve_output_dir("x", deep)
        assert result.exists()


class TestPipelineResult:
    """Test PipelineResult dataclass."""

    def test_creation(self, tmp_path):
        r = PipelineResult(
            output_dir=tmp_path,
            metadata=None,
            segments_original=100,
            segments_cleaned=80,
            word_count=5000,
            chunks_count=3,
            language="pt",
        )
        assert r.segments_original == 100
        assert r.word_count == 5000
        assert r.language == "pt"


class TestRunPipelineYoutube:
    """Test run_pipeline with YouTube URL (all deps mocked)."""

    def _mock_deps(self):
        """Create standard mocks for pipeline dependencies."""
        segments = [
            Segment(start=0.0, end=5.0, text="Hello world test content here."),
            Segment(start=5.0, end=10.0, text="More content for testing."),
        ]
        metadata = Metadata(
            title="Test Video", url="https://youtube.com/watch?v=abc",
            duration=120.0, channel="TestChan",
        )
        transcription = TranscriptionResult(
            language="pt", segments=segments,
            full_text="Hello world test content here. More content for testing.",
        )
        stats = CleaningStats(original_count=2, final_count=2)
        chunks = [
            Chunk(index=0, text="Hello world test content here. More content for testing.",
                  start_time=0.0, end_time=10.0, word_count=10),
        ]
        return segments, metadata, transcription, stats, chunks

    @patch("video_transcriber.pipeline.save_chunks")
    @patch("video_transcriber.pipeline.chunk_transcription")
    @patch("video_transcriber.pipeline.generate_clean_markdown", return_value="# Clean MD")
    @patch("video_transcriber.pipeline.clean_segments")
    @patch("video_transcriber.pipeline.save_transcription")
    @patch("video_transcriber.pipeline.transcribe")
    @patch("video_transcriber.pipeline.download_youtube_audio")
    @patch("video_transcriber.pipeline.download_youtube_metadata")
    def test_youtube_pipeline_success(
        self, mock_meta, mock_dl, mock_transcribe, mock_save_tr,
        mock_clean, mock_md, mock_chunk, mock_save_chunks, tmp_path,
    ):
        segments, metadata, transcription, stats, chunks = self._mock_deps()

        mock_meta.return_value = metadata
        mock_dl.return_value = tmp_path / "audio.wav"
        mock_transcribe.return_value = transcription
        mock_clean.return_value = (segments, stats)
        mock_chunk.return_value = chunks

        result = run_pipeline("https://youtube.com/watch?v=abc", tmp_path)

        assert isinstance(result, PipelineResult)
        assert result.metadata.title == "Test Video"
        assert result.segments_original == 2
        assert result.chunks_count == 1
        assert result.language == "pt"

        # Verify metadata.json was saved
        meta_path = tmp_path / "metadata.json"
        assert meta_path.exists()

        # Verify clean markdown was saved
        clean_md = tmp_path / "transcription_clean.md"
        assert clean_md.exists()

        # Verify stats.json was saved
        stats_path = tmp_path / "stats.json"
        assert stats_path.exists()

    @patch("video_transcriber.pipeline.save_chunks")
    @patch("video_transcriber.pipeline.chunk_transcription")
    @patch("video_transcriber.pipeline.generate_clean_markdown", return_value="# MD")
    @patch("video_transcriber.pipeline.clean_segments")
    @patch("video_transcriber.pipeline.save_transcription")
    @patch("video_transcriber.pipeline.transcribe")
    @patch("video_transcriber.pipeline.download_youtube_audio")
    @patch("video_transcriber.pipeline.download_youtube_metadata")
    def test_youtube_pipeline_saves_clean_json(
        self, mock_meta, mock_dl, mock_transcribe, mock_save_tr,
        mock_clean, mock_md, mock_chunk, mock_save_chunks, tmp_path,
    ):
        segments, metadata, transcription, stats, chunks = self._mock_deps()
        mock_meta.return_value = metadata
        mock_dl.return_value = tmp_path / "audio.wav"
        mock_transcribe.return_value = transcription
        mock_clean.return_value = (segments, stats)
        mock_chunk.return_value = chunks

        run_pipeline("https://youtube.com/watch?v=abc", tmp_path)

        clean_json = tmp_path / "transcription_clean.json"
        assert clean_json.exists()
        data = json.loads(clean_json.read_text())
        assert data["language"] == "pt"
        assert len(data["segments"]) == 2


class TestRunPipelineLocal:
    """Test run_pipeline with local file."""

    @patch("video_transcriber.pipeline.save_chunks")
    @patch("video_transcriber.pipeline.chunk_transcription")
    @patch("video_transcriber.pipeline.generate_clean_markdown", return_value="# MD")
    @patch("video_transcriber.pipeline.clean_segments")
    @patch("video_transcriber.pipeline.save_transcription")
    @patch("video_transcriber.pipeline.transcribe")
    def test_local_audio_file(
        self, mock_transcribe, mock_save_tr, mock_clean,
        mock_md, mock_chunk, mock_save_chunks, tmp_path,
    ):
        audio = tmp_path / "audio.mp3"
        audio.write_bytes(b"\x00" * 1024)

        segments = [Segment(start=0.0, end=5.0, text="Test audio content.")]
        result_tr = TranscriptionResult(language="en", segments=segments, full_text="Test audio content.")
        stats = CleaningStats(original_count=1, final_count=1)
        chunks = [Chunk(index=0, text="Test audio content.", start_time=0.0, end_time=5.0, word_count=3)]

        mock_transcribe.return_value = result_tr
        mock_clean.return_value = (segments, stats)
        mock_chunk.return_value = chunks

        result = run_pipeline(str(audio), tmp_path)
        assert result.language == "en"
        assert result.metadata is None

    @patch("video_transcriber.pipeline.save_chunks")
    @patch("video_transcriber.pipeline.chunk_transcription")
    @patch("video_transcriber.pipeline.generate_clean_markdown", return_value="# MD")
    @patch("video_transcriber.pipeline.clean_segments")
    @patch("video_transcriber.pipeline.save_transcription")
    @patch("video_transcriber.pipeline.transcribe")
    @patch("video_transcriber.pipeline.extract_audio")
    def test_local_video_extracts_audio(
        self, mock_extract, mock_transcribe, mock_save_tr,
        mock_clean, mock_md, mock_chunk, mock_save_chunks, tmp_path,
    ):
        video = tmp_path / "video.mp4"
        video.write_bytes(b"\x00" * 1024)
        audio = tmp_path / "video.wav"

        mock_extract.return_value = audio
        segments = [Segment(start=0.0, end=5.0, text="Video speech.")]
        mock_transcribe.return_value = TranscriptionResult(
            language="pt", segments=segments, full_text="Video speech.",
        )
        mock_clean.return_value = (segments, CleaningStats(original_count=1, final_count=1))
        mock_chunk.return_value = [
            Chunk(index=0, text="Video speech.", start_time=0.0, end_time=5.0, word_count=2),
        ]

        result = run_pipeline(str(video), tmp_path)
        mock_extract.assert_called_once()
        assert result.language == "pt"

    def test_unsupported_local_format(self, tmp_path):
        txt_file = tmp_path / "file.xyz"
        txt_file.write_text("not media")

        with pytest.raises(ValueError, match="Unsupported format"):
            run_pipeline(str(txt_file), tmp_path)

    def test_unrecognized_source(self, tmp_path):
        with pytest.raises(ValueError, match="Source not recognized"):
            run_pipeline("/nonexistent/path/file.mp3", tmp_path)
