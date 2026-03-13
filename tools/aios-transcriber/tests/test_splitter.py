#!/usr/bin/env python3
"""Tests for splitter.py — audio splitting for large files.

Test coverage:
- needs_splitting: small file returns False
- needs_splitting: file > 24MB returns True for groq
- needs_splitting: file > 2GB returns True for deepgram
- needs_splitting: engine param changes threshold
- split_audio: 30min file creates 3 chunks
- split_audio: short file (<=chunk_duration) returns [original]
- split_audio: zero duration returns [original] (warning case)
- cleanup_chunks: removes files and parent dir
- cleanup_chunks: empty list no error
- cleanup_chunks: non-aios dir doesn't remove parent
"""

import sys
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, call, patch

import pytest

# Add parent dir to path so lib.splitter can be imported as a package
sys.path.insert(0, str(Path(__file__).parent.parent))

from lib.splitter import (
    CHUNK_DURATION_SECONDS,
    DEEPGRAM_MAX_SIZE,
    GROQ_MAX_SIZE,
    cleanup_chunks,
    needs_splitting,
    split_audio,
)


class TestNeedsSplitting:
    """Test needs_splitting function."""

    def test_small_file_returns_false(self):
        """Small file returns False."""
        with tempfile.NamedTemporaryFile(suffix='.mp3') as tmp:
            tmp.write(b'x' * 1024)  # 1KB
            tmp.flush()
            assert needs_splitting(tmp.name, engine='groq') is False

    def test_file_larger_than_24mb_returns_true_for_groq(self):
        """File > 24MB returns True for groq."""
        with tempfile.NamedTemporaryFile(suffix='.mp3') as tmp:
            # Write 25MB
            tmp.write(b'x' * (25 * 1024 * 1024))
            tmp.flush()
            assert needs_splitting(tmp.name, engine='groq') is True

    def test_file_larger_than_2gb_returns_true_for_deepgram(self):
        """File > 2GB returns True for deepgram (mocked, not real 2GB file)."""
        with tempfile.NamedTemporaryFile(suffix='.mp3') as tmp:
            tmp.write(b'x' * 1024)
            tmp.flush()
            # Mock stat to simulate 2.1GB file
            with patch('pathlib.Path.stat') as mock_stat:
                mock_stat.return_value = MagicMock(st_size=2.1 * 1024 * 1024 * 1024)
                assert needs_splitting(tmp.name, engine='deepgram') is True

    def test_needs_splitting_engine_param_changes_threshold(self):
        """Same file, different results for groq vs deepgram."""
        with tempfile.NamedTemporaryFile(suffix='.mp3') as tmp:
            # 30MB file
            tmp.write(b'x' * (30 * 1024 * 1024))
            tmp.flush()
            # Should need splitting for groq (24MB limit)
            assert needs_splitting(tmp.name, engine='groq') is True
            # Should NOT need splitting for deepgram (2GB limit)
            assert needs_splitting(tmp.name, engine='deepgram') is False


