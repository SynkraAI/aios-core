#!/bin/bash
# ============================================
# AIOX PM Orchestration Script (pm.sh)
# Story 11.2: Bob Terminal Spawning
#
# Spawns agents in separate terminals with clean context
# to avoid context pollution when Bob (PM) orchestrates multiple agents.
#
# Usage: pm.sh <agent> <task> [params] [--context <path>] [--output <path>]
#
# Arguments:
#   agent       - Agent ID (e.g., dev, architect, qa, pm)
#   task        - Task to execute (e.g., develop, review, create-story)
#   params      - Additional parameters for the agent (optional)
#   --context   - Path to context file (JSON with story, files, instructions)
#   --output    - Custom output file path (default: /tmp/aiox-output-{timestamp}.md)
#
# Environment Variables:
#   AIOX_OUTPUT_DIR   - Directory for output files (default: /tmp)
#   AIOX_DEBUG        - Enable debug logging (default: false)
#   AIOX_TIMEOUT      - Timeout in seconds (default: 300)
#   CLAUDE_CMD        - Claude CLI command (default: claude)
#   AIOX_MODEL_BUDGET_CEILING_USD - Required positive budget ceiling
#
# Exit Codes:
#   0 - Success
#   1 - Invalid arguments
#   2 - Unsupported OS
#   3 - No terminal found
#   4 - Spawn failed
#
# Author: @dev (Dex) for Story 11.2
# ============================================

set -euo pipefail

# Version
readonly VERSION="1.0.0"
readonly SCRIPT_NAME="$(basename "$0")"

# Configuration
OUTPUT_DIR="${AIOX_OUTPUT_DIR:-/tmp}"
DEBUG="${AIOX_DEBUG:-false}"
TIMEOUT="${AIOX_TIMEOUT:-300}"
CLAUDE_CMD="${CLAUDE_CMD:-claude}"
INLINE_MODE="${AIOX_INLINE_MODE:-false}"

# Arguments
AGENT=""
TASK=""
PARAMS=""
CONTEXT_FILE=""
CUSTOM_OUTPUT=""

# Generated paths
OUTPUT_FILE=""
LOCK_FILE=""

# ============================================
# Logging Functions
# ============================================

log_debug() {
  [[ "$DEBUG" == "true" ]] && echo "[DEBUG] $*" >&2 || true
}

log_info() {
  echo "[INFO] $*" >&2
}

log_error() {
  echo "[ERROR] $*" >&2
}

# ============================================
# Help and Version
# ============================================

show_help() {
  cat << EOF
AIOX Multi-Modal Orchestration Script v${VERSION}

Usage: ${SCRIPT_NAME} <agent> <task> [params] [options]

Arguments:
  agent       Agent ID (dev, architect, qa, pm, po, sm, analyst, devops, etc.)
  task        Task to execute (develop, review, create-story, etc.)
  params      Additional parameters (optional, quoted string)

Options:
  --context <path>   Path to JSON context file
  --output <path>    Custom output file path
  --help, -h         Show this help message
  --version, -v      Show version

Environment Variables:
  AIOX_OUTPUT_DIR    Output directory (default: /tmp)
  AIOX_DEBUG         Enable debug mode (default: false)
  AIOX_TIMEOUT       Timeout in seconds (default: 300)
  AIOX_INLINE_MODE   Run without a visual terminal (default: false)
  CLAUDE_CMD         Claude CLI command (default: claude)
  AIOX_MODEL_BUDGET_CEILING_USD
                     Required positive ceiling for automated model dispatch

Examples:
  ${SCRIPT_NAME} dev develop "story-11.2"
  ${SCRIPT_NAME} architect review --context /tmp/ctx.json
  ${SCRIPT_NAME} qa test --output /tmp/qa-result.md

Exit Codes:
  0 - Success (output file path printed to stdout)
  1 - Invalid arguments
  2 - Unsupported OS
  3 - No terminal found
  4 - Spawn failed
  5 - Dispatch governance rejected the request
EOF
}

show_version() {
  echo "${SCRIPT_NAME} version ${VERSION}"
}

