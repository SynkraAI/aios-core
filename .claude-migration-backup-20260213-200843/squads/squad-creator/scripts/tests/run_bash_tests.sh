#!/bin/bash
# Run all bash script tests
# Usage: bash squads/squad-creator/scripts/tests/run_bash_tests.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOTAL_PASS=0
TOTAL_FAIL=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         BASH SCRIPT TESTS — Squad Creator                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

for test_file in "$SCRIPT_DIR"/test_*.sh; do
    [[ "$(basename "$test_file")" == "$(basename "$0")" ]] && continue
    echo "Running: $(basename "$test_file")"
    if bash "$test_file"; then
        TOTAL_PASS=$((TOTAL_PASS + 1))
    else
        TOTAL_FAIL=$((TOTAL_FAIL + 1))
    fi
    echo ""
done

echo "════════════════════════════════════════════════════════════════"
echo "SUITES: $TOTAL_PASS passed | $TOTAL_FAIL failed"
echo "════════════════════════════════════════════════════════════════"

[[ $TOTAL_FAIL -eq 0 ]] && exit 0 || exit 1
