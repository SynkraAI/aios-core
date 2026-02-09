"""Data models for Hotmart course content."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class ContentType(str, Enum):
    """Types of downloadable content."""

    VIDEO_HLS = "video_hls"
    VIDEO_EXTERNAL = "video_external"
    ATTACHMENT = "attachment"
    TEXT = "text"
    LINK = "link"


class DownloadStatus(str, Enum):
    """Status of a download operation."""

    PENDING = "pending"
    DOWNLOADING = "downloading"
    COMPLETED = "completed"
    SKIPPED = "skipped"
    FAILED = "failed"


@dataclass
class VideoContent:
    """Represents a video to download."""

    url: str
    content_type: ContentType
    quality: str = ""
    filename: str = ""
    encryption_key_url: str = ""


@dataclass
class Attachment:
    """Represents a downloadable file (PDF, etc)."""

    url: str
    filename: str
    file_type: str = ""


@dataclass
class SubtitleTrack:
    """Represents a subtitle/caption track."""

    url: str
    language: str = ""
    label: str = ""
    format: str = ""  # "srt", "vtt"


@dataclass
class LessonContent:
    """Parsed content from a lesson page."""

    videos: list[VideoContent] = field(default_factory=list)
    attachments: list[Attachment] = field(default_factory=list)
    links: list[str] = field(default_factory=list)
    subtitles: list[SubtitleTrack] = field(default_factory=list)
    description: str = ""


@dataclass
class Lesson:
    """A single lesson within a module."""

    id: str
    name: str
    order: int = 0
    content: LessonContent | None = None
    status: DownloadStatus = DownloadStatus.PENDING


@dataclass
class Module:
    """A module containing lessons."""

    id: str
    name: str
    order: int = 0
    lessons: list[Lesson] = field(default_factory=list)


@dataclass
class Course:
    """A complete course with modules."""

    id: str
    name: str
    subdomain: str
    modules: list[Module] = field(default_factory=list)


@dataclass
class CourseListItem:
    """A course from the resource list (before fetching full structure)."""

    resource_id: str
    name: str
    subdomain: str
    role: str = ""
    status: str = ""