# ============================================
# Argument Parsing
# ============================================

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --help|-h)
        show_help
        exit 0
        ;;
      --version|-v)
        show_version
        exit 0
        ;;
      --context)
        shift
        CONTEXT_FILE="${1:-}"
        if [[ -z "$CONTEXT_FILE" ]]; then
          log_error "Missing value for --context"
          exit 1
        fi
        ;;
      --output)
        shift
        CUSTOM_OUTPUT="${1:-}"
        if [[ -z "$CUSTOM_OUTPUT" ]]; then
          log_error "Missing value for --output"
          exit 1
        fi
        ;;
      -*)
        log_error "Unknown option: $1"
        show_help
        exit 1
        ;;
      *)
        # Positional arguments
        if [[ -z "$AGENT" ]]; then
          AGENT="$1"
        elif [[ -z "$TASK" ]]; then
          TASK="$1"
        else
          # Remaining args are params
          PARAMS="${PARAMS:+$PARAMS }$1"
        fi
        ;;
    esac
    shift
  done

  # Validate required args
  if [[ -z "$AGENT" || -z "$TASK" ]]; then
    log_error "Missing required arguments: agent and task"
    echo ""
    show_help
    exit 1
  fi

  # Validate context file if provided
  if [[ -n "$CONTEXT_FILE" && ! -f "$CONTEXT_FILE" ]]; then
    log_error "Context file not found: $CONTEXT_FILE"
    exit 1
  fi
}

# ============================================
# OS Detection (Task 1.1)
# ============================================

detect_os() {
  case "$(uname -s)" in
    Darwin*)
      echo "macos"
      ;;
    Linux*)
      # Check if running in WSL
      if grep -qi microsoft /proc/version 2>/dev/null; then
        echo "wsl"
      else
        echo "linux"
      fi
      ;;
    CYGWIN*|MINGW*|MSYS*)
      echo "windows"
      ;;
    *)
      echo "unknown"
      ;;
  esac
}

# ============================================
# File Path Setup
# ============================================

setup_paths() {
  local timestamp
  timestamp="$(date +%s)"

  if [[ -n "$CUSTOM_OUTPUT" ]]; then
    OUTPUT_FILE="$CUSTOM_OUTPUT"
  else
    OUTPUT_FILE="${OUTPUT_DIR}/aiox-output-${timestamp}.md"
  fi

  LOCK_FILE="${OUTPUT_DIR}/aiox-lock-${timestamp}.lock"

  log_debug "Output file: $OUTPUT_FILE"
  log_debug "Lock file: $LOCK_FILE"
}

# ============================================
# Terminal Spawning - macOS (Task 1.2)
# ============================================

spawn_macos() {
  local cmd="$1"

  log_debug "Spawning on macOS..."

  # Check for iTerm2 first (better AppleScript support)
  if [[ -d "/Applications/iTerm.app" ]]; then
    log_debug "Using iTerm2"
    osascript - "$cmd" <<'EOF'
on run argv
set commandText to item 1 of argv
tell application "iTerm"
  activate
  set newWindow to (create window with default profile)
  tell current session of newWindow
    write text commandText
  end tell
end tell
end run
EOF
  else
    # Fallback to Terminal.app
    log_debug "Using Terminal.app"
    osascript - "$cmd" <<'EOF'
on run argv
set commandText to item 1 of argv
tell application "Terminal"
  activate
  do script commandText
end tell
end run
EOF
  fi
}

# ============================================
# Terminal Spawning - Linux (Task 1.3)
# ============================================

spawn_linux() {
  local cmd="$1"

  log_debug "Spawning on Linux..."

  # Try terminals in order of preference
  if command -v gnome-terminal &> /dev/null; then
    log_debug "Using gnome-terminal"
    gnome-terminal -- bash -c "$cmd; exec bash" &
  elif command -v konsole &> /dev/null; then
    log_debug "Using konsole"
    konsole --hold -e bash -c "$cmd" &
  elif command -v xfce4-terminal &> /dev/null; then
    log_debug "Using xfce4-terminal"
    xfce4-terminal --hold -e "bash -c '$cmd'" &
  elif command -v xterm &> /dev/null; then
    log_debug "Using xterm"
    xterm -hold -e "$cmd" &
  elif command -v alacritty &> /dev/null; then
    log_debug "Using alacritty"
    alacritty -e bash -c "$cmd; exec bash" &
  elif command -v kitty &> /dev/null; then
    log_debug "Using kitty"
    kitty bash -c "$cmd; exec bash" &
  else
    log_error "No supported terminal found"
    log_error "Please install one of: gnome-terminal, konsole, xfce4-terminal, xterm, alacritty, kitty"
    return 3
  fi
}

# ============================================
# Terminal Spawning - Windows/WSL (Task 1.4)
# ============================================

