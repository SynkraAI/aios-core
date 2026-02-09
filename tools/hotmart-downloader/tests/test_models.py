"""Tests for data models."""

from __future__ import annotations

from hotmart_downloader.models import (
    Attachment,
    ContentType,
    Course,
    CourseListItem,
    DownloadStatus,
    Lesson,
    LessonContent,
    Module,
    SubtitleTrack,
    VideoContent,
)


def test_content_type_values():
    assert ContentType.VIDEO_HLS == "video_hls"
    assert ContentType.VIDEO_EXTERNAL == "video_external"
    assert ContentType.ATTACHMENT == "attachment"


def test_download_status_values():
    assert DownloadStatus.PENDING == "pending"
    assert DownloadStatus.COMPLETED == "completed"
    assert DownloadStatus.FAILED == "failed"


def test_video_content_creation():
    video = VideoContent(
        url="https://example.com/master.m3u8",
        content_type=ContentType.VIDEO_HLS,
        filename="lesson1",
    )
    assert video.url == "https://example.com/master.m3u8"
    assert video.content_type == ContentType.VIDEO_HLS
    assert video.filename == "lesson1"


def test_lesson_default_status():
    lesson = Lesson(id="abc123", name="Intro")
    assert lesson.status == DownloadStatus.PENDING
    assert lesson.content is None


def test_course_structure():
    course = Course(
        id="c1",
        name="My Course",
        subdomain="mycourse",
        modules=[
            Module(
                id="m1",
                name="Module 1",
                order=1,
                lessons=[
                    Lesson(id="l1", name="Lesson 1", order=1),
                    Lesson(id="l2", name="Lesson 2", order=2),
                ],
            )
        ],
    )
    assert len(course.modules) == 1
    assert len(course.modules[0].lessons) == 2


def test_lesson_content_defaults():
    content = LessonContent()
    assert content.videos == []
    assert content.attachments == []
    assert content.links == []
    assert content.subtitles == []
    assert content.description == ""


def test_subtitle_track_creation():
    track = SubtitleTrack(
        url="https://example.com/subs.srt",
        language="pt",
        label="Portuguese",
        format="srt",
    )
    assert track.url == "https://example.com/subs.srt"
    assert track.language == "pt"
    assert track.label == "Portuguese"
    assert track.format == "srt"


def test_subtitle_track_defaults():
    track = SubtitleTrack(url="https://example.com/subs.vtt")
    assert track.language == ""
    assert track.label == ""
    assert track.format == ""


def test_lesson_content_with_subtitles():
    content = LessonContent(
        subtitles=[
            SubtitleTrack(url="https://example.com/en.srt", language="en"),
            SubtitleTrack(url="https://example.com/pt.srt", language="pt"),
        ]
    )
    assert len(content.subtitles) == 2
    assert content.subtitles[0].language == "en"
    assert content.subtitles[1].language == "pt"


def test_course_list_item():
    item = CourseListItem(
        resource_id="123",
        name="Python Pro",
        subdomain="pythonpro",
        role="STUDENT",
        status="ACTIVE",
    )
    assert item.resource_id == "123"
    assert item.subdomain == "pythonpro"
