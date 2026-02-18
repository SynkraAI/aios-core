#!/usr/bin/env python3
"""
Pipeline Phase Runner — Scaffold Template
Version: 1.0.0

INSTRUCTIONS:
1. Copy this file to your squad: squads/{squad}/lib/phase_runner.py
2. Define your phases in get_phase_definitions()
3. Implement phase handler functions
4. Wire up with pipeline_state and progress (optional)

Features:
- Phase definitions with handlers, timeouts, criticality
- Cache-aware execution (skip phases with existing output)
- Resume from any phase via PipelineStateManager
- Optional progress tracking integration
- Configurable error handling (critical vs non-critical phases)

Dependencies:
- pipeline_state.py (required for state persistence)
- progress.py (optional for progress display)
"""

__version__ = "1.0.0"

import asyncio
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Coroutine, Dict, List, Optional, Union


# =============================================================================
# Phase Definition
# =============================================================================

@dataclass
class PhaseDefinition:
    """
    Definition of a pipeline phase.

    Attributes:
        num: Phase number (0-indexed, sequential)
        name: Human-readable name (used in logs and state)
        handler: Async function that executes the phase
        timeout_seconds: Max execution time before killing the phase
        critical: If True, failure stops the entire pipeline
        cache_check: Optional function that returns True if output already exists
        description: Optional description for documentation
    """
    num: int
    name: str
    handler: Callable[..., Coroutine[Any, Any, "PhaseResult"]]
    timeout_seconds: int = 600  # 10 min default
    critical: bool = True
    cache_check: Optional[Callable[..., bool]] = None
    description: str = ""


@dataclass
class PhaseResult:
    """
    Result of a phase execution.

    Every phase handler MUST return this.
    """
    success: bool
    output: str = ""           # Text output stored in state for next phases
    output_file: Optional[str] = None  # Path to output file if applicable
    tokens_in: int = 0
    tokens_out: int = 0
    cost_usd: float = 0.0
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class PipelineResult:
    """Result of the entire pipeline execution."""
    success: bool
    item_id: str
    completed_phases: int
    total_phases: int
    failed_phase: Optional[int] = None
    failed_phase_name: Optional[str] = None
    total_tokens_in: int = 0
    total_tokens_out: int = 0
    total_cost_usd: float = 0.0
    duration_seconds: float = 0.0
    error: Optional[str] = None
    skipped_phases: List[int] = field(default_factory=list)
    cached_phases: List[int] = field(default_factory=list)


# =============================================================================
# Phase Runner
# =============================================================================

