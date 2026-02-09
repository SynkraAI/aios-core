"""CLI application using Typer + Rich."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Annotated

import typer

from hotmart_downloader import console as ui
from hotmart_downloader.api import HotmartAPI
from hotmart_downloader.auth import authenticate
from hotmart_downloader.config import Settings, load_settings
from hotmart_downloader.downloader import DownloaderRegistry
from hotmart_downloader.exceptions import (
    AuthenticationError,
    ConfigError,
    DownloadError,
    HotmartDownloaderError,
)
from hotmart_downloader.filesystem import build_lesson_path
from hotmart_downloader.http_client import HttpClient
from hotmart_downloader.logging_config import setup_logging
from hotmart_downloader.models import Course, DownloadStatus
from hotmart_downloader.parser import parse_lesson_page

logger = logging.getLogger(__name__)

app = typer.Typer(
    name="hotmart-dl",
    help="Download Hotmart courses with ease.",
    no_args_is_help=True,
    rich_markup_mode="rich",
)


def _init(debug: bool = False) -> tuple[HttpClient, Settings]:
    """Initialize settings and HTTP client. Returns (client, settings)."""
    setup_logging(
        log_file=Path("hotmart-dl.log"),
        debug=debug,
    )
    settings = load_settings()
    client = HttpClient(
        max_retries=settings.max_retries,
        timeout=settings.timeout,
    )
    return client, settings


@app.command()
def auth_check(
    debug: Annotated[
        bool, typer.Option("--debug", help="Enable debug logging")
    ] = False,
) -> None:
    """Verify credentials and authentication."""
    ui.print_banner()

    try:
        client, settings = _init(debug)
        ui.print_info("Authenticating...")

        with client:
            authenticate(client, settings)

        ui.print_success(f"Authenticated as {settings.email}")

    except (ConfigError, AuthenticationError) as e:
        ui.print_error(str(e))
        raise typer.Exit(1) from None


@app.command()
def courses(
    debug: Annotated[
        bool, typer.Option("--debug", help="Enable debug logging")
    ] = False,
) -> None:
    """List available courses."""
    ui.print_banner()

    try:
        client, settings = _init(debug)

        with client:
            token = authenticate(client, settings)
            client.set_auth_token(token)
            api = HotmartAPI(client)

            ui.print_info("Fetching courses...")
            course_list = api.list_courses()

            if not course_list:
                ui.print_warning("No active courses found.")
                raise typer.Exit(0)

            ui.print_courses_table(course_list)

    except HotmartDownloaderError as e:
        ui.print_error(str(e))
        raise typer.Exit(1) from None


@app.command()
def info(
    course_subdomain: Annotated[str, typer.Argument(help="Course subdomain")],
    debug: Annotated[
        bool, typer.Option("--debug", help="Enable debug logging")
    ] = False,
) -> None:
    """Show course structure (modules and lessons)."""
    ui.print_banner()

    try:
        client, settings = _init(debug)

        with client:
            token = authenticate(client, settings)
            client.set_auth_token(token)
            api = HotmartAPI(client)

            ui.print_info(f"Fetching structure for '{course_subdomain}'...")
            course = api.get_course_navigation(course_subdomain)
            ui.print_course_structure(course)

    except HotmartDownloaderError as e:
        ui.print_error(str(e))
        raise typer.Exit(1) from None


@app.command()
def download(
    course: Annotated[
        str | None,
        typer.Option("-c", "--course", help="Course subdomain"),
    ] = None,
    quality: Annotated[
        str | None,
        typer.Option("-q", "--quality", help="Video quality"),
    ] = None,
    module: Annotated[
        int | None,
        typer.Option("-m", "--module", help="Download only this module"),
    ] = None,
    subtitles: Annotated[
        bool,
        typer.Option("--subtitles", "--subs", help="Download subtitles/captions"),
    ] = False,
    audio_only: Annotated[
        bool,
        typer.Option("--audio-only", "-a", help="Extract audio only (no video)"),
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
        client, settings = _init(debug)
        effective_quality = quality or settings.quality

        with client:
            token = authenticate(client, settings)
            client.set_auth_token(token)
            api = HotmartAPI(client)

            # Select course
            if course:
                subdomain = course
            else:
                ui.print_info("Fetching courses...")
                course_list = api.list_courses()
                if not course_list:
                    ui.print_warning("No active courses found.")
                    raise typer.Exit(0)
                selected = ui.prompt_course_selection(course_list)
                subdomain = selected.subdomain

            # Fetch course structure
            ui.print_info(f"Fetching structure for '{subdomain}'...")
            course_data = api.get_course_navigation(subdomain)

            # Filter modules if requested
            if module is not None:
                course_data.modules = [
                    m for m in course_data.modules if m.order == module
                ]
                if not course_data.modules:
                    ui.print_error(f"Module {module} not found.")
                    raise typer.Exit(1)

            # Dry run - just show structure
            if dry_run:
                ui.print_course_structure(course_data)
                total = sum(len(m.lessons) for m in course_data.modules)
                flags = ""
                if subtitles:
                    flags += " [+subtitles]"
                if audio_only:
                    flags += " [audio-only]"
                ui.print_info(
                    f"\n[dry-run] Would download {total} lessons "
                    f"from {len(course_data.modules)} modules "
                    f"at {effective_quality} quality.{flags}"
                )
                raise typer.Exit(0)

            # Download
            _execute_download(
                api=api,
                course=course_data,
                registry=DownloaderRegistry(client),
                output_dir=settings.output_dir,
                quality=effective_quality,
                download_subs=subtitles,
                audio_only=audio_only,
            )

    except HotmartDownloaderError as e:
        ui.print_error(str(e))
        raise typer.Exit(1) from None


def _execute_download(
    api: HotmartAPI,
    course: Course,
    registry: DownloaderRegistry,
    output_dir: Path,
    quality: str,
    download_subs: bool = False,
    audio_only: bool = False,
) -> None:
    """Execute the download of all lessons in a course."""
    from hotmart_downloader.models import ContentType

    total_lessons = sum(len(m.lessons) for m in course.modules)
    completed = 0
    skipped = 0
    failed = 0
    subtitle_count = 0

    mode = "audio" if audio_only else quality
    ui.print_info(
        f"Downloading {total_lessons} lessons "
        f"from '{course.name}' at {mode} quality\n"
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

                    # Fetch and parse lesson content
                    page_data = api.get_lesson_page(
                        course.subdomain, lesson.id
                    )
                    content = parse_lesson_page(page_data)

                    has_content = False

                    # Download videos (or audio-only)
                    for video in content.videos:
                        if audio_only:
                            # Audio-only mode
                            if video.content_type == ContentType.VIDEO_HLS:
                                registry.hls.download_audio_only(
                                    video.url,
                                    lesson_dir,
                                    filename=video.filename,
                                )
                            else:
                                registry.ytdlp.download(
                                    video.url,
                                    lesson_dir,
                                    filename=video.filename,
                                    quality=quality,
                                    audio_only=True,
                                )
                        else:
                            # Normal video download
                            dl = registry.get_video_downloader(
                                video.url, video.content_type
                            )
                            dl.download(
                                video.url,
                                lesson_dir,
                                filename=video.filename,
                                quality=quality,
                                download_subs=download_subs,
                            )
                        has_content = True

                        # Download subtitles for this video
                        if download_subs:
                            subtitle_count += _download_subtitles(
                                registry=registry,
                                video=video,
                                content=content,
                                lesson_dir=lesson_dir,
                            )

                    # Download attachments
                    for att in content.attachments:
                        registry.attachment.download(
                            att.url,
                            lesson_dir,
                            filename=att.filename,
                        )
                        has_content = True

                    # Save text content
                    registry.text.save_description(
                        content.description, lesson_dir
                    )
                    registry.text.save_links(content.links, lesson_dir)

                    if has_content:
                        lesson.status = DownloadStatus.COMPLETED
                        completed += 1
                    else:
                        lesson.status = DownloadStatus.SKIPPED
                        skipped += 1
                        logger.info(
                            "No downloadable content in: %s", lesson.name
                        )

                except DownloadError as e:
                    lesson.status = DownloadStatus.FAILED
                    failed += 1
                    logger.error("Failed: %s - %s", lesson.name, e)
                    ui.print_warning(f"Failed: {lesson.name} - {e}")

                except Exception as e:
                    lesson.status = DownloadStatus.FAILED
                    failed += 1
                    logger.error("Unexpected error: %s - %s", lesson.name, e)
                    ui.print_warning(f"Error: {lesson.name} - {e}")

                progress.advance(task)

    ui.console.print()
    ui.print_download_summary(
        total_lessons, completed, skipped, failed, subtitles=subtitle_count
    )


def _download_subtitles(
    registry: DownloaderRegistry,
    video: object,
    content: object,
    lesson_dir: Path,
) -> int:
    """Try to download subtitles for a video using multiple strategies.

    Returns the number of subtitle files downloaded.
    """
    from hotmart_downloader.models import ContentType, VideoContent, LessonContent

    if not isinstance(video, VideoContent) or not isinstance(content, LessonContent):
        return 0

    count = 0
    video_name = video.filename or "video"

    # Strategy 1: Subtitles parsed from API/HTML
    for track in content.subtitles:
        try:
            registry.subtitle.download_track(track, lesson_dir, video_name=video_name)
            count += 1
        except Exception:
            logger.debug("Failed to download parsed subtitle: %s", track.url)

    # Strategy 2: Subtitles from HLS manifest
    if video.content_type == ContentType.VIDEO_HLS:
        try:
            hls_tracks = registry.hls.extract_subtitle_tracks(video.url)
            for track in hls_tracks:
                try:
                    registry.subtitle.download_track(
                        track, lesson_dir, video_name=video_name
                    )
                    count += 1
                except Exception:
                    logger.debug("Failed to download HLS subtitle: %s", track.url)
        except Exception:
            logger.debug("Failed to extract HLS subtitles from: %s", video.url)

    # Strategy 3: Subtitles via yt-dlp (for external platforms)
    if video.content_type == ContentType.VIDEO_EXTERNAL:
        try:
            found = registry.ytdlp.download_subtitles_only(
                video.url, lesson_dir, filename=video_name
            )
            count += len(found)
        except Exception:
            logger.debug("Failed to download yt-dlp subtitles: %s", video.url)

    return count


if __name__ == "__main__":
    app()
