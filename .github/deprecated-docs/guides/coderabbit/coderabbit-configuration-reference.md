# CodeRabbit Configuration Reference

> **Version:** 1.0.0 | **Last Updated:** 2025-11-28 | **Status:** Source of Truth

## Table of Contents

1. [Overview](#1-overview)
2. [.coderabbit.yaml Structure](#2-coderabbitvyaml-structure)
3. [Review Profiles](#3-review-profiles)
4. [Path Instructions](#4-path-instructions)
5. [MCP Integrations](#5-mcp-integrations)
6. [Agent-Specific Configurations](#6-agent-specific-configurations)
7. [Complete Template](#7-complete-template)

---

## 1. Overview

### Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `.coderabbit.yaml` | GitHub App configuration | Project root |
| `.aios-core/agents/qa.md` | @qa agent CLI config | Agent definition |
| `.aios-core/agents/devops.md` | @devops agent CLI config | Agent definition |

### Configuration Priority

```
1. .coderabbit.yaml (project root) - GitHub App behavior
2. Agent YAML configs - CLI execution settings
3. Command-line flags - Override everything
```

---

## 2. .coderabbit.yaml Structure

### Basic Structure

```yaml
# Schema version (required)
version: 2

# Language for review comments
language: "en-US"

# Early access features
early_access: false

# Enable tone analysis
tone_instructions: ""

# Review configuration
reviews:
  profile: "balanced"
  request_changes_workflow: false
  high_level_summary: true
  high_level_summary_placeholder: "@coderabbitai summary"
  poem: false
  review_status: true
  collapse_walkthrough: false
  auto_review:
    enabled: true
    drafts: false
    base_branches:
      - "main"
      - "develop"
  path_instructions: []
  path_filters: []
  abort_on_close: true
  finishing_touches:
    docstrings: true
    unit_tests: false

# Chat configuration
chat:
  auto_reply: true

# Knowledge base
knowledge_base:
  learnings:
    scope: "auto"
  issues:
    scope: "auto"
  jira:
    project_keys: []
  linear:
    team_keys: []
  pull_requests:
    scope: "auto"
```

---

## 3. Review Profiles

### Available Profiles

| Profile | Strictness | Best For |
|---------|------------|----------|
| `chill` | Low | Early development, exploration |
| `balanced` | Medium | Most projects (recommended start) |
| `assertive` | High | Production code, security-critical |

### Profile Behavior

#### `chill` Profile
```yaml
reviews:
  profile: "chill"
  # Behavior:
  # - Fewer comments overall
  # - Focuses on CRITICAL/HIGH only
  # - Ignores style/formatting
  # - More suggestions, fewer demands
```

#### `balanced` Profile
```yaml
reviews:
  profile: "balanced"
  # Behavior:
  # - Moderate comment frequency
  # - All severity levels reported
  # - Style suggestions included
  # - Mix of suggestions and requests
```

#### `assertive` Profile
```yaml
reviews:
  profile: "assertive"
  # Behavior:
  # - Comprehensive comments
  # - Strict enforcement
  # - Style requirements
  # - More "request changes"
```

### Recommended Progression

```
┌─────────────────────────────────────────────────────────┐
│  AIOS RECOMMENDED PROFILE PROGRESSION                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Week 1-2:     CHILL                                    │
│                └─ Learn CodeRabbit patterns              │
│                └─ Tune path_instructions                 │
│                └─ Adjust to team workflow                │
│                                                          │
│  Week 3-4:     BALANCED                                 │
│                └─ Full feedback spectrum                 │
│                └─ Enable more path rules                 │
│                └─ Connect MCPs (ClickUp)                 │
│                                                          │
│  Week 5+:      ASSERTIVE                                │
│                └─ Production-ready enforcement          │
│                └─ All MCPs active                        │
│                └─ Self-healing mandatory                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Path Instructions

### Concept

Path instructions provide context-specific review rules for different parts of your codebase.

### Syntax

```yaml
reviews:
  path_instructions:
    - path: "glob-pattern"
      instructions: |
        Multi-line instructions for files
        matching this pattern.
```

### AIOS-Recommended Path Instructions

```yaml
reviews:
  path_instructions:
    # Agent Definitions
    - path: ".aios-core/agents/**"
      instructions: |
        These are AIOS agent persona definitions.
        Verify:
        - YAML frontmatter is valid
        - Required fields present (name, role, persona)
        - Commands follow *command convention
        - Integration configs are complete
        Do NOT suggest removing personality sections.

    # Task Definitions
    - path: ".aios-core/tasks/**"
      instructions: |
        These are executable task workflows.
        Verify:
        - Step sequences are logical
        - Elicitation points are clear
        - Error handling is defined
        - Outputs are documented
        Focus on workflow correctness, not style.

    # Story Files
    - path: "docs/stories/**"
      instructions: |
        These are development story files.
        Verify:
        - Acceptance criteria are testable
        - Task checkboxes are present
        - File list section exists
        Do NOT modify story content without explicit request.

    # TypeScript Source
    - path: "src/**/*.ts"
      instructions: |
        TypeScript source code.
        Enforce:
        - Strict typing (no any without justification)
        - Consistent error handling patterns
        - Export conventions
        - Test coverage for new functions
        Critical: Flag any hardcoded credentials.

    # Test Files
    - path: "**/*.test.ts"
      instructions: |
        Test files.
        Verify:
        - Tests cover edge cases
        - Mocks are properly typed
        - No implementation code in tests
        - Descriptive test names
        Do NOT require comments in tests.

    # Configuration Files
    - path: "*.config.*"
      instructions: |
        Configuration files.
        Flag:
        - Hardcoded secrets
        - Environment-specific values
        - Missing documentation for options
        Suggest .env variables for sensitive values.

    # API Routes
    - path: "src/api/**"
      instructions: |
        API endpoint files.
        Critical:
        - Input validation
        - Authentication checks
        - Rate limiting considerations
        - Error response consistency
        High: SQL injection, XSS vulnerabilities.

    # Database Files
    - path: "**/migrations/**"
      instructions: |
        Database migration files.
        Critical:
        - Data loss potential
        - Rollback strategy
        - Index considerations
        Never approve destructive migrations without explicit confirmation.
```

---

## 5. MCP Integrations

### What are MCPs?

Model Context Protocol (MCP) servers enrich CodeRabbit reviews with external context.

### Available MCPs

#### ClickUp Integration

```yaml
# .coderabbit.yaml MCP section (future)
mcp_integrations:
  - name: "clickup"
    enabled: true
    config:
      workspace_id: "${CLICKUP_WORKSPACE_ID}"
      api_key: "${CLICKUP_API_KEY}"
    instructions: |
      Validate that PR description links to ClickUp task.
      Verify implementation matches task acceptance criteria.
      Flag if estimated effort differs significantly from actual.
```

#### Context7 Integration

```yaml
mcp_integrations:
  - name: "context7"
    enabled: true
    config:
      # Uses default Context7 MCP endpoint
    instructions: |
      When reviewing code that uses external libraries:
      - Validate API usage against current documentation
      - Flag deprecated methods
      - Suggest modern alternatives
      - Verify version compatibility
```

#### Sentry Integration

```yaml
mcp_integrations:
  - name: "sentry"
    enabled: false  # Enable when production monitoring active
    config:
      dsn: "${SENTRY_DSN}"
      project: "aios-fullstack"
    instructions: |
      When reviewing files with associated Sentry errors:
      - Warn if code might reintroduce known bugs
      - Highlight files with high error rates
      - Suggest error boundary patterns
```

#### DeepWiki Integration

```yaml
mcp_integrations:
  - name: "deepwiki"
    enabled: true
    config:
      wiki_url: "${DEEPWIKI_URL}"
    instructions: |
      Validate code against internal architecture documentation:
      - Module boundaries
      - Data flow patterns
      - Naming conventions
      - Integration patterns
```

### MCP Configuration by Profile

| Profile | Recommended MCPs |
|---------|-----------------|
| `chill` | None (focus on learning) |
| `balanced` | ClickUp, Context7 |
| `assertive` | All MCPs enabled |

---

## 6. Agent-Specific Configurations

### @qa Agent Configuration

```yaml
# In .aios-core/agents/qa.md
coderabbit_integration:
  enabled: true
  installation_mode: wsl

  wsl_config:
    distribution: Ubuntu
    installation_path: ~/.local/bin/coderabbit
    working_directory: /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack

  commands:
    qa_pre_review_uncommitted: |
      wsl bash -c 'cd /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack && ~/.local/bin/coderabbit --prompt-only -t uncommitted'

    qa_story_review_committed: |
      wsl bash -c 'cd /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack && ~/.local/bin/coderabbit --prompt-only -t committed --base main'

  severity_handling:
    CRITICAL: Block story completion, must fix immediately
    HIGH: Report in QA gate, recommend fix before merge
    MEDIUM: Document as technical debt
    LOW: Optional improvements (ignore during review)

  self_healing:
    enabled: true
    max_iterations: 3
    fix_levels:
      CRITICAL: always
      HIGH: ask_user
      MEDIUM: ignore
      LOW: ignore

  timeouts:
    default: 900000   # 15 minutes
    max: 1800000      # 30 minutes
```

### @devops Agent Configuration

```yaml
# In .aios-core/agents/devops.md
coderabbit_integration:
  enabled: true
  installation_mode: wsl

  wsl_config:
    distribution: Ubuntu
    installation_path: ~/.local/bin/coderabbit
    working_directory: /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack

  commands:
    pre_push_uncommitted: |
      wsl bash -c 'cd /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack && ~/.local/bin/coderabbit --prompt-only -t uncommitted'

    pre_pr_against_main: |
      wsl bash -c 'cd /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack && ~/.local/bin/coderabbit --prompt-only --base main'

  quality_gate_rules:
    CRITICAL: Block PR creation, must fix immediately
    HIGH: Warn user, recommend fix before merge
    MEDIUM: Document in PR description
    LOW: Note in comments (optional)

  pr_monitoring:
    enabled: true
    wait_for_review: true
    timeout: 300000  # 5 minutes to wait for GitHub App
    commands:
      check_pr_reviews: |
        gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews
      check_pr_comments: |
        gh api repos/{owner}/{repo}/pulls/{pr_number}/comments

  timeouts:
    default: 900000   # 15 minutes
    max: 1800000      # 30 minutes
```

---

## 7. Complete Template

### Production-Ready .coderabbit.yaml

```yaml
# =============================================================================
# AIOS-FULLSTACK CodeRabbit Configuration
# =============================================================================
# Version: 1.0.0
# Profile: balanced (recommended starting point)
# Last Updated: 2025-11-28
# =============================================================================

version: 2
language: "en-US"
early_access: false

# -----------------------------------------------------------------------------
# REVIEW CONFIGURATION
# -----------------------------------------------------------------------------
reviews:
  # Profile: chill | balanced | assertive
  profile: "balanced"

  # Workflow settings
  request_changes_workflow: false
  high_level_summary: true
  high_level_summary_placeholder: "@coderabbitai summary"
  poem: false
  review_status: true
  collapse_walkthrough: false
  abort_on_close: true

  # Auto-review settings
  auto_review:
    enabled: true
    drafts: false
    base_branches:
      - "main"
      - "develop"
      - "release/*"

  # Finishing touches
  finishing_touches:
    docstrings: true
    unit_tests: false

  # ---------------------------------------------------------------------------
  # PATH FILTERS
  # ---------------------------------------------------------------------------
  path_filters:
    # Ignore generated files
    - "!**/node_modules/**"
    - "!**/dist/**"
    - "!**/build/**"
    - "!**/.next/**"
    - "!**/coverage/**"
    - "!**/*.min.js"
    - "!**/*.min.css"
    - "!**/package-lock.json"
    - "!**/yarn.lock"
    - "!**/pnpm-lock.yaml"

    # Ignore backup files
    - "!**/*.backup.*"
    - "!**/*.bak"

    # Include all source
    - "src/**"
    - ".aios-core/**"
    - "docs/**"

  # ---------------------------------------------------------------------------
  # PATH INSTRUCTIONS
  # ---------------------------------------------------------------------------
  path_instructions:
    # AIOS Core - Agent Definitions
    - path: ".aios-core/agents/**"
      instructions: |
        AIOS agent persona definitions.
        Validate:
        - YAML frontmatter structure
        - Required fields (name, role, persona, commands)
        - CodeRabbit integration config completeness
        - Command naming (*prefix convention)
        Preserve personality and tone sections.

    # AIOS Core - Task Definitions
    - path: ".aios-core/tasks/**"
      instructions: |
        Executable task workflows for AIOS agents.
        Validate:
        - Logical step sequences
        - Clear elicitation points
        - Error handling definitions
        - Output specifications
        Focus on workflow correctness over style.

    # Documentation - Stories
    - path: "docs/stories/**"
      instructions: |
        Development story files (user stories).
        Validate:
        - Testable acceptance criteria
        - Task checkboxes present
        - File list section exists
        - Clear definition of done
        Do NOT modify story content unless requested.

    # Source - TypeScript
    - path: "src/**/*.ts"
      instructions: |
        TypeScript source code.
        CRITICAL: Flag hardcoded credentials immediately.
        HIGH: Enforce strict typing (minimize 'any').
        MEDIUM: Check error handling patterns.
        LOW: Style consistency.

    # Source - Tests
    - path: "**/*.test.ts"
      instructions: |
        Test files.
        Validate:
        - Edge case coverage
        - Properly typed mocks
        - No implementation code in tests
        - Descriptive test names
        Do NOT require JSDoc in tests.

    # Source - API Routes
    - path: "src/api/**"
      instructions: |
        API endpoint files.
        CRITICAL: Input validation, SQL injection, XSS.
        HIGH: Authentication checks, error consistency.
        MEDIUM: Rate limiting, pagination.
        LOW: Response format consistency.

    # Configuration Files
    - path: "*.config.*"
      instructions: |
        Configuration files.
        CRITICAL: Hardcoded secrets.
        HIGH: Environment-specific values.
        Suggest .env variables for sensitive data.

# -----------------------------------------------------------------------------
# CHAT CONFIGURATION
# -----------------------------------------------------------------------------
chat:
  auto_reply: true

# -----------------------------------------------------------------------------
# KNOWLEDGE BASE
# -----------------------------------------------------------------------------
knowledge_base:
  learnings:
    scope: "auto"
  issues:
    scope: "auto"
  pull_requests:
    scope: "auto"
  jira:
    project_keys: []
  linear:
    team_keys: []

# -----------------------------------------------------------------------------
# MCP INTEGRATIONS (Future)
# -----------------------------------------------------------------------------
# Note: MCPs are configured via CodeRabbit dashboard, not this file.
# Documented here for reference.
#
# Planned integrations:
# - ClickUp: Task validation
# - Context7: Library documentation
# - Sentry: Error context (when production ready)
# - DeepWiki: Internal architecture docs
# -----------------------------------------------------------------------------
```

---

## Validation Checklist

Before committing `.coderabbit.yaml`:

- [ ] YAML syntax is valid (`yamllint .coderabbit.yaml`)
- [ ] Version is set to `2`
- [ ] Profile matches team readiness level
- [ ] Base branches are correct
- [ ] Path filters exclude generated files
- [ ] Path instructions cover critical directories
- [ ] No secrets in configuration file
- [ ] Team reviewed and approved settings

---

## References

- [Integration Guide](./coderabbit-integration-guide.md) - Main documentation
- [Workflows](./coderabbit-workflows.md) - Step-by-step agent workflows
- [Troubleshooting](./coderabbit-troubleshooting.md) - Common issues
- [CodeRabbit Official Docs](https://docs.coderabbit.ai/reference/configuration)

---

**Maintainer:** @architect (Aria)
**Last Updated:** 2025-11-28
**Version:** 1.0.0