class PhaseRunner:
    """
    Executes phases in sequence with state persistence, progress tracking,
    and error handling.

    Usage:
        runner = PhaseRunner(
            phases=get_phase_definitions(),
            state_manager=state_mgr,       # From pipeline_state.py
            progress_tracker=tracker,       # From progress.py (optional)
        )
        result = await runner.run(item_id, metadata)
    """

    def __init__(
        self,
        phases: List[PhaseDefinition],
        state_manager=None,       # PipelineStateManager from pipeline_state.py
        progress_tracker=None,    # ProgressTracker from progress.py
        verbose: bool = True,
        force: bool = False,      # Ignore cache, re-run all phases
    ):
        self.phases = sorted(phases, key=lambda p: p.num)
        self.state = state_manager
        self.progress = progress_tracker
        self.verbose = verbose
        self.force = force

    def _log(self, message: str) -> None:
        if self.verbose:
            print(message, flush=True)

    async def run(
        self,
        item_id: str,
        metadata: Optional[Dict[str, Any]] = None,
        start_phase: Optional[int] = None,
        **handler_kwargs,
    ) -> PipelineResult:
        """
        Execute the pipeline for a single item.

        Args:
            item_id: Unique identifier for this pipeline run
            metadata: Domain-specific metadata passed to handlers
            start_phase: Override resume logic, start from this phase
            **handler_kwargs: Extra kwargs passed to every phase handler

        Returns:
            PipelineResult with execution summary
        """
        start_time = time.time()
        metadata = metadata or {}
        completed = 0
        skipped = []
        cached = []

        # Determine start phase
        if start_phase is not None:
            resume_from = start_phase
        elif self.state and self.state.load_state():
            resume_from = self.state.get_resume_phase()
            self._log(f"[RESUME] {item_id}: Resuming from phase {resume_from}")
        else:
            resume_from = 0
            if self.state:
                self.state.create_state(metadata)

        self._log(f"[START] {item_id}: {len(self.phases)} phases, starting at {resume_from}")

        # Collect previous outputs for feeding to handlers
        previous_outputs: Dict[int, str] = {}
        if self.state and self.state.state:
            previous_outputs = dict(self.state.state.phase_outputs)

        # Execute phases
        for phase_def in self.phases:
            if phase_def.num < resume_from:
                completed += 1
                continue

            # Cache check
            if not self.force and phase_def.cache_check:
                try:
                    if phase_def.cache_check(item_id):
                        self._log(f"  [CACHE] Phase {phase_def.num} ({phase_def.name}): cached, skipping")
                        cached.append(phase_def.num)
                        completed += 1
                        if self.state:
                            self.state.skip_phase(phase_def.num, "cached")
                        if self.progress:
                            self.progress.start_phase(phase_def.num, phase_def.name)
                            self.progress.complete_phase()
                        continue
                except Exception as e:
                    self._log(f"  [WARN] Cache check failed for phase {phase_def.num}: {e}")

            # Start phase
            self._log(f"  [PHASE {phase_def.num}] {phase_def.name}...")
            if self.state:
                self.state.start_phase(phase_def.num)
            if self.progress:
                self.progress.start_phase(phase_def.num, phase_def.name)

            # Execute handler with timeout
            try:
                result = await asyncio.wait_for(
                    phase_def.handler(
                        item_id=item_id,
                        metadata=metadata,
                        previous_outputs=previous_outputs,
                        **handler_kwargs,
                    ),
                    timeout=phase_def.timeout_seconds,
                )
            except asyncio.TimeoutError:
                error_msg = f"Phase {phase_def.num} ({phase_def.name}) timed out after {phase_def.timeout_seconds}s"
                self._log(f"  [TIMEOUT] {error_msg}")
                result = PhaseResult(success=False, error=error_msg)
            except Exception as e:
                error_msg = f"Phase {phase_def.num} ({phase_def.name}) error: {e}"
                self._log(f"  [ERROR] {error_msg}")
                result = PhaseResult(success=False, error=str(e))

            # Handle result
            if result.success:
                self._log(f"  [OK] Phase {phase_def.num} ({phase_def.name}) complete")
                completed += 1
                previous_outputs[phase_def.num] = result.output

                if self.state:
                    self.state.complete_phase(
                        phase=phase_def.num,
                        output_content=result.output,
                        tokens_in=result.tokens_in,
                        tokens_out=result.tokens_out,
                        cost_usd=result.cost_usd,
                        output_file=result.output_file,
                    )
                if self.progress:
                    self.progress.complete_phase(
                        tokens_in=result.tokens_in,
                        tokens_out=result.tokens_out,
                        cost_usd=result.cost_usd,
                    )
            else:
                # Phase failed
                if self.state:
                    self.state.fail_phase(phase_def.num, result.error or "Unknown error")

                if phase_def.critical:
                    self._log(f"  [FATAL] Critical phase {phase_def.num} ({phase_def.name}) failed — stopping pipeline")
                    if self.progress:
                        self.progress.complete_phase(success=False)

                    return PipelineResult(
                        success=False,
                        item_id=item_id,
                        completed_phases=completed,
                        total_phases=len(self.phases),
                        failed_phase=phase_def.num,
                        failed_phase_name=phase_def.name,
                        error=result.error,
                        duration_seconds=time.time() - start_time,
                        skipped_phases=skipped,
                        cached_phases=cached,
                    )
                else:
                    self._log(f"  [WARN] Non-critical phase {phase_def.num} ({phase_def.name}) failed — continuing")
                    skipped.append(phase_def.num)
                    if self.progress:
                        self.progress.complete_phase(success=False)

        # Pipeline complete
        if self.state:
            self.state.complete_pipeline()

        duration = time.time() - start_time
        self._log(f"[DONE] {item_id}: {completed}/{len(self.phases)} phases in {duration:.1f}s")

        total_in = sum(
            self.state.state.phases[p].tokens_in
            for p in self.state.state.phases
            if self.state and self.state.state
        ) if self.state and self.state.state else 0

        total_out = sum(
            self.state.state.phases[p].tokens_out
            for p in self.state.state.phases
            if self.state and self.state.state
        ) if self.state and self.state.state else 0

        total_cost = (
            self.state.state.total_cost_usd
            if self.state and self.state.state
            else 0.0
        )

        return PipelineResult(
            success=True,
            item_id=item_id,
            completed_phases=completed,
            total_phases=len(self.phases),
            total_tokens_in=total_in,
            total_tokens_out=total_out,
            total_cost_usd=total_cost,
            duration_seconds=duration,
            skipped_phases=skipped,
            cached_phases=cached,
        )


