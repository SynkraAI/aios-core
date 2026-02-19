"""Tests for config module — constants, env vars, extension sets."""

from __future__ import annotations

import os
from unittest.mock import patch

from video_transcriber import config


class TestConstants:
    """Verify all constants have correct types and values."""

    def test_timeout_metadata_is_positive_int(self):
        assert isinstance(config.TIMEOUT_METADATA, int)
        assert config.TIMEOUT_METADATA > 0

    def test_timeout_download_is_positive_int(self):
        assert isinstance(config.TIMEOUT_DOWNLOAD, int)
        assert config.TIMEOUT_DOWNLOAD > 0

    def test_timeout_audio_extract_is_positive_int(self):
        assert isinstance(config.TIMEOUT_AUDIO_EXTRACT, int)
        assert config.TIMEOUT_AUDIO_EXTRACT > 0

    def test_timeout_subtitle_is_positive_int(self):
        assert isinstance(config.TIMEOUT_SUBTITLE, int)
        assert config.TIMEOUT_SUBTITLE > 0

    def test_timeout_gdrive_is_positive_int(self):
        assert isinstance(config.TIMEOUT_GDRIVE, int)
        assert config.TIMEOUT_GDRIVE > 0

    def test_retry_config_values(self):
        assert config.RETRY_MAX_ATTEMPTS >= 1
        assert config.RETRY_DELAY > 0
        assert config.RETRY_BACKOFF >= 1

    def test_default_model_in_whisper_models(self):
        assert config.DEFAULT_MODEL in config.WHISPER_MODELS

    def test_whisper_models_tuple(self):
        assert isinstance(config.WHISPER_MODELS, tuple)
        assert len(config.WHISPER_MODELS) == 5
        assert "tiny" in config.WHISPER_MODELS
        assert "large" in config.WHISPER_MODELS

    def test_default_language(self):
        assert config.DEFAULT_LANGUAGE == "pt"

    def test_chunk_max_words(self):
        assert isinstance(config.CHUNK_MAX_WORDS, int)
        assert config.CHUNK_MAX_WORDS > 0


class TestExtensionSets:
    """Verify extension sets are correct and consistent."""

    def test_audio_extensions_are_set(self):
        assert isinstance(config.AUDIO_EXTENSIONS, set)
        assert ".mp3" in config.AUDIO_EXTENSIONS
        assert ".wav" in config.AUDIO_EXTENSIONS

    def test_video_extensions_are_set(self):
        assert isinstance(config.VIDEO_EXTENSIONS, set)
        assert ".mp4" in config.VIDEO_EXTENSIONS
        assert ".mkv" in config.VIDEO_EXTENSIONS

    def test_media_is_union_of_audio_and_video(self):
        assert config.MEDIA_EXTENSIONS == config.AUDIO_EXTENSIONS | config.VIDEO_EXTENSIONS

    def test_text_extensions(self):
        assert isinstance(config.TEXT_EXTENSIONS, set)
        assert ".vtt" in config.TEXT_EXTENSIONS
        assert ".srt" in config.TEXT_EXTENSIONS
        assert ".txt" in config.TEXT_EXTENSIONS
        assert ".md" in config.TEXT_EXTENSIONS
        assert ".json" in config.TEXT_EXTENSIONS

    def test_no_overlap_audio_video(self):
        overlap = config.AUDIO_EXTENSIONS & config.VIDEO_EXTENSIONS
        assert len(overlap) == 0, f"Overlap between audio and video: {overlap}"

    def test_extensions_have_dots(self):
        for ext in config.AUDIO_EXTENSIONS | config.VIDEO_EXTENSIONS | config.TEXT_EXTENSIONS:
            assert ext.startswith("."), f"Extension missing dot: {ext}"


class TestOutputPaths:
    """Verify output paths use XDG and env vars."""

    def test_youtube_output_is_path(self):
        from pathlib import Path
        assert isinstance(config.YOUTUBE_OUTPUT, Path)

    def test_courses_output_is_path(self):
        from pathlib import Path
        assert isinstance(config.COURSES_OUTPUT, Path)

    def test_default_paths_contain_video_transcriber(self):
        assert "video-transcriber" in str(config._vt_data)
