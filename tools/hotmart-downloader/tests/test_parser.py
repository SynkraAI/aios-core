"""Tests for HTML content parser."""

from __future__ import annotations

from hotmart_downloader.models import ContentType
from hotmart_downloader.parser import _detect_subtitle_format, parse_lesson_page


class TestParseLessonPage:
    def test_extracts_hls_videos(self):
        page_data = {
            "mediasSrc": [
                {
                    "mediaSrcUrl": "https://cdn.hotmart.com/video/master.m3u8",
                    "mediaName": "intro_video",
                }
            ],
        }
        content = parse_lesson_page(page_data)
        assert len(content.videos) == 1
        assert content.videos[0].content_type == ContentType.VIDEO_HLS
        assert content.videos[0].url == "https://cdn.hotmart.com/video/master.m3u8"
        assert content.videos[0].filename == "intro_video"

    def test_extracts_attachments(self):
        page_data = {
            "fileMembershipSrc": [
                {
                    "fileMembershipUrl": "https://cdn.hotmart.com/file.pdf",
                    "fileMembershipName": "workbook.pdf",
                }
            ],
        }
        content = parse_lesson_page(page_data)
        assert len(content.attachments) == 1
        assert content.attachments[0].url == "https://cdn.hotmart.com/file.pdf"
        assert content.attachments[0].filename == "workbook.pdf"

    def test_extracts_vimeo_embed(self):
        page_data = {
            "content": '<iframe src="https://player.vimeo.com/video/123456"></iframe>',
        }
        content = parse_lesson_page(page_data)
        assert len(content.videos) == 1
        assert content.videos[0].content_type == ContentType.VIDEO_EXTERNAL
        assert "vimeo" in content.videos[0].url

    def test_extracts_youtube_embed(self):
        page_data = {
            "content": '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>',
        }
        content = parse_lesson_page(page_data)
        assert len(content.videos) == 1
        assert content.videos[0].content_type == ContentType.VIDEO_EXTERNAL

    def test_extracts_links(self):
        page_data = {
            "content": (
                '<a href="https://example.com/resource">Resource</a>'
                '<a href="https://example.com/guide.pdf">Guide</a>'
            ),
        }
        content = parse_lesson_page(page_data)
        # PDF should be an attachment, other should be a link
        assert len(content.attachments) == 1
        assert len(content.links) == 1

    def test_extracts_description(self):
        page_data = {
            "description": "<p>This is the <b>lesson</b> description.</p>",
        }
        content = parse_lesson_page(page_data)
        assert "lesson" in content.description
        assert "<p>" not in content.description

    def test_empty_page(self):
        content = parse_lesson_page({})
        assert content.videos == []
        assert content.attachments == []
        assert content.links == []
        assert content.description == ""

    def test_ignores_javascript_links(self):
        page_data = {
            "content": (
                '<a href="javascript:void(0)">Click</a>'
                '<a href="#">Top</a>'
            ),
        }
        content = parse_lesson_page(page_data)
        assert content.links == []
        assert content.attachments == []

    def test_multiple_videos(self):
        page_data = {
            "mediasSrc": [
                {"mediaSrcUrl": "https://cdn.hotmart.com/v1.m3u8", "mediaName": "video1"},
                {"mediaSrcUrl": "https://cdn.hotmart.com/v2.m3u8", "mediaName": "video2"},
            ],
            "content": '<iframe src="https://player.vimeo.com/video/789"></iframe>',
        }
        content = parse_lesson_page(page_data)
        assert len(content.videos) == 3  # 2 HLS + 1 Vimeo

    def test_extracts_captions_from_media(self):
        page_data = {
            "mediasSrc": [
                {
                    "mediaSrcUrl": "https://cdn.hotmart.com/video/master.m3u8",
                    "mediaName": "video",
                    "captions": [
                        {
                            "url": "https://cdn.hotmart.com/subs/en.srt",
                            "language": "en",
                            "label": "English",
                        },
                        {
                            "url": "https://cdn.hotmart.com/subs/pt.vtt",
                            "language": "pt",
                            "label": "Portuguese",
                        },
                    ],
                }
            ],
        }
        content = parse_lesson_page(page_data)
        assert len(content.subtitles) == 2
        assert content.subtitles[0].language == "en"
        assert content.subtitles[0].format == "srt"
        assert content.subtitles[1].language == "pt"
        assert content.subtitles[1].format == "vtt"

    def test_extracts_top_level_captions(self):
        page_data = {
            "captions": [
                {
                    "url": "https://cdn.hotmart.com/subs/en.srt",
                    "language": "en",
                }
            ],
        }
        content = parse_lesson_page(page_data)
        assert len(content.subtitles) == 1
        assert content.subtitles[0].url == "https://cdn.hotmart.com/subs/en.srt"

    def test_extracts_track_tags_from_html(self):
        page_data = {
            "content": (
                '<video><track kind="subtitles" src="https://example.com/subs.vtt" '
                'srclang="en" label="English"></video>'
            ),
        }
        content = parse_lesson_page(page_data)
        assert len(content.subtitles) == 1
        assert content.subtitles[0].url == "https://example.com/subs.vtt"
        assert content.subtitles[0].language == "en"
        assert content.subtitles[0].label == "English"
        assert content.subtitles[0].format == "vtt"

    def test_empty_page_has_no_subtitles(self):
        content = parse_lesson_page({})
        assert content.subtitles == []


class TestDetectSubtitleFormat:
    def test_srt_format(self):
        assert _detect_subtitle_format("https://example.com/subs.srt") == "srt"

    def test_vtt_format(self):
        assert _detect_subtitle_format("https://example.com/subs.vtt") == "vtt"

    def test_webvtt_format(self):
        assert _detect_subtitle_format("https://example.com/subs.webvtt") == "vtt"

    def test_unknown_format(self):
        assert _detect_subtitle_format("https://example.com/subs.txt") == ""

    def test_with_query_params(self):
        assert _detect_subtitle_format("https://example.com/subs.srt?token=abc") == "srt"
