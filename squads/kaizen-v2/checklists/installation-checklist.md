# Installation Checklist

**Workflow:** wf-install.yaml | **Executor:** kaizen-chief | **Command:** *install

## Pre-Flight Checks

- [ ] 1. AIOS or AIOX project detected (.aiox-core/ or .aiox/ exists)
- [ ] 2. squads/kaizen-v2/ directory exists and complete
- [ ] 3. Write permissions on project root verified
- [ ] 4. No existing kaizen-v2 installation (idempotent check)

## Hook Registration

- [ ] 5. .claude/settings.json readable (or created if missing)
- [ ] 6. Stop hook (kaizen-v2-stop-capture) registered in Stop
- [ ] 7. SessionStart hook (kaizen-v2-session-briefing) registered in SessionStart
- [ ] 8. Hook command paths valid and executable
- [ ] 9. Timeout values configured (Stop: 3s, SessionStart: 1s)
- [ ] 10. Backup of settings.json created before merge

## Directory Initialization

- [ ] 11. data/intelligence/daily/ created
- [ ] 12. data/intelligence/reflections/ created
- [ ] 13. data/intelligence/knowledge/ created
- [ ] 14. data/intelligence/archive/ created
- [ ] 15. All directories writable and tracked (.gitkeep files)

## First Capture & Briefing

- [ ] 16. patterns.yaml template copied to data/intelligence/knowledge/
- [ ] 17. First daily capture executed (data/intelligence/daily/YYYY-MM-DD.yaml created)
- [ ] 18. SessionStart hook briefing tested (generates <2KB output)

## Health Check

- [ ] 19. health-check task runs cleanly (all 12 checks pass or have remediation)
- [ ] 20. Installation report generated with status: SUCCESS
- [ ] 21. User can run `/kaizen-v2:*health` immediately (green status)
- [ ] 22. User can run `/kaizen-v2:*capture` manually (works without error)

---

**Result:** PASS (All 22 items) | PASS WITH WARNINGS (20+) | FAIL (< 20)

**Success Criteria:**
- Overall installation time: < 5 minutes
- User can interact with kaizen-v2 immediately after
- Intelligence data structure ready for daily captures

**Remediation Guide:**
| Check | Failure | Action |
|-------|---------|--------|
| 6-9 | Hook registration failed | Re-run *install (idempotent) |
| 11-15 | Dir creation failed | `mkdir -p` manually + retry |
| 16-18 | First capture failed | Run `/kaizen-v2:*capture` manually |
| 19-22 | Health check fails | Run `/kaizen-v2:*health` for remediation steps |
