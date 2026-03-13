"""Tests for audio module."""

import sys
import json
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

# Add parent dir to path so lib.module can be imported as a package
sys.path.insert(0, str(Path(__file__).parent.parent))

from lib.audio import (
    is_audio_file,
    _format_size,
    get_duration,
    compress_audio,
    extract_audio,
    validate_media_file,
)
from lib.exceptions import InvalidMediaFileError


class TestIsAudioFile:
    """Tests for is_audio_file()."""

    def test_mp3_returns_true(self):
        assert is_audio_file('test.mp3') is True

    def test_wav_returns_true(self):
        assert is_audio_file('test.wav') is True

    def test_mp4_returns_true(self):
        assert is_audio_file('test.mp4') is True

    def test_txt_returns_false(self):
        assert is_audio_file('test.txt') is False

    def test_py_returns_false(self):
        assert is_audio_file('test.py') is False

    def test_jpg_returns_false(self):
        assert is_audio_file('test.jpg') is False


class TestFormatSize:
    """Tests for _format_size()."""

    def test_zero_bytes(self):
        assert _format_size(0) == '0.0B'

    def test_bytes_below_kb(self):
        assert _format_size(1023) == '1023.0B'

    def test_exactly_1kb(self):
        assert _format_size(1024) == '1.0KB'

    def test_exactly_1mb(self):
        assert _format_size(1048576) == '1.0MB'

    def test_exactly_1gb(self):
        assert _format_size(1073741824) == '1.0GB'


class TestGetDuration:
    """Tests for get_duration()."""

    def test_success_returns_float(self, tmp_path):
        audio_file = tmp_path / 'test.mp3'
        audio_file.write_bytes(b'\x00' * 100)

        with patch('subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout=json.dumps({'format': {'duration': '3600.5'}}),
                stderr=''
            )
            result = get_duration(str(audio_file))
            assert isinstance(result, float)
            assert result == 3600.5

    def test_ffprobe_failure_returns_zero(self, tmp_path):
        audio_file = tmp_path / 'test.mp3'
        audio_file.write_bytes(b'\x00' * 100)

        with patch('subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(returncode=1, stdout='', stderr='error')
            result = get_duration(str(audio_file))
            assert result == 0

    def test_invalid_json_returns_zero(self, tmp_path):
        audio_file = tmp_path / 'test.mp3'
        audio_file.write_bytes(b'\x00' * 100)

        with patch('subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stdout='invalid json', stderr='')
            result = get_duration(str(audio_file))
            assert result == 0


class TestCompressAudio:
    """Tests for compress_audio()."""

    def test_success_creates_output(self, tmp_path):
        input_file = tmp_path / 'input.mp3'
        output_file = tmp_path / 'output.mp3'
        input_file.write_bytes(b'\x00' * 2048)

        def create_output(*args, **kwargs):
            output_file.write_bytes(b'\x00' * 512)
            return MagicMock(returncode=0, stdout='', stderr='')

        with patch('subprocess.run', side_effect=create_output):
            result = compress_audio(str(input_file), str(output_file))
            assert Path(result) == output_file
            assert output_file.exists()

    def test_failure_raises_runtime_error(self, tmp_path):
        input_file = tmp_path / 'input.mp3'
        output_file = tmp_path / 'output.mp3'
        input_file.write_bytes(b'\x00' * 2048)

        with patch('subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(returncode=1, stdout='', stderr='ffmpeg error')
            with pytest.raises(RuntimeError, match='compression failed'):
                compress_audio(str(input_file), str(output_file))


class TestExtractAudio:
    """Tests for extract_audio()."""

    def test_success_creates_output(self, tmp_path):
        input_file = tmp_path / 'video.mp4'
        output_file = tmp_path / 'audio.mp3'
        input_file.write_bytes(b'\x00' * 2048)

        def create_output(*args, **kwargs):
            output_file.write_bytes(b'\x00' * 512)
            return MagicMock(returncode=0, stdout='', stderr='')

        with patch('subprocess.run', side_effect=create_output):
            result = extract_audio(str(input_file), str(output_file))
            assert Path(result) == output_file
            assert output_file.exists()

    def test_failure_raises_runtime_error(self, tmp_path):
        input_file = tmp_path / 'video.mp4'
        output_file = tmp_path / 'audio.mp3'
        input_file.write_bytes(b'\x00' * 2048)

        with patch('subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(returncode=1, stdout='', stderr='ffmpeg error')
            with pytest.raises(RuntimeError, match='Audio extraction failed'):
                extract_audio(str(input_file), str(output_file))


class TestValidateMediaFile:
    """Tests for validate_media_file()."""

    def test_file_not_found_raises_error(self):
        with pytest.raises(InvalidMediaFileError, match='file not found'):
            validate_media_file('/nonexistent/file.mp3')

    def test_wrong_extension_raises_error(self, tmp_path):
        text_file = tmp_path / 'test.txt'
        text_file.write_text('not an audio file')

        with pytest.raises(InvalidMediaFileError, match='unsupported extension'):
            validate_media_file(str(text_file))

    def test_ffprobe_failure_raises_error(self, tmp_path):
        audio_file = tmp_path / 'test.mp3'
        audio_file.write_bytes(b'\x00' * 100)

        with patch('subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(returncode=1, stdout='', stderr='corrupt file')
            with pytest.raises(InvalidMediaFileError, match='ffprobe validation failed'):
                validate_media_file(str(audio_file))

    def test_valid_file_returns_true(self, tmp_path):
        audio_file = tmp_path / 'test.mp3'
        audio_file.write_bytes(b'\xff\xfb\x90\x00' + b'\x00' * 1024)

        with patch('subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout=json.dumps({'format': {'format_name': 'mp3', 'duration': '60.0'}}),
                stderr=''
            )
            result = validate_media_file(str(audio_file))
            assert result is True
