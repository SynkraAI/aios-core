# 🔄 Sprint 1 - Gradual Integration Roadmap

**Epic:** EPIC-S1 - Installer Foundation
**Strategy:** Opção A - Integração Gradual (QA Recommended)
**Created:** 2025-11-22
**Status:** 📋 Planning

---

## 🎯 Integration Philosophy

**❌ NOT Big Bang:** Wait until Story 1.8 to integrate everything at once
**✅ Gradual:** Integrate each module into wizard IMMEDIATELY after creation

**Why Gradual?**
1. ✅ Each story delivers integrated, testable value
2. ✅ Easier to debug issues incrementally
3. ✅ Lower risk of integration failures
4. ✅ Follows Agile "working software" principle
5. ✅ Aligned with EPIC-S1 goal: 98% success rate

---

## 📊 Current Status (As of 2025-11-22)

| Story | Module Status | Integration Status | Notes |
|-------|--------------|-------------------|-------|
| **1.1** | ✅ Done | ✅ Standalone | NPX command works |
| **1.2** | ✅ Done | ✅ Base | Wizard foundation ready |
| **1.3** | ✅ Done | ✅ Integrated | Project type detection in wizard |
| **1.4** | ✅ Done | ✅ Integrated | IDE selection in wizard |
| **1.5** | ✅ Done | ❌ **NOT Integrated** | **GAP IDENTIFIED** |
| **1.6** | 🔄 In Progress | ⏳ Pending | Module done, integration needed |
| **1.7** | ⏳ Not Started | ⏳ Pending | Will integrate immediately |
| **1.8** | ⏳ Not Started | 🎯 **Final Assembly** | Closes Story 1.5 gap + validates all |

---

## 🔍 Integration Gap Analysis

### Story 1.5 (MCP Installation) - Critical Gap

**Problem:** Module exists but NOT connected to wizard

**Evidence:**
```javascript
// src/wizard/questions.js (lines 50-56)
function getMCPQuestions() {
  // Placeholder - Story 1.5 will implement MCP selection
  return [];  // ❌ Empty!
}

// src/wizard/index.js (line 138)
* @property {string[]} [mcps] - Selected MCPs (Story 1.5)
// ↑ Documented but not implemented
```

**Impact:**
- ❌ Users cannot install MCPs via wizard
- ❌ Story 1.5 value not delivered to end users
- ❌ Story 1.8 validation cannot test MCP installation

**Resolution:** Integrate MCP installer in **Story 1.8 Phase 1** (details below)

---

## 🗺️ Integration Roadmap

### Phase 1: Foundation (✅ COMPLETE)

```
Story 1.1 (NPX) ──> Story 1.2 (Wizard Base)
                          │
                          ├──> Story 1.3 (Project Type) ──✅ Integrated
                          │
                          └──> Story 1.4 (IDE Selection) ──✅ Integrated
```

**Status:** Working wizard that collects project type + IDE selection

---

### Phase 2: Installation Modules (🔄 CURRENT)

```
Story 1.2 (Wizard)
      │
      ├──> Story 1.6 (Env Config) ──⏳ Module done, integrate now
      │         │
      │         └──> Story 1.7 (Dependencies) ──⏳ Integrate when done
      │                   │
      │                   └──> Story 1.8 (Validation) ──🎯 Final assembly
      │
      └──> Story 1.5 (MCP Installer) ──❌ NOT integrated yet
                    │
                    └──> Story 1.8 Phase 1 ──🎯 Close gap
```

**Current State:**
- ✅ Story 1.5: Module `mcp-installer.js` exists (standalone)
- 🔄 Story 1.6: Module `env-config.js` in progress
- ⏳ Story 1.7: Module `dependency-installer.js` not started

**Next Actions:**
1. **Story 1.6:** Complete env-config module → integrate into wizard IMMEDIATELY
2. **Story 1.7:** Create dependency module → integrate into wizard IMMEDIATELY
3. **Story 1.8:** Integrate MCP installer (close gap) + validate all

