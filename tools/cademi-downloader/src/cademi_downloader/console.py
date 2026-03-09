"""Rich console output - progress bars, tables, panels, prompts."""

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

from cademi_downloader.models import (
    Course,
    CourseListItem,
    DownloadMode,
    DownloadSelection,
    DownloadStatus,
)

console = Console()


def print_banner() -> None:
    """Print the application banner."""
    console.print(
        Panel(
            "[bold cyan]Cademi Course Downloader[/]\n"
            "[dim]Download Cademi courses via browser automation[/]",
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
    table = Table(title="Cursos Disponíveis", border_style="cyan")
    table.add_column("#", style="dim", width=4)
    table.add_column("Nome", style="bold")
    table.add_column("URL", style="cyan", max_width=60)

    for i, course in enumerate(courses, start=1):
        table.add_row(str(i), course.name, course.url)

    console.print(table)


def print_course_structure(course: Course) -> None:
    """Display course structure (modules + lessons)."""
    console.print(f"\n[bold cyan]{course.name}[/]")

    for module in course.modules:
        console.print(f"\n  [bold]{module.order:02d}. {module.name}[/]")
        for lesson in module.lessons:
            status_icon = _status_icon(lesson.status)
            console.print(
                f"      {status_icon} {lesson.order:02d}. {lesson.name}"
            )


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
        choice = console.input("[bold cyan]Selecione o número do curso:[/] ")
        try:
            idx = int(choice) - 1
            if 0 <= idx < len(courses):
                return courses[idx]
        except ValueError:
            pass
        print_error(f"Escolha inválida. Digite um número entre 1 e {len(courses)}")


def prompt_download_mode() -> DownloadSelection:
    """Prompt user to select what types of content to download."""
    console.print("\n[bold cyan]O que você quer baixar?[/]\n")
    console.print("  [bold]1.[/] Tudo (vídeos + materiais + transcrições)")
    console.print("  [bold]2.[/] Apenas vídeos")
    console.print("  [bold]3.[/] Apenas materiais (PDFs, docs)")
    console.print("  [bold]4.[/] Apenas transcrições/legendas")
    console.print("  [bold]5.[/] Customizado")
    console.print()

    while True:
        choice = console.input("[bold cyan]Escolha (1-5):[/] ")
        try:
            idx = int(choice)
            if idx == 1:
                return DownloadSelection.from_mode(DownloadMode.ALL)
            if idx == 2:
                return DownloadSelection.from_mode(DownloadMode.VIDEOS)
            if idx == 3:
                return DownloadSelection.from_mode(DownloadMode.MATERIALS)
            if idx == 4:
                return DownloadSelection.from_mode(DownloadMode.TRANSCRIPTIONS)
            if idx == 5:
                return _prompt_custom_selection()
        except ValueError:
            pass
        print_error("Escolha inválida. Digite um número entre 1 e 5")


def _prompt_custom_selection() -> DownloadSelection:
    """Prompt user for custom download selection."""
    console.print("\n[bold]Selecione o que incluir:[/]\n")

    videos = _confirm("  Baixar vídeos?")
    materials = _confirm("  Baixar materiais (PDFs, docs)?")
    transcriptions = _confirm("  Baixar transcrições/legendas?")
    descriptions = _confirm("  Salvar descrições das aulas?")

    return DownloadSelection(
        videos=videos,
        materials=materials,
        transcriptions=transcriptions,
        descriptions=descriptions,
    )


def _confirm(prompt: str) -> bool:
    """Simple yes/no confirmation."""
    while True:
        answer = console.input(f"{prompt} [bold](s/n):[/] ").strip().lower()
        if answer in ("s", "sim", "y", "yes"):
            return True
        if answer in ("n", "nao", "não", "no"):
            return False
        print_error("Digite 's' ou 'n'")


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
