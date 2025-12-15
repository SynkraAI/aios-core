# STORIES 2.10-2.16: Sprint 2 Final Stories

**Épico:** [EPIC-S2](../../../epics/epic-s2-modular-architecture.md) | **Sprint:** 2 | **Created:** 2025-01-19

---

## STORY 2.10: Quality Gate Manager Unificado

**Points:** 8 | **Priority:** 🔴 Critical

### User Story
**Como** QA, **Quero** Quality Gate Manager orquestrando 3 layers, **Para** catching 80% issues automaticamente

### Scope
Unified Quality Gate Manager em `.aios-core/core/quality-gates/quality-gate-manager.js`:

```javascript
class QualityGateManager {
  async runLayer1() { /* Pre-commit hooks */ }
  async runLayer2() { /* PR automation: CodeRabbit + Quinn */ }
  async runLayer3() { /* Human strategic review */ }
  
  async orchestrate(context) {
    const l1 = await this.runLayer1();
    if (!l1.pass) return failFast(l1);
    
    const l2 = await this.runLayer2();
    if (!l2.pass) return escalate(l2);
    
    return this.runLayer3(); // Strategic human review
  }
}
```

### Tasks (8 pts = 3 dias)
- [ ] 2.10.1: Design QG Manager architecture (3h)
- [ ] 2.10.2: Implement Layer 1 orchestration (5h)
- [ ] 2.10.3: Implement Layer 2 orchestration (5h)
- [ ] 2.10.4: Implement Layer 3 orchestration (3h)
- [ ] 2.10.5: Integration with existing gates (4h)
- [ ] 2.10.6: Test 3-layer flow (5h)

**Total:** 25h

---

## STORY 2.11: MCP System Global

**Points:** 8 | **Priority:** 🟠 High

### User Story
**Como** developer, **Quero** MCPs configurados 1x na máquina, **Para** reuse em todos projetos

### Scope

**User-level config:** `~/.aios/mcp/global-config.json`  
**Project-level:** Symlinks → global config

```bash
# Windows: Junction points
mklink /J ".aios-core\tools\mcp" "%USERPROFILE%\.aios\mcp"

# macOS/Linux: Symlinks
ln -s ~/.aios/mcp .aios-core/tools/mcp
```

### Tasks (8 pts = 3 dias)
- [ ] 2.11.1: Create ~/.aios/ structure (2h)
- [ ] 2.11.2: Global config system (4h)
- [ ] 2.11.3: Symlink/junction creation (Windows + macOS/Linux) (5h)
- [ ] 2.11.4: Detection of existing global config (3h)
- [ ] 2.11.5: Migration from project-level to global (4h)
- [ ] 2.11.6: Test on 3 OS (5h)

**Total:** 23h

---

## STORY 2.12: Framework Standards Migration

**Points:** 3 | **Priority:** 🟡 Medium

### User Story
**Como** developer, **Quero** standards em `.aios-core/docs/`, **Para** separar framework docs de project docs

### Scope
Migrar de `docs/standards/` → `.aios-core/docs/standards/`:

```
.aios-core/docs/
├── standards/
│   ├── AIOS-FRAMEWORK-MASTER.md
│   ├── AIOS-LIVRO-DE-OURO.md
│   ├── EXECUTOR-DECISION-TREE.md
│   ├── TASK-FORMAT-SPECIFICATION-V1.md
│   └── OPEN-SOURCE-VS-SERVICE-DIFFERENCES.md
├── architecture/
└── api/
```

### Tasks (3 pts = 1 dia)
- [ ] 2.12.1: Create .aios-core/docs/ structure (1h)
- [ ] 2.12.2: Move 10 standards files (2h)
- [ ] 2.12.3: Update all references (3h)
- [ ] 2.12.4: Test (2h)

**Total:** 8h

---

## STORY 2.13: Manifest System

**Points:** 5 | **Priority:** 🟡 Medium

