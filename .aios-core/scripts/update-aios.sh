#!/bin/bash
# AIOS Framework Update - v6.0 (Complete Framework Sync)
#
# LOGIC (STRICT ORDER):
#   - UPSTREAM only (not in local)     → CREATE
#   - LOCAL + UPSTREAM                 → OVERWRITE (upstream wins)
#   - WAS in both, UPSTREAM removed    → DELETE
#   - LOCAL only (not in upstream)     → PRESERVE (never delete)
#
# Upstream: https://github.com/SynkraAI/aios-core
# Usage: bash .aios-core/scripts/update-aios.sh

set -e

echo "⚡ AIOS Update v6.0"
echo ""

# Preflight: check rsync
if ! command -v rsync >/dev/null 2>&1; then
  echo "❌ rsync is required but not found in PATH."
  exit 1
fi

# Validate: clean working tree (entire repository)
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Commit ALL changes first:"
  git status --short
  echo ""
  echo "Run: git add -A && git commit -m 'your message'"
  exit 1
fi

# Temp directory
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Report files
REPORT_CREATED="$TEMP_DIR/report-created.txt"
REPORT_UPDATED="$TEMP_DIR/report-updated.txt"
REPORT_DELETED="$TEMP_DIR/report-deleted.txt"
REPORT_PRESERVED="$TEMP_DIR/report-preserved.txt"
touch "$REPORT_CREATED" "$REPORT_UPDATED" "$REPORT_DELETED" "$REPORT_PRESERVED"

# Clone upstream (complete repository)
echo "📥 Cloning upstream (https://github.com/SynkraAI/aios-core.git)..."
git clone --depth 1 \
  https://github.com/SynkraAI/aios-core.git \
  "$TEMP_DIR/upstream" 2>/dev/null || {
  echo "❌ Failed to clone. Check network or upstream URL."
  exit 1
}

echo "✅ Fetched upstream"
echo ""

# Build file lists (all files in repository, relative to root)
echo "📋 Scanning files..."
find . -type f -not -path './.git/*' -not -path './.aios-core/.git/*' | sed 's|^\./||' | sort > "$TEMP_DIR/local-files.txt"
find "$TEMP_DIR/upstream" -type f -not -path '*/.git' -not -path '*/.git/*' | sed "s|^$TEMP_DIR/upstream/||" | sort > "$TEMP_DIR/upstream-files.txt"

# Get git-tracked files (for DELETE detection)
git ls-files | sort > "$TEMP_DIR/tracked-files.txt"

# Use comm to find differences - O(n) instead of O(n²)
echo "🔍 Analyzing differences..."

# LOCAL-ONLY: in local but not in upstream
comm -23 "$TEMP_DIR/local-files.txt" "$TEMP_DIR/upstream-files.txt" > "$REPORT_PRESERVED"

# UPSTREAM-ONLY (CREATE): in upstream but not in local
comm -13 "$TEMP_DIR/local-files.txt" "$TEMP_DIR/upstream-files.txt" > "$REPORT_CREATED"

# IN-BOTH: files that exist in both
comm -12 "$TEMP_DIR/local-files.txt" "$TEMP_DIR/upstream-files.txt" > "$TEMP_DIR/in-both.txt"

# DELETE: was tracked by git, not in upstream, not local-only
comm -23 "$TEMP_DIR/tracked-files.txt" "$TEMP_DIR/upstream-files.txt" | \
  comm -23 - "$REPORT_PRESERVED" > "$REPORT_DELETED"

# UPDATED: in both but content differs
echo "📝 Checking for updates..."
while IFS= read -r rel_path; do
  if ! cmp -s "./$rel_path" "$TEMP_DIR/upstream/$rel_path" 2>/dev/null; then
    echo "$rel_path" >> "$REPORT_UPDATED"
  fi
done < "$TEMP_DIR/in-both.txt"

