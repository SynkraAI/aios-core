# ADR-COLLAB-2: Proposed Configuration - External Contribution Workflow

**Story:** COLLAB-1
**Date:** 2025-12-30
**Status:** Proposed
**Author:** @devops (Gage) + @architect (Aria)

---

## Context

Following the [Current State Audit](./ADR-COLLAB-1-current-state-audit.md), this document proposes specific configuration changes to enable safe external contributions to AIOS.

---

## Decision

Implement a multi-phase configuration update to establish secure external contributor workflows.

---

## Proposed Configurations

### 1. Branch Protection Rules

**Target:** `main` branch

```yaml
# Proposed branch protection configuration
branch_protection:
  main:
    # Status checks (CI must pass)
    required_status_checks:
      strict: true # Branch must be up-to-date
      contexts:
        - lint # EXISTING
        - typecheck # EXISTING
        - build # EXISTING
        - test # ADD - ensure tests pass
        - validation-summary # ADD - alls-green pattern

    # Pull request reviews
    required_pull_request_reviews:
      dismiss_stale_reviews: true # EXISTING
      require_code_owner_reviews: true # CHANGE from false
      require_last_push_approval: false # Keep false for OSS
      required_approving_review_count: 1 # CHANGE from 0

    # Admin enforcement
    enforce_admins: false # Allow maintainer bypass for emergencies

    # Push restrictions
    allow_force_pushes: false # EXISTING
    allow_deletions: false # EXISTING
    block_creations: false # Keep false

    # Conversation resolution
    required_conversation_resolution: true # ADD - all feedback must be addressed

    # Linear history (optional)
    required_linear_history: false # Keep false - allow merge commits

    # Signatures (optional)
    required_signatures: false # Keep false for now
```

**Implementation Command:**

```bash
gh api repos/SynkraAI/aios-core/branches/main/protection -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["lint","typecheck","build","test","validation-summary"]}' \
  -F enforce_admins=false \
  -F required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"required_approving_review_count":1}' \
  -F restrictions=null \
  -F required_conversation_resolution=true
```

---

### 2. CodeRabbit Configuration

**File:** `.coderabbit.yaml` (root directory)

```yaml
# yaml-language-server: $schema=https://coderabbit.ai/integrations/schema.v2.json
# AIOS CodeRabbit Configuration
# Story: COLLAB-1

language: 'en-US'
tone: professional
early_access: false

reviews:
  # Automatic review settings
  auto_review:
    enabled: true
    base_branches:
      - main
    drafts: false

  # Review behavior
  request_changes_workflow: true
  high_level_summary: true
  poem: false
  review_status: true
  collapse_walkthrough: false

  # Path-specific review instructions
  path_instructions:
    # Agent definitions - strict validation
    '.aios-core/development/agents/**':
      - 'Verify agent follows AIOS agent YAML structure (persona_profile, commands, dependencies)'
      - 'Check that persona_profile includes archetype, communication style, and greeting_levels'
      - 'Validate all commands listed have corresponding task dependencies'
      - 'Ensure agent has proper visibility metadata for commands'
      - 'Check for security: no hardcoded credentials or sensitive data'

    # Task definitions
    '.aios-core/development/tasks/**':
      - 'Verify task follows AIOS task format with clear elicitation points'
      - 'Check that deliverables are well-defined'
      - 'Validate any referenced dependencies exist in the codebase'
      - 'Ensure task has proper error handling guidance'

    # Workflow definitions
    '.aios-core/development/workflows/**':
      - 'Verify workflow YAML structure is valid'
      - 'Check step ordering and dependencies make logical sense'
      - 'Validate referenced agents and tasks exist'

    # Template files
    '.aios-core/product/templates/**':
      - 'Ensure template follows AIOS template conventions'
      - 'Check placeholder syntax is consistent'
      - 'Validate template produces valid output'

    # CI/CD configurations
    '.github/**':
      - 'Review for security implications'
      - 'Check for proper secret handling'
      - 'Validate workflow syntax'
      - 'Ensure consistent with existing CI patterns'

    # JavaScript/TypeScript code
    '**/*.js':
      - 'Check for async/await best practices'
      - 'Verify error handling is comprehensive'
      - 'Look for potential security vulnerabilities'
      - 'Ensure code follows AIOS coding standards'

    '**/*.ts':
      - 'Verify TypeScript types are properly defined'
      - "Check for any 'any' type usage that should be more specific"
      - 'Ensure exports are properly typed'

# PR title validation (Conventional Commits)
auto_title_instructions: |
  Format: "<type>(<scope>): <description>"

  Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
  Scope: Optional, indicates affected area (agent, task, workflow, ci, docs)
  Description: Concise (<= 72 chars), imperative mood

  Examples:
  - feat(agent): add KISS validation to data-engineer
  - fix(task): resolve elicitation timeout issue
  - docs: update external contribution guide

# Chat settings
chat:
  auto_reply: true

# Tools configuration
tools:
  # Linting tools
  eslint:
    enabled: true
  markdownlint:
    enabled: true
  yamllint:
    enabled: true

  # Security tools
  gitleaks:
    enabled: true

# Behavior settings
abort_on_close: true
```

