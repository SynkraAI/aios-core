"""Utility functions for input validation, subprocess safety, and retry logic."""

from __future__ import annotations

import re
import subprocess
import time
from functools import wraps
from pathlib import Path
from typing import Any, Callable
from urllib.parse import urlparse

from rich.console import Console

console = Console(stderr=True)

# ---------------------------------------------------------------------------
# Input validation
# ---------------------------------------------------------------------------

_SAFE_FILENAME_RE = re.compile(r'[^\w\s\-.,()[\]]+', re.UNICODE)


def validate_url(url: str) -> str:
    """Validate that a URL is safe to pass to external tools.

    Raises:
        ValueError: If the URL scheme is not http or https.
    """
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError(
            f"Unsupported URL scheme '{parsed.scheme}'. Only http/https allowed."
        )
    if not parsed.netloc:
        raise ValueError(f"Invalid URL (no host): {url}")
    return url


def sanitize_filename(name: str, max_length: int = 200) -> str:
    """Sanitize a string for safe use as a filename.

    Removes path traversal sequences, null bytes, and dangerous characters.
    """
    # Remove null bytes
    name = name.replace("\x00", "")
    # Remove path traversal
    name = name.replace("..", "").replace("/", "_").replace("\\", "_")
    # Remove other dangerous characters
    name = _SAFE_FILENAME_RE.sub("_", name)
    # Collapse multiple underscores
    name = re.sub(r"_+", "_", name).strip("_. ")
    return name[:max_length] if name else "untitled"


# ---------------------------------------------------------------------------
# Safe subprocess execution
# ---------------------------------------------------------------------------


def run_command(
    cmd: list[str],
    *,
    timeout: int = 120,
    check: bool = False,
) -> subprocess.CompletedProcess[str]:
    """Run a subprocess command with timeout and structured error handling.

    Args:
        cmd: Command and arguments as a list.
        timeout: Timeout in seconds (default 120s / 2 min).
        check: If True, raise CalledProcessError on non-zero exit.

    Returns:
        CompletedProcess result.

    Raises:
        subprocess.TimeoutExpired: If command exceeds timeout.
        subprocess.CalledProcessError: If check=True and returncode != 0.
    """
    try:
        return subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=check,
        )
    except subprocess.TimeoutExpired:
        tool = cmd[0] if cmd else "unknown"
        console.print(f"[red]Timeout ({timeout}s) running {tool}[/red]")
        raise


# ---------------------------------------------------------------------------
# Retry decorator
# ---------------------------------------------------------------------------


def retry_on_failure(
    max_attempts: int = 3,
    delay: float = 2,
    backoff: float = 2,
    exceptions: tuple[type[Exception], ...] = (RuntimeError,),
) -> Callable:
    """Decorator that retries a function with exponential backoff.

    Args:
        max_attempts: Maximum number of attempts.
        delay: Initial delay between retries (seconds).
        backoff: Multiplier applied to delay after each retry.
        exceptions: Exception types that trigger a retry.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            current_delay = delay
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts:
                        raise
                    console.print(
                        f"[yellow]Attempt {attempt}/{max_attempts} failed: {e}. "
                        f"Retrying in {current_delay:.0f}s...[/yellow]"
                    )
                    time.sleep(current_delay)
                    current_delay *= backoff
        return wrapper
    return decorator
