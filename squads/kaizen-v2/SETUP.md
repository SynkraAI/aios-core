# kaizen-v2 Setup Guide

Technical guide for hooks, troubleshooting, and configuration.

## Hook Architecture

### Stop Hook (`stop-capture.cjs`)

**Trigger:** Session exit (Stop event)
**Timeout:** 5 seconds (fail-silent)
**Function:** Capture daily YAML automatically

**Registration:**
```json
{
  "hooks": {
    "Stop": [
      {
        "name": "kaizen-v2-stop-capture",
        "type": "command",
        "command": "node squads/kaizen-v2/scripts/stop-capture.cjs"
      }
    ]
  }
}
```

**How it works:**
1. Session ends (user closes chat or times out)
2. Stop hook fires (async, non-blocking)
3. Reads `git log --since=today`
4. Generates daily/YYYY-MM-DD.yaml
5. Returns context to Claude Code (never crashes)

**Windows-Safe Design:**
- ❌ NO `process.exit()` (cuts stdout on Windows)
- ✅ Uses `timer.unref()` for safety timeout
- ✅ Lets Node exit naturally
- ✅ Works on Windows/macOS/Linux

### SessionStart Hook (`session-briefing.cjs`)

**Trigger:** Session start (SessionStart event)
**Timeout:** 3 seconds (fail-silent)
**Function:** Inject top patterns + recent learnings

**Registration:**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "name": "kaizen-v2-session-briefing",
        "type": "command",
        "command": "node squads/kaizen-v2/scripts/session-briefing.cjs"
      }
    ]
  }
}
```

**How it works:**
1. Session starts
2. SessionStart hook fires (async, 3s timeout)
3. Reads patterns.yaml (top 5 patterns)
4. Reads last 3 dailies (recent learnings)
5. Generates ≤ 2KB briefing
6. Injects into context via additionalContext
7. Session starts with learned patterns visible

## Configuration

### Reflection Schedule

Default: **2am daily** (configurable)
```yaml
schedules:
  overnight_reflect:
    cron: "0 2 * * *"
    timezone: "America/Sao_Paulo"
```

### Forgetting Curve Parameters

```yaml
intelligence:
  decay:
    rate_general: 0.05      # General patterns (60 days to decay)
    rate_verified: 0.025    # Verified patterns (120 days to decay)
    archive_threshold: 0.1  # Archive when decay < 0.1
    delete_threshold: 0.05  # Delete when decay < 0.05
```

## Troubleshooting

> **Nota:** Os comandos abaixo assumem bash/zsh. No Windows, use Git Bash ou WSL.

### Stop Hook Not Running

**Symptom:** No `squads/kaizen-v2/data/intelligence/daily/YYYY-MM-DD.yaml` files created

**Diagnosis:**
```bash
# Check if hook is registered
grep "kaizen-v2-stop-capture" .claude/settings.json

# Check logs
tail -f .aiox/logs/kaizen-stop.log

# Check git availability
git log --since=today
```

**Fix:**
1. Verify `.claude/settings.json` has correct hook entry
2. Check `squads/kaizen-v2/data/intelligence/daily/` directory exists
3. Run `/kaizen-v2:*install` to re-register hooks
4. Check `.aiox/logs/kaizen-stop.log` for error details

### SessionStart Hook Not Injecting Briefing

**Symptom:** No briefing appears at session start

**Diagnosis:**
```bash
# Check hook registration
grep "kaizen-v2-session-briefing" .claude/settings.json

# Check patterns.yaml exists
test -f squads/kaizen-v2/data/intelligence/knowledge/patterns.yaml && echo "OK" || echo "MISSING"

# Check logs
tail -f .aiox/logs/kaizen-session-briefing.log
```

**Fix:**
1. Verify SessionStart hook is registered
2. Ensure patterns.yaml exists: `squads/kaizen-v2/data/intelligence/knowledge/patterns.yaml`
3. Check briefing size: `node squads/kaizen-v2/scripts/session-briefing.cjs | jq -r '.hookSpecificOutput.additionalContext' | wc -c` (should be < 2048 bytes)
4. Run `/kaizen-v2:*health` to verify installation

### Windows Compatibility Issues

**Problem:** Hook output not reaching Claude Code

**Root Cause:** `process.exit()` cuts stdout prematurely on Windows

**Solution:** Both hooks use `timer.unref()` pattern:
```javascript
// ✅ CORRECT
const timer = setTimeout(() => { /* ... */ }, 3000);
timer.unref(); // Don't keep process alive
// Let Node exit naturally

// ❌ WRONG
process.exit(0);  // Cuts stdout on Windows
```

**Verify on Windows:**
```bash
# Test hook directly
node squads/kaizen-v2/scripts/stop-capture.cjs

