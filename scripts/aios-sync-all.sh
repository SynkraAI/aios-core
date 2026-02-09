#!/usr/bin/env bash
# ============================================================================
# aios-sync-all.sh — Sync AIOS framework from hub to all projects
# ============================================================================
#
# Usage:
#   aios-sync-all.sh              # Full sync (git pull + update all projects)
#   aios-sync-all.sh --dry-run    # Preview only, no changes
#   aios-sync-all.sh --skip-pull  # Skip git pull, just sync projects
#   aios-sync-all.sh --status     # Show version status of all projects
#
# What it syncs:
#   .aios-core/         → Framework core (full replace)
#   .aios/skills/       → Hub skills (new only, preserves existing)
#   .claude/rules/      → Agent rules (full replace)
#   .claude/commands/    → IDE commands (full replace)
#
# What it preserves:
#   .claude/CLAUDE.md   → Project-specific instructions (NEVER touched)
#   .aios/skills/*      → Existing project skills (NEVER overwritten)
#   .aios/              → Project data, settings, history
#
# ============================================================================

set -euo pipefail

# --- Config ---
AIOS_HUB="$HOME/aios-core"
PROJECTS_DIR="$HOME/Projects"

# --- Colors ---
G='\033[0;32m'    # green
Y='\033[1;33m'    # yellow
B='\033[0;34m'    # blue
C='\033[0;36m'    # cyan
R='\033[0;31m'    # red
D='\033[0;90m'    # dim
N='\033[0m'       # reset
BOLD='\033[1m'

# --- State ---
DRY_RUN=false
SKIP_PULL=false
STATUS_ONLY=false
UPDATED=0
SKIPPED=0
FAILED=0
TOTAL=0

# --- Parse args ---
for arg in "$@"; do
  case "$arg" in
    --dry-run)    DRY_RUN=true ;;
    --skip-pull)  SKIP_PULL=true ;;
    --status)     STATUS_ONLY=true ;;
    --help|-h)
      head -25 "$0" | tail -22
      exit 0 ;;
    *)
      echo "Unknown option: $arg"
      exit 1 ;;
  esac
done

# --- Helpers ---
log()  { echo -e "${B}[sync]${N} $1"; }
ok()   { echo -e "${G}  ✓${N} $1"; }
warn() { echo -e "${Y}  ⚠${N} $1"; }
err()  { echo -e "${R}  ✗${N} $1"; }
dim()  { echo -e "${D}  $1${N}"; }

hub_version() {
  node -e "console.log(require('$AIOS_HUB/package.json').version)" 2>/dev/null || echo "?"
}

project_version() {
  local dir="$1"
  if [[ -f "$dir/.aios-core/version.json" ]]; then
    node -e "
      try {
        const v = require('$dir/.aios-core/version.json');
        console.log(v.version || '?');
      } catch { console.log('?'); }
    " 2>/dev/null
  else
    echo "?"
  fi
}

# --- Header ---
echo ""
echo -e "${BOLD}${C}  AIOS Sync All${N}"
echo -e "${D}  ─────────────────────────────────────${N}"
$DRY_RUN && echo -e "${Y}  DRY RUN — nenhuma alteração será feita${N}"
echo ""

# ============================================================================
# 1. UPDATE HUB (git pull)
# ============================================================================
if ! $SKIP_PULL && ! $STATUS_ONLY; then
  log "Atualizando hub ${D}($AIOS_HUB)${N}"

  cd "$AIOS_HUB"

  # Stash local changes if any tracked files are modified
  has_changes=false
  if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
    has_changes=true
    if ! $DRY_RUN; then
      git stash push -m "aios-sync-all: auto-stash $(date +%Y%m%d-%H%M%S)" --quiet
      dim "Stashed local changes"
    fi
  fi

  if ! $DRY_RUN; then
    pull_output=$(git pull 2>&1) || {
      err "git pull falhou: $pull_output"
      # Restore stash if pull failed
      if $has_changes; then
        git stash pop --quiet 2>/dev/null || true
      fi
      exit 1
    }

    if [[ "$pull_output" == *"Already up to date"* ]]; then
      ok "Hub já está atualizado"
    else
      ok "Hub atualizado"
      dim "$pull_output"
    fi

    # Restore stashed changes
    if $has_changes; then
      git stash pop --quiet 2>/dev/null || {
        warn "Conflito ao restaurar stash — resolva manualmente (git stash list)"
      }
    fi
  else
    ok "git pull (dry-run)"
  fi
  echo ""
fi

HUB_VER=$(hub_version)
log "Hub version: ${BOLD}v$HUB_VER${N}"
echo ""

# ============================================================================
# 2. FIND PROJECTS WITH AIOS
# ============================================================================
log "Escaneando ${D}$PROJECTS_DIR${N}"
echo ""

