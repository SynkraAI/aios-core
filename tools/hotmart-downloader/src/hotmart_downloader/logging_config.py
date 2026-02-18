"""Logging configuration for file and console output."""

from __future__ import annotations

import logging
from pathlib import Path

LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(
    log_file: Path | None = None,
    level: int = logging.INFO,
    debug: bool = False,
) -> None:
    """Configure logging for the application.

    Console output is minimal (WARNING+). File output captures everything.
    Debug mode enables DEBUG level on console.
    """
    root_logger = logging.getLogger("hotmart_downloader")
    root_logger.setLevel(logging.DEBUG)

    # Clear any existing handlers
    root_logger.handlers.clear()

    # Console handler - minimal output (Rich handles user-facing output)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG if debug else logging.WARNING)
    console_handler.setFormatter(logging.Formatter(LOG_FORMAT, LOG_DATE_FORMAT))
    root_logger.addHandler(console_handler)

    # File handler - capture everything
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setLevel(level)
        file_handler.setFormatter(logging.Formatter(LOG_FORMAT, LOG_DATE_FORMAT))
        root_logger.addHandler(file_handler)