---

### 3. CODEOWNERS Configuration

**File:** `.github/CODEOWNERS`

```codeowners
# AIOS Code Owners
# Story: COLLAB-1
# Last Updated: 2025-12-30
#
# Format: <pattern> <owners>
# Later patterns take precedence over earlier ones
# See: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

# ============================================
# Default Owner (fallback)
# ============================================
* @SynkraAI/maintainers

# ============================================
# Framework Core
# ============================================
# Agent definitions - requires core team review
.aios-core/development/agents/ @SynkraAI/core-team

# Task definitions - requires core team review
.aios-core/development/tasks/ @SynkraAI/core-team

# Workflow definitions - requires core team review
.aios-core/development/workflows/ @SynkraAI/core-team

# Templates - requires architect/core team review
.aios-core/product/templates/ @SynkraAI/core-team
templates/ @SynkraAI/core-team

# Core utilities - requires senior review
.aios-core/core/ @SynkraAI/core-team
.aios-core/cli/ @SynkraAI/core-team

# ============================================
# Infrastructure
# ============================================
# CI/CD - requires devops approval
.github/ @SynkraAI/devops

# Docker configurations
.docker/ @SynkraAI/devops

# Configuration files
.aios-core/core-config.yaml @SynkraAI/core-team
package.json @SynkraAI/maintainers
package-lock.json @SynkraAI/maintainers

# ============================================
# Documentation (More Permissive)
# ============================================
# General docs - maintainers can approve
docs/ @SynkraAI/maintainers

# Architecture decisions - requires core team
docs/architecture/ @SynkraAI/core-team
docs/framework/ @SynkraAI/core-team

# Stories - maintainers (internal development docs)
docs/stories/ @SynkraAI/maintainers

# Guides - maintainers (contributor-friendly)
docs/guides/ @SynkraAI/maintainers

# ============================================
# Security-Sensitive Files
# ============================================
# Security configurations
.github/CODEOWNERS @SynkraAI/core-team
.github/workflows/semantic-release.yml @SynkraAI/devops
.github/workflows/npm-publish.yml @SynkraAI/devops

# Root configuration files
.env* @SynkraAI/core-team
*.config.js @SynkraAI/maintainers
```

**Required GitHub Teams:**

- `@SynkraAI/maintainers` - General maintainers (write access)
- `@SynkraAI/core-team` - Core framework developers
- `@SynkraAI/devops` - CI/CD and infrastructure

---

### 4. Required Status Checks Update

**Current Checks:** `lint`, `typecheck`, `build`

**Proposed Checks:**

| Check                | Source Workflow | Priority | Notes                     |
| -------------------- | --------------- | -------- | ------------------------- |
| `lint`               | ci.yml          | Required | ESLint validation         |
| `typecheck`          | ci.yml          | Required | TypeScript checking       |
| `build`              | ci.yml          | Required | Build verification        |
| `test`               | ci.yml          | Required | Jest test suite           |
| `validation-summary` | ci.yml          | Required | Alls-green pattern        |
| `story-validation`   | ci.yml          | Optional | Story checkbox validation |

**Note:** The `validation-summary` job in ci.yml acts as the "alls-green" pattern, ensuring all other jobs passed.

---

### 5. PR Templates

**File:** `.github/PULL_REQUEST_TEMPLATE/agent_contribution.md`

```markdown
## Agent Contribution

### Agent Information

- **Agent Name:**
- **Agent ID:**
- **Agent Type:** (core | expansion | community)

### Changes Made

- [ ] New agent definition
- [ ] Updated existing agent
- [ ] New commands added
- [ ] New task dependencies

### Checklist

#### Required

- [ ] Agent follows AIOS agent YAML structure
- [ ] `persona_profile` is complete (archetype, communication, greeting_levels)
- [ ] All commands have corresponding task dependencies
- [ ] No hardcoded credentials or sensitive data
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated

#### Optional

- [ ] README for agent updated
- [ ] Example usage provided

### Testing

Describe how you tested these changes:

### Related Issues

Fixes #

---

_By submitting this PR, I confirm I have read the [Contribution Guidelines](../../CONTRIBUTING.md)_
```

