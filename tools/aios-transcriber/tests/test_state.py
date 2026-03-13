#!/usr/bin/env python3
"""Tests for state.py — TranscriptionState class.

Test coverage:
- Fresh state initialization
- is_completed checks
- mark_completed adds entry with all fields
- mark_completed removes from failed list
- mark_failed adds entry with error and retries
- mark_failed updates existing entry
- set_engine records engine name
- summary returns correct counts
- State persistence across instances
- Resume capability (completed files remain completed)
- Corrupt state fallback to fresh state
"""

import json
import sys
import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest

# Add parent dir to path so lib.module can be imported as a package
sys.path.insert(0, str(Path(__file__).parent.parent))

from lib.state import STATE_FILENAME, TranscriptionState


class TestTranscriptionStateFreshInit:
    """Test fresh state initialization."""

    def test_fresh_state_has_empty_completed_and_failed(self):
        """Fresh state in new directory has empty completed/failed lists."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state = TranscriptionState(tmpdir)
            assert state.state['completed'] == []
            assert state.state['failed'] == []

    def test_fresh_state_has_version(self):
        """Fresh state includes version 1.0."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state = TranscriptionState(tmpdir)
            assert state.state['version'] == '1.0'

    def test_fresh_state_has_started_at(self):
        """Fresh state includes started_at timestamp."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state = TranscriptionState(tmpdir)
            assert 'started_at' in state.state
            # Check it's ISO format (basic validation)
            assert 'T' in state.state['started_at']

    def test_fresh_state_has_no_engine(self):
        """Fresh state has engine=None until set."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state = TranscriptionState(tmpdir)
            assert state.state['engine'] is None


class TestTranscriptionStateIsCompleted:
    """Test is_completed method."""

    def test_is_completed_false_for_new_file(self):
        """New file returns False."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state = TranscriptionState(tmpdir)
            test_file = Path(tmpdir) / 'test.mp3'
            test_file.touch()
            assert state.is_completed(test_file) is False

    def test_is_completed_true_after_mark_completed(self):
        """File returns True after mark_completed."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state = TranscriptionState(tmpdir)
            test_file = Path(tmpdir) / 'test.mp3'
            out_file = Path(tmpdir) / 'test.txt'
            test_file.touch()
            out_file.touch()

            state.mark_completed(test_file, out_file, 'groq', 120)
            assert state.is_completed(test_file) is True


class TestTranscriptionStateMarkCompleted:
    """Test mark_completed method."""

    def test_mark_completed_adds_entry_with_all_fields(self):
        """mark_completed adds entry with file, output, engine, duration, completed_at."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state = TranscriptionState(tmpdir)
            test_file = Path(tmpdir) / 'audio.mp3'
            out_file = Path(tmpdir) / 'audio.txt'
            test_file.touch()
            out_file.touch()

            state.mark_completed(test_file, out_file, 'deepgram', 95.5)

            assert len(state.state['completed']) == 1
            entry = state.state['completed'][0]
            assert entry['file'] == 'audio.mp3'
            assert entry['output'] == 'audio.txt'
            assert entry['engine'] == 'deepgram'
            assert entry['duration_seconds'] == 95.5
            assert 'completed_at' in entry

    def test_mark_completed_removes_from_failed(self):
        """mark_completed removes file from failed list if it was there."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state = TranscriptionState(tmpdir)
            test_file = Path(tmpdir) / 'test.mp3'
            out_file = Path(tmpdir) / 'test.txt'
            test_file.touch()
            out_file.touch()

            # First mark as failed
            state.mark_failed(test_file, 'timeout error', retries=2)
            assert len(state.state['failed']) == 1

            # Then mark as completed
            state.mark_completed(test_file, out_file, 'groq')

            # Failed list should be empty
            assert len(state.state['failed']) == 0
            assert len(state.state['completed']) == 1


class TestTranscriptionStateMarkFailed:
    """Test mark_failed method."""

    def test_mark_failed_adds_entry_with_error_and_retries(self):
        """mark_failed adds entry with file, error, retries, last_attempt."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state = TranscriptionState(tmpdir)
            test_file = Path(tmpdir) / 'bad.mp3'
            test_file.touch()

            state.mark_failed(test_file, 'API timeout', retries=1)

            assert len(state.state['failed']) == 1
            entry = state.state['failed'][0]
            assert entry['file'] == 'bad.mp3'
            assert entry['error'] == 'API timeout'
            assert entry['retries'] == 1
            assert 'last_attempt' in entry

    def test_mark_failed_updates_existing_entry(self):
        """mark_failed updates existing entry if same file fails again."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state = TranscriptionState(tmpdir)
            test_file = Path(tmpdir) / 'retry.mp3'
            test_file.touch()

            # First failure
            state.mark_failed(test_file, 'timeout', retries=1)
            first_attempt = state.state['failed'][0]['last_attempt']

            # Second failure
            state.mark_failed(test_file, 'rate limit', retries=2)

            # Should still have only 1 entry
            assert len(state.state['failed']) == 1
            entry = state.state['failed'][0]
            assert entry['error'] == 'rate limit'
            assert entry['retries'] == 2
            # last_attempt should be newer
            assert entry['last_attempt'] >= first_attempt


