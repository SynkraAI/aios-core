# Deep Research: Claude Code Agent Memory System

> **Wave 1 Research** | 2026-02-09 | 20+ sources consulted, 15+ pages deep-read

## TL;DR

- Claude Code has **5 layers of memory**: Managed Policy, Project CLAUDE.md, Project Rules, User CLAUDE.md, Project Local CLAUDE.md, and Auto Memory -- plus **Session Memory** as a background system
- **Agent memory frontmatter** (`memory: user|project|local`) was added in v2.1.33 (2026-02-06), giving subagents persistent directories at `~/.claude/agent-memory/<name>/`, `.claude/agent-memory/<name>/`, or `.claude/agent-memory-local/<name>/`
- **MEMORY.md** is the entrypoint file in any memory directory; first **200 lines are auto-loaded** into the system prompt; content beyond 200 lines requires topic files
- **Session Memory** runs automatically in the background, writing summaries every ~5K tokens or 3 tool calls; summaries are injected at session start as reference material (not instructions)
- **Teams/Teammates do NOT have persistent memory** -- only subagents support `memory:` frontmatter. Teammates start fresh every time
- The **Memory Tool** (API-level, beta) enables custom agent applications to implement client-side persistent memory with view/create/str_replace/insert/delete/rename commands
- **Compound learning** is real: documented patterns show debugging time dropping from 2h -> 5min -> 2min as agent memory accumulates institutional knowledge

---

## 1. Memory Architecture Overview

Claude Code implements a multi-layered memory system with different scopes, persistence, and loading behaviors.

### 1.1 Memory Types Hierarchy

