# CodeRabbit Integration Guide for AIOS

> **Version:** 1.0.0 | **Last Updated:** 2025-11-28 | **Status:** Source of Truth

## Table of Contents

1. [Introduction](#1-introduction)
2. [Architecture Overview](#2-architecture-overview)
3. [CLI Mode: Local Validation](#3-cli-mode-local-validation)
4. [GitHub App Mode: PR Reviews](#4-github-app-mode-pr-reviews)
5. [Agent Integration](#5-agent-integration)
6. [Self-Healing Workflows](#6-self-healing-workflows)
7. [MCP Enrichment](#7-mcp-enrichment)
8. [Severity Handling](#8-severity-handling)
9. [Best Practices](#9-best-practices)
10. [Metrics and ROI](#10-metrics-and-roi)

---

## 1. Introduction

### What is CodeRabbit?

CodeRabbit is an AI-powered code review assistant that provides:
- **Automated code analysis** for quality, security, and performance
- **Contextual reviews** enriched by external data sources (MCPs)
- **Structured feedback** optimized for AI agent consumption

### Why CodeRabbit in AIOS?

AIOS uses CodeRabbit as a critical component of its quality assurance pipeline:

| Benefit | Impact |
|---------|--------|
| **Shift-Left Quality** | Catch issues before PR, not after |
| **Self-Healing Loops** | Autonomous fix cycles reduce manual work |
| **Contextual Reviews** | MCPs connect code to business context |
| **Agent Integration** | Structured output feeds AI agents |
| **Time Savings** | 60-70% reduction in review cycles |

### Two Complementary Modes

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   CLI MODE                          GITHUB APP MODE             │
│   ─────────                         ───────────────             │
│                                                                  │
│   • Local validation                • PR-level review           │
│   • Pre-commit/pre-push             • Post-PR creation          │
│   • Fast feedback (7-30 min)        • Instant (~30 sec)         │
│   • Self-healing loops              • MCP enrichment            │
│   • Agent: @qa, @devops             • Agent: @devops            │
│   • Output: --prompt-only           • Output: PR comments       │
│                                                                  │
│   USE FOR:                          USE FOR:                    │
│   • Code quality validation         • Business logic audit      │
│   • Security scanning               • Ticket validation         │
│   • Pattern enforcement             • Architecture compliance   │
│   • Quick iterations                • Team visibility           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Overview

### System Context

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           AIOS DEVELOPMENT WORKFLOW                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌────────┐ │
│  │  @dev   │ →  │  @qa    │ →  │ @devops │ →  │ GitHub  │ →  │ Merge  │ │
│  │implement│    │ review  │    │ push/PR │    │   PR    │    │        │ │
│  └─────────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────────┘ │
│                      │              │              │                     │
│                      ↓              ↓              ↓                     │
│                ┌──────────┐   ┌──────────┐   ┌──────────┐               │
│                │CodeRabbit│   │CodeRabbit│   │CodeRabbit│               │
│                │   CLI    │   │   CLI    │   │GitHub App│               │
│                │(via WSL) │   │(via WSL) │   │  + MCPs  │               │
│                └──────────┘   └──────────┘   └──────────┘               │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CODERABBIT COMPONENTS                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  LOCAL (Windows + WSL)                    CLOUD (GitHub)                │
│  ─────────────────────                    ──────────────                │
│                                                                          │
│  ┌────────────────────┐                  ┌────────────────────┐        │
│  │     WSL Ubuntu     │                  │   GitHub.com       │        │
│  │  ┌──────────────┐  │                  │  ┌──────────────┐  │        │
│  │  │ CodeRabbit   │  │                  │  │ CodeRabbit   │  │        │
│  │  │ CLI v0.3.4   │  │                  │  │ GitHub App   │  │        │
│  │  │              │  │                  │  │              │  │        │
│  │  │ ~/.local/bin │  │                  │  │  + MCPs:     │  │        │
│  │  └──────────────┘  │                  │  │  - ClickUp   │  │        │
│  │         ↑          │                  │  │  - Context7  │  │        │
│  │         │          │                  │  │  - Sentry    │  │        │
│  └─────────┼──────────┘                  │  └──────────────┘  │        │
│            │                             └────────────────────┘        │
│            │                                       ↑                    │
│  ┌─────────┼──────────┐                           │                    │
│  │   Windows Host     │                           │                    │
│  │  ┌──────────────┐  │      ┌──────────┐        │                    │
│  │  │ Claude Code  │  │      │   git    │        │                    │
│  │  │  / Cursor    │──┼──────│   push   │────────┘                    │
│  │  │              │  │      └──────────┘                              │
│  │  │ @qa @devops  │  │                                                │
│  │  └──────────────┘  │                                                │
│  └────────────────────┘                                                │
│                                                                          │
│  Configuration Files:                                                   │
│  ├── .coderabbit.yaml (project root) - GitHub App config               │
│  ├── .aios-core/agents/qa.md - @qa agent with CLI config               │
│  └── .aios-core/agents/devops.md - @devops agent with CLI config       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CLI Mode: Local Validation

### Installation

CodeRabbit CLI is installed in WSL (Ubuntu):

```bash
# Location
~/.local/bin/coderabbit

# Version
v0.3.4

# Authentication
pedro@allfluence.com.br (Organization: Pedrovaleriolopez)
```

### Execution from Windows

**Important:** Always use the WSL wrapper pattern:

```bash
wsl bash -c 'cd /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack && ~/.local/bin/coderabbit --prompt-only -t uncommitted'
```

### Command Reference

| Command | Purpose | Duration |
|---------|---------|----------|
| `--prompt-only -t uncommitted` | Review uncommitted changes | 7-30 min |
| `--prompt-only -t committed` | Review committed changes | 7-30 min |
| `--prompt-only --base main` | Review against main branch | 7-30 min |
| `--prompt-only -t all` | Review all changes | 15-45 min |
| `auth status` | Check authentication | Instant |
| `--version` | Check installed version | Instant |

### Output Modes

| Flag | Output Format | Best For |
|------|---------------|----------|
| `--prompt-only` | Structured text for AI | Agent consumption |
| `--plain` | Detailed human-readable | Manual review |
| `--json` | JSON structured | Programmatic parsing |

### Timeout Configuration

```yaml
# Recommended timeouts
default: 900000  # 15 minutes
max: 1800000     # 30 minutes (large reviews)
```

---

## 4. GitHub App Mode: PR Reviews

### How It Works

1. Developer creates PR on GitHub
2. CodeRabbit GitHub App triggers automatically
3. App analyzes PR with MCP context
4. Comments appear inline on PR within ~30 seconds
5. Summary comment with high-level overview

### Installation Status

| Step | Status | Action |
|------|--------|--------|
| GitHub App installed | ✅ Complete | Installed from GitHub Marketplace |
| Repository authorized | ✅ Complete | `aios-fullstack` repository authorized |
| .coderabbit.yaml created | ✅ Complete | Configuration in project root |

### Comment Types

1. **Inline Comments** - Specific code suggestions
2. **Summary Comment** - High-level PR overview
3. **Walkthrough** - File-by-file changes explanation

### Interacting with CodeRabbit

```markdown
# Request re-review after fixes
@coderabbitai review

# Dismiss a suggestion
@coderabbitai ignore - This pattern is intentional for backward compatibility

# Ask for clarification
@coderabbitai explain why this is a security risk

# Pause reviews on PR
@coderabbitai pause

# Resume reviews
@coderabbitai resume
```

---

## 5. Agent Integration

### @qa Agent (Quinn - Guardian)

**Role:** Pre-commit code quality validation with self-healing

**CodeRabbit Configuration:**

```yaml
# From .aios-core/agents/qa.md
coderabbit_integration:
  enabled: true
  installation_mode: wsl
  wsl_config:
    distribution: Ubuntu
    installation_path: ~/.local/bin/coderabbit
    working_directory: /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack
  commands:
    qa_pre_review_uncommitted: "wsl bash -c 'cd ... && ~/.local/bin/coderabbit --prompt-only -t uncommitted'"
    qa_story_review_committed: "wsl bash -c 'cd ... && ~/.local/bin/coderabbit --prompt-only -t committed --base main'"
  severity_handling:
    CRITICAL: Block story completion, must fix immediately
    HIGH: Report in QA gate, recommend fix before merge
    MEDIUM: Document as technical debt
    LOW: Optional improvements
```

**Primary Commands:**
- `*review {story}` - Comprehensive story review with CodeRabbit
- `*code-review {scope}` - Run CodeRabbit review directly
- `*gate {story}` - Quality gate decision

### @devops Agent (Gage - Operator)

**Role:** Pre-push validation and PR management with CodeRabbit monitoring

**CodeRabbit Configuration:**

```yaml
# From .aios-core/agents/devops.md
coderabbit_integration:
  enabled: true
  installation_mode: wsl
  wsl_config:
    distribution: Ubuntu
    installation_path: ~/.local/bin/coderabbit
    working_directory: /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack
  commands:
    pre_push_uncommitted: "wsl bash -c 'cd ... && ~/.local/bin/coderabbit --prompt-only -t uncommitted'"
    pre_pr_against_main: "wsl bash -c 'cd ... && ~/.local/bin/coderabbit --prompt-only --base main'"
  quality_gate_rules:
    CRITICAL: Block PR creation, must fix immediately
    HIGH: Warn user, recommend fix before merge
    MEDIUM: Document in PR description
    LOW: Note in comments
```

**Primary Commands:**
- `*pre-push` - Run all quality gates including CodeRabbit
- `*create-pr` - Create PR with CodeRabbit monitoring
- `*push` - Execute push after gates pass

---

## 6. Self-Healing Workflows

### Concept

Self-healing is an autonomous cycle where the AI agent:
1. Runs CodeRabbit CLI
2. Parses issues by severity
3. Fixes CRITICAL issues automatically
4. Repeats until clean (max 3 iterations)
5. Ignores "nits" (LOW severity)

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SELF-HEALING LOOP                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  START                                                              │
│    ↓                                                                │
│  ┌──────────────────────────────────┐                              │
│  │ 1. Run CodeRabbit CLI            │                              │
│  │    --prompt-only -t uncommitted  │                              │
│  └──────────────┬───────────────────┘                              │
│                 ↓                                                   │
│  ┌──────────────────────────────────┐                              │
│  │ 2. Parse Output                  │                              │
│  │    - Count CRITICAL issues       │                              │
│  │    - Count HIGH issues           │                              │
│  │    - Count MEDIUM/LOW (nits)     │                              │
│  └──────────────┬───────────────────┘                              │
│                 ↓                                                   │
│  ┌──────────────────────────────────┐                              │
│  │ 3. Decision Point                │                              │
│  └──────────────┬───────────────────┘                              │
│                 │                                                   │
│     ┌───────────┼───────────┐                                      │
│     ↓           ↓           ↓                                      │
│  CRITICAL>0  HIGH>0      NITS ONLY                                 │
│     │           │           │                                      │
│     ↓           ↓           ↓                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐                                 │
│  │ FIX    │ │ ASK    │ │ IGNORE │                                 │
│  │ AUTO   │ │ USER   │ │ PROCEED│                                 │
│  └───┬────┘ └───┬────┘ └───┬────┘                                 │
│      │          │          │                                       │
│      ↓          ↓          ↓                                       │
│  iteration++ ───────────────────→ END                              │
│      │                            (with summary)                   │
│      ↓                                                             │
│  iteration < 3?                                                    │
│      │                                                             │
│    YES → Loop back to Step 1                                       │
│    NO  → END with warning                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Agent Instruction Template

```markdown
Implement {feature description}. Then:

1. Run CodeRabbit validation:
   `wsl bash -c 'cd /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack && ~/.local/bin/coderabbit --prompt-only -t uncommitted'`

2. If CRITICAL issues found:
   - Fix them immediately
   - Run CodeRabbit again
   - Repeat max 3 times

3. If only HIGH issues:
   - Ask me if I want them fixed

4. If only MEDIUM/LOW (nits):
   - Ignore and proceed

5. Provide summary:
   - What was implemented
   - What issues were found
   - What was fixed
   - What was ignored
```

### Configuration

```yaml
self_healing:
  enabled: true
  max_iterations: 3
  fix_levels:
    CRITICAL: always      # Auto-fix without asking
    HIGH: ask_user        # Ask before fixing
    MEDIUM: ignore        # Document but don't fix
    LOW: ignore           # Ignore completely
  summary_required: true
```

---

## 7. MCP Enrichment

### What are MCPs?

Model Context Protocol (MCP) servers provide external context to CodeRabbit, enabling business-aware reviews instead of purely syntactic analysis.

### Available MCPs

| MCP | Purpose | Value for AIOS |
|-----|---------|----------------|
| **ClickUp** | Validate PR resolves linked task | Story traceability |
| **Context7** | Up-to-date library documentation | Anti-hallucination for new libs |
| **Sentry** | Production error context | Prevent regression |
| **DeepWiki** | Internal documentation | Architecture compliance |
| **Linear** | Issue tracking | Ticket validation |

### MCP Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MCP ENRICHMENT FLOW                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   ClickUp    │    │   Context7   │    │    Sentry    │          │
│  │   (Tasks)    │    │   (Docs)     │    │   (Errors)   │          │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘          │
│         │                   │                   │                   │
│         └─────────────┬─────┴─────────────┬─────┘                   │
│                       ↓                   ↓                         │
│              ┌─────────────────────────────────┐                    │
│              │     CodeRabbit GitHub App       │                    │
│              │                                 │                    │
│              │  PR Analysis + MCP Context:     │                    │
│              │  - Does code match ClickUp task?│                    │
│              │  - Are library APIs correct?    │                    │
│              │  - Could this reintroduce bug?  │                    │
│              └─────────────────────────────────┘                    │
│                             ↓                                       │
│              ┌─────────────────────────────────┐                    │
│              │   Contextual Review Comments    │                    │
│              │                                 │                    │
│              │  "This PR claims to fix CU-123  │                    │
│              │   but doesn't address the       │                    │
│              │   validation issue mentioned    │                    │
│              │   in the task description."     │                    │
│              └─────────────────────────────────┘                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### MCP Configuration in .coderabbit.yaml

```yaml
# Future MCP integrations (when enabled)
mcp_integrations:
  - name: 'clickup'
    enabled: true
    instructions: |
      Validate that the PR resolves the linked ClickUp task.
      Check if implementation matches task requirements.
      Flag if task ID is missing from PR description.

  - name: 'context7'
    enabled: true
    instructions: |
      Validate library API usage against current documentation.
      Flag deprecated or incorrect API calls.
      Suggest updated patterns for outdated code.

  - name: 'sentry'
    enabled: false  # Enable when production monitoring active
    instructions: |
      Check if modified files are associated with known errors.
      Warn if code might reintroduce resolved issues.
```

---

## 8. Severity Handling

### Severity Levels

| Level | Symbol | Meaning | Action |
|-------|--------|---------|--------|
| **CRITICAL** | 🔴 | Security vulnerabilities, data loss risks | **Must fix immediately** |
| **HIGH** | 🟡 | Performance issues, significant bugs | **Should fix before merge** |
| **MEDIUM** | 🔵 | Code quality, maintainability | **Document as tech debt** |
| **LOW** | ⚪ | Style, minor improvements (nits) | **Optional, can ignore** |

### Severity Rules by Gate

| Gate | CRITICAL | HIGH | MEDIUM | LOW |
|------|----------|------|--------|-----|
| **QA Review** | Block completion | Report, recommend fix | Document | Ignore |
| **Pre-Push** | Block push | Warn, ask user | Note | Ignore |
| **PR Creation** | Block PR | Warn in description | Note | Ignore |
| **GitHub App** | Request changes | Comment | Suggest | Suggest |

### Examples

**CRITICAL (Must Fix):**
```javascript
// ❌ Hardcoded credentials
const API_KEY = "sk-1234567890abcdef";

// ❌ SQL injection vulnerability
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ❌ Exposed sensitive data
console.log("User password:", user.password);
```

**HIGH (Should Fix):**
```javascript
// ⚠️ N+1 query pattern
users.forEach(user => {
  const orders = await db.query(`SELECT * FROM orders WHERE user_id = ${user.id}`);
});

// ⚠️ Missing error handling
const data = await fetch(url).then(r => r.json());

// ⚠️ Memory leak potential
setInterval(() => heavyOperation(), 100);
```

**MEDIUM (Document):**
```javascript
// 📝 Consider extracting to utility
const formattedDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

// 📝 Magic number
if (retryCount > 3) { ... }
```

**LOW (Ignore):**
```javascript
// 💡 Style suggestion: prefer const
let unused = "value";

// 💡 Consider more descriptive name
const x = calculateTotal();
```

---

## 9. Best Practices

### For @qa Agent

1. **Always run self-healing loop**
   ```
   Run CodeRabbit, fix CRITICAL, repeat max 3 times
   ```

2. **Focus on CRITICAL first**
   ```
   CRITICAL = security, data integrity → MUST FIX
   HIGH = bugs, performance → SHOULD FIX
   MEDIUM/LOW = nits → IGNORE during development
   ```

3. **Document what was ignored**
   ```markdown
   ## Self-Healing Summary
   - Fixed: 2 CRITICAL issues (SQL injection, hardcoded key)
   - Deferred: 1 HIGH issue (N+1 query - needs architecture discussion)
   - Ignored: 5 nits (style suggestions)
   ```

4. **Use QA gate file for tracking**
   ```yaml
   # docs/qa/gates/{story-id}.yml
   gate: CONCERNS
   top_issues:
     - severity: HIGH
       message: "N+1 query pattern in user service"
       suggested_owner: dev
   ```

### For @devops Agent

1. **Run CodeRabbit in pre-push**
   ```
   Block push if CRITICAL > 0
   Warn if HIGH > 0 (ask user to confirm)
   ```

2. **Monitor PR after creation**
   ```javascript
   // Wait for CodeRabbit GitHub App review
   const review = await monitorCodeRabbitPRReview(prNumber);
   if (review.hasCritical) {
     console.warn("⚠️ CodeRabbit found CRITICAL issues on PR");
   }
   ```

3. **Include CodeRabbit status in PR description**
   ```markdown
   ## Quality Gates
   - [x] Lint passed
   - [x] Tests passed
   - [x] CodeRabbit CLI: 0 CRITICAL, 0 HIGH
   - [ ] CodeRabbit GitHub App: Pending
   ```

### General Best Practices

| Practice | Why |
|----------|-----|
| **Limit iterations to 3** | Prevent infinite loops |
| **Ignore nits during dev** | Focus on critical issues first |
| **Use --prompt-only** | Output optimized for AI agents |
| **Set 15-minute timeout** | Reviews can be slow |
| **Commit frequently** | Smaller reviews = faster |
| **Use feature branches** | Isolated changes = focused reviews |

---

## 10. Metrics and ROI

### Industry Benchmarks (Heavy Users)

| Metric | Before CodeRabbit | After CodeRabbit | Improvement |
|--------|-------------------|------------------|-------------|
| Review cycle time | 3-5 days | 1-2 days | **60-70%** |
| Bugs in production | 12-15/month | 4-6/month | **60%** |
| Manual review time | 30-45 min/PR | 10-15 min/PR | **65%** |
| First-pass rejection | 35% | 15% | **57%** |

### Time Savings Calculation

```
For a team of 10 developers:
- PRs per week: 10 devs × 5 PRs = 50 PRs
- Time per PR (manual): 30 min
- Total weekly time: 50 × 30 = 1,500 min = 25 hours

With CodeRabbit (65% reduction):
- Time saved: 25 × 0.65 = 16.25 hours/week
- Annual savings: 16.25 × 52 = 845 hours/year

At $100/hour:
- Annual value: $84,500
```

### ROI Formula

```
ROI = (Time Saved × Hourly Rate + Bug Prevention Value) / CodeRabbit Cost × 100%

Example:
- Time saved: $84,500
- Bug prevention: $20,000 (estimated)
- CodeRabbit cost: $4,800/year (10 devs × $40/month × 12)

ROI = ($84,500 + $20,000) / $4,800 × 100% = 2,177%
```

### AIOS-Specific Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Self-healing success rate | >80% | Issues fixed without human intervention |
| CLI review coverage | 100% | All stories pass through @qa review |
| PR monitoring coverage | 100% | All PRs have GitHub App review |
| CRITICAL issues caught | Track trend | Count per sprint |
| Average iterations | <2 | Self-healing loop iterations |

---

## Next Steps

1. **Install GitHub App** - [GitHub Marketplace](https://github.com/apps/coderabbit-ai)
2. **Create .coderabbit.yaml** - See [Configuration Reference](./coderabbit-configuration-reference.md)
3. **Update agent tasks** - Implement self-healing and PR monitoring
4. **Enable MCPs** - Start with ClickUp integration

---

## References

### External Documentation
- [CodeRabbit CLI Overview](https://docs.coderabbit.ai/cli/overview)
- [CodeRabbit Configuration Reference](https://docs.coderabbit.ai/reference/configuration)
- [MCP Server Integrations](https://docs.coderabbit.ai/context-enrichment/mcp-server-integrations)
- [Cursor Integration](https://docs.coderabbit.ai/cli/cursor-integration)
- [Claude Code Integration](https://docs.coderabbit.ai/cli/claude-code-integration)

### AIOS Documentation
- [README](./README.md) - Documentation index
- [Configuration Reference](./coderabbit-configuration-reference.md)
- [Workflows](./coderabbit-workflows.md)
- [Troubleshooting](./coderabbit-troubleshooting.md)

---

**Maintainer:** @architect (Aria)
**Last Updated:** 2025-11-28
**Version:** 1.0.0
