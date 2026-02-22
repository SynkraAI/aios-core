# Story BM-2: CLAUDE.md Boundary Section & Progressive Disclosure

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | BM-2 |
| **Epic** | Boundary Mapping & Framework-Project Separation |
| **Type** | Enhancement |
| **Status** | Draft |
| **Priority** | P0 (Quick Win) |
| **Points** | 2 |
| **Agent** | @dev (Dex) |
| **Quality Gate** | @qa (Quinn) |
| **Blocked By** | - |
| **Branch** | TBD |
| **Origin** | Research: project-config-evolution (2026-02-22) |

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: ["content_review", "completeness_check"]
```

## Story

**As a** Claude Code agent working in an AIOS project,
**I want** explicit framework vs project boundary instructions in CLAUDE.md,
**so that** I understand which directories are read-only (framework) vs read-write (project) without relying on implicit convention.

## Context

Research identified that CLAUDE.md exceeds the effective instruction ceiling (~150-200 instructions). The boundary between framework and project artifacts is currently implicit. Adding an explicit section reinforces the deny rules (BM-1) with behavioral guidance.

### Research References
- [Project Config Evolution — Rec 1](../../../research/2026-02-22-project-config-evolution/03-recommendations.md#recommendation-1)
- [Framework-Project Separation — Layer 1](../../../research/2026-02-22-framework-project-separation/03-recommendations.md#layer-1-physical-boundary)

## Acceptance Criteria

1. CLAUDE.md gains a "Framework vs Project Boundary" section
2. Section lists NEVER-modify directories: `.aios-core/core/`, `.aios-core/development/tasks/`, `.aios-core/development/templates/`, `.aios-core/development/checklists/`, `.aios-core/infrastructure/`, `bin/aios.js`, `bin/aios-init.js`
3. Section lists ALWAYS-modify directories: `docs/stories/`, `squads/`, `packages/`, `tests/`
4. Section lists MUTABLE exceptions: `.aios-core/data/`, `.aios-core/development/agents/*/MEMORY.md`
5. Section references `core-config.yaml` as customization surface
6. CLAUDE.md total length does not increase by more than 30 lines (keep concise)
7. No duplicate information with existing sections (deduplicate if needed)

## Tasks / Subtasks

- [ ] **Task 1: Add boundary section to CLAUDE.md** (AC: 1-5)
  - [ ] 1.1 Add "Framework vs Project Boundary" section after "Estrutura do Projeto"
  - [ ] 1.2 List NEVER-modify paths with brief explanations
  - [ ] 1.3 List ALWAYS-modify paths
  - [ ] 1.4 List mutable exceptions
  - [ ] 1.5 Reference core-config.yaml

- [ ] **Task 2: Optimize CLAUDE.md length** (AC: 6, 7)
  - [ ] 2.1 Review for duplicate content that can be consolidated
  - [ ] 2.2 Ensure net addition is ≤30 lines
  - [ ] 2.3 Move verbose details to `.claude/rules/` if needed

## Scope

### IN Scope
- CLAUDE.md boundary section
- Content optimization (deduplication)

### OUT of Scope
- AGENTS.md creation (BM-9 backlog)
- Full CLAUDE.md restructuring to <150 lines (future story)
- Path-scoped rules migration

## Complexity & Estimation

**Complexity:** Low
**Estimation:** 1 hour

## File List

| File | Action | Description |
|------|--------|-------------|
| `.claude/CLAUDE.md` | Modified | Add boundary section, optimize |

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | @pm (Morgan) | Story drafted from tech-search research |
