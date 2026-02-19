"""Structured logging setup — dual output: file + Rich console."""

from __future__ import annotations

import logging
import os
from pathlib import Path

from rich.logging import RichHandler

# Environment config
LOG_LEVEL = os.environ.get("VT_LOG_LEVEL", "INFO").upper()
LOG_FILE = os.environ.get("VT_LOG_FILE", "")

_configured = False


def setup_logging() -> logging.Logger:
    """Configure the video-transcriber logger.

    - Console: RichHandler (pretty, stderr)
    - File: plain text with timestamps (if VT_LOG_FILE is set)

    Returns:
        The configured 'video_transcriber' logger.
    """
    global _configured
    if _configured:
        return logging.getLogger("video_transcriber")

    logger = logging.getLogger("video_transcriber")
    logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))
    logger.handlers.clear()

    # Rich console handler (stderr, matches existing UX)
    console_handler = RichHandler(
        level=logging.INFO,
        show_time=False,
        show_path=False,
        markup=True,
        rich_tracebacks=True,
    )
    console_handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(console_handler)

    # File handler (optional, enabled via VT_LOG_FILE)
    if LOG_FILE:
        log_path = Path(LOG_FILE)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_path, encoding="utf-8")
        file_handler.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))
        file_handler.setFormatter(
            logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
        )
        logger.addHandler(file_handler)

    _configured = True
    return logger


def get_logger(name: str = "") -> logging.Logger:
    """Get a child logger under 'video_transcriber'.

    Args:
        name: Sub-logger name (e.g., 'transcriber', 'cleaner').

    Returns:
        Logger instance.
    """
    setup_logging()
    if name:
        return logging.getLogger(f"video_transcriber.{name}")
    return logging.getLogger("video_transcriber")
