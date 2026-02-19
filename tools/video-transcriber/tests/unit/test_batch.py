"""Tests for batch module — playlist processing with mocked dependencies."""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from video_transcriber.batch import BatchResult, _save_batch_index, process_playlist
from video_transcriber.pipeline import PipelineResult


class TestBatchResult:
    """Test BatchResult dataclass."""

    def test_defaults(self, tmp_path):
        r = BatchResult(playlist_url="https://youtube.com/playlist?list=PLx", output_dir=tmp_path)
        assert r.total_videos == 0
        assert r.processed == 0
        assert r.failed == 0
        assert r.total_words == 0
        assert r.total_chunks == 0
        assert r.results == []
        assert r.errors == []

    def test_mutable_fields(self, tmp_path):
        r = BatchResult(playlist_url="x", output_dir=tmp_path)
        r.processed = 3
        r.total_words = 5000
        r.results.append({"index": 1, "title": "A"})
        assert r.processed == 3
        assert len(r.results) == 1


class TestSaveBatchIndex:
    """Test _save_batch_index function."""

    def test_saves_json_file(self, tmp_path):
        batch = BatchResult(
            playlist_url="https://youtube.com/playlist?list=PLx",
            output_dir=tmp_path,
            total_videos=3,
            processed=2,
            failed=1,
            total_words=1000,
            total_chunks=5,
            results=[{"index": 1, "title": "Video 1", "words": 500}],
            errors=[{"index": 3, "title": "Video 3", "error": "timeout"}],
        )

        _save_batch_index(batch)

        index_path = tmp_path / "batch-index.json"
        assert index_path.exists()

        data = json.loads(index_path.read_text(encoding="utf-8"))
        assert data["playlist_url"] == "https://youtube.com/playlist?list=PLx"
        assert data["total_videos"] == 3
        assert data["processed"] == 2
        assert data["failed"] == 1
        assert data["total_words"] == 1000
        assert data["total_chunks"] == 5
        assert len(data["videos"]) == 1
        assert len(data["errors"]) == 1

    def test_json_supports_unicode(self, tmp_path):
        batch = BatchResult(
            playlist_url="https://youtube.com/playlist?list=PLx",
            output_dir=tmp_path,
            results=[{"title": "Vídeo com acentuação"}],
        )
        _save_batch_index(batch)

        content = (tmp_path / "batch-index.json").read_text(encoding="utf-8")
        assert "acentuação" in content


class TestProcessPlaylist:
    """Test process_playlist with mocked dependencies."""

    @patch("video_transcriber.batch._save_batch_index")
    @patch("video_transcriber.batch.run_pipeline")
    @patch("video_transcriber.batch.list_playlist")
    def test_processes_all_videos(self, mock_list, mock_pipeline, mock_save, tmp_path):
        mock_list.return_value = [
            {"id": "v1", "title": "Video One", "url": "https://youtube.com/watch?v=v1"},
            {"id": "v2", "title": "Video Two", "url": "https://youtube.com/watch?v=v2"},
        ]

        mock_pipeline.return_value = PipelineResult(
            output_dir=tmp_path, metadata=None,
            segments_original=10, segments_cleaned=8,
            word_count=500, chunks_count=2, language="pt",
        )

        result = process_playlist("https://youtube.com/playlist?list=PLx", tmp_path)

        assert isinstance(result, BatchResult)
        assert result.total_videos == 2
        assert result.processed == 2
        assert result.failed == 0
        assert result.total_words == 1000
        assert result.total_chunks == 4
        assert len(result.results) == 2
        assert mock_pipeline.call_count == 2

    @patch("video_transcriber.batch._save_batch_index")
    @patch("video_transcriber.batch.run_pipeline")
    @patch("video_transcriber.batch.list_playlist")
    def test_handles_pipeline_failure(self, mock_list, mock_pipeline, mock_save, tmp_path):
        mock_list.return_value = [
            {"id": "v1", "title": "Good Video", "url": "https://youtube.com/watch?v=v1"},
            {"id": "v2", "title": "Bad Video", "url": "https://youtube.com/watch?v=v2"},
        ]

        def side_effect(**kwargs):
            if "v2" in kwargs.get("source", ""):
                raise RuntimeError("network error")
            return PipelineResult(
                output_dir=tmp_path, metadata=None,
                segments_original=5, segments_cleaned=5,
                word_count=200, chunks_count=1, language="pt",
            )

        mock_pipeline.side_effect = lambda source, **kw: side_effect(source=source, **kw)

        result = process_playlist("https://youtube.com/playlist?list=PLx", tmp_path)
        assert result.processed == 1
        assert result.failed == 1
        assert len(result.errors) == 1
        assert "network error" in result.errors[0]["error"]

    @patch("video_transcriber.batch._save_batch_index")
    @patch("video_transcriber.batch.run_pipeline")
    @patch("video_transcriber.batch.list_playlist")
    def test_empty_playlist(self, mock_list, mock_pipeline, mock_save, tmp_path):
        mock_list.return_value = []

        result = process_playlist("https://youtube.com/playlist?list=PLx", tmp_path)
        assert result.total_videos == 0
        assert result.processed == 0
        mock_pipeline.assert_not_called()

    @patch("video_transcriber.batch._save_batch_index")
    @patch("video_transcriber.batch.run_pipeline")
    @patch("video_transcriber.batch.list_playlist")
    def test_constructs_url_from_id(self, mock_list, mock_pipeline, mock_save, tmp_path):
        mock_list.return_value = [
            {"id": "abc123", "title": "No URL Video"},
        ]
        mock_pipeline.return_value = PipelineResult(
            output_dir=tmp_path, metadata=None,
            segments_original=1, segments_cleaned=1,
            word_count=50, chunks_count=1, language="pt",
        )

        process_playlist("https://youtube.com/playlist?list=PLx", tmp_path)

        call_args = mock_pipeline.call_args
        source = call_args[1].get("source") or call_args[0][0]
        assert "abc123" in source

    @patch("video_transcriber.batch._save_batch_index")
    @patch("video_transcriber.batch.run_pipeline")
    @patch("video_transcriber.batch.list_playlist")
    def test_sanitizes_directory_names(self, mock_list, mock_pipeline, mock_save, tmp_path):
        mock_list.return_value = [
            {"id": "v1", "title": "Video/With\\Bad..Chars", "url": "https://youtube.com/watch?v=v1"},
        ]
        mock_pipeline.return_value = PipelineResult(
            output_dir=tmp_path, metadata=None,
            segments_original=1, segments_cleaned=1,
            word_count=10, chunks_count=1, language="pt",
        )

        process_playlist("https://youtube.com/playlist?list=PLx", tmp_path)

        call_args = mock_pipeline.call_args
        video_dir = call_args[1].get("output_dir") or call_args[0][1]
        dir_name = Path(video_dir).name
        assert "/" not in dir_name
        assert "\\" not in dir_name
        assert ".." not in dir_name

    @patch("video_transcriber.batch._save_batch_index")
    @patch("video_transcriber.batch.run_pipeline")
    @patch("video_transcriber.batch.list_playlist")
    def test_saves_batch_index(self, mock_list, mock_pipeline, mock_save, tmp_path):
        mock_list.return_value = []

        process_playlist("https://youtube.com/playlist?list=PLx", tmp_path)
        mock_save.assert_called_once()

    def test_rejects_invalid_url(self, tmp_path):
        with pytest.raises(ValueError):
            process_playlist("ftp://bad-url.com/playlist", tmp_path)
