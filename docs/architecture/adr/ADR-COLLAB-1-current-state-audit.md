# ADR-COLLAB-1: Current State Audit - Branch Protection & Contributor Workflow

**Story:** COLLAB-1
**Date:** 2025-12-30
**Status:** Accepted
**Author:** @devops (Gage)

---

## Context

A community user made improvements to the `@data-engineer` agent. This audit documents the current repository security configuration to identify gaps that could allow unauthorized modifications to the main branch.

---

## Decision

Audit the current state of:

1. Branch protection rules
2. GitHub Actions workflows
3. CODEOWNERS configuration
4. Required status checks

---

## Current State

### 1. Branch Protection Settings

**Source:** `gh api repos/SynkraAI/aios-core/branches/main/protection`

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build", "lint", "typecheck"]
  },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": false,
    "required_approving_review_count": 0
  },
  "required_signatures": {
    "enabled": false
  },
  "enforce_admins": {
    "enabled": false
  },
  "required_linear_history": {
    "enabled": false
  },
  "allow_force_pushes": {
    "enabled": false
  },
  "allow_deletions": {
    "enabled": false
  },
  "required_conversation_resolution": {
    "enabled": false
  }
}
```

### 2. Repository Settings

**Source:** `gh api repos/SynkraAI/aios-core`

```json
{
  "name": "aios-core",
  "default_branch": "main",
  "visibility": "public",
  "allow_forking": true,
  "has_discussions": true,
  "has_issues": true,
  "has_projects": true,
  "has_wiki": true
}
```

### 3. GitHub Actions Workflows

**Source:** `gh api repos/SynkraAI/aios-core/actions/workflows`

| Workflow                 | State  | Path                                      |
| ------------------------ | ------ | ----------------------------------------- |
| CI                       | active | .github/workflows/ci.yml                  |
| Test                     | active | .github/workflows/test.yml                |
| PR Automation            | active | .github/workflows/pr-automation.yml       |
| PR Labeling              | active | .github/workflows/pr-labeling.yml         |
| Semantic Release         | active | .github/workflows/semantic-release.yml    |
| Release                  | active | .github/workflows/release.yml             |
| NPM Publish              | active | .github/workflows/npm-publish.yml         |
| Welcome New Contributors | active | .github/workflows/welcome.yml             |
| macOS Testing            | active | .github/workflows/macos-testing.yml       |
| Quarterly Gap Audit      | active | .github/workflows/quarterly-gap-audit.yml |
| CodeQL                   | active | dynamic/github-code-scanning/codeql       |

### 4. CODEOWNERS Configuration

**Source:** `.github/CODEOWNERS`

```codeowners
* @SynkraAI
```

**Analysis:** Single org-level ownership - no granular path-based ownership.

### 5. CodeRabbit Configuration

**Status:** `.coderabbit.yaml` NOT FOUND

---

## Gap Analysis

### CRITICAL Severity

| Setting                           | Current   | Expected | Risk                          |
| --------------------------------- | --------- | -------- | ----------------------------- |
| `required_approving_review_count` | **0**     | **1**    | Unreviewed code can be merged |
| `require_code_owner_reviews`      | **false** | **true** | No domain expert validation   |

**Impact:** Any collaborator with write access can merge PRs without approval, bypassing code review.

### HIGH Severity

| Setting                       | Current   | Expected      | Risk                     |
| ----------------------------- | --------- | ------------- | ------------------------ |
| CodeRabbit `.coderabbit.yaml` | Missing   | Configured    | No automated AI review   |
| CODEOWNERS granularity        | Org-level | Path-specific | No domain expert routing |

**Impact:** Reduced review quality and no automated feedback for contributors.

### MEDIUM Severity

| Setting                               | Current      | Expected | Risk                           |
| ------------------------------------- | ------------ | -------- | ------------------------------ |
| `test` in required checks             | Not required | Required | Tests can be skipped           |
| `required_conversation_resolution`    | false        | true     | Feedback can be ignored        |
| `story-validation` in required checks | Not required | Optional | Story consistency not enforced |

**Impact:** PRs can be merged with failing tests or unaddressed feedback.

### LOW Severity

| Setting                 | Current | Expected | Risk                             |
| ----------------------- | ------- | -------- | -------------------------------- |
| Required signatures     | false   | Optional | Commit authenticity not verified |
| Required linear history | false   | Optional | Complex merge history            |

**Impact:** Minor traceability concerns.

---

## Summary Table

| Category                | Status   | Action Required   |
| ----------------------- | -------- | ----------------- |
| Approving reviews       | CRITICAL | Enable 1 required |
| Code owner reviews      | CRITICAL | Enable            |
| CodeRabbit config       | HIGH     | Create            |
| CODEOWNERS detail       | HIGH     | Enhance           |
| Test in checks          | MEDIUM   | Add               |
| Conversation resolution | MEDIUM   | Enable            |

---

## Risk Assessment

### Current Risk Level: HIGH

With `required_approving_review_count: 0`, any collaborator can:

1. Create a PR
2. Merge immediately without any review
3. Bypass all human oversight

This is acceptable for internal development but **not recommended for external contributions**.

### Mitigating Factors

- CI pipeline (`lint`, `typecheck`, `build`) is required
- Force pushes are disabled
- Branch deletions are disabled
- Stale reviews are dismissed (when reviews are required)

---

## Recommendations

### Phase 1: Immediate (CRITICAL)

1. Set `required_approving_review_count: 1`
2. Set `require_code_owner_reviews: true`

**Command:**

```bash
gh api repos/SynkraAI/aios-core/branches/main/protection -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["lint","typecheck","build","test"]}' \
  -F enforce_admins=false \
  -F required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"required_approving_review_count":1}' \
  -F restrictions=null
```

### Phase 2: Short-term (HIGH)

1. Create `.coderabbit.yaml` with AIOS-specific rules
2. Update CODEOWNERS with granular paths

### Phase 3: Medium-term (MEDIUM)

1. Add `test` to required status checks
2. Enable `required_conversation_resolution`

---

## Audit Artifacts

Exported configurations saved to:

- `.aios/audit/branch-protection.json`
- `.aios/audit/repo-settings.json`

---

## Consequences

### Positive

- Full visibility of current security posture
- Clear prioritization of fixes
- Evidence-based recommendations

### Negative

- Audit reveals significant gaps
- Immediate action required for safe external contributions

### Neutral

- Existing CI pipeline is well-configured
- Fork workflow is documented in CONTRIBUTING.md

---

## Related Documents

- [contribution-workflow-research.md](../contribution-workflow-research.md)
- [ADR-COLLAB-2-proposed-configuration.md](./ADR-COLLAB-2-proposed-configuration.md)

---

_Audit conducted as part of Story COLLAB-1 investigation._
