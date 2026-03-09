#!/usr/bin/env python3
"""
Tests for naming_validator.py
Run with: pytest scripts/tests/test_naming_validator.py -v
"""

import os
import sys
import pytest
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from naming_validator import (
    is_kebab_case,
    is_snake_case,
    is_camel_case,
    is_pascal_case,
    validate_file_names,
    validate_directory_name,
    validate_config_naming,
    validate_agent_ids,
    scan_squad,
)


class TestIsKebabCase:
    """Tests for is_kebab_case function"""

    def test_valid_kebab_case(self):
        """Valid kebab-case strings"""
        assert is_kebab_case("simple") == True
        assert is_kebab_case("two-words") == True
        assert is_kebab_case("three-word-name") == True
        assert is_kebab_case("with-numbers-123") == True
        assert is_kebab_case("test-agent.md") == True  # Extension ignored

    def test_invalid_kebab_case(self):
        """Invalid kebab-case strings"""
        assert is_kebab_case("camelCase") == False
        assert is_kebab_case("PascalCase") == False
        assert is_kebab_case("snake_case") == False
        assert is_kebab_case("UPPERCASE") == False
        assert is_kebab_case("Mixed-Case") == False
        assert is_kebab_case("with spaces") == False


class TestIsSnakeCase:
    """Tests for is_snake_case function"""

    def test_valid_snake_case(self):
        """Valid snake_case strings"""
        assert is_snake_case("simple") == True
        assert is_snake_case("two_words") == True
        assert is_snake_case("three_word_name") == True
        assert is_snake_case("with_numbers_123") == True

    def test_invalid_snake_case(self):
        """Invalid snake_case strings"""
        assert is_snake_case("kebab-case") == False
        assert is_snake_case("camelCase") == False
        assert is_snake_case("PascalCase") == False
        assert is_snake_case("UPPERCASE") == False


class TestIsCamelCase:
    """Tests for is_camel_case function"""

    def test_valid_camel_case(self):
        """Valid camelCase strings"""
        assert is_camel_case("simple") == True
        assert is_camel_case("twoWords") == True
        assert is_camel_case("threeWordName") == True
        assert is_camel_case("withNumbers123") == True

    def test_invalid_camel_case(self):
        """Invalid camelCase strings"""
        assert is_camel_case("PascalCase") == False
        assert is_camel_case("kebab-case") == False
        assert is_camel_case("snake_case") == False
        assert is_camel_case("123startsWithNumber") == False


class TestIsPascalCase:
    """Tests for is_pascal_case function"""

    def test_valid_pascal_case(self):
        """Valid PascalCase strings"""
        assert is_pascal_case("Simple") == True
        assert is_pascal_case("TwoWords") == True
        assert is_pascal_case("ThreeWordName") == True

    def test_invalid_pascal_case(self):
        """Invalid PascalCase strings"""
        assert is_pascal_case("camelCase") == False
        assert is_pascal_case("kebab-case") == False
        assert is_pascal_case("snake_case") == False
        assert is_pascal_case("lowercase") == False


class TestValidateFileNames:
    """Tests for validate_file_names function"""

    def test_valid_file_names(self, tmp_path):
        """Valid file names produce no issues"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "valid-agent.md").write_text("# Agent")
        (agents_dir / "another-valid.md").write_text("# Agent")

        issues = validate_file_names(str(squad_dir))

        assert len(issues) == 0

    def test_invalid_file_names(self, tmp_path):
        """Invalid file names produce issues"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "InvalidAgent.md").write_text("# Agent")
        (agents_dir / "snake_case_agent.md").write_text("# Agent")

        issues = validate_file_names(str(squad_dir))

        assert len(issues) == 2
        assert all(i["code"] == "NAM-FILE-001" for i in issues)

    def test_skip_special_files(self, tmp_path):
        """Special files are skipped"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "README.md").write_text("# README")
        (agents_dir / "__init__.py").write_text("")

        issues = validate_file_names(str(squad_dir))

        assert len(issues) == 0


class TestValidateDirectoryName:
    """Tests for validate_directory_name function"""

    def test_valid_directory_name(self, tmp_path):
        """Valid directory name produces no issues"""
        squad_dir = tmp_path / "valid-squad"
        squad_dir.mkdir()

        issues = validate_directory_name(str(squad_dir))

        assert len(issues) == 0

    def test_invalid_directory_name(self, tmp_path):
        """Invalid directory name produces issue"""
        squad_dir = tmp_path / "Invalid_Squad"
        squad_dir.mkdir()

        issues = validate_directory_name(str(squad_dir))

        assert len(issues) == 1
        assert issues[0]["code"] == "NAM-DIR-001"
        assert issues[0]["severity"] == "error"


class TestValidateConfigNaming:
    """Tests for validate_config_naming function"""

    def test_valid_config_naming(self, tmp_path):
        """Valid config naming produces no issues"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        (squad_dir / "config.yaml").write_text("""
