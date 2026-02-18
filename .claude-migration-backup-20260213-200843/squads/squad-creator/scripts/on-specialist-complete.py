#!/usr/bin/env python3
"""
Hook: SubagentStop
Triggered when a specialist subagent completes.

Actions:
1. Check for <promise>COMPLETE</promise> signal
2. Extract learnings from output
3. Update .state.json with results
4. Append to orchestrator's MEMORY.md
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


def append_to_memory(entry: str):
    """Append entry to orchestrator's memory."""
    if MEMORY_FILE.exists():
        content = MEMORY_FILE.read_text()

        # Find "Notas Recentes" section and append
        if "## Notas Recentes" in content:
            parts = content.split("## Notas Recentes")
            new_content = parts[0] + "## Notas Recentes\n" + entry + "\n" + parts[1].lstrip()
            MEMORY_FILE.write_text(new_content)


def main():
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())

        agent_name = input_data.get('agent_name', 'unknown')
        output = input_data.get('output', '')

        # Check for completion signal
        completed = '<promise>COMPLETE</promise>' in output

        # Load current state
        state = load_state()

        # Update state with subagent result
        if 'subagent_results' not in state:
            state['subagent_results'] = {}

        if agent_name not in state['subagent_results']:
            state['subagent_results'][agent_name] = {}

        timestamp = datetime.now().isoformat()
        state['subagent_results'][agent_name][timestamp] = {
            "completed": completed,
            "output_length": len(output)
        }
        state['last_updated'] = timestamp

        # Save state
        save_state(state)

        # Append to memory
        status = "✅" if completed else "❌"
        append_to_memory(f"- [{timestamp[:10]}] {agent_name}: {status} (output: {len(output)} chars)")

        # Always allow (logging only)
        print(json.dumps({
            "decision": "allow",
            "additionalContext": f"Subagent {agent_name} {'completed' if completed else 'did not complete'}"
        }))

    except Exception as e:
        # On error, allow (fail open)
        print(json.dumps({
            "decision": "allow",
            "additionalContext": f"Hook error (allowing): {str(e)}"
        }))


if __name__ == "__main__":
    main()
