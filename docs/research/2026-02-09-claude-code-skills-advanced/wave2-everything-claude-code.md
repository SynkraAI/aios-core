# Deep Dive: everything-claude-code Repository Analysis

> **Repository:** [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)
> **Stars:** 42,927 | **Forks:** 5,313 | **Contributors:** 24+
> **Created:** 2026-01-18 | **Last Updated:** 2026-02-09
> **License:** MIT | **Languages:** JavaScript, Shell, Python, TypeScript, Go, Java
> **Creator:** Affaan Mustafa (Anthropic x Forum Ventures hackathon winner, Sep 2025)
> **Product built with it:** [zenith.chat](https://zenith.chat)

---

## TL;DR

everything-claude-code (ECC) is the most comprehensive public Claude Code configuration repository, representing 10+ months of daily production use. Its key innovations are:

1. **Instinct-based Continuous Learning (v2)**: Hooks capture every tool call, a background observer extracts atomic "instincts" with confidence scoring (0.3-0.9), and `/evolve` clusters them into skills/commands/agents
2. **Four-Layer Architecture**: User-facing (commands/rules) -> Intelligence (agents/skills) -> Automation (hooks) -> Learning (continuous-learning v1+v2)
3. **Multi-Agent Orchestration**: 13 specialized agents with bounded tool permissions, orchestrated through `/orchestrate` with sequential handoff documents
4. **Session Memory Persistence**: Hooks on SessionStart/SessionEnd/PreCompact automatically save and restore context across sessions
5. **Context Window Management**: Explicit strategy to keep under 80 active tools, with strategic manual compaction via suggest-compact hooks
6. **Plugin Distribution Model**: Installable as a Claude Code plugin (`/plugin install`), making the entire setup shareable and reproducible

---

## Table of Contents

1. [Repository Structure](#1-repository-structure)
2. [The Four-Layer Architecture](#2-the-four-layer-architecture)
3. [Continuous Learning System (v1 and v2)](#3-continuous-learning-system)
4. [Agent Architecture (13 Specialists)](#4-agent-architecture)
5. [Skills System (28+ Skills)](#5-skills-system)
6. [Commands System (30+ Commands)](#6-commands-system)
7. [Hooks System (7 Event Types)](#7-hooks-system)
8. [Rules System (Multi-Language)](#8-rules-system)
9. [Contexts (Dynamic System Prompt Injection)](#9-contexts)
10. [Session & Memory Management](#10-session--memory-management)
11. [Multi-Agent Orchestration](#11-multi-agent-orchestration)
12. [Skill Creator & ecc.tools](#12-skill-creator--ecctools)
13. [Example CLAUDE.md Templates](#13-example-claudemd-templates)
14. [Token Economy & Context Management](#14-token-economy--context-management)
15. [Cross-Platform & Plugin System](#15-cross-platform--plugin-system)
16. [Patterns Adoptable by MMOS](#16-patterns-adoptable-by-mmos)
17. [Gaps and Limitations](#17-gaps-and-limitations)

---

## 1. Repository Structure

```
everything-claude-code/
├── .claude-plugin/              # Plugin manifest for marketplace
│   ├── plugin.json              # Component declarations
│   ├── marketplace.json         # Marketplace metadata
│   └── README.md
├── .claude/
│   └── package-manager.json     # Package manager config
├── agents/                      # 13 specialized subagent definitions
│   ├── planner.md
│   ├── architect.md
│   ├── tdd-guide.md
│   ├── code-reviewer.md
│   ├── security-reviewer.md
│   ├── build-error-resolver.md
│   ├── e2e-runner.md
│   ├── refactor-cleaner.md
│   ├── doc-updater.md
│   ├── go-reviewer.md
│   ├── go-build-resolver.md
│   ├── python-reviewer.md
│   └── database-reviewer.md
├── commands/                    # 30+ slash commands
│   ├── learn.md                 # Extract patterns from session
│   ├── evolve.md                # Cluster instincts into skills
│   ├── instinct-status.md       # View instincts with confidence
│   ├── instinct-import.md       # Import instincts from others
│   ├── instinct-export.md       # Export instincts for sharing
│   ├── plan.md                  # Planning with planner agent
│   ├── orchestrate.md           # Sequential agent workflows
│   ├── checkpoint.md            # Git-based state snapshots
│   ├── sessions.md              # Session history management
│   ├── skill-create.md          # Generate skills from git history
│   ├── tdd.md                   # TDD workflow
│   ├── code-review.md           # Code review workflow
│   ├── build-fix.md             # Build error resolution
│   ├── e2e.md                   # E2E testing
│   ├── verify.md                # Verification loop
│   ├── eval.md                  # Evaluation harness
│   ├── refactor-clean.md        # Dead code removal
│   ├── update-codemaps.md       # Documentation refresh
│   ├── update-docs.md           # Docs update
│   ├── security.md              # Security audit
│   ├── pm2.md                   # PM2 service management
│   ├── multi-plan.md            # Multi-model planning
│   ├── multi-execute.md         # Multi-model execution
│   ├── multi-backend.md         # Backend-focused multi-model
│   ├── multi-frontend.md        # Frontend-focused multi-model
│   ├── multi-workflow.md        # Full workflow multi-model
│   ├── setup-pm.md              # Package manager setup
│   ├── go-build.md / go-review.md / go-test.md
│   └── python-review.md
├── skills/                      # 28+ workflow definitions
│   ├── continuous-learning/     # v1: Stop hook based
│   │   ├── SKILL.md
│   │   ├── config.json
│   │   └── evaluate-session.sh
│   ├── continuous-learning-v2/  # v2: Instinct-based (primary)
│   │   ├── SKILL.md
│   │   ├── config.json
│   │   ├── agents/
│   │   │   ├── observer.md      # Background Haiku observer
│   │   │   └── start-observer.sh
│   │   ├── hooks/
│   │   │   └── observe.sh       # PreToolUse/PostToolUse hook
│   │   └── scripts/
│   │       ├── instinct-cli.py  # CLI for status/import/export/evolve
│   │       └── test_parse_instinct.py
│   ├── strategic-compact/       # Manual compaction strategy
│   │   ├── SKILL.md
│   │   └── suggest-compact.sh
│   ├── iterative-retrieval/     # Progressive context refinement
│   ├── verification-loop/       # 6-phase verification
│   ├── eval-harness/            # Eval-driven development
│   ├── coding-standards/        # TS/JS/React/Node standards
│   ├── backend-patterns/        # API/DB/caching patterns
│   ├── frontend-patterns/       # React/Next.js patterns
│   ├── tdd-workflow/            # Red-Green-Refactor
│   ├── security-review/         # Security checklist + cloud-infra
│   ├── configure-ecc/           # Interactive installation wizard
│   ├── django-*/                # 4 Django skills
│   ├── springboot-*/            # 4 Spring Boot skills
│   ├── golang-*/                # 2 Go skills
│   ├── python-*/                # 2 Python skills
│   ├── java-coding-standards/
│   ├── jpa-patterns/
│   ├── clickhouse-io/
│   ├── postgres-patterns/
│   ├── nutrient-document-processing/
│   └── project-guidelines-example/
├── rules/                       # Multi-language rule hierarchy
│   ├── common/                  # Language-agnostic
│   │   ├── agents.md
│   │   ├── coding-style.md
│   │   ├── git-workflow.md
│   │   ├── hooks.md
│   │   ├── patterns.md
│   │   ├── performance.md
│   │   ├── security.md
│   │   └── testing.md
│   ├── typescript/              # TS-specific rules
│   ├── python/                  # Python-specific rules
│   └── golang/                  # Go-specific rules
├── hooks/
│   └── hooks.json               # Central hook configuration
├── contexts/                    # Dynamic system prompt injection
│   ├── dev.md                   # Implementation mode
│   ├── research.md              # Exploration mode
│   └── review.md                # Code review mode
├── scripts/
│   ├── hooks/                   # Hook implementations (Node.js)
│   │   ├── session-start.js
│   │   ├── session-end.js
│   │   ├── evaluate-session.js
│   │   ├── pre-compact.js
│   │   ├── suggest-compact.js
│   │   └── check-console-log.js
│   ├── lib/                     # Shared utilities
│   │   ├── session-manager.js
│   │   ├── session-aliases.js
│   │   ├── package-manager.js
│   │   └── utils.js
│   ├── setup-package-manager.js
│   └── skill-create-output.js
├── examples/
│   ├── CLAUDE.md                # Example project CLAUDE.md
│   ├── user-CLAUDE.md           # Example user-level CLAUDE.md
│   └── sessions/               # Example session files
├── mcp-configs/
│   └── mcp-servers.json         # Pre-configured MCP servers
├── the-shortform-guide.md       # Quick reference guide
├── the-longform-guide.md        # Advanced deep-dive guide
├── llms.txt                     # Machine-readable project index
└── tests/                       # Validation suite
```

**Key Observation:** The repository is not just a collection of dotfiles -- it is a fully distributable plugin with marketplace support, CI validation, tests, and documentation in 3 languages (English, Simplified Chinese, Traditional Chinese).

---

## 2. The Four-Layer Architecture

ECC implements a clear four-layer separation of concerns:

```
Layer 4: LEARNING
├── continuous-learning-v1 (Stop hook, session-level)
└── continuous-learning-v2 (PreToolUse/PostToolUse, instinct-level)
        │
Layer 3: AUTOMATION
├── hooks.json (7 event types)
├── session-start.js (context restoration)
├── session-end.js (state persistence)
├── pre-compact.js (state snapshot)
├── suggest-compact.js (strategic timing)
├── evaluate-session.js (pattern extraction)
└── check-console-log.js (quality gate)
        │
Layer 2: INTELLIGENCE
├── 13 agents (bounded tool permissions)
└── 28+ skills (domain knowledge repositories)
        │
Layer 1: USER-FACING
├── 30+ commands (workflow entry points)
├── rules (behavioral constraints)
└── contexts (dynamic mode switching)
```

**Design Principle:** Each layer only depends on layers below it. Commands invoke agents; agents use skills; hooks automate triggers; the learning layer observes everything and generates new artifacts for all other layers.

---

## 3. Continuous Learning System

This is ECC's most innovative feature. It implements TWO parallel systems:

### 3.1 Version 1: Session-Level Learning

**How it works:**
1. A `Stop` hook fires when a session ends
2. `evaluate-session.js` checks if the session had 10+ messages
3. If qualified, it extracts patterns from the session transcript
4. Patterns are saved as SKILL.md files in `~/.claude/skills/learned/`

**Pattern types detected:**
- Error resolution approaches
- User correction patterns
- Framework workarounds
- Debugging strategies
- Project-specific conventions

**Limitation:** The Stop hook is probabilistic -- skills fire ~50-80% of the time based on Claude's judgment.

**File:** `skills/continuous-learning/SKILL.md`

### 3.2 Version 2: Instinct-Based Learning (Primary)

**The Instinct Model:**

An "instinct" is an atomic learned behavior with confidence scoring:

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7
domain: "code-style"
source: "session-observation"
---

# Prefer Functional Style

## Action
Use functional patterns over classes when appropriate.

## Evidence
- Observed 5 instances of functional pattern preference
- User corrected class-based approach to functional on 2025-01-15
```

**Properties:**
- **Atomic**: One trigger, one action
- **Confidence-weighted**: 0.3 = tentative, 0.5 = moderate, 0.7 = strong (auto-approved), 0.9 = near-certain
- **Domain-tagged**: code-style, testing, git, debugging, workflow, etc.
- **Evidence-backed**: Tracks what observations created it

**How it works (flow):**

```
Session Activity
      |
      | Hooks capture every tool call (100% reliable)
      v
observations.jsonl (prompts, tool calls, outcomes)
      |
      | Observer agent (background, Haiku model)
      v
PATTERN DETECTION
  - User corrections -> instinct
  - Error resolutions -> instinct
  - Repeated workflows -> instinct
  - Tool preferences -> instinct
      |
      | Creates/updates instincts
      v
instincts/personal/ (0.3-0.9 confidence)
      |
      | /evolve command clusters related instincts
      v
evolved/
  - commands/ (user-invoked actions)
  - skills/ (auto-triggered behaviors)
  - agents/ (complex multi-step processes)
```

**Hook Implementation (`observe.sh`):**

The hook reads JSON from stdin on every PreToolUse and PostToolUse event, extracts tool name/inputs/outputs, truncates to 5000 chars, and appends to `~/.claude/homunculus/observations.jsonl`. When the file exceeds 10MB, it auto-archives with a timestamp.

**Observer Agent (`agents/observer.md`):**

A background agent running on the Haiku model that:
- Reads `observations.jsonl` periodically (every 5 minutes when enabled)
- Requires 3+ observations before creating an instinct
- Starts confidence at 0.3 for tentative patterns
- Increases confidence by +0.05 per confirming observation
- Decreases confidence by -0.1 for contradicting observations
- Creates instinct files in `~/.claude/homunculus/instincts/personal/`

**Configuration (`config.json`):**

```json
{
  "version": "2.0",
  "observation": {
    "enabled": true,
    "store_path": "~/.claude/homunculus/observations.jsonl",
    "max_file_size_mb": 10,
    "archive_after_days": 7,
    "tools_to_track": ["Edit", "Write", "Bash", "Read", "Grep", "Glob"],
    "tools_to_ignore": ["TodoWrite"]
  },
  "instincts": {
    "personal_path": "~/.claude/homunculus/instincts/personal/",
    "inherited_path": "~/.claude/homunculus/instincts/inherited/",
    "min_confidence": 0.3,
    "auto_approve_threshold": 0.7,
    "confidence_decay_rate": 0.02,
    "max_instincts": 100
  },
  "observer": {
    "enabled": false,
    "model": "haiku",
    "run_interval_minutes": 5,
    "min_observations_before_analysis": 20,
    "patterns_to_detect": [
      "user_corrections",
      "error_resolutions",
      "repeated_workflows",
      "tool_preferences",
      "file_patterns"
    ]
  },
  "evolution": {
    "cluster_threshold": 3,
    "evolved_path": "~/.claude/homunculus/evolved/",
    "auto_evolve": false
  }
}
```

**Instinct CLI (`instinct-cli.py`):**

A Python CLI with 4 commands:
- `status`: Shows all instincts grouped by domain with confidence bars (`████████░░ 80%`)
- `import`: Adds instincts from files/URLs with duplicate detection and confidence merging
- `export`: Exports instincts as YAML/JSON/Markdown with privacy safeguards (strips session IDs, file paths, old timestamps)
- `evolve`: Analyzes instinct clusters and generates skills/commands/agents in `~/.claude/homunculus/evolved/`

**Directory Structure (The "Homunculus"):**

```
~/.claude/homunculus/
├── identity.json           # User profile, technical level
├── observations.jsonl      # Current session observations
├── observations.archive/   # Processed observations
├── instincts/
│   ├── personal/           # Auto-learned instincts
│   └── inherited/          # Imported from others
└── evolved/
    ├── agents/             # Generated specialist agents
    ├── skills/             # Generated skills
    └── commands/           # Generated commands
```

**v1 vs v2 Comparison:**

| Feature | v1 | v2 |
|---------|----|----|
| Observation | Stop hook (session end) | PreToolUse/PostToolUse (100% reliable) |
| Analysis | Main context (Opus tokens) | Background agent (Haiku, cheap) |
| Granularity | Full skills | Atomic "instincts" |
| Confidence | None | 0.3-0.9 weighted |
| Evolution | Direct to skill | Instincts -> cluster -> skill/command/agent |
| Sharing | None | Export/import instincts |
| Coverage | ~50-80% probabilistic | 100% deterministic |

**Related Project: Claudeception**

[blader/Claudeception](https://github.com/blader/Claudeception) implements a simpler version of the same concept. When Claude discovers something non-obvious, it writes a new skill with a description optimized for future retrieval. Key difference: Claudeception focuses on single-skill extraction with quality gates; ECC v2 focuses on continuous observation with confidence-weighted instinct accumulation.

---

## 4. Agent Architecture

### 4.1 Agent Inventory (13 Agents)

| Agent | File | Specialization | Key Tools |
|-------|------|---------------|-----------|
| **planner** | `agents/planner.md` | Feature planning, refactoring breakdown | Read, Grep, Glob |
| **architect** | `agents/architect.md` | System design, scalability, ADRs | Read, Grep, Glob |
| **tdd-guide** | `agents/tdd-guide.md` | Red-Green-Refactor, 80%+ coverage | Read, Edit, Bash |
| **code-reviewer** | `agents/code-reviewer.md` | Quality review, security, performance | Read, Grep, Glob, Bash |
| **security-reviewer** | `agents/security-reviewer.md` | OWASP Top 10, secrets, dependencies | Read, Grep, Bash |
| **build-error-resolver** | `agents/build-error-resolver.md` | Compilation/build failure resolution | Read, Edit, Bash |
| **e2e-runner** | `agents/e2e-runner.md` | Playwright/Vercel Agent Browser | Read, Write, Bash |
| **refactor-cleaner** | `agents/refactor-cleaner.md` | Dead code removal, dependency cleanup | Read, Edit, Bash, Grep |
| **doc-updater** | `agents/doc-updater.md` | Codemap generation, docs sync | Read, Write, Grep, Glob |
| **go-reviewer** | `agents/go-reviewer.md` | Go idioms, testing, benchmarks | Read, Grep, Bash |
| **go-build-resolver** | `agents/go-build-resolver.md` | Go build/compile error resolution | Read, Edit, Bash |
| **python-reviewer** | `agents/python-reviewer.md` | Python patterns, testing | Read, Grep, Bash |
| **database-reviewer** | `agents/database-reviewer.md` | PostgreSQL, Supabase, RLS, indexing | Read, Grep, Bash (Opus model) |

### 4.2 Agent Design Patterns

**Bounded Tool Permissions:** Each agent gets only the tools it needs. Read-only agents (planner, architect) get Read/Grep/Glob. Agents that modify code (tdd-guide, build-error-resolver) get Edit/Bash. This prevents scope creep.

**Structured Output:** All agents produce structured results -- the planner produces phased plans with complexity estimates; the code-reviewer produces tiered findings (Critical/High/Medium); the security-reviewer uses OWASP/CWE references with severity levels.

**Automatic Agent Selection (from `rules/common/agents.md`):**

```
Complex features       -> planner (automatic)
New/modified code      -> code-reviewer (automatic)
Bug fixes or features  -> tdd-guide (automatic)
Design questions       -> architect (automatic)
```

**Parallel Execution:** The rules explicitly state "ALWAYS use parallel Task execution for independent operations" -- e.g., security analysis + performance analysis + type checking should run in parallel, not sequentially.

**Multi-Perspective Analysis:** For complex problems, deploy 5+ agents simultaneously: factual reviewer, senior engineer, security expert, consistency reviewer, redundancy checker.

### 4.3 Agent File Structure

Each agent is a standalone Markdown file with:
1. Role definition (e.g., "You are a senior code review specialist")
2. Core responsibilities
3. Workflow phases
4. Evaluation criteria/checklists
5. Red flags to watch for
6. Available tools declaration
7. Output format specification

Example structure from `agents/code-reviewer.md`:

```markdown
# Code Reviewer

You are a senior code review specialist...

## Review Process
1. Run `git diff` to identify changes
2. Focus analysis on changed files
3. Execute structured review

## Priority Tiers
- Critical: Must fix before merge
- High: Should address
- Medium: Consider improving

## Security Checks
- Hardcoded credentials
- SQL injection
- XSS vulnerabilities
...

## Approval Standards
- APPROVE: No critical/high issues
- WARNING: Medium issues only
- BLOCK: Critical/high issues present
```

---

## 5. Skills System

### 5.1 Skill Categories

**Meta/Workflow Skills:**
- `continuous-learning/` + `continuous-learning-v2/` -- Auto-learning
- `strategic-compact/` -- Context management
- `iterative-retrieval/` -- Progressive context refinement
- `verification-loop/` -- 6-phase verification
- `eval-harness/` -- Eval-driven development
- `configure-ecc/` -- Interactive installation wizard

**Language/Framework Skills:**
- `coding-standards/` -- TS/JS/React/Node universal standards
- `backend-patterns/` -- API, database, caching
- `frontend-patterns/` -- React, Next.js
- `golang-patterns/` + `golang-testing/`
- `python-patterns/` + `python-testing/`
- `django-patterns/` + `django-security/` + `django-tdd/` + `django-verification/`
- `springboot-patterns/` + `springboot-security/` + `springboot-tdd/` + `springboot-verification/`
- `java-coding-standards/` + `jpa-patterns/`

**Domain Skills:**
- `postgres-patterns/` -- PostgreSQL best practices
- `clickhouse-io/` -- ClickHouse patterns
- `security-review/` -- Security with cloud infrastructure addendum
- `nutrient-document-processing/` -- Document processing

### 5.2 Skill Architecture

Each skill is a directory containing:
- `SKILL.md` -- Main definition with YAML frontmatter
- Optional support files (config.json, shell scripts, sub-agents, reference docs)

**Frontmatter pattern:**

```yaml
---
name: continuous-learning-v2
description: Instinct-based learning system that observes sessions via hooks...
version: 2.0.0
---
```

**Key Design: Skills are self-contained.** The `continuous-learning-v2` skill includes its own agents (`agents/observer.md`), hooks (`hooks/observe.sh`), scripts (`scripts/instinct-cli.py`), and config (`config.json`) within its own directory. No cross-skill dependencies.

### 5.3 Notable Skills Deep-Dive

**Iterative Retrieval (`skills/iterative-retrieval/`):**

A 4-phase loop for progressive context gathering:
1. DISPATCH: Broad search with high-level keywords
2. EVALUATE: Score files on 0-1 relevance scale
3. REFINE: Update search based on discovered terminology
4. LOOP: Repeat up to 3 times until sufficient context

This solves the "context problem" where subagents need information they do not initially know they need.

**Verification Loop (`skills/verification-loop/`):**

Six verification phases:
1. Build verification (compiles?)
2. Type check (TypeScript/Python types)
3. Lint check (code style)
4. Test suite (80%+ coverage)
5. Security scan (secrets, debug statements)
6. Diff review (unintended changes)

Produces a structured READY/NOT READY report. Recommended to run every 15 minutes during extended sessions.

**Eval Harness (`skills/eval-harness/`):**

Implements "Eval-Driven Development" (EDD):
- Define evals before coding (like TDD but for AI)
- Three grader types: code-based (deterministic), model-based (Claude evaluates), human-based (manual review)
- Metrics: pass@k (at least 1 of k succeeds) and pass^k (all k succeed)
- Evals stored in `.claude/evals/` as first-class project artifacts

**Strategic Compact (`skills/strategic-compact/`):**

Solves auto-compaction timing problems:
- Tracks tool call count per session
- Suggests `/compact` at 50 tool calls, then every 25
- User decides IF to compact based on logical task boundaries
- Hook says WHEN; user decides IF

---

## 6. Commands System

### 6.1 Command Categories

**Learning Pipeline:**
- `/learn` -- Extract reusable patterns from current session
- `/evolve` -- Cluster related instincts into skills/commands/agents
- `/instinct-status` -- View instincts with confidence scores
- `/instinct-import <file>` -- Import instincts from others
- `/instinct-export` -- Export instincts for sharing
- `/skill-create` -- Generate skills from git history analysis

**Development Workflow:**
- `/plan` -- Create implementation plan (invokes planner agent)
- `/tdd` -- Test-driven development cycle
- `/build-fix` -- Resolve build/compile errors
- `/code-review` -- Automated code review
- `/e2e` -- End-to-end testing
- `/verify` -- Run 6-phase verification loop
- `/eval` -- Run evaluation harness
- `/refactor-clean` -- Dead code removal
- `/checkpoint` -- Git-based state snapshots
- `/security` -- Security audit

**Multi-Agent Orchestration:**
- `/orchestrate` -- Sequential agent workflows with handoffs
- `/multi-plan` -- Multi-model collaborative planning (Codex + Gemini)
- `/multi-execute` -- Multi-model collaborative execution
- `/multi-backend` -- Backend-focused multi-model
- `/multi-frontend` -- Frontend-focused multi-model
- `/multi-workflow` -- Full workflow multi-model

**Infrastructure:**
- `/pm2` -- PM2 service lifecycle management
- `/setup-pm` -- Package manager configuration
- `/update-codemaps` -- Documentation refresh
- `/update-docs` -- Docs update
- `/sessions` -- Session history management

**Language-Specific:**
- `/go-build`, `/go-review`, `/go-test`
- `/python-review`

### 6.2 Command Design Pattern

Commands are Markdown files that serve as prompt templates. They define:
1. What the command does
2. When to use it
3. Which agent to invoke (if any)
4. Step-by-step workflow
5. Critical constraints (e.g., "planner will NOT write code until you confirm")

Example from `/plan`:
```
The planner agent will NOT write any code until you explicitly confirm.
After planning approval, transition to:
- /tdd for test-driven development
- /build-and-fix for compilation issues
- /code-review for feedback
```

### 6.3 Command Chaining

Commands are designed to chain together in workflows:

```
/plan -> approval -> /tdd -> /code-review -> /verify -> /security
```

Or via `/orchestrate`:
```
/orchestrate feature "Add user authentication"
-> planner -> tdd-guide -> code-reviewer -> security-reviewer
```

---

## 7. Hooks System

### 7.1 Hook Events (7 Types)

| Event | When | ECC Usage |
|-------|------|-----------|
| **PreToolUse** | Before any tool call | Block dev servers outside tmux; warn before git push; prevent random .md files; suggest compaction; observe for learning |
| **PostToolUse** | After any tool call | Format with Prettier; TypeScript type checking; warn about console.log; extract PR URLs; observe for learning |
| **SessionStart** | Session begins | Load previous context; detect package manager; show recent sessions |
| **SessionEnd** | Session terminates | Persist session state; save learnings |
| **PreCompact** | Before context compaction | Save state snapshot to session file |
| **Stop** | Response completes | Check for console.log in modified files; evaluate session for patterns |
| **UserPromptSubmit** | User sends message | (Not used by default - adds latency) |

### 7.2 hooks.json Configuration

The central `hooks/hooks.json` file defines all hooks. Key patterns:

**Regex Matchers for Tool Filtering:**
```json
{
  "PreToolUse": [{
    "matcher": "Bash",
    "hooks": [{
      "type": "command",
      "command": "...",
      "timeout": 5000
    }]
  }]
}
```

**Notable Enforcements:**
- Blocks `npm run dev` / `pytest` outside tmux
- Prevents creation of random .md files (only README.md, CLAUDE.md, AGENTS.md, CONTRIBUTING.md allowed)
- Auto-formats JS/TS with Prettier after edits
- Runs TypeScript type checking after writes
- Warns about console.log statements

### 7.3 Hook Scripts (All Node.js, Cross-Platform)

| Script | Event | Purpose |
|--------|-------|---------|
| `session-start.js` | SessionStart | Load recent sessions, learned skills, detect package manager |
| `session-end.js` | SessionEnd | Create/update session file with timestamp |
| `pre-compact.js` | PreCompact | Log compaction event, append to session file |
| `suggest-compact.js` | PreToolUse | Count tool calls, suggest compaction at threshold |
| `evaluate-session.js` | Stop | Check transcript length, trigger pattern extraction |
| `check-console-log.js` | Stop/PostToolUse | Scan for console.log in modified files |
| `observe.sh` | PreToolUse/PostToolUse | Capture tool events for instinct system |

---

## 8. Rules System

### 8.1 Multi-Language Hierarchy

```
rules/
├── common/          # Language-agnostic (always loaded)
│   ├── agents.md    # Agent orchestration rules
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── hooks.md
│   ├── patterns.md  # Design patterns, skeleton projects
│   ├── performance.md
│   ├── security.md
│   └── testing.md
├── typescript/      # TS/JS specific
├── python/          # Python specific
└── golang/          # Go specific
```

**Design:** Common rules always apply. Language-specific rules extend (never replace) the common set. Each language directory mirrors the same file names with language-specific additions.

### 8.2 Key Rule Content

**`rules/common/agents.md` (Agent Orchestration):**
- Lists 9 available agents with their roles
- Mandates parallel Task execution for independent operations
- Defines 4 automatic agent selection triggers
- Recommends multi-perspective analysis for complex problems

**`rules/common/patterns.md` (Design Patterns):**
- Skeleton project adoption strategy
- Repository pattern with interface definitions
- Standardized API response envelope format

**`rules/common/security.md`:**
- Never hardcode secrets
- Always validate inputs
- Use parameterized queries
- Enable CSRF protection

**`rules/common/testing.md`:**
- TDD: write tests first
- 80% minimum coverage
- AAA pattern (Arrange-Act-Assert)

### 8.3 Rules vs Skills

| Aspect | Rules | Skills |
|--------|-------|--------|
| Purpose | Permanent constraints | Workflow knowledge |
| Activation | Always loaded | Semantically matched |
| Scope | Project/user-wide | Task-specific |
| Format | Flat .md files | Directories with SKILL.md |
| Distribution | Manual copy | Plugin installable |

---

## 9. Contexts

ECC introduces "contexts" -- dynamic system prompt injection files that change Claude's behavior mode:

**`contexts/dev.md` (Development Mode):**
```
Mode: Active development
Priority: Get it working -> Get it right -> Get it clean
Tools: Edit, Write, Bash, Grep, Glob
Philosophy: Write code first, explain after
```

**`contexts/research.md` (Research Mode):**
```
Mode: Exploration, investigation, learning
Focus: Understanding before acting
Process: Understand -> Explore -> Hypothesize -> Verify -> Summarize
Tools: Read, Grep, Glob, WebSearch, WebFetch, Explore agent
```

**`contexts/review.md` (Code Review Mode):**
```
Mode: PR review, code analysis
Focus: Quality, security, maintainability
Checklist: Logic errors, edge cases, error handling, security, performance
Output: Group findings by file, severity first
```

**Usage:** These can be loaded via CLI flags:
```bash
claude --system-prompt "$(cat contexts/dev.md)"
```

This is a lightweight alternative to full agent switching -- it adjusts Claude's priorities and tool preferences without changing its identity.

---

## 10. Session & Memory Management

### 10.1 Session Lifecycle

```
SessionStart hook
├── Load recent session files (last 7 days)
├── Show learned skills from ~/.claude/skills/learned/
├── Display session aliases (/sessions load <alias>)
└── Detect package manager
        |
        | ... development session ...
        |
PreCompact hook (if compaction occurs)
├── Log compaction event with timestamp
└── Append notification to active session file
        |
        | ... more development ...
        |
Stop hook (on response complete)
├── Check console.log in modified files
└── Evaluate session for pattern extraction
        |
SessionEnd hook
├── Create/update session .tmp file
└── Record metadata: date, start time, tasks, notes
```

### 10.2 Session File Format

```markdown
# Session: 2026-01-17

## Metadata
- Date: 2026-01-17
- Started: 10:30 AM
- Last Updated: 2:45 PM

## Current State
[What we're working on]

## Completed
- [x] Task 1
- [x] Task 2

## In Progress
- [ ] Task 3

## Notes
[Important context for continuation]

## Context References
[Files, PRs, issues referenced]
```

### 10.3 Session Commands (`/sessions`)

```bash
/sessions list              # Show all sessions with metadata
/sessions load <id|alias>   # Load a session's content
/sessions alias <id> <name> # Create memorable name
/sessions info <id>         # Detailed statistics
/sessions aliases           # Show all aliases
```

Sessions are stored as `.tmp` files in `~/.claude/sessions/` with format `YYYY-MM-DD-<shortid>-session.tmp`.

### 10.4 Checkpoint System (`/checkpoint`)

Git-based state snapshots independent of sessions:

```bash
/checkpoint create "before-refactor"   # Git stash/commit + log
/checkpoint verify "before-refactor"   # Compare current state
/checkpoint list                       # Show all checkpoints
/checkpoint clear                      # Keep last 5 only
```

Checkpoints record git SHAs, enabling precise rollback and progress comparison.

---

## 11. Multi-Agent Orchestration

### 11.1 Sequential Workflows (`/orchestrate`)

Pre-defined workflow chains:

| Workflow | Agent Chain |
|----------|-------------|
| **feature** | planner -> tdd-guide -> code-reviewer -> security-reviewer |
| **bugfix** | explorer -> tdd-guide -> code-reviewer |
| **refactor** | architect -> code-reviewer -> tdd-guide |
| **security** | security-reviewer -> code-reviewer -> architect |

Each agent receives a **handoff document** from the previous agent:
```markdown
## Handoff
- Context: [what previous agent was working on]
- Findings: [what it discovered]
- Modified files: [list]
- Open questions: [unresolved items]
- Recommendations: [for next agent]
```

Final output aggregates all agent work with a verdict: **SHIP / NEEDS WORK / BLOCKED**.

### 11.2 Multi-Model Orchestration

The `multi-*` commands integrate external models:

**`/multi-plan`:**
1. Enhance prompt via MCP tool
2. Parallel analysis: Codex (backend) + Gemini (frontend)
3. Claude synthesizes both into unified plan
4. Save to `.claude/plan/` directory

**`/multi-execute`:**
1. Parse plan file, extract SESSION_IDs
2. Route by domain: Frontend -> Gemini, Backend -> Codex, Fullstack -> parallel
3. External models produce "dirty prototypes"
4. Claude refactors to production quality
5. Multi-model audit before delivery

**Rule:** "Claude maintains exclusive filesystem write access; external models provide dirty prototype drafts only."

### 11.3 PM2 Orchestration

`/pm2` sets up PM2 for multi-service management:
- Auto-detects frameworks (Vite, Next.js, Express, Django, etc.)
- Generates `ecosystem.config.cjs`
- Creates start/stop/monitor commands
- Cross-platform including Windows-specific `.cjs` handling

---

## 12. Skill Creator & ecc.tools

### 12.1 Local Analysis (`/skill-create`)

Analyzes git history to generate skills:

```bash
/skill-create                    # Analyze current repo
/skill-create --commits 100      # Last 100 commits
/skill-create --output ./skills  # Custom output directory
/skill-create --instincts        # Include instincts for v2
```

Detects:
- Commit conventions (feat:, fix:, chore: patterns)
- Code architecture (folder structure, naming)
- Workflows (repeated file change sequences)
- Testing patterns (test locations, frameworks)

### 12.2 GitHub App (ecc.tools)

[ecc.tools](https://ecc.tools/) provides a GitHub App that:
1. Install on your repo
2. Comment `/skill-creator analyze` on any issue
3. Receive a PR with SKILL.md files and instincts
4. Handles 10,000+ commit repositories
5. Generates instincts with `source: "repo-analysis"` and higher initial confidence (0.7+)

The GitHub App version offers enterprise features for larger teams and repositories.

---

## 13. Example CLAUDE.md Templates

### 13.1 Project-Level (`examples/CLAUDE.md`)

Key sections:
- **Code Organization:** 200-400 line files, feature-based organization
- **Immutability:** Never mutate objects or arrays
- **No console.log in production**
- **TDD:** Write tests first, 80% coverage minimum
- **Security:** Never hardcode secrets, use env vars, validate inputs, parameterized queries, CSRF
- **Project Structure:** `src/app/`, `components/`, `hooks/`, `lib/`, `types/`
- **API Response Format:** Standardized `{success, data, error}` envelope
- **Conventional Commits:** feat:, fix:, refactor:

### 13.2 User-Level (`examples/user-CLAUDE.md`)

Establishes user-wide principles:
- **Agent-first architecture:** Delegate to specialized agents
- **Parallel execution:** When feasible
- **Plan before implement:** For complex operations
- **TDD always**
- **Security standards throughout**
- **Personal standards:** No emojis, immutability preference, optimal file sizing, 80% coverage

References all 9 agents and rule files by path.

---

## 14. Token Economy & Context Management

### 14.1 Context Window Constraints

**Critical Warning from ECC:**
> "Don't enable all MCPs at once. Your 200k context window can shrink to 70k with too many tools enabled."

**Recommended limits:**
- 20-30 MCPs configured
- Under 10 enabled per project
- Under 80 active tools total

### 14.2 Model Selection Strategy

From the longform guide:
- **Sonnet:** Default for 90% of coding tasks
- **Opus:** Upgrade when first attempts fail, 5+ file changes, architectural decisions, or security-critical
- **Haiku:** Exploration, simple edits, background observation (used by learning system observer)

### 14.3 Token Optimization Techniques

1. **Subagent delegation:** Offload to Haiku/Sonnet for focused tasks
2. **mgrep over ripgrep:** ~50% token reduction in search results
3. **Strategic manual compaction:** At logical phase boundaries, not mid-task
4. **Skill progressive disclosure:** Only ~100 tokens per skill at startup
5. **Session files:** External state persistence instead of context accumulation

### 14.4 Strategic Compaction

The `suggest-compact.js` hook tracks tool calls and suggests `/compact` at:
- 50 tool calls: "consider /compact if transitioning phases"
- Every 25 calls thereafter: "good checkpoint for /compact if context is stale"

Philosophy: "The hook tells you WHEN, you decide IF."

---

## 15. Cross-Platform & Plugin System

### 15.1 Plugin Distribution

ECC can be installed as a Claude Code plugin:

```bash
/plugin marketplace add affaan-m/everything-claude-code
/plugin install everything-claude-code@everything-claude-code
```

The plugin manifest (`plugin.json`) declares components, but **rules must be installed manually** due to Claude Code plugin system limitations.

### 15.2 Interactive Installation (`/configure-ecc`)

A 6-step wizard:
1. Clone ECC repo to `/tmp/`
2. Choose scope: user-level (`~/.claude/`), project-level (`.claude/`), or both
3. Select from 27 skills across 4 categories
4. Choose rule sets (common + language-specific)
5. Verify installation, check dependencies
6. Optimize for project's tech stack

### 15.3 Cross-Platform Node.js

All hooks and scripts are Node.js (not bash) for Windows/macOS/Linux compatibility. The `scripts/lib/utils.js` provides platform abstractions.

### 15.4 OpenCode Support

ECC also supports [OpenCode](https://opencode.ai/) with full parity:
- 24 commands in `.opencode/commands/`
- Agent definitions in `.opencode/prompts/agents/`
- Hooks via TypeScript plugins (20+ event types vs Claude Code's 7)
- Instructions in `.opencode/instructions/INSTRUCTIONS.md`

---

## 16. Patterns Adoptable by MMOS

### 16.1 Directly Adoptable (High Value, Low Effort)

1. **Strategic Compaction Hook:** The `suggest-compact.js` pattern -- track tool calls and suggest compaction at logical boundaries. Simple to implement, high impact on long sessions.

2. **Contexts (Mode Switching):** The `contexts/` pattern -- dev.md, research.md, review.md as lightweight behavioral presets. Lighter than full agent switching. Could apply to MMOS agents: `contexts/mmos-research.md`, `contexts/mmos-extraction.md`.

3. **Session Persistence Hooks:** SessionStart/End hooks that auto-save and auto-load context. MMOS already has some of this but could standardize the `.tmp` file format and alias system.

4. **Checkpoint System:** Git-based state snapshots with named checkpoints. More robust than manual git saves. The `/checkpoint create "before-refactor"` pattern is cleaner than ad-hoc commits.

5. **Verification Loop Skill:** The 6-phase verification (build, type, lint, test, security, diff) as a standardized skill. Replaces ad-hoc quality checks.

### 16.2 Worth Exploring (Medium Effort)

6. **Instinct-Based Learning (v2):** The observation -> instinct -> evolve pipeline. Complex to implement but creates compound learning. The key insight: use PreToolUse/PostToolUse hooks for 100% deterministic capture (not probabilistic skills).

7. **Agent Orchestration via Handoff Documents:** The `/orchestrate` pattern of passing structured handoff documents between agents. MMOS could use this for MMOS agent chains (Victoria -> Tim -> Daniel -> Barbara).

8. **Iterative Retrieval Pattern:** The 4-phase DISPATCH -> EVALUATE -> REFINE -> LOOP pattern for progressive context gathering. Useful for the deep-researcher and tech-research skills.

9. **Eval-Driven Development:** Treating evals as "unit tests of AI development." The pass@k / pass^k metrics could be integrated into MMOS quality gates.

### 16.3 Architecture Differences (MMOS vs ECC)

| Aspect | ECC | MMOS |
|--------|-----|------|
| Distribution | Plugin (global `~/.claude/`) | Project-level (`.claude/`) |
| Agents | 13 generic development | 9+ MMOS-specific + development |
| Skills | Self-contained directories | Same pattern, with agent wrappers |
| Learning | Instinct-based continuous | Session handoffs + agent memory |
| Orchestration | Sequential handoff docs | Context Parity state.json |
| Rules | Flat files in rules/ | .claude/rules/ with hooks |
| Memory | ~/.claude/homunculus/ | outputs/minds/{slug}/metadata/ |
| Contexts | 3 static files | Dynamic per-mind context loading |

### 16.4 Key Architectural Lessons

1. **Hooks > Skills for observation:** Skills fire probabilistically; hooks fire deterministically. Use hooks for anything that MUST happen every time.

2. **Atomic instincts > Full skills:** Small, confidence-weighted behaviors are easier to evolve than full skill definitions. They compose better and degrade gracefully.

3. **Background Haiku for analysis:** Offload observation analysis to cheap models. Don't burn Opus tokens on pattern detection.

4. **Tool permission boundaries:** Restricting agents to Read/Grep prevents scope creep. The planner should never edit files.

5. **Handoff documents as agent interface:** Structured markdown documents are a clean interface between sequential agents. Better than relying on shared context.

---

## 17. Gaps and Limitations

1. **Observer agent disabled by default.** The config has `"observer.enabled": false`. The background Haiku analysis is designed but not actively running in default installations. Users must manually enable it.

2. **No real-time instinct application.** Instincts are stored and can be queried, but there is no mechanism to auto-inject relevant instincts into the current context based on what the user is doing.

3. **Plugin system cannot distribute rules.** This is a Claude Code platform limitation, not an ECC limitation. Rules must be manually copied.

4. **Multi-model commands require external MCP tools.** The `/multi-plan` and `/multi-execute` commands depend on Codex and Gemini MCP integrations that are not included.

5. **No team-level state.** The homunculus is per-user. There is no built-in mechanism for team-wide instinct convergence beyond manual export/import.

6. **Star count inflated by virality.** At 42.9k stars with only 24 contributors and 13 agents (not 135 as Wave 1 estimated), the actual configuration content is comprehensive but not as massive as the star count might suggest.

7. **Limited testing of learning system effectiveness.** There are no published metrics on how much the instinct system actually improves productivity over time.

---

## Sources

- [GitHub: affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- [README.md](https://github.com/affaan-m/everything-claude-code/blob/main/README.md)
- [skills/continuous-learning-v2/SKILL.md](https://github.com/affaan-m/everything-claude-code/tree/main/skills/continuous-learning-v2)
- [skills/continuous-learning/SKILL.md](https://github.com/affaan-m/everything-claude-code/tree/main/skills/continuous-learning)
- [commands/learn.md](https://github.com/affaan-m/everything-claude-code/blob/main/commands/learn.md)
- [commands/evolve.md](https://github.com/affaan-m/everything-claude-code/blob/main/commands/evolve.md)
- [commands/orchestrate.md](https://github.com/affaan-m/everything-claude-code/blob/main/commands/orchestrate.md)
- [agents/planner.md](https://github.com/affaan-m/everything-claude-code/blob/main/agents/planner.md)
- [agents/architect.md](https://github.com/affaan-m/everything-claude-code/blob/main/agents/architect.md)
- [hooks/hooks.json](https://github.com/affaan-m/everything-claude-code/blob/main/hooks/hooks.json)
- [DeepWiki Analysis](https://deepwiki.com/affaan-m/everything-claude-code)
- [ECC Tools - Skill Generation](https://ecc.tools/)
- [Claudeception (related project)](https://github.com/blader/Claudeception)
- [the-longform-guide.md](https://github.com/affaan-m/everything-claude-code/blob/main/the-longform-guide.md)
- [the-shortform-guide.md](https://github.com/affaan-m/everything-claude-code/blob/main/the-shortform-guide.md)
- [GitClassic mirror](https://gitclassic.com/affaan-m/everything-claude-code)
- [ClaudePluginHub listing](https://www.claudepluginhub.com/plugins/affaan-m-everything-claude-code)