---

### Phase 3: Final Integration & Validation (⏳ PLANNED)

**Story 1.8: Installation Validation** = Final Assembly Point

**Objectives:**
1. ✅ Close Story 1.5 integration gap (Phase 1)
2. ✅ Implement MCP health checks (deferred functionality)
3. ✅ Validate all installed components
4. ✅ Provide comprehensive report

**Integration Order in Story 1.8:**
```javascript
// Complete wizard flow after Story 1.8
async function runWizard() {
  // 1. Collect information
  const answers = await inquirer.prompt(questions);

  // 2. Install components (gradual integration)
  const ide = await generateIDEConfigs(...);           // Story 1.4 ✅
  const env = await configureEnvironment(...);         // Story 1.6 ⏳
  const mcps = await installProjectMCPs(...);          // Story 1.5 ❌→✅
  const deps = await installDependencies(...);         // Story 1.7 ⏳

  // 3. Validate everything (Story 1.8)
  const validation = await validateInstallation({
    files: { ide, env, mcps },
    configs: { env, mcps },
    dependencies: deps,
    mcps: mcps.installedMCPs  // Health checks HERE
  });

  // 4. Report
  displayValidationReport(validation);
}
```

---

## 📋 Story-by-Story Integration Plan

### Story 1.6: Environment Configuration

**Module Status:** 🔄 In Progress (60/60 tests passing)

**Integration Tasks:**
- [ ] 1.6.7: Import `configureEnvironment()` in wizard (2h)
- [ ] 1.6.8: Add API key prompts to wizard questions (1h)
- [ ] 1.6.9: Test wizard integration E2E (1h)

**Integration Point:**
```javascript
// src/wizard/index.js - After IDE selection
const envResult = await configureEnvironment({
  projectType: answers.projectType,     // from Story 1.3
  selectedIDEs: answers.selectedIDEs,   // from Story 1.4
  mcpApiKeys: answers.mcpApiKeys        // prepare for Story 1.5
});
```

**Timeline:** Integrate IMMEDIATELY after module completion

---

### Story 1.7: Dependency Installation

**Module Status:** ⏳ Not Started

**Integration Tasks:**
- [ ] 1.7.6: Import `installDependencies()` in wizard (2h)
- [ ] 1.7.7: Add package manager selection to wizard (1h)
- [ ] 1.7.8: Test wizard integration E2E (1h)

**Integration Point:**
```javascript
// src/wizard/index.js - After environment configuration
const packageManager = detectPackageManager() || 'npm';
const depsResult = await installDependencies({
  packageManager,
  projectPath: process.cwd(),
  onProgress: (status) => console.log(status.message)
});
```

**Timeline:** Integrate IMMEDIATELY after module completion
**Dependency:** Story 1.6 must be integrated first (`.env` needed)

---

### Story 1.8: Installation Validation (+ MCP Integration)

**Module Status:** ⏳ Not Started

**Phase 1: MCP Integration (4h) - CRITICAL**
- [ ] 1.8.0.1: Add MCP selection questions to wizard
- [ ] 1.8.0.2: Import `installProjectMCPs()` in wizard
- [ ] 1.8.0.3: Call MCP installer after dependencies
- [ ] 1.8.0.4: Handle MCP installation progress
- [ ] 1.8.0.5: Test MCP integration E2E

**Phase 2: Validation Module (17h)**
- [ ] 1.8.1: File structure validator
- [ ] 1.8.2: Config validator
- [ ] 1.8.3: MCP health checks (Story 1.5 deferred)
- [ ] 1.8.4: Dependency validator
- [ ] 1.8.5: Report generator
- [ ] 1.8.6: Troubleshooting system
- [ ] 1.8.7: Testing

