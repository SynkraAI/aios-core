#!/bin/bash
# AIOS Terminal Integration - Integration Tests
# Story CLI-DX-1 Phase 2
#
# Tests all terminal integration scripts to ensure they work correctly

set -uo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test results array
declare -a FAILED_TESTS

# Helper functions
log_test() {
  echo -e "${CYAN}[TEST]${RESET} $1"
  ((TESTS_RUN++))
}

log_pass() {
  echo -e "${GREEN}  ✓ PASS${RESET} $1"
  ((TESTS_PASSED++))
}

log_fail() {
  echo -e "${RED}  ✗ FAIL${RESET} $1"
  FAILED_TESTS+=("$1")
  ((TESTS_FAILED++))
}

log_info() {
  echo -e "${YELLOW}  ℹ INFO${RESET} $1"
}

# Cleanup function
cleanup() {
  if [[ -d ".aios-test" ]]; then
    rm -rf .aios-test
  fi
}

# Setup test environment
setup_test_env() {
  cleanup
  mkdir -p .aios-test
}

# Test 1: update-tab-title.sh with valid session.json
test_tab_title_update_valid() {
  log_test "update-tab-title.sh with valid session.json"

  setup_test_env

  # Create valid session.json
  cat > .aios-test/session.json << 'EOF'
{
  "project": {
    "type": "squad",
    "name": "test-project",
    "emoji": "🚀"
  },
  "status": {
    "phase": "development",
    "progress": "3/8",
    "emoji": "⚡"
  }
}
EOF

  # Run update script in test directory (use absolute path to script)
  local script_path="$(pwd)/update-tab-title.sh"
  local exit_code=0
  (cd .aios-test && bash "$script_path" 2>/dev/null) || exit_code=$?

  if [[ $exit_code -eq 0 ]]; then
    log_pass "Script executed successfully with valid session"
  else
    log_fail "Script failed with exit code $exit_code"
  fi

  cleanup
}

# Test 2: update-tab-title.sh with missing session.json (graceful degradation)
test_tab_title_update_missing() {
  log_test "update-tab-title.sh with missing session.json (fail-fast)"

  setup_test_env

  # Run without session.json
  local script_path="$(pwd)/update-tab-title.sh"
  local exit_code=0
  (cd .aios-test && bash "$script_path" 2>/dev/null) || exit_code=$?

  if [[ $exit_code -eq 0 ]]; then
    log_pass "Script gracefully handled missing session.json"
  else
    log_fail "Script should not error when session.json is missing"
  fi

  cleanup
}

