---
task:
  name: install
  status: SPEC_DEFINED
  version: 2.0.0
  responsible_executor: kaizen-chief
  execution_type: MANUAL (*install)
  trigger: User runs `/kaizen-v2:*install`
---

# install

## Task Anatomy

### Input
- `.claude/settings.json` (to merge hooks)
- Project type detection (aios/aiox auto-detect)
- `squads/kaizen-v2/config/config.yaml` (hook definitions)

### Output
- Merged `.claude/settings.json` with Stop + SessionStart hooks registered
- Initialized `.aiox/logs/` directory
- Initialized `squads/kaizen-v2/data/intelligence/` directories
- First daily YAML captured
- First briefing tested
- Installation report

### Acceptance Criteria
- [ ] Auto-detect AIOS or AIOX project (check for .aiox-core/ or .aiox/)
- [ ] Hooks registered in `.claude/settings.json` (Stop and SessionStart)
- [ ] `.aiox/logs/` directory created
- [ ] `squads/kaizen-v2/data/intelligence/{daily,reflections,knowledge,archive}/` dirs created
- [ ] `patterns.yaml` has seed patterns (≥5 verified)
- [ ] First daily YAML captured
- [ ] First briefing tested (output contains patterns)
- [ ] Installation checklist (12-point) passes
- [ ] User can run `*health` immediately after (all green)

### Dependencies
- `.claude/settings.json` accessible
- `squads/kaizen-v2/` directory exists
- Write permissions on project root

---

## Detailed Specification

### Step 1: Auto-Detect Project

Check for framework presence:
```bash
# Check for AIOS or AIOX
if [ -d .aiox-core/ ]; then PROJECT_TYPE="aios"; fi
if [ -d .aiox/ ]; then PROJECT_TYPE="aiox"; fi
```
If neither found: ABORT with error "Not an AIOS or AIOX project".

### Step 2: Verify `.claude/settings.json` Exists

Read the file. If it doesn't exist, create minimal:
```json
{"hooks": {}}
```

### Step 3: Register Hooks in `.claude/settings.json`

**CRITICAL: MERGE, never overwrite existing hooks.**

Read current `.claude/settings.json`. Add these 2 hooks:

#### 3a. Stop Hook — Daily Intelligence Capture

Add to the existing `"Stop"` array. If `"Stop"` key doesn't exist, create it.

**Entry to add inside `Stop[0].hooks[]`:**
```json
{
  "type": "command",
  "command": "node \"{PROJECT_ROOT}/squads/kaizen-v2/scripts/stop-capture.cjs\"",
  "timeout": 5
}
```

Where `{PROJECT_ROOT}` is the **absolute path** to the project root.

**Important:** This hook CHAINS with any existing Stop hooks (e.g., `stop-session-learnings.cjs`). Both run on each Stop event. No conflict — outputs go to different files.

#### 3b. SessionStart Hook — Pattern Briefing

Add new `"SessionStart"` key if it doesn't exist:

```json
"SessionStart": [
  {
    "matcher": "",
    "hooks": [
      {
        "type": "command",
        "command": "node \"{PROJECT_ROOT}/squads/kaizen-v2/scripts/session-briefing.cjs\"",
        "timeout": 3
      }
    ]
  }
]
```

#### 3c. Verification

After editing, the `hooks` section in `.claude/settings.json` should contain:
- `"Stop"` → array with at least 1 entry that includes `stop-capture.cjs`
- `"SessionStart"` → array with at least 1 entry that includes `session-briefing.cjs`
- All pre-existing hooks PRESERVED (UserPromptSubmit, PreToolUse, etc.)

**Template of final hooks section (for reference):**
```json
{
  "hooks": {
    "UserPromptSubmit": [ /* ...existing... */ ],
    "PreToolUse": [ /* ...existing... */ ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          { /* ...existing stop-session-learnings.cjs... */ },
          {
            "type": "command",
            "command": "node \"{PROJECT_ROOT}/squads/kaizen-v2/scripts/stop-capture.cjs\"",
            "timeout": 5
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node \"{PROJECT_ROOT}/squads/kaizen-v2/scripts/session-briefing.cjs\"",
            "timeout": 3
          }
        ]
      }
    ]
  }
}
```

### Step 4: Initialize Directories

```bash
mkdir -p .aiox/logs/
mkdir -p squads/kaizen-v2/data/intelligence/{daily,reflections,knowledge,archive}
```

Verify all directories exist. Create `.gitkeep` files if empty.

### Step 5: Verify patterns.yaml

Check `squads/kaizen-v2/data/intelligence/knowledge/patterns.yaml` has seed patterns.
If empty (patterns: []), seed with at least 5 verified patterns from project knowledge.

