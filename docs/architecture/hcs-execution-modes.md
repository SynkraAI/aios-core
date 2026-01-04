# HCS Execution Modes Specification

**Version:** 1.0
**Status:** Proposed
**Created:** 2025-12-30
**Story:** HCS-1 Investigation
**Author:** @architect (Aria) via @dev (Dex)

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Research Findings](#research-findings)
- [Execution Mode Comparison Matrix](#execution-mode-comparison-matrix)
- [Recommended Configuration](#recommended-configuration)
- [Mode Specifications](#mode-specifications)
- [Implementation Guidelines](#implementation-guidelines)

---

## Executive Summary

This document defines the execution modes for the AIOS Health Check System (HCS), based on industry best practices research from Kubernetes, VS Code, Terraform, npm/yarn, and CLI "doctor" patterns (Flutter, Homebrew, WP-CLI).

### Key Recommendations

1. **Primary Mode:** Manual on-demand (`*health-check` command)
2. **Secondary Mode:** Scheduled CI integration (post-merge trigger)
3. **Optional Mode:** IDE background checks (for power users)
4. **NOT Recommended:** Pre-commit hooks (too slow, creates friction)

---

## Research Findings

### Industry Patterns Analyzed

| System                      | Health Check Pattern                     | Trigger                 | Key Insight                                         |
| --------------------------- | ---------------------------------------- | ----------------------- | --------------------------------------------------- |
| **Kubernetes**              | Liveness/Readiness/Startup probes        | Periodic (configurable) | Differentiate between "alive" and "ready to serve"  |
| **VS Code**                 | Extension bisect, installation integrity | On-demand + background  | Isolation prevents cascading failures               |
| **Terraform**               | `terraform plan` drift detection         | Manual + CI scheduled   | Detect vs. remediate are separate steps             |
| **npm/yarn**                | Lockfile integrity, `npm audit`          | On install + manual     | Cryptographic hashes prevent tampering              |
| **Flutter/Homebrew doctor** | CLI `doctor` command                     | On-demand               | Categorized output (✅ ⚠️ ❌) with actionable fixes |

### Key Lessons Learned

1. **Kubernetes Probe Pattern:**
   - Liveness: "Is it alive?" → Restart if dead
   - Readiness: "Can it serve traffic?" → Remove from load balancer if not ready
   - Startup: "Has it finished starting?" → Disable other probes until ready
   - **Applicable to HCS:** Use different check categories with appropriate severity levels

2. **VS Code Extension Pattern:**
   - Extensions run in isolated process → failure doesn't crash VS Code
   - Background integrity checks detect corrupted installations
   - Malicious extensions are auto-removed via block list
   - **Applicable to HCS:** Self-healing should not risk system stability

3. **Terraform Drift Pattern:**
   - `terraform plan` detects drift without modifying
   - Remediation is a separate `terraform apply` step
   - Scheduled plans in CI provide continuous monitoring
   - **Applicable to HCS:** Detection and remediation should be separate, controllable steps

4. **npm/yarn Integrity Pattern:**
   - Cryptographic hashes in lockfile verify package integrity
   - `npm audit` runs separately from install
   - `--update-checksums` allows controlled recovery
   - **Applicable to HCS:** Backups before any self-healing modification

5. **CLI Doctor Pattern (Flutter, Homebrew, WP-CLI):**
   - On-demand execution, not blocking workflows
   - Categorized output: success, warning, error
   - Actionable suggestions with copy-paste commands
   - Extensible via custom checks (WP-CLI `doctor.yml`)
   - **Applicable to HCS:** Primary execution model

---

## Execution Mode Comparison Matrix

| Mode                         | Trigger            | Duration | UX Impact             | Use Case               | Recommendation      |
| ---------------------------- | ------------------ | -------- | --------------------- | ---------------------- | ------------------- |
| **Manual** (`*health-check`) | User command       | 10-60s   | None (user-initiated) | On-demand diagnosis    | ✅ **Primary**      |
| **Pre-commit hook**          | `git commit`       | 10-30s   | High friction         | Catch issues early     | ❌ Not recommended  |
| **Post-commit hook**         | After commit       | 10-60s   | Medium friction       | Local validation       | ⚠️ Optional         |
| **Scheduled CI**             | Cron/workflow      | 60-300s  | None                  | Continuous monitoring  | ✅ **Secondary**    |
| **Post-merge trigger**       | PR merge           | 60-120s  | None                  | Post-change validation | ✅ **Tertiary**     |
| **IDE background**           | File save/interval | 5-15s    | Subtle indicators     | Real-time feedback     | ⚠️ Power users only |
| **On install/bootstrap**     | `npx aios install` | 60-120s  | Expected              | Setup validation       | ✅ **Required**     |

### Detailed Evaluation

#### ✅ Manual (`*health-check`) - PRIMARY

**Pros:**

- User-controlled, no workflow friction
- Full diagnostic capability
- Supports all modes (quick, full, domain-specific)
- Follows Flutter/Homebrew doctor pattern

**Cons:**

- May be forgotten
- Reactive rather than proactive

**Verdict:** Primary execution mode. Always available via `*health-check` command.

#### ❌ Pre-commit Hook - NOT RECOMMENDED

**Pros:**

- Catches issues before commit
- Immediate feedback

**Cons:**

- 10-30s delay on every commit is unacceptable
- Developers will bypass with `--no-verify`
- Creates friction in fast-paced development
- Kubernetes lesson: Don't mix "liveness" with "readiness"

**Verdict:** Do not implement. Pre-commit should be reserved for fast checks (<5s).

#### ⚠️ Post-commit Hook - OPTIONAL

**Pros:**

- Non-blocking (runs after commit)
- Local feedback loop

**Cons:**

- Still adds delay to workflow
- Results may be ignored
- No ability to prevent bad commits

**Verdict:** Optional for power users. Not enabled by default.

#### ✅ Scheduled CI - SECONDARY

**Pros:**

- Continuous monitoring without developer friction
- Terraform pattern: "terraform plan" on schedule
- Catches drift over time
- Historical trend data

**Cons:**

- Delayed feedback
- Requires CI infrastructure

**Verdict:** Recommended secondary mode. Daily scheduled run in CI.

**Example GitHub Actions workflow:**

```yaml
name: Health Check (Scheduled)
on:
  schedule:
    - cron: '0 6 * * *' # Daily at 6 AM
  workflow_dispatch: # Manual trigger

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx aios health-check --mode=full --report
      - uses: actions/upload-artifact@v4
        with:
          name: health-report
          path: .aios/reports/health-check-*.md
```

#### ✅ Post-merge Trigger - TERTIARY

**Pros:**

- Smart timing: after changes land
- Non-blocking for PR author
- Validates integration health

**Cons:**

- Delayed feedback
- May miss issues in development

**Verdict:** Recommended for main branch. Triggers after PR merge.

#### ⚠️ IDE Background - POWER USERS ONLY

**Pros:**

- Real-time feedback
- Best possible UX when working

**Cons:**

- Complex to implement
- May impact IDE performance
- VS Code lesson: Extension isolation is crucial

**Verdict:** Optional for power users. Requires careful implementation to avoid performance issues.

#### ✅ On Install/Bootstrap - REQUIRED

**Pros:**

- Validates environment is correctly set up
- First-run experience
- Catches missing dependencies immediately

**Cons:**

- One-time only

**Verdict:** Required. Part of `npx aios install` and `*bootstrap-setup`.

---

## Recommended Configuration

### Default Configuration

```yaml
# .aios-core/core-config.yaml
healthCheck:
  enabled: true

  modes:
    # Primary: Manual on-demand
    manual:
      enabled: true
      command: '*health-check'
      defaultMode: 'quick' # quick | full | domain
      autoFix: true # Enable self-healing by default

    # Secondary: Scheduled CI
    scheduled:
      enabled: true
      frequency: 'daily' # daily | weekly | on-push
      ciProvider: 'github-actions' # github-actions | gitlab-ci | none
      mode: 'full'
      reportArtifact: true

    # Tertiary: Post-merge
    postMerge:
      enabled: true
      branches: ['main', 'develop']
      mode: 'quick'

    # Optional: IDE background
    ideBackground:
      enabled: false # Opt-in only
      interval: 300 # seconds (5 minutes)
      mode: 'quick'

    # Optional: Post-commit
    postCommit:
      enabled: false # Opt-in only
      mode: 'quick'

    # Required: On install
    onInstall:
      enabled: true
      mode: 'full'
      failOnCritical: true

  performance:
    quickModeTimeout: 10 # seconds
    fullModeTimeout: 60 # seconds
    parallelChecks: true
    cacheResults: true
    cacheTTL: 300 # seconds
```

### Mode Configuration

| Configuration       | Quick Mode      | Full Mode      | Domain Mode              |
| ------------------- | --------------- | -------------- | ------------------------ |
| **Checks executed** | Critical only   | All checks     | Specific domain          |
| **Target duration** | <10 seconds     | <60 seconds    | <30 seconds              |
| **Self-healing**    | Tier 1 only     | All tiers      | Domain-specific          |
| **Report detail**   | Summary         | Full report    | Domain report            |
| **Use case**        | Fast validation | Deep diagnosis | Targeted troubleshooting |

---

## Mode Specifications

### 1. Manual Mode (`*health-check`)

```bash
# Quick check (default)
*health-check

# Full comprehensive check
*health-check --mode=full

# Domain-specific check
*health-check --domain=repository

# Disable self-healing
*health-check --no-fix

# Generate report only
*health-check --report-only
```

**Parameters:**

| Parameter            | Values                                 | Default | Description                |
| -------------------- | -------------------------------------- | ------- | -------------------------- |
| `--mode`             | quick, full, domain                    | quick   | Check thoroughness         |
| `--domain`           | project, local, repo, deploy, services | all     | Domain filter              |
| `--fix` / `--no-fix` | boolean                                | true    | Enable self-healing        |
| `--report`           | boolean                                | true    | Generate markdown report   |
| `--json`             | boolean                                | false   | Output JSON for automation |
| `--verbose`          | boolean                                | false   | Show detailed output       |

### 2. Scheduled CI Mode

**GitHub Actions Integration:**

```yaml
# .github/workflows/health-check.yml
name: AIOS Health Check

on:
  schedule:
    - cron: '0 6 * * *' # 6 AM UTC daily
  workflow_dispatch:
    inputs:
      mode:
        description: 'Check mode'
        required: false
        default: 'full'
        type: choice
        options:
          - quick
          - full

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Run Health Check
        run: |
          npx aios health-check \
            --mode=${{ inputs.mode || 'full' }} \
            --report \
            --json

      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: health-check-report-${{ github.run_id }}
          path: .aios/reports/

      - name: Post to Slack (on failure)
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "⚠️ AIOS Health Check Failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "Health check detected issues. <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Report>"
                  }
                }
              ]
            }
```

### 3. Post-Merge Trigger

```yaml
# Add to existing CI workflow
on:
  push:
    branches: [main, develop]

jobs:
  post-merge-health:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx aios health-check --mode=quick
```

### 4. IDE Background Mode (Optional)

**VS Code Integration (future):**

```json
// .vscode/settings.json
{
  "aios.healthCheck.enabled": true,
  "aios.healthCheck.interval": 300,
  "aios.healthCheck.mode": "quick",
  "aios.healthCheck.showNotifications": true
}
```

**Status Bar Indicator:**

- 🟢 Healthy (score > 80)
- 🟡 Degraded (score 50-80)
- 🔴 Unhealthy (score < 50)

---

## Implementation Guidelines

### Priority Order

1. **Phase 1 (HCS-2):** Manual mode + On-install mode
2. **Phase 2 (HCS-3):** Scheduled CI integration
3. **Phase 3 (Future):** IDE background mode, post-commit hooks

### Performance Targets

| Mode   | Target Duration | Maximum Duration |
| ------ | --------------- | ---------------- |
| Quick  | 5 seconds       | 10 seconds       |
| Full   | 30 seconds      | 60 seconds       |
| Domain | 10 seconds      | 30 seconds       |

### Caching Strategy

Based on Terraform pattern:

```javascript
// Cache expensive checks
const checkCache = new Map();
const CACHE_TTL = 300000; // 5 minutes

async function runCheck(check) {
  const cacheKey = `${check.id}-${check.inputs.hash}`;
  const cached = checkCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  const result = await check.execute();
  checkCache.set(cacheKey, { result, timestamp: Date.now() });
  return result;
}
```

### Parallel Execution

Based on Kubernetes pattern (run independent checks concurrently):

```javascript
// Group checks by dependency
const checkGroups = [
  ['project', 'local'], // Independent, run in parallel
  ['repository', 'services'], // Independent, run in parallel
  ['deploy'], // May depend on others
];

async function runAllChecks() {
  const results = {};

  for (const group of checkGroups) {
    const groupResults = await Promise.all(group.map((domain) => runDomainChecks(domain)));
    Object.assign(results, ...groupResults);
  }

  return results;
}
```

---

## Related Documents

- [ADR: HCS Architecture](./adr/adr-hcs-health-check-system.md)
- [HCS Self-Healing Specification](./hcs-self-healing-spec.md)
- [HCS Check Specifications](./hcs-check-specifications.md)
- [Story HCS-1: Investigation](../stories/epics/epic-health-check-system/story-hcs-1-investigation.md)
- [Story HCS-2: Implementation](../stories/epics/epic-health-check-system/story-hcs-2-implementation.md)

---

## Research Sources

- [Kubernetes Health Probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)
- [Terraform Drift Detection](https://developer.hashicorp.com/terraform/tutorials/state/resource-drift)
- [npm Lockfile Integrity](https://medium.com/node-js-cybersecurity/lockfile-poisoning-and-how-hashes-verify-integrity-in-node-js-lockfiles)
- [VS Code Extension Health](https://code.visualstudio.com/blogs/2021/02/16/extension-bisect)
- [Flutter Doctor Pattern](https://quickcoder.org/flutter-doctor/)
- [WP-CLI Doctor Command](https://github.com/wp-cli/doctor-command)

---

_Document created as part of Story HCS-1 Investigation_
