#!/usr/bin/env python3
"""Shared fixtures for youtube-captions tests."""

import pytest
from unittest.mock import MagicMock


@pytest.fixture
def mock_yt_dlp_info():
    """Sample yt-dlp info dict with subtitles."""
    return {
        'title': 'Test Video',
        'channel': 'Test Channel',
        'upload_date': '20260115',
        'duration': 5400,
        'id': 'test123',
        'description': 'A test video description',
        'subtitles': {
            'pt-BR': [{'ext': 'json3', 'url': 'https://example.com/subs/pt-BR.json3'}],
            'en': [{'ext': 'json3', 'url': 'https://example.com/subs/en.json3'}],
        },
        'automatic_captions': {
            'pt': [{'ext': 'json3', 'url': 'https://example.com/auto/pt.json3'}],
        },
    }


@pytest.fixture
def sample_json3_subtitle():
    """Sample JSON3 subtitle data."""
    return {
        'events': [
            {'tStartMs': 0, 'segs': [{'utf8': 'Hello '}]},
            {'tStartMs': 5000, 'segs': [{'utf8': 'world'}]},
            {'tStartMs': 60000, 'segs': [{'utf8': 'One minute in'}]},
        ]
    }
