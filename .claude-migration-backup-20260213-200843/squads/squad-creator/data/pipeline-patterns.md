# Pipeline Patterns Reference

> **Source:** Extracted from `squads/books/lib/` (pipeline_state.py, progress.py, etl_runner.py)
> **Version:** 1.0.0
> **Updated:** 2026-02-08
> **Purpose:** Reusable patterns for squads that need multi-phase data processing pipelines

---

## When to Use These Patterns

Use pipeline patterns when your squad has:
- **Multi-phase processing** — 3+ sequential steps that transform data
- **Long-running operations** — minutes to hours per item
- **Resume requirement** — need to pick up where you left off after crash/interruption
- **Batch processing** — processing N items through the same pipeline
- **Cost tracking** — need to know how much each phase/item costs

**Do NOT use if:**
- Your squad has simple request/response workflows (just use functions)
- Operations take < 30 seconds per item
- There's no need for resume or progress tracking

---

## Pattern 1: Pipeline State (Resume Capability)

**Problem:** Long pipeline crashes at phase 7 of 11. You lose all progress.

**Solution:** Persist state to JSON after every phase. On restart, detect completed phases and resume from the next pending one.

### Core Design

```python
@dataclass
class PhaseState:
    """State of a single phase."""
    phase: int
    name: str
    status: str  # "pending" | "in_progress" | "completed" | "failed" | "skipped"
    executor: str = ""
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    duration_seconds: Optional[float] = None
    tokens_in: int = 0
    tokens_out: int = 0
    cost_usd: float = 0.0
    output_file: Optional[str] = None
    error: Optional[str] = None

@dataclass
class PipelineState:
    """Complete pipeline state for an item."""
    item_id: str                       # Unique identifier (slug, UUID, etc.)
    metadata: Dict[str, Any]           # Consumer puts whatever they need
    status: str                        # Free string, not enum
    current_phase: int
    started_at: str
    last_updated: str
    phases: Dict[int, PhaseState]
    phase_outputs: Dict[int, str]      # Output of each phase (for feeding next)
    total_tokens_in: int = 0
    total_tokens_out: int = 0
    total_cost_usd: float = 0.0
```

### Key Operations

| Operation | What it does | When to call |
|-----------|-------------|--------------|
| `create_state(item_id, metadata, phases)` | Initialize with all phases as "pending" | Start of pipeline |
| `start_phase(phase_num)` | Mark "in_progress", record timestamp | Before executing phase |
| `complete_phase(phase_num, output, tokens, cost)` | Mark "completed", store output, update totals | After phase succeeds |
| `fail_phase(phase_num, error)` | Mark "failed", record error | When phase fails |
| `skip_phase(phase_num, reason)` | Mark "skipped" | When phase is not needed |
| `reset_phase(phase_num)` | Reset to "pending" | For reprocessing |
| `get_next_pending_phase()` | Find first "pending" phase | Resume logic |
| `get_resume_phase()` | Last completed + 1 | Resume logic |
| `save_state()` / `load_state()` | Persist to / load from JSON | Every state change |

### Resume Pattern

```python
# Resume logic (the key value)
manager = PipelineStateManager(item_id, state_dir)

if manager.load_state():
    # Existing state found — resume
    resume_phase = manager.get_resume_phase()
    print(f"Resuming from phase {resume_phase}")
else:
    # No existing state — start fresh
    manager.create_state(metadata, phase_definitions)
    resume_phase = 0

# Execute from resume point
for phase_num in range(resume_phase, total_phases):
    manager.start_phase(phase_num)
    try:
        output = execute_phase(phase_num, previous_outputs)
        manager.complete_phase(phase_num, output)
    except Exception as e:
        manager.fail_phase(phase_num, str(e))
        break  # or continue, depending on phase criticality
```

### Anti-Patterns

| Anti-Pattern | Why it's wrong | Correct approach |
|-------------|---------------|-----------------|
| Hardcoded phase enum | Can't reuse across squads | Use `str` status, define phases at init |
| Save state only at end | Lose progress on crash | Save after EVERY phase |
| Store outputs in memory only | Can't resume | Persist to disk + state JSON |
| Phase names in state manager | Couples manager to domain | Pass phase definitions from consumer |

---

## Pattern 2: Progress Tracking

**Problem:** Pipeline runs for 30 minutes. User has no idea what's happening.

**Solution:** Rich terminal progress bar with fallback for non-TTY environments.

### Core Design

```python
@dataclass
class ProgressState:
    """Current state of pipeline progress."""
    total_items: int
    total_phases: int
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
    item_noun: str = "items"  # "books", "minds", "courses", etc.
```

### Key Features

1. **Rich + Fallback**: Use `rich` library for TTY, simple print for CI/CD
2. **ETA Calculation**: `avg_time_per_op * remaining_ops`
3. **Cost Display**: Running total of $ spent
4. **Token Display**: Input/output token counts
5. **Factory Function**: `create_progress_tracker()` returns right implementation

### Factory Pattern

```python
def create_progress_tracker(
    total_items: int,
    total_phases: int,
    item_noun: str = "items",
    show_cost: bool = True,
    force_simple: bool = False
) -> ProgressTracker | SimpleProgress:
    """Returns rich tracker if TTY available, simple otherwise."""
    if force_simple or not is_rich_supported():
        return SimpleProgress(total_items, total_phases, item_noun)
    return ProgressTracker(total_items, total_phases, item_noun)
```

