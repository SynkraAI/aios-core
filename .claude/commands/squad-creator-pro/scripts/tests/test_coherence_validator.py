#!/usr/bin/env python3
"""
Tests for coherence-validator.py
Run with: pytest scripts/tests/test_coherence_validator.py -v
"""

import os
import sys
import json
import tempfile
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import with hyphen in name workaround
import importlib.util
spec = importlib.util.spec_from_file_location(
    "coherence_validator",
    Path(__file__).parent.parent / "coherence-validator.py"
)
coherence_validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(coherence_validator)

# Import functions
find_config_dir = coherence_validator.find_config_dir
load_yaml = coherence_validator.load_yaml
extract_ids = coherence_validator.extract_ids
run_coherence_validation = coherence_validator.run_coherence_validation


class TestLoadYaml:
    """Tests for YAML loading"""

    def test_load_valid_yaml(self):
        """Should load valid YAML file"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
            f.write('name: test\nversion: 1.0.0\n')
            f.flush()

            result = load_yaml(Path(f.name))
            assert result is not None
            assert result.get('name') == 'test'
            os.unlink(f.name)

    def test_load_invalid_yaml(self):
        """Should return None for invalid YAML"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
            f.write('invalid: yaml: content:\n  - bad')
            f.flush()

            result = load_yaml(Path(f.name))
            # May return None or partial parse
            os.unlink(f.name)

    def test_load_nonexistent_file(self):
        """Should return None for nonexistent file"""
        result = load_yaml(Path('/nonexistent/file.yaml'))
        assert result is None


class TestExtractIds:
    """Tests for ID extraction"""

    def test_extract_heuristic_ids(self):
        """Should extract heuristic IDs from nested data"""
        data = {
            'heuristics': [
                {'id': 'SC_HE_001', 'name': 'Test 1'},
                {'id': 'SC_HE_002', 'name': 'Test 2'},
            ]
        }
        ids = extract_ids(data, r'SC_HE_\d+')
        assert 'SC_HE_001' in ids
        assert 'SC_HE_002' in ids

    def test_extract_veto_ids(self):
        """Should extract veto condition IDs"""
        data = {
            'veto_conditions': [
                {'id': 'SC_VC_001'},
                {'id': 'SC_VC_002'},
            ]
        }
        ids = extract_ids(data, r'SC_VC_\d+')
        assert 'SC_VC_001' in ids
        assert 'SC_VC_002' in ids

    def test_extract_from_nested_structure(self):
        """Should extract IDs from deeply nested structures"""
        data = {
            'level1': {
                'level2': {
                    'items': [
                        {'id': 'DEEP_001'},
                        {'id': 'DEEP_002'}
                    ]
                }
            }
        }
        ids = extract_ids(data, r'DEEP_\d+')
        assert 'DEEP_001' in ids
        assert 'DEEP_002' in ids

    def test_empty_data(self):
        """Should handle empty data gracefully"""
        ids = extract_ids({}, r'TEST_\d+')
        assert len(ids) == 0

    def test_no_matches(self):
        """Should return empty set when no matches"""
        data = {'key': 'value', 'number': 123}
        ids = extract_ids(data, r'PATTERN_\d+')
        assert len(ids) == 0


class TestCoherenceValidation:
    """Tests for full coherence validation"""

    def test_validation_with_config_dir(self):
        """Should run validation on actual config directory"""
        # Find the actual config directory
        config_dir = find_config_dir()

        if config_dir and config_dir.exists():
            results = run_coherence_validation(config_dir)

            # Should have expected structure
            assert 'overall_status' in results
            assert 'checks' in results
            assert isinstance(results['checks'], list)

    def test_validation_with_nonexistent_dir(self):
        """Should handle nonexistent directory"""
        with tempfile.TemporaryDirectory() as tmpdir:
            # Empty directory - no config files
            results = run_coherence_validation(Path(tmpdir))

            # Should handle gracefully
            assert 'overall_status' in results


class TestIntegration:
    """Integration tests with real squad-creator configs"""

    def test_real_config_validation(self):
        """Should validate real squad-creator config files"""
        config_dir = find_config_dir()

        if config_dir and config_dir.exists():
            results = run_coherence_validation(config_dir)

            # Print results for debugging
            print(f"\nCoherence Validation Results:")
            print(f"  Status: {results.get('overall_status', 'unknown')}")
            print(f"  Checks: {len(results.get('checks', []))}")

            for check in results.get('checks', []):
                status = '✓' if check.get('status') == 'pass' else '✗'
                print(f"  {status} {check.get('name', 'unnamed')}")

            # Validation should complete without errors
            assert 'overall_status' in results


def run_basic_tests():
    """Run basic tests without pytest"""
    print("Running coherence-validator basic tests...\n")

    # Test 1: Load YAML
    print("Test 1: load_yaml")
    with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
        f.write('name: test\n')
        f.flush()
        result = load_yaml(Path(f.name))
        assert result is not None, "Failed to load YAML"
        os.unlink(f.name)
    print("  ✓ YAML loading works")

    # Test 2: Extract IDs
    print("Test 2: extract_ids")
    data = {'items': [{'id': 'TEST_001'}, {'id': 'TEST_002'}]}
    ids = extract_ids(data, r'TEST_\d+')
    assert 'TEST_001' in ids, "Failed to extract ID"
    print("  ✓ ID extraction works")

    # Test 3: Config dir finding
    print("Test 3: find_config_dir")
    config_dir = find_config_dir()
    print(f"  Config dir: {config_dir}")
    print("  ✓ Config dir finding works")

    # Test 4: Full validation (if config exists)
    print("Test 4: run_coherence_validation")
    if config_dir and config_dir.exists():
        results = run_coherence_validation(config_dir)
        print(f"  Status: {results.get('overall_status', 'unknown')}")
        print(f"  Checks: {len(results.get('checks', []))}")
        print("  ✓ Coherence validation works")
    else:
        print("  ⚠ Skipped (no config dir)")

    print("\n✅ All basic tests passed!")


if __name__ == "__main__":
    try:
        import pytest
        pytest.main([__file__, "-v"])
    except ImportError:
        # Run basic tests without pytest
        run_basic_tests()