spawn_windows() {
  local cmd="$1"

  log_debug "Spawning on Windows/WSL..."

  # When running in WSL, spawn using Windows Terminal or cmd
  if command -v wt.exe &> /dev/null; then
    log_debug "Using Windows Terminal"
    wt.exe new-tab wsl.exe bash -c "$cmd" &
  elif command -v cmd.exe &> /dev/null; then
    log_debug "Using cmd.exe with wsl"
    cmd.exe /c start wsl.exe bash -c "$cmd" &
  else
    log_error "No Windows terminal method available"
    log_error "Please install Windows Terminal or ensure cmd.exe is accessible"
    return 3
  fi
}

spawn_wsl() {
  # When already in WSL, spawn a new terminal window
  spawn_windows "$1"
}

# ============================================
# Inline Execution (Story 12.10 - No visual terminal)
# ============================================

# Build the prompt payload for a real agent run (Claude CLI when available).
build_agent_prompt() {
  local prompt=""
  prompt+="You are the AIOX agent @${AGENT}. Execute task *${TASK}"
  [[ -n "$PARAMS" ]] && prompt+=" ${PARAMS}"
  prompt+=". Follow .aiox-core/constitution.md and agent authority rules. "
  prompt+="Load persona from .aiox-core/development/agents/ when present. "
  if [[ -n "$CONTEXT_FILE" && -f "$CONTEXT_FILE" ]]; then
    prompt+="Context file: ${CONTEXT_FILE}. "
    # shellcheck disable=SC2002
    prompt+="Context JSON: $(cat "$CONTEXT_FILE" 2>/dev/null | head -c 8000). "
  fi
  prompt+="Write a structured result (summary, files touched, next steps)."
  printf '%s' "$prompt"
}

# Enforce Constitution XII before the first automated model call.
run_dispatch_guard() {
  local script_dir guard_script
  script_dir="$(cd "$(dirname "$0")" && pwd)"
  guard_script="${script_dir}/../infrastructure/scripts/pre-dispatch-guard.js"
  if [[ ! -f "$guard_script" ]]; then
    log_error "Dispatch governance guard not found: $guard_script"
    return 5
  fi

  AIOX_DISPATCH_AGENT="$AGENT" \
    AIOX_DISPATCH_TASK="$TASK" \
    AIOX_DISPATCH_PARAMS="$PARAMS" \
    AIOX_DISPATCH_CONTEXT="$CONTEXT_FILE" \
    AIOX_PROJECT_ROOT="${AIOX_PROJECT_ROOT:-$(pwd)}" \
    node "$guard_script" >&2
}

# Resolve CLI: CLAUDE_CMD, then claude, then empty.
resolve_agent_cli() {
  if [[ -n "${CLAUDE_CMD}" ]] && command -v "${CLAUDE_CMD}" &>/dev/null; then
    echo "${CLAUDE_CMD}"
    return 0
  fi
  if command -v claude &>/dev/null; then
    echo "claude"
    return 0
  fi
  echo ""
  return 1
}

# Run agent via CLI; write transcript to OUTPUT_FILE.
run_agent_cli() {
  local mode_label="${1:-session}"
  local cli
  cli="$(resolve_agent_cli || true)"

  {
    echo "=== AIOX Agent Session (${mode_label}) ==="
    echo "Agent: ${AGENT}"
    echo "Task: ${TASK}"
    [[ -n "$PARAMS" ]] && echo "Params: ${PARAMS}"
    [[ -n "$CONTEXT_FILE" ]] && echo "Context: ${CONTEXT_FILE}"
    echo ""
    echo "Executing: @${AGENT} *${TASK} ${PARAMS}"
    echo ""
  } > "${OUTPUT_FILE}"

  if [[ -z "$cli" ]]; then
    {
      echo "ERROR: No agent CLI found (set CLAUDE_CMD or install \`claude\`)."
      echo "Stub mode is disabled — refusing to fake agent execution."
      echo "=== Session Failed ==="
    } >> "${OUTPUT_FILE}"
    log_error "No agent CLI available (CLAUDE_CMD/claude)"
    return 4
  fi

  local prompt
  if ! run_dispatch_guard; then
    {
      echo "ERROR: Automated dispatch governance rejected the request."
      echo "=== Session Failed ==="
    } >> "${OUTPUT_FILE}"
    return 5
  fi
  prompt="$(build_agent_prompt)"
  log_info "Invoking agent CLI: ${cli}"

  # Prefer print/non-interactive flags when present; fall back to piping prompt.
  set +e
  if "${cli}" --help 2>&1 | grep -qE -- '--print|print mode'; then
    printf '%s\n' "$prompt" | "${cli}" --print >> "${OUTPUT_FILE}" 2>&1
  else
    printf '%s\n' "$prompt" | "${cli}" >> "${OUTPUT_FILE}" 2>&1
  fi
  local rc=$?
  set -e

  if [[ $rc -ne 0 ]]; then
    {
      echo ""
      echo "Agent CLI exited with code ${rc}"
      echo "=== Session Failed ==="
    } >> "${OUTPUT_FILE}"
    return 4
  fi

  {
    echo ""
    echo "=== Session Complete ==="
  } >> "${OUTPUT_FILE}"
  return 0
}

