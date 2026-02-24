#!/usr/bin/env python3
"""
Shared fixtures for squad-creator script tests
"""

import os
import pytest
from pathlib import Path


@pytest.fixture
def sample_squad(tmp_path):
    """Create a sample squad structure for testing"""
    squad_dir = tmp_path / "sample-squad"
    squad_dir.mkdir()

    # Config file
    (squad_dir / "config.yaml").write_text("""
name: sample-squad
version: 1.0.0
description: A sample squad for testing
author: Test Author
""")

    # README
    (squad_dir / "README.md").write_text("""
# Sample Squad

This is a sample squad for testing.

## Installation

Run the install command.

## Usage

Use the squad.
""")

    # Agents directory
    agents_dir = squad_dir / "agents"
    agents_dir.mkdir()

    agent_content = '''# Sample Agent

```yaml
agent:
  name: Sample Agent
  id: sample-agent
  title: Sample Agent Title
  icon: 🧪
  tier: 1
  whenToUse: |
    Use when testing

persona:
  role: Test Agent
  style: Direct, clear
  identity: A test agent
  focus: Testing

core_principles:
  - TEST FIRST: Always test before deploy
  - QUALITY: Maintain high quality

commands:
  - "*help - Show help"
  - "*test - Run tests"
  - "*exit - Exit agent"

voice_dna:
  vocabulary:
    always_use:
      - test
      - validate
      - check
      - verify
      - confirm
    never_use:
      - maybe
      - perhaps
      - might

output_examples:
  - input: "Run test"
    output: "Running tests..."
  - input: "Check status"
    output: "Status: OK"
  - input: "Validate config"
    output: "Config is valid"

objection_algorithms:
  - objection: "Tests take too long"
    response: "Tests save time in the long run"
  - objection: "We don't need tests"
    response: "Tests are essential for quality"
  - objection: "Tests are hard to write"
    response: "Tests become easier with practice"

anti_patterns:
  never_do:
    - Skip tests
    - Ignore failures
    - Deploy without testing
    - Hardcode values
    - Ignore edge cases
  always_do:
    - Run full test suite
    - Check coverage
    - Review results

completion_criteria:
  - All tests pass
  - Coverage above 80%
  - No critical issues

handoff_to:
  - agent: "@qa"
    when: "Need deeper testing"
  - agent: "@dev"
    when: "Need code changes"
```
'''
    # Add enough content to reach 300+ lines
    agent_content += "\n" * 200
    (agents_dir / "sample-agent.md").write_text(agent_content)

    # Tasks directory
    tasks_dir = squad_dir / "tasks"
    tasks_dir.mkdir()

    task_content = """# Sample Task

## Purpose
Run sample tests.

## Steps

1. **Initialize**
   - Set up environment
   - Load configuration

2. **Execute**
   - Run main logic
   - Capture results

3. **Validate**
   - Check results
   - Report status

## Completion Criteria
- All steps completed
- No errors

## Notes
Additional information here.
"""
    # Add content to reach 100+ lines
    task_content += "\n".join([f"# Line {i}" for i in range(100)])
    (tasks_dir / "sample-task.md").write_text(task_content)

    # Templates directory
    templates_dir = squad_dir / "templates"
    templates_dir.mkdir()
    (templates_dir / ".gitkeep").write_text("")

    # Checklists directory
    checklists_dir = squad_dir / "checklists"
    checklists_dir.mkdir()
    (checklists_dir / ".gitkeep").write_text("")

    # Data directory
    data_dir = squad_dir / "data"
    data_dir.mkdir()
    (data_dir / ".gitkeep").write_text("")

    return squad_dir


@pytest.fixture
def sample_agent_file(tmp_path):
    """Create a sample agent file for testing"""
    agent_content = '''# Test Agent

```yaml
agent:
  name: Test Agent
  id: test-agent
  title: Test Agent Title
  icon: 🧪
  tier: 1
  whenToUse: Use for testing

persona:
  role: Tester
  style: Direct
  identity: Test identity
  focus: Testing

core_principles:
  - TEST: Test everything

commands:
  - "*help"
  - "*exit"

voice_dna:
  vocabulary:
    always_use:
      - test
      - check
      - validate
      - verify
      - confirm
    never_use:
      - skip
      - ignore
      - maybe

output_examples:
  - input: test1
    output: result1
  - input: test2
    output: result2
  - input: test3
    output: result3

objection_algorithms:
  - objection: o1
    response: r1
  - objection: o2
    response: r2
  - objection: o3
    response: r3

anti_patterns:
  never_do:
    - skip tests
    - ignore errors
    - hardcode
    - no logging
    - no validation
  always_do:
    - run tests
    - log results
    - validate input

completion_criteria:
  - tests pass
  - coverage ok

handoff_to:
  - agent: qa
    when: need help
```
'''
    # Add content to reach 300+ lines
    agent_content += "\n" * 250

    agent_file = tmp_path / "test-agent.md"
    agent_file.write_text(agent_content)
    return agent_file


@pytest.fixture
def sample_task_file(tmp_path):
    """Create a sample task file for testing"""
    task_content = """# Sample Task

## Purpose
This is a sample task for testing.

## Prerequisites
- Item 1
- Item 2

## Steps

### Step 1: Initialize
Set up the environment.

### Step 2: Execute
Run the main logic.

### Step 3: Validate
Check the results.

## Completion Criteria
- All steps done
- No errors
"""
    # Add content to reach 100+ lines
    task_content += "\n".join([f"Line {i}" for i in range(100)])

    task_file = tmp_path / "sample-task.md"
    task_file.write_text(task_content)
    return task_file


@pytest.fixture
def scripts_dir():
    """Return the scripts directory path"""
    return Path(__file__).parent.parent


@pytest.fixture
def squads_dir():
    """Return the squads directory path"""
    return Path(__file__).parent.parent.parent.parent