# Backup local-only files
echo "🔐 Backing up local-only files..."
mkdir -p "$TEMP_DIR/local-only"
while IFS= read -r rel_path; do
  [ -z "$rel_path" ] && continue
  mkdir -p "$TEMP_DIR/local-only/$(dirname "$rel_path")"
  cp -a "./$rel_path" "$TEMP_DIR/local-only/$rel_path"
done < "$REPORT_PRESERVED"

# Execute sync
echo ""
echo "🔀 Syncing..."

# Delete files removed from upstream
if [ -s "$REPORT_DELETED" ]; then
  while IFS= read -r rel_path; do
    [ -z "$rel_path" ] && continue
    rm -f "./$rel_path"
  done < "$REPORT_DELETED"
fi

# Copy all upstream files (creates new + overwrites existing)
# --delete removes files not in upstream (except local-only backups)
rsync -a --delete "$TEMP_DIR/upstream/" "./"

# Restore local-only files (in case accidentally overwritten by rsync)
if [ -d "$TEMP_DIR/local-only" ] && [ "$(ls -A "$TEMP_DIR/local-only" 2>/dev/null)" ]; then
  rsync -a "$TEMP_DIR/local-only/" "./"
fi

# Clean empty directories (if any created during sync)
find . -type d -empty -not -path './.git/*' -not -path './.git' -delete 2>/dev/null || true

# Generate report
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  SYNC REPORT"
echo "════════════════════════════════════════════════════════════"

CREATED_COUNT=$(wc -l < "$REPORT_CREATED" | tr -d ' ')
UPDATED_COUNT=$(wc -l < "$REPORT_UPDATED" | tr -d ' ')
DELETED_COUNT=$(wc -l < "$REPORT_DELETED" | tr -d ' ')
PRESERVED_COUNT=$(wc -l < "$REPORT_PRESERVED" | tr -d ' ')

echo ""
echo "  ➕ CREATED:   $CREATED_COUNT files"
if [ "$CREATED_COUNT" -gt 0 ] && [ "$CREATED_COUNT" -le 20 ]; then
  sed 's/^/       /' "$REPORT_CREATED"
elif [ "$CREATED_COUNT" -gt 20 ]; then
  head -10 "$REPORT_CREATED" | sed 's/^/       /'
  echo "       ... and $((CREATED_COUNT - 10)) more"
fi

echo ""
echo "  📝 UPDATED:   $UPDATED_COUNT files"
if [ "$UPDATED_COUNT" -gt 0 ] && [ "$UPDATED_COUNT" -le 20 ]; then
  sed 's/^/       /' "$REPORT_UPDATED"
elif [ "$UPDATED_COUNT" -gt 20 ]; then
  head -10 "$REPORT_UPDATED" | sed 's/^/       /'
  echo "       ... and $((UPDATED_COUNT - 10)) more"
fi

echo ""
echo "  🗑️  DELETED:   $DELETED_COUNT files"
if [ "$DELETED_COUNT" -gt 0 ] && [ "$DELETED_COUNT" -le 20 ]; then
  sed 's/^/       /' "$REPORT_DELETED"
elif [ "$DELETED_COUNT" -gt 20 ]; then
  head -10 "$REPORT_DELETED" | sed 's/^/       /'
  echo "       ... and $((DELETED_COUNT - 10)) more"
fi

echo ""
echo "  🔐 PRESERVED: $PRESERVED_COUNT local-only files"
if [ "$PRESERVED_COUNT" -gt 0 ] && [ "$PRESERVED_COUNT" -le 10 ]; then
  sed 's/^/       /' "$REPORT_PRESERVED"
elif [ "$PRESERVED_COUNT" -gt 10 ]; then
  head -5 "$REPORT_PRESERVED" | sed 's/^/       /'
  echo "       ... and $((PRESERVED_COUNT - 5)) more"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Choose:"
echo "  ✅ Apply:  git add .aios-core && git commit -m 'chore: sync AIOS framework'"
echo "  ❌ Cancel: git checkout -- .aios-core/"
echo ""
