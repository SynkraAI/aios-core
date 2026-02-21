# Wave 3: CLAUDE.md Patterns and Best Practices

> Deep research into advanced CLAUDE.md configurations, rules files, memory hierarchy,
> performance optimization, and production-tested patterns from the ecosystem.

**Date:** 2026-02-09
**Sources consulted:** 22 unique pages deep-read
**Coverage:** Official docs, production examples, ecosystem best practices, token optimization

---

## TL;DR

1. **CLAUDE.md is the single highest-leverage file in your project** -- it loads into every session as system-level context. But bigger is NOT better: Anthropic recommends under 500 lines, practitioners report best results under 300 lines, and one expert argues under 60 lines is ideal.

2. **The monolithic CLAUDE.md anti-pattern** is the #1 mistake. The solution: use `.claude/rules/` with path-targeted frontmatter for domain-specific rules, skills for on-demand knowledge, and hooks for deterministic enforcement. CLAUDE.md should contain only universal operational rules.

3. **The 4-scope hierarchy** (Managed > Local > Project > User) governs ALL configuration. CLAUDE.md files from all scopes are MERGED (not replaced), with more specific scopes taking precedence on conflicts.

4. **Token economics matter**: ~20K tokens baseline for monorepo CLAUDE.md initialization. Each enabled MCP adds ~6K tokens. Rules files that exceed ~1,800 words across all files cause diminishing returns. The "10/80 rule": keep under 10 MCPs and under 80 total active tools.

5. **Hooks > CLAUDE.md for enforcement**: CLAUDE.md instructions are "advisory" -- Claude can choose to ignore them under context pressure. Hooks are "deterministic" -- they ALWAYS fire. Any rule that must NEVER be violated belongs in a hook, not CLAUDE.md.

---

## 1. CLAUDE.md Hierarchy and Inheritance

### 1.1 Complete Scope Chain

Claude Code uses a 4-scope system where configuration merges across all levels:

```
Managed Settings  (HIGHEST - IT/DevOps enforced, cannot override)
    |
    v  merges with
Command Line Args (Temporary session override)
    |
    v  merges with
Local Settings    (.claude/settings.local.json, CLAUDE.local.md)
    |
    v  merges with
Project Settings  (.claude/settings.json, .claude/CLAUDE.md, .claude/rules/)
    |
    v  merges with
User Settings     (~/.claude/settings.json, ~/.claude/CLAUDE.md)  (LOWEST)
```

