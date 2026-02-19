"""Tests for audio module — ffmpeg extraction with mocked subprocess."""

from __future__ import annotations

import subprocess
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from video_transcriber.audio import extract_audio


class TestExtractAudio:
    """Test audio extraction from video files."""

    @patch("video_transcriber.audio.run_command")
    def test_extract_audio_default_output(self, mock_run, tmp_path):
        """Default output is same dir with .wav extension."""
        video = tmp_path / "video.mp4"
        video.write_text("fake video")
        expected_wav = tmp_path / "video.wav"
        expected_wav.write_bytes(b"\x00" * 1024)

        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout="", stderr=""
        )

        result = extract_audio(video)
        assert result == expected_wav
        mock_run.assert_called_once()
        cmd = mock_run.call_args[0][0]
        assert cmd[0] == "ffmpeg"
        assert "-vn" in cmd
        assert "-ar" in cmd
        assert "16000" in cmd

    @patch("video_transcriber.audio.run_command")
    def test_extract_audio_custom_output(self, mock_run, tmp_path):
        """Custom output path is respected."""
        video = tmp_path / "video.mp4"
        video.write_text("fake video")
        custom_out = tmp_path / "custom.wav"
        custom_out.write_bytes(b"\x00" * 2048)

        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout="", stderr=""
        )

        result = extract_audio(video, output_path=custom_out)
        assert result == custom_out

    @patch("video_transcriber.audio.run_command")
    def test_extract_audio_ffmpeg_failure(self, mock_run, tmp_path):
        """RuntimeError raised when ffmpeg fails."""
        video = tmp_path / "video.mp4"
        video.write_text("fake video")

        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=1, stdout="", stderr="codec not found"
        )

        with pytest.raises(RuntimeError, match="ffmpeg failed"):
            extract_audio(video)

    @patch("video_transcriber.audio.run_command")
    def test_extract_audio_uses_correct_timeout(self, mock_run, tmp_path):
        """Timeout from config is passed to run_command."""
        from video_transcriber.config import TIMEOUT_AUDIO_EXTRACT

        video = tmp_path / "video.mp4"
        video.write_text("fake video")
        wav = tmp_path / "video.wav"
        wav.write_bytes(b"\x00" * 512)

        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout="", stderr=""
        )

        extract_audio(video)
        _, kwargs = mock_run.call_args
        assert kwargs["timeout"] == TIMEOUT_AUDIO_EXTRACT

    @patch("video_transcriber.audio.run_command")
    def test_extract_audio_command_has_overwrite_flag(self, mock_run, tmp_path):
        """ffmpeg command includes -y (overwrite)."""
        video = tmp_path / "video.mp4"
        video.write_text("fake video")
        wav = tmp_path / "video.wav"
        wav.write_bytes(b"\x00" * 512)

        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout="", stderr=""
        )

        extract_audio(video)
        cmd = mock_run.call_args[0][0]
        assert "-y" in cmd

    @patch("video_transcriber.audio.run_command")
    def test_extract_audio_mono_channel(self, mock_run, tmp_path):
        """ffmpeg command requests mono audio."""
        video = tmp_path / "video.mp4"
        video.write_text("fake video")
        wav = tmp_path / "video.wav"
        wav.write_bytes(b"\x00" * 512)

        mock_run.return_value = subprocess.CompletedProcess(
            args=[], returncode=0, stdout="", stderr=""
        )

        extract_audio(video)
        cmd = mock_run.call_args[0][0]
        assert "-ac" in cmd
        idx = cmd.index("-ac")
        assert cmd[idx + 1] == "1"
