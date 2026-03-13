#!/usr/bin/env python3
"""Tests for youtube_captions.py module."""

import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, Mock, patch

import pytest

# Add parent to path before importing
sys.path.insert(0, str(Path(__file__).parent.parent))

import youtube_captions
from youtube_captions import (
    DEFAULT_LANG_PRIORITY,
    download_subtitle_content,
    extract_captions,
    fetch_subtitles_raw,
    format_duration,
    parse_subtitle_content,
    pick_best_subtitle,
    slugify,
)


class TestParseSubtitleContent:
    """Test subtitle content parsing."""

    def test_parse_normal_events(self, sample_json3_subtitle):
        """Normal JSON3 events should be parsed with timestamps."""
        result = parse_subtitle_content(sample_json3_subtitle)
        lines = result.split('\n')

        assert len(lines) == 3
        assert lines[0] == '[00:00] Hello'
        assert lines[1] == '[00:05] world'
        assert lines[2] == '[01:00] One minute in'

    def test_parse_dedup_same_text(self):
        """Duplicate text should be deduplicated."""
        data = {
            'events': [
                {'tStartMs': 0, 'segs': [{'utf8': 'same text'}]},
                {'tStartMs': 5000, 'segs': [{'utf8': 'same text'}]},
                {'tStartMs': 10000, 'segs': [{'utf8': 'different'}]},
            ]
        }
        result = parse_subtitle_content(data)
        lines = result.split('\n')

        assert len(lines) == 2
        assert 'same text' in lines[0]
        assert 'different' in lines[1]

    def test_parse_events_without_segs(self):
        """Events without 'segs' should be skipped."""
        data = {
            'events': [
                {'tStartMs': 0, 'segs': [{'utf8': 'valid'}]},
                {'tStartMs': 5000},  # no segs
                {'tStartMs': 10000, 'segs': [{'utf8': 'also valid'}]},
            ]
        }
        result = parse_subtitle_content(data)
        lines = result.split('\n')

        assert len(lines) == 2
        assert 'valid' in lines[0]
        assert 'also valid' in lines[1]

    def test_parse_newlines_cleaned(self):
        """Newlines in text should be replaced with spaces."""
        data = {
            'events': [
                {'tStartMs': 0, 'segs': [{'utf8': 'text with\nnewline'}]},
            ]
        }
        result = parse_subtitle_content(data)

        assert '\n' not in result.split(']')[1]  # After timestamp
        assert 'text with newline' in result


class TestPickBestSubtitle:
    """Test subtitle selection logic."""

    def test_manual_pt_br_preferred(self, mock_yt_dlp_info):
        """Manual pt-BR should be preferred over auto."""
        lang, url, is_auto = pick_best_subtitle(mock_yt_dlp_info, ['pt-BR', 'en'])

        assert lang == 'pt-BR'
        assert url == 'https://example.com/subs/pt-BR.json3'
        assert is_auto is False

    def test_auto_used_when_no_manual(self):
        """Auto-generated should be used when no manual subs available."""
        info = {
            'subtitles': {},
            'automatic_captions': {
                'pt': [{'ext': 'json3', 'url': 'https://example.com/auto/pt.json3'}],
            },
        }
        lang, url, is_auto = pick_best_subtitle(info, ['pt', 'en'])

        assert lang == 'pt'
        assert url == 'https://example.com/auto/pt.json3'
        assert is_auto is True

    def test_fallback_to_any_language(self):
        """Should fall back to any available manual subtitle."""
        info = {
            'subtitles': {
                'es': [{'ext': 'json3', 'url': 'https://example.com/subs/es.json3'}],
            },
            'automatic_captions': {},
        }
        lang, url, is_auto = pick_best_subtitle(info, ['pt-BR', 'en'])

        assert lang == 'es'
        assert url == 'https://example.com/subs/es.json3'
        assert is_auto is False

    def test_returns_none_when_no_subs(self):
        """Should return None when no subtitles available."""
        info = {
            'subtitles': {},
            'automatic_captions': {},
        }
        lang, url, is_auto = pick_best_subtitle(info, ['pt-BR'])

        assert lang is None
        assert url is None
        assert is_auto is None


class TestFormatDuration:
    """Test duration formatting."""

    def test_format_zero(self):
        """Zero seconds should return 00:00:00."""
        assert format_duration(0) == '00:00:00'

    def test_format_none(self):
        """None should return 00:00:00."""
        assert format_duration(None) == '00:00:00'

    def test_format_3661_seconds(self):
        """3661 seconds should be 01:01:01."""
        assert format_duration(3661) == '01:01:01'

    def test_format_60_seconds(self):
        """60 seconds should be 00:01:00."""
        assert format_duration(60) == '00:01:00'


