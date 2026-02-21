# AGF-7 Tech Search: Research Report

## TL;DR

Six research topics investigated across 20+ sources. Three breakthrough findings for the roundtable:

1. **Progressive disclosure achieves 98% token reduction** — claude-mem's 3-layer pattern (Index ~800 tokens → Timeline → Details) validated by Anthropic's own Skills release (Oct 2025). Industry consensus: load compact summary first, expand on demand.

2. **Agent Skills is an open standard adopted by 26+ platforms** — Released by Anthropic Dec 2025, adopted by Codex, Gemini, Cursor, Copilot, and 20+ others. AIOS should generate skills in this format for maximum portability.

3. **Claude Code v2.1 supports hooks in agent frontmatter** — This closes the gap where Agent mode (@agent) didn't get hooks. Agents can now declare their own lifecycle hooks, enabling activation reports without the UAP.

---

## 1. BMAD Agent Compilation Pipeline

### Findings

- BMAD v6 (6.0.0-alpha.23, Jan 2026) compiles `.agent.yaml` → `.md` with XML activation blocks via `AgentCompiler.compile()`
- Single YAML source generates IDE-specific outputs for Claude Code, Codex, and Windsurf
- `ActivationBuilder` loads fragments from `agent-components/` with Map-based cache
- `AgentAnalyzer` profiles which handlers an agent needs — lazy loading at compile time
- Web deployments produce `.txt` bundles with delimiter tags (complete agent + dependencies)

### Multi-IDE Landscape (2026)

Three-tier ecosystem identified:
- **IDE-first:** Cursor (RAG on filesystem)
- **Terminal-first:** Claude Code, Codex CLI (lightweight local agents)
- **Orchestration:** Warp (runs Claude + Codex + Gemini simultaneously)

### Applicability to AIOS

AIOS already has IDE sync renderers (`claude-code.js`). Extending to Codex, Gemini, and Cursor renderers follows the BMAD pattern but with AIOS's richer agent definitions.

