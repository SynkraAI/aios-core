"""Tests for chunker module."""

import json
import tempfile
from pathlib import Path

from video_transcriber.chunker import chunk_transcription, save_chunks
from video_transcriber.models import Segment


class TestChunkTranscription:
    def test_single_chunk(self, sample_segments):
        chunks = chunk_transcription(sample_segments, max_words=1000)
        assert len(chunks) == 1
        assert chunks[0].index == 1

    def test_multiple_chunks(self):
        segs = [
            Segment(start=float(i), end=float(i + 1), text=f"Word{i} " * 50)
            for i in range(10)
        ]
        chunks = chunk_transcription(segs, max_words=100)
        assert len(chunks) > 1
        for chunk in chunks:
            assert chunk.word_count <= 150  # allows slight overshoot on segment boundary

    def test_empty_input(self):
        assert chunk_transcription([], max_words=100) == []

    def test_silence_segments_skipped(self):
        segs = [
            Segment(start=0, end=5, text="Real speech here.", type="speech"),
            Segment(start=5, end=10, text="[SILENCE]", type="silence"),
            Segment(start=10, end=15, text="More speech here.", type="speech"),
        ]
        chunks = chunk_transcription(segs, max_words=1000)
        assert len(chunks) == 1
        assert "[SILENCE]" not in chunks[0].text

    def test_chunk_indices_sequential(self, sample_segments):
        chunks = chunk_transcription(sample_segments, max_words=5)
        for i, chunk in enumerate(chunks):
            assert chunk.index == i + 1

    def test_word_count_accurate(self, sample_segments):
        chunks = chunk_transcription(sample_segments, max_words=1000)
        assert chunks[0].word_count == sum(len(s.text.split()) for s in sample_segments)


class TestSaveChunks:
    def test_saves_files_and_manifest(self, sample_segments):
        chunks = chunk_transcription(sample_segments, max_words=1000)
        with tempfile.TemporaryDirectory() as tmpdir:
            chunks_dir = save_chunks(chunks, Path(tmpdir))
            assert chunks_dir.exists()
            assert (chunks_dir / "chunk-001.txt").exists()
            assert (chunks_dir / "manifest.json").exists()

            manifest = json.loads((chunks_dir / "manifest.json").read_text())
            assert len(manifest) == len(chunks)

    def test_chunk_text_matches(self, sample_segments):
        chunks = chunk_transcription(sample_segments, max_words=1000)
        with tempfile.TemporaryDirectory() as tmpdir:
            chunks_dir = save_chunks(chunks, Path(tmpdir))
            saved_text = (chunks_dir / "chunk-001.txt").read_text()
            assert saved_text == chunks[0].text
