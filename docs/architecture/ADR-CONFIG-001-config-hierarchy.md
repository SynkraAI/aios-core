# ADR-CONFIG-001: Configuration Hierarchy

**Status:** Accepted
**Date:** 2026-02-18
**Context:** Structural audit identified 8 config YAMLs with overlapping responsibilities

## Decision

AIOS configuration follows a 3-layer hierarchy with clear ownership and mutability rules.

## Layers

### Layer 1 — Framework (Immutable)

**File:** `.aios-core/framework-config.yaml`
**Owner:** AIOS framework (npm package)
**Mutability:** Read-only — shipped with the framework, never edited by users
**Git:** Committed (framework source)
**Contains:** Resource locations, IDE sync system, metadata, default paths

```yaml
# DO NOT EDIT — override in core-config.yaml or local-config.yaml
metadata:
  name: "Synkra AIOS"
  framework_version: "4.0.0"
resource_locations:
  agents_dir: ".aios-core/development/agents"
  # ...
```

### Layer 2 — Project (Editable)

**File:** `.aios-core/core-config.yaml`
**Owner:** Project maintainers
**Mutability:** Editable — project-specific settings shared across the team
**Git:** Committed
**Contains:** IDE selection, MCP config, QA paths, PRD config, squads, git settings

```yaml
project:
  type: brownfield
ide:
  selected: [claude-code, codex]
squads:
  enabled: [copywriting-squad, dan-koe, design]
```

**File:** `.aios-core/project-config.yaml`
**Owner:** Project maintainers
**Mutability:** Editable
**Git:** Committed
**Contains:** Documentation paths, GitHub integration, CodeRabbit, logging, auto-claude settings
**Note:** This file covers project-level settings that don't fit in core-config. Both are Layer 2.

### Layer 3 — Runtime (Generated)

**Directory:** `.aios/`
**Owner:** System (auto-generated)
**Mutability:** Auto-managed — never manually edited
**Git:** Ignored (.gitignore)
**Contains:** Session state, project status, skills, environment reports

```
.aios/
├── session.json           # Current session state
├── project-status.yaml    # Project status cache
├── environment-report.json # Environment detection
├── claude-status.json     # Claude integration status
└── skills/                # Runtime skill files
```

## Auxiliary Configuration Files

| File | Layer | Purpose | Editable? |
|------|-------|---------|-----------|
| `core-config.yaml` | L2 | Main project config | Yes |
| `project-config.yaml` | L2 | Extended project config | Yes |
| `framework-config.yaml` | L1 | Framework defaults | No |
| `pro-config.yaml` | L2 | Pro tier features | Yes (if Pro installed) |
| `feature-registry.yaml` | L2 | Feature flags | Yes |
| `install-manifest.yaml` | L1 | Installation manifest | No (auto-generated) |
| `local-config.yaml` | L3 | Machine-specific secrets | Yes (gitignored) |

## Resolution Order

When the same key exists in multiple layers:

```
local-config.yaml (L3)  →  overrides  →  core-config.yaml (L2)  →  overrides  →  framework-config.yaml (L1)
```

## Consequences

- Framework upgrades (`npm update`) only touch L1 files
- Project config changes (L2) are committed and shared with the team
- Machine-specific secrets (L3) never leave the local machine
- No config file should mix concerns from different layers

## References

- ADR-PRO-002 (original config hierarchy proposal)
- Structural audit 2026-02-18
