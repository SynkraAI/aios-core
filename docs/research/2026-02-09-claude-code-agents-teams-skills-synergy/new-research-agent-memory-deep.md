# Deep Research: Claude Code Agent Memory -- Persistent Cross-Session Knowledge

**Date:** 2026-02-09
**Researcher:** deep-researcher agent
**Sources consulted:** 18 unique
**Pages read fully:** 12

---

## TL;DR

- Agent memory (`memory:` frontmatter field) shipped in **v2.1.33** (Feb 6, 2026), giving each subagent a persistent directory that survives across conversations
- Three scopes: `user` (~/.claude/agent-memory/<name>/), `project` (.claude/agent-memory/<name>/), `local` (.claude/agent-memory-local/<name>/)
- First **200 lines** of MEMORY.md are auto-injected into the subagent's system prompt at startup; topic files are read on demand
- Read, Write, and Edit tools are **automatically enabled** so the agent can manage its memory files (even if not listed in `tools:`)
- Agent memory is **isolated per agent name** -- no shared state between agents, no conflict risk
- This is a **native Claude Code feature**, not third-party; it complements (not replaces) CLAUDE.md, auto memory, and session memory

---

## 1. What is Agent Memory?

Agent memory is a **persistent file-based knowledge store** scoped to individual custom subagents. It was introduced as the `memory` frontmatter field in the agent definition file (`.claude/agents/<name>.md` or `~/.claude/agents/<name>.md`).

When enabled, Claude Code:
1. Creates a dedicated directory for that agent
2. Injects memory management instructions into the agent's system prompt
3. Loads the first 200 lines of MEMORY.md from that directory into the system prompt
4. Auto-enables Read/Write/Edit tools so the agent can manage its own memory files

### Official Documentation Description

> "The memory field gives the subagent a persistent directory that survives across conversations. The subagent uses this directory to build up knowledge over time, such as codebase patterns, debugging insights, and architectural decisions."
> -- [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)

### Minimum Configuration

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---

You are a code reviewer. As you review code, update your agent memory with
patterns, conventions, and recurring issues you discover.
```

---

## 2. Memory Scopes: user vs project vs local

The `memory:` field accepts one of three scope values. Each determines **where** the memory directory is stored and **who** can access it.

| Scope | Storage Path | Version Control | Visibility | Use When |
|-------|-------------|----------------|------------|----------|
| `user` | `~/.claude/agent-memory/<agent-name>/` | Never (home dir) | Only you, all projects | Agent learns patterns across ALL your projects |
| `project` | `.claude/agent-memory/<agent-name>/` | Yes (can commit) | Team-shared | Agent knowledge is project-specific and team-shareable |
| `local` | `.claude/agent-memory-local/<agent-name>/` | No (gitignored) | Only you, this project | Private project knowledge not for version control |

### Scope Selection Decision Tree

```
Is this knowledge useful across all your projects?
  YES --> memory: user
  NO  --> Is this knowledge shareable with the team?
    YES --> memory: project
    NO  --> memory: local
```

### Recommended Defaults

From official docs:
> "`user` is the recommended default scope. Use `project` or `local` when the subagent's knowledge is only relevant to a specific codebase."

### Real-World Example: This Project (MMOS)

All 37 agents in this project use `memory: project`, storing memories in `.claude/agent-memory/<name>/`:

```
.claude/agent-memory/
  aios-dev/MEMORY.md         # Build patterns, ESM/CJS gotchas, test infrastructure
  aios-architect/MEMORY.md   # Squad architecture patterns, tier system, orchestrator design
  aios-qa/MEMORY.md          # SKILL.md YAML patterns, story file dual locations
  deep-researcher/MEMORY.md  # Source quality cache, tool reliability, search patterns
  sop-extractor/MEMORY.md    # Extraction patterns from videos/books/interviews
  validation-agent/MEMORY.md # Test markers for memory loading validation
  ... (14 total active directories)