### Step 6: Test Stop Capture Script

Run manually with test data:
```bash
echo '{"session_id":"install-test","stop_hook_active":false,"last_assistant_message":"kaizen-v2 instalado com sucesso. decidimos usar patterns.yaml para persistência."}' | node "squads/kaizen-v2/scripts/stop-capture.cjs"
```

Verify:
- Script outputs JSON without errors
- File `squads/kaizen-v2/data/intelligence/daily/YYYY-MM-DD.yaml` was created
- YAML content is valid

### Step 7: Test Session Briefing Script

Run manually:
```bash
echo '{}' | node "squads/kaizen-v2/scripts/session-briefing.cjs"
```

Verify:
- Script outputs JSON with `hookSpecificOutput.additionalContext`
- Briefing contains patterns (not empty)
- Output is valid JSON

### Step 8: Health Check

Run `*health` task to validate all 12 installation points:
1. Project type detected (aios/aiox)
2. `.claude/settings.json` readable
3. Stop hook registered
4. SessionStart hook registered
5. `squads/kaizen-v2/` exists
6. `data/intelligence/daily/` exists
7. `data/intelligence/reflections/` exists
8. `data/intelligence/knowledge/` exists
9. `data/intelligence/archive/` exists
10. `patterns.yaml` has schema + ≥5 verified patterns
11. `.aiox/logs/` exists
12. Scripts executable (node check)

### Step 9: Installation Report

Generate and display report:

```markdown
# Kaizen-v2 Installation Report — {DATE} {TIME}

## Project Detection
- Project Type: {AIOS|AIOX}
- Root: {PROJECT_ROOT}

## Hooks Registration
- Stop hook: {REGISTERED|ALREADY_EXISTS|FAILED}
  Command: node {PROJECT_ROOT}/squads/kaizen-v2/scripts/stop-capture.cjs
- SessionStart hook: {REGISTERED|ALREADY_EXISTS|FAILED}
  Command: node {PROJECT_ROOT}/squads/kaizen-v2/scripts/session-briefing.cjs
- Pre-existing hooks: PRESERVED ({N} hooks untouched)

## Directories
- .aiox/logs/: {Created|Exists}
- data/intelligence/daily/: {Created|Exists}
- data/intelligence/reflections/: {Created|Exists}
- data/intelligence/knowledge/: {Created|Exists}
- data/intelligence/archive/: {Created|Exists}

## Data
- patterns.yaml: {N} patterns seeded (all verified)
- First daily: {Created|Exists} ({DATE}.yaml)

## Tests
- stop-capture.cjs: {PASS|FAIL}
- session-briefing.cjs: {PASS|FAIL}

## Health Check
- [{x| }] All 12 checklist items

## Status: {SUCCESS|PARTIAL|FAILED}

## Next Steps
1. Start a new session → briefing should appear automatically
2. End a session → daily YAML should be captured
3. Run `/kaizen-v2:*health` anytime to verify
4. Run `/kaizen-v2:*reflect` after 3+ days of data
```

---

## Veto Conditions
- "Hook registrado com path relativo em vez de absoluto → BLOQUEAR (hooks com path relativo falham silenciosamente)"
- "settings.json sobrescrito em vez de merge com hooks existentes → ABORTAR e restaurar backup"
- "patterns.yaml inicializado com 0 seed patterns → BLOQUEAR (mínimo 5 verified para seed válido)"
- "Instalação concluída sem rodar health check final → BLOQUEAR (não marcar SUCCESS sem validação)"
- "Scripts .cjs referenciados no hook mas inexistentes em squads/kaizen-v2/scripts/ → ABORTAR instalação"

## Idempotency

This task is SAFE to re-run:
- Hooks: Skip if already registered (check command string before adding)
- Directories: `mkdir -p` is idempotent
- patterns.yaml: Don't overwrite if already has patterns
- Daily: Appends new session block if file exists

## Error Handling

| Error | Action |
|-------|--------|
| `.claude/settings.json` parse error | Show JSON syntax error, ask user to fix, retry |
| Hooks already registered | Skip (log: "Hook already registered") |
| Directory creation fails | Show error, ask user to create manually |
| Script test fails | Show error output, check Node.js version |
| patterns.yaml corrupted | Backup corrupt file, re-initialize with seed |

## Uninstall Reference

To reverse installation, run `/kaizen-v2:*uninstall` which:
1. Removes kaizen-v2 entries from `.claude/settings.json` hooks
2. Preserves all intelligence data (daily/, reflections/, patterns.yaml)
3. Does NOT delete squads/kaizen-v2/ directory
