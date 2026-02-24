#!/usr/bin/env python3
"""
Tests for checklist_validator.py
Run with: pytest scripts/tests/test_checklist_validator.py -v
"""

import os
import sys
import pytest
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from checklist_validator import (
    VALID_CHECK_TYPES,
    CHECK_REQUIRED_FIELDS,
    CheckItem,
    ChecklistValidation,
    extract_yaml_blocks,
    parse_yaml_safely,
    extract_checks_from_yaml,
    extract_checklist_metadata,
    validate_check_item,
    validate_checklist_file,
    validate_checklist_directory,
)


class TestExtractYamlBlocks:
    """Tests for extract_yaml_blocks function"""

    def test_extract_single_block(self):
        """Single YAML block is extracted"""
        content = """
# Checklist

```yaml
check:
  id: test-1
  check: "Test check"
  type: blocking
```

More text.
"""
        blocks = extract_yaml_blocks(content)

        assert len(blocks) == 1
        assert "id: test-1" in blocks[0][0]

    def test_extract_multiple_blocks(self):
        """Multiple YAML blocks are extracted"""
        content = """
```yaml
first: block
```

```yaml
second: block
```
"""
        blocks = extract_yaml_blocks(content)

        assert len(blocks) == 2
        assert "first: block" in blocks[0][0]
        assert "second: block" in blocks[1][0]

    def test_no_yaml_blocks(self):
        """No YAML blocks returns empty list"""
        content = "# Just markdown\n\nNo YAML here."

        blocks = extract_yaml_blocks(content)

        assert len(blocks) == 0


class TestParseYamlSafely:
    """Tests for parse_yaml_safely function"""

    def test_parse_valid_yaml(self):
        """Valid YAML is parsed"""
        content = "name: test\nversion: 1.0.0"

        result = parse_yaml_safely(content)

        assert result is not None
        assert result["name"] == "test"

    def test_parse_invalid_yaml(self):
        """Invalid YAML returns None"""
        content = "invalid: yaml: :"

        result = parse_yaml_safely(content)

        # Should handle error gracefully
        assert result is None or isinstance(result, dict)


class TestExtractChecksFromYaml:
    """Tests for extract_checks_from_yaml function"""

    def test_extract_checks_array(self):
        """Checks in array are extracted"""
        yaml_data = {
            "checks": [
                {"id": "test-1", "check": "Check 1", "type": "blocking"},
                {"id": "test-2", "check": "Check 2", "type": "recommended"},
            ]
        }

        checks = extract_checks_from_yaml(yaml_data)

        assert len(checks) == 2
        assert checks[0].id == "test-1"
        assert checks[1].id == "test-2"

    def test_extract_checks_nested(self):
        """Checks in nested structure are extracted"""
        yaml_data = {
            "file_basics": [
                {"id": "min-lines", "check": "Min lines", "type": "blocking"},
            ],
            "other_checks": [
                {"id": "other-1", "check": "Other", "type": "warning"},
            ]
        }

        checks = extract_checks_from_yaml(yaml_data)

        assert len(checks) == 2

    def test_extract_checks_no_checks(self):
        """Empty YAML returns empty list"""
        yaml_data = {"metadata": {"version": "1.0"}}

        checks = extract_checks_from_yaml(yaml_data)

        assert len(checks) == 0


class TestExtractChecklistMetadata:
    """Tests for extract_checklist_metadata function"""

    def test_extract_metadata_from_checklist_key(self):
        """Metadata extracted from 'checklist' key"""
        yaml_data = {
            "checklist": {
                "id": "test-checklist",
                "version": "1.0.0",
                "purpose": "Test purpose"
            }
        }

        metadata = extract_checklist_metadata(yaml_data)

        assert metadata["id"] == "test-checklist"
        assert metadata["version"] == "1.0.0"
        assert metadata["purpose"] == "Test purpose"

    def test_extract_metadata_from_top_level(self):
        """Metadata extracted from top-level keys"""
        yaml_data = {
            "id": "test-checklist",
            "version": "2.0.0",
        }

        metadata = extract_checklist_metadata(yaml_data)

        assert metadata["id"] == "test-checklist"

    def test_extract_metadata_empty(self):
        """Empty data returns empty metadata"""
        yaml_data = {"checks": []}

        metadata = extract_checklist_metadata(yaml_data)

        assert metadata == {} or "id" not in metadata