spawn_inline() {
  log_info "Running in inline mode (no visual terminal)"

  local inline_result=0
  run_agent_cli "Inline" || inline_result=$?
  if [[ $inline_result -ne 0 ]]; then
    rm -f "${LOCK_FILE}"
    return "$inline_result"
  fi

  rm -f "${LOCK_FILE}"
  log_info "Inline execution complete"
  log_debug "Output written to: $OUTPUT_FILE"
  return 0
}

# ============================================
# Main Spawn Logic (Task 1.6 - Lock File)
# ============================================

spawn_terminal() {
  local os
  os="$(detect_os)"

  log_info "Detected OS: $os"

  # Create lock file to indicate process is running
  touch "$LOCK_FILE"
  log_debug "Created lock file: $LOCK_FILE"

  # Check for inline mode (Story 12.10 - fallback for non-visual environments)
  if [[ "$INLINE_MODE" == "true" ]]; then
    local inline_result=0
    spawn_inline || inline_result=$?
    if [[ $inline_result -ne 0 ]]; then
      echo "$OUTPUT_FILE"
      return "$inline_result"
    fi
    echo "$OUTPUT_FILE"
    return 0
  fi

  # Real agent run in a new terminal (no echo-stub).
  # Re-invoke this script in inline mode so run_agent_cli owns the protocol.
  local script_self quoted
  script_self="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
  local full_cmd=""
  printf -v quoted '%q' "$OUTPUT_DIR"
  full_cmd+="AIOX_INLINE_MODE=true AIOX_OUTPUT_DIR=${quoted} "
  printf -v quoted '%q' "$DEBUG"
  full_cmd+="AIOX_DEBUG=${quoted} "
  printf -v quoted '%q' "$CLAUDE_CMD"
  full_cmd+="CLAUDE_CMD=${quoted} "
  printf -v quoted '%q' "${AIOX_MODEL_BUDGET_CEILING_USD:-}"
  full_cmd+="AIOX_MODEL_BUDGET_CEILING_USD=${quoted} "
  printf -v quoted '%q' "$script_self"
  full_cmd+="bash ${quoted}"
  for value in "$AGENT" "$TASK"; do
    printf -v quoted '%q' "$value"
    full_cmd+=" ${quoted}"
  done
  if [[ -n "$PARAMS" ]]; then
    printf -v quoted '%q' "$PARAMS"
    full_cmd+=" ${quoted}"
  fi
  if [[ -n "$CONTEXT_FILE" ]]; then
    printf -v quoted '%q' "$CONTEXT_FILE"
    full_cmd+=" --context ${quoted}"
  fi
  printf -v quoted '%q' "$OUTPUT_FILE"
  full_cmd+=" --output ${quoted}; rc=\$?; "
  printf -v quoted '%q' "$LOCK_FILE"
  full_cmd+="rm -f ${quoted}; exit \$rc"

  # Spawn based on OS
  case "$os" in
    macos)
      spawn_macos "$full_cmd"
      ;;
    linux)
      spawn_linux "$full_cmd"
      ;;
    windows|wsl)
      spawn_windows "$full_cmd"
      ;;
    *)
      log_error "Unsupported operating system: $os"
      rm -f "$LOCK_FILE"
      return 2
      ;;
  esac

  local spawn_result=$?
  if [[ $spawn_result -ne 0 ]]; then
    log_error "Failed to spawn terminal (exit code: $spawn_result)"
    rm -f "$LOCK_FILE"
    return 4
  fi

  log_info "Terminal spawned successfully"
  log_debug "Output will be written to: $OUTPUT_FILE"
  log_debug "Lock file: $LOCK_FILE (will be removed when complete)"

  # Return the output file path for polling
  echo "$OUTPUT_FILE"
}

# ============================================
# Main Entry Point
# ============================================

main() {
  parse_args "$@"
  setup_paths

  log_info "AIOX Multi-Modal Orchestration Script v${VERSION}"
  log_info "Agent: $AGENT"
  log_info "Task: $TASK"
  [[ -n "$PARAMS" ]] && log_info "Params: $PARAMS"
  [[ -n "$CONTEXT_FILE" ]] && log_info "Context: $CONTEXT_FILE"

  spawn_terminal
}

main "$@"
