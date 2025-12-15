# CodeRabbit Integration Decisions

**Document ID:** ADR-CODERABBIT-001
**Status:** Approved
**Story:** [6.3.3 - CodeRabbit Self-Healing Integration](../stories/6.3.3-coderabbit-self-healing-integration.md)
**Created:** 2025-11-28
**Author:** @architect (Aria)

---

## Executive Summary

This document captures the architectural decisions for integrating CodeRabbit self-healing loops into AIOS agent workflows. The investigation revealed that **CodeRabbit configuration already exists** in all three main agents (@dev, @qa, @devops), but **self-healing loops are NOT implemented** in task definitions.

---

## 1. Integration Point Map

### 1.1 Current State Analysis

| Component | File | CodeRabbit Config | Self-Healing | Gap |
|-----------|------|-------------------|--------------|-----|
| **@dev (Dex)** | `.aios-core/agents/dev.md` | ✅ Has config | ❌ Not implemented | Need task step |
| **@qa (Quinn)** | `.aios-core/agents/qa.md` | ✅ Has config | ❌ Not implemented | Need full loop |
| **@devops (Gage)** | `.aios-core/agents/devops.md` | ✅ Has config | ✅ Implemented | None - complete |
| **dev-develop-story** | `.aios-core/tasks/dev-develop-story.md` | ❌ No reference | ❌ No steps | Need integration |
| **qa-review-story** | `.aios-core/tasks/qa-review-story.md` | ❌ No reference | ❌ No steps | Need full loop |
| **pre-push-quality-gate** | `.aios-core/tasks/github-devops-pre-push-quality-gate.md` | ✅ Complete | ✅ Complete | None |

### 1.2 Integration Points by Agent

#### @dev Agent Integration Points

| Integration Point | Task | When | Severity | Iterations |
|-------------------|------|------|----------|------------|
| Story Completion | `*develop` | Before "Ready for Review" | CRITICAL only | 1-2 |

**Current Config in dev.md:**
```yaml
coderabbit_integration:
  enabled: true
  installation_mode: wsl
  workflow: |
    Before marking story "Ready for Review":
    1. Run: wsl bash -c 'cd ... && ~/.local/bin/coderabbit --prompt-only -t uncommitted'
    2. Fix CRITICAL issues immediately
    3. Document HIGH issues in story Dev Notes
    4. MEDIUM/LOW issues optional to fix
```

**Gap:** Task `dev-develop-story.md` does NOT reference this workflow.

#### @qa Agent Integration Points

| Integration Point | Task | When | Severity | Iterations |
|-------------------|------|------|----------|------------|
| Story Review | `*review` | During QA review | CRITICAL + HIGH | 3 (max) |

**Current Config in qa.md:**
```yaml
coderabbit_integration:
  enabled: true
  severity_handling:
    CRITICAL: Block story completion, must fix immediately
    HIGH: Report in QA gate, recommend fix before merge
    MEDIUM: Document as technical debt, create follow-up issue
    LOW: Optional improvements, note in review
  commands:
    qa_pre_review_uncommitted: "wsl bash -c 'cd ... && ~/.local/bin/coderabbit --prompt-only -t uncommitted'"
    qa_story_review_committed: "wsl bash -c 'cd ... && ~/.local/bin/coderabbit --prompt-only -t committed --base main'"
```

**Gap:** Task `qa-review-story.md` does NOT implement self-healing loop.

#### @devops Agent Integration Points

| Integration Point | Task | When | Severity | Iterations |
|-------------------|------|------|----------|------------|
| Pre-Push | `*pre-push` | Before push to remote | All (report) | 0 (check only) |
| Create PR | `*create-pr` | After PR creation | N/A | N/A |

**Current State:** COMPLETE - `github-devops-pre-push-quality-gate.md` has full implementation with:
- `runCodeRabbitReview()` function
- `parseCodeRabbitOutput()` function
- `determineCodeRabbitGate()` function
- Severity-based blocking (CRITICAL=FAIL, HIGH=CONCERNS, others=PASS)

---

## 2. Self-Healing Placement Decision

### 2.1 Decision: Hybrid Approach

**APPROVED**: Use differentiated self-healing based on agent role.

| Agent | Self-Healing Type | Rationale |
|-------|-------------------|-----------|
| @dev | **Light** (1-2 iterations) | Focus on development, not extensive review |
| @qa | **Full** (3 iterations) | Quality is @qa's primary responsibility |
| @devops | **Check Only** (0 iterations) | Final gate, not the place for fixes |

### 2.2 Self-Healing Matrix (Final)

```yaml
self_healing_matrix:
  dev:
    enabled: true
    type: light
    max_iterations: 2
    timeout_minutes: 15
    trigger: story_completion
    severity_filter:
      - CRITICAL
    behavior:
      CRITICAL: auto_fix
      HIGH: document_only
      MEDIUM: ignore
      LOW: ignore

  qa:
    enabled: true
    type: full
    max_iterations: 3
    timeout_minutes: 30
    trigger: review_start
    severity_filter:
      - CRITICAL
      - HIGH
    behavior:
      CRITICAL: auto_fix
      HIGH: auto_fix
      MEDIUM: document_as_debt
      LOW: ignore

  devops:
    enabled: true
    type: check_only
    max_iterations: 0
    timeout_minutes: 15
    trigger: pre_push
    severity_filter:
      - CRITICAL
      - HIGH
      - MEDIUM
      - LOW
    behavior:
      CRITICAL: block_push
      HIGH: warn_continue
      MEDIUM: report_only
      LOW: report_only
```

