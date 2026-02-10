"""Transcription cleaner — removes Whisper hallucination loops, merges short segments.

Refactored from clean_transcription.py for use as an importable module.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from rich.console import Console

from .models import CleaningStats, Segment, TranscriptionResult, _fmt_time

console = Console(stderr=True)

# Detection thresholds
LOOP_MIN_REPEATS = 3
SILENCE_TEXT = {"...", "\u2026", ""}
GAP_THRESHOLD = 30           # Seconds gap to mark as [INTERVALO]
MERGE_MAX_CHARS = 40
MERGE_MAX_GAP = 1.5          # Max gap (seconds) between segments to merge


def normalize_text(text: str) -> str:
    """Normalize text for comparison."""
    t = text.strip().lower()
    t = re.sub(r'[.,!?;:\u2026\-\"\']', '', t)
    return t.strip()


def detect_loops(segments: list[Segment]) -> list[dict]:
    """Detect consecutive identical segments (Whisper hallucination loops)."""
    loops = []
    i = 0
    while i < len(segments):
        norm = normalize_text(segments[i].text)
        if not norm:
            i += 1
            continue

        j = i + 1
        while j < len(segments) and normalize_text(segments[j].text) == norm:
            j += 1

        count = j - i
        if count >= LOOP_MIN_REPEATS:
            loops.append({
                "start_idx": i,
                "end_idx": j - 1,
                "count": count,
                "text": segments[i].text.strip(),
                "start_time": segments[i].start,
                "end_time": segments[j - 1].end,
            })
        i = j if count >= LOOP_MIN_REPEATS else i + 1

    return loops


def detect_silence_runs(segments: list[Segment]) -> list[dict]:
    """Detect runs of silence/empty segments."""
    runs = []
    i = 0
    while i < len(segments):
        text = segments[i].text.strip()
        if text in SILENCE_TEXT:
            j = i + 1
            while j < len(segments) and segments[j].text.strip() in SILENCE_TEXT:
                j += 1
            count = j - i
            if count >= LOOP_MIN_REPEATS:
                runs.append({
                    "start_idx": i,
                    "end_idx": j - 1,
                    "count": count,
                    "start_time": segments[i].start,
                    "end_time": segments[j - 1].end,
                })
            i = j
        else:
            i += 1
    return runs


def detect_gaps(segments: list[Segment]) -> list[dict]:
    """Detect large temporal gaps between segments."""
    gaps = []
    for i in range(1, len(segments)):
        gap = segments[i].start - segments[i - 1].end
        if gap >= GAP_THRESHOLD:
            gaps.append({
                "after_idx": i - 1,
                "before_idx": i,
                "duration": gap,
                "start_time": segments[i - 1].end,
                "end_time": segments[i].start,
            })
    return gaps


def merge_short_segments(segments: list[Segment]) -> list[Segment]:
    """Merge short consecutive speech segments."""
    if not segments:
        return segments

    merged = [Segment(
        start=segments[0].start,
        end=segments[0].end,
        text=segments[0].text,
        type=segments[0].type,
    )]

    for seg in segments[1:]:
        prev = merged[-1]
        if (
            prev.type == "speech"
            and seg.type == "speech"
            and len(prev.text.strip()) < MERGE_MAX_CHARS
            and len(seg.text.strip()) < MERGE_MAX_CHARS
            and (seg.start - prev.end) < MERGE_MAX_GAP
        ):
            prev.text = prev.text.strip() + " " + seg.text.strip()
            prev.end = seg.end
        else:
            merged.append(Segment(
                start=seg.start,
                end=seg.end,
                text=seg.text,
                type=seg.type,
            ))

    return merged


def clean_segments(segments: list[Segment]) -> tuple[list[Segment], CleaningStats]:
    """Clean segments: remove loops, silence runs, merge short segments.

    Returns:
        Tuple of (cleaned_segments, stats).
    """
    loops = detect_loops(segments)
    silence_runs = detect_silence_runs(segments)
    gaps = detect_gaps(segments)

    # Build set of indices to remove
    remove_indices: set[int] = set()

    # Remove loop duplicates (keep first occurrence)
    for loop in loops:
        for idx in range(loop["start_idx"] + 1, loop["end_idx"] + 1):
            remove_indices.add(idx)

    # Remove silence runs (keep one as marker)
    for run in silence_runs:
        for idx in range(run["start_idx"] + 1, run["end_idx"] + 1):
            remove_indices.add(idx)

    silence_starts = {run["start_idx"] for run in silence_runs}

    # Build cleaned list
    cleaned: list[Segment] = []
    for i, seg in enumerate(segments):
        if i in remove_indices:
            continue

        if i in silence_starts:
            run = next(r for r in silence_runs if r["start_idx"] == i)
            duration = run["end_time"] - run["start_time"]
            cleaned.append(Segment(
                start=seg.start,
                end=seg.end,
                text=f"[SIL\u00caNCIO - {_fmt_time(duration)}]",
                type="silence",
            ))
        else:
            cleaned.append(Segment(
                start=seg.start,
                end=seg.end,
                text=seg.text,
                type="speech",
            ))

    merged = merge_short_segments(cleaned)

    stats = CleaningStats(
        original_count=len(segments),
        final_count=len(merged),
        loops_found=len(loops),
        loop_segments_removed=sum(
            loop["end_idx"] - loop["start_idx"] for loop in loops
        ),
        silence_runs_found=len(silence_runs),
        silence_segments_removed=sum(
            run["end_idx"] - run["start_idx"] for run in silence_runs
        ),
        gaps_found=len(gaps),
    )

    return merged, stats


def generate_clean_markdown(
    segments: list[Segment],
    stats: CleaningStats,
    title: str,
) -> str:
    """Generate clean markdown from cleaned segments."""
    lines: list[str] = []
    lines.append(f"# {title}\n")
    lines.append(f"> Transcri\u00e7\u00e3o limpa automaticamente")
    lines.append(
        f"> Original: {stats.original_count} segmentos \u2192 "
        f"Limpo: {stats.final_count} segmentos"
    )
    lines.append(
        f"> Removidos: {stats.removed_total} "
        f"({stats.loop_segments_removed} loops + "
        f"{stats.silence_segments_removed} sil\u00eancios)\n"
    )
    lines.append("---\n")

    current_hour = -1
    last_end = 0.0

    for seg in segments:
        hour = int(seg.start // 3600)
        if hour != current_hour:
            current_hour = hour
            if hour == 0:
                lines.append("\n## In\u00edcio\n")
            else:
                lines.append(f"\n## Hora {hour}\n")

        gap = seg.start - last_end
        if gap >= GAP_THRESHOLD:
            gap_min = int(gap // 60)
            lines.append(f"\n**[INTERVALO - {gap_min}min]**\n")

        text = seg.text.strip()
        ts = _fmt_time(seg.start)

        if seg.type == "silence":
            lines.append(f"\n*{text}*\n")
        else:
            lines.append(f"`[{ts}]` {text}\n")

        last_end = seg.end

    return "\n".join(lines)


def clean_transcription_file(json_path: Path, output_dir: Path | None = None) -> Path:
    """Clean a transcription JSON file and save results.

    Args:
        json_path: Path to transcription JSON.
        output_dir: Where to save outputs. Defaults to same dir as input.

    Returns:
        Path to the cleaned JSON file.
    """
    json_path = Path(json_path)
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    raw_segments = data.get("segments", [])
    if not raw_segments:
        raise ValueError("No segments found in JSON")

    # Convert to Segment objects
    segments = [
        Segment(
            start=s["start"],
            end=s["end"],
            text=s["text"],
            type=s.get("type", "speech"),
        )
        for s in raw_segments
    ]

    cleaned, stats = clean_segments(segments)
    title = json_path.stem.replace("_transcription", "")

    out_dir = output_dir or json_path.parent
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Save cleaned JSON
    json_out = out_dir / "transcription_clean.json"
    clean_data = {
        "language": data.get("language", "pt"),
        "original_segments": len(raw_segments),
        "cleaned_segments": len(cleaned),
        "segments": [s.to_dict() for s in cleaned],
    }
    with open(json_out, "w", encoding="utf-8") as f:
        json.dump(clean_data, f, ensure_ascii=False, indent=2)

    # Save markdown
    md_out = out_dir / "transcription_clean.md"
    md_content = generate_clean_markdown(cleaned, stats, title)
    with open(md_out, "w", encoding="utf-8") as f:
        f.write(md_content)

    # Save stats
    stats_out = out_dir / "stats.json"
    with open(stats_out, "w", encoding="utf-8") as f:
        json.dump(stats.to_dict(), f, ensure_ascii=False, indent=2)

    console.print(f"  [green]Cleaned:[/green] {stats.original_count} \u2192 {stats.final_count} segments")
    console.print(f"  [green]Removed:[/green] {stats.removed_total} ({stats.loop_segments_removed} loops)")

    return json_out
