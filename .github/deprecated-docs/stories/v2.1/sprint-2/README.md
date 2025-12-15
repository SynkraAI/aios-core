# Sprint 2 Stories - Modular Architecture + Service Discovery

**Sprint:** 2 | **Duration:** 2.5 semanas | **Points:** 94 | **Stories:** 17
**Updated:** 2025-11-30 (PO Review - Story 2.3 Validated Complete)

## 📊 Sprint Progress

| Metric | Value |
|--------|-------|
| **Completed** | 66 pts (70%) |
| **Ready for Dev** | 11 pts (12%) |
| **In Review** | 0 pts (0%) |
| **Blocked** | 16 pts (17%) |

## 📋 Stories List

| ID | Story | Points | Priority | Status | Deps |
|----|-------|--------|----------|--------|------|
| **2.0** | [Pre-Migration Cleanup](./story-2.0-pre-migration-cleanup.md) | 3 | 🔴 Critical | ✅ Done | 1.x |
| 2.1 | [Module Structure Design](./story-2.1-module-structure-design.md) | 8 | 🔴 Critical | ✅ Done | **2.0** |
| 2.2 | [Core Module Creation](./story-2.2-core-module.md) | 5 | 🔴 Critical | ✅ Done | 2.1 |
| 2.3 | [Development Module Creation](./story-2.3-development-module.md) | 5 | 🔴 Critical | ✅ Done | 2.1 |
| 2.4 | [Product Module Creation](./story-2.4-product-module.md) | 3 | 🟠 High | ✅ Done | 2.1 |
| 2.5 | [Infrastructure Module Creation](./story-2.5-infrastructure-module.md) | 5 | 🟠 High | ✅ Done | 2.1 |
| 2.6 | [Service Registry Creation](./story-2.6-service-registry.md) | 8 | 🔴 Critical | ✅ Done | 2.2-2.5 |
| 2.7 | [Discovery CLI - Search](./story-2.7-discovery-cli-search.md) | 8 | 🔴 Critical | ✅ Done | 2.6 |
| 2.8-2.9 | [Discovery CLI - Info & List](./story-2.8-2.9-discovery-cli-info-list.md) | 8 | 🟠 High | ✅ Done | 2.6 |
| 2.10 | [Quality Gate Manager](./story-2.10-quality-gate-manager.md) | 8 | 🔴 Critical | ✅ Done | 2.2-2.5 |
| 2.11 | [MCP System Global](./story-2.11-mcp-system-global.md) | 8 | 🟠 High | 🟡 Ready | 1.5 |
| 2.12 | [Framework Standards Migration](./story-2.12-standards-migration.md) | 3 | 🟡 Medium | 🟡 Ready | 2.2 |
| 2.13 | [Manifest System](./story-2.13-manifest-system.md) | 5 | 🟡 Medium | ✅ Done | 2.6 |
| 2.14 | [Migration Script v2.0 → v2.1](./story-2.14-migration-script.md) | 8 | 🔴 Critical | ⏸️ Blocked | 2.10-2.13 |
| 2.15 | [Update Installer for Modules](./story-2.15-update-installer.md) | 3 | 🟠 High | ⏸️ Blocked | 2.14 |
| 2.16 | [Documentation Sprint 2](./story-2.16-documentation.md) | 5 | 🟡 Medium | ⏸️ Blocked | all |

**Total:** 94 pontos (+3 from Story 2.0)

## 🔄 Dependency Graph

```
Sprint 1 Complete
       │
       ▼
   [2.0] Pre-Migration Cleanup (NEW - 3pts)
       │
       ▼
   [2.1] Module Structure Design (8pts, was 5pts)
       │
       ├─────────────┬──────────────┬──────────────┐
       ▼             ▼              ▼              ▼
   [2.2] Core    [2.3] Dev     [2.4] Product  [2.5] Infra
       │             │              │              │
       └─────────────┴──────────────┴──────────────┘
                          │
                          ▼
                   [2.6] Service Registry
                          │
       ┌──────────────────┼──────────────────┐
       ▼                  ▼                  ▼
   [2.7] Search      [2.8] Info         [2.9] List
       │                  │                  │
       └──────────────────┴──────────────────┘
                          │
                          ▼
                   [2.14] Migration Script
                          │
                          ▼
                   [2.15] Update Installer
                          │
                          ▼
                   [2.16] Documentation
```

## 🆕 Changes (2025-11-29 - PO Review)

### Sharded Stories 2.6-2.9: Service Discovery
- **Why:** Original consolidated story lacked enrichment template elements
- **What:** Split into 3 individual/consolidated stories following template pattern
- **Result:**
  - `story-2.6-service-registry.md` - 8 pts (individual, critical path)
  - `story-2.7-discovery-cli-search.md` - 8 pts (individual, critical path)
  - `story-2.8-2.9-discovery-cli-info-list.md` - 8 pts (consolidated, related CLI)
- **Original:** Archived to `archive/story-2.6-2.9-service-discovery-original.md`

### Updated Stories 2.0-2.5 Status
- All module creation stories (2.0-2.5) marked as ✅ Done
- Story 2.6 now Ready for Development (dependencies satisfied)
- Stories 2.7, 2.8-2.9 marked as Blocked (waiting for 2.6)

---

## 🆕 Previous Changes (2025-01-27)

### Added Story 2.0: Pre-Migration Cleanup
- **Why:** Identificados 257 arquivos deprecated durante validação
- **What:** Remove backups, duplicatas, e lixo antes da migração
- **Impact:** +3 points, novo blocker para 2.1

### Updated Story 2.1: Module Structure Design
- **Points:** 5 → 8 (estimativa subdimensionada)
- **Tasks:** 5 → 8 (adicionadas tasks de validação)
- **Deps:** Agora depende de 2.0

### Cleanup Details (257 files to remove)
| Category | Count | Pattern |
|----------|-------|---------|
| Root backups | 4 | `*.backup-*` |
| Agent backups | 22 | `*.backup`, `*.backup-pre-inline` |
| Task backups | ~220 | `*.v1-backup.md`, `*.pre-task-id-fix` |
| Duplicated folder | 1 | `config/` (duplica `data/`) |

## 🎯 Sprint Goals
- ✅ Arquitetura modular 100% funcional
- ✅ 97+ workers catalogados
- ✅ Service Discovery CLI operational
- ✅ Migration script testado
- **✅ [NEW] Codebase limpo de arquivos deprecated**

## ⚠️ Risks Identified

1. **Cleanup não feito** → Migra 257 arquivos inúteis
2. **Estimativas subdimensionadas** → Story 2.1 já ajustada
3. **Dependência sequencial** → 2.0 bloqueia toda a sprint

## 📅 Recommended Execution Order

1. **Day 1**: Story 2.0 (cleanup)
2. **Days 2-3**: Story 2.1 (design)
3. **Days 4-6**: Stories 2.2-2.5 (modules) - parallelizable
4. **Days 7-8**: Stories 2.6-2.9 (service discovery)
5. **Days 9-10**: Stories 2.10-2.13 (quality/standards)
6. **Days 11-12**: Stories 2.14-2.16 (migration/docs)

---
**Criado por:** River 🌊
**Atualizado por:** Pax 🎯 (PO Review 2025-11-29 - Stories 2.6-2.9 Sharding)