**Sources:**
- [BMAD-METHOD DeepWiki](https://deepwiki.com/bmadcode/BMAD-METHOD/5.2-dependency-resolution)
- [BMAD-METHOD GitHub](https://github.com/bmad-code-org/BMAD-METHOD)
- [AI Coding Tools Comparison 2026](https://medium.com/@terrycho/major-ai-coding-tools-comparison-2026-claude-code-codex-gemini-55f1140cd05e)

---

## 2. Progressive Disclosure for Context Loading

### Findings

- **98% token reduction** (150K → 2K) achieved by loading skills on-demand via metadata-driven routing
- **claude-mem 3-layer workflow:** Index (~800 tokens) → Timeline (on-demand) → Details (~120-200 tokens per observation)
- **94% of RAG attention wasted** on irrelevant context; progressive disclosure fixes this structurally
- **Code execution pattern:** 99.8% reduction on large datasets (268,700 → 523 tokens) via spatial separation
- **Anthropic Skills (Oct 2025)** independently validates: meta-tool pattern reduces overhead by 85-95%
- **Token budget metadata:** Skills declare `token_budget: 1847` in frontmatter for cost-conscious routing

### Key Architecture Pattern

```
Phase 1 (Discovery): ~30 tokens - List available
Phase 2 (Schema):    ~100 tokens - Load only needed
Phase 3 (Execute):   ~50-200 tokens - Summary returns
```

### Expert Validation

> "Models attend to only 2-5% of input tokens for typical tasks" — confirming progressive disclosure aligns with LLM attention patterns.

> "Meta-tool pattern reduces token overhead by 85-95%. Simple tasks complete with 2K tokens." — Anthropic Claude Skills Architecture

**Sources:**
- [From 150K to 2K Tokens](https://williamzujkowski.github.io/posts/from-150k-to-2k-tokens-how-progressive-context-loading-revolutionizes-llm-development-workflows/)
- [Claude-Mem Progressive Disclosure](https://docs.claude-mem.ai/progressive-disclosure)
- [Token-Efficient Code Execution](https://proofsource.ai/2025/11/token-efficient-code-execution-pattern-for-claude-achieving-80-99-token-reduction/)

---

## 3. Claude Code Agent Architecture (Official Docs)

### Findings

- **15 lifecycle events:** SessionStart, UserPromptSubmit, PreToolUse, PermissionRequest, PostToolUse, PostToolUseFailure, Notification, SubagentStart, SubagentStop, Stop, TeammateIdle, TaskCompleted, ConfigChange, PreCompact, SessionEnd
- **3 hook handler types:** command (bash), prompt (LLM evaluation), agent (subagent verification with multi-turn tool access)
- **14+ frontmatter fields:** name, description, tools, disallowedTools, model, permissionMode, maxTurns, skills, mcpServers, **hooks**, memory, background, isolation
- **Hooks in agent frontmatter** (v2.1): Agents can declare their OWN PreToolUse hooks — THIS CLOSES THE GAP where Agent mode didn't get hooks
- **Memory scopes:** user (~/.claude/agent-memory/), project (.claude/agent-memory/), local (.claude/agent-memory-local/)
- **SubagentStop hook** (v2.1.49, Feb 2026): receives `last_assistant_message` for post-processing
- **Async hooks:** `async: true` runs in background with 10-minute timeout

### Critical Discovery for AGF-7

The `hooks` field in agent frontmatter means agents CAN have lifecycle hooks. This was assumed to be impossible in our architecture analysis. The hook gap between Command/Skill mode (hooks fire) and Agent mode (no hooks) can be resolved by declaring hooks in the agent's `.claude/agents/{id}.md` frontmatter.

**Sources:**
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Claude Code Subagents Documentation](https://code.claude.com/docs/en/sub-agents)

---

## 4. Cross-IDE Agent Portability

### Findings

- **Agent Skills standard** released by Anthropic Dec 18, 2025 — adopted by 26+ platforms
- **Platforms:** Codex, Gemini CLI, Claude Code, GitHub Copilot, Cursor, VS Code, Roo Code, Amp, Goose, Mistral AI, Databricks, Google Antigravity
- **SKILL.md format:** YAML frontmatter (`name`, `description`, `run-agent: codex|claude|gemini|cursor-agent`) + markdown instructions
- **Installation directories:** `~/.codex/skills/`, `~/.claude/skills/`, `~/.gemini/skills/`
- **Execution priority:** CLI arg override → frontmatter `run-agent` → auto-detect environment → default codex
- **Design principles:** Single Responsibility, Self-Contained Execution, Explicit Scope Boundaries
- **Lightweight:** "No server process, just copy files. No MCP server—just a Python script."

### Applicability to AIOS

AIOS skills already follow a similar pattern. Generating `.agents/skills/` format alongside `.claude/skills/` enables portability across 26+ platforms with zero additional runtime cost.

**Sources:**
- [Agent Skills - OpenAI Developers](https://developers.openai.com/codex/skills/)
- [shinpr/sub-agents-skills](https://github.com/shinpr/sub-agents-skills)
- [Codex CLI Agent Skills Guide 2026](https://itecsonline.com/post/codex-cli-agent-skills-guide-install-usage-cross-platform-resources-2026)

---

## 5. Activation Reports & Agent Observability

### Findings

- **89% of organizations** have implemented observability for agents (LangChain 2026 survey)
- **62% have detailed tracing** of individual agent steps and tool calls
- **94% in production** have observability; 71.5% have full tracing
- **Pipeline metrics:** End-to-end tracing across LLM calls, retrieval, and tools; cost analytics with token breakdowns
- **Best practice:** Log not just what agent did, but WHY (chain-of-thought reasoning traces)
- **2026 trend:** Integration with governance, risk, and compliance tooling

### Applicable Pattern for Activation Report v2

The `SessionStart` hook + `SubagentStart` hook combo can produce a structured activation report:
```
Agent: @dev (Dex) | Level: 3 (hooks)
Branch: pedro-aios | Story: AGF-7
Context loaded: DNA (200t) + Rules (3 matched, 450t) + Memory (180t)
Bracket: FRESH (0/40 prompts)
```

**Sources:**
- [LangChain State of Agent Engineering](https://www.langchain.com/state-of-agent-engineering)
- [Kore.ai AI Observability](https://www.kore.ai/blog/what-is-ai-observability)

---

## 6. Context Bracket & Token Budget Management

### Findings

- **Token estimation heuristic:** characters/4 (used by SYNAPSE engine) vs prompt_count (used by SYNAPSE-Lite)
- **Progressive injection validated:** Load more context when less remains (bracket inversion)
- **Skills declare token_budget** in frontmatter metadata — enables cost-conscious routing decisions
- **Three cognitive load categories:** Intrinsic (task difficulty), Extraneous (reduced via indexing), Germane (supported through structure)
- **Icon-based compression:** Emoji prefixes compress observations into scannable, searchable descriptions

### Recommended Bracket Strategy

| Bracket | Prompts | DNA | Enhancement | Memory | Rules | Keyword |
|---------|---------|-----|-------------|--------|-------|---------|
| FRESH | <10 | 200t | 500t | 0 | All | On trigger |
| MODERATE | 10-24 | 200t | 300t | 180t | All | On trigger |
| DEPLETED | 25-39 | 200t | 0 | 500t | Critical only | On trigger |
| CRITICAL | 40+ | 200t | 0 | 1000t | Constitution only | Disabled |

---

## Research Metadata

| Metric | Value |
|--------|-------|
| Workers dispatched | 4 |
| Workers succeeded | 4 |
| Sources found | 20+ |
| Deep reads | 15+ |
| HIGH credibility | 12 |
| MEDIUM credibility | 5 |
| Coverage score | 85/100 |
| Gaps remaining | BMAD compiler internals (403 on some pages) |
