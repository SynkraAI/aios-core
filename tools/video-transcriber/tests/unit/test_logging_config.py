"""Tests for logging_config module — structured logging setup."""

from __future__ import annotations

import logging
from pathlib import Path
from unittest.mock import patch

import pytest

import video_transcriber.logging_config as log_mod


@pytest.fixture(autouse=True)
def reset_logging_state():
    """Reset the singleton flag before each test."""
    log_mod._configured = False
    logger = logging.getLogger("video_transcriber")
    logger.handlers.clear()
    yield
    log_mod._configured = False
    logger.handlers.clear()


class TestSetupLogging:
    """Test setup_logging function."""

    def test_returns_logger(self):
        logger = log_mod.setup_logging()
        assert isinstance(logger, logging.Logger)
        assert logger.name == "video_transcriber"

    def test_adds_console_handler(self):
        logger = log_mod.setup_logging()
        assert len(logger.handlers) >= 1

    def test_singleton_pattern(self):
        logger1 = log_mod.setup_logging()
        handler_count = len(logger1.handlers)
        logger2 = log_mod.setup_logging()
        assert logger1 is logger2
        assert len(logger2.handlers) == handler_count

    @patch.dict("os.environ", {"VT_LOG_LEVEL": "DEBUG"})
    def test_respects_log_level_env(self):
        # Reload to pick up env var
        import importlib
        importlib.reload(log_mod)
        log_mod._configured = False

        logger = log_mod.setup_logging()
        assert logger.level == logging.DEBUG

        # Cleanup: reload to restore defaults
        importlib.reload(log_mod)

    @patch.dict("os.environ", {"VT_LOG_LEVEL": "WARNING"})
    def test_warning_level(self):
        import importlib
        importlib.reload(log_mod)
        log_mod._configured = False

        logger = log_mod.setup_logging()
        assert logger.level == logging.WARNING

        importlib.reload(log_mod)

    @patch.dict("os.environ", {"VT_LOG_FILE": ""})
    def test_no_file_handler_by_default(self):
        import importlib
        importlib.reload(log_mod)
        log_mod._configured = False

        logger = log_mod.setup_logging()
        file_handlers = [h for h in logger.handlers if isinstance(h, logging.FileHandler)]
        assert len(file_handlers) == 0

        importlib.reload(log_mod)

    def test_file_handler_when_log_file_set(self, tmp_path):
        log_file = str(tmp_path / "test.log")

        with patch.object(log_mod, "LOG_FILE", log_file):
            log_mod._configured = False
            logger = log_mod.setup_logging()
            file_handlers = [h for h in logger.handlers if isinstance(h, logging.FileHandler)]
            assert len(file_handlers) == 1

    def test_file_handler_creates_parent_dirs(self, tmp_path):
        log_file = str(tmp_path / "deep" / "nested" / "test.log")

        with patch.object(log_mod, "LOG_FILE", log_file):
            log_mod._configured = False
            logger = log_mod.setup_logging()
            assert (tmp_path / "deep" / "nested").exists()


class TestGetLogger:
    """Test get_logger function."""

    def test_returns_root_logger_without_name(self):
        logger = log_mod.get_logger()
        assert logger.name == "video_transcriber"

    def test_returns_child_logger_with_name(self):
        logger = log_mod.get_logger("transcriber")
        assert logger.name == "video_transcriber.transcriber"

    def test_returns_child_logger_cleaner(self):
        logger = log_mod.get_logger("cleaner")
        assert logger.name == "video_transcriber.cleaner"

    def test_triggers_setup(self):
        assert log_mod._configured is False
        log_mod.get_logger()
        assert log_mod._configured is True
