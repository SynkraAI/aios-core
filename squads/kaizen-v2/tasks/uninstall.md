---
task:
  name: uninstall
  status: SPEC_DEFINED
  version: 1.0.0
  responsible_executor: kaizen-chief
  execution_type: MANUAL (*uninstall)
  trigger: User runs `/kaizen-v2:*uninstall`
---

# uninstall

## Task Anatomy

### Input
- `.claude/settings.json` (to remove kaizen-v2 hooks only)
- `squads/kaizen-v2/` directory (reference for hook names)

### Output
- Updated `.claude/settings.json` with kaizen-v2 hooks removed
- All other hooks preserved
- `data/intelligence/` directory PRESERVED (intelligence data retained)

### Acceptance Criteria
- [ ] kaizen-v2 Stop hook removed from `.claude/settings.json`
- [ ] kaizen-v2 SessionStart hook removed from `.claude/settings.json`
- [ ] All other hooks left untouched
- [ ] `data/intelligence/` directory NOT deleted (intelligence data safe)
- [ ] Backup of settings.json created before removal
- [ ] Uninstall report confirms hook removal

---

## Detailed Specification

### Step 1: Backup `.claude/settings.json`
```bash
cp .claude/settings.json .claude/settings.json.backup-kaizen-v2-uninstall
```

### Step 2: Identify kaizen-v2 Hooks
Hook names to remove:
- `kaizen-v2-stop-capture`
- `kaizen-v2-session-briefing`

### Step 3: Remove from .claude/settings.json
```json
{
  "hooks": {
    "PreToolUse": [
      // Remove: { "name": "kaizen-v2-stop-capture", ... }
      // Keep: all other hooks
    ],
    "SessionStart": [
      // Remove: { "name": "kaizen-v2-session-briefing", ... }
      // Keep: all other hooks
    ]
  }
}
```

### Step 4: Verify Other Hooks Intact
- Check that non-kaizen-v2 hooks remain unchanged
- If any other hooks were corrupted: Restore from backup

### Step 5: Preserve Intelligence Data
```bash
# NEVER DELETE
data/intelligence/daily/        # Keep all daily captures
data/intelligence/reflections/  # Keep all reflections
data/intelligence/knowledge/    # Keep patterns.yaml
data/intelligence/archive/      # Keep archived patterns

# These are user's learning history — must be preserved
```

### Step 6: Uninstall Report
```markdown
# Kaizen-v2 Uninstall Report — YYYY-MM-DD HH:MM:SS

## Hooks Removed
- kaizen-v2-stop-capture: REMOVED from .claude/settings.json
- kaizen-v2-session-briefing: REMOVED from .claude/settings.json

## Other Hooks
- Status: PRESERVED (N other hooks left intact)

## Intelligence Data
- Status: PRESERVED
- Location: data/intelligence/
- Total patterns: N
- Total dailies: N
- Action: None (your learning history is safe)

## Backup
- Backup created: .claude/settings.json.backup-kaizen-v2-uninstall
- Recovery: If needed, cp .claude/settings.json.backup-kaizen-v2-uninstall .claude/settings.json

## Uninstall Status
SUCCESS — Kaizen-v2 hooks removed, intelligence data preserved

Reinstall: Run `/kaizen-v2:*install` if you change your mind
```

## Veto Conditions
- "Remoção de hooks executada sem criar backup prévio de settings.json → ABORTAR"
- "Hooks não-kaizen-v2 alterados ou removidos durante uninstall → REVERTER imediatamente do backup"
- "Diretório data/intelligence/ deletado durante uninstall → BLOQUEAR (dados de inteligência são preservados SEMPRE)"
- "Uninstall reportado como SUCCESS sem verificar que hooks restantes continuam funcionais → REDO verificação"

## Success Criteria
- PASS: Both kaizen-v2 hooks removed, other hooks preserved, intelligence data safe
- FAIL: Hook removal failed, .claude/settings.json corrupted, backup creation failed
- WARN: No kaizen-v2 hooks found (already uninstalled or manually removed)

## Error Handling
- If hooks.json parse error: Abort, ask user to fix + retry
- If hook removal fails: Revert from backup automatically
- If other hooks corrupted: Warn user + show which hooks affected
- If data deletion attempted: ABORT immediately (safety check)