projects=()
for dir in "$PROJECTS_DIR"/*/; do
  [[ -d "$dir/.aios-core" ]] && projects+=("$dir")
done

if [[ ${#projects[@]} -eq 0 ]]; then
  warn "Nenhum projeto com AIOS encontrado em $PROJECTS_DIR"
  exit 0
fi

log "Encontrados: ${BOLD}${#projects[@]}${N} projetos"
echo ""

# ============================================================================
# 3. STATUS MODE — just show versions
# ============================================================================
if $STATUS_ONLY; then
  printf "  ${BOLD}%-30s %-12s %-10s${N}\n" "PROJETO" "VERSÃO" "STATUS"
  echo -e "  ${D}──────────────────────────────────────────────────${N}"
  for dir in "${projects[@]}"; do
    name=$(basename "$dir")
    ver=$(project_version "$dir")
    if [[ "$ver" == "$HUB_VER" ]]; then
      printf "  %-30s %-12s ${G}✓ atual${N}\n" "$name" "v$ver"
    else
      printf "  %-30s %-12s ${Y}↑ v$HUB_VER${N}\n" "$name" "v$ver"
    fi
  done
  echo ""
  exit 0
fi

# ============================================================================
# 4. SYNC EACH PROJECT
# ============================================================================
for dir in "${projects[@]}"; do
  name=$(basename "$dir")
  ver=$(project_version "$dir")
  ((TOTAL++))

  echo -e "${BOLD}  ━━━ $name ${D}(v$ver)${N}${BOLD} ━━━${N}"

  # Check if already up to date
  if [[ "$ver" == "$HUB_VER" ]]; then
    ok "Já na versão v$HUB_VER"
    ((SKIPPED++))
    echo ""
    continue
  fi

  if $DRY_RUN; then
    warn "Atualizaria v$ver → v$HUB_VER"
    ((UPDATED++))
    echo ""
    continue
  fi

  # --- 4a. Sync .aios-core/ (framework core) ---
  if rsync -a --delete \
    --exclude='.installed-manifest.yaml' \
    --exclude='version.json' \
    --exclude='.aios-installation-config.yaml' \
    --exclude='.aios-pm-config.yaml' \
    "$AIOS_HUB/.aios-core/" "$dir/.aios-core/" 2>/dev/null; then
    ok ".aios-core/ sincronizado"
  else
    err ".aios-core/ falhou"
    ((FAILED++))
    echo ""
    continue
  fi

  # --- 4b. Sync skills (new only) ---
  if [[ -d "$AIOS_HUB/.aios/skills/" ]]; then
    # Count new skills
    new_skills=0
    for skill_dir in "$AIOS_HUB/.aios/skills"/*/; do
      [[ ! -d "$skill_dir" ]] && continue
      skill_name=$(basename "$skill_dir")
      [[ "$skill_name" == "SKILLS-INDEX.md" ]] && continue
      if [[ ! -d "$dir/.aios/skills/$skill_name" ]]; then
        ((new_skills++))
      fi
    done

    rsync -a --ignore-existing \
      --exclude='SKILLS-INDEX.md' \
      "$AIOS_HUB/.aios/skills/" "$dir/.aios/skills/" 2>/dev/null

    if [[ $new_skills -gt 0 ]]; then
      ok "Skills: $new_skills novas distribuídas"
    else
      ok "Skills: todas já presentes"
    fi
  fi

  # --- 4c. Sync .claude/rules/ ---
  if [[ -d "$AIOS_HUB/.claude/rules/" ]]; then
    mkdir -p "$dir/.claude/rules/"
    rsync -a "$AIOS_HUB/.claude/rules/" "$dir/.claude/rules/" 2>/dev/null
    ok ".claude/rules/ sincronizado"
  fi

  # --- 4d. Sync .claude/commands/ ---
  if [[ -d "$AIOS_HUB/.claude/commands/" ]]; then
    mkdir -p "$dir/.claude/commands/"
    rsync -a "$AIOS_HUB/.claude/commands/" "$dir/.claude/commands/" 2>/dev/null
    ok ".claude/commands/ sincronizado"
  fi

  # --- 4e. Update version.json ---
  node -e "
    const fs = require('fs');
    const path = '$dir/.aios-core/version.json';
    let v = {};
    try { v = JSON.parse(fs.readFileSync(path, 'utf8')); } catch {}
    v.version = '$HUB_VER';
    v.lastSync = new Date().toISOString();
    v.syncSource = 'aios-sync-all';
    v.previousVersion = '$ver';
    fs.writeFileSync(path, JSON.stringify(v, null, 2));
  " 2>/dev/null
  ok "version.json → v$HUB_VER"

  ((UPDATED++))
  echo ""
done

# ============================================================================
# 5. SUMMARY
# ============================================================================
echo -e "${D}  ─────────────────────────────────────${N}"
echo -e "${BOLD}${C}  Resumo${N}"
echo -e "  Hub:          ${BOLD}v$HUB_VER${N}"
echo -e "  Projetos:     $TOTAL"
echo -e "  Atualizados:  ${G}$UPDATED${N}"
echo -e "  Já atuais:    ${D}$SKIPPED${N}"
[[ $FAILED -gt 0 ]] && echo -e "  Falharam:     ${R}$FAILED${N}"
$DRY_RUN && echo -e "  ${Y}(dry-run — nada foi alterado)${N}"
echo ""