class TestTranscriptionStateSetEngine:
    """Test set_engine method."""

    def test_set_engine_records_engine_name(self):
        """set_engine records engine name in state."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state = TranscriptionState(tmpdir)
            state.set_engine('groq')
            assert state.state['engine'] == 'groq'

    def test_set_engine_overwrites_previous(self):
        """set_engine overwrites previous engine."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state = TranscriptionState(tmpdir)
            state.set_engine('groq')
            state.set_engine('deepgram')
            assert state.state['engine'] == 'deepgram'


class TestTranscriptionStateSummary:
    """Test summary method."""

    def test_summary_returns_correct_counts(self):
        """summary returns dict with completed count, failed count, engine, started_at."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state = TranscriptionState(tmpdir)
            f1 = Path(tmpdir) / 'a.mp3'
            f2 = Path(tmpdir) / 'b.mp3'
            f3 = Path(tmpdir) / 'c.mp3'
            out = Path(tmpdir) / 'out.txt'
            f1.touch()
            f2.touch()
            f3.touch()
            out.touch()

            state.set_engine('groq')
            state.mark_completed(f1, out, 'groq', 60)
            state.mark_completed(f2, out, 'groq', 90)
            state.mark_failed(f3, 'network error', retries=1)

            summary = state.summary()
            assert summary['completed'] == 2
            assert summary['failed'] == 1
            assert summary['engine'] == 'groq'
            assert 'started_at' in summary


class TestTranscriptionStatePersistence:
    """Test state persistence across instances."""

    def test_state_survives_new_instance(self):
        """State persists to disk and survives new TranscriptionState instance."""
        with tempfile.TemporaryDirectory() as tmpdir:
            # First instance
            state1 = TranscriptionState(tmpdir)
            test_file = Path(tmpdir) / 'persist.mp3'
            out_file = Path(tmpdir) / 'persist.txt'
            test_file.touch()
            out_file.touch()

            state1.set_engine('groq')
            state1.mark_completed(test_file, out_file, 'groq', 100)

            # Second instance (should load from disk)
            state2 = TranscriptionState(tmpdir)
            assert state2.state['engine'] == 'groq'
            assert len(state2.state['completed']) == 1
            assert state2.state['completed'][0]['file'] == 'persist.mp3'

    def test_resume_completed_files_remain_completed(self):
        """Resume: completed files remain completed after re-instantiation."""
        with tempfile.TemporaryDirectory() as tmpdir:
            # Session 1
            state1 = TranscriptionState(tmpdir)
            f1 = Path(tmpdir) / 'done.mp3'
            out1 = Path(tmpdir) / 'done.txt'
            f1.touch()
            out1.touch()
            state1.mark_completed(f1, out1, 'deepgram', 50)

            # Session 2
            state2 = TranscriptionState(tmpdir)
            assert state2.is_completed(f1) is True


class TestTranscriptionStateCorruptStateHandling:
    """Test corrupt state file handling."""

    def test_corrupt_state_falls_back_to_fresh(self):
        """JSONDecodeError falls back to fresh state."""
        with tempfile.TemporaryDirectory() as tmpdir:
            # Create corrupt state file
            state_file = Path(tmpdir) / STATE_FILENAME
            state_file.write_text('{ invalid json garbage')

            # Should not raise, should fall back to fresh state
            state = TranscriptionState(tmpdir)
            assert state.state['completed'] == []
            assert state.state['failed'] == []
            assert state.state['version'] == '1.0'

    def test_oserror_on_load_falls_back_to_fresh(self):
        """OSError during load falls back to fresh state."""
        with tempfile.TemporaryDirectory() as tmpdir:
            state_file = Path(tmpdir) / STATE_FILENAME
            state_file.write_text('{"version": "1.0"}')

            # Mock open to raise OSError
            with patch('builtins.open', side_effect=OSError('disk full')):
                state = TranscriptionState(tmpdir)
                # Should fall back to fresh state
                assert state.state['completed'] == []
                assert state.state['version'] == '1.0'
