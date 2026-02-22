# Story BM-3: Pre-Commit Hook Framework Guard

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | BM-3 |
| **Epic** | Boundary Mapping & Framework-Project Separation |
| **Type** | Enhancement |
| **Status** | Draft |
| **Priority** | P1 |
| **Points** | 3 |
| **Agent** | @devops (Gage) |
| **Quality Gate** | @dev (Dex) |
| **Blocked By** | BM-1 |
| **Branch** | TBD |
| **Origin** | Research: framework-immutability-patterns (2026-02-22) |

---

## Executor Assignment

```yaml
executor: "@devops"
quality_gate: "@dev"
quality_gate_tools: ["hook_validation", "path_pattern_test"]
```

## Story

**As a** developer (human or AI) committing changes,
**I want** a pre-commit hook that blocks commits modifying framework core files,
**so that** accidental framework modifications are caught at commit time, regardless of the editor or AI tool being used.

## Context

Pre-commit hooks provide **editor-agnostic** protection. Combined with Claude Code deny rules (BM-1), this creates two-layer enforcement. Uses same protected path list from `core-config.yaml` boundary config.

### Key Design
- Respects `boundary.frameworkProtection` toggle from `core-config.yaml`
- When `frameworkProtection: false` → hook is a no-op (contributor mode)
- `--no-verify` escape hatch for legitimate framework updates
- Mutable exceptions: `.aios-core/data/`, agent MEMORY.md files

### Research References
- [Framework Immutability — Rec 3](../../../research/2026-02-22-framework-immutability-patterns/03-recommendations.md#recommendation-3)

## Acceptance Criteria

1. Pre-commit hook script exists at `.husky/pre-commit` (or equivalent)
2. Hook blocks commits with staged changes to L1/L2 protected paths
3. Hook allows commits to L3/L4 and mutable exception paths
4. Hook respects `boundary.frameworkProtection` config toggle
5. When `frameworkProtection: false`, hook passes all commits
6. Error message clearly explains why commit was blocked and how to bypass
7. `--no-verify` bypasses the hook (Git built-in)
8. Hook runs in <2 seconds

## Scope

### IN Scope
- Pre-commit hook script
- Integration with `core-config.yaml` toggle
- Clear error messaging

### OUT of Scope
- Husky installation/setup (assume available or use simple Git hooks)
- PreToolUse hooks (BM-7)
- CI pipeline enforcement

## Complexity & Estimation

**Complexity:** Low-Medium
**Estimation:** 2-3 hours

## File List

| File | Action | Description |
|------|--------|-------------|
| `.husky/pre-commit` or `.git/hooks/pre-commit` | Created | Framework guard hook |
| `.aios-core/core-config.yaml` | Read | Check frameworkProtection toggle |

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | @pm (Morgan) | Story drafted from tech-search research |
