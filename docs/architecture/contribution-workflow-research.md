# External Contribution Workflow Research

**Story:** COLLAB-1
**Date:** 2025-12-30
**Author:** @dev (Dex) + @devops (Gage)
**Status:** Complete

---

## Executive Summary

This document consolidates research findings on best practices for external contributor workflows in open source projects, specifically for enabling safe community contributions to AIOS agents and tasks.

---

## 1. GitHub Branch Protection Best Practices

### 1.1 Industry Recommendations

Based on research from [GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule), [DEV Community](https://dev.to/n3wt0n/best-practices-for-branch-protection-2pe3), and [Legit Security](https://www.legitsecurity.com/blog/github-security-best-practices-your-team-should-be-following):

| Protection Rule                     | Recommendation            | Rationale                                      |
| ----------------------------------- | ------------------------- | ---------------------------------------------- |
| **Required pull request reviews**   | Enable with 1-2 reviewers | Prevents unreviewed code from merging          |
| **Require code owner reviews**      | Enable                    | Ensures domain experts review relevant changes |
| **Dismiss stale reviews**           | Enable                    | Forces re-review after new changes             |
| **Required status checks**          | CI must pass              | Catches build/test failures before merge       |
| **Require conversation resolution** | Enable                    | Ensures all feedback is addressed              |
| **Restrict force pushes**           | Disable force push        | Prevents history rewriting                     |
| **Require linear history**          | Optional                  | Cleaner git history (consider for monorepos)   |

### 1.2 Key Insights

> "Collaborators with write access to a repository have complete write permissions on all its files and history. While this is good for collaboration, it's not always desirable."

**Critical Point:** Branch protection is one of the most important security considerations. It can prevent unwanted code from being pushed into production.

### 1.3 Recommended Open Source Settings

```yaml
branch_protection:
  require_pull_request_reviews:
    required_approving_review_count: 1 # At least 1 approval
    dismiss_stale_reviews: true # Re-review after changes
    require_code_owner_reviews: true # Domain expert approval
    require_last_push_approval: false # Optional for OSS

  required_status_checks:
    strict: true # Branch must be up-to-date
    contexts:
      - lint
      - typecheck
      - build
      - test # Critical for quality

  restrictions:
    users: []
    teams: ['maintainers']

  allow_force_pushes: false
  allow_deletions: false
  required_conversation_resolution: true # Address all feedback
```

---

## 2. CodeRabbit Configuration Best Practices

### 2.1 Official Documentation

From [CodeRabbit Docs](https://docs.coderabbit.ai/getting-started/yaml-configuration) and [awesome-coderabbit](https://github.com/coderabbitai/awesome-coderabbit):

**Key Configuration Elements:**

| Element                     | Purpose                      | Recommendation                           |
| --------------------------- | ---------------------------- | ---------------------------------------- |
| `language`                  | Response language            | Match project language (pt-BR or en-US)  |
| `reviews.auto_review`       | Automatic PR reviews         | Enable for OSS                           |
| `reviews.path_instructions` | Custom review rules per path | Essential for agent/task validation      |
| `chat.auto_reply`           | Respond to comments          | Enable for better contributor experience |

### 2.2 Real-World Examples

**TEN Framework (.coderabbit.yaml):**

```yaml
language: 'en-US'
reviews:
  profile: 'chill'
  high_level_summary: true
  auto_review:
    enabled: true
tools:
  ruff:
    enabled: true
  gitleaks:
    enabled: true
```

**PHARE Project:**

```yaml
path_instructions:
  '**/*.cpp':
    - 'Check for memory leaks'
    - 'Verify thread safety'
tools:
  shellcheck:
    enabled: true
  markdownlint:
    enabled: true
```

**NVIDIA NeMo RL:**

```yaml
auto_title_instructions: |
  Format: "<category>: <title>"
  Categories: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
  Title should be <= 80 chars
```

### 2.3 AIOS-Specific Recommendations

For agent/task contributions, CodeRabbit should validate:

1. **Agent YAML structure** - persona_profile, commands, dependencies
2. **Task format** - elicitation points, deliverables
3. **Documentation** - README updates, guide references
4. **Security** - No hardcoded secrets, proper permissions

---

## 3. CODEOWNERS Best Practices

### 3.1 Industry Patterns

From [Harness Blog](https://www.harness.io/blog/mastering-codeowners), [Satellytes](https://www.satellytes.com/blog/post/monorepo-codeowner-github-enterprise/), and [GitHub Docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners):

**Key Principles:**

| Principle            | Description                                |
| -------------------- | ------------------------------------------ |
| **Last match wins**  | Later patterns override earlier ones       |
| **Use wildcards**    | Consolidate entries with `*` and `**`      |
| **Teams over users** | Easier to maintain as people change        |
| **Granularity**      | Balance between too broad and too specific |

### 3.2 Monorepo Patterns

```codeowners
# Default owner (fallback)
* @org/maintainers

# Directory ownership (more specific)
/src/auth/ @org/security-team
/src/api/ @org/backend-team
/src/ui/ @org/frontend-team

# File type ownership
*.sql @org/dba-team
Dockerfile @org/devops-team

# Critical files (require senior review)
/.github/ @org/core-team
/security/ @org/security-team
```

### 3.3 AIOS-Specific Structure

```codeowners
# Default - requires maintainer review
* @SynkraAI/maintainers

# Agent definitions - requires core team
.aios-core/development/agents/ @SynkraAI/core-team

# Task definitions - requires core team
.aios-core/development/tasks/ @SynkraAI/core-team

# CI/CD - requires devops approval
.github/ @SynkraAI/devops

# Documentation - more permissive for contributors
docs/ @SynkraAI/maintainers

# Templates - requires architect review
templates/ @SynkraAI/core-team
.aios-core/product/templates/ @SynkraAI/core-team
```

---

## 4. GitHub Actions Required Checks

### 4.1 Best Practices

From [GitHub Docs](https://docs.github.com/articles/about-status-checks) and community discussions:

**Critical Insight:**

> "If a check fails, GitHub prevents merging the PR. However, skipped jobs report 'Success' and don't prevent merging."

**Solution Pattern (alls-green job):**

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    # ...

  test:
    runs-on: ubuntu-latest
    # ...

  alls-green:
    name: All Checks Passed
    runs-on: ubuntu-latest
    needs: [lint, test]
    if: always()
    steps:
      - name: Verify all jobs passed
        run: |
          if [ "${{ needs.lint.result }}" != "success" ]; then exit 1; fi
          if [ "${{ needs.test.result }}" != "success" ]; then exit 1; fi
```

### 4.2 Recommended Required Checks

| Check                 | Type     | Priority           |
| --------------------- | -------- | ------------------ |
| `lint`                | Required | HIGH               |
| `typecheck`           | Required | HIGH               |
| `build`               | Required | HIGH               |
| `test`                | Required | HIGH               |
| `story-validation`    | Optional | MEDIUM             |
| `ide-sync-validation` | Optional | LOW                |
| `alls-green`          | Required | HIGH (summary job) |

---

## 5. OSS Contribution Workflow Examples

### 5.1 Next.js

From [Next.js Contribution Guide](https://nextjs.org/docs/community/contribution-guide):

- Fork and PR workflow
- Automated Prettier formatting check
- Requires PR review from maintainers
- Uses Turborepo for monorepo management

### 5.2 Prisma

From [Prisma CONTRIBUTING.md](https://github.com/prisma/prisma/blob/main/CONTRIBUTING.md):

**Key Requirements:**

- CLA signing required
- Structured commit messages
- Tests must cover changes
- Bundle size monitored (<6MB)
- CI/CD must pass (lint, test, cross-platform)

**Workflow:**

1. Clone repository
2. Create feature branch
3. Make changes + tests
4. Submit PR with description
5. Sign CLA
6. Wait for review

### 5.3 Common Patterns

| Pattern              | Adoption                | Recommendation     |
| -------------------- | ----------------------- | ------------------ |
| Fork workflow        | Very common             | Adopt              |
| CLA signing          | Common in corporate OSS | Optional for now   |
| Conventional commits | Very common             | Already adopted    |
| Required approvals   | Universal               | Adopt (1 approval) |
| CODEOWNERS           | Common                  | Adopt (granular)   |
| CodeRabbit/AI review | Growing                 | Adopt              |

---

## 6. Security Considerations

### 6.1 Fork Workflow vs Direct Branch

| Aspect                 | Fork Workflow        | Direct Branch       |
| ---------------------- | -------------------- | ------------------- |
| **Security**           | Higher (isolated)    | Lower (shared repo) |
| **Contributor access** | No write needed      | Write access needed |
| **CI/CD**              | Runs in fork context | Runs in main repo   |
| **Secrets**            | Protected            | Accessible          |
| **Complexity**         | Slightly higher      | Lower               |

**Recommendation:** Fork workflow for external contributors (already documented in CONTRIBUTING.md)

### 6.2 Protecting Secrets in PRs

- Never expose secrets in CI logs
- Use `pull_request_target` carefully
- Limit secret scopes
- Audit PR authors for suspicious patterns

---

## 7. Recommendations for AIOS

### 7.1 Immediate Actions (CRITICAL)

1. **Enable required approving reviews** (`required_approving_review_count: 1`)
2. **Enable code owner reviews** (`require_code_owner_reviews: true`)
3. **Add `test` to required status checks**

### 7.2 Short-term Actions (HIGH)

1. **Create `.coderabbit.yaml`** with AIOS-specific path instructions
2. **Update CODEOWNERS** with granular ownership
3. **Enable required conversation resolution**

### 7.3 Medium-term Actions (MEDIUM)

1. **Create specialized PR templates** for agent/task contributions
2. **Enhance CONTRIBUTING.md** with agent contribution checklist
3. **Add contributor onboarding guide**

### 7.4 Low Priority (NICE TO HAVE)

1. **Add CLA bot** for legal protection
2. **Implement stale PR automation**
3. **Add contribution metrics dashboard**

---

## 8. Sources

### Branch Protection

- [GitHub Docs: Managing Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
- [DEV Community: Best Practices for Branch Protection](https://dev.to/n3wt0n/best-practices-for-branch-protection-2pe3)
- [Legit Security: GitHub Security Best Practices](https://www.legitsecurity.com/blog/github-security-best-practices-your-team-should-be-following)

### CodeRabbit

- [CodeRabbit YAML Configuration](https://docs.coderabbit.ai/getting-started/yaml-configuration)
- [awesome-coderabbit Repository](https://github.com/coderabbitai/awesome-coderabbit)
- [TEN Framework .coderabbit.yaml](https://github.com/TEN-framework/ten-framework/blob/main/.coderabbit.yaml)

### CODEOWNERS

- [Harness: Mastering CODEOWNERS](https://www.harness.io/blog/mastering-codeowners)
- [GitHub Docs: About Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Satellytes: Monorepo CODEOWNERS](https://www.satellytes.com/blog/post/monorepo-codeowner-github-enterprise/)

### GitHub Actions

- [GitHub Docs: About Status Checks](https://docs.github.com/articles/about-status-checks)
- [GitHub Blog: Required Workflows](https://github.blog/enterprise-software/devops/introducing-required-workflows-and-configuration-variables-to-github-actions/)

### OSS Examples

- [Next.js Contribution Guide](https://nextjs.org/docs/community/contribution-guide)
- [Prisma CONTRIBUTING.md](https://github.com/prisma/prisma/blob/main/CONTRIBUTING.md)

---

_Document generated as part of Story COLLAB-1 investigation._