> Source: [Claude Code Settings - Official Docs](https://code.claude.com/docs/en/settings)

### 1.2 Memory Type Map

| Type | Location | Purpose | Shared With |
|------|----------|---------|-------------|
| **Managed policy** | `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS) | Org-wide standards | All users |
| **Project memory** | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team instructions | Team via git |
| **Project rules** | `./.claude/rules/*.md` | Modular, topic-specific | Team via git |
| **User memory** | `~/.claude/CLAUDE.md` | Personal preferences | Just you (all projects) |
| **Local memory** | `./CLAUDE.local.md` | Personal project overrides | Just you (auto-gitignored) |
| **Auto memory** | `~/.claude/projects/<project>/memory/` | Claude's auto-notes | Just you (per project) |

> Source: [Manage Claude's Memory - Official Docs](https://code.claude.com/docs/en/memory)

### 1.3 Loading Behavior

- **Parent directories**: Claude recurses UP from cwd to (not including) root `/`, reading any CLAUDE.md found.
- **Child directories**: Not loaded at launch. Only included when Claude reads files in those subtrees.
- **Auto memory**: Only first 200 lines of `MEMORY.md` loaded at startup. Topic files loaded on-demand.
- **Rules directory**: ALL `.md` files in `.claude/rules/` loaded at startup with same priority as CLAUDE.md.
- **Imports**: `@path/to/file` syntax allows recursive imports (max depth 5).
- **`--add-dir`**: CLAUDE.md from additional dirs NOT loaded by default. Set `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` to enable.

> "CLAUDE.md files in the directory hierarchy above the working directory are loaded in full at launch. CLAUDE.md files in child directories load on demand when Claude reads files in those directories."
> -- [Official docs](https://code.claude.com/docs/en/memory)

### 1.4 Merging Strategy

Settings from all scopes are deep-merged:
- **Scalar values**: More specific scope replaces
- **Arrays (permissions)**: Appended across scopes (deny rules checked first, always)
- **Objects**: Keys merged from all scopes

Critical implication: If Managed denies something, no other scope can allow it.

---

## 2. What to Include vs Exclude

### 2.1 The Golden Filter

From [Anthropic's best practices](https://code.claude.com/docs/en/best-practices):

> "For each line, ask: 'Would removing this cause Claude to make mistakes?' If not, cut it."

| Include | Exclude |
|---------|---------|
| Bash commands Claude can't guess | Anything Claude can figure out by reading code |
| Code style rules that differ from defaults | Standard language conventions Claude already knows |
| Testing instructions and preferred runners | Detailed API documentation (link to docs instead) |
| Repository etiquette (branch naming, PR conventions) | Information that changes frequently |
| Architectural decisions specific to your project | Long explanations or tutorials |
| Developer environment quirks (required env vars) | File-by-file descriptions of the codebase |
| Common gotchas or non-obvious behaviors | Self-evident practices like "write clean code" |

> Source: [Best Practices - Official Docs](https://code.claude.com/docs/en/best-practices)

### 2.2 The HumanLayer Framework

Austin from HumanLayer proposes the "WHY, WHAT, HOW" framework:

- **WHAT**: Project structure and technical stack (map the codebase)
- **WHY**: Project purpose and component functions
- **HOW**: Practical execution details (build/test/lint commands)

He also warns about a critical system limitation:

> "Claude frequently ignores CLAUDE.md content because the system includes this reminder: 'this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant.'"

This means only universally applicable information reliably survives Claude's relevance filtering.

**Target**: Under 60 lines for optimal adherence, never exceeding 300 lines.

> Source: [Writing a Good CLAUDE.md - HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md)

### 2.3 Sabrina Ramonov's Rule Taxonomy

Sabrina's production CLAUDE.md distinguishes between:
- **MUST rules** (CI-enforced, non-negotiable)
- **SHOULD rules** (strongly recommended, contextual)

And uses coded prefixes for traceability:
- `BP-*` (Best Practices, pre-coding)
- `C-*` (Coding standards)
- `T-*` (Testing standards)
- `D-*` (Database typing)

Each rule gets a unique ID, making it easy to reference in reviews and hook enforcement.

> Source: [Ultimate AI Coding Guide - Sabrina.dev](https://www.sabrina.dev/p/ultimate-ai-coding-guide-claude-code)

---

## 3. Rules Files vs CLAUDE.md

### 3.1 When to Use Each

| Use CLAUDE.md for | Use `.claude/rules/` for | Use Skills for | Use Hooks for |
|-------------------|--------------------------|----------------|---------------|
| Universal operational workflows | Domain-specific instructions tied to file patterns | Cross-project expertise loaded on-demand | Actions that must happen every time with zero exceptions |
| Commands that apply everywhere | Language/framework-specific standards | Repeatable workflows invoked manually | Formatting, linting, test gates |
| Architectural overview | Path-targeted rules (API, frontend, tests) | Domain knowledge rarely needed | Branch protection, file protection |
| Team coordination rules | Security rules scoped to sensitive directories | Long-form reference docs | Commit validation |

> Source: [Rules Directory Guide - claudefa.st](https://claudefa.st/blog/guide/mechanics/rules-directory)

### 3.2 Path-Specific Targeting (Power Feature)

Rules can target specific file patterns using YAML frontmatter:

```yaml
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules
- Validate input with Zod
- Return consistent error shapes
- Log all requests with correlation IDs
```

This rule activates ONLY when Claude works on files matching `src/api/**/*.ts`.

**Why this matters**: In a monolithic CLAUDE.md, all rules compete equally for attention. With path targeting, your API rules still receive high priority -- but only during API work.

> "When everything is marked important, Claude struggles to determine what's actually relevant."
> -- [claudefa.st](https://claudefa.st/blog/guide/mechanics/rules-directory)

### 3.3 Context Priority Hierarchy

| Source | Priority | When It Loads |
|--------|----------|---------------|
| CLAUDE.md | High | Every session |
| Rules directory | High | Every session (filtered by path) |
| Skills | Medium | On-demand when triggered |
| Conversation history | Variable | Decays over long sessions |

### 3.4 Migration Strategy

**Before**: Single 400-line CLAUDE.md with mixed concerns:

```
CLAUDE.md (400 lines)
- API guidelines
- React patterns
- Testing rules
- Security policies
- Database conventions
- Git workflow
```

**After**: Lean CLAUDE.md + modular rules:

```
CLAUDE.md (~80 lines)         -> Routing logic + Quality standards + Commands
.claude/rules/api.md          -> paths: src/api/**/*
.claude/rules/react.md        -> paths: src/components/**/*
.claude/rules/testing.md      -> paths: **/*.test.*
.claude/rules/security.md     -> paths: src/auth/**, src/payments/**
.claude/rules/database.md     -> paths: prisma/**, supabase/**
```

> Source: [claudefa.st](https://claudefa.st/blog/guide/mechanics/rules-directory), [claude-blog.setec.rs](https://claude-blog.setec.rs/blog/claude-code-rules-directory)

---

## 4. Production CLAUDE.md Examples

### 4.1 Everything-Claude-Code Project-Level Example

From the `affaan-m/everything-claude-code` repo (42.9k stars):

**Structure**:
```markdown
# Project Overview
[What the project does + tech stack]

# Critical Rules
## Code Organization
- Many small files over few large files
- 200-400 lines per file, max 800
- Structure by feature/domain, not file type

## Code Style
- No emojis in code/comments/docs
- Immutability always - never mutate objects/arrays
- No console.log in production
- Try/catch error handling required
- Input validation with Zod

## Testing
- TDD approach
- 80% minimum coverage
- Unit for utilities, integration for APIs, E2E for critical flows

## Security
- No hardcoded secrets
- Environment variables for sensitive data
- Parameterized queries only
```

> Source: [ECC examples/CLAUDE.md](https://github.com/affaan-m/everything-claude-code/blob/main/examples/CLAUDE.md)

### 4.2 Everything-Claude-Code User-Level Example

At `~/.claude/CLAUDE.md`, the ECC user-level config establishes:

**Core Philosophy** (5 principles):
1. Agent-First delegation for complex tasks
2. Parallel execution using Task tools with multiple agents
3. Planning before execution in complex scenarios
4. Test-driven development
5. Security-first approach

**Modular Rules** (referenced from `~/.claude/rules/`):
- `security.md`, `coding-style.md`, `testing.md`, `git-workflow.md`
- `agents.md`, `patterns.md`, `performance.md`, `hooks.md`

**Agent Definitions** (in `~/.claude/agents/`):
- planner, architect, tdd-guide, code-reviewer, security-reviewer
- build-error-resolver, e2e-runner, refactor-cleaner, doc-updater

> Source: [ECC examples/user-CLAUDE.md](https://github.com/affaan-m/everything-claude-code/blob/main/examples/user-CLAUDE.md)

### 4.3 Shrivu Shankar's Monorepo Approach

From the blog.sshh.io production guide:

- Maintains a **strictly curated 13KB file** for their monorepo (scalable to 25KB)
- Documents only tools/APIs used by **30%+ of engineers**
- Allocates maximum token budgets per tool section, treating documentation like "ad space"
- Maintains a separate `AGENTS.md` for compatibility with other AI IDEs

**Key insight**:

> "Don't embed files. Avoid @-mentioning extensive docs; instead pitch WHY and WHEN to read them."

**Structure Pattern**:
```markdown
## [Tool Name]
... 10 bullets covering 80% of use cases ...
- Always [requirement]
- Never [x], prefer [Y]
For [complex usage], see path/to/docs.md
```

> Source: [How I Use Every Claude Code Feature - sshh.io](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)

### 4.4 SmartScope Conciseness Optimization

SmartScope documents a CLAUDE.md that enforces concise agent output:

**Hard limits**:
- Maximum 200 words for plan outputs
- Up to h3 heading level only (h4+ prohibited)
- Include file names, commands, line numbers
- End with 1-3 specific questions

**Banned verbose expressions**:
- "needs to be considered"
- "perform detailed analysis"
- "comprehensive approach"
- "considering various factors"

**Required format**: `What: [file/command] Where: [path:line] Why: [reason < 20 chars]`

**Results**: 90% reading time reduction, 87% faster implementation startup.

> Source: [SmartScope - CLAUDE.md Concise Optimization](https://smartscope.blog/en/generative-ai/claude/claude-md-concise-agent-optimization-2026/)

### 4.5 CentminMod Memory Bank System

An innovative approach using multiple domain-specific CLAUDE.md variants:

```
CLAUDE.md                  # Primary memory bank
CLAUDE-cloudflare.md       # Platform-specific docs
CLAUDE-convex.md           # Backend framework docs
AGENTS.md                  # Agent system documentation
```

The system includes:
- Active context tracking across sessions
- Decision records (ADRs) for architectural choices
- Pattern catalog for recurring solutions
- Troubleshooting index for known issues
- Real-time status lines showing token usage and cost

> Source: [centminmod/my-claude-code-setup](https://github.com/centminmod/my-claude-code-setup)

---

## 5. Performance and Token Optimization

### 5.1 Token Economics of CLAUDE.md

| Factor | Token Impact |
|--------|-------------|
| Baseline CLAUDE.md load (monorepo) | ~20K tokens (~10% of 200K window) |
| Each enabled MCP server | ~6,000 tokens permanent overhead |
| Skill metadata (name + description) | ~100 tokens per skill |
| Skill full SKILL.md load (on trigger) | <5,000 tokens typical |
| Rules file (total across all .md files) | Best kept under ~1,800 words total |
| Auto memory (MEMORY.md first 200 lines) | ~2,000-3,000 tokens |

### 5.2 The 10/80 Rule

> "Keep under 10 enabled MCPs and under 80 total active tools. Exceeding this threshold forces frequent context compaction, adding ~30,000 tokens per session."
> -- [DeepWiki/everything-claude-code token optimization](https://deepwiki.com/affaan-m/everything-claude-code/12.2-token-optimization-strategies)

### 5.3 Cost Reduction Strategies

From a real-world authentication feature comparison:
- **Unoptimized** (all Opus, grep, monolithic auth.ts): **$4.35**
- **Optimized** (model hierarchy, mgrep, modular files): **$0.59**
- **Savings: 86% cost reduction**

Cost attribution breakdown:
- Model selection (Haiku -> Sonnet -> Opus hierarchy): ~60%
- mgrep vs grep: ~10%
- Modular architecture (100-300 line files): ~10%
- MCP discipline: ~6%
- CLAUDE.md optimization: ~14% (remaining)

### 5.4 Practical Token Optimization Checklist

1. **CLAUDE.md**: Keep universal rules under 300 lines
2. **Rules files**: Total ~1,800 words across all `.claude/rules/*.md` files
3. **Skills**: Move detailed workflows out of CLAUDE.md into skills (on-demand loading)
4. **MCPs**: Disable unused MCPs (`disabledMcpServers` field in settings.json)
5. **CLI over MCP**: Use CLI wrappers for read-only operations (94% overhead reduction)
6. **File size**: Keep source files 100-300 lines (reduces retry costs 50x vs monolithic)
7. **/clear**: Between unrelated tasks (saves 50-70% token usage)
8. **/compact**: At 70-75% context usage, with focus instructions

> Sources: [ClaudeLog token optimization](https://claudelog.com/faqs/how-to-optimize-claude-code-token-usage/), [DeepWiki ECC](https://deepwiki.com/affaan-m/everything-claude-code/12.2-token-optimization-strategies)

---

## 6. Skills Auto-Discovery Optimization

### 6.1 How Discovery Works

Claude scans all available skills' frontmatter (`name` + `description`), evaluates relevance to the current task via its transformer forward pass (no embeddings or classifiers), then loads the full SKILL.md content of relevant skills.

### 6.2 Description Writing Best Practices

From [Anthropic's official skill authoring guide](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices):

**ALWAYS write in third person**:
- GOOD: "Processes Excel files and generates reports"
- BAD: "I can help you process Excel files"
- BAD: "You can use this to process Excel files"

**Be specific and include key terms**:
- GOOD: "Fix for PrismaClientKnownRequestError in serverless"
- BAD: "Helps with database problems"

**Include WHAT + WHEN**:
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents.
  Use when working with PDF files or when the user mentions PDFs, forms, or
  document extraction.
```

### 6.3 Activation Rate Impact

From the [Claude Code Skills Structure Guide (Gist)](https://gist.github.com/mellanon/50816550ecb5f3b239aa77eef7b8ed8d):

- Generic description: ~20% activation rate
- Specific keywords + triggers: ~50% activation rate
- Specific keywords + triggers + examples: ~72-90% activation rate

### 6.4 Progressive Disclosure Architecture

```
Startup  -----> Only name + description loaded (~100 tokens/skill)
Match    -----> Full SKILL.md loaded (<5K tokens)
Demand   -----> Referenced files loaded (zero cost until read)
```

**SKILL.md body limit**: Under 500 lines for optimal performance.

**Keep references one level deep**: Nested references (SKILL.md -> advanced.md -> details.md) cause Claude to use `head -100` to preview rather than reading complete files.

### 6.5 Naming Conventions

Use **gerund form** (verb + -ing):
- GOOD: `processing-pdfs`, `analyzing-spreadsheets`, `managing-databases`
- ACCEPTABLE: `pdf-processing`, `process-pdfs`
- BAD: `helper`, `utils`, `tools`, `documents`

> Source: [Skill Authoring Best Practices - Anthropic](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

---

## 7. Hook Integration Patterns

### 7.1 CLAUDE.md vs Hooks Decision Matrix

| Requirement | CLAUDE.md | Hook |
|-------------|-----------|------|
| "Always format code after editing" | Advisory (might skip) | Deterministic (always runs) |
| "Never commit to main" | Can be ignored under pressure | PreToolUse blocks 100% |
| "Run tests before PR" | Depends on context attention | PostToolUse guarantees |
| "Follow API naming conventions" | Good fit (guidance) | Overkill (not automatable) |
| "Use standard error format" | Good fit (pattern guidance) | Not applicable |

**Rule of thumb**: If Claude violating the rule would cause data loss, security issues, or broken CI -- use a hook. If it's a style preference or best practice -- use CLAUDE.md.

### 7.2 Hook Events for Enforcement

| Event | Use For |
|-------|---------|
| `PreToolUse` | Blocking dangerous operations, validating inputs |
| `PostToolUse` | Auto-formatting, running linters, type checking |
| `UserPromptSubmit` | Context injection, prompt transformation |
| `Stop` | Final validation, continuation logic |
| `SubagentStop` | Quality gating subagent output |

### 7.3 Shrivu Shankar's Two-Tier Hook Strategy

**Tier 1 -- Block-at-Submit** (Primary):
- `PreToolUse` hook wraps `Bash(git commit)` commands
- Checks for `/tmp/agent-pre-commit-pass` file
- Blocks commits until build is green, forcing test-and-fix loop

**Tier 2 -- Hint Hooks** (Secondary):
- Non-blocking feedback for suboptimal actions
- Never block at write-time; let agent finish plans before validation

> Source: [sshh.io](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)

### 7.4 Hook Configuration in settings.json

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python .claude/hooks/git-guard.py"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "python .claude/hooks/auto-format.py"
          }
        ]
      }
    ]
  }
}
```

**Exit codes matter**: Code `2` = blocking error (PreToolUse only). Code `0` = success. Other values = non-blocking error.

**Response format**:
```json
{
  "block": true,
  "message": "User-facing reason for blocking",
  "feedback": "Non-blocking information for Claude",
  "suppressOutput": true,
  "continue": false
}
```

> Sources: [Hooks Reference - Official](https://code.claude.com/docs/en/hooks), [claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase)

---

## 8. Multi-Project and Team Patterns

### 8.1 Global vs Project Configuration

**User-level (`~/.claude/CLAUDE.md`)** should contain:
- Personal coding philosophy and non-negotiables
- Privacy directives (secret redaction)
- Code style preferences universal to all projects
- Git conventions (conventional commits format)
- Testing minimums
- Editor preferences

**Project-level (`.claude/CLAUDE.md`)** should contain:
- Tech stack and architecture overview
- Project-specific commands (build/test/deploy)
- Team workflow rules
- Architectural decisions and constraints
- MCP and tool integrations

**Local (`.claude/CLAUDE.local.md`)** should contain:
- Personal sandbox URLs
- Preferred test data
- Machine-specific settings
- Experimental overrides before sharing with team

### 8.2 Symlinks for Shared Rules

```bash
# Share rules across multiple projects
ln -s ~/shared-claude-rules .claude/rules/shared

# Share individual rule files
ln -s ~/company-standards/security.md .claude/rules/security.md
```

Circular symlinks are detected and handled gracefully.

> Source: [Official Memory Docs](https://code.claude.com/docs/en/memory)

### 8.3 Monorepo Pattern

For monorepos, place CLAUDE.md files at multiple levels:

```
monorepo/
  CLAUDE.md                    # Universal rules
  packages/
    api/
      CLAUDE.md                # API-specific rules
    web/
      CLAUDE.md                # Frontend-specific rules
    shared/
      CLAUDE.md                # Shared library rules
```

Claude loads all CLAUDE.md files from cwd up to root. Child CLAUDE.md files load on-demand when Claude reads files in those directories.

### 8.4 Team Coordination Rules in CLAUDE.md

Effective team CLAUDE.md files include:

```markdown
## Team Workflow
- All PRs require at least one human approval
- AI-generated code must pass CI before merge
- Never push directly to main/production branches
- Use conventional commits: feat:, fix:, docs:, chore:
- Create handoff notes at end of each session

## Security
- Never commit .env files or credentials
- Use environment variables for all secrets
- Review diffs carefully before approving AI changes
- Deny read access to .env and secrets/ directories

## AI-Specific Rules
- AI PRs require 2 human approvals minimum (Shrivu's rule)
- Let agent complete, then review final PR quality
- Use /clear between tasks to prevent context pollution
```

---

## 9. Anti-Patterns to Avoid

### 9.1 The Over-Specified CLAUDE.md

> "If your CLAUDE.md is too long, Claude ignores half of it because important rules get lost in the noise."
> -- [Anthropic Best Practices](https://code.claude.com/docs/en/best-practices)

**Fix**: Ruthlessly prune. If Claude already does something correctly without the instruction, delete it or convert it to a hook.

### 9.2 The Kitchen Sink Session

Starting with one task, asking something unrelated, then going back. Context fills with irrelevant information.

**Fix**: `/clear` between unrelated tasks.

### 9.3 Using CLAUDE.md as a Linter

> "Never send an LLM to do a linter's job."
> -- [HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md)

Formatting rules, import ordering, and style enforcement belong in ESLint, Prettier, and hooks -- not CLAUDE.md.

### 9.4 Negative Constraints Without Alternatives

**BAD**: "Never use X"
**GOOD**: "Never use X, prefer Y instead"

Without alternatives, Claude has no guidance on what TO do.

> Source: [sshh.io](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)

### 9.5 Embedding Full Docs via @imports

**BAD**: `@docs/full-api-reference.md` (loads entire file into context)
**GOOD**: Pitch WHY and WHEN to read the file

```markdown
## API Reference
For endpoint details, read docs/api-reference.md when implementing new endpoints.
Key patterns: REST, Zod validation, consistent error format.
```

### 9.6 Auto-Generated CLAUDE.md Without Review

> "CLAUDE.md is the highest leverage point of the harness. Bad instructions cascade through research, planning, and code phases."
> -- [HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md)

`/init` generates a decent starting point but MUST be manually reviewed and pruned.

### 9.7 Duplicating Information Already in Code

Claude learns from your codebase via in-context learning. If your code consistently uses `camelCase`, you don't need to tell Claude "use camelCase." Document only what differs from detectable patterns.

### 9.8 Hotfix Rules for One-Time Behaviors

Adding "fix: always check for null" because Claude missed it once pollutes the file permanently. Instead, improve the specific prompt or add a test.

---

## 10. Advanced Patterns

### 10.1 Emphasis for Adherence

Anthropic confirms that emphasis works:

> "You can tune instructions by adding emphasis (e.g., 'IMPORTANT' or 'YOU MUST') to improve adherence."
> -- [Best Practices](https://code.claude.com/docs/en/best-practices)

Use sparingly. If everything is "CRITICAL" and "MUST", nothing is.

### 10.2 The @import System

```markdown
See @README.md for project overview and @package.json for available npm commands.

# Additional Instructions
- Git workflow: @docs/git-instructions.md
- Personal overrides: @~/.claude/my-project-instructions.md
```

**Behavior**:
- Both relative and absolute paths allowed
- Relative paths resolve relative to the file containing the import
- Recursive imports supported (max depth 5)
- Not evaluated inside markdown code spans/blocks
- First encounter requires approval dialog (one-time per project)

### 10.3 Compaction Instructions in CLAUDE.md

You can control what survives compaction:

```markdown
## Compaction Rules
When compacting, always preserve:
- The full list of modified files
- Any test commands and their results
- Key architectural decisions made in this session
- Current task status and remaining work
```

> Source: [Best Practices](https://code.claude.com/docs/en/best-practices)

### 10.4 Claude's "Constitution" Pattern

From ClaudeLog:

> "CLAUDE.md directives function as system rules defining operational boundaries. User prompts are flexible requests operating within those rules."

This means CLAUDE.md rules have HIGHER priority than user prompts. Design your CLAUDE.md as a constitution that defines the boundaries within which all interactions operate.

### 10.5 The Front-Loading Pattern

From ClaudeLog's CLAUDE.md Supremacy analysis:

> "It has been more effective to front-load the context rather than having Claude whimsily reading files which may or may not poison him."

**Benefits**:
- Higher instruction adherence
- Consistent sequential execution
- Context pollution prevention
- Faster task completion
- Token savings through reduced exploration

**Trade-off**: Larger initial context but more predictable behavior.

### 10.6 Skill-Based Progressive Disclosure

Move detailed information out of CLAUDE.md into skills:

```markdown
# CLAUDE.md (lean)
## Development
- Run tests with `npm test`
- For API development workflow, use /api-conventions skill
- For database migrations, use /db-migrate skill
```

```markdown
# .claude/skills/api-conventions/SKILL.md
---
name: api-conventions
description: REST API design conventions for our services. Use when
  creating or modifying API endpoints, routes, or controllers.
---
# API Conventions
[Detailed API guidelines here - loaded only when needed]
```

### 10.7 Status Line Integration

Custom status lines provide real-time context visibility:

```bash
# .claude/statuslines/statusline.sh
echo "Model: $CLAUDE_MODEL | Branch: $(git branch --show-current) | Context: $CONTEXT_USAGE%"
```

Configure in `settings.json` to display token usage, cost tracking, and git branch during sessions.

> Source: [centminmod/my-claude-code-setup](https://github.com/centminmod/my-claude-code-setup)

---

## 11. Recommendations for MMOS

### 11.1 Current State Assessment

MMOS CLAUDE.md is **461 lines** -- significantly above the recommended 300-line maximum. Analysis of the current structure:

| Section | Lines | Assessment |
|---------|-------|------------|
| Mantra + Deep Analysis | ~15 | KEEP - Core philosophy |
| Rules Enforced by Hooks | ~25 | KEEP - Documents deterministic enforcement |
| Methodology | ~55 | MOVE to `.claude/rules/methodology.md` |
| Database Rules | ~30 | MOVE to `.claude/rules/database.md` (path: `supabase/**`) |
| File Organization | ~55 | TRIM - Claude can infer from `ls` |
| Skills & Agents | ~65 | MOVE to `.claude/rules/skills-agents.md` |
| MMOS Context Parity | ~10 | KEEP - Unique architecture |
| Code Standards | ~30 | MOVE to `.claude/rules/code-standards.md` |
| Development Workflow | ~20 | TRIM - Standard practices |
| Environment | ~15 | KEEP - Can't be inferred |
| Alan's Personal Rules | ~150 | MOVE to `CLAUDE.local.md` or `~/.claude/CLAUDE.md` |

### 11.2 Recommended CLAUDE.md Structure (~120 lines)

```markdown
# AIOS-FULLSTACK Development Rules

## Mantra
"Never take the lazy path. Do the hard work now."

## CRITICAL
- Deep analysis always. 30 min of analysis = 10h of debugging avoided.
- VERIFY PHYSICALLY before theorizing (ls, curl, query).
- Discovery before implementation. Existing -> Gap -> Options -> Recommendation.
- Determinism first: Code > SQL > Regex > LLM (last resort).
- ETL fetch-page.js for web content ($0) > WebFetch (tokens).

## Hooks (Deterministic Enforcement)
See `.claude/hooks/README.md`. Protected files must be read completely.

## Architecture
- Skills: `.claude/skills/*/SKILL.md` (project-level)
- Agents: `.claude/agents/*.md`
- MMOS Context Parity: `docs/mmos/CONTEXT_PARITY.md`
- Pipeline state: `outputs/minds/{slug}/metadata/state.json`

## Key Commands
| Command | Description |
|---------|-------------|
| npm run dev | Start development |
| npm test | Run tests |
| npm run lint | Check code style |
| npm run build | Build project |

## Environment
| Env | URL |
|-----|-----|
| Staging | stage.lendario.ai |
| Production | app.lendario.ai |

## Compaction Rules
When compacting, preserve: modified files list, test results, decisions, task status.

## Quick References
- Code standards: @.claude/rules/code-standards.md
- Database rules: @.claude/rules/database.md
- Skills/agents reference: @.claude/rules/skills-agents.md
```

### 11.3 Recommended Rules Files

```
.claude/rules/
  code-standards.md          # Icon system, PageLayout, Vertex AI, error handling
  database.md                # paths: supabase/**, prisma/**
  methodology.md             # Debugging, discovery, determinism, ETL
  skills-agents.md           # Skills/agents taxonomy, frontmatter reference
  file-organization.md       # Directory structure, squad structure
  alan-preferences.md        # NEVER/ALWAYS/IF-SAYS rules (or move to CLAUDE.local.md)
```

### 11.4 Key Actions

1. **Split CLAUDE.md** from 461 lines to ~120 lines using rules files
2. **Move personal rules** to `.claude/rules/alan-preferences.md` or `CLAUDE.local.md`
3. **Add path targeting** to domain-specific rules (database, API, frontend)
4. **Add compaction rules** to preserve critical context during auto-compaction
5. **Audit existing hooks** -- any CLAUDE.md rule that gets violated should become a hook
6. **Enable auto memory** (`CLAUDE_CODE_DISABLE_AUTO_MEMORY=0`) for Claude's auto-notes
7. **Add status line** for real-time token/cost visibility
8. **Review quarterly** -- delete rules Claude already follows without instruction

---

## Sources

- [Best Practices - Claude Code Official Docs](https://code.claude.com/docs/en/best-practices)
- [Manage Claude's Memory - Official Docs](https://code.claude.com/docs/en/memory)
- [Claude Code Settings - Official Docs](https://code.claude.com/docs/en/settings)
- [Hooks Reference - Official Docs](https://code.claude.com/docs/en/hooks)
- [Extend Claude with Skills - Official Docs](https://code.claude.com/docs/en/skills)
- [Skill Authoring Best Practices - Anthropic Platform Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [The Complete Guide to CLAUDE.md - Builder.io](https://www.builder.io/blog/claude-md-guide)
- [Writing a Good CLAUDE.md - HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [CLAUDE.md Supremacy - ClaudeLog](https://claudelog.com/mechanics/claude-md-supremacy/)
- [Creating the Perfect CLAUDE.md - Dometrain](https://dometrain.com/blog/creating-the-perfect-claudemd-for-claude-code/)
- [CLAUDE.md Concise Optimization - SmartScope](https://smartscope.blog/en/generative-ai/claude/claude-md-concise-agent-optimization-2026/)
- [Rules Directory Guide - claudefa.st](https://claudefa.st/blog/guide/mechanics/rules-directory)
- [Modular Rules in Claude Code - claude-blog.setec.rs](https://claude-blog.setec.rs/blog/claude-code-rules-directory)
- [How I Use Every Claude Code Feature - sshh.io](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
- [Using CLAUDE.md Files - Anthropic Blog](https://claude.com/blog/using-claude-md-files)
- [15 Tips from Running 6 Projects - DEV Community](https://dev.to/lukaszfryc/claude-code-best-practices-15-tips-from-running-6-projects-2026-9eb)
- [Ultimate AI Coding Guide - Sabrina.dev](https://www.sabrina.dev/p/ultimate-ai-coding-guide-claude-code)
- [everything-claude-code - GitHub](https://github.com/affaan-m/everything-claude-code)
- [everything-claude-code Token Optimization - DeepWiki](https://deepwiki.com/affaan-m/everything-claude-code/12.2-token-optimization-strategies)
- [claude-code-showcase - GitHub](https://github.com/ChrisWiles/claude-code-showcase)
- [centminmod/my-claude-code-setup - GitHub](https://github.com/centminmod/my-claude-code-setup)

---

## Gaps and Further Research

1. **Managed policy deployment**: No real-world examples found of organization-level CLAUDE.md deployment via MDM/Ansible. This is likely enterprise-only and underdocumented.

2. **CLAUDE.md performance benchmarks**: No quantitative data on how different CLAUDE.md sizes affect output quality. The 300-line recommendation is based on practitioner experience, not controlled experiments.

3. **Path-targeted rules effectiveness**: No measurement of how path targeting improves rule adherence compared to unconditional rules. Anecdotally strong but unquantified.

4. **Auto memory maturity**: Still in gradual rollout. Interaction between auto memory and CLAUDE.md is not well-documented. Unclear if auto memory notes can conflict with CLAUDE.md rules.

5. **Plugin marketplace rules**: How marketplace-distributed plugins interact with local CLAUDE.md rules. Precedence unclear.

6. **Multi-agent CLAUDE.md**: When using Agent Teams (experimental), how CLAUDE.md is loaded by the team lead vs worker agents. Does each agent get full CLAUDE.md or scoped subset?

7. **Quantitative impact of emphasis**: "IMPORTANT" and "YOU MUST" confirmed to work, but no measurement of how much they improve adherence or at what point emphasis saturation causes diminishing returns.
