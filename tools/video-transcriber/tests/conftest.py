"""Shared fixtures for video-transcriber tests."""

import pytest

from video_transcriber.models import (
    Chunk,
    CleaningStats,
    Metadata,
    Segment,
    TranscriptionResult,
)


@pytest.fixture
def sample_segments():
    """A list of typical transcription segments."""
    return [
        Segment(start=0.0, end=5.0, text="Hello world, this is a test."),
        Segment(start=5.0, end=10.0, text="Second segment here."),
        Segment(start=10.0, end=15.0, text="Third segment with more content."),
        Segment(start=15.0, end=20.0, text="Final segment of the batch."),
    ]


@pytest.fixture
def looping_segments():
    """Segments with a Whisper hallucination loop."""
    return [
        Segment(start=0.0, end=2.0, text="Normal speech before loop."),
        Segment(start=2.0, end=4.0, text="Thanks for watching."),
        Segment(start=4.0, end=6.0, text="Thanks for watching."),
        Segment(start=6.0, end=8.0, text="Thanks for watching."),
        Segment(start=8.0, end=10.0, text="Thanks for watching."),
        Segment(start=10.0, end=12.0, text="Back to normal speech."),
    ]


@pytest.fixture
def silence_segments():
    """Segments with silence runs."""
    return [
        Segment(start=0.0, end=5.0, text="Speech before silence."),
        Segment(start=5.0, end=6.0, text="..."),
        Segment(start=6.0, end=7.0, text="..."),
        Segment(start=7.0, end=8.0, text="..."),
        Segment(start=8.0, end=9.0, text="..."),
        Segment(start=9.0, end=14.0, text="Speech after silence."),
    ]


@pytest.fixture
def sample_transcription_result(sample_segments):
    """A full TranscriptionResult."""
    return TranscriptionResult(
        language="pt",
        segments=sample_segments,
        full_text=" ".join(s.text for s in sample_segments),
    )


@pytest.fixture
def sample_metadata():
    """Sample video metadata."""
    return Metadata(
        title="Test Video Title",
        url="https://youtube.com/watch?v=abc123",
        duration=300.0,
        channel="Test Channel",
        thumbnail_url="https://img.youtube.com/vi/abc123/mqdefault.jpg",
        description="A test video description.",
    )


@pytest.fixture
def whisper_raw_result():
    """Raw Whisper output dict for testing _parse_whisper_result."""
    return {
        "language": "pt",
        "text": "Olá mundo. Segundo segmento.",
        "segments": [
            {"start": 0.0, "end": 3.0, "text": " Olá mundo. "},
            {"start": 3.0, "end": 6.0, "text": " Segundo segmento. "},
        ],
    }
