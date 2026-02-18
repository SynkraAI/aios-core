"""Batch transcription engine — transcribe entire directories of videos.

Scans for video files recursively, skips already-transcribed ones,
and writes `-transcricao.md` output files alongside each video.
"""

from __future__ import annotations

import json
import os
import re
import signal
import tempfile
from collections import deque
from datetime import datetime
from pathlib import Path
from typing import Callable

from .audio import extract_audio
from .cleaner import clean_segments
from .config import (
    BATCH_OUTPUT_SUFFIX,
    BATCH_SENTENCES_PER_PARAGRAPH,
    BATCH_STATUS_FILE,
    VIDEO_EXTENSIONS,
)
from .models import BatchState, BatchVideoStatus, VideoStatus
from .transcriber import transcribe


class BatchEngine:
    """Scans a directory for videos and transcribes them in sequence."""

    def __init__(
        self,
        source_dir: Path,
        *,
        model: str = "turbo",
        language: str = "pt",
        output_dir: Path | None = None,
        chunk: bool = False,
        max_words: int = 2000,
    ) -> None:
        self.source_dir = Path(source_dir).resolve()
        self.model = model
        self.language = language
        self.output_dir = Path(output_dir).resolve() if output_dir else None
        self.chunk = chunk
        self.max_words = max_words

        self._is_running = False
        self._all_videos: list[Path] = []
        self._pending: list[Path] = []
        self._already_done: list[Path] = []
        self._durations: deque[float] = deque(maxlen=50)
        self._state = BatchState()

    # ------------------------------------------------------------------
    # Scanning
    # ------------------------------------------------------------------

    def scan(self) -> BatchState:
        """Find all videos and separate pending vs already done."""
        self._all_videos = self._find_videos(self.source_dir)
        self._pending = []
        self._already_done = []

        for video in self._all_videos:
            out_path = self._get_output_path(video)
            if out_path.exists():
                self._already_done.append(video)
            else:
                self._pending.append(video)

        self._state = BatchState(
            project_name=self.source_dir.name,
            total_videos=len(self._all_videos),
            completed=len(self._already_done),
            skipped=len(self._already_done),
            errors=0,
            remaining=len(self._pending),
            percent=self._calc_percent(len(self._already_done), len(self._all_videos)),
            is_running=False,
            model=self.model,
            language=self.language,
            timestamp=datetime.now().isoformat(),
        )
        return self._state

    # ------------------------------------------------------------------
    # Main run loop
    # ------------------------------------------------------------------

    def run(
        self,
        progress_callback: Callable[[BatchState], None] | None = None,
    ) -> BatchState:
        """Process all pending videos.

        Args:
            progress_callback: Called after each video completes with updated state.

        Returns:
            Final BatchState.
        """
        if not self._pending:
            return self._state

        self._is_running = True
        self._state.is_running = True

        # Graceful Ctrl+C
        original_sigint = signal.getsignal(signal.SIGINT)

        def _handle_sigint(signum, frame):  # noqa: ANN001
            self._is_running = False

        signal.signal(signal.SIGINT, _handle_sigint)

        completed_this_run = 0
        errors_this_run = 0
        recent: deque[dict] = deque(maxlen=10)

        try:
            for i, video in enumerate(self._pending):
                if not self._is_running:
                    break

                video_status = BatchVideoStatus(
                    path=str(video),
                    name=video.name,
                    status=VideoStatus.RUNNING,
                )
                self._state.current_video = video.name
                self._update_state(completed_this_run, errors_this_run, recent)
                self._write_status_json()
                if progress_callback:
                    progress_callback(self._state)

                start_time = datetime.now()

                try:
                    output_path = self._process_single_video(video)
                    elapsed = (datetime.now() - start_time).total_seconds()
                    self._durations.append(elapsed)

                    video_status.status = VideoStatus.DONE
                    video_status.elapsed_seconds = elapsed
                    video_status.output_path = str(output_path)

                    completed_this_run += 1

                    size_mb = output_path.stat().st_size / (1024 * 1024)
                    recent.appendleft({
                        "name": video.name,
                        "size_mb": f"{size_mb:.1f}",
                        "time": f"{elapsed:.0f}s",
                    })

                except Exception as exc:
                    elapsed = (datetime.now() - start_time).total_seconds()
                    video_status.status = VideoStatus.ERROR
                    video_status.elapsed_seconds = elapsed
                    video_status.error = str(exc)
                    errors_this_run += 1

                self._state.videos.append(video_status)
                self._update_state(completed_this_run, errors_this_run, recent)
                self._write_status_json()
                if progress_callback:
                    progress_callback(self._state)

        finally:
            self._is_running = False
            self._state.is_running = False
            self._state.current_video = ""
            self._write_status_json()
            signal.signal(signal.SIGINT, original_sigint)

        return self._state

    # ------------------------------------------------------------------
    # Single video processing
    # ------------------------------------------------------------------

    def _process_single_video(self, video_path: Path) -> Path:
        """Transcribe a single video: extract audio → transcribe → clean → write md."""
        output_path = self._get_output_path(video_path)

        # Extract audio to temp dir
        tmp_dir = Path(tempfile.mkdtemp(prefix="vt-batch-"))
        wav_path = tmp_dir / f"{video_path.stem}.wav"

        try:
            extract_audio(video_path, wav_path)

            # Transcribe (verbose=False to avoid polluting batch output)
            result = transcribe(
                wav_path,
                model_name=self.model,
                language=self.language,
                verbose=False,
            )

            # Clean hallucination loops
            cleaned_segs, stats = clean_segments(result.segments)

            # Format as paragraphs
            full_text = " ".join(seg.text.strip() for seg in cleaned_segs if seg.type == "speech")
            content = self._format_as_paragraphs(full_text)

            # Write output markdown
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(f"# Transcrição: {video_path.name}\n\n")
                f.write(f"**Data:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"**Modelo:** {self.model}\n")
                f.write(f"**Idioma:** {self.language}\n")
                f.write(f"**Segmentos:** {stats.original_count} → {stats.final_count}")
                f.write(f" ({stats.loop_segments_removed} loops removidos)\n\n")
                f.write("---\n\n")
                f.write(content)
                f.write("\n")

            # Optional chunking
            if self.chunk:
                from .chunker import chunk_transcription, save_chunks

                chunks = chunk_transcription(cleaned_segs, max_words=self.max_words)
                chunk_dir = output_path.parent / f"{video_path.stem}-chunks"
                save_chunks(chunks, chunk_dir)

        finally:
            # Cleanup temp audio
            if wav_path.exists():
                wav_path.unlink()
            if tmp_dir.exists():
                try:
                    tmp_dir.rmdir()
                except OSError:
                    pass

        return output_path

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _find_videos(directory: Path) -> list[Path]:
        """Find all video files recursively, sorted by path."""
        videos: list[Path] = []
        for root, _dirs, files in os.walk(directory):
            for file in files:
                if Path(file).suffix.lower() in VIDEO_EXTENSIONS:
                    videos.append(Path(root) / file)
        return sorted(videos)

    def _get_output_path(self, video_path: Path) -> Path:
        """Get the output .md path for a video."""
        if self.output_dir:
            # Mirror directory structure under output_dir
            rel = video_path.relative_to(self.source_dir)
            return self.output_dir / rel.parent / f"{video_path.stem}{BATCH_OUTPUT_SUFFIX}"
        return video_path.parent / f"{video_path.stem}{BATCH_OUTPUT_SUFFIX}"

    @staticmethod
    def _format_as_paragraphs(text: str) -> str:
        """Join text into flowing paragraphs."""
        lines = [line.strip() for line in text.strip().split("\n") if line.strip()]
        full_text = " ".join(lines)
        sentences = re.split(r"(?<=[.!?])\s+", full_text)

        paragraphs: list[str] = []
        current: list[str] = []
        for sentence in sentences:
            current.append(sentence)
            if len(current) >= BATCH_SENTENCES_PER_PARAGRAPH:
                paragraphs.append(" ".join(current))
                current = []
        if current:
            paragraphs.append(" ".join(current))

        return "\n\n".join(paragraphs)

    @staticmethod
    def _calc_percent(done: int, total: int) -> float:
        if total == 0:
            return 0.0
        return round((done / total) * 100, 1)

    def _update_state(
        self,
        completed_this_run: int,
        errors_this_run: int,
        recent: deque[dict],
    ) -> None:
        """Recalculate state after processing a video."""
        total_done = len(self._already_done) + completed_this_run
        total = len(self._all_videos)
        remaining = total - total_done - errors_this_run

        self._state.completed = total_done
        self._state.errors = errors_this_run
        self._state.remaining = remaining
        self._state.percent = self._calc_percent(total_done + errors_this_run, total)
        self._state.timestamp = datetime.now().isoformat()
        self._state.recent_transcriptions = list(recent)

        # ETA based on average duration
        if self._durations and remaining > 0:
            avg = sum(self._durations) / len(self._durations)
            self._state.estimated_hours_remaining = (avg * remaining) / 3600
        else:
            self._state.estimated_hours_remaining = 0.0

    def _write_status_json(self) -> None:
        """Write status JSON atomically (temp + rename)."""
        status_dir = self.output_dir or self.source_dir
        status_path = status_dir / BATCH_STATUS_FILE

        data = self._state.to_dict()
        tmp_path = status_path.with_suffix(".tmp")
        try:
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            tmp_path.replace(status_path)
        except OSError:
            # Non-fatal: status file is optional
            if tmp_path.exists():
                try:
                    tmp_path.unlink()
                except OSError:
                    pass

    @property
    def all_videos(self) -> list[Path]:
        return self._all_videos

    @property
    def pending(self) -> list[Path]:
        return self._pending

    @property
    def already_done(self) -> list[Path]:
        return self._already_done

    @property
    def state(self) -> BatchState:
        return self._state
