"""Security tests for input validation (URL, filename, subprocess)."""

from unittest.mock import patch

import pytest

from video_transcriber.utils import retry_on_failure, run_command, sanitize_filename, validate_url


class TestValidateUrl:
    def test_accepts_https(self):
        assert validate_url("https://youtube.com/watch?v=abc") == "https://youtube.com/watch?v=abc"

    def test_accepts_http(self):
        assert validate_url("http://example.com") == "http://example.com"

    def test_rejects_ftp(self):
        with pytest.raises(ValueError, match="Unsupported URL scheme"):
            validate_url("ftp://evil.com/file")

    def test_rejects_file_scheme(self):
        with pytest.raises(ValueError, match="Unsupported URL scheme"):
            validate_url("file:///etc/passwd")

    def test_rejects_javascript(self):
        with pytest.raises(ValueError, match="Unsupported URL scheme"):
            validate_url("javascript:alert(1)")

    def test_rejects_no_host(self):
        with pytest.raises(ValueError, match="no host"):
            validate_url("https://")

    def test_rejects_empty_string(self):
        with pytest.raises(ValueError):
            validate_url("")

    def test_rejects_no_scheme(self):
        with pytest.raises(ValueError):
            validate_url("youtube.com/watch?v=abc")


class TestSanitizeFilename:
    def test_normal_filename(self):
        assert sanitize_filename("my-video.mp4") == "my-video.mp4"

    def test_removes_path_traversal(self):
        result = sanitize_filename("../../etc/passwd")
        assert ".." not in result
        assert "/" not in result

    def test_removes_null_bytes(self):
        result = sanitize_filename("file\x00name")
        assert "\x00" not in result

    def test_removes_slashes(self):
        result = sanitize_filename("path/to/file")
        assert "/" not in result

    def test_removes_backslashes(self):
        result = sanitize_filename("path\\to\\file")
        assert "\\" not in result

    def test_max_length(self):
        long_name = "a" * 300
        result = sanitize_filename(long_name, max_length=200)
        assert len(result) <= 200

    def test_empty_returns_untitled(self):
        assert sanitize_filename("") == "untitled"

    def test_only_dots_returns_untitled(self):
        assert sanitize_filename("....") == "untitled"

    def test_unicode_preserved(self):
        result = sanitize_filename("vídeo_português")
        assert "vídeo" in result

    def test_collapses_underscores(self):
        result = sanitize_filename("a___b___c")
        assert "___" not in result


class TestRunCommand:
    def test_successful_command(self):
        result = run_command(["echo", "hello"])
        assert result.returncode == 0
        assert "hello" in result.stdout

    def test_failed_command(self):
        result = run_command(["false"])
        assert result.returncode != 0

    def test_timeout(self):
        import subprocess
        with pytest.raises(subprocess.TimeoutExpired):
            run_command(["sleep", "10"], timeout=1)

    def test_check_raises(self):
        import subprocess
        with pytest.raises(subprocess.CalledProcessError):
            run_command(["false"], check=True)


class TestRetryOnFailure:
    @patch("video_transcriber.utils.time.sleep")
    def test_retries_on_failure(self, mock_sleep):
        call_count = 0

        @retry_on_failure(max_attempts=3, delay=1, backoff=2, exceptions=(RuntimeError,))
        def flaky():
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise RuntimeError("transient error")
            return "success"

        result = flaky()
        assert result == "success"
        assert call_count == 3
        assert mock_sleep.call_count == 2

    @patch("video_transcriber.utils.time.sleep")
    def test_raises_after_max_attempts(self, mock_sleep):
        @retry_on_failure(max_attempts=2, delay=1, backoff=2, exceptions=(RuntimeError,))
        def always_fails():
            raise RuntimeError("permanent error")

        with pytest.raises(RuntimeError, match="permanent error"):
            always_fails()

    def test_no_retry_on_success(self):
        call_count = 0

        @retry_on_failure(max_attempts=3, delay=1, exceptions=(RuntimeError,))
        def succeeds():
            nonlocal call_count
            call_count += 1
            return "ok"

        result = succeeds()
        assert result == "ok"
        assert call_count == 1

    def test_no_retry_on_unmatched_exception(self):
        @retry_on_failure(max_attempts=3, delay=1, exceptions=(RuntimeError,))
        def wrong_error():
            raise ValueError("not retryable")

        with pytest.raises(ValueError):
            wrong_error()
