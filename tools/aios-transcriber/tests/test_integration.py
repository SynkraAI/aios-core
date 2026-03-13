#!/usr/bin/env python3
"""Integration tests: verify modules compose correctly."""

import sys
from pathlib import Path

import pytest

# Add lib to path before importing
sys.path.insert(0, str(Path(__file__).parent.parent / 'lib'))

from formatter import generate_markdown, save_markdown, slugify
from state import TranscriptionState


class TestFormatterStateIntegration:
    """Integration between formatter and state modules."""

    def test_save_and_track(self, tmp_path):
        """Formatter saves file, state tracks it."""
        data = {
            'title': 'Integration Test',
            'source': 'test.mp3',
            'source_type': 'deepgram_api',
            'engine': 'deepgram-nova-3',
            'language': 'pt-BR',
            'duration': '00:10:00',
            'text': 'Integration test text content.',
        }
        saved = save_markdown(data, tmp_path)
        assert saved.exists()

        state = TranscriptionState(tmp_path)
        state.mark_completed('test.mp3', str(saved), 'deepgram-nova-3', 600)
        assert state.is_completed('test.mp3')

        summary = state.summary()
        assert summary['completed'] == 1
        assert summary['failed'] == 0

    def test_resume_after_failure(self, tmp_path):
        """State correctly tracks failures and resumes."""
        state = TranscriptionState(tmp_path)
        state.set_engine('deepgram-nova-3')

        state.mark_failed('file1.mp3', 'API timeout', retries=1)
        state.mark_failed('file2.mp3', 'Rate limit', retries=2)

        assert state.summary()['failed'] == 2

        # Simulate retry success
        data = {
            'title': 'Retry Success',
            'source': 'file1.mp3',
            'source_type': 'deepgram_api',
            'engine': 'deepgram-nova-3',
            'language': 'pt-BR',
            'duration': '00:05:00',
            'text': 'Retry content.',
        }
        saved = save_markdown(data, tmp_path)
        state.mark_completed('file1.mp3', str(saved), 'deepgram-nova-3', 300)

        assert state.is_completed('file1.mp3')
        assert state.summary()['completed'] == 1
        assert state.summary()['failed'] == 1  # file2 still failed

    def test_markdown_generation_format(self, tmp_path):
        """Generated markdown should have correct YAML frontmatter."""
        data = {
            'title': 'Format Test',
            'source': 'https://youtube.com/watch?v=test',
            'source_type': 'youtube_captions',
            'engine': 'yt-dlp',
            'language': 'en',
            'duration': '00:15:30',
            'text': 'This is the transcription text.',
            'word_count': 5,
            'channel': 'Test Channel',
            'subtitle_type': 'manual',
        }

        content = generate_markdown(data)

        # Verify frontmatter structure
        assert content.startswith('---')
        assert 'title: "Format Test"' in content
        assert 'channel: "Test Channel"' in content
        assert 'source: "https://youtube.com/watch?v=test"' in content
        assert 'source_type: youtube_captions' in content
        assert 'engine: yt-dlp' in content
        assert 'language: "en"' in content
        assert 'subtitle_type: "manual"' in content
        assert 'duration: "00:15:30"' in content
        assert 'word_count: 5' in content
        assert 'transcribed_at:' in content

        # Verify body
        assert '# Format Test' in content
        assert 'This is the transcription text.' in content

    def test_slugify_consistency(self, tmp_path):
        """Slugify should produce consistent filenames."""
        data = {
            'title': 'Test: Special! Characters? (2026)',
            'source': 'test.mp3',
            'source_type': 'deepgram_api',
            'engine': 'deepgram-nova-3',
            'language': 'pt-BR',
            'duration': '00:05:00',
            'text': 'Test content.',
        }

        saved = save_markdown(data, tmp_path)

        # Verify slug in filename
        assert saved.name == 'test-special-characters-2026.md'
        assert saved.exists()

    def test_state_persists_across_instances(self, tmp_path):
        """State should persist when loading from same directory."""
        # First instance
        state1 = TranscriptionState(tmp_path)
        state1.set_engine('deepgram-nova-3')
        state1.mark_failed('test.mp3', 'timeout', retries=1)

        # Second instance (simulates resume)
        state2 = TranscriptionState(tmp_path)

        assert state2.summary()['engine'] == 'deepgram-nova-3'
        assert state2.summary()['failed'] == 1

    def test_multiple_completions_accumulate(self, tmp_path):
        """Multiple completed files should accumulate in state."""
        state = TranscriptionState(tmp_path)
        state.set_engine('deepgram-nova-3')

        for i in range(5):
            data = {
                'title': f'File {i}',
                'source': f'file{i}.mp3',
                'source_type': 'deepgram_api',
                'engine': 'deepgram-nova-3',
                'language': 'pt-BR',
                'duration': '00:02:00',
                'text': f'Content {i}',
            }
            saved = save_markdown(data, tmp_path)
            state.mark_completed(f'file{i}.mp3', str(saved), 'deepgram-nova-3', 120)

        assert state.summary()['completed'] == 5

        # Verify all files are marked as completed
        for i in range(5):
            assert state.is_completed(f'file{i}.mp3')
