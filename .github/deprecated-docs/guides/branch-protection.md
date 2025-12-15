# Branch Protection Rules Guide

**Version:** 1.0.0
**Story:** 3.3-3.4 PR Automation Layer 2
**Last Updated:** 2025-12-02

---

## Overview

This guide documents the branch protection rules for the AIOS-FULLSTACK repository. These rules ensure code quality and prevent unreviewed code from being merged into protected branches.

## Protected Branches

### `main` (Production)

The `main` branch is the production-ready branch. All code merged here should be thoroughly tested and reviewed.

#### Required Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| Require pull request reviews | ✅ Enabled | Ensures code review before merge |
| Required approving reviews | 1 | At least one approval required |
| Dismiss stale reviews | ✅ Enabled | New commits require re-review |
| Require review from CODEOWNERS | ✅ Enabled | Owners must approve their areas |
| Require status checks to pass | ✅ Enabled | CI must pass before merge |
| Require branches to be up to date | ✅ Enabled | Must be current with main |
| Include administrators | ✅ Enabled | Rules apply to everyone |

#### Required Status Checks

```
✅ lint           - ESLint validation
✅ typecheck      - TypeScript type checking
✅ test           - Jest test suite
✅ story-validation - AIOS story checkbox validation
✅ quality-summary - Overall CI status
```

### `develop` (Integration)

The `develop` branch is for integration testing before production.

#### Required Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| Require pull request reviews | ✅ Enabled | Code review required |
| Required approving reviews | 1 | At least one approval |
| Require status checks to pass | ✅ Enabled | CI must pass |
| Require branches to be up to date | ⬜ Optional | May allow behind branches |

---

## Configuring Branch Protection

### Via GitHub Web UI

1. Navigate to **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Enter branch name pattern: `main`
4. Configure settings as documented above
5. Click **Create**

### Via GitHub CLI

```bash
# Set branch protection for main
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","typecheck","test","story-validation","quality-summary"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null
```

### Via Terraform (Infrastructure as Code)

```hcl
resource "github_branch_protection" "main" {
  repository_id = github_repository.aios_fullstack.node_id
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = [
      "lint",
      "typecheck",
      "test",
      "story-validation",
      "quality-summary"
    ]
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = true
  }

  enforce_admins = true
}
```

---

## Status Checks Reference

### CI Workflow Jobs

| Job Name | Workflow | Timeout | Purpose |
|----------|----------|---------|---------|
| `lint` | ci.yml | 5 min | ESLint code style |
| `typecheck` | ci.yml | 5 min | TypeScript types |
| `test` | ci.yml | 10 min | Jest unit tests |
| `story-validation` | ci.yml | 5 min | Story checkbox validation |
| `validation-summary` | ci.yml | 2 min | Aggregated status |

### External Checks

| Check Name | Provider | Purpose |
|------------|----------|---------|
| `coderabbitai` | CodeRabbit | AI code review |
| `codecov/patch` | Codecov | Coverage delta |
| `codecov/project` | Codecov | Overall coverage |

---

## CodeRabbit Integration

CodeRabbit provides automated AI code review. While not a blocking status check by default, teams may configure it as required.

### Making CodeRabbit Required

1. Go to **Settings** → **Branches** → **main**
2. Under "Require status checks", search for `coderabbitai`
3. Check the box to make it required

### CodeRabbit Blocking Logic

Per AIOS conventions:
- **CRITICAL findings**: Block merge (security vulnerabilities, data loss)
- **HIGH findings**: Require documentation before merge
- **MEDIUM/LOW findings**: Optional to address

---

## Bypass Scenarios

### Emergency Hotfix

In critical production emergencies:

1. Create branch from `main`: `hotfix/critical-fix`
2. Repository admin can bypass protection
3. Document bypass in PR description
4. Create follow-up PR for proper review

### Bypass Audit

All bypasses are logged in GitHub audit log:
- **Settings** → **Security** → **Code security and analysis** → **Audit log**

---

## CODEOWNERS Integration

Branch protection works with CODEOWNERS to require specific reviewers:

```
# .github/CODEOWNERS
*                       @Pedrovaleriolopez
.aios-core/            @Pedrovaleriolopez
expansion-packs/       @Pedrovaleriolopez
docs/                  @Pedrovaleriolopez
```

---

## Troubleshooting

### "Required status check is expected"

**Cause:** Status check hasn't run yet or failed to report.

**Solution:**
1. Check Actions tab for workflow status
2. Re-run failed workflows
3. Verify workflow triggers include `pull_request`

### "Merge blocked by branch protection"

**Cause:** Required reviews or status checks not satisfied.

**Solution:**
1. Request review from required reviewers
2. Wait for all status checks to pass
3. Ensure branch is up to date with base

### "Stale review dismissed"

**Cause:** New commits were pushed after approval.

**Solution:**
1. Request re-review after final changes
2. Avoid pushing after receiving approval

---

## Related Documentation

- [Quality Gates Guide](./quality-gates.md)
- [CodeRabbit Integration Guide](./coderabbit/coderabbit-integration-guide.md)
- [GitHub Actions Workflows](../../.github/workflows/README.md)

---

**Maintained by:** @devops (Gage - The Operator)
