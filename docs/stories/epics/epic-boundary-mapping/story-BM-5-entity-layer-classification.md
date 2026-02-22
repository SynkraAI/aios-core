# Story BM-5: Entity Registry Layer Classification (L1-L4)

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | BM-5 |
| **Epic** | Boundary Mapping & Framework-Project Separation |
| **Type** | Enhancement |
| **Status** | Draft |
| **Priority** | P2 |
| **Points** | 3 |
| **Agent** | @dev (Dex) |
| **Quality Gate** | @architect (Aria) |
| **Blocked By** | BM-4 |
| **Branch** | TBD |
| **Origin** | Research: dynamic-entity-registries (2026-02-22) |

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: ["registry_validation", "layer_consistency_check"]
```

## Story

**As a** developer inspecting the entity graph,
**I want** every entity in the registry to be classified by its boundary layer (L1-L4),
**so that** I can understand which entities are framework-owned vs project-owned and make informed decisions about modifications.

## Context

The entity registry (`.aios-core/data/entity-registry.yaml`) currently has 712 entities with category/lifecycle metadata but no boundary layer classification. Adding a `layer` field enables the graph dashboard to color/filter by ownership and the IDS gates to enforce boundary rules.

### Layer Classification Rules

| Layer | Criteria | Examples |
|-------|----------|---------|
| L1 (Framework Core) | Path in `.aios-core/core/`, `bin/`, `constitution.md` | config-resolver, orchestrator, aios.js |
| L2 (Framework Templates) | Path in `.aios-core/development/{tasks,templates,checklists,workflows}/` | create-next-story.md, story-tmpl.yaml |
| L3 (Project Config) | `core-config.yaml`, `.claude/CLAUDE.md`, `.claude/settings.json`, agent MEMORY.md | boundary config, CLAUDE.md rules |
| L4 (Project Runtime) | `docs/stories/`, `squads/`, `packages/`, `.aios/`, `tests/` | stories, squad configs, app code |

### Research References
- [Dynamic Entity Registries — Layer 1 Schema](../../../research/2026-02-22-dynamic-entity-registries/03-recommendations.md#layer-1-entity-schema-evolution)
- [Framework-Project Separation — Ownership Table](../../../research/2026-02-22-framework-project-separation/03-recommendations.md#layer-1-physical-boundary)

## Acceptance Criteria

1. Entity registry schema gains a `layer` field with values: `L1`, `L2`, `L3`, `L4`
2. A classification script or function assigns layers based on entity path patterns
3. All 712+ entities have a layer assignment
4. Graph dashboard can filter by layer (if graph dashboard supports new filters)
5. Layer classification is documented with clear rules for each layer
6. New entities created by agents auto-classify based on path
7. Entity registry rebuild preserves layer assignments

## Scope

### IN Scope
- `layer` field in entity registry schema
- Path-based classification logic
- Bulk assignment for existing entities
- Documentation of classification rules

### OUT of Scope
- Backstage-style schema migration (BM-10 backlog)
- Event-sourced changelog (BM-11 backlog)
- Auto-discovery engine (BM-10 backlog)

## Complexity & Estimation

**Complexity:** Medium
**Estimation:** 2-3 hours

## File List

| File | Action | Description |
|------|--------|-------------|
| `.aios-core/data/entity-registry.yaml` | Modified | Add layer field to all entities |
| `.aios-core/core/graph-dashboard/formatters/html-formatter.js` | Modified | Layer filter support (optional) |

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | @pm (Morgan) | Story drafted from tech-search research |
