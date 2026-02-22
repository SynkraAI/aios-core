# Story BM-4: Configuration Override Surface Design

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | BM-4 |
| **Epic** | Boundary Mapping & Framework-Project Separation |
| **Type** | Enhancement |
| **Status** | Draft |
| **Priority** | P2 |
| **Points** | 5 |
| **Agent** | @architect (Aria) + @dev (Dex) |
| **Quality Gate** | @qa (Quinn) |
| **Blocked By** | BM-1 |
| **Branch** | TBD |
| **Origin** | Research: framework-project-separation + project-config-evolution (2026-02-22) |

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: ["architecture_review", "config_schema_validation"]
```

## Story

**As a** project team using AIOS,
**I want** to customize framework behavior through a well-defined configuration override surface,
**so that** I can adapt templates, workflows, and agent behavior without modifying framework internals.

## Context

Following the Next.js/Terraform override pattern: `core-config.yaml` serves as the configuration surface. Framework reads defaults from `.aios-core/` internals, project overrides specific values.

### Override Resolution Order
1. Framework defaults (`.aios-core/core/`)
2. Project config (`core-config.yaml`)
3. Squad config (`squads/{name}/config.yaml`)
4. Runtime state (`.aios/`)

### Key Design Decisions
- Schema validation for config values (JSON Schema or Zod)
- Deep merge semantics (arrays replace, objects merge)
- Documentation of all overridable keys
- `core-config.local.yaml` for gitignored local overrides

### Research References
- [Framework-Project Separation — Layer 2](../../../research/2026-02-22-framework-project-separation/03-recommendations.md#layer-2-configuration-surface)
- [Framework Immutability — Rec 5](../../../research/2026-02-22-framework-immutability-patterns/03-recommendations.md#recommendation-5)
- [Project Config Evolution — Rec 3](../../../research/2026-02-22-project-config-evolution/03-recommendations.md#recommendation-3)

## Acceptance Criteria

1. `core-config.yaml` documents all overridable framework keys with defaults
2. `core-config.local.yaml` support for gitignored local overrides
3. Config resolver implements 4-level merge (framework > project > squad > runtime)
4. Schema validation rejects invalid config keys/values with clear error messages
5. Templates and task behavior can be customized via config (at least 1 example: story template sections)
6. `boundary` config section (from BM-1) is part of the schema
7. Documentation of override patterns for common customizations

## Scope

### IN Scope
- Config schema definition
- Override resolution logic (4 levels)
- `core-config.local.yaml` support
- Schema validation
- 1 concrete template customization example

### OUT of Scope
- Full template override engine
- UI for config editing
- Config migration tooling (`npx aios-core update`)

## Complexity & Estimation

**Complexity:** Medium
**Estimation:** 4-5 hours

## File List

| File | Action | Description |
|------|--------|-------------|
| `.aios-core/core-config.yaml` | Modified | Document overridable keys, add schema ref |
| `.aios-core/core/config/config-resolver.js` | Modified | 4-level merge, schema validation |
| `.aios-core/core/config/config-schema.json` | Created | JSON Schema for validation |
| `.gitignore` | Modified | Add `core-config.local.yaml` |

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | @pm (Morgan) | Story drafted from tech-search research |
