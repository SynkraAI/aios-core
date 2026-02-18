#!/usr/bin/env python3
"""
Pipeline Progress Tracker — Scaffold Template
Version: 1.0.0

INSTRUCTIONS:
1. Copy this file to your squad: squads/{squad}/lib/progress.py
2. Replace {{PIPELINE_TITLE}} with your pipeline name
3. Customize the display panel if needed
4. Install rich: pip install rich (optional — fallback works without it)

Features:
- Rich terminal progress with live updates
- Graceful fallback for non-TTY environments (CI/CD, pipes)
- ETA estimation
- Cost and token tracking
- Factory function for automatic selection
"""

__version__ = "1.0.0"

import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional

# Try to import rich, fallback gracefully
_RICH_AVAILABLE = False
try:
    from rich.console import Console
    from rich.live import Live
    from rich.panel import Panel
    from rich.table import Table
    from rich.text import Text
    _RICH_AVAILABLE = True
except ImportError:
    pass


def is_rich_supported() -> bool:
    """Check if rich display is available and stdout is a TTY."""
    return _RICH_AVAILABLE and sys.stdout.isatty()


# =============================================================================
# Progress State (shared by both implementations)
# =============================================================================

@dataclass
class ProgressState:
    """Current state of pipeline progress."""
    total_items: int
    total_phases: int
    item_noun: str = "items"  # CUSTOMIZE: "books", "minds", "courses", etc.

    current_item: int = 0
    current_item_label: str = ""
    current_phase: int = 0
    current_phase_name: str = ""
    completed_items: int = 0
    completed_phases: int = 0
    total_tokens_in: int = 0
    total_tokens_out: int = 0
    total_cost_usd: float = 0.0
    started_at: Optional[datetime] = None

    @property
    def elapsed_seconds(self) -> float:
        if not self.started_at:
            return 0.0
        return (datetime.now() - self.started_at).total_seconds()

    @property
    def total_operations(self) -> int:
        return self.total_items * self.total_phases

    @property
    def completed_operations(self) -> int:
        return (self.completed_items * self.total_phases) + self.completed_phases

    @property
    def progress_percent(self) -> float:
        if self.total_operations == 0:
            return 0.0
        return (self.completed_operations / self.total_operations) * 100

    @property
    def eta_seconds(self) -> Optional[float]:
        if self.completed_operations == 0 or self.elapsed_seconds == 0:
            return None
        avg = self.elapsed_seconds / self.completed_operations
        remaining = self.total_operations - self.completed_operations
        return avg * remaining

    @property
    def eta_formatted(self) -> str:
        eta = self.eta_seconds
        if eta is None:
            return "calculating..."
        if eta < 60:
            return f"{int(eta)}s"
        elif eta < 3600:
            return f"{int(eta // 60)}m {int(eta % 60)}s"
        else:
            return f"{int(eta // 3600)}h {int((eta % 3600) // 60)}m"


# =============================================================================
# Rich Progress Tracker (interactive TTY)
# =============================================================================

