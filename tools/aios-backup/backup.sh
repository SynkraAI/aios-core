#!/usr/bin/env bash
# ============================================================================
# aios-backup - Intelligent backup for AIOS ecosystem
# ============================================================================
# Automated GitHub backup for:
#   - aios-core (framework + local customizations)
#   - Projects in ~/Projects/
#   - Global Claude skills (~/.claude/skills/)
#
# Usage:
#   aios-backup              Interactive mode (select projects)
#   aios-backup --all        Backup everything without asking
#   aios-backup --dry-run    Show what would happen, don't execute
#   aios-backup --status     Show backup status of all projects
# ============================================================================
set -euo pipefail

# --- Configuration -----------------------------------------------------------
PROJECTS_DIR="${AIOS_PROJECTS_DIR:-$HOME/Projects}"
AIOS_CORE_DIR="${AIOS_CORE_DIR:-$HOME/aios-core}"
CLAUDE_SKILLS_DIR="$HOME/.claude/skills"
GITHUB_USER="${GITHUB_USER:-$(gh api user --jq '.login' 2>/dev/null || echo '')}"
SENSITIVE_PATTERNS=('.env' '.env.*' '!.env.example' '*token*.json' '*bearer*.json' '*cookie*.json' '*secret*' '*credential*' '*.key' '*api-data*.json')

# --- Colors ------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

# --- State -------------------------------------------------------------------
DRY_RUN=false
ALL_MODE=false
STATUS_ONLY=false
BACKED_UP=()
CREATED_REPOS=()
SKIPPED=()
ERRORS=()

# --- Helpers -----------------------------------------------------------------

print_banner() {
  echo ""
  echo -e "${CYAN}${BOLD}"
  echo "  ╔══════════════════════════════════════════════╗"
  echo "  ║           AIOS Backup Manager                ║"
  echo "  ║     Intelligent GitHub Backup System         ║"
  echo "  ╚══════════════════════════════════════════════╝"
  echo -e "${RESET}"
  echo -e "  ${DIM}GitHub: ${GITHUB_USER} | $(date '+%Y-%m-%d %H:%M')${RESET}"
  echo ""
}

log_info()    { echo -e "  ${BLUE}[INFO]${RESET}  $1"; }
log_success() { echo -e "  ${GREEN}[OK]${RESET}    $1"; }
log_warn()    { echo -e "  ${YELLOW}[WARN]${RESET}  $1"; }
log_error()   { echo -e "  ${RED}[FAIL]${RESET}  $1"; }
log_skip()    { echo -e "  ${DIM}[SKIP]${RESET}  $1"; }
log_action()  { echo -e "  ${MAGENTA}[>>]${RESET}    $1"; }
log_dry()     { echo -e "  ${YELLOW}[DRY]${RESET}   $1"; }

separator() {
  echo -e "  ${DIM}──────────────────────────────────────────────${RESET}"
}

# --- Prerequisites -----------------------------------------------------------

check_prereqs() {
  local missing=0

  if ! command -v git &>/dev/null; then
    log_error "git not found. Install with: brew install git"
    missing=1
  fi

  if ! command -v gh &>/dev/null; then
    log_error "GitHub CLI not found. Install with: brew install gh"
    missing=1
  fi

  if [ -z "$GITHUB_USER" ]; then
    log_error "Not logged into GitHub CLI. Run: gh auth login"
    missing=1
  fi

  if [ $missing -eq 1 ]; then
    echo ""
    log_error "Fix the issues above and try again."
    exit 1
  fi

  log_success "Prerequisites OK (git, gh, user: ${GITHUB_USER})"
}

# --- Sensitive file handling -------------------------------------------------

generate_gitignore_entries() {
  cat <<'GITIGNORE'
# === aios-backup: auto-generated sensitive file exclusions ===
# Tokens, credentials, secrets
.env
.env.*
!.env.example
*token*.json
*bearer*.json
*cookie*.json
*secret*
*credential*
*.key

# AIOS auto-generated status files
.aios/claude-status.json
.aios/devops-setup-report.yaml
.aios/environment-report.json
.aios/project-status.yaml

# API data / cache
*api-data*.json
# === end aios-backup ===
GITIGNORE
}

