# Research: Claude Code Agents + Teams + Skills + Memory Synergy

> **Date:** 2026-02-09
> **Agents Used:** 38 (31 researchers + 6 synthesizers + 1 final report)
> **Sources:** 400+ URLs, 200+ pages deep-read
> **Output:** ~31K lines across 43 files (2 directories)
> **Tokens Consumed:** ~4.7M (estimated)

---

## How to Read This Research

### Start Here
- **[FINAL-REPORT.md](./FINAL-REPORT.md)** (827 lines) -- The definitive output. Contains 10 key findings, 9 composition patterns, 26 improvement proposals, and a 59h implementation roadmap across 4 phases.

### Synthesis Documents (Wave Summaries)
| File | Lines | Coverage |
|------|-------|----------|
| [synthesis-wave1.md](./synthesis-wave1.md) | 291 | Core primitives: Skills, Agent Memory, Teams, Integration Patterns |
| [synthesis-wave2.md](./synthesis-wave2.md) | 278 | Ecosystem: Agent SDK, Community, Compound Learning, Official Skills |
| [synthesis-wave3.md](./synthesis-wave3.md) | 264 | Architecture: Blueprint, CLAUDE.md Patterns, Gap Analysis, 28 Proposals |
| [synthesis-wave4.md](./synthesis-wave4.md) | 243 | Production: Community Threads, Competitors (9 tools), MCP, Enterprise |

### Deep Research (Gap-Filling Wave)
| File | Lines | Topic |
|------|-------|-------|
| [new-research-hooks-lifecycle.md](./new-research-hooks-lifecycle.md) | 1,125 | 14 hook events, 3 handler types, 20+ production patterns |
| [new-research-teams-skills-composition.md](./new-research-teams-skills-composition.md) | 1,007 | Teams+Skills patterns, Issue #24316, Stack composition |
| [new-research-compound-learning.md](./new-research-compound-learning.md) | 944 | Memory taxonomy, ICLR MemAgents, cross-session learning |
| [new-research-workflow-orchestration.md](./new-research-workflow-orchestration.md) | 910 | 8 orchestration patterns, Generator-Critic loops, checkpoint-based recovery |
| [new-research-skill-chaining.md](./new-research-skill-chaining.md) | 830 | Skill-to-skill invocation (Bug #17351), meta-skill pattern, Superpowers |
| [new-research-agent-memory-deep.md](./new-research-agent-memory-deep.md) | 594 | 6-tier memory hierarchy, auto-memory mechanics, pruning |

### Raw Research (Wave 1-5)
See [`../2026-02-09-claude-code-skills-advanced/`](../2026-02-09-claude-code-skills-advanced/) for 30 raw research files (~23K lines) from the first research session.

---

## Top 10 Findings

1. **Skills cannot chain** -- Bug #17351 (21 upvotes, OPEN). After nested skill, control returns to main session.
2. **Agent Memory (`memory: project`)** gives compound learning -- debugging drops from 2h to 5min to 2min to preventative.
3. **Model routing** (Haiku/Sonnet/Opus) saves 40-60% cost. One case: 86%.
4. **CLAUDE.md budget is ~150 instructions**. MMOS is at 461 lines. Needs ~120 + rules/ files.
5. **Skill discovery has 56% miss rate**. Generic descriptions ~20% activation, specific 72-90%.
6. **Agent Teams use 7x more tokens**. Only worth it for truly parallel work.
7. **MCP servers consume 8-30% of context** even when unused.
8. **Context degrades after ~20 message exchanges**. Community consensus: /compact at 70%.
9. **Agent Skills is becoming a cross-platform standard** (agentskills.io) -- adopted by OpenAI, Cursor, Copilot.
10. **6 composition patterns identified**: Parallel Specialists, Competing Hypotheses, Cross-Layer, Sequential Pipeline, Self-Organizing Swarm, Plan-Approve-Execute.

---

## Implementation Roadmap (59h total)

| Phase | Effort | Key Actions |
|-------|--------|-------------|
| **Phase 1: This Week** | 8h | Model routing, `memory: project` on 4 agents, CLAUDE.md split, pre-flight validation |
| **Phase 2: Next 2 Weeks** | 13h | Generator-Critic loops, cost-tracker hook, structured rejection format, research memory |
| **Phase 3: Next Month** | 15h | Git worktree isolation, parallel expand+validate, progressive autonomy, OpenTelemetry |
| **Phase 4: Quarter** | 23h | /parallel-review skill, MCP Pipeline Server, citation-based memory, dead-end detection |

---

## Token Consumption

| Component | Tokens | Method |
|-----------|--------|--------|
| **9 agents (confirmed)** | 1,148,735 | Task notification data |
| ad51402 (Synth Wave 1) | 115,107 | confirmed |
| aff803d (Synth Wave 2) | 137,693 | confirmed |
| aa24f65 (Synth Wave 3) | 112,389 | confirmed |
| ab52b8a (FINAL-REPORT) | 117,689 | confirmed |
| a45a2a2 (Hooks Lifecycle) | 120,673 | confirmed |
| a0a6cad (Teams+Skills) | 128,063 | confirmed |
| aec4f11 (Agent Memory) | 97,166 | confirmed |
| ac1d9c3 (Compound Learning) | 113,124 | confirmed |
| a301269 (Skill Chaining) | 124,817 | confirmed |
| a578e41 (Workflow Orchestration) | 82,014 | confirmed |
| **~29 agents (estimated)** | ~3.2M | avg 114K/agent |
| **2 main conversations (Opus)** | ~0.4M | estimated |
| **TOTAL ESTIMATED** | **~4.7M** | |

### Hypothetical API Cost (pay-per-use Opus 4.6)
- ~3.8M input tokens x $15/M = ~$57
- ~0.9M output tokens x $75/M = ~$68
- **Total: ~$125** (actual cost: $0 with Max subscription)

---

*Research conducted: 2026-02-09 | 38 AI research agents | 5 waves of parallel deep research | ~4.7M tokens*
