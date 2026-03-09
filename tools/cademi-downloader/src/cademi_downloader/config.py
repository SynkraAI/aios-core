"""Configuration and settings via dotenv."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

from cademi_downloader.exceptions import ConfigError

# Default settings
DEFAULT_OUTPUT_DIR = "downloads"
DEFAULT_QUALITY = "best"
DEFAULT_MAX_RETRIES = 3
DEFAULT_TIMEOUT = 30

SUPPORTED_QUALITIES = ["best", "1080p", "720p", "480p", "360p"]


@dataclass(frozen=True)
class Settings:
    """Application settings loaded from environment."""

    email: str
    password: str
    base_url: str
    output_dir: Path = field(default_factory=lambda: Path(DEFAULT_OUTPUT_DIR))
    quality: str = DEFAULT_QUALITY
    max_retries: int = DEFAULT_MAX_RETRIES
    timeout: int = DEFAULT_TIMEOUT

    def __post_init__(self) -> None:
        if not self.email:
            raise ConfigError("CADEMI_EMAIL is required")
        if not self.password:
            raise ConfigError("CADEMI_PASSWORD is required")
        if not self.base_url:
            raise ConfigError("CADEMI_BASE_URL is required")
        if self.quality not in SUPPORTED_QUALITIES:
            raise ConfigError(
                f"Invalid quality '{self.quality}'. "
                f"Supported: {', '.join(SUPPORTED_QUALITIES)}"
            )


def load_settings(env_file: Path | None = None) -> Settings:
    """Load settings from .env file and environment variables."""
    if env_file:
        load_dotenv(env_file)
    else:
        load_dotenv()

    email = os.getenv("CADEMI_EMAIL", "")
    password = os.getenv("CADEMI_PASSWORD", "")
    base_url = os.getenv("CADEMI_BASE_URL", "")

    if not email or not password:
        raise ConfigError(
            "CADEMI_EMAIL and CADEMI_PASSWORD must be set in .env file or environment"
        )
    if not base_url:
        raise ConfigError(
            "CADEMI_BASE_URL must be set (e.g., https://renanvieira.cademi.com.br)"
        )

    # Normalize base_url: remove trailing slash
    base_url = base_url.rstrip("/")

    return Settings(
        email=email,
        password=password,
        base_url=base_url,
        output_dir=Path(os.getenv("CADEMI_OUTPUT_DIR", DEFAULT_OUTPUT_DIR)),
        quality=os.getenv("CADEMI_QUALITY", DEFAULT_QUALITY),
        max_retries=int(os.getenv("CADEMI_MAX_RETRIES", str(DEFAULT_MAX_RETRIES))),
        timeout=int(os.getenv("CADEMI_TIMEOUT", str(DEFAULT_TIMEOUT))),
    )
