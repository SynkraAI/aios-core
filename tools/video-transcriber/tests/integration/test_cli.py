"""Integration tests for CLI commands using Typer CliRunner."""

import json
import tempfile
from pathlib import Path

from typer.testing import CliRunner

from video_transcriber.cli import app

runner = CliRunner()


class TestVersion:
    def test_version_flag(self):
        result = runner.invoke(app, ["--version"])
        assert result.exit_code == 0
        assert "video-transcriber" in result.stdout

    def test_short_version_flag(self):
        result = runner.invoke(app, ["-v"])
        assert result.exit_code == 0


class TestNoArgs:
    def test_no_args_shows_help(self):
        result = runner.invoke(app, [])
        # Typer's no_args_is_help=True exits with code 0 or 2 depending on version
        assert result.exit_code in (0, 2)
        assert "Usage" in result.stdout or "video-transcriber" in result.stdout.lower()


class TestProcessCommand:
    def test_invalid_source(self):
        result = runner.invoke(app, ["process", "/nonexistent/source"])
        assert result.exit_code != 0

    def test_invalid_url_rejected(self):
        result = runner.invoke(app, ["process", "ftp://evil.com"])
        assert result.exit_code != 0


class TestDownloadCommand:
    def test_invalid_url_rejected(self):
        result = runner.invoke(app, ["download", "not-a-url"])
        assert result.exit_code != 0
        assert "Invalid URL" in result.stdout


class TestTranscribeCommand:
    def test_file_not_found(self):
        result = runner.invoke(app, ["transcribe", "/nonexistent/file.wav"])
        assert result.exit_code != 0
        assert "not found" in result.stdout.lower()


class TestCleanCommand:
    def test_file_not_found(self):
        result = runner.invoke(app, ["clean", "/nonexistent/file.json"])
        assert result.exit_code != 0


class TestChunkCommand:
    def test_file_not_found(self):
        result = runner.invoke(app, ["chunk", "/nonexistent/file.json"])
        assert result.exit_code != 0

    def test_non_json_rejected(self):
        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
            f.write(b"hello")
            f.flush()
            result = runner.invoke(app, ["chunk", f.name])
        assert result.exit_code != 0

    def test_valid_json(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            json_path = Path(tmpdir) / "test.json"
            data = {
                "language": "pt",
                "full_text": "Hello world test sentence here.",
                "segments": [
                    {"start": 0, "end": 5, "text": "Hello world test sentence here."}
                ],
            }
            json_path.write_text(json.dumps(data))
            result = runner.invoke(app, ["chunk", str(json_path), "-o", tmpdir])
            assert result.exit_code == 0
            assert "Done" in result.stdout


class TestIngestCommand:
    def test_file_not_found(self):
        result = runner.invoke(app, ["ingest", "/nonexistent/file.txt"])
        assert result.exit_code != 0

    def test_unsupported_format(self):
        with tempfile.NamedTemporaryFile(suffix=".xyz", delete=False) as f:
            f.write(b"data")
            f.flush()
            result = runner.invoke(app, ["ingest", f.name])
        assert result.exit_code != 0
        assert "Unsupported" in result.stdout

    def test_txt_ingestion(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            txt_path = Path(tmpdir) / "test.txt"
            txt_path.write_text("First paragraph of text.\n\nSecond paragraph of text.")
            result = runner.invoke(app, ["ingest", str(txt_path), "-o", tmpdir])
            assert result.exit_code == 0
            assert "Done" in result.stdout

    def test_md_ingestion(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            md_path = Path(tmpdir) / "test.md"
            md_path.write_text("# Title\n\nContent paragraph here.")
            result = runner.invoke(app, ["ingest", str(md_path), "-o", tmpdir])
            assert result.exit_code == 0
