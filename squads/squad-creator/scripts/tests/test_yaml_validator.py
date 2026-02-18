#!/usr/bin/env python3
"""
Tests for yaml_validator.py
Run with: pytest scripts/tests/ -v
"""

import os
import sys
import pytest
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from yaml_validator import (
    extract_yaml_block,
    get_nested_keys,
    get_nested_value,
    count_items,
    validate_agent_yaml,
    validate_file,
    validate_squad,
    AGENT_REQUIRED_KEYS
)


class TestExtractYamlBlock:
    """Tests for extract_yaml_block function"""

    def test_extract_yaml_block_found(self):
        """Test extracting YAML block from markdown"""
        content = '''# Agent

Some text here.

```yaml
agent:
  name: Test
  id: test
```

More text.
'''
        yaml_content, line_num = extract_yaml_block(content)

        assert yaml_content is not None
        assert "agent:" in yaml_content
        assert "name: Test" in yaml_content
        assert line_num == 5  # Line where ```yaml starts

    def test_extract_yaml_block_not_found(self):
        """Test when no YAML block exists"""
        content = "# Just markdown\n\nNo YAML here.\n"

        yaml_content, line_num = extract_yaml_block(content)

        assert yaml_content is None
        assert line_num is None

    def test_extract_yaml_block_multiple(self):
        """Test with multiple YAML blocks (returns first)"""
        content = '''
```yaml
first: block
```

```yaml
second: block
```
'''
        yaml_content, _ = extract_yaml_block(content)

        assert "first: block" in yaml_content


class TestGetNestedKeys:
    """Tests for get_nested_keys function"""

    def test_get_nested_keys_simple(self):
        """Test getting keys from simple dict"""
        data = {"a": 1, "b": 2}
        keys = get_nested_keys(data)

        assert "a" in keys
        assert "b" in keys

    def test_get_nested_keys_nested(self):
        """Test getting keys from nested dict"""
        data = {
            "agent": {
                "name": "Test",
                "id": "test"
            },
            "persona": {
                "role": "Tester"
            }
        }
        keys = get_nested_keys(data)

        assert "agent" in keys
        assert "agent.name" in keys
        assert "agent.id" in keys
        assert "persona" in keys
        assert "persona.role" in keys

    def test_get_nested_keys_empty(self):
        """Test with empty dict"""
        keys = get_nested_keys({})
        assert keys == []

    def test_get_nested_keys_non_dict(self):
        """Test with non-dict input"""
        keys = get_nested_keys("not a dict")
        assert keys == []


class TestGetNestedValue:
    """Tests for get_nested_value function"""

    def test_get_nested_value_simple(self):
        """Test getting simple nested value"""
        data = {"agent": {"name": "Test"}}
        value = get_nested_value(data, "agent.name")

        assert value == "Test"

    def test_get_nested_value_deep(self):
        """Test getting deeply nested value"""
        data = {
            "voice_dna": {
                "vocabulary": {
                    "always_use": ["term1", "term2"]
                }
            }
        }
        value = get_nested_value(data, "voice_dna.vocabulary.always_use")

        assert value == ["term1", "term2"]

    def test_get_nested_value_not_found(self):
        """Test getting nonexistent key"""
        data = {"agent": {"name": "Test"}}
        value = get_nested_value(data, "agent.missing")

        assert value is None

    def test_get_nested_value_invalid_path(self):
        """Test with invalid path through non-dict"""
        data = {"agent": "not a dict"}
        value = get_nested_value(data, "agent.name")

        assert value is None


class TestCountItems:
    """Tests for count_items function"""

    def test_count_items_list(self):
        """Test counting list items"""
        data = {"items": ["a", "b", "c"]}
        count = count_items(data, "items")

        assert count == 3

    def test_count_items_dict(self):
        """Test counting dict keys"""
        data = {"items": {"a": 1, "b": 2}}
        count = count_items(data, "items")

        assert count == 2

    def test_count_items_nested(self):
        """Test counting nested items"""
        data = {
            "voice_dna": {
                "vocabulary": {
                    "always_use": ["t1", "t2", "t3", "t4", "t5"]
                }
            }
        }
        count = count_items(data, "voice_dna.vocabulary.always_use")

        assert count == 5

    def test_count_items_missing(self):
        """Test counting missing key"""
        data = {"agent": "test"}
        count = count_items(data, "missing.key")

        assert count == 0


