# Deep Research: Claude Code Skill Chaining, Composition, and Orchestration

> Research Date: 2026-02-09
> Sources consulted: 28 unique URLs, 15 pages read in full
> Status: Comprehensive -- covers official docs, GitHub issues, community patterns, and real-world implementations

---

## TL;DR

1. **Skills cannot directly call other skills** -- there is no `Skill("other-skill")` API available from within a skill's execution context. This is by design, not a bug.
2. **Nested skill invocation exists but is broken** -- Claude CAN invoke Skill tool from within a skill's context, but Issue #17351 (21 upvotes, OPEN) confirms that after the nested skill finishes, control returns to the MAIN conversation, not the invoking skill. No fix as of Feb 2026.
3. **The real composition pattern is Skill + Subagent** -- a skill uses `context: fork` to spawn a subagent, and that subagent can have skills preloaded via the `skills:` frontmatter field. This is the officially supported path.
4. **Superpowers (obra) is the gold standard** for multi-skill orchestration -- it uses a "meta-skill" (`using-superpowers`) injected at session start that enforces skill checking before every response, creating an implicit chaining protocol.
5. **`user-invocable: false` creates "internal-only" skills** that Claude can invoke but users cannot see in the `/` menu. `disable-model-invocation: true` does the opposite (user-only). These are complementary, not alternatives.
6. **`$ARGUMENTS`, `$0`, `$1`** enable data passing INTO skills, but there is no mechanism for a skill to RETURN structured data to a calling skill. Output flows through the conversation context.

---

## 1. Can a Skill Invoke Another Skill?

### Official Position

The official Claude Code documentation at [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) does **not document** any mechanism for one skill to directly invoke another. The Skill tool accepts a `command` parameter (the skill name) and injects skill content into the conversation. There is no `invoke-skill` or `chain-skill` directive in the specification.

### What Actually Happens (The Bug)

In practice, Claude CAN use the Skill tool while executing within a skill's context. The model sees the available skills list and can decide to invoke another skill. However, [GitHub Issue #17351](https://github.com/anthropics/claude-code/issues/17351) documents a critical bug:

> **Current Behavior**: Skill A invokes Skill B via `Skill(...)`. When Skill B completes, execution returns to the **main session context**, not to Skill A. The session model reverts (e.g., from Sonnet back to Opus). Skill A's workflow is abandoned.

> **User @him0**: "My `/git-pull-request` skill calls `/git-commit --push` as a pre-processing step. After `/git-commit` completed successfully, the workflow stopped and returned to the main session instead of continuing with the PR creation."

> **User @bgeesaman**: "Can't get a prompt calling a list of N skills to complete. After skill 1 is run, it ends the turn... stops after skill1 and never invokes skill2."

**Status**: OPEN, 21 thumbs up, no Anthropic response, no fix as of v2.1.37. This occurs **regardless** of `context: fork` setting.

### The `context: fork` and `agent:` Gap

