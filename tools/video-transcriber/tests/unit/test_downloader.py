"""Tests for downloader module — yt-dlp and gdown with mocked subprocess."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from unittest.mock import patch

import pytest

from video_transcriber.downloader import (
    download_gdrive,
    download_youtube_audio,
    download_youtube_metadata,
    download_youtube_subtitles,
    list_playlist,
)


class TestDownloadYoutubeMetadata:
    """Test YouTube metadata extraction."""

    @patch("video_transcriber.downloader.run_command")
    def test_returns_metadata_from_json(self, mock_run):
        data = {
            "id": "abc123",
            "title": "Test Video",
            "duration": 180.0,
            "channel": "TestChan",
            "description": "Desc",
        }
        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout=json.dumps(data), stderr=""
        )

        meta = download_youtube_metadata("https://youtube.com/watch?v=abc123")
        assert meta.title == "Test Video"
        assert meta.duration == 180.0
        assert meta.channel == "TestChan"
        assert "abc123" in meta.thumbnail_url

    @patch("video_transcriber.downloader.run_command")
    def test_raises_on_failure(self, mock_run):
        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=1, stdout="", stderr="network error"
        )

        with pytest.raises(RuntimeError, match="yt-dlp metadata failed"):
            download_youtube_metadata("https://youtube.com/watch?v=abc123")

    @patch("video_transcriber.downloader.run_command")
    def test_handles_missing_fields(self, mock_run):
        data = {"id": "", "text": "hello"}
        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout=json.dumps(data), stderr=""
        )

        meta = download_youtube_metadata("https://youtube.com/watch?v=x")
        assert meta.title == "Unknown"
        assert meta.channel == ""
        assert meta.thumbnail_url == ""

    def test_rejects_invalid_url(self):
        with pytest.raises(ValueError):
            download_youtube_metadata("ftp://bad.com/video")


class TestDownloadYoutubeAudio:
    """Test YouTube audio download."""

    @patch("video_transcriber.downloader.run_command")
    def test_returns_wav_path(self, mock_run, tmp_path):
        wav_file = tmp_path / "test_video.wav"
        wav_file.write_bytes(b"\x00" * 4096)

        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout="", stderr=""
        )

        result = download_youtube_audio("https://youtube.com/watch?v=abc", tmp_path)
        assert result == wav_file
        assert result.suffix == ".wav"

    @patch("video_transcriber.downloader.run_command")
    def test_raises_on_download_failure(self, mock_run, tmp_path):
        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=1, stdout="", stderr="download failed"
        )

        with pytest.raises(RuntimeError, match="yt-dlp download failed"):
            download_youtube_audio("https://youtube.com/watch?v=abc", tmp_path)

    @patch("video_transcriber.downloader.run_command")
    def test_raises_when_no_wav_found(self, mock_run, tmp_path):
        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout="", stderr=""
        )

        with pytest.raises(RuntimeError, match="No WAV file found"):
            download_youtube_audio("https://youtube.com/watch?v=abc", tmp_path)

    @patch("video_transcriber.downloader.run_command")
    def test_creates_output_dir(self, mock_run, tmp_path):
        new_dir = tmp_path / "subdir" / "output"
        wav_file = new_dir / "audio.wav"

        def side_effect(cmd, **kwargs):
            new_dir.mkdir(parents=True, exist_ok=True)
            wav_file.write_bytes(b"\x00" * 1024)
            return subprocess.CompletedProcess(args=[], returncode=0, stdout="", stderr="")

        mock_run.side_effect = side_effect
        result = download_youtube_audio("https://youtube.com/watch?v=abc", new_dir)
        assert result.exists()

    def test_rejects_invalid_url(self, tmp_path):
        with pytest.raises(ValueError):
            download_youtube_audio("file:///etc/passwd", tmp_path)


class TestDownloadYoutubeSubtitles:
    """Test subtitle download."""

    @patch("video_transcriber.downloader.run_command")
    def test_returns_srt_path(self, mock_run, tmp_path):
        srt_file = tmp_path / "video.srt"
        srt_file.write_text("1\n00:00:00 --> 00:00:05\nHello\n")

        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout="", stderr=""
        )

        result = download_youtube_subtitles("https://youtube.com/watch?v=abc", tmp_path)
        assert result == srt_file

    @patch("video_transcriber.downloader.run_command")
    def test_returns_none_on_failure(self, mock_run, tmp_path):
        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=1, stdout="", stderr="no subs"
        )

        result = download_youtube_subtitles("https://youtube.com/watch?v=abc", tmp_path)
        assert result is None

    @patch("video_transcriber.downloader.run_command")
    def test_returns_none_when_no_srt_found(self, mock_run, tmp_path):
        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout="", stderr=""
        )

        result = download_youtube_subtitles("https://youtube.com/watch?v=abc", tmp_path)
        assert result is None


class TestListPlaylist:
    """Test playlist listing."""

    @patch("video_transcriber.downloader.run_command")
    def test_parses_ndjson_entries(self, mock_run):
        entries = [
            {"id": "v1", "title": "Video 1"},
            {"id": "v2", "title": "Video 2"},
        ]
        stdout = "\n".join(json.dumps(e) for e in entries)
        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout=stdout, stderr=""
        )

        result = list_playlist("https://youtube.com/playlist?list=PLxxx")
        assert len(result) == 2
        assert result[0]["id"] == "v1"
        assert result[1]["title"] == "Video 2"

    @patch("video_transcriber.downloader.run_command")
    def test_raises_on_failure(self, mock_run):
        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=1, stdout="", stderr="playlist error"
        )

        with pytest.raises(RuntimeError, match="yt-dlp playlist failed"):
            list_playlist("https://youtube.com/playlist?list=PLxxx")

    @patch("video_transcriber.downloader.run_command")
    def test_handles_empty_playlist(self, mock_run):
        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout="", stderr=""
        )

        result = list_playlist("https://youtube.com/playlist?list=PLxxx")
        assert result == []


class TestDownloadGdrive:
    """Test Google Drive download."""

    @patch("video_transcriber.downloader.run_command")
    def test_returns_output_dir(self, mock_run, tmp_path):
        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout="", stderr=""
        )

        result = download_gdrive("https://drive.google.com/folder/abc", tmp_path)
        assert result == tmp_path

    @patch("video_transcriber.downloader.run_command")
    def test_retries_with_fuzzy_on_failure(self, mock_run, tmp_path):
        call_count = 0

        def side_effect(cmd, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return subprocess.CompletedProcess(args=[], returncode=1, stdout="", stderr="fail")
            return subprocess.CompletedProcess(args=[], returncode=0, stdout="", stderr="")

        mock_run.side_effect = side_effect
        result = download_gdrive("https://drive.google.com/folder/abc", tmp_path)
        assert result == tmp_path
        assert call_count == 2
        # Second call should include --fuzzy
        second_cmd = mock_run.call_args_list[1][0][0]
        assert "--fuzzy" in second_cmd

    @patch("video_transcriber.downloader.run_command")
    def test_raises_when_both_fail(self, mock_run, tmp_path):
        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=1, stdout="", stderr="gdown error"
        )

        with pytest.raises(RuntimeError, match="gdown failed"):
            download_gdrive("https://drive.google.com/folder/abc", tmp_path)