# Output should be JSON (valid hookEventName + content)
# Should NOT error or hang
```

## Logs

### Log Files

- **Stop hook:** `.aiox/logs/kaizen-stop.log`
- **SessionStart hook:** `.aiox/logs/kaizen-session-briefing.log`
- **General:** Check console output

### Log Levels

- `INFO` — Normal operation
- `WARN` — Non-critical issues (e.g., git not available, timeout)
- `ERROR` — Recoverable errors (file write failed, etc.)

### Example Debug

```bash
# Watch Stop hook logs
tail -f .aiox/logs/kaizen-stop.log

# Watch SessionStart hook logs
tail -f .aiox/logs/kaizen-session-briefing.log

# Clean logs (quarterly)
rm .aiox/logs/kaizen-*.log
```

## Manual Hook Testing

> **Nota:** Os comandos abaixo assumem bash/zsh. No Windows, use Git Bash ou WSL.

### Test Stop Hook

```bash
# Run manually
node squads/kaizen-v2/scripts/stop-capture.cjs

# Should output JSON like:
# {"hookEventName":"Stop","hookSpecificOutput":{"additionalContext":"..."}}

# Check daily file created
ls -la squads/kaizen-v2/data/intelligence/daily/$(date +%Y-%m-%d).yaml
```

### Test SessionStart Hook

```bash
# Run manually
node squads/kaizen-v2/scripts/session-briefing.cjs

# Should output JSON like:
# {"hookEventName":"SessionStart","hookSpecificOutput":{"additionalContext":"..."}}

# Check briefing size (cross-platform)
node squads/kaizen-v2/scripts/session-briefing.cjs | jq -r '.hookSpecificOutput.additionalContext' | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(Buffer.byteLength(d,'utf8')))"
```

## Integration with AIOS/AIOX

### Auto-Detection

`tasks/install.md` detects:
```bash
if [ -d .aiox-core/ ]; then PROJECT_TYPE="aios"
elif [ -d .aiox/ ]; then PROJECT_TYPE="aiox"
else echo "ERROR: Not AIOS or AIOX"; fi
```

### Hook Merge

Hooks are appended to existing `.claude/settings.json`:
```bash
# Reads from: config/config.yaml
# Merges into: .claude/settings.json
# Preserves: All existing hooks (idempotent)
```

### No Core Modifications

- ❌ Does NOT modify `.aiox-core/`
- ❌ Does NOT modify `squads/kaizen/`
- ✅ Only creates/updates `squads/kaizen-v2/`
- ✅ Only appends to `.claude/settings.json` (preserves existing)

## Performance

### Daily Capture Overhead

- **Execution time:** < 500ms typical
- **Network:** git log (local only)
- **Storage:** ~1KB per daily file
- **Total per month:** ~30KB

### SessionStart Briefing Overhead

- **Execution time:** < 100ms typical
- **Size:** ≤ 2KB (compressed)
- **Impact on session start:** Negligible (parallel)

### Disk Usage

```plaintext
squads/kaizen-v2/data/intelligence/
├── daily/           # ~30KB/month (compacts quarterly)
├── reflections/     # ~10KB/month
├── knowledge/       # patterns.yaml ~5-10KB (grows slowly)
└── archive/         # Grows if many patterns archived

Total: ~100-200KB/year (manageable)
```

## Backup & Recovery

### Backup patterns.yaml

Automatically created before archive/delete:
```bash
# Quarterly backup
cp squads/kaizen-v2/data/intelligence/knowledge/patterns.yaml \
   squads/kaizen-v2/data/intelligence/knowledge/patterns.yaml.bak.$(date +%Y-%m-%d)
```

### Restore patterns.yaml

```bash
# If corrupted, restore from backup
cp squads/kaizen-v2/data/intelligence/knowledge/patterns.yaml.bak.YYYY-MM-DD \
   squads/kaizen-v2/data/intelligence/knowledge/patterns.yaml
```

### Restore from Git

If intelligence data is in git:
```bash
# Restore entire directory
git restore squads/kaizen-v2/data/intelligence/

# Or specific file
git restore squads/kaizen-v2/data/intelligence/knowledge/patterns.yaml
```

## Maintenance

### Weekly

- Check `/kaizen-v2:*health` (all systems operational)
- Review `.aiox/logs/kaizen-*.log` for WARN/ERROR

### Monthly

- Run `/kaizen-v2:*report monthly` (learnings summary)
- Review top patterns (decay_score > 0.8)

### Quarterly

- Run `/kaizen-v2:*archive` (cleanup + rotation)
- Backup patterns.yaml.bak files
- Review archived patterns (decay < 0.1)

## Customization

### Change Reflection Time

In `config/config.yaml`:
```yaml
schedules:
  overnight_reflect:
    cron: "0 2 * * *"  # Change "2" to desired hour (0-23)
```

### Change Decay Rates

In `config/config.yaml`:
```yaml
intelligence:
  decay:
    rate_general: 0.05      # Lower = slower fade
    rate_verified: 0.025    # Change ratio
```

### Change Briefing Size

In `scripts/session-briefing.cjs`:
```javascript
max_briefing_bytes: 2048,  // In bytes; increase if needed
max_patterns: 5,           // Reduce if too much context
```

---

**Last Updated:** 2026-03-12 | **Status:** Production Ready