```

---

## 3. How Agent Memory Works Technically

### 3.1 Initialization

When Claude Code starts a session and encounters an agent with `memory: <scope>`:

1. **Directory resolution**: Resolves the storage path based on scope and agent name
2. **Directory creation**: Creates the directory if it doesn't exist
3. **MEMORY.md check**: Looks for `MEMORY.md` in the directory
4. **System prompt injection**: Injects two things into the agent's system prompt:
   - **Memory management instructions** (from `system-prompt-agent-memory-instructions.md`, ~337 tokens)
   - **First 200 lines of MEMORY.md** (from `system-reminder-memory-file-contents.md` template)

### 3.2 System Prompt Injection

The injected memory uses this template format:

```
# Persistent Agent Memory

You have a persistent Persistent Agent Memory directory at `<path>`.
Its contents persist across conversations.

As you work, consult your memory files to build on previous experience.
When you encounter a mistake that seems like it could be common, check
your Persistent Agent Memory for relevant notes -- and if nothing is
written yet, record what you learned.

Guidelines:
- `MEMORY.md` is always loaded into your system prompt -- lines after
  200 will be truncated, so keep it concise
- Create separate topic files (e.g., `debugging.md`, `patterns.md`)
  for detailed notes and link to them from MEMORY.md
- Record insights about problem constraints, strategies that worked
  or failed, and lessons learned
- Update or remove memories that turn out to be wrong or outdated
- Organize memory semantically by topic, not chronologically
- Use the Write and Edit tools to update your memory files

## MEMORY.md

<contents of first 200 lines>
```

### 3.3 The Agent Memory Instructions System Prompt

Discovered via Piebald-AI's extracted system prompts, this is what Claude Code injects when creating agents with memory enabled:

> "If the user mentions 'memory', 'remember', 'learn', 'persist', or similar concepts, OR if the agent would benefit from building up knowledge across conversations (e.g., code reviewers learning patterns, architects learning codebase structure, etc.), include domain-specific memory update instructions in the systemPrompt."

The instructions are **domain-tailored**:
- **Code reviewer**: "Update your agent memory as you discover code patterns, style conventions, common issues, and architectural decisions."
- **Test runner**: "Update your agent memory as you discover test patterns, common failure modes, flaky tests, and testing best practices."
- **Architect**: "Update your agent memory as you discover codepaths, library locations, key architectural decisions, and component relationships."
- **Documentation writer**: "Update your agent memory as you discover documentation patterns, API structures, and terminology conventions."

### 3.4 Reading Memory

- MEMORY.md first 200 lines: **automatically injected** into system prompt at session start
- Topic files (debugging.md, patterns.md, etc.): **read on demand** when the agent needs them
- The agent uses standard Read/Grep/Glob tools to access its memory directory
- No special API or MCP tool required -- just filesystem access

### 3.5 Writing Memory

- The agent uses standard Write/Edit tools to update files in its memory directory
- **Read, Write, and Edit tools are automatically enabled** when memory is active, even if not explicitly listed in `tools:`
- The agent writes during the session as it discovers useful information
- No automatic extraction -- the agent must be instructed (via system prompt) to proactively update memory

### 3.6 The 200-Line Constraint

This is the most critical constraint:

- **Only the first 200 lines** of MEMORY.md are loaded into the system prompt
- Lines beyond 200 are **silently truncated**
- The agent is instructed to keep MEMORY.md concise by moving details into topic files
- Topic files have **no size limit** but are not auto-loaded

**Strategy for managing the 200-line budget:**
```
MEMORY.md (loaded at startup, max 200 lines):
  - Index/table of contents
  - Most important patterns and rules
  - Links to topic files
  - Summary statistics

topic-files/ (loaded on demand):
  - debugging.md (detailed debugging notes)
  - patterns.md (code patterns discovered)
  - architecture.md (architectural decisions)
  - gotchas.md (known traps and pitfalls)
