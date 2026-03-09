"""Data models for Cademi course content."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class ContentType(str, Enum):
    """Types of downloadable content."""

    VIDEO = "video"
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


class DownloadMode(str, Enum):
    """What types of content to download."""

    ALL = "all"
    VIDEOS = "videos"
    MATERIALS = "materials"
    TRANSCRIPTIONS = "transcriptions"
    CUSTOM = "custom"


@dataclass
class DownloadSelection:
    """User's selection of what to download."""

    videos: bool = True
    materials: bool = True
    transcriptions: bool = True
    descriptions: bool = True

    @classmethod
    def from_mode(cls, mode: DownloadMode) -> DownloadSelection:
        """Create selection from a download mode."""
        if mode == DownloadMode.ALL:
            return cls()
        if mode == DownloadMode.VIDEOS:
            return cls(materials=False, transcriptions=False)
        if mode == DownloadMode.MATERIALS:
            return cls(videos=False, transcriptions=False)
        if mode == DownloadMode.TRANSCRIPTIONS:
            return cls(videos=False, materials=False, descriptions=False)
        return cls()


@dataclass
class VideoContent:
    """Represents a video to download."""

    url: str
    content_type: ContentType = ContentType.VIDEO
    quality: str = ""
    filename: str = ""
    platform: str = ""  # vimeo, youtube, bunny, hls, mp4


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
    url: str = ""
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
    url: str
    modules: list[Module] = field(default_factory=list)


@dataclass
class CourseListItem:
    """A course from the vitrine (before fetching full structure)."""

    name: str
    url: str
    thumbnail: str = ""
    description: str = ""
