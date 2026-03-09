---
id: notif-mm26s8tf-6fd0
type: ids_health_warning
recipient: @dev
timestamp: 2026-02-25T15:25:49.347Z
status: sent
---

[IDS Self-Healing] WARNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Issue: missing-file (CRITICAL)
Entity: missing-file-task
Path: tasks/gone.md

Problem: Referenced file does not exist on disk

Details:
  path: "tasks/gone.md"

Suggested Actions:
  1. Check if file was moved: git log --follow --diff-filter=R -- "*missing-file-task*"
  2. If intentionally deleted, remove from registry
  3. If accidentally deleted, restore from git: git checkout HEAD~1 -- tasks/gone.md

This issue requires manual intervention and cannot be auto-fixed.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━