**File:** `.github/PULL_REQUEST_TEMPLATE/task_contribution.md`

```markdown
## Task Contribution

### Task Information

- **Task Name:**
- **Task File:**
- **Related Agent(s):**

### Changes Made

- [ ] New task definition
- [ ] Updated existing task
- [ ] New elicitation points

### Checklist

#### Required

- [ ] Task follows AIOS task format
- [ ] Elicitation points are clear and actionable
- [ ] Deliverables are well-defined
- [ ] Error handling guidance included
- [ ] Referenced dependencies exist

#### Optional

- [ ] Example workflow provided
- [ ] Documentation updated

### Testing

Describe how you tested this task:

### Related Issues

Fixes #

---

_By submitting this PR, I confirm I have read the [Contribution Guidelines](../../CONTRIBUTING.md)_
```

---

## Implementation Plan

### Phase 1: Critical Security (Day 1)

| Item               | Action         | Rollback                                              |
| ------------------ | -------------- | ----------------------------------------------------- |
| Required reviews   | Set count to 1 | `gh api -X PUT ... required_approving_review_count:0` |
| Code owner reviews | Enable         | `gh api -X PUT ... require_code_owner_reviews:false`  |

**Risk:** Low - these are additive protections

### Phase 2: Automated Review (Day 2-3)

| Item                 | Action                     | Rollback    |
| -------------------- | -------------------------- | ----------- |
| CodeRabbit config    | Create `.coderabbit.yaml`  | Delete file |
| Test on feature PR   | Open test PR               | N/A         |
| Validate integration | Verify CodeRabbit comments | N/A         |

**Risk:** Low - CodeRabbit is non-blocking by default

### Phase 3: Documentation (Day 3-5)

| Item           | Action             | Rollback     |
| -------------- | ------------------ | ------------ |
| CODEOWNERS     | Update granularity | `git revert` |
| PR templates   | Create templates   | `git revert` |
| External guide | Create guide       | `git revert` |

**Risk:** Very low - documentation only

### Phase 4: CI Hardening (Day 5-7)

| Item                    | Action                   | Rollback             |
| ----------------------- | ------------------------ | -------------------- |
| Add `test` to required  | Update branch protection | Remove from contexts |
| Conversation resolution | Enable                   | Disable              |

**Risk:** Medium - could block legitimate PRs if tests flaky

---

## Rollback Procedures

### Emergency Rollback (Branch Protection)

```bash
# Remove all branch protection (emergency only)
gh api -X DELETE repos/SynkraAI/aios-core/branches/main/protection

# Restore minimal protection
gh api repos/SynkraAI/aios-core/branches/main/protection -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["lint","typecheck","build"]}' \
  -F enforce_admins=false \
  -F required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":0}' \
  -F restrictions=null
```

### Rollback CodeRabbit

```bash
# Simply delete the config file
rm .coderabbit.yaml
git add -A && git commit -m "chore: rollback CodeRabbit config"
git push
```

### Rollback CODEOWNERS

```bash
# Restore simple ownership
echo "* @SynkraAI" > .github/CODEOWNERS
git add -A && git commit -m "chore: rollback CODEOWNERS"
git push
```

---

## Success Criteria

| Metric                       | Target                 | Measurement             |
| ---------------------------- | ---------------------- | ----------------------- |
| All PRs require approval     | 100%                   | Branch protection audit |
| CodeRabbit reviews PRs       | 100%                   | CodeRabbit dashboard    |
| No unauthorized merges       | 0 incidents            | Security audit          |
| External contributor success | First PR within 1 week | GitHub insights         |
| Time to first review         | <24 hours              | PR metrics              |

---

## Consequences

### Positive

- Secure external contribution workflow
- Automated code review with CodeRabbit
- Clear ownership with CODEOWNERS
- Consistent PR quality with templates

### Negative

- Slightly slower merge process (requires approval)
- Maintainer availability becomes critical
- Learning curve for new CodeRabbit feedback

### Neutral

- Teams must be created in GitHub organization
- Regular CODEOWNERS maintenance required

---

## Related Documents

- [ADR-COLLAB-1-current-state-audit.md](./ADR-COLLAB-1-current-state-audit.md)
- [contribution-workflow-research.md](../contribution-workflow-research.md)
- [Story COLLAB-2: Implementation](../../stories/v2.1/sprint-15/story-collab-2-implementation.md) (follow-up)

---

_Configuration design completed as part of Story COLLAB-1 investigation._