| Memory Type | Location | Purpose | Shared With | Loading |
|-------------|----------|---------|-------------|---------|
| **Managed Policy** | `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS) | Org-wide instructions | All users | Full at launch |
| **Project Memory** | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team-shared project instructions | Team (VCS) | Full at launch |
| **Project Rules** | `./.claude/rules/*.md` | Modular topic-specific instructions | Team (VCS) | Full at launch |
| **User Memory** | `~/.claude/CLAUDE.md` | Personal prefs for all projects | Just you | Full at launch |
| **Project Local** | `./CLAUDE.local.md` | Personal project-specific prefs | Just you (gitignored) | Full at launch |
| **Auto Memory** | `~/.claude/projects/<project>/memory/` | Claude's automatic notes | Just you (per project) | First 200 lines of MEMORY.md |

> Source: [Manage Claude's memory - Official Docs](https://code.claude.com/docs/en/memory)

### 1.2 CLAUDE.md Loading Behavior

- Files in directory hierarchy **above** working directory: loaded in **full at launch**
- Files in **child directories**: loaded **on demand** when Claude reads files there
- More specific instructions **take precedence** over broader ones
- **Imports** supported via `@path/to/file` syntax (max 5 hops of recursion)
- CLAUDE.local.md is **automatically gitignored**

### 1.3 Auto Memory Directory Structure

```
~/.claude/projects/<project>/memory/
├── MEMORY.md          # Concise index (first 200 lines loaded)
├── debugging.md       # Topic file (loaded on demand)
├── api-conventions.md # Topic file (loaded on demand)
└── ...                # Any files Claude creates
```

- `<project>` path is derived from **git repository root**
- All subdirectories within same repo **share one memory directory**
- Git **worktrees get separate** memory directories
- Outside git repos, **working directory** is used instead

> Source: [Manage Claude's memory - Official Docs](https://code.claude.com/docs/en/memory)

---

## 2. Agent Persistent Memory (Frontmatter)

### 2.1 The `memory` Field

Added in **v2.1.33** (released 2026-02-06), the `memory` frontmatter field gives subagents a persistent directory that survives across conversations.

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---

You are a code reviewer. As you review code, update your agent memory with
patterns, conventions, and recurring issues you discover.
```

> Source: [Create custom subagents - Official Docs](https://code.claude.com/docs/en/sub-agents) | [Release v2.1.33](https://github.com/anthropics/claude-code/releases/tag/v2.1.33)

### 2.2 Memory Scopes

| Scope | Location | Use When |
|-------|----------|----------|
| `user` | `~/.claude/agent-memory/<agent-name>/` | Agent should remember across ALL projects |
| `project` | `.claude/agent-memory/<agent-name>/` | Knowledge is project-specific, shareable via VCS |
| `local` | `.claude/agent-memory-local/<agent-name>/` | Project-specific, NOT in version control |

### 2.3 What Happens When Memory Is Enabled

When the `memory` field is set on a subagent:

1. The subagent's system prompt includes **instructions for reading/writing** to the memory directory
2. The first **200 lines of MEMORY.md** in the memory directory are **injected into the system prompt**
3. Instructions to **curate MEMORY.md** if it exceeds 200 lines are included
4. **Read, Write, and Edit tools** are automatically enabled so the subagent can manage its memory files

### 2.4 Best Practices for Agent Memory

From official documentation:

- **`user` is the recommended default scope** -- use `project` or `local` only when knowledge is project-specific
- **Ask the subagent to consult its memory before starting work**: "Review this PR, and check your memory for patterns you've seen before"
- **Ask the subagent to update memory after completing tasks**: "Now that you're done, save what you learned to your memory"
- **Include memory instructions in the agent's markdown body** so it proactively maintains its knowledge base:

```markdown
Update your agent memory as you discover codepaths, patterns, library
locations, and key architectural decisions. This builds up institutional
knowledge across conversations. Write concise notes about what you found
and where.
```

> Source: [Create custom subagents - Official Docs](https://code.claude.com/docs/en/sub-agents)

### 2.5 CLI-Defined Agents Also Support Memory

When using `--agents` flag for session-only agents, the `memory` field is supported:

```bash
claude --agents '{
  "reviewer": {
    "description": "Code reviewer with persistent memory",
    "prompt": "You are a code reviewer...",
    "tools": ["Read", "Grep", "Glob"],
    "memory": "project"
  }
}'
```

> Source: [Create custom subagents - Official Docs](https://code.claude.com/docs/en/sub-agents)

---

## 3. Session Memory

### 3.1 How It Works

Session Memory is Claude Code's **automatic background system** that captures and recalls work across sessions without manual intervention.

- **First extraction** triggers after ~10,000 tokens of conversation
- **Subsequent updates** every ~5,000 tokens or after every 3 tool calls (whichever first)
- Summaries stored at: `~/.claude/projects/<project-hash>/<session-id>/session-memory/summary.md`
- Each session gets its own directory

> Source: [Claude Code Session Memory - ClaudeFast](https://claudefa.st/blog/guide/mechanics/session-memory)

### 3.2 What Gets Captured

Each summary contains:
- **Session title**: auto-generated description (e.g., "Implement user dashboard with role-based access")
- **Current status**: completed items, discussion points, open questions
- **Key results**: important outcomes, decisions, patterns
- **Work log**: chronological record of actions taken

### 3.3 Cross-Session Recall

At session start, Claude **injects relevant past session summaries** into context. Critically, these carry metadata noting they are "from PAST sessions that might not be related to the current task" -- Claude treats them as **reference material, not instructions**.

### 3.4 The /remember Command

`/remember` bridges automatic and deliberate memory:
1. Reviews stored session memories
2. Identifies **recurring patterns** across multiple sessions
3. Proposes updates to `CLAUDE.local.md`
4. User confirms each addition before writing

Example: If Claude corrected the same coding pattern across 3 sessions, `/remember` surfaces it as a candidate for permanent configuration.

### 3.5 Instant Compaction

Session Memory enables **instant `/compact`** -- since summaries are written continuously in the background, compaction just loads the pre-written summary into a fresh context window. No re-analysis needed.

### 3.6 Availability

- Requires **Claude Pro or Max subscription**
- Feature flags: `tengu_session_memory`, `tengu_sm_compact`
- Terminal indicators: "Recalled X memories" (at start) and "Wrote X memories" (periodically)
- Both include `(ctrl+o to expand)` for inspection

> Source: [Claude Code Session Memory - ClaudeFast](https://claudefa.st/blog/guide/mechanics/session-memory)

---

## 4. Memory Tool (API-Level)

### 4.1 Overview

The Memory Tool is a **separate system** from Claude Code's built-in memory -- it's an API-level tool for building custom agent applications. Currently in beta (header: `context-management-2025-06-27`).

### 4.2 How It Works

- **Client-side**: you control where/how data is stored
- Claude makes tool calls, your application executes memory operations locally
- Files stored in a `/memories` directory
- Automatically checks memory directory before starting tasks

### 4.3 Commands

| Command | Purpose |
|---------|---------|
| `view` | Show directory contents or file contents with optional line ranges |
| `create` | Create a new file |
| `str_replace` | Replace text in a file |
| `insert` | Insert text at specific line |
| `delete` | Delete file or directory |
| `rename` | Rename/move file or directory |

### 4.4 System Prompt Injection

When memory tool is included, this instruction is auto-injected:

```
IMPORTANT: ALWAYS VIEW YOUR MEMORY DIRECTORY BEFORE DOING ANYTHING ELSE.
MEMORY PROTOCOL:
1. Use the `view` command of your `memory` tool to check for earlier progress.
2. ... (work on the task) ...
   - As you make progress, record status/progress/thoughts in your memory.
ASSUME INTERRUPTION: Your context window might be reset at any moment.
```

### 4.5 Combining with Context Editing

Memory Tool + Context Editing enables infinite-length workflows:
1. Claude works on complex task
2. Context approaches threshold -> Claude receives warning
3. Claude saves important info to memory files
4. Context editing clears older tool results
5. Claude continues, referencing memory when needed
6. Workflow continues indefinitely

### 4.6 Supported Models

Claude Opus 4.6, 4.5, 4.1, 4.0; Sonnet 4.5, 4.0; Haiku 4.5

> Source: [Memory Tool - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)

---

## 5. Teams and Memory

### 5.1 Critical Limitation: No Persistent Memory for Teammates

This is a key architectural distinction:

| Feature | Subagents | Teammates |
|---------|-----------|-----------|
| **Persistent memory** | Yes (`memory: user\|project\|local`) | No -- start fresh every time |
| **Session context** | Own context window | Own context window |
| **CLAUDE.md access** | Yes (from working directory) | Yes (same as regular session) |
| **Cross-session learning** | Yes, via memory directory | No |

> Sources: [Create custom subagents](https://code.claude.com/docs/en/sub-agents) | [Agent teams](https://code.claude.com/docs/en/agent-teams)

### 5.2 How Teams Share Information

- **Task list on disk**: `~/.claude/tasks/{team-name}/` -- all agents can see task status
- **SendMessage**: inter-agent messaging (message, broadcast)
- **Team config**: `~/.claude/teams/{team-name}/config.json`
- **No shared memory**: task files and SendMessage are the **only coordination channels**

### 5.3 What Teammates DO Get

- Same project context as regular session (CLAUDE.md, MCP servers, skills)
- Spawn prompt from the lead
- The lead's conversation history does **NOT** carry over

### 5.4 Feature Request: Memory for Teammates

This is tracked as [Issue #24316](https://github.com/anthropics/claude-code/issues/24316) -- "Allow custom .claude/agents/ definitions as agent team teammates." Currently, teammates cannot use custom agent definitions (and thus cannot use the `memory:` field).

---

## 6. Accessing Past Sessions

### 6.1 Session Data Locations

```
~/.claude/projects/<project-slug>/
├── <session-id>/
│   ├── session-memory/
│   │   └── summary.md          # Auto-generated session summary
│   └── subagents/
│       └── agent-<agentId>.jsonl  # Subagent transcripts
├── <session-id>.jsonl           # Full transcript (JSONL format)
└── memory/
    └── MEMORY.md                # Auto memory entrypoint
```

### 6.2 Searching Past Sessions

```bash
# Search session memory summaries
grep -r "search term" ~/.claude/projects/<project>/ --include="summary.md"

# Search full transcripts
grep "search term" ~/.claude/projects/<project>/*.jsonl
```

### 6.3 Transcript Format

- One JSONL file per session, one JSON record per message
- Each record contains: user message, assistant response, tool names used
- Subagent transcripts stored separately at `subagents/agent-{agentId}.jsonl`
- Transcripts persist independently of main conversation (survive compaction)
- Cleaned up based on `cleanupPeriodDays` setting (default: 30 days)

> Sources: [Session Memory - ClaudeFast](https://claudefa.st/blog/guide/mechanics/session-memory) | [claude-code-transcripts - Simon Willison](https://github.com/simonw/claude-code-transcripts)

---

## 7. Compound Learning Patterns

### 7.1 Knowledge Compound Interest

Documented time savings follow a compound progression:

| Encounter | Time | Mechanism |
|-----------|------|-----------|
| First encounter | 2 hours debugging | No prior knowledge |
| Documented | -- | Pattern recorded to memory |
| Second encounter | 5 minutes | Memory consulted |
| Third encounter | 2 minutes | Pattern well-established |
| Preventative | 0 minutes | Agent avoids issue proactively |

> Source: [Self-Improving Coding Agents - Addy Osmani](https://addyosmani.com/blog/self-improving-agents/)

### 7.2 Multi-Layer Memory for Self-Improving Agents

The most effective compound learning uses multiple persistent channels:

1. **Git Commit History** -- code changes tracked across iterations
2. **Progress Log** -- chronological record of attempted tasks and outcomes
3. **Task State** -- JSON tracking pending tasks (prevents rework)
4. **AGENTS.md / MEMORY.md** -- semantic long-term memory capturing patterns, conventions, gotchas

### 7.3 Memory Decay Strategies

From community implementations:

| Memory Type | Decay |
|------------|-------|
| Architecture, decisions, patterns, gotchas | Permanent |
| Progress | 7-day half-life |
| Context | 30-day half-life |
| Low-confidence (< 0.3) | Excluded from MEMORY.md, kept in deep store |

> Source: [Architecture of Persistent Memory - Dev.to](https://dev.to/suede/the-architecture-of-persistent-memory-for-claude-code-17d)

### 7.4 MEMORY.md Budget System (Community Pattern)

One effective approach allocates fixed line budgets per section:

- Architecture: 25 lines
- Decisions: 25 lines
- Patterns: 25 lines
- Gotchas: 20 lines
- Progress: 30 lines
- Context: 15 lines

Within sections, entries rank by `confidence x accessCount`. Unused budget redistributes; overflow truncates with references to topic files.

---

## 8. Community Workarounds and Patterns

### 8.1 Pre-v2.1.33 Agent Memory (Manual Approach)

Before native support, users achieved agent memory with:

```markdown
# In agent definition file
**MEMORY INTEGRATION**: Always attempt to read your persistent memory from
`~/.claude/agent-memories/ui-translator-CLAUDE-AGENT.md`.
If this file exists, incorporate its knowledge. Update when learning new patterns.
```

Plus settings.json:
```json
{
  "permissions": {
    "additionalDirectories": ["/Users/[username]/.claude/agent-memories"]
  }
}
```

**Test results**:
- Agents CAN read memory files when they exist
- Reference stored technical details
- Combine memory knowledge with core instructions
- **Limitation**: Memory updates depend on agent following instructions reliably

> Source: [Issue #4588 - Enable Persistent Memory](https://github.com/anthropics/claude-code/issues/4588)

### 8.2 Searchable Agent Memory (BM25-based)

A community MCP server indexes Claude Code transcripts with BM25 keyword matching:

- **Why BM25 over vectors**: agents search using same terminology they generated, eliminating vocabulary gap
- **Speed**: "BM25 indexes in milliseconds and queries in microseconds"
- **Filesystem watchdog**: 2-second debouncing prevents excessive reindexing
- Tools: `search_turns`, `read_turn`, `read_conversation`

> Source: [Searchable Agent Memory - Eric Tramel](https://eric-tramel.github.io/blog/2026-02-07-searchable-agent-memory/)

### 8.3 Behavioral Divergence in Multi-Instance Systems

Observed phenomenon: identical Claude instances launched with same parameters develop **different operational preferences**:
- Some become more analytical
- Others become more execution-focused
- Patterns persist across sessions when memory is available
- Persistent memory enables these specializations to compound

> Source: [Issue #538 - Claude-to-Claude Communication](https://github.com/anthropics/claude-code/issues/538)

---

## 9. Configuration and Environment Variables

| Variable | Effect |
|----------|--------|
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY=0` | Force auto memory ON |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` | Force auto memory OFF |
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` | Load CLAUDE.md from `--add-dir` directories |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50` | Trigger compaction earlier (default ~95%) |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` | Disable background subagent execution |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` | Enable agent teams (experimental) |

---

## 10. Memory System Comparison Matrix

| Feature | Auto Memory | Agent Memory | Session Memory | Memory Tool (API) | CLAUDE.md |
|---------|-------------|--------------|----------------|-------------------|-----------|
| **Who writes** | Claude | Claude (subagent) | Claude (background) | Claude (via API) | Human |
| **Persistence** | Cross-session | Cross-session | Cross-session | Cross-session | Permanent (VCS) |
| **Auto-loaded** | First 200 lines | First 200 lines | Injected at start | On-demand | Full at launch |
| **Scope** | Per project | Per agent+scope | Per project | Per application | Per location |
| **Editable by human** | Yes | Yes | Read-only | Via implementation | Yes |
| **Shared** | No (user-local) | Depends on scope | No | Custom | Via VCS |
| **Decay** | Manual curation | Manual curation | Automatic | Custom | Manual |

---

## Sources

### Official Documentation
- [Manage Claude's memory - Claude Code Docs](https://code.claude.com/docs/en/memory)
- [Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Orchestrate teams - Claude Code Docs](https://code.claude.com/docs/en/agent-teams)
- [Memory Tool - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
- [Release v2.1.33 - GitHub](https://github.com/anthropics/claude-code/releases/tag/v2.1.33)

### GitHub Issues & Discussions
- [Issue #4588 - Enable Persistent Memory for Specialized Agents](https://github.com/anthropics/claude-code/issues/4588)
- [Issue #538 - Claude-to-Claude Communication: Behavioral Divergence](https://github.com/anthropics/claude-code/issues/538)
- [Issue #24316 - Allow custom agents as team teammates](https://github.com/anthropics/claude-code/issues/24316)
- [Issue #14227 - Persistent Memory Between Sessions](https://github.com/anthropics/claude-code/issues/14227)
- [Issue #16373 - Auto-spawn subagents with persistent summaries](https://github.com/anthropics/claude-code/issues/16373)
- [Issue #10654 - Explicit Memory Management via "Remember"](https://github.com/anthropics/claude-code/issues/10654)

### Community & Blog Sources
- [Claude Code Session Memory - ClaudeFast](https://claudefa.st/blog/guide/mechanics/session-memory)
- [Architecture of Persistent Memory - Dev.to](https://dev.to/suede/the-architecture-of-persistent-memory-for-claude-code-17d)
- [Self-Improving Coding Agents - Addy Osmani](https://addyosmani.com/blog/self-improving-agents/)
- [Searchable Agent Memory - Eric Tramel](https://eric-tramel.github.io/blog/2026-02-07-searchable-agent-memory/)
- [Persistent Memory Setup Guide - Medium](https://agentnativedev.medium.com/persistent-memory-for-claude-code-never-lose-context-setup-guide-2cb6c7f92c58)
- [CLAUDE.md as Agent Memory - Eugene Oleinik](https://evoleinik.com/posts/claude-md-as-agent-memory/)
- [Claude Memory Deep Dive - Skywork AI](https://skywork.ai/blog/claude-memory-a-deep-dive-into-anthropics-persistent-context-solution/)
- [Claude Code Transcripts - Simon Willison](https://github.com/simonw/claude-code-transcripts)

---

## Gaps & Open Questions

1. **No official documentation on agent-memory directory internal format** -- the docs say "persistent directory" but don't specify if there's a required structure beyond MEMORY.md
2. **No memory for teammates** -- only subagents support the `memory:` field; teammates start fresh. This is a significant limitation for team-based workflows
3. **Memory quality control** -- no built-in mechanism to validate what agents write to their memory; agents may record incorrect patterns
4. **Memory conflicts** -- when `project` scope is used and multiple developers commit agent-memory, merge conflicts are not addressed in docs
5. **Memory size limits** -- beyond the 200-line MEMORY.md auto-load, there's no documented limit on topic files or total memory directory size
6. **Cross-agent memory sharing** -- no mechanism for one subagent to read another subagent's memory directory
7. **Session Memory availability** -- tied to Pro/Max subscriptions and feature flags; not available on Bedrock/Vertex/Foundry
8. **Memory expiration** -- auto memory has no built-in expiration; only the API-level Memory Tool docs mention considering periodic cleanup