### Usage Flow

```python
tracker = create_progress_tracker(total_items=10, total_phases=5, item_noun="books")
tracker.start()

for i, item in enumerate(items, 1):
    tracker.start_item(i, item.label)
    for phase_num, phase in enumerate(phases, 1):
        tracker.start_phase(phase_num, phase.name)
        result = execute(phase, item)
        tracker.complete_phase(tokens_in=result.tokens_in, cost_usd=result.cost)
    tracker.complete_item()

tracker.stop()
```

### Anti-Patterns

| Anti-Pattern | Why it's wrong | Correct approach |
|-------------|---------------|-----------------|
| Only rich, no fallback | Breaks in CI/CD | Factory with SimpleProgress |
| Progress to stdout | Mixes with JSONL output | Use stderr for progress |
| No ETA | User can't plan | Track elapsed, calculate remaining |
| Hardcoded "books" | Can't reuse | `item_noun` parameter |

---

## Pattern 3: Phase Runner (Orchestration)

**Problem:** Need to run N phases in sequence, with caching, timeouts, and error handling per phase.

**Solution:** Phase runner that takes phase definitions with handlers, manages execution flow.

### Core Design

```python
@dataclass
class PhaseDefinition:
    """Definition of a pipeline phase."""
    num: int
    name: str
    handler: Callable              # async function that does the work
    timeout_seconds: int = 600     # 10 min default
    critical: bool = True          # If True, failure stops pipeline
    cache_check: Optional[Callable] = None  # Returns True if phase output already exists

class PhaseRunner:
    """Executes phases in sequence with state, progress, and error handling."""

    def __init__(
        self,
        phases: List[PhaseDefinition],
        state_manager: PipelineStateManager,
        progress_tracker: Optional[ProgressTracker] = None,
    ):
        self.phases = phases
        self.state = state_manager
        self.progress = progress_tracker
```

### Execution Flow

```
For each phase:
  1. Check cache (skip if output exists and not force)
  2. Start phase (update state + progress)
  3. Execute handler with timeout
  4. On success: complete phase (save output, update state + progress)
  5. On failure:
     - If critical: fail phase, stop pipeline
     - If non-critical: warn, continue to next phase
```

### Handler Contract

```python
# Every phase handler has the same signature:
async def my_phase_handler(
    item_id: str,
    metadata: Dict[str, Any],
    previous_outputs: Dict[int, str],  # outputs from prior phases
    **kwargs
) -> str:
    """
    Execute a phase.

    Returns:
        Phase output as string (stored in state for next phases)

    Raises:
        Exception on failure
    """
```

### Caching Pattern

```python
# Cache check: skip phase if output already exists
def check_research_cache(item_id, output_dir):
    sources_dir = output_dir / item_id / "research" / "sources"
    if sources_dir.exists():
        return len(list(sources_dir.rglob("*.md"))) >= 3
    return False

phases = [
    PhaseDefinition(
        num=0,
        name="research",
        handler=run_research,
        cache_check=check_research_cache,  # Skip if already done
        critical=True,
    ),
    PhaseDefinition(
        num=1,
        name="curate",
        handler=curate_sources,
        critical=False,  # Non-blocking — continue even if curation fails
    ),
]
```

### Anti-Patterns

| Anti-Pattern | Why it's wrong | Correct approach |
|-------------|---------------|-----------------|
| Hardcoded script paths | Couples runner to file layout | Handlers as callables |
| All phases critical | One failure kills everything | Mark non-critical phases |
| No timeout | Phase hangs forever | Timeout per phase |
| No caching | Re-runs completed work | cache_check function |

---

## Pattern Interaction

```
                    ┌─────────────────┐
                    │   PhaseRunner    │ ← Orchestrates execution
                    │  (pattern 3)    │
                    └────┬──────┬─────┘
                         │      │
              ┌──────────▼──┐   │
              │ StateManager │   │
              │ (pattern 1)  │   │
              │  save/load   │   │
              │  resume      │   │
              └──────────────┘   │
                                 │
                    ┌────────────▼────┐
                    │ ProgressTracker  │
                    │  (pattern 2)    │
                    │  display/ETA    │
                    └─────────────────┘
```

**PhaseRunner** calls **StateManager** to persist progress and **ProgressTracker** to display it. Each is optional — you can use state without progress, or progress without state.

---

## Checklist: Does My Squad Need a Pipeline?

- [ ] Does the squad process items through 3+ sequential phases?
- [ ] Does each item take > 1 minute to process?
- [ ] Would it be painful to restart from scratch if interrupted?
- [ ] Do you process items in batches (> 1 item)?
- [ ] Do you need to track cost per item/phase?

**Score:** 3+ yes = use pipeline patterns. 1-2 = optional. 0 = don't bother.

---

## Templates

Scaffold templates are available at:
- `templates/pipeline-state-tmpl.py` — PipelineState + PipelineStateManager
- `templates/pipeline-progress-tmpl.py` — ProgressTracker + SimpleProgress + factory
- `templates/pipeline-runner-tmpl.py` — PhaseRunner + PhaseDefinition

Use the `*create-pipeline` task to generate these customized for your squad.

---

_Pipeline Patterns Reference v1.0.0_
_Extracted from: squads/books/lib/ (battle-tested on 100+ books)_
