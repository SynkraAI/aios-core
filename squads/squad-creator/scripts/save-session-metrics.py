#!/usr/bin/env python3
"""
Hook: Stop
Triggered when the session ends.

Actions:
1. Calculate session metrics
2. Update .state.json with final metrics
3. Log session summary to MEMORY.md
"""

import json
import sys
from datetime import datetime
from pathlib import Path


STATE_FILE = Path("squads/squad-creator/.state.json")
MEMORY_FILE = Path(".claude/agent-memory/squad/MEMORY.md")


def load_state() -> dict:
    """Load current workflow state."""
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {}


def save_state(state: dict):
    """Save workflow state."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2))


def update_memory_stats(state: dict):
    """Update Quick Stats in MEMORY.md."""
    if not MEMORY_FILE.exists():
        return

    content = MEMORY_FILE.read_text()

    # Calculate stats
    metrics = state.get('metrics', {})
    agents_created = metrics.get('agents_created', 0)
    quality_scores = metrics.get('quality_scores', [])
    avg_score = sum(quality_scores) / len(quality_scores) if quality_scores else 0

    # Update Quick Stats section
    # This is a simple implementation - could be more sophisticated
    lines = content.split('\n')
    new_lines = []
    in_stats = False

    for line in lines:
        if line.startswith('## Quick Stats'):
            in_stats = True
            new_lines.append(line)
            continue

        if in_stats and line.startswith('## '):
            in_stats = False

        if in_stats and line.startswith('- '):
            # Update stat lines
            if 'Total squads criados:' in line:
                # Keep existing, this should be incremented elsewhere
                pass
            elif 'Quality score médio:' in line and avg_score > 0:
                line = f"- Quality score médio: {avg_score:.1f}/10"

        new_lines.append(line)

    MEMORY_FILE.write_text('\n'.join(new_lines))


def append_workflow_log(state: dict):
    """Append workflow execution to memory."""
    if not MEMORY_FILE.exists():
        return

    workflow = state.get('workflow', 'unknown')
    if not workflow:
        return

    started = state.get('started_at', '')
    status = 'complete' if all(
        s == 'complete' for s in state.get('phase_status', {}).values()
    ) else 'incomplete'

    content = MEMORY_FILE.read_text()

    # Find "Workflows Executados" section
    if "## Workflows Executados" in content:
        timestamp = datetime.now().strftime('%Y-%m-%d')
        entry = f"- [{timestamp}] {workflow}: {status}"

        parts = content.split("## Workflows Executados")
        if len(parts) == 2:
            new_content = parts[0] + "## Workflows Executados\n" + entry + "\n" + parts[1].lstrip()
            MEMORY_FILE.write_text(new_content)


def main():
    try:
        # Read input from stdin (may be empty for Stop hook)
        try:
            input_data = json.loads(sys.stdin.read())
        except:
            input_data = {}

        # Load state
        state = load_state()

        # Update final timestamp
        state['last_updated'] = datetime.now().isoformat()

        # Save state
        save_state(state)

        # Update memory
        update_memory_stats(state)
        append_workflow_log(state)

        # Allow session to end
        print(json.dumps({"decision": "allow"}))

    except Exception as e:
        # On error, allow (fail open)
        print(json.dumps({
            "decision": "allow",
            "additionalContext": f"Metrics save error: {str(e)}"
        }))


if __name__ == "__main__":
    main()
