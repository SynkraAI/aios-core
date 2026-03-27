---
task:
  name: health-check
  status: SPEC_DEFINED
  version: 1.0.0
  responsible_executor: memory-keeper
  execution_type: MANUAL (*health)
  trigger: User runs `/kaizen-v2:*health`
---

# health-check

## Task Anatomy

### Input
- `.claude/settings.json` (verify hook registration)
- `data/intelligence/` directory structure
- `data/intelligence/knowledge/patterns.yaml` (validate schema)
- Git log (check daily capture activity)

### Output
- Health check report with 12 checklist items
- Status: PASS (all green) | WARN (some yellow) | FAIL (any red)
- Actionable remediation steps for any failures

### Acceptance Criteria
- [ ] All 12 checklist items verified
- [ ] Each check runs without error
- [ ] Report clearly indicates pass/fail/warn for each item
- [ ] Remediation steps provided for any failures
- [ ] Overall status: PASS, WARN, or FAIL

### Dependencies
- `.claude/settings.json` accessible
- `data/intelligence/` directories accessible
- Git available (for activity check)

---

## Detailed Specification

### 12-Point Health Checklist

#### Hooks (3 checks)

**1. Stop Hook Registered**
```
Check: Grep .claude/settings.json for "kaizen-v2-stop-capture"
Result:
  - PASS: Hook found in PreToolUse
  - FAIL: Hook not found
  - WARN: Hook present but command path wrong
Remediation:
  - FAIL: Run */install again
  - WARN: Fix command path in .claude/settings.json
```

**2. SessionStart Hook Registered**
```
Check: Grep .claude/settings.json for "kaizen-v2-session-briefing"
Result:
  - PASS: Hook found in SessionStart
  - FAIL: Hook not found
  - WARN: Hook present but timeout wrong
Remediation:
  - FAIL: Run */install again
  - WARN: Verify timeout_ms = 1000 in hook config
```

**3. Hook Commands Executable**
```
Check: test -x squads/kaizen-v2/scripts/stop-capture.cjs && test -x squads/kaizen-v2/scripts/session-briefing.cjs
Result:
  - PASS: Both scripts exist and executable
  - FAIL: Scripts missing
  - WARN: Scripts exist but not executable
Remediation:
  - FAIL: Check squads/kaizen-v2/scripts/ exists
  - WARN: chmod +x squads/kaizen-v2/scripts/*.cjs
```

#### Directories (3 checks)

**4. Intelligence Directory Structure**
```
Check: ls data/intelligence/{daily,reflections,knowledge,archive}
Result:
  - PASS: All 4 dirs exist
  - FAIL: One or more missing
Remediation:
  - FAIL: mkdir -p data/intelligence/{daily,reflections,knowledge,archive}
```

**5. Knowledge Directory Valid**
```
Check: test -f data/intelligence/knowledge/patterns.yaml && yaml_valid(patterns.yaml)
Result:
  - PASS: patterns.yaml exists and valid YAML
  - FAIL: File missing
  - WARN: File exists but invalid YAML
Remediation:
  - FAIL: cp squads/kaizen-v2/data/intelligence/knowledge/patterns.yaml data/intelligence/knowledge/
  - WARN: Fix YAML syntax in patterns.yaml
```

**6. Daily Directory Not Empty**
```
Check: find data/intelligence/daily -type f | wc -l
Result:
  - PASS: Has >= 1 daily file
  - WARN: No daily files (first time is OK, otherwise capture missing)
Remediation:
  - WARN (after 1 week): Run */capture to generate daily file
```

#### Data Integrity (3 checks)

**7. patterns.yaml Schema Valid**
```
Check: yaml_parse(patterns.yaml) && check_required_fields(patterns, metadata)
Result:
  - PASS: Schema valid, all patterns have required fields
  - FAIL: Schema broken or missing required fields
Remediation:
  - FAIL: Restore from backup or reinit: */uninstall then */install
```