### User Story
**Como** developer, **Quero** manifest CSV tracking agents/workers/tasks, **Para** validação e discovery

### Scope

Create 3 manifests:
```
.aios-core/manifests/
├── agents.csv
├── workers.csv
└── tasks.csv
```

**agents.csv:**
```csv
id,name,archetype,version,status,file_path
dex,Dex,Developer,2.1.0,active,.aios-core/development/agents/dev.md
aria,Aria,Architect,2.1.0,active,.aios-core/development/agents/architect.md
...
```

### Tasks (5 pts = 2 dias)
- [ ] 2.13.1: Design manifest schema (2h)
- [ ] 2.13.2: Generate agents.csv (2h)
- [ ] 2.13.3: Generate workers.csv (3h)
- [ ] 2.13.4: Generate tasks.csv (2h)
- [ ] 2.13.5: Validation script (3h)
- [ ] 2.13.6: Test (2h)

**Total:** 14h

---

## STORY 2.14: Migration Script v2.0 → v2.1

**Points:** 8 | **Priority:** 🔴 Critical

### User Story
**Como** developer em v2.0, **Quero** script automático de migração, **Para** atualizar para v2.1 sem perder dados

### Scope

```bash
$ aios migrate --from=2.0 --to=2.1

🔄 AIOS Migration v2.0 → v2.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Backup created (.aios-backup-2025-01-19/)
✓ Analyzing current structure...
✓ Migrating to modular architecture...
  - Core module (23 files)
  - Development module (45 files)
  - Product module (12 files)
  - Infrastructure module (18 files)
✓ Updating imports...
✓ Validating migration...

✅ Migration complete! (3 min 42s)

Next steps:
  1. Test your project
  2. Report issues: github.com/aios/issues
```

### Tasks (8 pts = 3 dias)
- [ ] 2.14.1: Backup system (3h)
- [ ] 2.14.2: Structure analysis (3h)
- [ ] 2.14.3: File migration logic (8h)
- [ ] 2.14.4: Import updates (5h)
- [ ] 2.14.5: Validation (3h)
- [ ] 2.14.6: Rollback mechanism (4h)
- [ ] 2.14.7: Test with 10+ real projects (8h)

**Total:** 34h

---

## STORY 2.15: Update Installer for Modules

**Points:** 3 | **Priority:** 🟠 High

### User Story
**Como** new user, **Quero** installer criar estrutura modular, **Para** começar com v2.1 architecture

### Tasks (3 pts = 1 dia)
- [ ] 2.15.1: Update installer to create 4 modules (2h)
- [ ] 2.15.2: Update file generation (2h)
- [ ] 2.15.3: Test fresh installs (3h)

**Total:** 7h

---

## STORY 2.16: Documentation Sprint 2

**Points:** 5 | **Priority:** 🟡 Medium

### Deliverables

1. **Module Architecture Guide** (`docs/architecture/module-system.md`)
2. **Service Discovery Guide** (`docs/guides/service-discovery.md`)
3. **Migration Guide v2.0 → v2.1** (`docs/migration/v2.0-to-v2.1.md`)
4. **Quality Gate Manager Guide** (`docs/guides/quality-gates.md`)

### Tasks (5 pts = 2 dias)
- [ ] 2.16.1: Module architecture guide (3h)
- [ ] 2.16.2: Service Discovery guide (3h)
- [ ] 2.16.3: Migration guide (4h)
- [ ] 2.16.4: Quality Gate guide (3h)
- [ ] 2.16.5: API docs updates (2h)

**Total:** 15h

---

## 🔗 Dependencies

**2.10 depends on:** [2.2-2.5] Modules  
**2.11 depends on:** [1.5] MCP Installation  
**2.12 depends on:** [2.2] Core Module  
**2.13 depends on:** [2.6] Service Registry  
**2.14 depends on:** All Sprint 2 stories  
**2.15 depends on:** [2.14] Migration Script  
**2.16 depends on:** All Sprint 2 stories  

---

**Criado por:** River 🌊

