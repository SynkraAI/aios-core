"""CLI application using Typer + Rich."""

from __future__ import annotations

import json
import logging
import time
from pathlib import Path
from typing import Annotated

import typer

from cademi_downloader import console as ui
from cademi_downloader.auth import authenticate
from cademi_downloader.config import load_settings
from cademi_downloader.downloader import DownloaderRegistry
from cademi_downloader.exceptions import (
    AuthenticationError,
    CademiDownloaderError,
    ConfigError,
    DownloadError,
)
from cademi_downloader.filesystem import build_lesson_path
from cademi_downloader.http_client import HttpClient
from cademi_downloader.logging_config import setup_logging
from cademi_downloader.models import Course, DownloadMode, DownloadSelection, DownloadStatus
from cademi_downloader.scraper import CademiScraper

logger = logging.getLogger(__name__)

# Dashboard status file (polled by the HTML dashboard)
DASHBOARD_STATUS_FILE = Path("cademi-download-status.json")


class DashboardStatus:
    """Writes real-time download status to a JSON file for the dashboard."""

    def __init__(self, status_file: Path = DASHBOARD_STATUS_FILE):
        self._file = status_file
        self._data = {
            "service": "Cademi Course Downloader",
            "timestamp": "",
            "is_running": True,
            "total_courses": 0,
            "completed_courses": 0,
            "failed_courses": 0,
            "current_course": "",
            "current_course_index": 0,
            "total_lessons": 0,
            "completed_lessons": 0,
            "failed_lessons": 0,
            "skipped_lessons": 0,
            "percent": 0.0,
            "current_lesson": "",
            "queue": [],
            "recent_downloads": [],
        }

    def init_queue(self, courses: list) -> None:
        self._data["total_courses"] = len(courses)
        self._data["queue"] = [
            {"name": c.name, "status": "pending"} for c in courses
        ]
        self._write()

    def start_course(self, index: int, name: str, total_lessons: int) -> None:
        self._data["current_course"] = name
        self._data["current_course_index"] = index
        if index < len(self._data["queue"]):
            self._data["queue"][index]["status"] = "active"
        self._data["total_lessons"] += total_lessons
        self._write()

    def complete_course(self, index: int) -> None:
        self._data["completed_courses"] += 1
        if index < len(self._data["queue"]):
            self._data["queue"][index]["status"] = "done"
        self._write()

    def fail_course(self, index: int) -> None:
        self._data["failed_courses"] += 1
        if index < len(self._data["queue"]):
            self._data["queue"][index]["status"] = "failed"
        self._write()

    def skip_course(self, index: int) -> None:
        if index < len(self._data["queue"]):
            self._data["queue"][index]["status"] = "skipped"
        self._write()

    def update_lesson(self, lesson_name: str, status: str) -> None:
        self._data["current_lesson"] = lesson_name
        if status == "completed":
            self._data["completed_lessons"] += 1
            self._data["recent_downloads"].insert(0, {
                "name": f"{self._data['current_course']} / {lesson_name}",
                "time": time.strftime("%H:%M"),
            })
            self._data["recent_downloads"] = self._data["recent_downloads"][:15]
        elif status == "failed":
            self._data["failed_lessons"] += 1
        elif status == "skipped":
            self._data["skipped_lessons"] += 1
        self._update_percent()
        self._write()

    def finish(self) -> None:
        self._data["is_running"] = False
        self._data["current_course"] = ""
        self._data["current_lesson"] = ""
        self._write()

    def _update_percent(self) -> None:
        total = self._data["total_lessons"]
        done = (
            self._data["completed_lessons"]
            + self._data["failed_lessons"]
            + self._data["skipped_lessons"]
        )
        self._data["percent"] = round((done / total * 100) if total > 0 else 0, 1)

    def _write(self) -> None:
        self._data["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        self._file.write_text(json.dumps(self._data, indent=2, ensure_ascii=False))


app = typer.Typer(
    name="cademi-dl",
    help="Download Cademi courses via browser automation.",
    no_args_is_help=True,
    rich_markup_mode="rich",
)


def _init(debug: bool = False):
    """Initialize settings and logging. Returns settings."""
    setup_logging(
        log_file=Path("cademi-dl.log"),
        debug=debug,
    )
    return load_settings()


@app.command()
def auth_check(
    debug: Annotated[
        bool, typer.Option("--debug", help="Enable debug logging")
    ] = False,
) -> None:
    """Verify credentials and authentication."""
    ui.print_banner()

    try:
        settings = _init(debug)
        ui.print_info("Authenticating...")
        cookies = authenticate(settings)
        ui.print_success(f"Authenticated as {settings.email} ({len(cookies)} cookies)")

    except (ConfigError, AuthenticationError) as e:
        ui.print_error(str(e))
        raise typer.Exit(1) from None


@app.command()
def courses(
    debug: Annotated[
        bool, typer.Option("--debug", help="Enable debug logging")
    ] = False,
) -> None:
    """List available courses from the vitrine."""
    ui.print_banner()

    try:
        settings = _init(debug)
        cookies = authenticate(settings)

        with CademiScraper(settings, cookies) as scraper:
            ui.print_info("Fetching courses...")
            course_list = scraper.list_courses()

            if not course_list:
                ui.print_warning("No courses found on vitrine.")
                raise typer.Exit(0)

            ui.print_courses_table(course_list)

    except CademiDownloaderError as e:
        ui.print_error(str(e))
        raise typer.Exit(1) from None


@app.command()
def info(
    course_url: Annotated[str, typer.Argument(help="Course URL")],
    debug: Annotated[
        bool, typer.Option("--debug", help="Enable debug logging")
    ] = False,
) -> None:
    """Show course structure (modules and lessons)."""
    ui.print_banner()

    try:
        settings = _init(debug)
        cookies = authenticate(settings)

        with CademiScraper(settings, cookies) as scraper:
            ui.print_info(f"Fetching structure for course...")
            course = scraper.get_course_structure(course_url)
            ui.print_course_structure(course)

    except CademiDownloaderError as e:
        ui.print_error(str(e))
        raise typer.Exit(1) from None


@app.command()
def download(
    course: Annotated[
        str | None,
        typer.Option("-c", "--course", help="Course URL"),
    ] = None,
    quality: Annotated[
        str | None,
        typer.Option("-q", "--quality", help="Video quality"),
    ] = None,
    module: Annotated[
        int | None,
        typer.Option("-m", "--module", help="Download only this module number"),
    ] = None,
    all_courses: Annotated[
        bool,
        typer.Option("--all", help="Download all available courses (batch mode)"),
    ] = False,
    select_all: Annotated[
        bool,
        typer.Option(
            "--select-all",
            help="Download everything (videos+materials+subs) without prompting",
        ),
    ] = False,
    selection_mode: Annotated[
        str | None,
        typer.Option(
            "--selection",
            help="Content selection: all|videos|materials|transcriptions|mat+trans",
        ),
    ] = None,
    skip_external: Annotated[
        bool,
        typer.Option(
            "--skip-external",
            help="Skip courses that redirect outside the base domain",
        ),
    ] = True,
    audio_only: Annotated[
        bool,
        typer.Option(
            "--audio-only",
            help="Download audio only (mono m4a, optimized for transcription)",
        ),
    ] = False,
    skip_youtube: Annotated[
        bool,
        typer.Option(
            "--skip-youtube",
            help="Skip YouTube videos and log their URLs to a JSON file instead of downloading",
        ),
    ] = False,
    dry_run: Annotated[
        bool,
        typer.Option("--dry-run", help="Show without downloading"),
    ] = False,
    debug: Annotated[
        bool, typer.Option("--debug", help="Enable debug logging")
    ] = False,
) -> None:
    """Download a course (interactive or with flags)."""
    ui.print_banner()

    try:
        settings = _init(debug)
        effective_quality = quality or settings.quality
        cookies = authenticate(settings)

        # Create HTTP client with cookies for attachment downloads
        client = HttpClient(
            max_retries=settings.max_retries,
            timeout=settings.timeout,
        )
        client.set_cookies(cookies)

        with CademiScraper(settings, cookies) as scraper:

            # --all: batch download all courses
            if all_courses:
                selection = _resolve_selection(select_all, selection_mode)
                dashboard = DashboardStatus()
                _download_all_courses(
                    scraper=scraper,
                    client=client,
                    settings=settings,
                    quality=effective_quality,
                    selection=selection,
                    skip_external=skip_external,
                    dry_run=dry_run,
                    dashboard=dashboard,
                    audio_only=audio_only,
                    skip_youtube=skip_youtube,
                )
                dashboard.finish()
                client.close()
                return

            # Select course
            if course:
                course_url = course
            else:
                ui.print_info("Fetching courses...")
                course_list = scraper.list_courses()
                if not course_list:
                    ui.print_warning("No courses found.")
                    raise typer.Exit(0)
                selected = ui.prompt_course_selection(course_list)
                course_url = selected.url

            # Select what to download
            selection = _resolve_selection(select_all, selection_mode)

            # Fetch course structure
            ui.print_info("Fetching course structure...")
            course_data = scraper.get_course_structure(course_url)

            # Filter modules if requested
            if module is not None:
                course_data.modules = [
                    m for m in course_data.modules if m.order == module
                ]
                if not course_data.modules:
                    ui.print_error(f"Module {module} not found.")
                    raise typer.Exit(1)

            # Dry run
            if dry_run:
                ui.print_course_structure(course_data)
                total = sum(len(m.lessons) for m in course_data.modules)
                ui.print_info(
                    f"\n[dry-run] Would download {total} lessons "
                    f"from {len(course_data.modules)} modules "
                    f"at {effective_quality} quality."
                )
                raise typer.Exit(0)

            # Execute download
            registry = DownloaderRegistry(client)
            _execute_download(
                scraper=scraper,
                course=course_data,
                registry=registry,
                audio_only=audio_only,
                output_dir=settings.output_dir,
                quality=effective_quality,
                selection=selection,
                skip_youtube=skip_youtube,
            )

        client.close()

    except CademiDownloaderError as e:
        ui.print_error(str(e))
        raise typer.Exit(1) from None


def _resolve_selection(
    select_all: bool, selection_mode: str | None
) -> DownloadSelection:
    """Resolve download selection from CLI flags or prompt."""
    if select_all:
        return DownloadSelection.from_mode(DownloadMode.ALL)
    if selection_mode:
        mode_map = {
            "all": DownloadSelection(videos=True, materials=True, transcriptions=True, descriptions=True),
            "videos": DownloadSelection(videos=True, materials=False, transcriptions=False, descriptions=False),
            "materials": DownloadSelection(videos=False, materials=True, transcriptions=False, descriptions=True),
            "transcriptions": DownloadSelection(videos=False, materials=False, transcriptions=True, descriptions=False),
            "mat+trans": DownloadSelection(videos=False, materials=True, transcriptions=True, descriptions=True),
        }
        sel = mode_map.get(selection_mode.lower())
        if sel:
            return sel
    return ui.prompt_download_mode()


def _download_all_courses(
    scraper: CademiScraper,
    client: HttpClient,
    settings,
    quality: str,
    selection: DownloadSelection,
    skip_external: bool,
    dry_run: bool,
    dashboard: DashboardStatus | None = None,
    audio_only: bool = False,
    skip_youtube: bool = False,
) -> None:
    """Download all courses from the vitrine in batch mode."""
    from urllib.parse import urlparse

    ui.print_info("Fetching course list...")
    course_list = scraper.list_courses()
    if not course_list:
        ui.print_warning("No courses found.")
        return

    base_domain = urlparse(settings.base_url).netloc

    # Filter: only courses whose URL is on the same domain + under /area/
    valid_courses = []
    skipped_names = []
    for item in course_list:
        parsed = urlparse(item.url)
        if parsed.netloc != base_domain or not parsed.path.startswith("/area/"):
            skipped_names.append(item.name)
            continue
        # Skip known non-course pages (by path or name)
        non_course_paths = {
            "/area/vitrine", "/area/login", "/area/perfil",
            "/area/certificados", "/area/comentarios",
            "/area/duvidas", "/area/suporte", "/area/faq",
        }
        non_course_names = {
            "perfil", "certificados", "comentários", "comentarios",
            "dúvidas", "duvidas", "suporte", "faq",
        }
        if parsed.path.rstrip("/") in non_course_paths:
            skipped_names.append(item.name)
            continue
        if item.name.strip().lower() in non_course_names:
            skipped_names.append(item.name)
            continue
        valid_courses.append(item)

    ui.print_info(
        f"Found {len(valid_courses)} downloadable courses "
        f"({len(skipped_names)} skipped: non-course/external)"
    )
    if skipped_names:
        for name in skipped_names:
            ui.print_warning(f"  Skipped: {name}")

    if dashboard:
        dashboard.init_queue(valid_courses)

    if dry_run:
        for i, c in enumerate(valid_courses, 1):
            ui.console.print(f"  [bold]{i:02d}.[/] {c.name}")
        return

    registry = DownloaderRegistry(client)
    total_courses = len(valid_courses)

    for idx, item in enumerate(valid_courses):
        ui.console.print(
            f"\n[bold cyan]━━━ Course {idx + 1}/{total_courses}: "
            f"{item.name} ━━━[/]"
        )
        try:
            course_data = scraper.get_course_structure(item.url)
            if not course_data.modules:
                ui.print_warning(f"No modules found, skipping: {item.name}")
                if dashboard:
                    dashboard.skip_course(idx)
                continue

            total_lessons = sum(len(m.lessons) for m in course_data.modules)
            if dashboard:
                dashboard.start_course(idx, item.name, total_lessons)

            _execute_download(
                scraper=scraper,
                course=course_data,
                registry=registry,
                output_dir=settings.output_dir,
                quality=quality,
                selection=selection,
                dashboard=dashboard,
                audio_only=audio_only,
                skip_youtube=skip_youtube,
            )
            if dashboard:
                dashboard.complete_course(idx)
        except Exception as e:
            ui.print_warning(f"Failed to download '{item.name}': {e}")
            logger.error("Course download failed: %s - %s", item.name, e)
            if dashboard:
                dashboard.fail_course(idx)
            continue


def _convert_to_mono(audio_path: Path) -> None:
    """Convert audio file to mono using ffmpeg (in-place)."""
    import subprocess as sp

    mono_path = audio_path.with_suffix(".mono" + audio_path.suffix)
    cmd = [
        "ffmpeg", "-y", "-i", str(audio_path),
        "-ac", "1",  # mono
        "-c:a", "aac", "-b:a", "64k",  # compact for transcription
        str(mono_path),
    ]
    try:
        result = sp.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode == 0 and mono_path.exists():
            mono_path.replace(audio_path)
            logger.info("Converted to mono: %s", audio_path.name)
        else:
            logger.warning("Mono conversion failed: %s", result.stderr[:200])
            mono_path.unlink(missing_ok=True)
    except Exception as e:
        logger.warning("Mono conversion error: %s", e)
        mono_path.unlink(missing_ok=True)


def _log_youtube_url(
    output_dir: Path,
    course_name: str,
    lesson_name: str,
    video_url: str,
) -> None:
    """Append a YouTube video entry to the youtube-urls.json log file."""
    log_file = output_dir / "youtube-urls.json"
    entries = []
    if log_file.exists():
        try:
            entries = json.loads(log_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            entries = []

    # Avoid duplicates
    if not any(e.get("url") == video_url for e in entries):
        entries.append({
            "course": course_name.strip().replace("\n", " ").replace("\t", ""),
            "lesson": lesson_name.strip(),
            "url": video_url,
        })
        log_file.write_text(
            json.dumps(entries, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        logger.info("Logged YouTube URL: %s - %s", lesson_name, video_url)


def _execute_download(
    scraper: CademiScraper,
    course: Course,
    registry: DownloaderRegistry,
    output_dir: Path,
    quality: str,
    selection: DownloadSelection,
    dashboard: DashboardStatus | None = None,
    audio_only: bool = False,
    skip_youtube: bool = False,
) -> None:
    """Execute the download of all lessons in a course."""
    total_lessons = sum(len(m.lessons) for m in course.modules)
    completed = 0
    skipped = 0
    failed = 0
    subtitle_count = 0
    attachment_count = 0

    ui.print_info(
        f"Downloading {total_lessons} lessons "
        f"from '{course.name}' [{quality}]\n"
    )

    with ui.create_progress() as progress:
        task = progress.add_task("Downloading course...", total=total_lessons)

        for mod in course.modules:
            for lesson in mod.lessons:
                progress.update(
                    task,
                    description=(
                        f"[{mod.order:02d}/{lesson.order:02d}] "
                        f"{lesson.name[:40]}"
                    ),
                )

                try:
                    lesson.status = DownloadStatus.DOWNLOADING

                    # Build output path
                    lesson_dir = build_lesson_path(
                        base_dir=output_dir,
                        course_name=course.name,
                        module_order=mod.order,
                        module_name=mod.name,
                        lesson_order=lesson.order,
                        lesson_name=lesson.name,
                    )

                    # Scrape lesson content
                    content = scraper.get_lesson_content(lesson.url)
                    has_content = False

                    # Download videos (or audio-only)
                    if selection.videos and content.videos:
                        for video in content.videos:
                            # Skip YouTube videos and log their URLs
                            if skip_youtube and video.platform == "youtube":
                                _log_youtube_url(
                                    output_dir=output_dir,
                                    course_name=course.name,
                                    lesson_name=lesson.name,
                                    video_url=video.url,
                                )
                                ui.print_warning(
                                    f"  YouTube skipped: {lesson.name} → {video.url}"
                                )
                                has_content = True  # count as handled
                                continue

                            try:
                                downloaded = registry.video.download(
                                    video.url,
                                    lesson_dir,
                                    filename=video.filename or "video",
                                    quality=quality,
                                    audio_only=audio_only,
                                    download_subs=selection.transcriptions,
                                )
                                # Convert to mono if audio_only
                                if audio_only and downloaded and downloaded.exists():
                                    _convert_to_mono(downloaded)
                                has_content = True
                            except DownloadError as e:
                                logger.warning(
                                    "Video download failed: %s - %s",
                                    video.url, e,
                                )

                    # Download transcriptions/subtitles
                    if selection.transcriptions and content.videos:
                        for video in content.videos:
                            try:
                                found = registry.video.download_subtitles_only(
                                    video.url,
                                    lesson_dir,
                                    filename=video.filename or "video",
                                )
                                subtitle_count += len(found)
                                if found:
                                    has_content = True
                            except Exception:
                                pass

                        for track in content.subtitles:
                            try:
                                registry.subtitle.download_track(
                                    track, lesson_dir, video_name="video"
                                )
                                subtitle_count += 1
                                has_content = True
                            except Exception:
                                pass

                    # Download attachments
                    if selection.materials and content.attachments:
                        for att in content.attachments:
                            try:
                                registry.attachment.download(
                                    att.url,
                                    lesson_dir,
                                    filename=att.filename,
                                )
                                attachment_count += 1
                                has_content = True
                            except DownloadError as e:
                                logger.warning(
                                    "Attachment failed: %s - %s",
                                    att.filename, e,
                                )

                    # Save description
                    if selection.descriptions:
                        registry.text.save_description(
                            content.description, lesson_dir
                        )
                        registry.text.save_links(content.links, lesson_dir)

                    if has_content:
                        lesson.status = DownloadStatus.COMPLETED
                        completed += 1
                        if dashboard:
                            dashboard.update_lesson(lesson.name, "completed")
                    else:
                        lesson.status = DownloadStatus.SKIPPED
                        skipped += 1
                        if dashboard:
                            dashboard.update_lesson(lesson.name, "skipped")
                        logger.info(
                            "No downloadable content in: %s", lesson.name
                        )

                except DownloadError as e:
                    lesson.status = DownloadStatus.FAILED
                    failed += 1
                    if dashboard:
                        dashboard.update_lesson(lesson.name, "failed")
                    logger.error("Failed: %s - %s", lesson.name, e)
                    ui.print_warning(f"Failed: {lesson.name} - {e}")

                except Exception as e:
                    lesson.status = DownloadStatus.FAILED
                    failed += 1
                    if dashboard:
                        dashboard.update_lesson(lesson.name, "failed")
                    logger.error("Unexpected error: %s - %s", lesson.name, e)
                    ui.print_warning(f"Error: {lesson.name} - {e}")

                progress.advance(task)

    ui.console.print()
    ui.print_download_summary(
        total_lessons, completed, skipped, failed,
        subtitles=subtitle_count,
        attachments=attachment_count,
    )


if __name__ == "__main__":
    app()