class TestSlugify:
    """Test slugification."""

    def test_slugify_normal(self):
        """Normal text should be lowercased and hyphenated."""
        assert slugify('Hello World') == 'hello-world'

    def test_slugify_special_chars(self):
        """Special characters should be removed."""
        assert slugify('Test! @#$ Video?') == 'test-video'

    def test_slugify_long_text(self):
        """Text longer than 80 chars should be truncated."""
        long_text = 'a' * 100
        result = slugify(long_text)
        assert len(result) == 80

    def test_slugify_multiple_spaces(self):
        """Multiple spaces should become single hyphen."""
        assert slugify('too    many   spaces') == 'too-many-spaces'


class TestFetchSubtitlesRaw:
    """Test yt-dlp metadata fetching."""

    @patch('youtube_captions.yt_dlp.YoutubeDL')
    def test_fetch_subtitles_raw_calls_yt_dlp(self, mock_ydl_cls):
        """fetch_subtitles_raw should call yt-dlp with correct options."""
        mock_ydl = MagicMock()
        mock_ydl.extract_info.return_value = {'title': 'Test'}
        mock_ydl_cls.return_value.__enter__.return_value = mock_ydl

        result = fetch_subtitles_raw('https://youtube.com/watch?v=test', ['pt-BR', 'en'], proxy='http://proxy:8080')

        # Verify yt-dlp was called with correct opts
        call_args = mock_ydl_cls.call_args[0][0]
        assert call_args['skip_download'] is True
        assert call_args['writesubtitles'] is True
        assert call_args['subtitleslangs'] == ['pt-BR', 'en']
        assert call_args['proxy'] == 'http://proxy:8080'

        assert result['title'] == 'Test'


class TestDownloadSubtitleContent:
    """Test subtitle download."""

    @patch('youtube_captions.urllib.request.urlopen')
    def test_download_subtitle_content_returns_json(self, mock_urlopen):
        """Should download and parse JSON3 content."""
        json_data = {'events': [{'tStartMs': 0, 'segs': [{'utf8': 'test'}]}]}

        mock_response = Mock()
        mock_response.read.return_value = json.dumps(json_data).encode('utf-8')
        mock_response.__enter__ = Mock(return_value=mock_response)
        mock_response.__exit__ = Mock(return_value=False)

        mock_urlopen.return_value = mock_response

        result = download_subtitle_content('https://example.com/subs.json3')

        assert result == json_data


class TestExtractCaptions:
    """Test main extract_captions function."""

    def test_extract_captions_with_output_dir(self, tmp_path, mock_yt_dlp_info, sample_json3_subtitle):
        """extract_captions should save file and return result dict."""
        # Mock all the dependencies
        mock_formatter = {
            'generate_markdown': lambda d: f"# {d['title']}\n\n{d['text']}",
            'save_markdown': MagicMock(),
            'slugify': lambda t: slugify(t),
        }

        class MockNoSubsError(Exception):
            pass

        with patch('youtube_captions.fetch_subtitles_raw', return_value=mock_yt_dlp_info):
            with patch('youtube_captions.download_subtitle_content', return_value=sample_json3_subtitle):
                with patch('youtube_captions._get_formatter', return_value=mock_formatter):
                    with patch('youtube_captions._get_exceptions', return_value=MockNoSubsError):
                        result = extract_captions(
                            'https://youtube.com/watch?v=test123',
                            output_dir=str(tmp_path),
                            lang_priority=['pt-BR', 'en'],
                            output_format='md'
                        )

        # Verify result structure
        assert result['title'] == 'Test Video'
        assert result['channel'] == 'Test Channel'
        assert result['language'] == 'pt-BR'
        assert result['subtitle_type'] == 'manual'
        assert result['duration'] == '01:30:00'
        assert result['video_id'] == 'test123'
        assert result['date'] == '2026-01-15'
        assert 'Hello' in result['text']
        assert 'world' in result['text']

        # Verify file was saved
        expected_file = tmp_path / 'test-video.md'
        assert expected_file.exists()

        # Verify filepath in result
        assert result['filepath'] == str(expected_file)

    def test_extract_captions_no_subs_raises(self, mock_yt_dlp_info):
        """No subtitles should raise NoSubtitlesError."""
        # Remove all subtitles
        info_no_subs = mock_yt_dlp_info.copy()
        info_no_subs['subtitles'] = {}
        info_no_subs['automatic_captions'] = {}

        class MockNoSubsError(Exception):
            def __init__(self, url, title):
                super().__init__(f'No subs for {title}')

        with patch('youtube_captions.fetch_subtitles_raw', return_value=info_no_subs):
            with patch('youtube_captions._get_exceptions', return_value=MockNoSubsError):
                with pytest.raises(MockNoSubsError, match='No subs'):
                    extract_captions('https://youtube.com/watch?v=nosubs')
