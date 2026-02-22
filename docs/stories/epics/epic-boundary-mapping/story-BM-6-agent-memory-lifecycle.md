# Story BM-6: Agent Memory Lifecycle & Config Evolution

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | BM-6 |
| **Epic** | Boundary Mapping & Framework-Project Separation |
| **Type** | Enhancement |
| **Status** | Draft |
| **Priority** | P2 |
| **Points** | 5 |
| **Agent** | @dev (Dex) + @architect (Aria) |
| **Quality Gate** | @qa (Quinn) |
| **Blocked By** | BM-5 |
| **Branch** | TBD |
| **Origin** | Research: project-config-evolution (2026-02-22) |

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: ["memory_lifecycle_test", "config_evolution_check"]
```

## Story

**As a** AIOS project evolving over time,
**I want** agent memory (MEMORY.md) and project config (CLAUDE.md) to have structured lifecycles,
**so that** learned patterns get promoted to rules, stale memories get archived, and the config evolves with the project's tech stack.

## Context

Research identified a 3-tier memory lifecycle: **Capture → Promote → Archive**. Agent MEMORY.md files accumulate patterns during sessions but lack a structured process for promoting stable patterns to CLAUDE.md rules or archiving stale ones.

Similarly, CLAUDE.md sections (coding standards, tech stack) should evolve as the project adds/changes technologies, without requiring manual updates.

### Research References
- [Project Config Evolution — Rec 5](../../../research/2026-02-22-project-config-evolution/03-recommendations.md#recommendation-5)
- [Project Config Evolution — Rec 4](../../../research/2026-02-22-project-config-evolution/03-recommendations.md#recommendation-4)

## Acceptance Criteria

### Memory Lifecycle

1. Agent MEMORY.md files follow a documented structure: `## Active Patterns`, `## Archived`, `## Promotion Candidates`
2. A `*memory-audit` command (or checklist) identifies patterns appearing 3+ times as promotion candidates
3. Promoted patterns include source (which MEMORY.md) and promotion date
4. Archived entries include archive date and reason

### Config Evolution

5. Documentation audit script concept: verify documented commands still exist in package.json
6. Documentation of which CLAUDE.md sections are framework-generated vs project-customized
7. Clear separation: framework-owned sections (Constitution, agent system) vs project-owned sections (code standards, tech stack)

### Cross-Cutting

8. All changes backward compatible with existing MEMORY.md files
9. Agent activation pipeline reads structured MEMORY.md correctly

## Scope

### IN Scope
- MEMORY.md structured format with sections
- Promotion candidate identification logic
- Documentation of CLAUDE.md framework vs project sections
- Audit script concept (may be doc-only)

### OUT of Scope
- Automated CLAUDE.md generation from package.json
- MCP-based cross-tool memory (AgentKits)
- Full /init audit automation
- Path-scoped rules migration

## Complexity & Estimation

**Complexity:** Medium
**Estimation:** 4-5 hours

## File List

| File | Action | Description |
|------|--------|-------------|
| `.aios-core/development/agents/*/MEMORY.md` | Modified | Structured format migration |
| `.aios-core/development/tasks/memory-audit.md` | Created | Memory audit task definition |
| `.claude/CLAUDE.md` | Modified | Mark framework vs project sections |

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | @pm (Morgan) | Story drafted from tech-search research |