---

## 3. Severity Handling Decision

### 3.1 Decision: Severity Varies by Agent

**APPROVED**: Each agent handles severity differently based on their role.

### 3.2 Severity Handling Matrix

| Severity | @dev Behavior | @qa Behavior | @devops Behavior |
|----------|---------------|--------------|------------------|
| **CRITICAL** | Auto-fix immediately | Auto-fix (3 attempts) | BLOCK push |
| **HIGH** | Document in story | Auto-fix (3 attempts) | WARN, ask user |
| **MEDIUM** | Ignore | Create tech debt issue | Report only |
| **LOW** | Ignore | Note in review | Report only |

### 3.3 Rationale

1. **CRITICAL issues** are security vulnerabilities or breaking bugs - must be fixed everywhere
2. **HIGH issues** represent significant quality problems - @qa owns fixing, @dev just documents
3. **MEDIUM issues** are tech debt - @qa tracks, others ignore
4. **LOW issues** are "nits" - never auto-fix, only report in final gate

---

## 4. WSL Command Patterns

### 4.1 Standard Command Template

```bash
wsl bash -c 'cd /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack && ~/.local/bin/coderabbit --prompt-only -t {target}'
```

### 4.2 Target Options

| Target | Use Case | When |
|--------|----------|------|
| `uncommitted` | Check unstaged changes | Before commit |
| `committed` | Check committed changes | After commit |
| `--base main` | Compare against main branch | Pre-PR review |

### 4.3 Timeout Configuration

| Agent | Timeout | Rationale |
|-------|---------|-----------|
| @dev | 15 min | Quick feedback during development |
| @qa | 30 min | Full review may take longer |
| @devops | 15 min | Gate check, not full review |

---

## 5. Implementation Tasks

### 5.1 Required Updates

| File | Update Type | Priority |
|------|-------------|----------|
| `dev-develop-story.md` | Add self-healing step | HIGH |
| `qa-review-story.md` | Add full self-healing loop | HIGH |
| `dev.md` agent | Add iteration config | MEDIUM |
| `qa.md` agent | Add iteration config | MEDIUM |

### 5.2 No Updates Needed

| File | Reason |
|------|--------|
| `devops.md` agent | Already has complete config |
| `github-devops-pre-push-quality-gate.md` | Already implemented |

---

## 6. Self-Healing Loop Pseudocode

### 6.1 @dev Light Self-Healing

```
function devSelfHealing(storyPath):
  iteration = 0
  max_iterations = 2

  while iteration < max_iterations:
    result = runCodeRabbit("uncommitted")
    issues = parseIssues(result)

    critical = issues.filter(s => s.severity == "CRITICAL")

    if critical.length == 0:
      log("✅ No CRITICAL issues - ready for review")
      return SUCCESS

    if iteration == max_iterations - 1:
      log("❌ CRITICAL issues remain after max iterations")
      return BLOCKED

    for issue in critical:
      attemptAutoFix(issue)

    iteration++

  return BLOCKED
```

### 6.2 @qa Full Self-Healing

```
function qaSelfHealing(storyPath):
  iteration = 0
  max_iterations = 3

  while iteration < max_iterations:
    result = runCodeRabbit("committed --base main")
    issues = parseIssues(result)

    critical = issues.filter(s => s.severity == "CRITICAL")
    high = issues.filter(s => s.severity == "HIGH")
    medium = issues.filter(s => s.severity == "MEDIUM")

    if critical.length == 0 && high.length == 0:
      if medium.length > 0:
        createTechDebtIssues(medium)
      log("✅ QA passed - no CRITICAL/HIGH issues")
      return SUCCESS

    if iteration == max_iterations - 1:
      log("❌ Issues remain after max iterations")
      return BLOCKED

    for issue in critical.concat(high):
      attemptAutoFix(issue)

    iteration++

  return BLOCKED
```

---

## 7. Decision Rationale Summary

| Decision | Rationale |
|----------|-----------|
| Hybrid self-healing | Different agents have different responsibilities |
| @dev light (1-2 iter) | Keep development flow fast, catch critical only |
| @qa full (3 iter) | Quality gate is @qa's job, thorough review |
| @devops check-only | Final gate, not appropriate for fixes |
| Severity varies | Each agent's role determines handling |
| WSL execution | CodeRabbit installed in WSL, not Windows |
| 15-30 min timeouts | CodeRabbit reviews can be slow (7-30 min) |

---

## 8. Related Documents

- [Story 6.3.3](../stories/6.3.3-coderabbit-self-healing-integration.md)
- [Epic 6.3: CodeRabbit Integration](../epics/epic-6.3-coderabbit-integration.md)
- [CodeRabbit Integration Guide](../guides/coderabbit/coderabbit-integration-guide.md)
- [CodeRabbit Workflows](../guides/coderabbit/coderabbit-workflows.md)

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-28 | 1.0 | Initial decision document | @architect (Aria) |
