#!/bin/bash
# AIOS Migration - Master Script
# Executes all migration phases sequentially
# Created by @architect (Aria) - 2026-02-13

set -e

echo "🚀 AIOS Migration - Master Script"
echo "=================================="
echo ""
echo "This script will execute ALL migration phases."
echo "Estimated time: ~30 minutes"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Execute all phases
bash migration-scripts/phase-0-backup.sh
read -p "Phase 0 complete. Continue to Phase 1? (y/n) " -n 1 -r && echo
[[ $REPLY =~ ^[Yy]$ ]] || exit 1

bash migration-scripts/phase-1-agents.sh
read -p "Phase 1 complete. Continue to Phase 2? (y/n) " -n 1 -r && echo
[[ $REPLY =~ ^[Yy]$ ]] || exit 1

bash migration-scripts/phase-2-templates.sh
read -p "Phase 2 complete. Continue to Phase 3? (y/n) " -n 1 -r && echo
[[ $REPLY =~ ^[Yy]$ ]] || exit 1

bash migration-scripts/phase-3-skills.sh
read -p "Phase 3 complete. Continue to Phase 4? (y/n) " -n 1 -r && echo
[[ $REPLY =~ ^[Yy]$ ]] || exit 1

bash migration-scripts/phase-4-scripts.sh
read -p "Phase 4 complete. Continue to Phase 5? (y/n) " -n 1 -r && echo
[[ $REPLY =~ ^[Yy]$ ]] || exit 1

bash migration-scripts/phase-5-stories.sh
read -p "Phase 5 complete. Continue to Phase 6? (y/n) " -n 1 -r && echo
[[ $REPLY =~ ^[Yy]$ ]] || exit 1

bash migration-scripts/phase-6-squads.sh
read -p "Phase 6 complete. Continue to Phase 7? (y/n) " -n 1 -r && echo
[[ $REPLY =~ ^[Yy]$ ]] || exit 1

bash migration-scripts/phase-7-cleanup.sh
read -p "Phase 7 complete. Continue to Phase 8? (y/n) " -n 1 -r && echo
[[ $REPLY =~ ^[Yy]$ ]] || exit 1

bash migration-scripts/phase-8-validation.sh

echo ""
echo "🎉 ALL PHASES COMPLETE!"
echo ""
