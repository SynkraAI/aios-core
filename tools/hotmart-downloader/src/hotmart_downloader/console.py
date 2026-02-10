"""Rich console output - progress bars, tables, panels."""

from __future__ import annotations

from rich.console import Console
from rich.panel import Panel
from rich.progress import (
    BarColumn,
    MofNCompleteColumn,
    Progress,
    SpinnerColumn,
    TaskProgressColumn,
    TextColumn,
    TimeRemainingColumn,
)
from rich.table import Table

from hotmart_downloader.models import Course, CourseListItem, DownloadStatus

console = Console()


def print_banner() -> None:
    """Print the application banner."""
    console.print(
        Panel(
            "[bold cyan]Hotmart Course Downloader[/]\n"
            "[dim]Download your Hotmart courses with ease[/]",
            border_style="cyan",
        )
    )


def print_error(message: str) -> None:
    """Print an error message."""
    console.print(f"[bold red]Error:[/] {message}")


def print_success(message: str) -> None:
    """Print a success message."""
    console.print(f"[bold green]OK:[/] {message}")


def print_warning(message: str) -> None:
    """Print a warning message."""
    console.print(f"[bold yellow]Warning:[/] {message}")


def print_info(message: str) -> None:
    """Print an info message."""
    console.print(f"[dim]{message}[/]")


def print_courses_table(courses: list[CourseListItem]) -> None:
    """Display courses in a Rich table."""
    table = Table(title="Available Courses", border_style="cyan")
    table.add_column("#", style="dim", width=4)
    table.add_column("Name", style="bold")
    table.add_column("Subdomain", style="cyan")
    table.add_column("Status", style="green")

    for i, course in enumerate(courses, start=1):
        table.add_row(
            str(i),
            course.name,
            course.subdomain,
            course.status,
        )

    console.print(table)


def print_course_structure(course: Course) -> None:
    """Display course structure (modules + lessons)."""
    console.print(f"\n[bold cyan]{course.name}[/]")

    for module in course.modules:
        console.print(f"\n  [bold]{module.order:02d}. {module.name}[/]")
        for lesson in module.lessons:
            status_icon = _status_icon(lesson.status)
            console.print(f"      {status_icon} {lesson.order:02d}. {lesson.name}")


def print_download_summary(
    total: int,
    completed: int,
    skipped: int,
    failed: int,
    subtitles: int = 0,
    attachments: int = 0,
) -> None:
    """Print a summary panel after download completes."""
    table = Table(show_header=False, border_style="cyan", pad_edge=False)
    table.add_column("Label", style="bold")
    table.add_column("Value", justify="right")

    table.add_row("Total lessons", str(total))
    table.add_row("Completed", f"[green]{completed}[/]")
    table.add_row("Skipped", f"[yellow]{skipped}[/]")
    table.add_row("Failed", f"[red]{failed}[/]" if failed > 0 else str(failed))
    if subtitles > 0:
        table.add_row("Subtitles", f"[cyan]{subtitles}[/]")
    if attachments > 0:
        table.add_row("Attachments", f"[magenta]{attachments}[/]")

    console.print(Panel(table, title="Download Summary", border_style="cyan"))


def create_progress() -> Progress:
    """Create a Rich progress bar for downloads."""
    return Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        BarColumn(),
        MofNCompleteColumn(),
        TaskProgressColumn(),
        TimeRemainingColumn(),
        console=console,
    )


def prompt_course_selection(courses: list[CourseListItem]) -> CourseListItem:
    """Prompt user to select a course from the list."""
    print_courses_table(courses)
    console.print()

    while True:
        choice = console.input("[bold cyan]Select course number:[/] ")
        try:
            idx = int(choice) - 1
            if 0 <= idx < len(courses):
                return courses[idx]
        except ValueError:
            pass
        print_error(f"Invalid choice. Enter a number between 1 and {len(courses)}")


def prompt_course_disambiguation(courses: list[CourseListItem]) -> CourseListItem:
    """Prompt user to pick a course when multiple share the same subdomain."""
    console.print(
        f"\n[bold yellow]Multiple courses found for "
        f"subdomain '{courses[0].subdomain}':[/]"
    )
    for i, course in enumerate(courses, start=1):
        console.print(f"  [bold]{i}.[/] {course.name}")
    console.print()

    while True:
        choice = console.input("[bold cyan]Select course number:[/] ")
        try:
            idx = int(choice) - 1
            if 0 <= idx < len(courses):
                return courses[idx]
        except ValueError:
            pass
        print_error(f"Invalid choice. Enter 1-{len(courses)}")


def _status_icon(status: DownloadStatus) -> str:
    """Get a status icon for display."""
    icons = {
        DownloadStatus.PENDING: "[dim]-[/]",
        DownloadStatus.DOWNLOADING: "[blue]>[/]",
        DownloadStatus.COMPLETED: "[green]v[/]",
        DownloadStatus.SKIPPED: "[yellow]~[/]",
        DownloadStatus.FAILED: "[red]x[/]",
    }
    return icons.get(status, "-")
