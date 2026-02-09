"""Tests for filesystem utilities."""

from __future__ import annotations

from pathlib import Path

from hotmart_downloader.filesystem import (
    build_lesson_path,
    file_exists_and_valid,
    get_safe_extension,
    sanitize_filename,
)


class TestSanitizeFilename:
    def test_removes_invalid_chars(self):
        assert sanitize_filename('file<>:"/\\|?*name') == "file name"

    def test_collapses_spaces(self):
        assert sanitize_filename("too   many   spaces") == "too many spaces"

    def test_trims_length(self):
        long_name = "a" * 300
        result = sanitize_filename(long_name, max_length=50)
        assert len(result) == 50

    def test_empty_returns_untitled(self):
        assert sanitize_filename("") == "untitled"
        assert sanitize_filename("???") == "untitled"

    def test_preserves_valid_names(self):
        assert sanitize_filename("My Course - Module 1") == "My Course - Module 1"

    def test_strips_trailing_dots(self):
        assert sanitize_filename("filename...") == "filename"

    def test_unicode_normalization(self):
        # Should handle accented characters
        result = sanitize_filename("Introducao a Programacao")
        assert "Introducao" in result


class TestBuildLessonPath:
    def test_creates_correct_structure(self, tmp_path):
        path = build_lesson_path(
            base_dir=tmp_path,
            course_name="My Course",
            module_order=1,
            module_name="Module One",
            lesson_order=3,
            lesson_name="Lesson Three",
        )
        expected = tmp_path / "My Course" / "01_Module One" / "03_Lesson Three"
        assert path == expected
        assert path.exists()

    def test_creates_directories(self, tmp_path):
        path = build_lesson_path(
            base_dir=tmp_path,
            course_name="Course",
            module_order=2,
            module_name="Mod",
            lesson_order=1,
            lesson_name="Les",
        )
        assert path.is_dir()

    def test_sanitizes_names(self, tmp_path):
        path = build_lesson_path(
            base_dir=tmp_path,
            course_name='Course: "Advanced"',
            module_order=1,
            module_name="Module/One",
            lesson_order=1,
            lesson_name="Lesson?",
        )
        # Should not contain invalid characters
        assert path.exists()
        assert ":" not in path.name
        assert '"' not in str(path)


class TestFileExistsAndValid:
    def test_existing_file(self, tmp_path):
        f = tmp_path / "test.txt"
        f.write_text("content")
        assert file_exists_and_valid(f) is True

    def test_nonexistent_file(self, tmp_path):
        f = tmp_path / "nope.txt"
        assert file_exists_and_valid(f) is False

    def test_empty_file(self, tmp_path):
        f = tmp_path / "empty.txt"
        f.write_text("")
        assert file_exists_and_valid(f) is False

    def test_min_size(self, tmp_path):
        f = tmp_path / "small.txt"
        f.write_text("ab")
        assert file_exists_and_valid(f, min_size=100) is False
        assert file_exists_and_valid(f, min_size=1) is True


class TestGetSafeExtension:
    def test_known_extensions(self):
        assert get_safe_extension("https://example.com/file.pdf") == ".pdf"
        assert get_safe_extension("https://example.com/video.mp4") == ".mp4"

    def test_unknown_extension(self):
        assert get_safe_extension("https://example.com/file.xyz") == ""

    def test_default_fallback(self):
        assert get_safe_extension("https://example.com/file.xyz", default=".bin") == ".bin"

    def test_no_extension(self):
        assert get_safe_extension("https://example.com/file") == ""

    def test_query_params_ignored(self):
        assert get_safe_extension("https://example.com/file.pdf?token=abc") == ".pdf"

    def test_subtitle_extensions(self):
        assert get_safe_extension("https://example.com/subs.srt") == ".srt"
        assert get_safe_extension("https://example.com/subs.vtt") == ".vtt"
