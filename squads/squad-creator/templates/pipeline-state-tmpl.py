#!/usr/bin/env python3
"""
Pipeline State Manager — Scaffold Template
Version: 1.0.0

INSTRUCTIONS:
1. Copy this file to your squad: squads/{squad}/lib/pipeline_state.py
2. Replace {{SQUAD_NAME}} with your squad name
3. Define your phases in PHASE_DEFINITIONS
4. Add domain-specific metadata fields as needed

Features:
- Resume from any phase after interruption
- Cost tracking per phase
- JSON persistence
- Audit trail with timestamps
"""

__version__ = "1.0.0"

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


# =============================================================================
# CUSTOMIZE: Define your phases here
# =============================================================================

PHASE_DEFINITIONS = {
    # phase_num: "phase-name"
    0: "phase-zero",
    1: "phase-one",
    2: "phase-two",
    # Add more phases as needed
}


# =============================================================================
# Core Data Classes (agnostic — do not add domain terms here)
# =============================================================================

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

    def to_dict(self) -> Dict[str, Any]:
        return {
            "phase": self.phase,
            "name": self.name,
            "status": self.status,
            "executor": self.executor,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "duration_seconds": self.duration_seconds,
            "tokens_in": self.tokens_in,
            "tokens_out": self.tokens_out,
            "cost_usd": self.cost_usd,
            "output_file": self.output_file,
            "error": self.error,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PhaseState":
        return cls(
            phase=data["phase"],
            name=data["name"],
            status=data["status"],
            executor=data.get("executor", ""),
            started_at=data.get("started_at"),
            completed_at=data.get("completed_at"),
            duration_seconds=data.get("duration_seconds"),
            tokens_in=data.get("tokens_in", 0),
            tokens_out=data.get("tokens_out", 0),
            cost_usd=data.get("cost_usd", 0.0),
            output_file=data.get("output_file"),
            error=data.get("error"),
        )


@dataclass
class PipelineState:
    """Complete pipeline state for an item."""
    item_id: str
    metadata: Dict[str, Any]  # Domain-specific data goes here
    status: str  # "not_started" | "in_progress" | "completed" | "failed" | "paused"
    current_phase: int
    started_at: str
    last_updated: str
    phases: Dict[int, PhaseState] = field(default_factory=dict)
    phase_outputs: Dict[int, str] = field(default_factory=dict)
    total_tokens_in: int = 0
    total_tokens_out: int = 0
    total_cost_usd: float = 0.0
    last_error: Optional[str] = None
    error_phase: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "item_id": self.item_id,
            "metadata": self.metadata,
            "status": self.status,
            "current_phase": self.current_phase,
            "started_at": self.started_at,
            "last_updated": self.last_updated,
            "phases": {str(k): v.to_dict() for k, v in self.phases.items()},
            "phase_outputs": {str(k): v for k, v in self.phase_outputs.items()},
            "total_tokens_in": self.total_tokens_in,
            "total_tokens_out": self.total_tokens_out,
            "total_cost_usd": self.total_cost_usd,
            "last_error": self.last_error,
            "error_phase": self.error_phase,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PipelineState":
        phases = {int(k): PhaseState.from_dict(v) for k, v in data.get("phases", {}).items()}
        phase_outputs = {int(k): v for k, v in data.get("phase_outputs", {}).items()}
        return cls(
            item_id=data["item_id"],
            metadata=data.get("metadata", {}),
            status=data["status"],
            current_phase=data["current_phase"],
            started_at=data["started_at"],
            last_updated=data["last_updated"],
            phases=phases,
            phase_outputs=phase_outputs,
            total_tokens_in=data.get("total_tokens_in", 0),
            total_tokens_out=data.get("total_tokens_out", 0),
            total_cost_usd=data.get("total_cost_usd", 0.0),
            last_error=data.get("last_error"),
            error_phase=data.get("error_phase"),
        )


# =============================================================================
# State Manager
# =============================================================================

class PipelineStateManager:
    """
    Manages persistent state for pipeline execution.
    Enables resume from any phase after interruption.
    """

    def __init__(
        self,
        item_id: str,
        state_dir: Path,
        phase_definitions: Optional[Dict[int, str]] = None,
    ):
        """
        Args:
            item_id: Unique identifier for this pipeline run
            state_dir: Directory to store state file and outputs
            phase_definitions: Dict of {phase_num: phase_name}. Uses PHASE_DEFINITIONS if None
        """
        self.item_id = item_id
        self.state_dir = state_dir
        self.state_file = state_dir / "pipeline-state.json"
        self.phase_definitions = phase_definitions or PHASE_DEFINITIONS

        state_dir.mkdir(parents=True, exist_ok=True)
        self.state: Optional[PipelineState] = None

    def _timestamp(self) -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    def load_state(self) -> Optional[PipelineState]:
        """Load existing state from disk."""
        if self.state_file.exists():
            try:
                data = json.loads(self.state_file.read_text(encoding="utf-8"))
                self.state = PipelineState.from_dict(data)
                return self.state
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Warning: Failed to load state: {e}")
                return None
        return None

    def save_state(self) -> None:
        """Save current state to disk."""
        if self.state:
            self.state.last_updated = self._timestamp()
            self.state_file.write_text(
                json.dumps(self.state.to_dict(), indent=2, ensure_ascii=False),
                encoding="utf-8"
            )

    def create_state(self, metadata: Dict[str, Any]) -> PipelineState:
        """Create new pipeline state with all phases as pending."""
        now = self._timestamp()
        phases = {}
        for phase_num, phase_name in self.phase_definitions.items():
            phases[phase_num] = PhaseState(
                phase=phase_num,
                name=phase_name,
                status="pending",
            )

        self.state = PipelineState(
            item_id=self.item_id,
            metadata=metadata,
            status="not_started",
            current_phase=0,
            started_at=now,
            last_updated=now,
            phases=phases,
        )
        self.save_state()
        return self.state

    def start_phase(self, phase: int) -> None:
        """Mark a phase as started."""
        if self.state and phase in self.state.phases:
            self.state.phases[phase].status = "in_progress"
            self.state.phases[phase].started_at = self._timestamp()
            self.state.current_phase = phase
            self.state.status = "in_progress"
            self.save_state()

    def complete_phase(
        self,
        phase: int,
        output_content: str = "",
        tokens_in: int = 0,
        tokens_out: int = 0,
        cost_usd: float = 0.0,
        output_file: Optional[str] = None,
    ) -> None:
        """Mark a phase as completed and accumulate totals."""
        if self.state and phase in self.state.phases:
            ps = self.state.phases[phase]
            ps.status = "completed"
            ps.completed_at = self._timestamp()
            ps.tokens_in = tokens_in
            ps.tokens_out = tokens_out
            ps.cost_usd = cost_usd
            ps.output_file = output_file

            if ps.started_at:
                start = datetime.fromisoformat(ps.started_at.replace("Z", "+00:00"))
                ps.duration_seconds = (datetime.now(timezone.utc) - start).total_seconds()

            self.state.total_tokens_in += tokens_in
            self.state.total_tokens_out += tokens_out
            self.state.total_cost_usd += cost_usd

            if output_content:
                self.state.phase_outputs[phase] = output_content

            self.save_state()

    def fail_phase(self, phase: int, error: str) -> None:
        """Mark a phase as failed."""
        if self.state and phase in self.state.phases:
            self.state.phases[phase].status = "failed"
            self.state.phases[phase].error = error
            self.state.phases[phase].completed_at = self._timestamp()
            self.state.status = "failed"
            self.state.last_error = error
            self.state.error_phase = phase
            self.save_state()

    def skip_phase(self, phase: int, reason: str) -> None:
        """Mark a phase as skipped."""
        if self.state and phase in self.state.phases:
            self.state.phases[phase].status = "skipped"
            self.state.phases[phase].error = f"Skipped: {reason}"
            self.save_state()

    def reset_phase(self, phase: int) -> None:
        """Reset a phase to pending for reprocessing."""
        if self.state and phase in self.state.phases:
            ps = self.state.phases[phase]
            ps.status = "pending"
            ps.started_at = None
            ps.completed_at = None
            ps.duration_seconds = None
            ps.error = None
            ps.tokens_in = 0
            ps.tokens_out = 0
            ps.cost_usd = 0.0
            if phase in self.state.phase_outputs:
                del self.state.phase_outputs[phase]
            self.save_state()

    def get_next_pending_phase(self) -> Optional[int]:
        """Get the next phase that needs to be executed."""
        if not self.state:
            return None
        for phase in sorted(self.state.phases.keys()):
            if self.state.phases[phase].status == "pending":
                return phase
        return None

    def get_resume_phase(self) -> int:
        """Return phase to resume from (last completed + 1)."""
        if not self.state:
            return 0
        max_phase = max(self.state.phases.keys())
        for i in range(max_phase, -1, -1):
            if i in self.state.phases and self.state.phases[i].status == "completed":
                return min(i + 1, max_phase)
        return 0

    def can_resume(self) -> bool:
        """Check if pipeline can be resumed."""
        if not self.state:
            return False
        return self.state.status in ["in_progress", "failed", "paused"]

    def complete_pipeline(self) -> None:
        """Mark the pipeline as completed."""
        if self.state:
            self.state.status = "completed"
            self.save_state()

    def get_summary(self) -> Dict[str, Any]:
        """Get a summary of the pipeline state."""
        if not self.state:
            return {"exists": False}

        completed = sum(1 for p in self.state.phases.values() if p.status == "completed")
        failed = sum(1 for p in self.state.phases.values() if p.status == "failed")

        return {
            "exists": True,
            "item_id": self.state.item_id,
            "metadata": self.state.metadata,
            "status": self.state.status,
            "current_phase": self.state.current_phase,
            "phases_completed": completed,
            "phases_failed": failed,
            "phases_total": len(self.state.phases),
            "total_tokens": self.state.total_tokens_in + self.state.total_tokens_out,
            "total_cost_usd": self.state.total_cost_usd,
            "started_at": self.state.started_at,
            "last_updated": self.state.last_updated,
            "can_resume": self.can_resume(),
        }


# =============================================================================
# Convenience function
# =============================================================================

def load_or_create_state(
    item_id: str,
    state_dir: Path,
    metadata: Optional[Dict[str, Any]] = None,
    phase_definitions: Optional[Dict[int, str]] = None,
) -> tuple:
    """
    Load existing state or create new one.

    Returns:
        Tuple of (PipelineStateManager, is_resume: bool)
    """
    manager = PipelineStateManager(item_id, state_dir, phase_definitions)

    if manager.load_state():
        return manager, True

    if metadata is not None:
        manager.create_state(metadata)
        return manager, False

    raise ValueError("metadata required when creating new state")


# =============================================================================
# Test
# =============================================================================

if __name__ == "__main__":
    import tempfile

    print("=== Testing Pipeline State Manager ===\n")

    with tempfile.TemporaryDirectory() as tmpdir:
        manager = PipelineStateManager(
            "test-item",
            Path(tmpdir),
            phase_definitions={0: "research", 1: "analyze", 2: "generate"},
        )

        state = manager.create_state({"title": "Test Item", "author": "Test Author"})
        print(f"Created state for: {state.item_id}")
        print(f"Status: {state.status}")

        manager.start_phase(0)
        manager.complete_phase(0, "Phase 0 output", tokens_in=1000, tokens_out=500, cost_usd=0.01)

        print(f"\nResume phase: {manager.get_resume_phase()}")
        print(f"Next pending: {manager.get_next_pending_phase()}")
        print(f"\nSummary: {json.dumps(manager.get_summary(), indent=2)}")

    print("\n=== Test Complete ===")