class ProgressTracker:
    """Rich terminal progress tracker with live updates."""

    # CUSTOMIZE: Change the panel title
    PANEL_TITLE = "[bold blue]Pipeline Progress[/bold blue]"

    def __init__(
        self,
        total_items: int,
        total_phases: int,
        item_noun: str = "items",
        show_cost: bool = True,
        show_tokens: bool = True,
    ):
        self.state = ProgressState(
            total_items=total_items,
            total_phases=total_phases,
            item_noun=item_noun,
        )
        self.show_cost = show_cost
        self.show_tokens = show_tokens
        self._live: Optional[Live] = None
        self._console: Optional[Console] = None
        self._is_active = False

        if is_rich_supported():
            self._console = Console(stderr=True)

    def _build_display(self) -> Panel:
        table = Table.grid(padding=(0, 2))
        table.add_column(justify="right", style="cyan", no_wrap=True)
        table.add_column(justify="left")

        # Progress bar
        pct = self.state.progress_percent
        bar_width = 30
        filled = int(bar_width * pct / 100)
        bar = "\u2588" * filled + "\u2591" * (bar_width - filled)

        progress_text = Text()
        progress_text.append(f"[Phase {self.state.current_phase}/{self.state.total_phases}] ", style="yellow")
        progress_text.append(f"[{self.state.item_noun.capitalize()} {self.state.current_item}/{self.state.total_items}] ", style="green")
        progress_text.append(f"[{bar}] ", style="blue")
        progress_text.append(f"{pct:.1f}%", style="bold white")
        table.add_row("Progress:", progress_text)

        # Current operation
        if self.state.current_phase_name:
            table.add_row(
                "Current:",
                Text(f"{self.state.current_item_label} -> {self.state.current_phase_name}", style="white")
            )

        # ETA
        eta_text = Text()
        eta_text.append(f"ETA: {self.state.eta_formatted}", style="magenta")
        elapsed_min = int(self.state.elapsed_seconds // 60)
        elapsed_sec = int(self.state.elapsed_seconds % 60)
        eta_text.append(f" (elapsed: {elapsed_min}m {elapsed_sec}s)", style="dim")
        table.add_row("Time:", eta_text)

        # Cost
        if self.show_cost:
            cost_text = Text()
            cost_text.append(f"${self.state.total_cost_usd:.4f}", style="bold green")
            if self.state.completed_items > 0:
                avg = self.state.total_cost_usd / self.state.completed_items
                cost_text.append(f" (avg: ${avg:.4f}/{self.state.item_noun[:-1]})", style="dim")
            table.add_row("Cost:", cost_text)

        # Tokens
        if self.show_tokens:
            total = self.state.total_tokens_in + self.state.total_tokens_out
            token_text = Text()
            token_text.append(f"{total:,}", style="cyan")
            token_text.append(f" ({self.state.total_tokens_in:,} in / {self.state.total_tokens_out:,} out)", style="dim")
            table.add_row("Tokens:", token_text)

        # Completed
        stats_text = Text()
        stats_text.append(f"{self.state.completed_items} {self.state.item_noun}", style="green")
        stats_text.append(" / ", style="dim")
        stats_text.append(f"{self.state.completed_operations} phases", style="yellow")
        table.add_row("Completed:", stats_text)

        return Panel(table, title=self.PANEL_TITLE, border_style="blue")

    def start(self) -> None:
        if not is_rich_supported():
            print(f"\n{'='*60}")
            print(f"Starting pipeline: {self.state.total_items} {self.state.item_noun}, {self.state.total_phases} phases each")
            print(f"{'='*60}\n")
            return
        self.state.started_at = datetime.now()
        self._is_active = True
        self._live = Live(self._build_display(), console=self._console, refresh_per_second=2, transient=False)
        self._live.start()

    def stop(self) -> None:
        if not is_rich_supported():
            elapsed = self.state.elapsed_seconds
            print(f"\n{'='*60}")
            print(f"Pipeline complete in {elapsed:.1f}s")
            print(f"  {self.state.item_noun.capitalize()}: {self.state.completed_items}/{self.state.total_items}")
            print(f"  Cost: ${self.state.total_cost_usd:.4f}")
            print(f"  Tokens: {self.state.total_tokens_in + self.state.total_tokens_out:,}")
            print(f"{'='*60}\n")
            return
        self._is_active = False
        if self._live:
            self._live.stop()

    def _refresh(self) -> None:
        if self._live and self._is_active:
            self._live.update(self._build_display())

    def start_item(self, item_num: int, item_label: str) -> None:
        self.state.current_item = item_num
        self.state.current_item_label = item_label
        self.state.completed_phases = 0
        self.state.current_phase = 0
        self.state.current_phase_name = ""
        if not is_rich_supported():
            print(f"\n[{item_num}/{self.state.total_items}] Processing: {item_label}")
        self._refresh()

    def start_phase(self, phase_num: int, phase_name: str) -> None:
        self.state.current_phase = phase_num
        self.state.current_phase_name = phase_name
        if not is_rich_supported():
            print(f"  Phase {phase_num}/{self.state.total_phases}: {phase_name}...")
        self._refresh()

    def complete_phase(self, tokens_in: int = 0, tokens_out: int = 0, cost_usd: float = 0.0, success: bool = True) -> None:
        self.state.completed_phases += 1
        self.state.total_tokens_in += tokens_in
        self.state.total_tokens_out += tokens_out
        self.state.total_cost_usd += cost_usd
        if not is_rich_supported():
            status = "ok" if success else "FAILED"
            print(f"    [{status}] +{tokens_in + tokens_out:,} tokens, +${cost_usd:.4f}")
        self._refresh()

    def complete_item(self, success: bool = True) -> None:
        if success:
            self.state.completed_items += 1
        if not is_rich_supported():
            status = "COMPLETE" if success else "FAILED"
            print(f"  [{status}] Cost so far: ${self.state.total_cost_usd:.4f}")
        self._refresh()

    def add_cost(self, cost_usd: float) -> None:
        self.state.total_cost_usd += cost_usd
        self._refresh()

    def add_tokens(self, tokens_in: int = 0, tokens_out: int = 0) -> None:
        self.state.total_tokens_in += tokens_in
        self.state.total_tokens_out += tokens_out
        self._refresh()


# =============================================================================
# Simple Progress (non-TTY fallback)
# =============================================================================

class SimpleProgress:
    """Print-based progress for non-interactive environments."""

    def __init__(self, total_items: int, total_phases: int, item_noun: str = "items", **kwargs):
        self.state = ProgressState(total_items=total_items, total_phases=total_phases, item_noun=item_noun)

    def start(self) -> None:
        self.state.started_at = datetime.now()
        print(f"\n{'='*60}")
        print(f"Starting pipeline: {self.state.total_items} {self.state.item_noun}")
        print(f"{'='*60}")

    def stop(self) -> None:
        elapsed = self.state.elapsed_seconds
        print(f"\n{'='*60}")
        print(f"Pipeline complete in {elapsed:.1f}s")
        print(f"  {self.state.item_noun.capitalize()}: {self.state.completed_items}/{self.state.total_items}")
        print(f"  Cost: ${self.state.total_cost_usd:.4f}")
        print(f"  Tokens: {self.state.total_tokens_in + self.state.total_tokens_out:,}")
        print(f"{'='*60}\n")

    def start_item(self, item_num: int, item_label: str) -> None:
        self.state.current_item = item_num
        self.state.current_item_label = item_label
        self.state.completed_phases = 0
        print(f"\n[{item_num}/{self.state.total_items}] {item_label}")

    def start_phase(self, phase_num: int, phase_name: str) -> None:
        self.state.current_phase = phase_num
        print(f"  Phase {phase_num}: {phase_name}...", end="", flush=True)

    def complete_phase(self, tokens_in: int = 0, tokens_out: int = 0, cost_usd: float = 0.0, success: bool = True) -> None:
        self.state.completed_phases += 1
        self.state.total_tokens_in += tokens_in
        self.state.total_tokens_out += tokens_out
        self.state.total_cost_usd += cost_usd
        print(f" [{'ok' if success else 'FAIL'}]")

    def complete_item(self, success: bool = True) -> None:
        if success:
            self.state.completed_items += 1
        print(f"  [{'DONE' if success else 'FAILED'}] Cost: ${self.state.total_cost_usd:.4f}")

    def add_cost(self, cost_usd: float) -> None:
        self.state.total_cost_usd += cost_usd

    def add_tokens(self, tokens_in: int = 0, tokens_out: int = 0) -> None:
        self.state.total_tokens_in += tokens_in
        self.state.total_tokens_out += tokens_out


# =============================================================================
# Factory
# =============================================================================

def create_progress_tracker(
    total_items: int,
    total_phases: int,
    item_noun: str = "items",
    show_cost: bool = True,
    show_tokens: bool = True,
    force_simple: bool = False,
) -> ProgressTracker | SimpleProgress:
    """
    Create the appropriate progress tracker.

    Returns ProgressTracker if rich is available and stdout is TTY,
    SimpleProgress otherwise.
    """
    if force_simple or not is_rich_supported():
        return SimpleProgress(total_items, total_phases, item_noun)
    return ProgressTracker(total_items, total_phases, item_noun, show_cost, show_tokens)


# =============================================================================
# Test
# =============================================================================

if __name__ == "__main__":
    print(f"Rich supported: {is_rich_supported()}")
    print(f"Rich available: {_RICH_AVAILABLE}")
    print()

    tracker = create_progress_tracker(total_items=3, total_phases=4, item_noun="items")
    tracker.start()

    try:
        for item in range(1, 4):
            tracker.start_item(item, f"test-item-{item}")
            for phase in range(1, 5):
                tracker.start_phase(phase, f"phase-{phase}")
                time.sleep(0.3)
                tracker.complete_phase(tokens_in=1000 * phase, tokens_out=500 * phase, cost_usd=0.01 * phase)
            tracker.complete_item()
    finally:
        tracker.stop()