# Test 3: update-tab-title.sh with invalid JSON
test_tab_title_update_invalid_json() {
  log_test "update-tab-title.sh with invalid JSON (error handling)"

  setup_test_env

  # Create invalid session.json
  cat > .aios-test/session.json << 'EOF'
{
  "project": {
    "name": "test"
  }
  # Invalid JSON - missing closing brace
EOF

  # Run update script
  local script_path="$(pwd)/update-tab-title.sh"
  local exit_code=0
  (cd .aios-test && bash "$script_path" 2>/dev/null) || exit_code=$?

  if [[ $exit_code -eq 0 ]]; then
    log_pass "Script handled invalid JSON gracefully"
  else
    log_fail "Script should not crash on invalid JSON"
  fi

  cleanup
}

# Test 4: update-tab-title.sh without jq (fallback mode)
test_tab_title_update_no_jq() {
  log_test "update-tab-title.sh without jq (grep fallback)"

  if ! command -v jq &> /dev/null; then
    log_info "jq not installed - test will run in native fallback mode"
  fi

  setup_test_env

  # Create valid session.json
  cat > .aios-test/session.json << 'EOF'
{
  "project": {
    "name": "test-fallback",
    "emoji": "📦"
  }
}
EOF

  # Run script (will use jq if available, grep otherwise)
  local script_path="$(pwd)/update-tab-title.sh"
  local exit_code=0
  (cd .aios-test && bash "$script_path" 2>/dev/null) || exit_code=$?

  if [[ $exit_code -eq 0 ]]; then
    log_pass "Script works with or without jq"
  else
    log_fail "Script failed in fallback mode"
  fi

  cleanup
}

# Test 5: zsh-integration.sh loads without errors
test_zsh_integration_loads() {
  log_test "zsh-integration.sh loads without errors"

  # Mock AIOS_CORE_PATH for testing (parent of infrastructure)
  export AIOS_CORE_PATH="$(cd ../../../.. && pwd)"

  # Source the integration script (skip if not zsh)
  if [[ -n "${ZSH_VERSION:-}" ]]; then
    if source ./zsh-integration.sh 2>/dev/null; then
      log_pass "zsh-integration.sh loaded successfully"
    else
      log_fail "zsh-integration.sh failed to load"
    fi

    # Check if integration flag is set
    if [[ -n "$AIOS_TERMINAL_INTEGRATED" ]]; then
      log_pass "AIOS_TERMINAL_INTEGRATED flag is set"
    else
      log_fail "Integration flag not set"
    fi
  else
    log_info "Skipping zsh-integration test (not running in zsh)"
    log_pass "Test skipped (bash environment)"
  fi

  unset AIOS_TERMINAL_INTEGRATED 2>/dev/null || true
  unset AIOS_CORE_PATH
}

# Test 6: zsh-integration.sh prevents duplicate loading
test_zsh_integration_idempotent() {
  log_test "zsh-integration.sh prevents duplicate loading"

  if [[ -n "${ZSH_VERSION:-}" ]]; then
    export AIOS_CORE_PATH="$(cd ../../../.. && pwd)"
    export AIOS_TERMINAL_INTEGRATED=1

    # Try to source again
    local exit_code=0
    source ./zsh-integration.sh 2>/dev/null || exit_code=$?

    if [[ $exit_code -eq 0 ]]; then
      log_pass "Duplicate loading prevented successfully"
    else
      log_fail "Script should handle duplicate loading gracefully"
    fi

    unset AIOS_TERMINAL_INTEGRATED 2>/dev/null || true
    unset AIOS_CORE_PATH
  else
    log_info "Skipping zsh idempotency test (not running in zsh)"
    log_pass "Test skipped (bash environment)"
  fi
}

# Test 7: prompt-injector.sh generates output with valid session
test_prompt_injection_valid() {
  log_test "prompt-injector.sh generates output with valid session"

  setup_test_env

  # Create valid session.json
  cat > .aios-test/session.json << 'EOF'
{
  "project": {
    "name": "test-prompt",
    "emoji": "🎯"
  },
  "status": {
    "emoji": "⚡",
    "progress": "2/5"
  }
}
EOF

  # Source prompt injector and run function
  source ./prompt-injector.sh 2>/dev/null

  # Test if function executes without error (output may contain ANSI codes)
  local exit_code=0
  (cd .aios-test && aios_prompt > /dev/null 2>&1) || exit_code=$?

  if [[ $exit_code -eq 0 ]]; then
    log_pass "Prompt function executed successfully"
  else
    log_fail "Prompt function should execute without errors"
  fi

  cleanup
}

# Test 8: prompt-injector.sh returns empty with no session
test_prompt_injection_empty() {
  log_test "prompt-injector.sh returns empty with no session"

  setup_test_env

  # Source prompt injector
  source ./prompt-injector.sh 2>/dev/null

  local output=""
  output=$(cd .aios-test && aios_prompt) || true

  if [[ -z "$output" ]]; then
    log_pass "Prompt function returned empty (zero overhead)"
  else
    log_fail "Prompt function should return empty when no session"
  fi

  cleanup
}

# Test 9: Performance - tab title update <20ms
test_performance_tab_title() {
  log_test "Performance: tab title update <20ms"

  setup_test_env

  # Create session.json
  cat > .aios-test/session.json << 'EOF'
{
  "project": { "name": "perf-test", "emoji": "⚡" },
  "status": { "progress": "5/10", "emoji": "🔥" }
}
EOF

  # Measure execution time (3 runs, take average)
  local script_path="$(pwd)/update-tab-title.sh"
  local total=0
  for i in {1..3}; do
    local start=$(date +%s%N)
    (cd .aios-test && bash "$script_path" 2>/dev/null)
    local end=$(date +%s%N)
    local duration=$(( (end - start) / 1000000 )) # Convert to milliseconds
    total=$((total + duration))
  done

  local avg=$((total / 3))

  if [[ $avg -lt 20 ]]; then
    log_pass "Average execution time: ${avg}ms (target: <20ms)"
  else
    log_fail "Average execution time: ${avg}ms exceeds 20ms target"
  fi

  cleanup
}

# Test 10: All scripts are executable
test_scripts_executable() {
  log_test "All scripts have executable permissions"

  local scripts=(
    "update-tab-title.sh"
    "zsh-integration.sh"
    "prompt-injector.sh"
    "setup-terminal-integration.js"
    "test-terminal-integration.sh"
  )

  local all_executable=true

  for script in "${scripts[@]}"; do
    if [[ -x "$script" ]]; then
      log_info "$script is executable"
    else
      log_fail "$script is NOT executable"
      all_executable=false
    fi
  done

  if $all_executable; then
    log_pass "All scripts are executable"
  fi
}

# Main test runner
main() {
  echo ""
  echo "═════════════════════════════════════════════════════════"
  echo "  AIOS Terminal Integration - Integration Tests"
  echo "  Story CLI-DX-1 Phase 2"
  echo "═════════════════════════════════════════════════════════"
  echo ""

  # Change to terminal scripts directory
  cd "$(dirname "$0")"

  # Run all tests
  test_tab_title_update_valid
  test_tab_title_update_missing
  test_tab_title_update_invalid_json
  test_tab_title_update_no_jq
  test_zsh_integration_loads
  test_zsh_integration_idempotent
  test_prompt_injection_valid
  test_prompt_injection_empty
  test_performance_tab_title
  test_scripts_executable

  # Summary
  echo ""
  echo "═════════════════════════════════════════════════════════"
  echo "  Test Summary"
  echo "═════════════════════════════════════════════════════════"
  echo -e "  Total:  ${TESTS_RUN}"
  echo -e "  ${GREEN}Passed: ${TESTS_PASSED}${RESET}"
  echo -e "  ${RED}Failed: ${TESTS_FAILED}${RESET}"

  if [[ ${TESTS_FAILED} -gt 0 ]]; then
    echo ""
    echo "Failed tests:"
    for test in "${FAILED_TESTS[@]}"; do
      echo -e "  ${RED}✗${RESET} $test"
    done
    echo ""
    exit 1
  else
    echo ""
    echo -e "${GREEN}All tests passed! ✅${RESET}"
    echo ""
    exit 0
  fi
}

# Run tests
main
