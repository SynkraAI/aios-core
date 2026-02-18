"""Path sanitization and folder structure management."""

from __future__ import annotations

import re
import unicodedata
from pathlib import Path


def sanitize_filename(name: str, max_length: int = 200) -> str:
    """Sanitize a string for use as a filename.

    Removes or replaces characters that are invalid in file paths,
    normalizes unicode, and trims to max_length.
    """
    # Normalize unicode
    name = unicodedata.normalize("NFKD", name)

    # Replace problematic characters
    name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", name)

    # Collapse multiple underscores/spaces
    name = re.sub(r"[_\s]+", " ", name).strip()

    # Remove trailing dots (Windows issue)
    name = name.rstrip(".")

    # Trim to max length
    if len(name) > max_length:
        name = name[:max_length].rstrip()

    return name or "untitled"


def build_lesson_path(
    base_dir: Path,
    course_name: str,
    module_order: int,
    module_name: str,
    lesson_order: int,
    lesson_name: str,
) -> Path:
    """Build the directory path for a lesson's content.

    Structure: base_dir/Course Name/01_Module Name/01_Lesson Name/
    """
    course_dir = sanitize_filename(course_name)
    module_dir = f"{module_order:02d}_{sanitize_filename(module_name)}"
    lesson_dir = f"{lesson_order:02d}_{sanitize_filename(lesson_name)}"

    path = base_dir / course_dir / module_dir / lesson_dir
    path.mkdir(parents=True, exist_ok=True)
    return path


def file_exists_and_valid(path: Path, min_size: int = 1) -> bool:
    """Check if a file exists and has at least min_size bytes."""
    return path.exists() and path.stat().st_size >= min_size


def get_safe_extension(url: str, default: str = "") -> str:
    """Extract file extension from URL, falling back to default."""
    from urllib.parse import urlparse

    parsed = urlparse(url)
    path = Path(parsed.path)
    ext = path.suffix.lower()

    # Only return known safe extensions
    safe_extensions = {
        ".mp4", ".mkv", ".avi", ".mov", ".webm",
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".pptx",
        ".zip", ".rar", ".7z",
        ".png", ".jpg", ".jpeg", ".gif", ".svg",
        ".mp3", ".wav", ".m4a",
        ".txt", ".md", ".csv", ".json",
        ".ts",
        ".srt", ".vtt",
    }

    if ext in safe_extensions:
        return ext
    return default