**Integration Point:**
```javascript
// src/wizard/index.js - MCP installation
if (answers.selectedMCPs && answers.selectedMCPs.length > 0) {
  const mcpsResult = await installProjectMCPs({
    selectedMCPs: answers.selectedMCPs,
    projectPath: process.cwd(),
    apiKeys: answers.mcpApiKeys || {},
    onProgress: (status) => console.log(`[MCP] ${status.message}`)
  });
}

// Validation
const validation = await validateInstallation({
  files: { ide, env, mcps },
  configs: { env, mcps },
  dependencies: deps,
  mcps: mcps.installedMCPs  // Health checks!
});
```

**Timeline:** Story 1.8 = Final assembly
**Dependencies:** Stories 1.6 + 1.7 must be integrated first

---

## 🎯 Complete Wizard Flow (After Story 1.8)

```
┌─────────────────────────────────────────┐
│  npx @allfluence/aios@latest init       │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────▼─────────┐
        │  Story 1.1: NPX   │
        │  Setup Complete   │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────────────────┐
        │  Story 1.2: Wizard Welcome    │
        │  "Welcome to AIOS v2.1!"      │
        └─────────┬─────────────────────┘
                  │
        ┌─────────▼─────────────────────┐
        │  Story 1.3: Project Type      │
        │  ○ Greenfield  ● Brownfield   │
        └─────────┬─────────────────────┘
                  │
        ┌─────────▼─────────────────────┐
        │  Story 1.4: IDE Selection     │
        │  ☑ Cursor  ☑ Windsurf  ☐ Zed │
        └─────────┬─────────────────────┘
                  │
        ┌─────────▼─────────────────────┐
        │  Story 1.6: Environment       │
        │  "Enter API keys (optional)"  │
        │  .env + core-config.yaml      │
        └─────────┬─────────────────────┘
                  │
        ┌─────────▼─────────────────────┐
        │  Story 1.5: MCP Selection     │  ← Integrated in Story 1.8!
        │  ☑ Browser  ☑ Context7        │
        │  ☑ Exa  ☑ Desktop Commander   │
        │  Installing MCPs...           │
        └─────────┬─────────────────────┘
                  │
        ┌─────────▼─────────────────────┐
        │  Story 1.7: Dependencies      │
        │  "Installing with npm..."     │
        │  Progress: ████████ 80%       │
        └─────────┬─────────────────────┘
                  │
        ┌─────────▼─────────────────────┐
        │  Story 1.8: Validation        │
        │  🔍 Validating installation   │
        │  ✓ IDE configs                │
        │  ✓ Environment                │
        │  ✓ MCPs (3/4 healthy)         │
        │  ✓ Dependencies               │
        └─────────┬─────────────────────┘
                  │
        ┌─────────▼─────────────────────┐
        │  Story 1.11: First-Run        │
        │  ✅ Installation complete!    │
        │  "Next steps: ..."            │
        └───────────────────────────────┘
```

---

## 📊 Integration Metrics & Success Criteria

### Per-Story Integration Metrics

| Story | Module LOC | Integration LOC | Test Coverage | E2E Tests |
|-------|-----------|----------------|--------------|-----------|
| 1.3 | 150 | 50 | 95% | ✅ Pass |
| 1.4 | 400 | 100 | 90% | ✅ Pass |
| 1.5 | 377 | **0 (GAP)** | 100% | ❌ Not integrated |
| 1.6 | ~300 | TBD | 100% | ⏳ Pending |
| 1.7 | TBD | TBD | TBD | ⏳ Pending |
| 1.8 | TBD | TBD (includes 1.5) | TBD | ⏳ Pending |

### Overall Integration Success Criteria

- [ ] All modules integrated into single wizard flow
- [ ] E2E test passes: `npx init` → complete installation
- [ ] Installation time < 5 minutes
- [ ] Success rate > 95% in testing
- [ ] Zero regressions from integrated stories

---

## 🚨 Risks & Mitigation

### Risk 1: Story 1.5 Integration Delay

