# Forge Watch — Post-Deploy Monitoring

> Deploy feito não é deploy validado. O Forge acompanha os primeiros minutos.

---

## 1. Post-Deploy Checks

After Phase 5 successfully pushes code and creates a PR, verify the deployment.

### Check 1: CI Status

Run `gh pr checks` via Bash to see if CI pipelines are passing:

```bash
gh pr checks {pr_number} --watch --timeout 30
```

Interpret results:
- All checks passing → `ci_status: "passing"`
- Any check failing → `ci_status: "failing"` + list which checks failed
- Checks still running → `ci_status: "pending"` (waited 30s, still running)

### Check 2: Health Check

If a deploy URL is available (from state.json, project config, or Vercel/Netlify auto-detection):

```
WebFetch {deploy_url} with timeout 10s
```

Interpret results:
- HTTP 200 + response < 2s → `health_check: "healthy"`
- HTTP 200 + response > 2s → `health_check: "slow"` (warning)
- HTTP 4xx/5xx → `health_check: "error"` (critical warning)
- Timeout → `health_check: "timeout"` (critical warning)
- No URL available → `health_check: "skipped"`

### Check 3: Build Verification

Detect deployment platform:
- If `vercel.json` exists: check Vercel deployment status
- If `netlify.toml` exists: check Netlify deployment status
- Otherwise: skip (no automated verification available)

### Check 4: Error Monitoring

If project has error tracking configured:
- Check for Sentry DSN in `.env`, `next.config.js`, or project config
- If found: query for new errors in the last 5 minutes
- If not found: skip

### Display Results

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  👁️ Post-Deploy Watch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  CI Status:     ✅ All checks passing
  Health Check:  ✅ 200 OK (450ms)
  Build:         ✅ Deployed on Vercel
  Errors (5min): ✅ 0 errors detected

  💡 Tudo limpo. Recomendo monitorar por 24h.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Or if issues found:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  👁️ Post-Deploy Watch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  CI Status:     ✅ All checks passing
  Health Check:  ⚠️ Slow response (2.3s)
  Build:         ✅ Deployed on Vercel
  Errors (5min): ⚠️ 2 errors detected
    - TypeError: Cannot read property 'x' of undefined (3 occurrences)
    - NetworkError: fetch failed for /api/users (1 occurrence)

  ⚠️ Deploy feito, mas detectei 2 problemas. Vale investigar:
  - Response time acima de 2s pode indicar query lenta
  - 2 erros no Sentry nos primeiros 5 minutos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Important Rules

- All checks are **INFO-level** — they NEVER block completion
- If a check fails to execute (network error, API unavailable): skip it, note as "unavailable"
- Do NOT retry failed checks — one attempt per check
- Results are saved to `state.json → plugins.forge_watch.report` for future reference
- The forge-memory plugin can use these results as learnings for future runs