```

---

## 4. Agent Memory vs Other Memory Systems

Claude Code has **five distinct memory systems**. Understanding their differences is critical.

### Complete Memory Taxonomy

| System | Who Writes | Who Reads | Persistence | Scope | Auto-loaded |
|--------|-----------|-----------|-------------|-------|-------------|
| **CLAUDE.md** | Human (manual) | Main Claude + all agents | Permanent | Project/User/Managed | Yes (full) |
| **CLAUDE.local.md** | Human + /remember | Main Claude | Permanent | Project (private) | Yes (full) |
| **Auto Memory** | Main Claude (auto) | Main Claude | Permanent | Project | Yes (200 lines) |
| **Session Memory** | Claude (background) | Main Claude | Per-session + summaries | Session | Relevant summaries |
| **Agent Memory** | Subagent (manual) | That specific subagent | Permanent | User/Project/Local | Yes (200 lines) |

### Key Differentiators

**1. CLAUDE.md vs Agent Memory**
- CLAUDE.md: Human-authored instructions, loaded by ALL agents and main session
- Agent Memory: Agent-authored notes, loaded ONLY by that specific agent
- CLAUDE.md is prescriptive ("do X"); Agent Memory is descriptive ("I discovered Y")
- They complement each other: CLAUDE.md sets rules, Agent Memory records discoveries

**2. Auto Memory vs Agent Memory**
- Auto Memory: Main session's discoveries at `~/.claude/projects/<project>/memory/`
- Agent Memory: Specific subagent's discoveries at `.claude/agent-memory/<name>/`
- Auto Memory is shared across ALL conversations in the main session
- Agent Memory is isolated to one specific agent type
- Both use the same 200-line MEMORY.md + topic files pattern

**3. Session Memory vs Agent Memory**
- Session Memory: Background extraction of conversation highlights
- Agent Memory: Deliberate curation by the agent itself
- Session Memory auto-extracts every ~5K tokens or 3 tool calls
- Agent Memory requires the agent to actively write (based on instructions)
- Session Memory is read-only for Claude; Agent Memory is read-write

### How They Interact

```
Session Start:
  1. CLAUDE.md loaded (all levels: managed > project > user)
  2. .claude/rules/*.md loaded (conditional by path)
  3. Auto Memory MEMORY.md loaded (first 200 lines)
  4. Session Memory summaries injected (relevant past sessions)

When Subagent Spawned:
  5. Agent's markdown body becomes system prompt
  6. Agent's MEMORY.md loaded (first 200 lines)
  7. Agent's skills injected (if listed)
  8. CLAUDE.md is NOT loaded into subagent context
  9. Auto Memory is NOT loaded into subagent context
  10. Session Memory is NOT loaded into subagent context
```

**Critical insight**: Subagents receive ONLY their own system prompt + their own agent memory. They do NOT inherit CLAUDE.md, auto memory, or session memory from the parent conversation. This is by design -- subagents have isolated context.

---

## 5. Patterns and Best Practices

### 5.1 What to Store in Agent Memory

Based on the Repomix project (yamadashy/repomix) and official recommendations:

**Good candidates for agent memory:**
- Codebase-specific patterns discovered through work
- Solutions to tricky problems that required significant effort
- Architectural decisions and their rationale
- Non-obvious gotchas and pitfalls
- In-progress work that may resume later
- Terminology and conventions specific to the domain

**Bad candidates (store elsewhere):**
- Rules and instructions (put in CLAUDE.md instead)
- Temporary session state (session memory handles this)
- Large datasets or code snippets (too big for 200-line budget)
- Universal knowledge (Claude already knows this)

### 5.2 Memory File Organization (Repomix Pattern)

The Repomix project provides an exemplary pattern for agent memory organization:

```yaml
# Every memory file requires frontmatter:
---
summary: "1-2 line description for quick scanning"
created: 2026-02-09
---
```

**Category-based folders:**
```
memories/
  file-processing/
    large-file-memory-issue.md
  dependencies/
    iconv-esm-problem.md
  project-context/
    february-2026-work.md
```

**Search workflow (summary-first):**
1. `ls .claude/agent-memory/<name>/` -- list categories
2. `rg "^summary:" .claude/agent-memory/<name>/ --no-ignore --hidden` -- scan all summaries
3. `rg "keyword" .claude/agent-memory/<name>/ --no-ignore --hidden -i` -- full-text search
4. Read specific file if relevant

### 5.3 Instructing Agents to Use Memory

**In the agent's system prompt (markdown body):**

```markdown
## Memory Management

Before starting work:
- Read your MEMORY.md for relevant past discoveries
- Check topic files for detailed notes on the current area

During work:
- Record non-obvious patterns and gotchas as you discover them
- Update existing notes when you find corrections or improvements

After completing work:
- Save key learnings to appropriate topic files
- Update MEMORY.md index if new topics were created
- Remove outdated entries
```

**Prompting the agent explicitly:**
```
Use the code-reviewer to review the auth module, and check your memory for patterns you've seen before
```

```
Now that you're done, save what you learned to your memory
```

### 5.4 The Deep Researcher Pattern (This Project)

This project's deep-researcher agent demonstrates an advanced memory pattern:

```markdown
# Deep Researcher Memory

> Cross-session research knowledge. Auto-loaded (first 200 lines).
> Per-run findings go in wave-N-summary.md. This file is for patterns.

**Last updated:** 2026-02-09
**Sessions:** 7

## Research Index (past topics)
| Date | Slug | Topic | Key Outcome |

## Source Quality Cache
### HIGH Reliability
- official docs, specific blog URLs with notes

## Tool Reliability
| Tool | Status | Notes |

## Search Patterns
### Effective Query Patterns

## Anti-Patterns (avoid these)

## Recent Discoveries
- Specific technical findings from sessions
```

This pattern uses MEMORY.md as a **curated index** with:
- Research history table (what was done before)
- Source quality ratings (which sites to trust)
- Tool status (what works/doesn't work)
- Patterns (effective query strategies)
- Anti-patterns (mistakes to avoid)
- Recent discoveries (latest findings, pruned regularly)

---

## 6. Limitations and Constraints

### 6.1 Size Constraints

| Constraint | Value | Impact |
|-----------|-------|--------|
| MEMORY.md auto-load | First 200 lines only | Must keep index concise |
| Topic files | No size limit | But consume context when read |
| Total directory | No hard limit | Practical limit ~50-100 files |
| File format | Markdown only (convention) | Any text works technically |

### 6.2 Isolation Constraints

- **No cross-agent memory sharing**: Agent A cannot read Agent B's memory directory
- **No inheritance**: Child agents don't inherit parent memory
- **No main session access**: The main conversation cannot directly access agent memory
- **No team access**: Agent team teammates don't share memory with each other

### 6.3 Write Constraints

- Agents must be **instructed** to write memory -- it's not automatic
- No background extraction (unlike session memory)
- No deduplication mechanism (agent must curate manually)
- No conflict resolution for concurrent writes (but agents run sequentially, so this rarely matters)
- No versioning/history (just current state)

### 6.4 Scope Constraints

- `memory: user` agents: same agent name across projects shares the SAME memory directory
- `memory: project` agents: committed to version control by default (may contain sensitive info)
- `memory: local` agents: lost if `.claude/agent-memory-local/` is not backed up

### 6.5 Current Feature Gaps

Based on GitHub issues #4588 and #24316:

| Gap | Status | Tracking |
|-----|--------|----------|
| Agent team teammates can't use agent definitions (always general-purpose) | Requested | [#24316](https://github.com/anthropics/claude-code/issues/24316) |
| No automatic memory extraction for agents | By design | Agent must self-curate |
| No memory search/query tool (semantic) | Not planned natively | Use MCP (Mem0, etc.) |
| No memory consolidation/dedup | Not built-in | Manual curation required |
| No memory sharing between agents | By design | Isolation is intentional |

---

## 7. Timeline and Version History

| Version | Date | Feature |
|---------|------|---------|
| v2.1.31 | Feb 2026 | `system-prompt-agent-memory-instructions.md` added -- domain-specific memory guidance template |
| v2.1.32 | Feb 6, 2026 | Auto memory: "Claude now automatically records and recalls memories as it works" |
| v2.1.33 | Feb 6, 2026 | **`memory` frontmatter field** released with `user`, `project`, `local` scopes |
| Pre-2.1.31 | Before Feb 2026 | Community workarounds: claude-mem, Memory-MCP, manual MEMORY.md patterns |

### Prior Art (Community Solutions)

Before native agent memory, the community built:

| Solution | Approach | Token Cost |
|----------|----------|------------|
| **claude-mem** | PostToolUse hooks + SQLite + Chroma, 3-layer progressive retrieval | ~10x savings |
| **Memory-MCP** | MCP server + compact CLAUDE.md briefing (~150 lines) | Low |
| **Mem0** | Universal memory layer, semantic extraction | 90% lower token usage claimed |
| **super-claude-kit** | File-based state system, zero dependencies | Zero |
| **Manual MEMORY.md** | Agent instructions to read/write specific files | Zero |

The native `memory:` field essentially standardized the "manual MEMORY.md" pattern into a first-class feature with automatic directory management and system prompt injection.

---

## 8. Real-World Repos Using Agent Memory

### 8.1 yamadashy/repomix

The Repomix project has a full agent-memory skill with:
- Category-based folder organization
- Required YAML frontmatter (summary, created date)
- Summary-first search workflow using ripgrep
- Proactive save triggers (research findings, non-obvious patterns)
- Maintenance operations (consolidate, reorganize, delete outdated)

Source: [github.com/yamadashy/repomix/.claude/skills/agent-memory/SKILL.md](https://github.com/yamadashy/repomix/blob/main/.claude/skills/agent-memory/SKILL.md)

### 8.2 This Project (MMOS/AIOS-FULLSTACK)

37 agents, all using `memory: project`, with 14 active memory directories containing:
- **aios-dev**: ESM/CJS gotchas, Supabase mock patterns, test infrastructure
- **aios-architect**: Squad tier patterns, orchestrator design, quality gates
- **aios-qa**: SKILL.md YAML structure, story file locations, review history
- **deep-researcher**: Source quality cache, search patterns, tool reliability
- **sop-extractor**: Extraction patterns for videos/books/interviews, SOP templates
- **validation-agent**: Test markers for empirical validation of memory loading

### 8.3 VoltAgent/awesome-claude-code-subagents

126+ subagent definitions across 10 categories. While the individual files weren't directly examined, the repository structure suggests memory-enabled agents for specialized domains.

Source: [github.com/VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)

---

## 9. Architecture Diagram

```
                    CLAUDE CODE SESSION
                    ===================

Main Conversation
  |
  |-- CLAUDE.md (loaded at start, all levels)
  |-- .claude/rules/*.md (conditional by path)
  |-- Auto Memory (~/.claude/projects/<proj>/memory/MEMORY.md, 200 lines)
  |-- Session Memory (background summaries from past sessions)
  |
  |-- [Spawns Subagent: code-reviewer]
  |     |
  |     |-- Agent's .md body (system prompt)
  |     |-- Agent Memory: ~/.claude/agent-memory/code-reviewer/
  |     |     |-- MEMORY.md (200 lines -> system prompt)
  |     |     |-- patterns.md (on-demand)
  |     |     |-- gotchas.md (on-demand)
  |     |-- Tools: Read, Write, Edit (auto-enabled) + configured tools
  |     |-- Skills: listed in frontmatter (injected)
  |     |
  |     '-- [Returns results to main conversation]
  |
  |-- [Spawns Subagent: deep-researcher]
  |     |
  |     |-- Agent's .md body (system prompt)
  |     |-- Agent Memory: .claude/agent-memory/deep-researcher/
  |     |     |-- MEMORY.md (200 lines -> system prompt)
  |     |     |-- (topic files on demand)
  |     |-- Separate, isolated context from code-reviewer
  |     |
  |     '-- [Returns results to main conversation]
  |
  '-- Main conversation continues with subagent results
```

---

## 10. Practical Recommendations

### For Setting Up Agent Memory

1. **Start with `memory: project`** for team agents -- shareable knowledge is more valuable
2. **Use `memory: user`** only for personal utility agents (your personal code reviewer)
3. **Use `memory: local`** when memory contains sensitive data or personal experiments
4. **Keep MEMORY.md under 150 lines** -- leave buffer for growth within the 200-line limit
5. **Structure MEMORY.md as an index**, not a dump -- link to topic files for details

### For Instructing Agents

6. **Include explicit memory instructions** in the agent's system prompt body
7. **Tell agents what to remember** -- domain-specific guidance produces better curation
8. **Periodically ask agents to clean up** -- "review your memory and remove outdated entries"
9. **Check memory before delegating** -- "review the auth module, check your memory for past patterns"

### For Team Workflows

10. **Commit `.claude/agent-memory/`** to version control for `project` scope
11. **Add `.claude/agent-memory-local/` to .gitignore** (Claude Code does this automatically for `local` scope)
12. **Use consistent agent names** across team members -- same name = same memory directory
13. **Review agent memories in PRs** -- treat them like documentation changes

### For Large Codebases

14. **One agent per concern** -- don't make one agent remember everything
15. **Topic files > monolithic MEMORY.md** -- better for on-demand loading
16. **Use the Repomix pattern** -- YAML frontmatter with summaries for efficient scanning
17. **Prune regularly** -- outdated memories are worse than no memories

---

## Sources

### Official Documentation
- [Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Manage Claude's memory - Claude Code Docs](https://code.claude.com/docs/en/memory)

### Changelog and Releases
- [Claude Code CHANGELOG.md](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- [Claude Code v2.1.33 Release Notes - ClaudeWorld](https://claude-world.com/articles/claude-code-2133-release/)
- [Releasebot - Claude Code Updates](https://releasebot.io/updates/anthropic/claude-code)

### GitHub Issues and Discussions
- [Issue #4588: Persistent Memory for Specialized Agents](https://github.com/anthropics/claude-code/issues/4588)
- [Issue #24316: Agent Team Teammates from .claude/agents/](https://github.com/anthropics/claude-code/issues/24316)

### System Prompt Internals
- [Piebald-AI/claude-code-system-prompts](https://github.com/Piebald-AI/claude-code-system-prompts)
- [Agent memory instructions prompt](https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/system-prompt-agent-memory-instructions.md)
- [Memory file contents template](https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/system-reminder-memory-file-contents.md)
- [Remember skill prompt](https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/agent-prompt-remember-skill.md)

### Real-World Examples
- [Repomix agent-memory skill](https://github.com/yamadashy/repomix/blob/main/.claude/skills/agent-memory/SKILL.md)
- [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)

### Community Analysis
- [Session Memory mechanics - claudefa.st](https://claudefa.st/blog/guide/mechanics/session-memory)
- [Persistent Memory Architecture - DEV Community](https://dev.to/suede/the-architecture-of-persistent-memory-for-claude-code-17d)
- [Claude Code Memory System - Developer Toolkit](https://developertoolkit.ai/en/claude-code/advanced-techniques/memory-system/)
- [Context and Memory Management](https://angelo-lima.fr/en/claude-code-context-memory-management/)

### Third-Party Memory Solutions
- [claude-mem](https://github.com/thedotmack/claude-mem)
- [Mem0 integration](https://mem0.ai/blog/persistent-memory-for-claude-code)
- [super-claude-kit](https://github.com/arpitnath/super-claude-kit)

---

## Gaps (Needs Further Research)

1. **Exact system prompt template**: The full injected text for `# Persistent Agent Memory` section has been partially reconstructed from this project's own agent output, but the exact source code in Claude Code's codebase has not been confirmed
2. **Memory size limits**: No documented hard limit on total directory size or number of files -- only the 200-line MEMORY.md auto-load limit is documented
3. **Concurrent access**: What happens if two sessions invoke the same agent simultaneously and both write to memory? No documentation exists
4. **Agent Teams + Memory**: Issue #24316 requests agent team teammates to inherit memory from agent definitions, but this is not yet implemented
5. **Memory migration**: No documented path for migrating from `user` to `project` scope or vice versa (manual file move likely works)
6. **Performance impact**: No benchmarks on how agent memory size affects session startup time or context usage
7. **Memory in Agent SDK**: Whether the Claude Agent SDK (programmatic use) supports agent memory equivalently to the CLI -- needs verification

---

*Research completed 2026-02-09 by deep-researcher agent*
*18 sources consulted, 12 pages read fully, 37 local agent files analyzed*
