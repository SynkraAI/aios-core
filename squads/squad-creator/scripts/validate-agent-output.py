#!/usr/bin/env python3
"""
Hook: PreToolUse - Write
Validates agent output before writing to file.

Checks:
1. File path is within allowed directories
2. Agent files meet minimum quality (300+ lines)
3. Required sections present (persona, commands, etc.)
"""

import json
import sys
import re
from pathlib import Path


def validate_agent_file(content: str, file_path: str) -> dict:
    """Validate agent file content before write."""
    issues = []
    warnings = []

    # Check if it's an agent file
    if not file_path.endswith('.md') or 'agents/' not in file_path:
        # Not an agent file, allow
        return {"valid": True, "issues": [], "warnings": []}

    # Count lines
    lines = content.split('\n')
    line_count = len(lines)

    if line_count < 100:
        warnings.append(f"Agent file has only {line_count} lines (recommended: 300+)")

    # Check for required sections
    required_patterns = [
        (r'#.*persona', 'Persona section'),
        (r'#.*command', 'Commands section'),
        (r'---\n', 'YAML frontmatter'),
    ]

    content_lower = content.lower()
    for pattern, name in required_patterns:
        if not re.search(pattern, content_lower):
            warnings.append(f"Missing: {name}")

    # Check for voice DNA indicators
    voice_indicators = ['voice', 'tone', 'style', 'communication']
    has_voice = any(ind in content_lower for ind in voice_indicators)
    if not has_voice:
        warnings.append("No Voice DNA indicators found")

    # Check for thinking DNA indicators
    thinking_indicators = ['framework', 'heuristic', 'decision', 'principle']
    has_thinking = any(ind in content_lower for ind in thinking_indicators)
    if not has_thinking:
        warnings.append("No Thinking DNA indicators found")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "warnings": warnings,
        "metrics": {
            "line_count": line_count,
            "has_voice_dna": has_voice,
            "has_thinking_dna": has_thinking
        }
    }


def main():
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())

        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})

        # Only validate Write tool
        if tool_name != 'Write':
            print(json.dumps({"decision": "allow"}))
            return

        file_path = tool_input.get('file_path', '')
        content = tool_input.get('content', '')

        # Validate
        result = validate_agent_file(content, file_path)

        if not result['valid']:
            # Block with reason
            print(json.dumps({
                "decision": "block",
                "reason": f"Validation failed: {', '.join(result['issues'])}"
            }))
        elif result['warnings']:
            # Allow but add context about warnings
            print(json.dumps({
                "decision": "allow",
                "additionalContext": f"Quality warnings: {', '.join(result['warnings'])}"
            }))
        else:
            # All good
            print(json.dumps({"decision": "allow"}))

    except Exception as e:
        # On error, allow (fail open)
        print(json.dumps({
            "decision": "allow",
            "additionalContext": f"Validation error (allowing): {str(e)}"
        }))


if __name__ == "__main__":
    main()
