"""Shared test fixtures."""

from __future__ import annotations

import pytest


@pytest.fixture
def tmp_output(tmp_path):
    """Create a temporary output directory."""
    output = tmp_path / "downloads"
    output.mkdir()
    return output