**8. Decay Scores Reasonable**
```
Check: For each pattern, 0.0 <= decay_score <= 1.0
Result:
  - PASS: All scores in valid range
  - FAIL: Score out of range (indicates corruption)
Remediation:
  - FAIL: Run */archive (recalculates decay) or restore from backup
```

**9. Last Daily Not Stale**
```
Check: mtime(latest data/intelligence/daily/YYYY-MM-DD.yaml) > now - 24h
Result:
  - PASS: Last daily captured within 24 hours
  - WARN: Last daily > 24h old (Stop hook may not be running)
  - FAIL: No daily files (check >= 1 week)
Remediation:
  - WARN: Verify Stop hook in .claude/settings.json + check .aios/logs/
  - FAIL: Run */capture manually
```

#### Git Integration (2 checks)

**10. Git Activity Detected**
```
Check: git log --since="1 week ago" | wc -l
Result:
  - PASS: >= 1 commit this week
  - WARN: No commits (may be inactive project)
Remediation:
  - WARN: Normal if project is paused; continue monitoring
```

**11. Kaizen-v2 Commit History**
```
Check: git log --grep="kaizen-v2" | wc -l
Result:
  - PASS: >= 1 kaizen-v2 related commit
  - WARN: No kaizen-v2 commits (squads/kaizen-v2/ may not be tracked)
Remediation:
  - WARN: Check git status squads/kaizen-v2/ — should be tracked in repo
```

#### Configuration (1 check)

**12. Config File Accessible**
```
Check: test -f squads/kaizen-v2/config/config.yaml && yaml_valid(config.yaml)
Result:
  - PASS: config.yaml exists and valid YAML
  - FAIL: File missing or invalid
Remediation:
  - FAIL: Ensure squads/kaizen-v2/ copied completely
```

### Health Report Output Format
```markdown
# Kaizen-v2 Health Check — YYYY-MM-DD HH:MM:SS

## Summary
Overall Status: PASS | WARN | FAIL
Checks Passed: 12/12 | 11/12 | 10/12
Last Updated: YYYY-MM-DD

## Detailed Results

### Hooks (3/3)
- [x] Stop Hook Registered — PASS
- [x] SessionStart Hook Registered — PASS
- [x] Hook Commands Executable — PASS

### Directories (3/3)
- [x] Intelligence Structure — PASS
- [x] Knowledge Directory Valid — PASS
- [x] Daily Directory Not Empty — WARN: Only 1 file (first capture OK)

### Data Integrity (3/3)
- [x] patterns.yaml Schema — PASS
- [x] Decay Scores Reasonable — PASS
- [x] Last Daily Not Stale — PASS (captured 2h ago)

### Git Integration (2/2)
- [x] Git Activity Detected — PASS (5 commits this week)
- [x] Kaizen-v2 Commits — PASS (1 commit)

### Configuration (1/1)
- [x] Config File Accessible — PASS

## Remediation Steps
None — all systems operational.

## Recommendations
- Next reflect: 2026-03-12 02:00 (scheduled)
- Next archive: 2026-06-11 (quarterly)
- Active patterns: 2 (both fresh, decay > 0.8)
```

## Veto Conditions
- "Relatório de saúde marcado como PASS com ≥1 check FAIL → BLOQUEAR (PASS exige 12/12 checks verdes)"
- "Check de hook marcado PASS sem verificar que o command path existe no filesystem → REDO check"
- "Status WARN emitido sem remediation steps correspondentes → BLOQUEAR publicação"
- "patterns.yaml reportado como válido sem verificar que decay_scores estão no range 0.0-1.0 → REDO check 8"

## Success Criteria
- PASS: All 12 checks pass, overall status = PASS
- WARN: 1-2 checks warn (non-critical), overall status = WARN, remediation provided
- FAIL: 3+ checks fail OR any critical failure, overall status = FAIL, clear fixes provided

## Error Handling
- If check throws error: Mark as ERROR (not FAIL), log exception + continue other checks
- If file read fails: Retry once, then mark FAIL
- If git unavailable: Skip git checks (mark as N/A, not FAIL)
