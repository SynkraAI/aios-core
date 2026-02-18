"""Configuration and settings via dotenv."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

from hotmart_downloader.exceptions import ConfigError

# Hotmart API endpoints (new gateway architecture)
CLUB_GATEWAY_BASE = "https://api-club-course-consumption-gateway-ga.cb.hotmart.com"
CLUB_API_BASE = "https://api-club-hot-club-api.cb.hotmart.com/rest/v3"
CLUB_HUB_BASE = "https://api-hub.cb.hotmart.com/club-drive-api"

# Default settings
DEFAULT_OUTPUT_DIR = "downloads"
DEFAULT_QUALITY = "best"
DEFAULT_MAX_RETRIES = 3
DEFAULT_BACKOFF_FACTOR = 1.0
DEFAULT_TIMEOUT = 30

SUPPORTED_QUALITIES = ["best", "1080p", "720p", "480p", "360p"]


@dataclass(frozen=True)
class Settings:
    """Application settings loaded from environment."""

    email: str
    password: str
    output_dir: Path = field(default_factory=lambda: Path(DEFAULT_OUTPUT_DIR))
    quality: str = DEFAULT_QUALITY
    max_retries: int = DEFAULT_MAX_RETRIES
    timeout: int = DEFAULT_TIMEOUT

    def __post_init__(self) -> None:
        if not self.email:
            raise ConfigError("HOTMART_EMAIL is required")
        if not self.password:
            raise ConfigError("HOTMART_PASSWORD is required")
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

    email = os.getenv("HOTMART_EMAIL", "")
    password = os.getenv("HOTMART_PASSWORD", "")

    if not email or not password:
        raise ConfigError(
            "HOTMART_EMAIL and HOTMART_PASSWORD must be set in .env file or environment"
        )

    return Settings(
        email=email,
        password=password,
        output_dir=Path(os.getenv("HOTMART_OUTPUT_DIR", DEFAULT_OUTPUT_DIR)),
        quality=os.getenv("HOTMART_QUALITY", DEFAULT_QUALITY),
        max_retries=int(os.getenv("HOTMART_MAX_RETRIES", str(DEFAULT_MAX_RETRIES))),
        timeout=int(os.getenv("HOTMART_TIMEOUT", str(DEFAULT_TIMEOUT))),
    )
