"""Tests for formatter module."""

import sys
from pathlib import Path

import pytest

# Add parent dir to path so lib.module can be imported as a package
sys.path.insert(0, str(Path(__file__).parent.parent))

from lib.formatter import (
    slugify,
    format_duration,
    _escape_yaml,
    generate_markdown,
    save_markdown,
)


class TestSlugify:
    """Tests for slugify()."""

    def test_normal_text(self):
        assert slugify('Hello World') == 'hello-world'

    def test_removes_special_chars(self):
        assert slugify('Hello, World! @2024') == 'hello-world-2024'

    def test_long_text_truncated(self):
        long_text = 'a' * 100
        result = slugify(long_text)
        assert len(result) <= 80

    def test_leading_trailing_spaces(self):
        assert slugify('  Hello World  ') == 'hello-world'

    def test_multiple_spaces_collapsed(self):
        assert slugify('Hello    World') == 'hello-world'


class TestFormatDuration:
    """Tests for format_duration()."""

    def test_zero_seconds(self):
        assert format_duration(0) == '00:00:00'

    def test_none_returns_zero(self):
        assert format_duration(None) == '00:00:00'

    def test_one_hour_one_minute_one_second(self):
        assert format_duration(3661) == '01:01:01'

    def test_one_minute(self):
        assert format_duration(60) == '00:01:00'

    def test_float_seconds_rounded(self):
        assert format_duration(90.7) == '00:01:30'


class TestEscapeYaml:
    """Tests for _escape_yaml()."""

    def test_escapes_double_quotes(self):
        assert _escape_yaml('He said "hello"') == 'He said \\"hello\\"'

    def test_none_returns_empty_string(self):
        assert _escape_yaml(None) == ''

    def test_no_quotes_unchanged(self):
        assert _escape_yaml('Simple text') == 'Simple text'


class TestGenerateMarkdown:
    """Tests for generate_markdown()."""

    def test_contains_frontmatter_markers(self, sample_transcription_data):
        result = generate_markdown(sample_transcription_data)
        assert result.startswith('---\n')
        assert '\n---\n\n' in result

    def test_contains_title(self, sample_transcription_data):
        result = generate_markdown(sample_transcription_data)
        assert 'title: "Test Video Title"' in result

    def test_contains_text(self, sample_transcription_data):
        result = generate_markdown(sample_transcription_data)
        assert 'This is a test transcription with some words.' in result

    def test_contains_word_count(self, sample_transcription_data):
        result = generate_markdown(sample_transcription_data)
        assert 'word_count: 9' in result

    def test_optional_fields_included_when_present(self, sample_transcription_data):
        result = generate_markdown(sample_transcription_data)
        assert 'channel: "Test Channel"' in result
        assert 'date: "2026-01-15"' in result
        assert 'subtitle_type: "manual"' in result

    def test_optional_fields_missing_when_absent(self):
        minimal_data = {
            'title': 'Minimal Title',
            'source': 'https://test.com',
            'text': 'Some text.',
        }
        result = generate_markdown(minimal_data)
        assert 'channel:' not in result
        assert 'date:' not in result
        assert 'subtitle_type:' not in result


class TestSaveMarkdown:
    """Tests for save_markdown()."""

    def test_creates_file(self, tmp_path, sample_transcription_data):
        result_path = save_markdown(sample_transcription_data, str(tmp_path))
        assert result_path.exists()
        assert result_path.is_file()

    def test_returns_path(self, tmp_path, sample_transcription_data):
        result_path = save_markdown(sample_transcription_data, str(tmp_path))
        assert isinstance(result_path, Path)

    def test_uses_slugified_title_when_no_filename(self, tmp_path, sample_transcription_data):
        result_path = save_markdown(sample_transcription_data, str(tmp_path))
        assert result_path.name == 'test-video-title.md'

    def test_uses_custom_filename_when_provided(self, tmp_path, sample_transcription_data):
        result_path = save_markdown(sample_transcription_data, str(tmp_path), filename='custom')
        assert result_path.name == 'custom.md'

    def test_creates_parent_dirs(self, tmp_path, sample_transcription_data):
        nested_dir = tmp_path / 'nested' / 'deep' / 'path'
        result_path = save_markdown(sample_transcription_data, str(nested_dir))
        assert result_path.exists()
        assert nested_dir.exists()