class TestSplitAudio:
    """Test split_audio function."""

    @patch('lib.splitter.subprocess.run')
    @patch('lib.splitter.audio_mod.get_duration')
    def test_split_audio_30min_creates_3_chunks(self, mock_get_duration, mock_subprocess):
        """30-minute file creates 3 x 10-minute chunks."""
        with tempfile.NamedTemporaryFile(suffix='.mp3') as tmp:
            test_file = Path(tmp.name)

            # Mock duration: 1800 seconds (30 min)
            mock_get_duration.return_value = 1800

            # Mock subprocess.run to create actual chunk files
            def create_chunk(cmd, **kwargs):
                # Extract chunk path from ffmpeg command
                chunk_path = Path(cmd[-1])
                chunk_path.write_text('fake chunk data')
                return MagicMock(returncode=0)

            mock_subprocess.side_effect = create_chunk

            chunks = split_audio(test_file, chunk_duration=600)

            # Should create 3 chunks (0-600, 600-1200, 1200-1800)
            assert len(chunks) == 3
            assert all(c.exists() for c in chunks)
            assert all('chunk-' in c.name for c in chunks)

            # Verify ffmpeg was called 3 times
            assert mock_subprocess.call_count == 3

            # Cleanup
            for chunk in chunks:
                chunk.unlink(missing_ok=True)
            if chunks:
                chunks[0].parent.rmdir()

    @patch('lib.splitter.subprocess.run')
    @patch('lib.splitter.audio_mod.get_duration')
    def test_split_audio_short_file_returns_original(self, mock_get_duration, mock_subprocess):
        """File with duration <= chunk_duration returns [original_file]."""
        with tempfile.NamedTemporaryFile(suffix='.mp3') as tmp:
            test_file = Path(tmp.name)

            # Mock duration: 300 seconds (5 min, less than 10 min chunk)
            mock_get_duration.return_value = 300

            chunks = split_audio(test_file, chunk_duration=600)

            # Should return original file as-is
            assert len(chunks) == 1
            assert chunks[0] == test_file
            # subprocess.run should not have been called
            mock_subprocess.assert_not_called()

    @patch('lib.splitter.subprocess.run')
    @patch('lib.splitter.audio_mod.get_duration')
    def test_split_audio_zero_duration_returns_original(self, mock_get_duration, mock_subprocess):
        """Zero duration (warning case) returns [original_file]."""
        with tempfile.NamedTemporaryFile(suffix='.mp3') as tmp:
            test_file = Path(tmp.name)

            # Mock duration: 0 (detection failed)
            mock_get_duration.return_value = 0

            chunks = split_audio(test_file)

            # Should return original file
            assert len(chunks) == 1
            assert chunks[0] == test_file
            # subprocess.run should not have been called
            mock_subprocess.assert_not_called()

    @patch('lib.splitter.subprocess.run')
    @patch('lib.splitter.audio_mod.get_duration')
    def test_split_audio_ffmpeg_failure_skips_chunk(self, mock_get_duration, mock_subprocess):
        """If ffmpeg fails on a chunk, that chunk is skipped."""
        with tempfile.NamedTemporaryFile(suffix='.mp3') as tmp:
            test_file = Path(tmp.name)

            # Mock duration: 1200 seconds (20 min -> 2 chunks)
            mock_get_duration.return_value = 1200

            # First chunk succeeds, second fails
            def create_chunk_with_failure(cmd, **kwargs):
                chunk_path = Path(cmd[-1])
                # Fail on second chunk
                if 'chunk-001' in str(chunk_path):
                    return MagicMock(returncode=1, stderr='ffmpeg error')
                # First chunk succeeds
                chunk_path.write_text('chunk data')
                return MagicMock(returncode=0)

            mock_subprocess.side_effect = create_chunk_with_failure

            chunks = split_audio(test_file, chunk_duration=600)

            # Should have only 1 chunk (first succeeded, second failed)
            assert len(chunks) == 1
            assert mock_subprocess.call_count == 2

            # Cleanup
            for chunk in chunks:
                chunk.unlink(missing_ok=True)
            if chunks:
                chunks[0].parent.rmdir()


class TestCleanupChunks:
    """Test cleanup_chunks function."""

    def test_cleanup_chunks_removes_files_and_parent(self):
        """cleanup_chunks removes files and parent directory."""
        # Create temp dir with aios-split- prefix
        tmp_dir = Path(tempfile.mkdtemp(prefix='aios-split-'))
        chunk1 = tmp_dir / 'chunk-000.mp3'
        chunk2 = tmp_dir / 'chunk-001.mp3'
        chunk1.write_text('data1')
        chunk2.write_text('data2')

        chunks = [chunk1, chunk2]
        cleanup_chunks(chunks)

        # Files should be removed
        assert not chunk1.exists()
        assert not chunk2.exists()
        # Parent dir should be removed
        assert not tmp_dir.exists()

    def test_cleanup_chunks_empty_list_no_error(self):
        """cleanup_chunks with empty list does not error."""
        # Should not raise
        cleanup_chunks([])

    def test_cleanup_chunks_non_aios_dir_doesnt_remove_parent(self):
        """cleanup_chunks doesn't remove parent if not aios-split- prefix."""
        # Create temp dir WITHOUT aios-split- prefix
        tmp_dir = Path(tempfile.mkdtemp(prefix='other-'))
        chunk1 = tmp_dir / 'chunk-000.mp3'
        chunk1.write_text('data')

        cleanup_chunks([chunk1])

        # File should be removed
        assert not chunk1.exists()
        # Parent should still exist (not aios-split- dir)
        assert tmp_dir.exists()

        # Manual cleanup
        tmp_dir.rmdir()

    def test_cleanup_chunks_oserror_on_unlink_doesnt_crash(self):
        """cleanup_chunks handles OSError on unlink gracefully."""
        tmp_dir = Path(tempfile.mkdtemp(prefix='aios-split-'))
        chunk1 = tmp_dir / 'chunk-000.mp3'
        chunk1.write_text('data')

        # Mock unlink to raise OSError
        with patch.object(Path, 'unlink', side_effect=OSError('permission denied')):
            # Should not raise
            cleanup_chunks([chunk1])

        # Manual cleanup
        chunk1.unlink(missing_ok=True)
        tmp_dir.rmdir()