class TestValidateAgentYaml:
    """Tests for validate_agent_yaml function"""

    def test_validate_agent_yaml_complete(self):
        """Test validating complete agent YAML"""
        yaml_data = {
            "agent": {
                "name": "Test Agent",
                "id": "test-agent",
                "title": "Test",
                "icon": "🧪",
                "whenToUse": "Testing"
            },
            "persona": {
                "role": "Tester",
                "style": "Direct",
                "identity": "Test identity",
                "focus": "Testing"
            },
            "commands": ["*help", "*exit", "*test"],
            "voice_dna": {
                "vocabulary": {
                    "always_use": ["a", "b", "c", "d", "e"],
                    "never_use": ["x", "y", "z"]
                }
            },
            "output_examples": [
                {"input": "t1", "output": "r1"},
                {"input": "t2", "output": "r2"},
                {"input": "t3", "output": "r3"}
            ],
            "objection_algorithms": [
                {"objection": "o1", "response": "r1"},
                {"objection": "o2", "response": "r2"},
                {"objection": "o3", "response": "r3"}
            ],
            "anti_patterns": {
                "never_do": ["n1", "n2", "n3", "n4", "n5"],
                "always_do": ["a1", "a2", "a3"]
            },
            "completion_criteria": ["c1", "c2"],
            "handoff_to": ["h1", "h2"]
        }

        result = validate_agent_yaml(yaml_data, "test.md")

        assert result.passed == True
        assert result.file_type == "agent"
        assert len(result.missing_blocking_keys) == 0

    def test_validate_agent_yaml_missing_required(self):
        """Test validating agent with missing required keys"""
        yaml_data = {
            "persona": {"role": "Test"}
            # Missing 'agent' key
        }

        result = validate_agent_yaml(yaml_data, "incomplete.md")

        assert result.passed == False
        assert "agent" in result.missing_blocking_keys

    def test_validate_agent_yaml_counts(self):
        """Test that counts are captured correctly"""
        yaml_data = {
            "agent": {"name": "T", "id": "t"},
            "persona": {},
            "commands": ["*help", "*exit"],
            "voice_dna": {
                "vocabulary": {
                    "always_use": ["1", "2", "3", "4", "5", "6", "7", "8"],
                    "never_use": ["a", "b", "c"]
                }
            },
            "output_examples": [1, 2, 3, 4],
            "objection_algorithms": [1, 2, 3]
        }

        result = validate_agent_yaml(yaml_data, "test.md")

        assert result.counts["vocabulary_always_use"] == 8
        assert result.counts["vocabulary_never_use"] == 3
        assert result.counts["output_examples"] == 4
        assert result.counts["objection_algorithms"] == 3


class TestValidateFile:
    """Tests for validate_file function"""

    def test_validate_file_agent(self, tmp_path):
        """Test validating agent file"""
        agent_content = '''# Test Agent

```yaml
agent:
  name: Test
  id: test

persona:
  role: Tester

commands:
  - "*help"
  - "*exit"
```
'''
        agent_file = tmp_path / "test-agent.md"
        agent_file.write_text(agent_content)

        result = validate_file(agent_file, "agent")

        assert result.valid_syntax == True
        assert result.file_type == "agent"
        assert result.total_lines > 0

    def test_validate_file_no_yaml(self, tmp_path):
        """Test file with no YAML block"""
        content = "# Just markdown\n\nNo YAML here.\n"

        test_file = tmp_path / "no-yaml.md"
        test_file.write_text(content)

        result = validate_file(test_file, "agent")

        assert result.valid_syntax == False
        assert "No YAML block found" in result.parse_error

    def test_validate_file_invalid_yaml(self, tmp_path):
        """Test file with invalid YAML syntax"""
        content = '''# Bad YAML

```yaml
agent:
  name: Test
  - invalid: syntax here
    not: valid
```
'''
        test_file = tmp_path / "bad-yaml.md"
        test_file.write_text(content)

        result = validate_file(test_file, "agent")

        assert result.valid_syntax == False

    def test_validate_file_nonexistent(self, tmp_path):
        """Test validating nonexistent file"""
        result = validate_file(tmp_path / "missing.md", "agent")

        assert result.valid_syntax == False
        assert result.passed == False


class TestValidateSquad:
    """Tests for validate_squad function"""

    def test_validate_squad_complete(self, tmp_path):
        """Test validating complete squad"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()

        agent_content = '''# Agent

```yaml
agent:
  name: Test
  id: test

persona:
  role: Tester

commands:
  - "*help"
```
'''
        (agents_dir / "test.md").write_text(agent_content)

        tasks_dir = squad_dir / "tasks"
        tasks_dir.mkdir()
        (tasks_dir / "task.md").write_text("# Task\n" * 50)

        results = validate_squad(squad_dir)

        assert "agents" in results
        assert "tasks" in results
        assert "summary" in results
        assert results["summary"]["total_files"] > 0

    def test_validate_squad_empty(self, tmp_path):
        """Test validating empty squad"""
        squad_dir = tmp_path / "empty-squad"
        squad_dir.mkdir()

        results = validate_squad(squad_dir)

        assert results["summary"]["total_files"] == 0


class TestRequiredKeys:
    """Tests for required keys constants"""

    def test_agent_blocking_keys(self):
        """Test that blocking keys are defined"""
        assert "blocking" in AGENT_REQUIRED_KEYS
        assert "agent" in AGENT_REQUIRED_KEYS["blocking"]
        assert "agent.name" in AGENT_REQUIRED_KEYS["blocking"]
        assert "agent.id" in AGENT_REQUIRED_KEYS["blocking"]

    def test_agent_warning_keys(self):
        """Test that warning keys are defined"""
        assert "warning" in AGENT_REQUIRED_KEYS
        assert "voice_dna" in AGENT_REQUIRED_KEYS["warning"]
        assert "output_examples" in AGENT_REQUIRED_KEYS["warning"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
