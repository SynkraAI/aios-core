#!/bin/bash
# AIOS Migration - Phase 0: Backup
# Created by @architect (Aria)
# Date: 2026-02-13

set -e  # Exit on error

BACKUP_DIR=".claude-migration-backup-$(date +%Y%m%d-%H%M%S)"

echo "🔒 FASE 0: Creating complete backup..."
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup .claude/
echo "  → Backing up .claude/..."
cp -R .claude/ "$BACKUP_DIR/.claude/"

# Backup squads/
echo "  → Backing up squads/..."
cp -R squads/ "$BACKUP_DIR/squads/"

# Backup .aios-core/development/
echo "  → Backing up .aios-core/development/..."
cp -R .aios-core/development/ "$BACKUP_DIR/.aios-core-development/"

# Backup .aios/skills/ if exists
if [ -d ".aios/skills" ]; then
  echo "  → Backing up .aios/skills/..."
  cp -R .aios/skills/ "$BACKUP_DIR/.aios-skills/"
fi

# Create backup manifest
cat > "$BACKUP_DIR/MANIFEST.txt" <<EOF
Backup criado em: $(date)
Backup de: .claude/, squads/, .aios-core/development/, .aios/skills/

Para restaurar:
  cp -R $BACKUP_DIR/.claude/ .claude/
  cp -R $BACKUP_DIR/squads/ squads/
  cp -R $BACKUP_DIR/.aios-core-development/ .aios-core/development/
  cp -R $BACKUP_DIR/.aios-skills/ .aios/skills/

Total de arquivos backupados: $(find "$BACKUP_DIR" -type f | wc -l)
EOF

echo ""
echo "✅ FASE 0 Completa"
echo "   Backup criado em: $BACKUP_DIR"
echo "   Total de arquivos: $(find "$BACKUP_DIR" -type f | wc -l)"
echo ""
echo "   IMPORTANTE: Anote o nome do diretório de backup:"
echo "   $BACKUP_DIR"
echo ""