**Risk:** MCP integration deferred to Story 1.8 may be forgotten
**Likelihood:** Medium
**Impact:** High (users can't install MCPs)

**Mitigation:**
- ✅ Documented explicitly in Story 1.8 tasks (Task 1.8.0)
- ✅ QA review identified gap early
- ✅ Story 1.8 expanded with MCP integration phase

### Risk 2: Integration Conflicts

**Risk:** Modules may conflict when integrated together
**Likelihood:** Low (gradual integration)
**Impact:** Medium

**Mitigation:**
- ✅ Each story integrates immediately (catch conflicts early)
- ✅ E2E tests after each integration
- ✅ Clear integration points documented

### Risk 3: Wizard State Complexity

**Risk:** Wizard state becomes complex with many modules
**Likelihood:** Medium
**Impact:** Medium

**Mitigation:**
- ✅ Clear wizard flow diagram
- ✅ Structured result objects per module
- ✅ Comprehensive validation in Story 1.8

---

## 📝 Next Actions (Priority Order)

### Immediate (This Sprint)

1. **Story 1.6:** Complete module → integrate into wizard
   - Timeline: 4h (integration tasks 1.6.7-1.6.9)
   - Owner: @dev
   - Blocker: None

2. **Story 1.7:** Create module → integrate into wizard
   - Timeline: 13h (9h module + 4h integration)
   - Owner: @dev
   - Blocker: Story 1.6 integration must complete first

3. **Story 1.8 Phase 1:** Integrate MCP installer (Story 1.5 gap)
   - Timeline: 4h (tasks 1.8.0.1-1.8.0.7)
   - Owner: @dev
   - Blocker: Story 1.7 integration must complete first

4. **Story 1.8 Phase 2:** Validation module + MCP health checks
   - Timeline: 17h (tasks 1.8.1-1.8.7)
   - Owner: @dev
   - Blocker: Story 1.8 Phase 1 must complete first

### Follow-up (Next Stories)

- Story 1.9: Error Handling & Rollback
- Story 1.10: Cross-Platform Testing
- Story 1.11: First-Run Experience
- Story 1.12: Documentation

---

## 📚 References

**Stories Updated:**
- `docs/stories/v2.1/sprint-1/story-1.6-environment-configuration.md` (added wizard integration plan)
- `docs/stories/v2.1/sprint-1/story-1.7-dependency-installation.md` (added wizard integration plan)
- `docs/stories/v2.1/sprint-1/story-1.8-installation-validation.md` (added MCP integration + validation)

**Related Documents:**
- `docs/epics/epic-s1-installer-foundation.md` - Epic overview
- `docs/qa/gates/story-1.5-mcp-installation-re-review.yaml` - QA review that identified gap
- `bin/modules/mcp-installer.js` - Story 1.5 module (ready for integration)
- `src/wizard/index.js` - Wizard entry point (integration target)

**QA Analysis:**
- Integration gap identified: 2025-11-22 (Quinn, QA review of Story 1.5)
- Gradual integration strategy recommended: Opção A

---

**Created by:** Quinn 🛡️ (QA - Test Architect)
**Date:** 2025-11-22
**Version:** 1.0
**Status:** 📋 Planning → Implementation in Progress

---

## 🎯 Success Definition

**Sprint 1 integration is successful when:**

✅ **User Experience:**
- User runs `npx @allfluence/aios@latest init`
- Wizard guides through ALL steps: Type → IDE → Env → MCP → Deps
- Installation completes in < 5 minutes
- Validation report shows all components healthy
- User sees "Installation complete!" message

✅ **Technical:**
- All 8 stories (1.1-1.8) integrated into single flow
- 100% test pass rate (unit + integration + E2E)
- No standalone modules (all connected to wizard)
- Cross-platform compatibility verified

✅ **Quality:**
- Installation success rate > 95%
- Zero critical bugs
- User satisfaction > 8/10
- Ready for Story 1.9 (Error Handling)

**We're not done until the wizard is fully integrated and user-tested!** 🚀
