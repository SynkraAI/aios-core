"""Shared pytest fixtures for aios-transcriber tests."""

import pytest
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock
import json


@pytest.fixture
def tmp_audio_file(tmp_path):
    """Create a minimal file with audio extension for testing."""
    audio = tmp_path / "test.mp3"
    audio.write_bytes(b'\xff\xfb\x90\x00' + b'\x00' * 1024)
    return audio


@pytest.fixture
def tmp_video_file(tmp_path):
    """Create a minimal file with video extension for testing."""
    video = tmp_path / "test.mp4"
    video.write_bytes(b'\x00' * 2048)
    return video


@pytest.fixture
def sample_transcription_data():
    """Sample transcription data dict for formatter tests."""
    return {
        'title': 'Test Video Title',
        'source': 'https://youtube.com/watch?v=test123',
        'source_type': 'youtube_captions',
        'engine': 'yt-dlp',
        'language': 'pt-BR',
        'duration': '01:30:00',
        'text': 'This is a test transcription with some words.',
        'word_count': 9,
        'channel': 'Test Channel',
        'date': '2026-01-15',
        'subtitle_type': 'manual',
    }


@pytest.fixture
def mock_ffmpeg_success():
    """Mock subprocess.run for successful ffmpeg execution."""
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0, stdout='', stderr='')
        yield mock_run


@pytest.fixture
def mock_ffprobe_duration():
    """Mock ffprobe returning duration."""
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout=json.dumps({'format': {'duration': '3600.5'}}),
            stderr=''
        )
        yield mock_run
