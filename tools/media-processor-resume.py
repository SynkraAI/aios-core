#!/usr/bin/env python3
"""Resume media-processor session for transcribe phase.

Iterates items in processing-manifest.json and runs video-transcriber
for items with pending/failed transcribe status. Updates manifest with
running/completed/failed timestamps.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def load_manifest(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_manifest(path: Path, data: dict[str, Any]) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def log_line(log_path: Path, message: str) -> None:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with log_path.open("a", encoding="utf-8") as f:
        f.write(message + "\n")


def run_cmd(cmd: list[str], log_path: Path, env: dict[str, str] | None = None) -> None:
    log_line(log_path, f"$ {' '.join(cmd)}")
    proc = subprocess.run(cmd, text=True, capture_output=True, env=env)
    if proc.stdout:
        log_line(log_path, proc.stdout.rstrip())
    if proc.stderr:
        log_line(log_path, proc.stderr.rstrip())
    if proc.returncode != 0:
        raise RuntimeError(f"Command failed ({proc.returncode}): {' '.join(cmd)}")


def ensure_relative_path(name: str) -> Path:
    # Prevent absolute paths or path traversal in output dir
    name_path = Path(name)
    if name_path.is_absolute():
        raise ValueError(f"Item name must be relative: {name}")
    safe_parts = []
    for part in name_path.parts:
        if part in {"..", "."}:
            raise ValueError(f"Unsafe path segment: {name}")
        safe_parts.append(part)
    return Path(*safe_parts)


def main() -> int:
    parser = argparse.ArgumentParser(description="Resume media-processor transcriptions.")
    parser.add_argument("session_dir", help="Session directory (e.g., squads/media-processor/sessions/mp-YYYY-MMDD-NNN)")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of items to process (0 = no limit)")
    parser.add_argument("--model", default="medium", help="Whisper model size")
    parser.add_argument("--language", default="pt", help="Language code")
    parser.add_argument(
        "--source-base",
        default="",
        help="Base directory of source files (used to preserve relative paths)",
    )
    parser.add_argument(
        "--output-base",
        default="",
        help="Base directory for outputs. If set, outputs go to output-base/<relative_path>.",
    )
    args = parser.parse_args()

    session_dir = Path(args.session_dir).resolve()
    manifest_path = session_dir / "processing-manifest.json"
    if not manifest_path.exists():
        print(f"Manifest not found: {manifest_path}", file=sys.stderr)
        return 1

    transcriptions_dir = session_dir / "transcriptions"
    log_path = Path(".aios-core/logs/media-processor") / f"resume-{session_dir.name}.log"

    manifest = load_manifest(manifest_path)
    items = manifest.get("items", [])

    processed = 0
    base_env = os.environ.copy()
    base_env.setdefault("VT_DISABLE_MLX", "1")
    base_env.setdefault("VT_WHISPER_ENGINE", "openai")
    base_env["PYTHONPATH"] = str(Path("tools/video-transcriber/src").resolve())

    source_base = Path(args.source_base).resolve() if args.source_base else None
    output_base = Path(args.output_base).resolve() if args.output_base else None
    for item in items:
        phases = item.get("phases", {})
        transcribe = phases.get("transcribe", {})
        status = transcribe.get("status", "pending")
        if status == "completed":
            continue

        # limit
        if args.limit and processed >= args.limit:
            break

        item_id = item.get("id", "<unknown>")
        item_name = item.get("name", item_id)
        source_path = item.get("source_path")
        if not source_path:
            log_line(log_path, f"[{now_iso()}] SKIP {item_id} missing source_path")
            continue

        try:
            output_rel = ensure_relative_path(item_name)

            if output_base and source_base:
                source_path_resolved = Path(source_path).resolve()
                try:
                    rel_parent = source_path_resolved.parent.relative_to(source_base)
                except ValueError:
                    rel_parent = output_rel
                output_dir = output_base / rel_parent
            elif output_base:
                output_dir = output_base / output_rel
            else:
                output_dir = transcriptions_dir / output_rel

            output_dir.mkdir(parents=True, exist_ok=True)

            if (output_dir / "transcription_clean.md").exists():
                transcribe["status"] = "completed"
                transcribe["timestamp"] = now_iso()
                transcribe["output_path"] = str(output_dir)
                phases["transcribe"] = transcribe
                item["phases"] = phases
                write_manifest(manifest_path, manifest)
                continue

            bad_clean_dir = output_dir / "transcription_clean.json"
            if bad_clean_dir.exists() and bad_clean_dir.is_dir():
                try:
                    bad_clean_dir.rmdir()
                except OSError:
                    pass

            transcribe["status"] = "running"
            transcribe["timestamp"] = now_iso()
            transcribe["output_path"] = str(output_dir)
            phases["transcribe"] = transcribe
            item["phases"] = phases
            write_manifest(manifest_path, manifest)

            # Run transcribe -> clean -> chunk
            run_cmd([
                "python3",
                "-m",
                "video_transcriber.cli",
                "transcribe",
                source_path,
                "-o",
                str(output_dir / "transcription.json"),
                "-m",
                args.model,
                "-l",
                args.language,
            ], log_path, env=base_env)

            run_cmd([
                "python3",
                "-m",
                "video_transcriber.cli",
                "clean",
                str(output_dir / "transcription.json"),
                "-o",
                str(output_dir),
            ], log_path, env=base_env)

            run_cmd([
                "python3",
                "-m",
                "video_transcriber.cli",
                "chunk",
                str(output_dir / "transcription_clean.json"),
                "-o",
                str(output_dir / "chunks"),
            ], log_path, env=base_env)

            transcribe["status"] = "completed"
            transcribe["timestamp"] = now_iso()
            transcribe["output_path"] = str(output_dir)
            phases["transcribe"] = transcribe
            item["phases"] = phases
            write_manifest(manifest_path, manifest)

            processed += 1
            log_line(log_path, f"[{now_iso()}] DONE {item_id}")
        except Exception as exc:  # noqa: BLE001
            transcribe["status"] = "failed"
            transcribe["timestamp"] = now_iso()
            transcribe["error"] = str(exc)
            phases["transcribe"] = transcribe
            item["phases"] = phases
            write_manifest(manifest_path, manifest)
            log_line(log_path, f"[{now_iso()}] FAIL {item_id}: {exc}")

    log_line(log_path, f"[{now_iso()}] Resume finished. Processed: {processed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