name: test-squad
version: 1.0.0
slashPrefix: testSquad
""")

        issues = validate_config_naming(str(squad_dir))

        assert len(issues) == 0

    def test_mismatched_name(self, tmp_path):
        """Mismatched config name produces error"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        (squad_dir / "config.yaml").write_text("""
name: different-name
version: 1.0.0
""")

        issues = validate_config_naming(str(squad_dir))

        name_issues = [i for i in issues if i["code"] == "NAM-CONFIG-002"]
        assert len(name_issues) == 1
        assert name_issues[0]["severity"] == "error"

    def test_invalid_slash_prefix(self, tmp_path):
        """Invalid slashPrefix produces warning"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        (squad_dir / "config.yaml").write_text("""
name: test-squad
version: 1.0.0
slashPrefix: kebab-case-prefix
""")

        issues = validate_config_naming(str(squad_dir))

        prefix_issues = [i for i in issues if i["code"] == "NAM-CONFIG-001"]
        assert len(prefix_issues) == 1
        assert prefix_issues[0]["severity"] == "warning"

    def test_no_config(self, tmp_path):
        """No config produces no issues"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        issues = validate_config_naming(str(squad_dir))

        assert len(issues) == 0


class TestValidateAgentIds:
    """Tests for validate_agent_ids function"""

    def test_valid_agent_ids(self, tmp_path):
        """Valid agent IDs produce no issues"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()

        (agents_dir / "test-agent.md").write_text("""---
id: test-agent
name: Test Agent
---

# Test Agent
""")

        issues = validate_agent_ids(str(squad_dir))

        assert len(issues) == 0

    def test_invalid_agent_ids(self, tmp_path):
        """Invalid agent IDs produce warnings"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()

        (agents_dir / "test-agent.md").write_text("""---
id: InvalidAgent
name: Test Agent
---

# Test Agent
""")

        issues = validate_agent_ids(str(squad_dir))

        # Should have warning about invalid ID
        id_issues = [i for i in issues if i["code"] == "NAM-AGENT-001"]
        assert len(id_issues) == 1

    def test_no_agents_dir(self, tmp_path):
        """No agents directory produces no issues"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        issues = validate_agent_ids(str(squad_dir))

        assert len(issues) == 0


class TestScanSquad:
    """Tests for scan_squad function"""

    def test_scan_squad_nonexistent(self, tmp_path):
        """Nonexistent squad returns error"""
        result = scan_squad(str(tmp_path / "nonexistent"))

        assert result["exists"] == False
        assert "error" in result

    def test_scan_squad_valid(self, tmp_path):
        """Valid squad passes"""
        squad_dir = tmp_path / "valid-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "valid-agent.md").write_text("# Agent")

        (squad_dir / "config.yaml").write_text("""
name: valid-squad
version: 1.0.0
slashPrefix: validSquad
""")

        result = scan_squad(str(squad_dir))

        assert result["exists"] == True
        assert result["status"] == "PASS"
        assert result["errors"] == 0

    def test_scan_squad_with_errors(self, tmp_path):
        """Squad with naming errors fails"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        (squad_dir / "config.yaml").write_text("""
name: wrong-name
version: 1.0.0
""")

        result = scan_squad(str(squad_dir))

        assert result["exists"] == True
        assert result["status"] == "FAIL"
        assert result["errors"] > 0

    def test_scan_squad_includes_conventions(self, tmp_path):
        """Result includes conventions documentation"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        result = scan_squad(str(squad_dir))

        assert "conventions" in result
        assert "files" in result["conventions"]
        assert "directories" in result["conventions"]
        assert "yaml_keys" in result["conventions"]
        assert "slashPrefix" in result["conventions"]
        assert "agent_ids" in result["conventions"]

    def test_scan_squad_categorizes_issues(self, tmp_path):
        """Issues are categorized by severity"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        # Create issues of different severities
        (squad_dir / "config.yaml").write_text("""
name: wrong-name
slashPrefix: invalid-prefix
""")

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "Invalid_Name.md").write_text("# Agent")

        result = scan_squad(str(squad_dir))

        assert "errors" in result
        assert "warnings" in result
        assert result["total_issues"] == result["errors"] + result["warnings"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