[GitHub Issue #17283](https://github.com/anthropics/claude-code/issues/17283) (CLOSED as duplicate of #16803) reported that `context: fork` and `agent:` frontmatter fields are **ignored** when a skill is invoked via the Skill tool. The skill runs inline in the main conversation context instead of spawning a subagent.

**Current workaround**: Restructure the skill as a custom subagent file in `.claude/agents/` rather than using the `context: fork` directive in a skill.

**Important note from official docs**: The subagents documentation states:

> "This prevents infinite nesting (subagents cannot spawn other subagents) while still gathering necessary context."

This is a hard architectural constraint: subagents are a single level of delegation, not recursive.

### Summary: Skill-to-Skill Invocation Matrix

| Method | Works? | Limitations |
|--------|--------|-------------|
| Skill A instructs Claude to use Skill B | Partially | Context returns to main session after B (Bug #17351) |
| Skill with `context: fork` spawning subagent | Partially | `context: fork` + `agent:` ignored via Skill tool (Issue #17283) |
| Subagent with `skills:` field preloading multiple skills | Yes (official) | Subagent cannot spawn sub-subagents |
| Main conversation chaining skills sequentially | Yes | Manual, user must prompt each step |
| Meta-skill pattern (Superpowers) | Yes (workaround) | Relies on model compliance, not enforcement |

---

## 2. Pattern: Meta-Skill Orchestrating Sub-Skills

### The Superpowers Model (obra)

[Superpowers](https://github.com/obra/superpowers) is the most sophisticated real-world implementation of multi-skill orchestration for Claude Code. Its architecture, analyzed via [DeepWiki](https://deepwiki.com/obra/superpowers/5.1-claude-code:-skill-tool-and-hooks), reveals key patterns:

**The Meta-Skill Pattern:**

1. A `using-superpowers` meta-skill is injected into the system prompt at session start via `hooks/session-start.sh`
2. This meta-skill establishes **THE RULE**: "If even 1% chance a skill applies, you MUST invoke it"
3. It includes a mandatory 5-step checklist executed BEFORE any response:
   - Scan available skills
   - Identify relevant skills based on task
   - Check for red flags (rationalization phrases that skip skills)
   - Invoke matching skills
   - Incorporate skill guidance

4. The meta-skill blocks common rationalizations:
   - "This is just a simple question" -- blocked
   - "I need more context first" -- skill provides context
   - "Let me explore first" -- skill prevents wasted exploration

**The Pipeline Pattern:**

```
User Task --> using-superpowers (enforces skill check)
  |
  v
brainstorming (MANDATORY before implementation)
  |
  v
using-git-worktrees (isolated workspace)
  |
  v
writing-plans (decompose into 2-5 min tasks)
  |
  v
[Execution Strategy Choice]
  |--- subagent-driven-development (autonomous)
  |     |--- Fresh subagent per task
  |     '--- Two-stage review (spec then quality)
  |
  '--- executing-plans (human checkpoint)
        '--- Batch 3 tasks at a time
  |
  v
test-driven-development (RED-GREEN-REFACTOR)
  |
  v
systematic-debugging (if issues arise)
  |
  v
finishing-a-development-branch (cleanup)
```

**Key insight**: Skills don't call each other programmatically. Instead, the meta-skill establishes a behavioral protocol that Claude follows, loading each skill sequentially based on the current workflow phase.

**Three commands as user entry points:**

| Command | Target Skill | Model Invocation |
|---------|-------------|------------------|
| `/brainstorm` | `superpowers:brainstorming` | `disable-model-invocation: true` |
| `/write-plan` | `superpowers:writing-plans` | `disable-model-invocation: true` |
| `/execute-plan` | `superpowers:executing-plans` | `disable-model-invocation: true` |

Commands have `disable-model-invocation: true` to prevent redirect loops (Claude auto-invoking the command which triggers the underlying skill).

### The wshobson/agents Model

[wshobson/agents](https://github.com/wshobson/agents) takes a different approach with 146 skills across 73 plugins. Rather than a meta-skill controller, it relies on **implicit multi-skill activation**:

> "User: 'Build a RAG system for document Q&A' --> Activates: `rag-implementation`, `prompt-engineering-patterns`"

Claude's native intent matching activates complementary skills simultaneously. This works because:
- Skills are organized into domain-coherent plugins
- Descriptions use specific keywords that cluster naturally
- Claude can load multiple skills in a single response cycle

### Recommended Meta-Skill Pattern

Based on analysis of both approaches, the recommended pattern for our system:

```yaml
---
name: enhance-workflow
description: Meta-orchestrator that coordinates research, analysis, and quality gates
disable-model-invocation: true
---

## Workflow Orchestration

When invoked, execute this pipeline:

### Phase 1: Research
Load and apply the `tech-research` skill to gather information.
Use $ARGUMENTS as the research query.

### Phase 2: Analysis
After research completes, load and apply the `deep-strategic-planning` skill
to analyze findings and create an action plan.

### Phase 3: Quality Gate
Load and apply the `validation-test` skill to verify outputs
meet quality criteria.

### Phase 4: Output
Synthesize all findings into a structured report.
```

**Caveat**: Due to Bug #17351, this will likely fail at Phase 2 (context returns to main session after Phase 1 completes). The workaround is to include ALL instructions in a single skill rather than chaining, or use a subagent with preloaded skills.

---

## 3. How Skills Pass Data Between Each Other

### Argument Injection (`$ARGUMENTS`, `$0`, `$1`)

From [official docs](https://code.claude.com/docs/en/skills):

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---
Migrate the $0 component from $1 to $2.
```

Running `/migrate-component SearchBar React Vue` replaces:
- `$ARGUMENTS[0]` / `$0` = "SearchBar"
- `$ARGUMENTS[1]` / `$1` = "React"
- `$ARGUMENTS[2]` / `$2` = "Vue"
- `$ARGUMENTS` = "SearchBar React Vue" (all arguments)

If `$ARGUMENTS` is not present in the skill content, arguments are appended as `ARGUMENTS: <value>`.

### Dynamic Context Injection (`!command`)

The `` !`command` `` syntax runs shell commands BEFORE the skill content is sent to Claude:

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
---
## PR Context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
```

This is **preprocessing**, not runtime execution. Commands run immediately, output replaces the placeholder, and Claude receives the fully-rendered prompt.

### Session ID for Correlation

`${CLAUDE_SESSION_ID}` can be used to create session-specific files that serve as shared state:

```yaml
Log output to logs/${CLAUDE_SESSION_ID}.log
```

### Data Flow Between Skills (Current Limitations)

There is **no structured return value** from skills. When a skill completes:
1. Its output flows into the conversation context
2. If another skill is invoked, it receives the conversation context (including prior skill output)
3. There is no `$SKILL_OUTPUT` or `$PREVIOUS_RESULT` variable

**Practical workarounds for inter-skill data sharing:**

| Method | How | Reliability |
|--------|-----|-------------|
| File-based handoff | Skill A writes to `/tmp/result.json`, Skill B reads it | High -- deterministic |
| Conversation context | Skill A's output is visible to Skill B | Medium -- depends on context window |
| Session-specific files | Use `${CLAUDE_SESSION_ID}` as namespace | High -- session-scoped |
| Subagent delegation | Main skill delegates to subagent, receives summary | High -- official pattern |

### Recommended Pattern: File-Based Handoff

```yaml
---
name: research-phase
description: Research phase that outputs to a handoff file
---
1. Research $ARGUMENTS thoroughly
2. Write findings to /tmp/research-${CLAUDE_SESSION_ID}.json with structure:
   {"query": "...", "findings": [...], "sources": [...]}
3. Report summary to user
```

```yaml
---
name: analysis-phase
description: Analysis phase that reads from research handoff
---
1. Read /tmp/research-${CLAUDE_SESSION_ID}.json
2. Analyze findings using deep strategic planning
3. Write analysis to /tmp/analysis-${CLAUDE_SESSION_ID}.json
4. Report conclusions to user
```

---

## 4. Pattern: Entry Point --> Steps --> Quality Gate

### Architecture Using Subagents + Skills

The most reliable pattern for a multi-phase pipeline uses subagents with preloaded skills, not skill chaining:

```
User invokes /enhance-workflow "topic"
         |
         v
  [Main Skill: enhance-workflow]
  (disable-model-invocation: true)
         |
         |-- Phase 1: Task(research-agent)
         |     skills: [tech-research]
         |     prompt: "Research {topic}"
         |     -> Returns summary to main
         |
         |-- Phase 2: Task(analysis-agent)
         |     skills: [deep-strategic-planning]
         |     prompt: "Analyze research findings: {summary}"
         |     -> Returns plan to main
         |
         |-- Phase 3: Task(qa-agent)
         |     skills: [validation-test]
         |     prompt: "Validate plan quality: {plan}"
         |     -> Returns pass/fail
         |
         v
  [Main Skill synthesizes results]
```

**Implementation via custom subagents:**

```markdown
# .claude/agents/research-agent.md
---
name: research-agent
description: Research specialist for deep topic exploration
tools: Read, Grep, Glob, WebSearch, WebFetch
skills:
  - tech-research
model: inherit
permissionMode: bypassPermissions
---
You are a research specialist. Execute the tech-research skill
to gather comprehensive information on the given topic.
```

From official docs on [subagents](https://code.claude.com/docs/en/sub-agents):

> "**Preload skills into subagents**: Use the `skills` field to inject skill content into a subagent's context at startup. This gives the subagent domain knowledge without requiring it to discover and load skills during execution."

> "The full content of each skill is injected into the subagent's context, not just made available for invocation. Subagents don't inherit skills from the parent conversation; you must list them explicitly."

### Quality Gate Pattern

A quality gate can be implemented as a skill with `user-invocable: false`:

```yaml
---
name: quality-gate
description: Validates research output quality. Checks completeness, source count, and citation accuracy.
user-invocable: false
---
## Quality Validation Protocol

Check the provided output against these criteria:
- [ ] At least 10 unique sources cited
- [ ] All claims have supporting citations
- [ ] No contradictions between sources
- [ ] Actionable recommendations included
- [ ] Gaps and limitations identified

If ANY criterion fails, report FAIL with specific issues.
If ALL pass, report PASS with quality score.
```

This skill is invisible in the `/` menu but Claude can invoke it when orchestrating a workflow.

---

## 5. Anthropic's Official Position on Skill Composition

### What the Docs Say

From [claude.com/blog/skills-explained](https://claude.com/blog/skills-explained):

> "Use them together when: You want subagents with specialized expertise. For example, a code-review subagent can use Skills for language-specific best practices, combining the independence of a subagent with the portable expertise of Skills."

From [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills):

> Skills and subagents work together in two directions:
>
> | Approach | System prompt | Task | Also loads |
> |----------|--------------|------|------------|
> | Skill with `context: fork` | From agent type | SKILL.md content | CLAUDE.md |
> | Subagent with `skills` field | Subagent's markdown body | Claude's delegation message | Preloaded skills + CLAUDE.md |

### What the Docs Do NOT Say

The official documentation **never mentions**:
- One skill invoking another skill
- Skill chaining or pipelines
- Return values from skills
- Inter-skill communication protocols
- Skill dependency graphs

### The Agent Skills Specification (agentskills.io)

The [open standard specification](https://agentskills.io/specification) defines skills as **self-contained** units. The spec covers:
- `SKILL.md` format (frontmatter + markdown body)
- Optional directories (`scripts/`, `references/`, `assets/`)
- Progressive disclosure (metadata --> instructions --> resources)
- File references (one level deep from SKILL.md)

The specification contains **zero mention** of skill composition, chaining, or orchestration. Skills are designed as independent capability modules, not pipeline stages.

### Interpretation

Anthropic's design philosophy treats skills as **atomic, self-contained capability packages** that compose through:
1. **Claude's native reasoning** -- the model decides when to apply which skills
2. **Subagent delegation** -- complex workflows use subagents with preloaded skills
3. **User orchestration** -- users invoke skills in sequence via `/skill-name`

This is deliberate, not an oversight. The architecture avoids the complexity of:
- Skill dependency resolution
- Circular dependency detection
- Inter-skill state management
- Execution ordering guarantees

---

## 6. Claude Code Internals: How the Skill Tool Works

### Architecture (from reverse engineering by [Mikhail Shilkov](https://mikhail.io/2025/10/claude-code-skills/) and [Lee Han Chung](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/))

**The Skill tool is a meta-tool**, fundamentally different from tools like Read or Bash:

```
Tool Definition:
{
  name: "Skill",
  inputSchema: { command: string },
  prompt: async () => generateAvailableSkillsList()
}
```

**Key characteristics:**
1. The Skill tool's description is **dynamically generated** at runtime
2. It embeds an `<available_skills>` XML block listing all discovered skills
3. Each skill entry includes: `name`, `description`, `location` (user/project/plugin)
4. A **15,000-character token budget** caps the available_skills section (configurable via `SLASH_COMMAND_TOOL_CHAR_BUDGET`)
5. The budget scales dynamically at 2% of context window, with 16,000 character fallback

**Discovery pipeline:**
1. Scan `~/.claude/skills/`, `.claude/skills/`, plugin dirs, `--add-dir` dirs
2. Parse YAML frontmatter from each `SKILL.md`
3. Extract `name` and `description` only
4. Build `<available_skills>` text block
5. Embed in Skill tool's description

**Invocation flow (dual-message architecture):**

When Claude invokes `Skill("my-skill")`:

1. **Validation** -- checks: command non-empty, skill exists, file readable, not `disable-model-invocation: true`, type is "prompt"
2. **Message 1 (visible)** -- `isMeta: false`:
   ```xml
   <command-message>The "my-skill" skill is loading</command-message>
   <command-name>my-skill</command-name>
   <command-args>arguments here</command-args>
   ```
3. **Message 2 (hidden)** -- `isMeta: true`:
   ```
   [Full SKILL.md content with frontmatter stripped]
   [Base path for relative file references]
   [$ARGUMENTS substituted]
   [!`command` outputs substituted]
   ```
4. **Context modification** via `contextModifier`:
   ```javascript
   contextModifier(context) {
     // Pre-approve allowed tools
     context.toolPermissionContext.alwaysAllowRules.command =
       [...existing, ...skill.allowedTools]
     // Override model if specified
     if (modelOverride) {
       context.options.mainLoopModel = modelOverride
     }
     return context
   }
   ```

**Tool permissions are scoped to skill execution** -- when the skill completes, permissions revert to baseline.

### Progressive Disclosure Token Economics

| Stage | What Loads | Token Cost |
|-------|-----------|------------|
| Session start | All skill names + descriptions | ~30-50 tokens per skill |
| Skill invocation | Full SKILL.md body | ~500-5000 tokens |
| Supporting files | Referenced .md files | Variable, on-demand only |
| Scripts | NOT loaded (executed) | 0 tokens (only output) |

---

## 7. `user-invocable: false` -- Internal Skills Pattern

### How the Two Invocation Controls Work

From [GitHub Issue #19141](https://github.com/anthropics/claude-code/issues/19141) (RESOLVED):

| Setting | User can invoke (via `/`) | Claude can invoke | Description in context |
|---------|--------------------------|-------------------|----------------------|
| (default) | Yes | Yes | Always in context |
| `disable-model-invocation: true` | Yes | No | NOT in context |
| `user-invocable: false` | No | Yes | Always in context |
| Both set | No | No | Would hide from everyone |

**Critical distinction**: `user-invocable` is a **UI setting only**. It removes the skill from the `/` slash command menu but does NOT prevent Claude from discovering or invoking it through the Skill tool. The skill's description remains in Claude's context.

`disable-model-invocation: true` is the **actual security control**. It removes the skill from Claude's context entirely, preventing autonomous invocation.

### Pattern: Internal-Only Skills

For skills that should only be invoked by other skills (or by Claude during orchestrated workflows):

```yaml
---
name: validate-citations
description: Validates that all claims in a document have proper source citations. Use after any research or content generation task.
user-invocable: false
---
## Citation Validation Protocol
...
```

This skill:
- Does NOT appear in the user's `/` menu
- DOES appear in Claude's available skills list
- Claude CAN invoke it autonomously when it detects a relevant context
- Works as a "background" quality gate that fires when Claude judges it appropriate

### Pattern: Hybrid Control

For a meta-skill that orchestrates internal skills:

```yaml
# The orchestrator (user-invocable, model cannot auto-invoke)
---
name: full-workflow
description: Complete research-to-publication workflow
disable-model-invocation: true
---
Execute this workflow:
1. Use the `research-collector` skill to gather data
2. Use the `validate-citations` skill to check sources
3. Use the `format-output` skill to produce final document
```

```yaml
# The workers (model-invocable, user cannot see)
---
name: research-collector
user-invocable: false
description: Collects and organizes research data from multiple sources
---
...
```

```yaml
---
name: validate-citations
user-invocable: false
description: Validates source citations
---
...
```

**Warning**: Due to Bug #17351, this chaining will likely fail after the first sub-skill completes. Use subagent delegation as the reliable alternative.

---

## 8. Anti-Patterns

### 1. Deep Nesting

```
Skill A calls Skill B calls Skill C
```

**Why it fails**: Subagents cannot spawn other subagents (hard constraint). Skills that invoke other skills lose context (Bug #17351). Maximum one level of delegation.

### 2. Circular Dependencies

```
Skill A references Skill B
Skill B references Skill A
```

**Why it fails**: No dependency resolution system exists. Claude would enter an infinite invocation loop until context runs out.

### 3. Over-Orchestration

```yaml
---
name: uber-workflow
description: Does everything
---
1. Call skill-1
2. Call skill-2
...
15. Call skill-15
```

**Why it fails**: Each skill invocation adds 500-5000 tokens to context. 15 skills = potential 75,000 tokens of skill instructions competing with conversation history and reasoning space.

### 4. Shared State via Global Variables

**Why it fails**: Skills have no shared state mechanism. Each skill invocation creates a new context modification that reverts on completion. There are no global variables or session stores accessible to skills.

### 5. Deeply Nested File References

```
SKILL.md --> advanced.md --> details.md --> actual-info.md
```

From [Anthropic best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices):

> "Claude may partially read files when they're referenced from other referenced files... Keep references one level deep from SKILL.md."

### 6. Skills as Code Execution Wrappers

From the [deep dive analysis](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/):

> "Skills are NOT executable code. They do NOT run Python or JavaScript. They operate through prompt expansion and context modification."

Treating skills as function calls misunderstands the architecture. Skills modify Claude's behavior; scripts handle execution.

---

## 9. `$ARGUMENTS` and Variable Substitution Deep Dive

### Complete Variable Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `$ARGUMENTS` | All arguments as a single string | `/deploy staging --force` --> `"staging --force"` |
| `$ARGUMENTS[0]` | First argument (0-based) | `"staging"` |
| `$ARGUMENTS[1]` | Second argument | `"--force"` |
| `$0` | Shorthand for `$ARGUMENTS[0]` | `"staging"` |
| `$1` | Shorthand for `$ARGUMENTS[1]` | `"--force"` |
| `${CLAUDE_SESSION_ID}` | Current session UUID | `"abc123-def456"` |
| `` !`command` `` | Shell command output (preprocessing) | `` !`date` `` --> `"Mon Feb 9 2026"` |
| `@file` | Content injection from file | `@./reference.md` --> file contents |

### Behavior When `$ARGUMENTS` is Missing

From official docs:

> "If you invoke a skill with arguments but the skill doesn't include `$ARGUMENTS`, Claude Code appends `ARGUMENTS: <your input>` to the end of the skill content so Claude still sees what you typed."

### Data Passing Between Skills via Arguments

Since there is no direct skill-to-skill invocation mechanism, arguments cannot be passed between skills programmatically. The workarounds:

1. **File-based**: Skill A writes output to a file, Skill B reads it
2. **Context-based**: Skill A's output is in the conversation, Skill B sees it
3. **User-mediated**: User passes Skill A's output as arguments to Skill B

---

## 10. Real Examples of Skill Composition in Production

### Example 1: Superpowers (obra) -- 20+ Skills

**Architecture**: Meta-skill bootstrap + skill-per-phase + subagent delegation

```
Session Start
    |-- Hook injects `using-superpowers` meta-skill
    |-- All skills become available via Skill tool
    |
User: "Build a new feature"
    |
    |-- using-superpowers forces skill check
    |-- Matches: brainstorming
    |-- Claude loads brainstorming skill
    |-- Brainstorming produces requirements
    |
    |-- using-superpowers forces skill check
    |-- Matches: writing-plans
    |-- Claude loads writing-plans skill
    |-- Plan produced with 2-5 min tasks
    |
    |-- using-superpowers forces skill check
    |-- Matches: subagent-driven-development
    |-- Fresh subagent spawned per task
    |-- Two-stage review (spec then quality)
```

Source: [github.com/obra/superpowers](https://github.com/obra/superpowers)

### Example 2: wshobson/agents -- 146 Skills, 73 Plugins

**Architecture**: Domain clustering + implicit multi-activation

```
User: "Set up Kubernetes with Helm"
    |
    |-- Claude matches descriptions
    |-- Loads: helm-chart-scaffolding
    |-- Loads: k8s-manifest-generator
    |-- Both skills active simultaneously
    |-- Claude synthesizes guidance from both
```

Source: [github.com/wshobson/agents](https://github.com/wshobson/agents)

### Example 3: alexop.dev Research Orchestrator

**Architecture**: Single skill that spawns parallel subagents

```yaml
---
name: research
description: Deep research on a topic
disable-model-invocation: true
---
Spawn three subagents simultaneously:
1. Web Documentation Agent (fetch docs)
2. Stack Overflow Agent (find solutions)
3. Codebase Explorer Agent (scan repo)

After all complete, synthesize into docs/research/{topic}.md
```

Source: [alexop.dev](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)

### Example 4: Subagent + Skills Layering (from dev.to)

**Architecture**: Subagent delegates utility work to skills

```
zahtevki-researcher (subagent)
    --> Downloads attachment
    --> Invokes document-reader (skill)
    --> Converts to text
    --> Analyzes content
```

Source: [dev.to/nunc](https://dev.to/nunc/claude-code-skills-vs-subagents-when-to-use-what-4d12)

### Example 5: Our MMOS System (this project)

**Architecture**: Plugin-based skills with agent delegation

Looking at our own skill list (500+ skills across plugins), we already use implicit composition:

- `enhance-workflow` is designed as an orchestrator
- `tech-research` feeds into `deep-strategic-planning`
- `validation-test` and `validation-fork-test` serve as quality gates
- `bob-orchestrator` orchestrates multiple steps

The gap: these skills don't programmatically chain. They rely on user invocation or Claude's autonomous matching.

---

## Comparison: Unix Pipes vs Skill Composition

| Aspect | Unix Pipes | Claude Code Skills |
|--------|-----------|-------------------|
| **Data flow** | stdout --> stdin (structured) | Conversation context (unstructured) |
| **Composition** | `cmd1 \| cmd2 \| cmd3` | No native equivalent |
| **Error handling** | Exit codes, stderr | Conversation-based |
| **Parallelism** | `cmd1 & cmd2` | Subagent background execution |
| **State** | Environment variables, files | Files, conversation context |
| **Typing** | Text streams | Natural language |
| **Discoverability** | `man`, `--help` | Description matching |

The Unix pipe philosophy ("do one thing well, compose via standard interface") maps imperfectly to skills. Skills lack a standard interface for composition -- they communicate through the ambient conversation context rather than typed input/output channels.

---

## Recommendations

### For Immediate Use (Working Today)

1. **Single comprehensive skills** -- put the entire workflow in one SKILL.md with phases clearly marked. This avoids the chaining bug entirely.

2. **Subagent + skills preloading** -- for complex workflows, create a custom subagent that preloads relevant skills:
   ```yaml
   # .claude/agents/research-analyst.md
   ---
   name: research-analyst
   skills:
     - tech-research
     - deep-strategic-planning
   ---
   ```

3. **File-based handoff** -- when multiple skills must share data, use `/tmp/` files with `${CLAUDE_SESSION_ID}` scoping.

4. **Meta-skill pattern** -- inject a "rules" skill via session-start hook that establishes behavioral protocols for skill usage ordering.

### For Future Architecture (When Bugs Are Fixed)

5. **Internal skills** (`user-invocable: false`) for quality gates and utility functions that Claude invokes autonomously.

6. **Pipeline skills** that invoke sub-skills with `context: fork` -- currently blocked by Issues #17283 and #17351.

7. **Return value protocol** -- define a JSON schema for skill outputs written to files, creating a pseudo-typed interface between skills.

### What NOT to Do

- Do not attempt deep nesting (A calls B calls C)
- Do not rely on `context: fork` + `agent:` actually working via Skill tool
- Do not create circular skill dependencies
- Do not orchestrate more than 5-7 skills in a single workflow (context budget)
- Do not treat skills as function calls -- they are prompt expansions

---

## Gaps and Open Questions

1. **Will Anthropic fix Bug #17351?** -- 21 upvotes, OPEN since v2.1.3+, no official response
2. **Will `context: fork` work via Skill tool?** -- Issue #17283 closed as duplicate, underlying issue unclear
3. **Skill return values?** -- No indication this is planned in the Agent Skills spec
4. **Skill dependency declaration?** -- No `requires:` or `depends-on:` field in the spec
5. **Concurrent skill execution?** -- Noted as "not concurrency-safe" in analysis
6. **Inter-skill message passing?** -- No protocol exists; would require spec change
7. **Will the Agent Skills spec evolve?** -- agentskills.io has no roadmap published

---

## Sources

- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Claude Code Subagents Documentation](https://code.claude.com/docs/en/sub-agents)
- [Agent Skills Specification](https://agentskills.io/specification)
- [Anthropic: Skills Explained](https://claude.com/blog/skills-explained)
- [Anthropic: Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [GitHub Issue #17351: Nested skills context bug](https://github.com/anthropics/claude-code/issues/17351)
- [GitHub Issue #17283: context: fork ignored](https://github.com/anthropics/claude-code/issues/17283)
- [GitHub Issue #19141: user-invocable vs disable-model-invocation](https://github.com/anthropics/claude-code/issues/19141)
- [Mikhail Shilkov: Inside Claude Code Skills](https://mikhail.io/2025/10/claude-code-skills/)
- [Lee Han Chung: Claude Agent Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [Superpowers Plugin](https://github.com/obra/superpowers)
- [Superpowers: Skill Tool and Hooks (DeepWiki)](https://deepwiki.com/obra/superpowers/5.1-claude-code:-skill-tool-and-hooks)
- [Superpowers Core (DeepWiki)](https://deepwiki.com/obra/superpowers-marketplace/4.1-superpowers-(core))
- [wshobson/agents Repository](https://github.com/wshobson/agents)
- [wshobson Agent Skills Documentation](https://github.com/wshobson/agents/blob/main/docs/agent-skills.md)
- [alexop.dev: Claude Code Customization Guide](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)
- [Colin McNamara: Skills, Agents, and MCP](https://colinmcnamara.com/blog/understanding-skills-agents-and-mcp-in-claude-code)
- [dev.to: Skills vs Subagents](https://dev.to/nunc/claude-code-skills-vs-subagents-when-to-use-what-4d12)
- [dev.to: Task Tool Architecture](https://dev.to/bhaidar/the-task-tool-claude-codes-agent-orchestration-system-4bf2)
- [Claude Code Extensibility Guide](https://happysathya.github.io/claude-code-extensibility-guide.html)
- [claudecn.com: Skills Architecture](https://claudecn.com/en/blog/claude-skills-architecture/)
- [Simon Willison: Claude Skills](https://simonwillison.net/2025/Oct/16/claude-skills/)
- [VentureBeat: How Skills Work](https://venturebeat.com/technology/how-anthropics-skills-make-claude-faster-cheaper-and-more-consistent-for)
- [Paddo.dev: Claude Code 2.1](https://paddo.dev/blog/claude-code-21-pain-points-addressed/)
- [ComposioHQ: Awesome Claude Skills](https://github.com/ComposioHQ/awesome-claude-skills)
- [VoltAgent: Awesome Agent Skills](https://github.com/VoltAgent/awesome-agent-skills)
- [Claude Code Plugins Registry](https://claude-plugins.dev/)
- [M.academy: Pass Arguments to Commands](https://m.academy/lessons/pass-arguments-custom-slash-commands-claude-code/)