class TestValidateCheckItem:
    """Tests for validate_check_item function"""

    def test_validate_valid_check(self):
        """Valid check has no issues"""
        check = CheckItem(
            id="test-1",
            check="Test check description",
            type="blocking",
            validation="test command"
        )

        issues, warnings = validate_check_item(check)

        assert len(issues) == 0

    def test_validate_missing_id(self):
        """Missing ID produces issue"""
        check = CheckItem(
            id="",
            check="Test check",
            type="blocking"
        )

        issues, warnings = validate_check_item(check)

        id_issues = [i for i in issues if "CKL-CHK-001" in i["code"]]
        assert len(id_issues) == 1

    def test_validate_missing_check_description(self):
        """Missing check description produces issue"""
        check = CheckItem(
            id="test-1",
            check="",
            type="blocking"
        )

        issues, warnings = validate_check_item(check)

        check_issues = [i for i in issues if "CKL-CHK-002" in i["code"]]
        assert len(check_issues) == 1

    def test_validate_invalid_type(self):
        """Non-standard type produces warning"""
        check = CheckItem(
            id="test-1",
            check="Test check",
            type="invalid-type"
        )

        issues, warnings = validate_check_item(check)

        type_warnings = [w for w in warnings if "CKL-CHK-003" in w["code"]]
        assert len(type_warnings) == 1

    def test_validate_blocking_without_validation(self):
        """Blocking check without validation produces warning"""
        check = CheckItem(
            id="test-1",
            check="Test check",
            type="blocking",
            validation=None
        )

        issues, warnings = validate_check_item(check)

        val_warnings = [w for w in warnings if "CKL-CHK-004" in w["code"]]
        assert len(val_warnings) == 1


class TestValidateChecklistFile:
    """Tests for validate_checklist_file function"""

    def test_validate_nonexistent_file(self, tmp_path):
        """Nonexistent file returns invalid"""
        result = validate_checklist_file(tmp_path / "nonexistent.md")

        assert result.valid == False
        assert len(result.issues) > 0

    def test_validate_valid_checklist(self, tmp_path):
        """Valid checklist passes"""
        checklist_content = """# Test Checklist

```yaml
checklist:
  id: test-checklist
  version: 1.0.0
  purpose: Test validation
```

## Checks

```yaml
file_checks:
  - id: check-1
    check: "Check 1 description"
    type: blocking
    validation: "test command"

  - id: check-2
    check: "Check 2 description"
    type: recommended
```
"""
        checklist_file = tmp_path / "test-checklist.md"
        checklist_file.write_text(checklist_content)

        result = validate_checklist_file(checklist_file)

        assert result.valid == True
        assert result.has_metadata == True
        assert result.check_count == 2
        assert result.checks_by_type.get("blocking") == 1
        assert result.checks_by_type.get("recommended") == 1

    def test_validate_checklist_no_yaml(self, tmp_path):
        """Checklist without YAML produces warning"""
        content = "# Checklist\n\nNo YAML here."
        checklist_file = tmp_path / "no-yaml.md"
        checklist_file.write_text(content)

        result = validate_checklist_file(checklist_file)

        # Should still be "valid" but with warnings
        yaml_warnings = [w for w in result.warnings if "YAML" in w["message"]]
        assert len(yaml_warnings) > 0

    def test_validate_duplicate_ids(self, tmp_path):
        """Duplicate IDs produce issues"""
        content = """# Checklist

```yaml
checks:
  - id: same-id
    check: "First"
    type: blocking
  - id: same-id
    check: "Second"
    type: blocking
```
"""
        checklist_file = tmp_path / "dupe.md"
        checklist_file.write_text(content)

        result = validate_checklist_file(checklist_file)

        dup_issues = [i for i in result.issues if "DUP" in i["code"]]
        assert len(dup_issues) == 1


class TestValidateChecklistDirectory:
    """Tests for validate_checklist_directory function"""

    def test_validate_empty_directory(self, tmp_path):
        """Empty directory returns zero files"""
        result = validate_checklist_directory(tmp_path)

        assert result["total_files"] == 0
        assert result["valid_files"] == 0

    def test_validate_directory_with_checklists(self, tmp_path):
        """Directory with checklists is validated"""
        # Create two checklists
        (tmp_path / "checklist-1.md").write_text("""# Checklist 1

```yaml
checks:
  - id: c1
    check: "Check 1"
    type: blocking
```
""")

        (tmp_path / "checklist-2.md").write_text("""# Checklist 2

```yaml
checks:
  - id: c2
    check: "Check 2"
    type: recommended
```
""")

        result = validate_checklist_directory(tmp_path)

        assert result["total_files"] == 2
        assert result["total_checks"] == 2
        assert result["checks_by_type"]["blocking"] == 1
        assert result["checks_by_type"]["recommended"] == 1

    def test_validate_directory_nonexistent(self, tmp_path):
        """Nonexistent directory returns error"""
        result = validate_checklist_directory(tmp_path / "nonexistent")

        assert "error" in result


class TestValidCheckTypes:
    """Tests for valid check types constant"""

    def test_blocking_is_valid(self):
        """'blocking' is a valid type"""
        assert "blocking" in VALID_CHECK_TYPES

    def test_recommended_is_valid(self):
        """'recommended' is a valid type"""
        assert "recommended" in VALID_CHECK_TYPES

    def test_warning_is_valid(self):
        """'warning' is a valid type"""
        assert "warning" in VALID_CHECK_TYPES


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