ensure_gitignore_safe() {
  local dir="$1"
  local gitignore="$dir/.gitignore"

  if [ ! -f "$gitignore" ]; then
    if $DRY_RUN; then
      log_dry "Would create .gitignore with sensitive file exclusions"
      return
    fi
    generate_gitignore_entries > "$gitignore"
    log_info "Created .gitignore with security rules"
    return
  fi

  # Check if our marker already exists
  if grep -q "aios-backup: auto-generated" "$gitignore" 2>/dev/null; then
    return
  fi

  if $DRY_RUN; then
    log_dry "Would append sensitive file exclusions to .gitignore"
    return
  fi

  echo "" >> "$gitignore"
  generate_gitignore_entries >> "$gitignore"
  log_info "Appended security rules to existing .gitignore"
}

# --- Project scanning --------------------------------------------------------

# Returns: name|has_git|has_remote|remote_url|has_aios|dirty_count|branch
scan_project() {
  local dir="$1"
  local name
  name=$(basename "$dir")

  # Skip non-directories and hidden files
  [ ! -d "$dir" ] && return

  local has_git="no"
  local has_remote="no"
  local remote_url=""
  local has_aios="no"
  local dirty_count=0
  local branch=""

  if [ -d "$dir/.git" ]; then
    has_git="yes"
    branch=$(git -C "$dir" branch --show-current 2>/dev/null || echo "unknown")
    remote_url=$(git -C "$dir" remote get-url origin 2>/dev/null || echo "")
    if [ -n "$remote_url" ]; then
      has_remote="yes"
    fi
    dirty_count=$(git -C "$dir" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  fi

  if [ -d "$dir/.aios" ] || [ -d "$dir/.aios-core" ]; then
    has_aios="yes"
  fi

  echo "${name}|${has_git}|${has_remote}|${remote_url}|${has_aios}|${dirty_count}|${branch}"
}

# --- Display -----------------------------------------------------------------

display_project_table() {
  local idx=1

  echo ""
  echo -e "  ${BOLD}${WHITE}#   Project                    Git    Remote   AIOS   Changes${RESET}"
  separator

  for entry in "${SCAN_RESULTS[@]}"; do
    IFS='|' read -r name has_git has_remote remote_url has_aios dirty_count branch <<< "$entry"

    # Format columns
    local git_icon remote_icon aios_icon changes_icon num_pad

    if [ "$has_git" = "yes" ]; then
      git_icon="${GREEN}yes${RESET}"
    else
      git_icon="${RED}no${RESET} "
    fi

    if [ "$has_remote" = "yes" ]; then
      remote_icon="${GREEN}yes${RESET}"
    else
      remote_icon="${YELLOW}no${RESET} "
    fi

    if [ "$has_aios" = "yes" ]; then
      aios_icon="${GREEN}yes${RESET}"
    else
      aios_icon="${DIM}no${RESET} "
    fi

    if [ "$dirty_count" -gt 0 ] 2>/dev/null; then
      changes_icon="${YELLOW}${dirty_count} files${RESET}"
    else
      changes_icon="${DIM}clean${RESET}"
    fi

    # Pad index
    if [ $idx -lt 10 ]; then num_pad=" "; else num_pad=""; fi

    printf "  ${CYAN}%s%d${RESET})  %-27s %-15b %-15b %-13b %b\n" \
      "$num_pad" "$idx" "$name" "$git_icon" "$remote_icon" "$aios_icon" "$changes_icon"

    idx=$((idx + 1))
  done

  echo ""
}

# --- Interactive selection ---------------------------------------------------

select_projects() {
  local count=${#SCAN_RESULTS[@]}

  echo -e "  ${BOLD}Select projects to backup:${RESET}"
  echo -e "  ${DIM}Enter numbers separated by spaces, 'a' for all, 'q' to skip${RESET}"
  echo -e "  ${DIM}Example: 1 3 5  or  a${RESET}"
  echo ""
  printf "  ${CYAN}>${RESET} "
  read -r input

  if [ "$input" = "q" ] || [ "$input" = "Q" ]; then
    return
  fi

  if [ "$input" = "a" ] || [ "$input" = "A" ]; then
    for i in $(seq 0 $((count - 1))); do
      SELECTED_INDICES+=("$i")
    done
    return
  fi

  for num in $input; do
    if [[ "$num" =~ ^[0-9]+$ ]] && [ "$num" -ge 1 ] && [ "$num" -le "$count" ]; then
      SELECTED_INDICES+=($((num - 1)))
    else
      log_warn "Invalid selection: $num (skipping)"
    fi
  done
}

# --- Backup operations -------------------------------------------------------

backup_aios_core() {
  echo ""
  echo -e "  ${BOLD}${WHITE}[1/3] AIOS Core Backup${RESET}"
  separator

  if [ ! -d "$AIOS_CORE_DIR/.git" ]; then
    log_error "aios-core is not a git repository: $AIOS_CORE_DIR"
    ERRORS+=("aios-core: not a git repo")
    return
  fi

  cd "$AIOS_CORE_DIR"

  # Check if origin points to backup repo
  local origin_url
  origin_url=$(git remote get-url origin 2>/dev/null || echo "")

  if [[ "$origin_url" != *"$GITHUB_USER"* ]]; then
    log_warn "origin remote doesn't point to your GitHub ($origin_url)"
    log_info "Expected: github.com/${GITHUB_USER}/..."

    # Check if there's a backup remote
    local backup_url
    backup_url=$(git remote get-url backup 2>/dev/null || echo "")
    if [ -n "$backup_url" ] && [[ "$backup_url" == *"$GITHUB_USER"* ]]; then
      log_info "Found 'backup' remote: $backup_url"
      log_info "Using 'backup' remote instead of 'origin'"
      local push_remote="backup"
    else
      log_error "No remote found pointing to your GitHub. Run setup first."
      ERRORS+=("aios-core: no backup remote configured")
      return
    fi
  else
    local push_remote="origin"
  fi

  # Ensure .gitignore protects sensitive files
  ensure_gitignore_safe "$AIOS_CORE_DIR"

  # Check for changes
  local changes
  changes=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

  if [ "$changes" -eq 0 ]; then
    log_info "No changes to commit"

    # Still try to push in case local is ahead
    local unpushed
    unpushed=$(git log "${push_remote}/main..HEAD" --oneline 2>/dev/null | wc -l | tr -d ' ')
    if [ "$unpushed" -gt 0 ]; then
      log_info "$unpushed unpushed commit(s) found"
      if $DRY_RUN; then
        log_dry "Would push $unpushed commits to ${push_remote}"
      else
        log_action "Pushing to ${push_remote}..."
        git push "$push_remote" main 2>/dev/null && log_success "Pushed to ${push_remote}" || {
          log_error "Push failed"
          ERRORS+=("aios-core: push failed")
        }
      fi
    else
      log_success "aios-core is up to date"
    fi

    BACKED_UP+=("aios-core")
    return
  fi

  log_info "$changes file(s) with changes"

  if $DRY_RUN; then
    log_dry "Would stage, commit, and push $changes files"
    BACKED_UP+=("aios-core [dry-run]")
    return
  fi

  # Stage all changes (respects .gitignore)
  log_action "Staging changes..."
  git add -A

  # Verify nothing sensitive slipped through
  local sensitive_staged
  sensitive_staged=$(git diff --cached --name-only | grep -iE '\.(env|key)$|token\.|bearer\.|cookie\.|secret\.|credential' | grep -v '.example' | grep -v '.md' || true)

  if [ -n "$sensitive_staged" ]; then
    log_warn "Sensitive files detected in staging, removing:"
    while IFS= read -r f; do
      log_warn "  - $f"
      git reset HEAD "$f" 2>/dev/null || true
    done <<< "$sensitive_staged"
  fi

  # Commit
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M')
  log_action "Committing..."
  git commit -m "backup: aios-core sync ${timestamp}" --no-verify 2>/dev/null || {
    log_info "Nothing to commit after filtering"
    BACKED_UP+=("aios-core")
    return
  }

  # Push
  log_action "Pushing to ${push_remote}..."
  git push "$push_remote" main 2>/dev/null && log_success "aios-core backed up" || {
    log_error "Push failed"
    ERRORS+=("aios-core: push failed")
  }

  BACKED_UP+=("aios-core")
}

backup_project() {
  local entry="$1"
  IFS='|' read -r name has_git has_remote remote_url has_aios dirty_count branch <<< "$entry"
  local dir="${PROJECTS_DIR}/${name}"

  echo ""
  echo -e "  ${BOLD}${CYAN}>> ${name}${RESET}"

  # Step 1: Ensure git is initialized
  if [ "$has_git" = "no" ]; then
    if $DRY_RUN; then
      log_dry "Would initialize git repo"
    else
      log_action "Initializing git repository..."
      git -C "$dir" init -b main >/dev/null 2>&1
    fi
    has_git="yes"
  fi

  # Step 2: Ensure .gitignore is safe
  ensure_gitignore_safe "$dir"

  # Step 3: Create GitHub repo if no remote
  if [ "$has_remote" = "no" ]; then
    local repo_name="$name"

    if $DRY_RUN; then
      log_dry "Would create private repo: ${GITHUB_USER}/${repo_name}"
      log_dry "Would add remote origin"
    else
      log_action "Creating private repo: ${GITHUB_USER}/${repo_name}..."

      # Check if repo already exists on GitHub
      if gh repo view "${GITHUB_USER}/${repo_name}" &>/dev/null; then
        log_info "Repo already exists on GitHub"
      else
        gh repo create "${GITHUB_USER}/${repo_name}" --private \
          --description "Backup of ${name} project" >/dev/null 2>&1
        log_success "Created ${GITHUB_USER}/${repo_name} (private)"
        CREATED_REPOS+=("${GITHUB_USER}/${repo_name}")
      fi

      # Add remote
      if ! git -C "$dir" remote get-url origin &>/dev/null; then
        git -C "$dir" remote add origin "https://github.com/${GITHUB_USER}/${repo_name}.git"
        log_info "Added remote origin"
      fi
    fi
  fi

  # Step 4: Stage and commit
  if $DRY_RUN; then
    log_dry "Would stage, commit, and push"
    BACKED_UP+=("${name} [dry-run]")
    return
  fi

  cd "$dir"

  # Stage all (respects .gitignore)
  git add -A 2>/dev/null

  # Check if anything to commit
  local staged
  staged=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')

  if [ "$staged" -gt 0 ]; then
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M')
    git commit -m "backup: sync ${timestamp}" --no-verify 2>/dev/null
    log_info "Committed $staged file(s)"
  else
    log_info "No changes to commit"
  fi

  # Step 5: Push
  local current_branch
  current_branch=$(git branch --show-current 2>/dev/null || echo "main")

  log_action "Pushing to origin/${current_branch}..."
  if git push -u origin "$current_branch" 2>/dev/null; then
    log_success "${name} backed up"
    BACKED_UP+=("$name")
  else
    log_error "Push failed for ${name}"
    ERRORS+=("${name}: push failed")
  fi
}

backup_global_skills() {
  echo ""
  echo -e "  ${BOLD}${WHITE}[3/3] Global Claude Skills${RESET}"
  separator

  if [ ! -d "$CLAUDE_SKILLS_DIR" ]; then
    log_warn "No global skills directory found at $CLAUDE_SKILLS_DIR"
    SKIPPED+=("global-skills: directory not found")
    return
  fi

  local skill_count
  skill_count=$(find "$CLAUDE_SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')

  if [ "$skill_count" -eq 0 ]; then
    log_info "No skills found"
    return
  fi

  log_info "Found $skill_count global skill(s)"

  cd "$CLAUDE_SKILLS_DIR"

  # Initialize git if needed
  if [ ! -d ".git" ]; then
    local repo_name="claude-global-skills"

    if $DRY_RUN; then
      log_dry "Would init git, create repo ${GITHUB_USER}/${repo_name}, and push"
      BACKED_UP+=("global-skills [dry-run]")
      return
    fi

    log_action "Initializing git repository..."
    git init -b main >/dev/null 2>&1

    # Create .gitignore
    cat > .gitignore <<'EOF'
# Sensitive files
.env
.env.*
!.env.example
*token*.json
*secret*
*credential*
*.key
EOF

    log_action "Creating private repo: ${GITHUB_USER}/${repo_name}..."
    if gh repo view "${GITHUB_USER}/${repo_name}" &>/dev/null; then
      log_info "Repo already exists on GitHub"
    else
      gh repo create "${GITHUB_USER}/${repo_name}" --private \
        --description "Backup of global Claude Code skills" >/dev/null 2>&1
      CREATED_REPOS+=("${GITHUB_USER}/${repo_name}")
      log_success "Created ${GITHUB_USER}/${repo_name} (private)"
    fi

    git remote add origin "https://github.com/${GITHUB_USER}/${repo_name}.git" 2>/dev/null || true
  fi

  if $DRY_RUN; then
    log_dry "Would stage, commit, and push global skills"
    BACKED_UP+=("global-skills [dry-run]")
    return
  fi

  git add -A 2>/dev/null

  local staged
  staged=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')

  if [ "$staged" -gt 0 ]; then
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M')
    git commit -m "backup: global skills sync ${timestamp}" --no-verify 2>/dev/null
    log_info "Committed $staged file(s)"
  else
    log_info "No changes to commit"
  fi

  local current_branch
  current_branch=$(git branch --show-current 2>/dev/null || echo "main")

  log_action "Pushing..."
  if git push -u origin "$current_branch" 2>/dev/null; then
    log_success "Global skills backed up"
    BACKED_UP+=("global-skills")
  else
    log_error "Push failed for global skills"
    ERRORS+=("global-skills: push failed")
  fi
}

# --- Summary -----------------------------------------------------------------

print_summary() {
  echo ""
  echo ""
  echo -e "  ${BOLD}${WHITE}Backup Summary${RESET}"
  echo -e "  ${BOLD}══════════════════════════════════════════════${RESET}"

  if [ ${#BACKED_UP[@]} -gt 0 ]; then
    echo -e "  ${GREEN}Backed up (${#BACKED_UP[@]}):${RESET}"
    for item in "${BACKED_UP[@]}"; do
      echo -e "    ${GREEN}+${RESET} $item"
    done
  fi

  if [ ${#CREATED_REPOS[@]} -gt 0 ]; then
    echo ""
    echo -e "  ${CYAN}New repos created (${#CREATED_REPOS[@]}):${RESET}"
    for item in "${CREATED_REPOS[@]}"; do
      echo -e "    ${CYAN}*${RESET} github.com/$item"
    done
  fi

  if [ ${#SKIPPED[@]} -gt 0 ]; then
    echo ""
    echo -e "  ${DIM}Skipped (${#SKIPPED[@]}):${RESET}"
    for item in "${SKIPPED[@]}"; do
      echo -e "    ${DIM}-${RESET} $item"
    done
  fi

  if [ ${#ERRORS[@]} -gt 0 ]; then
    echo ""
    echo -e "  ${RED}Errors (${#ERRORS[@]}):${RESET}"
    for item in "${ERRORS[@]}"; do
      echo -e "    ${RED}!${RESET} $item"
    done
  fi

  echo ""
  separator
  echo -e "  ${DIM}Completed at $(date '+%Y-%m-%d %H:%M:%S')${RESET}"
  echo ""
}

# --- Status command ----------------------------------------------------------

show_status() {
  print_banner

  echo -e "  ${BOLD}${WHITE}AIOS Core${RESET}"
  separator

  if [ -d "$AIOS_CORE_DIR/.git" ]; then
    cd "$AIOS_CORE_DIR"
    local origin_url
    origin_url=$(git remote get-url origin 2>/dev/null || echo "none")
    local upstream_url
    upstream_url=$(git remote get-url upstream 2>/dev/null || echo "none")
    local changes
    changes=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

    echo -e "  origin:   ${CYAN}${origin_url}${RESET}"
    echo -e "  upstream: ${DIM}${upstream_url}${RESET}"
    echo -e "  changes:  ${changes} file(s)"
  else
    echo -e "  ${RED}Not a git repository${RESET}"
  fi

  echo ""
  echo -e "  ${BOLD}${WHITE}Projects (${PROJECTS_DIR})${RESET}"
  separator

  SCAN_RESULTS=()
  for dir in "${PROJECTS_DIR}"/*/; do
    [ -d "$dir" ] || continue
    local entry
    entry=$(scan_project "$dir")
    [ -n "$entry" ] && SCAN_RESULTS+=("$entry")
  done

  if [ ${#SCAN_RESULTS[@]} -gt 0 ]; then
    display_project_table
  else
    echo -e "  ${DIM}No projects found${RESET}"
  fi

  echo -e "  ${BOLD}${WHITE}Global Skills (${CLAUDE_SKILLS_DIR})${RESET}"
  separator

  if [ -d "$CLAUDE_SKILLS_DIR" ]; then
    local skill_count
    skill_count=$(find "$CLAUDE_SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
    local has_git_skills="no"
    [ -d "$CLAUDE_SKILLS_DIR/.git" ] && has_git_skills="yes"

    echo -e "  skills:   ${skill_count}"
    echo -e "  git repo: ${has_git_skills}"
    if [ "$has_git_skills" = "yes" ]; then
      local skills_remote
      skills_remote=$(git -C "$CLAUDE_SKILLS_DIR" remote get-url origin 2>/dev/null || echo "none")
      echo -e "  remote:   ${CYAN}${skills_remote}${RESET}"
    fi
  else
    echo -e "  ${DIM}Not found${RESET}"
  fi

  echo ""
}

# --- Main --------------------------------------------------------------------

main() {
  # Parse arguments
  while [ $# -gt 0 ]; do
    case "$1" in
      --all|-a)     ALL_MODE=true ;;
      --dry-run|-n) DRY_RUN=true ;;
      --status|-s)  STATUS_ONLY=true ;;
      --help|-h)
        echo "Usage: aios-backup [options]"
        echo ""
        echo "Options:"
        echo "  --all, -a       Backup everything without prompting"
        echo "  --dry-run, -n   Show what would happen, don't execute"
        echo "  --status, -s    Show backup status overview"
        echo "  --help, -h      Show this help"
        echo ""
        echo "Environment variables:"
        echo "  AIOS_PROJECTS_DIR  Projects directory (default: ~/Projects)"
        echo "  AIOS_CORE_DIR      AIOS Core directory (default: ~/aios-core)"
        echo "  GITHUB_USER        GitHub username (auto-detected from gh)"
        exit 0
        ;;
      *)
        log_error "Unknown option: $1"
        exit 1
        ;;
    esac
    shift
  done

  # Status-only mode
  if $STATUS_ONLY; then
    show_status
    exit 0
  fi

  print_banner

  if $DRY_RUN; then
    echo -e "  ${YELLOW}${BOLD}DRY RUN MODE - no changes will be made${RESET}"
    echo ""
  fi

  check_prereqs

  # --- Step 1: Backup aios-core ---
  backup_aios_core

  # --- Step 2: Scan and backup projects ---
  echo ""
  echo -e "  ${BOLD}${WHITE}[2/3] Projects Backup${RESET}"
  separator

  SCAN_RESULTS=()
  for dir in "${PROJECTS_DIR}"/*/; do
    [ -d "$dir" ] || continue
    local entry
    entry=$(scan_project "$dir")
    [ -n "$entry" ] && SCAN_RESULTS+=("$entry")
  done

  if [ ${#SCAN_RESULTS[@]} -eq 0 ]; then
    log_info "No projects found in ${PROJECTS_DIR}"
  else
    display_project_table

    SELECTED_INDICES=()

    if $ALL_MODE; then
      for i in $(seq 0 $((${#SCAN_RESULTS[@]} - 1))); do
        SELECTED_INDICES+=("$i")
      done
      log_info "All mode: selecting all ${#SCAN_RESULTS[@]} projects"
    else
      select_projects
    fi

    if [ ${#SELECTED_INDICES[@]} -eq 0 ]; then
      log_skip "No projects selected"
    else
      echo ""
      log_info "Backing up ${#SELECTED_INDICES[@]} project(s)..."

      for idx in "${SELECTED_INDICES[@]}"; do
        backup_project "${SCAN_RESULTS[$idx]}"
      done
    fi
  fi

  # --- Step 3: Global skills ---
  backup_global_skills

  # --- Summary ---
  print_summary
}

main "$@"
