# CodeRabbit Workflows for AIOS Agents

> **Version:** 1.0.0 | **Last Updated:** 2025-11-28 | **Status:** Source of Truth

## Table of Contents

1. [Overview](#1-overview)
2. [@qa Agent Workflows](#2-qa-agent-workflows)
3. [@devops Agent Workflows](#3-devops-agent-workflows)
4. [Self-Healing Workflow](#4-self-healing-workflow)
5. [PR Monitoring Workflow](#5-pr-monitoring-workflow)
6. [Orchestration Scripts](#6-orchestration-scripts)

---

## 1. Overview

### Workflow Types

| Workflow | Agent | Trigger | Purpose |
|----------|-------|---------|---------|
| Story Review | @qa | `*review {story}` | Comprehensive code quality review |
| Code Review | @qa | `*code-review` | Direct CodeRabbit execution |
| Pre-Push | @devops | `*pre-push` | Quality gate before pushing |
| Create PR | @devops | `*create-pr` | PR creation with monitoring |
| Self-Healing | @qa, @devops | Automatic | Fix issues autonomously |
| PR Monitoring | @devops | After PR creation | Watch GitHub App review |

### Workflow Decision Tree

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CODERABBIT WORKFLOW SELECTION                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  START: What do you need to do?                                         │
│         │                                                                │
│         ├── Validate code quality?                                       │
│         │   └── Use @qa *review {story}                                 │
│         │                                                                │
│         ├── Quick CodeRabbit check?                                      │
│         │   └── Use @qa *code-review                                    │
│         │                                                                │
│         ├── Ready to push?                                               │
│         │   └── Use @devops *pre-push                                   │
│         │                                                                │
│         ├── Create PR?                                                   │
│         │   └── Use @devops *create-pr                                  │
│         │                                                                │
│         └── Monitor existing PR?                                         │
│             └── Use @devops *monitor-pr {number}                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. @qa Agent Workflows

### Workflow 2.1: Story Review (`*review {story}`)

**Purpose:** Comprehensive quality review of story implementation

**Trigger:** `@qa *review story-2.3`

**Flow:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     @QA STORY REVIEW WORKFLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. LOAD STORY                                                          │
│     └── Read docs/stories/{story-id}.md                                 │
│     └── Extract acceptance criteria                                      │
│     └── Identify files to review                                         │
│                                                                          │
│  2. RUN CODERABBIT CLI                                                  │
│     └── wsl bash -c 'cd /mnt/c/... && coderabbit --prompt-only          │
│         -t uncommitted'                                                  │
│     └── Timeout: 15 minutes                                              │
│                                                                          │
│  3. PARSE OUTPUT                                                         │
│     └── Count issues by severity                                         │
│     └── Extract file:line references                                     │
│     └── Categorize by type (security, performance, quality)             │
│                                                                          │
│  4. SELF-HEALING LOOP (if CRITICAL > 0)                                 │
│     └── Fix CRITICAL issues automatically                               │
│     └── Re-run CodeRabbit                                                │
│     └── Repeat max 3 times                                               │
│                                                                          │
│  5. GENERATE QA GATE FILE                                               │
│     └── Create docs/qa/gates/{story-id}.yml                             │
│     └── Document gate decision (GO/CONCERNS/BLOCK)                       │
│     └── List top issues and owners                                       │
│                                                                          │
│  6. REPORT TO USER                                                       │
│     └── Summary of review                                                │
│     └── Issues found and fixed                                           │
│     └── Gate recommendation                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Example Execution:**

```markdown
@qa *review story-2.3

---
## QA Review: Story 2.3

### CodeRabbit Analysis
- **Duration:** 12 minutes 34 seconds
- **Files Reviewed:** 8
- **Total Issues:** 7

### Issues by Severity
| Severity | Count | Action |
|----------|-------|--------|
| CRITICAL | 1 | ✅ Fixed (iteration 1) |
| HIGH | 2 | ⚠️ Documented |
| MEDIUM | 3 | 📝 Tech debt |
| LOW | 1 | ⏭️ Ignored |

### Self-Healing Summary
- **Iterations:** 2
- **Issues Fixed:** 1 CRITICAL (hardcoded API key in config.ts:45)

### Gate Decision: CONCERNS
Top concerns:
1. N+1 query pattern in user-service.ts:78 (HIGH)
2. Missing input validation in api/users.ts:23 (HIGH)

### Files Modified
- `src/config.ts` - Removed hardcoded API key
- `docs/qa/gates/story-2.3.yml` - Created gate file
```

---

### Workflow 2.2: Code Review (`*code-review`)

**Purpose:** Direct CodeRabbit execution without story context

**Trigger:** `@qa *code-review` or `@qa *code-review uncommitted`

**Flow:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     @QA CODE REVIEW WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. DETERMINE SCOPE                                                     │
│     └── uncommitted (default): Review staged + unstaged changes         │
│     └── committed: Review committed but not pushed                       │
│     └── all: Review all changes vs main                                  │
│                                                                          │
│  2. RUN CODERABBIT CLI                                                  │
│     └── wsl bash -c 'cd /mnt/c/... && coderabbit --prompt-only          │
│         -t {scope}'                                                      │
│     └── Timeout: 15 minutes                                              │
│                                                                          │
│  3. PARSE AND REPORT                                                     │
│     └── Display issues by severity                                       │
│     └── Provide file:line references                                     │
│     └── Suggest fixes for CRITICAL/HIGH                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. @devops Agent Workflows

### Workflow 3.1: Pre-Push Quality Gate (`*pre-push`)

**Purpose:** Validate code quality before pushing to remote

**Trigger:** `@devops *pre-push`

**Flow:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   @DEVOPS PRE-PUSH WORKFLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. RUN STANDARD GATES                                                  │
│     ├── npm run lint                                                     │
│     ├── npm run typecheck                                                │
│     └── npm test                                                         │
│                                                                          │
│  2. RUN CODERABBIT CLI                                                  │
│     └── wsl bash -c 'cd /mnt/c/... && coderabbit --prompt-only          │
│         -t uncommitted'                                                  │
│     └── Timeout: 15 minutes                                              │
│                                                                          │
│  3. EVALUATE GATES                                                       │
│     ├── Lint: PASS/FAIL                                                  │
│     ├── Typecheck: PASS/FAIL                                             │
│     ├── Tests: PASS/FAIL                                                 │
│     └── CodeRabbit:                                                      │
│         ├── CRITICAL > 0: BLOCK                                          │
│         ├── HIGH > 0: WARN (ask user)                                    │
│         └── MEDIUM/LOW only: PASS                                        │
│                                                                          │
│  4. SELF-HEALING (if CRITICAL)                                          │
│     └── Fix CRITICAL issues automatically                               │
│     └── Re-run CodeRabbit                                                │
│     └── Repeat max 3 times                                               │
│                                                                          │
│  5. GATE DECISION                                                        │
│     ├── All PASS: Ready to push                                          │
│     ├── WARN: Ask user to confirm                                        │
│     └── BLOCK: Cannot push, list blockers                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Example Output:**

```markdown
@devops *pre-push

---
## Pre-Push Quality Gate

### Gate Results
| Gate | Status | Details |
|------|--------|---------|
| Lint | ✅ PASS | No errors |
| Typecheck | ✅ PASS | No errors |
| Tests | ✅ PASS | 47/47 passed |
| CodeRabbit | ⚠️ WARN | 0 CRITICAL, 2 HIGH |

### CodeRabbit Issues
1. **HIGH:** Missing error boundary in UserProfile.tsx:89
2. **HIGH:** Unhandled promise rejection in api/fetch.ts:34

### Decision: WARN
Push is possible but 2 HIGH issues should be addressed.

**Options:**
1. Fix issues and re-run pre-push
2. Proceed with push (acknowledge risks)
3. Cancel
```

---

### Workflow 3.2: Create PR (`*create-pr`)

**Purpose:** Create PR with CodeRabbit GitHub App monitoring

**Trigger:** `@devops *create-pr`

**Flow:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   @DEVOPS CREATE PR WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. VERIFY PRE-PUSH GATE                                                │
│     └── Ensure *pre-push was run and passed                             │
│     └── If not, run *pre-push first                                     │
│                                                                          │
│  2. COLLECT PR METADATA                                                  │
│     ├── Branch name                                                      │
│     ├── Commit history                                                   │
│     ├── Story ID (from branch name or commits)                          │
│     └── Files changed                                                    │
│                                                                          │
│  3. GENERATE PR DESCRIPTION                                              │
│     ├── ## Summary                                                       │
│     │   └── Brief description from commits                              │
│     ├── ## Story Reference                                               │
│     │   └── Link to ClickUp task                                        │
│     ├── ## Changes                                                       │
│     │   └── File list with descriptions                                 │
│     ├── ## Quality Gates                                                 │
│     │   └── Pre-push results                                            │
│     └── ## Testing                                                       │
│         └── Test instructions                                            │
│                                                                          │
│  4. CREATE PR                                                            │
│     └── gh pr create --title "..." --body "..." --base main             │
│     └── Capture PR number and URL                                        │
│                                                                          │
│  5. MONITOR CODERABBIT GITHUB APP                                        │
│     └── Wait for CodeRabbit review (timeout: 5 minutes)                 │
│     └── Poll: gh api repos/{owner}/{repo}/pulls/{pr}/reviews            │
│     └── Parse CodeRabbit comments                                        │
│                                                                          │
│  6. REPORT RESULTS                                                       │
│     ├── PR URL                                                           │
│     ├── GitHub App review summary                                        │
│     └── Any CRITICAL issues from app review                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Example Output:**

```markdown
@devops *create-pr

---
## PR Created Successfully

### PR Details
- **URL:** https://github.com/allfluence/aios-fullstack/pull/42
- **Branch:** feature/story-2.3-user-authentication
- **Base:** main

### Quality Gates (Pre-Push)
- [x] Lint passed
- [x] Typecheck passed
- [x] Tests passed (47/47)
- [x] CodeRabbit CLI: 0 CRITICAL, 0 HIGH

### GitHub App Review
⏳ Waiting for CodeRabbit GitHub App...

[After 45 seconds]

✅ CodeRabbit GitHub App review received:
- **Summary:** Implementation looks good overall
- **Comments:** 3 suggestions (all LOW severity)
- **Verdict:** Approved

### Next Steps
- PR is ready for human review
- Assign reviewers as needed
- Merge when approved
```

---

## 4. Self-Healing Workflow

### Self-Healing Matrix by Agent (Story 6.3.3)

| Agent | Type | Max Iterations | Timeout | Severity Filter | Behavior |
|-------|------|----------------|---------|-----------------|----------|
| **@dev** | Light | 2 | 15 min | CRITICAL only | Auto-fix at story completion |
| **@qa** | Full | 3 | 30 min | CRITICAL + HIGH | Full self-healing loop |
| **@devops** | Check | 0 | 15 min | All (report only) | Warning, no auto-fix |

### Agent-Specific Workflows

#### @dev Light Self-Healing

**When:** Before marking story "Ready for Review"

```
iteration = 0, max = 2

WHILE iteration < 2:
  1. Run CodeRabbit (uncommitted)
  2. IF no CRITICAL → Document HIGH in Dev Notes → PASS
  3. IF CRITICAL → Auto-fix → iteration++

IF CRITICAL remains → HALT, require manual fix
```

**Severity Handling:**
- CRITICAL: Auto-fix (2 attempts)
- HIGH: Document only
- MEDIUM/LOW: Ignore

#### @qa Full Self-Healing

**When:** During `*review {story}` command

```
iteration = 0, max = 3

WHILE iteration < 3:
  1. Run CodeRabbit (committed --base main)
  2. IF no CRITICAL/HIGH:
     - Create tech debt issues for MEDIUM
     - PASS → Proceed to manual review
  3. IF CRITICAL/HIGH → Auto-fix → iteration++

IF issues remain → Gate = FAIL, require intervention
```

**Severity Handling:**
- CRITICAL: Auto-fix (3 attempts)
- HIGH: Auto-fix (3 attempts)
- MEDIUM: Create tech debt issue
- LOW: Note in review

#### @devops Check-Only

**When:** During `*pre-push` command

```
1. Run CodeRabbit (uncommitted)
2. Parse all severity levels
3. Report results:
   - CRITICAL > 0 → BLOCK push
   - HIGH > 0 → WARN, ask user
   - MEDIUM/LOW → PASS with notes
4. NO auto-fix (final gate, not for fixes)
```

**Severity Handling:**
- CRITICAL: Block push
- HIGH: Warn, user decides
- MEDIUM/LOW: Report only

---

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SELF-HEALING WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ENTRY CONDITIONS:                                                      │
│  - CodeRabbit found CRITICAL issues                                     │
│  - Self-healing is enabled in agent config                              │
│  - Iteration count < max_iterations (3)                                 │
│                                                                          │
│  ITERATION LOOP:                                                        │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ITERATION {n}/3                                                 │   │
│  │                                                                  │   │
│  │  1. Parse CRITICAL issues from CodeRabbit output                │   │
│  │     └── Extract: file, line, description, fix suggestion        │   │
│  │                                                                  │   │
│  │  2. For each CRITICAL issue:                                     │   │
│  │     a. Read the affected file                                   │   │
│  │     b. Understand the issue context                             │   │
│  │     c. Apply the fix                                            │   │
│  │     d. Log the change                                           │   │
│  │                                                                  │   │
│  │  3. Run CodeRabbit again                                         │   │
│  │     └── wsl bash -c 'cd ... && coderabbit --prompt-only         │   │
│  │         -t uncommitted'                                          │   │
│  │                                                                  │   │
│  │  4. Evaluate:                                                    │   │
│  │     ├── CRITICAL = 0: EXIT SUCCESS                              │   │
│  │     ├── CRITICAL < previous: Continue to next iteration         │   │
│  │     └── CRITICAL >= previous: EXIT WARNING (possible loop)      │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  EXIT CONDITIONS:                                                       │
│  - SUCCESS: No CRITICAL issues remaining                                │
│  - WARNING: Max iterations reached with issues remaining                │
│  - ERROR: Issue count not decreasing (possible infinite loop)           │
│                                                                          │
│  OUTPUT:                                                                │
│  - List of fixed issues                                                 │
│  - List of remaining issues (if any)                                    │
│  - Files modified                                                        │
│  - Iteration count                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Self-Healing Rules

| Severity | Auto-Fix? | Condition |
|----------|-----------|-----------|
| CRITICAL | Yes | Always fix without asking |
| HIGH | Ask | Present options to user |
| MEDIUM | No | Document only |
| LOW | No | Ignore completely |

### Example Fix Types

**CRITICAL - Security:**
```javascript
// ❌ Before (hardcoded secret)
const API_KEY = "sk-1234567890";

// ✅ After (environment variable)
const API_KEY = process.env.API_KEY;
```

**CRITICAL - SQL Injection:**
```javascript
// ❌ Before
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ After
const query = `SELECT * FROM users WHERE id = ?`;
const result = await db.query(query, [userId]);
```

**CRITICAL - XSS:**
```jsx
// ❌ Before
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ After
<div>{sanitizeHtml(userInput)}</div>
```

---

## 5. PR Monitoring Workflow

### Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PR MONITORING WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  TRIGGER: After PR creation or *monitor-pr {number}                     │
│                                                                          │
│  1. INITIAL WAIT                                                        │
│     └── Wait 30 seconds for GitHub App to detect PR                     │
│                                                                          │
│  2. POLL FOR REVIEW                                                      │
│     └── Every 15 seconds, check:                                        │
│         gh api repos/{owner}/{repo}/pulls/{pr}/reviews                  │
│     └── Look for review from "coderabbit[bot]"                          │
│     └── Timeout: 5 minutes                                               │
│                                                                          │
│  3. IF REVIEW FOUND:                                                     │
│     a. Fetch review comments:                                            │
│        gh api repos/{owner}/{repo}/pulls/{pr}/comments                  │
│     b. Parse comments by severity                                        │
│     c. Extract actionable items                                          │
│                                                                          │
│  4. REPORT TO USER:                                                      │
│     ├── Review verdict (approved/changes_requested)                     │
│     ├── Summary of findings                                              │
│     ├── CRITICAL issues (if any)                                        │
│     └── Suggested actions                                                │
│                                                                          │
│  5. IF CRITICAL ISSUES FROM APP:                                         │
│     └── Offer to trigger self-healing                                   │
│     └── After fixes, push and wait for re-review                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### GitHub API Commands

```bash
# Get PR reviews
gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews

# Get PR comments
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments

# Get PR review comments (inline)
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments

# Request re-review (via comment)
gh pr comment {pr_number} --body "@coderabbitai review"
```

---

## 6. Orchestration Scripts

### Master Workflow Script

```bash
#!/bin/bash
# AIOS CodeRabbit Orchestration Script
# Usage: ./coderabbit-orchestrate.sh [workflow] [options]

set -e

WORKFLOW=$1
STORY_ID=$2
MAX_ITERATIONS=3
TIMEOUT=900  # 15 minutes

# WSL wrapper function
run_coderabbit() {
    local scope=$1
    wsl bash -c "cd /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack && ~/.local/bin/coderabbit --prompt-only -t $scope"
}

# Parse severity counts
parse_severity() {
    local output=$1
    CRITICAL=$(echo "$output" | grep -c "CRITICAL" || echo 0)
    HIGH=$(echo "$output" | grep -c "HIGH" || echo 0)
    MEDIUM=$(echo "$output" | grep -c "MEDIUM" || echo 0)
    LOW=$(echo "$output" | grep -c "LOW" || echo 0)
}

# Self-healing loop
self_heal() {
    local iteration=0
    local output=""

    while [ $iteration -lt $MAX_ITERATIONS ]; do
        echo "🔄 Self-healing iteration $((iteration + 1))/$MAX_ITERATIONS"

        output=$(run_coderabbit "uncommitted")
        parse_severity "$output"

        if [ "$CRITICAL" -eq 0 ]; then
            echo "✅ No CRITICAL issues remaining"
            return 0
        fi

        echo "⚠️ Found $CRITICAL CRITICAL issues, attempting fixes..."
        # Trigger agent to fix issues
        # (This would be handled by the AI agent)

        iteration=$((iteration + 1))
    done

    echo "❌ Max iterations reached with $CRITICAL CRITICAL issues remaining"
    return 1
}

# Main workflows
case $WORKFLOW in
    "review")
        echo "📋 Starting story review for $STORY_ID"
        run_coderabbit "uncommitted"
        ;;
    "pre-push")
        echo "🚀 Running pre-push quality gate"
        npm run lint
        npm run typecheck
        npm test
        run_coderabbit "uncommitted"
        ;;
    "self-heal")
        echo "🔧 Starting self-healing workflow"
        self_heal
        ;;
    *)
        echo "Usage: $0 [review|pre-push|self-heal] [story-id]"
        exit 1
        ;;
esac
```

### PR Monitoring Script

```bash
#!/bin/bash
# PR Monitoring Script
# Usage: ./monitor-pr.sh [pr_number]

PR_NUMBER=$1
OWNER="allfluence"
REPO="aios-fullstack"
TIMEOUT=300  # 5 minutes
INTERVAL=15  # 15 seconds

echo "👀 Monitoring PR #$PR_NUMBER for CodeRabbit review..."

start_time=$(date +%s)

while true; do
    # Check for CodeRabbit review
    reviews=$(gh api repos/$OWNER/$REPO/pulls/$PR_NUMBER/reviews 2>/dev/null)

    coderabbit_review=$(echo "$reviews" | jq '.[] | select(.user.login == "coderabbit[bot]")')

    if [ -n "$coderabbit_review" ]; then
        echo "✅ CodeRabbit review found!"

        # Get review details
        state=$(echo "$coderabbit_review" | jq -r '.state')
        body=$(echo "$coderabbit_review" | jq -r '.body')

        echo "Review state: $state"
        echo "Summary: $body"

        # Get comments
        comments=$(gh api repos/$OWNER/$REPO/pulls/$PR_NUMBER/comments)
        comment_count=$(echo "$comments" | jq 'length')

        echo "Comments: $comment_count"

        exit 0
    fi

    # Check timeout
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))

    if [ $elapsed -ge $TIMEOUT ]; then
        echo "⏰ Timeout waiting for CodeRabbit review"
        exit 1
    fi

    echo "⏳ Waiting... ($elapsed/$TIMEOUT seconds)"
    sleep $INTERVAL
done
```

---

## Quick Reference

### Agent Commands

| Command | Agent | Purpose |
|---------|-------|---------|
| `*review {story}` | @qa | Full story review with CodeRabbit |
| `*code-review` | @qa | Direct CodeRabbit CLI execution |
| `*pre-push` | @devops | Quality gate before push |
| `*create-pr` | @devops | Create PR with monitoring |
| `*monitor-pr {num}` | @devops | Monitor existing PR |

### CLI Commands

```bash
# Uncommitted changes (default)
wsl bash -c 'cd /mnt/c/... && ~/.local/bin/coderabbit --prompt-only -t uncommitted'

# Committed changes
wsl bash -c 'cd /mnt/c/... && ~/.local/bin/coderabbit --prompt-only -t committed'

# Against main branch
wsl bash -c 'cd /mnt/c/... && ~/.local/bin/coderabbit --prompt-only --base main'

# All changes
wsl bash -c 'cd /mnt/c/... && ~/.local/bin/coderabbit --prompt-only -t all'
```

---

## References

- [Integration Guide](./coderabbit-integration-guide.md) - Main documentation
- [Configuration Reference](./coderabbit-configuration-reference.md) - Settings
- [Troubleshooting](./coderabbit-troubleshooting.md) - Common issues

---

**Maintainer:** @architect (Aria)
**Last Updated:** 2025-11-28
**Version:** 1.0.0