# =============================================================================
# CUSTOMIZE: Define your phases here
# =============================================================================

# Example phase handlers — replace with your actual logic

async def _example_phase_extract(
    item_id: str,
    metadata: Dict[str, Any],
    previous_outputs: Dict[int, str],
    **kwargs,
) -> PhaseResult:
    """Example: Extract data from source."""
    # Your extraction logic here
    return PhaseResult(
        success=True,
        output=f"Extracted data for {item_id}",
        tokens_in=500,
        tokens_out=200,
        cost_usd=0.001,
    )


async def _example_phase_transform(
    item_id: str,
    metadata: Dict[str, Any],
    previous_outputs: Dict[int, str],
    **kwargs,
) -> PhaseResult:
    """Example: Transform extracted data."""
    extract_output = previous_outputs.get(0, "")
    # Your transformation logic here
    return PhaseResult(
        success=True,
        output=f"Transformed: {extract_output[:50]}",
        tokens_in=300,
        tokens_out=400,
        cost_usd=0.002,
    )


async def _example_phase_load(
    item_id: str,
    metadata: Dict[str, Any],
    previous_outputs: Dict[int, str],
    **kwargs,
) -> PhaseResult:
    """Example: Load results to destination."""
    # Your loading logic here
    return PhaseResult(
        success=True,
        output=f"Loaded to destination for {item_id}",
    )


def get_example_phases() -> List[PhaseDefinition]:
    """
    CUSTOMIZE: Return your phase definitions.

    Replace this with your actual phases.
    """
    return [
        PhaseDefinition(
            num=0,
            name="extract",
            handler=_example_phase_extract,
            timeout_seconds=300,
            critical=True,
            description="Extract raw data from source",
        ),
        PhaseDefinition(
            num=1,
            name="transform",
            handler=_example_phase_transform,
            timeout_seconds=600,
            critical=True,
            description="Transform and enrich extracted data",
        ),
        PhaseDefinition(
            num=2,
            name="load",
            handler=_example_phase_load,
            timeout_seconds=120,
            critical=False,  # Non-critical: pipeline succeeds even if load fails
            description="Load results to final destination",
        ),
    ]


# =============================================================================
# Test
# =============================================================================

if __name__ == "__main__":
    import tempfile

    async def test():
        print("=== Testing Phase Runner ===\n")

        # Minimal test without state manager
        phases = get_example_phases()
        runner = PhaseRunner(phases=phases, verbose=True)

        result = await runner.run(
            item_id="test-item",
            metadata={"title": "Test", "author": "Test Author"},
        )

        print(f"\nResult:")
        print(f"  Success: {result.success}")
        print(f"  Completed: {result.completed_phases}/{result.total_phases}")
        print(f"  Duration: {result.duration_seconds:.1f}s")
        print(f"  Skipped: {result.skipped_phases}")
        print(f"  Cached: {result.cached_phases}")

        # Test with state manager
        print("\n--- With State Manager ---\n")
        try:
            from pipeline_state import PipelineStateManager
            with tempfile.TemporaryDirectory() as tmpdir:
                state_mgr = PipelineStateManager(
                    "test-item-2",
                    Path(tmpdir),
                    phase_definitions={p.num: p.name for p in phases},
                )
                runner2 = PhaseRunner(phases=phases, state_manager=state_mgr, verbose=True)
                result2 = await runner2.run("test-item-2", {"title": "Test 2"})
                print(f"\nResult: success={result2.success}, phases={result2.completed_phases}/{result2.total_phases}")
        except ImportError:
            print("(pipeline_state not available, skipping state test)")

        print("\n=== Test Complete ===")

    asyncio.run(test())
