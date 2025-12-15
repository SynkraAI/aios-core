# Epic 3 Split Proposal: 3A (Infrastructure) + 3B (Prevention) + 3C (Remediation)

**Proposal Date:** 2025-10-26 (REVISED)
**Proposed By:** Sarah (@po) + Winston (@architect)
**Status:** Draft - Awaiting Approval
**Rationale:** 1MCP architecture change requires infrastructure-first approach

---

## 🚨 **CRITICAL UPDATE: 1MCP Architecture Change**

**Architecture Impact:** Stories 3.26-3.27 (1MCP Migration) **fundamentally change** how MCP tools are referenced and validated.

**Before 1MCP:**
```yaml
dependencies:
  tools:
    - mcp-supabase      # Direct MCP reference
```

**After 1MCP:**
```yaml
dependencies:
  tools:
    - supabase          # Short name via 1MCP proxy
```

**Consequence:** Stories 3.21-3.25 (Prevention Track) were designed for legacy architecture. They **MUST be updated** for 1MCP mode before implementation.

**Solution:** Add Stories 3.28-3.32 to update Prevention stories for 1MCP, creating Epic 3A (Infrastructure).

---

## 🎯 Executive Summary

**Current Problem:** Epic 3 contains **33 stories (~165h)** with mixed strategic objectives:
- **CRITICAL:** MCP context bloat blocking all development (-123k tokens available)
- **Infrastructure:** Prevention stories need 1MCP updates before implementation
- **Prevention:** Automated gap prevention systems
- **Remediation:** Fix 324 existing gaps

**Proposed Solution:** Split into **3 focused epics** with clear sequencing:

### **Epic 3A: Infrastructure (CRITICAL)** - 7 stories, 26h, Week 1-3
**Purpose:** Unblock development + Prepare prevention infrastructure for 1MCP
- Stories 3.26-3.27: 1MCP Migration (22h) - **CRITICAL BLOCKER**
- Stories 3.28-3.32: Update Prevention for 1MCP (4h) - **PREREQUISITE**

### **Epic 3B: Gap Prevention** - 5 stories, 18h, Week 4-6
**Purpose:** Implement automated gap prevention (after 1MCP migration)
- Stories 3.21-3.25: Prevention systems (updated for 1MCP)

### **Epic 3C: Gap Remediation** - 21 stories, ~110h, Ongoing
**Purpose:** Fix existing 324 gaps discovered in architecture audit
- Stories 3.1-3.20: Remediation work

---

## 📋 Proposed Epic 3A: Infrastructure (CRITICAL)

### **Epic Overview**

**Epic ID:** 3A
**Epic Title:** MCP Infrastructure & Prevention Foundation
**Epic Goal:** Migrate to 1MCP + Update prevention infrastructure for new architecture
**Strategic Focus:** **CRITICAL** - Unblocks all development work
**Epic Size:** 7 stories, 26 hours estimated
**Target Completion:** 3 weeks

### **Success Criteria**

1. ✅ **MCP context freed:** 323.5k → <80k tokens (240k+ freed)
2. ✅ **1MCP operational:** All 8 MCPs running via 1MCP proxy
3. ✅ **Prevention stories updated:** Stories 3.21-3.25 adapted for 1MCP mode
4. ✅ **Dual-mode support:** Validation/workflows work in both legacy and 1MCP modes
5. ✅ **Decision made:** Stay with 1MCP or migrate to Context Forge (Week 3)

### **Epic Value Proposition**

**Investment:** 26 hours (7 stories)
**Return (Immediate):** **240k+ tokens freed** (from -123k to +117k available)
**ROI:** **INFINITE** (unblocks all blocked work)

**Strategic Impact:**
- Unblocks development (currently blocked by negative context)
- Prevents rework (Prevention stories work correctly with 1MCP)
- Simplifies onboarding (8 MCP configs → 1 unified endpoint)

### **Story Breakdown**

#### **Track 0.1: MCP Migration (CRITICAL)** - 22h, Week 1-2

| Story | Title | Priority | Hours | Timeline | Impact |
|-------|-------|----------|-------|----------|--------|
| **3.26** | MCP Context Optimization - Phase 1 (1MCP) | 🔴🔴 CRITICAL | 6h | Week 1 | Free 240k tokens |
| **3.27** | POC IBM Context Forge (parallel) | 🔴 CRITICAL | 16h | Week 1-2 | Validate enterprise option |

**Decision Point:** End Week 2
- **Option A:** Stay with 1MCP (lightweight, proven)
- **Option B:** Migrate to Context Forge (enterprise features)
- **Criteria:** Performance, features, stability

#### **Track 0.2: Prevention Updates for 1MCP** - 4h, Week 3

| Story | Title | Priority | Hours | Blocks | Impact |
|-------|-------|----------|-------|--------|--------|
| **3.28** | Update Validation Script for 1MCP Dual-Mode | 🔴 High | 2h | 3.21 | Validation works in both modes |
| **3.29** | Update Registration Wizard for 1MCP Workflow | 🔴 High | 2.5h | 3.23 | Wizard uses `1mcp mcp add` |
| **3.30** | Update Integration Standards for 1MCP Mode | 🟡 Medium | 1.5h | 3.24 | Standards document both modes |
| **3.31** | Update Synthesis for 1MCP Proxy Relationships | 🟡 Medium | 1h | 3.22 | Relationships include presets |
| **3.32** | Update Quarterly Audit for 1MCP Metrics | 🟢 Low | 0.5h | 3.25 | Audit tracks 1MCP adoption |

### **Dependency Graph**

```
Week 1-2: Infrastructure (CRITICAL)
───────────────────────────────────────
Story 3.26: 1MCP Migration (6h) ⚡ CRITICAL
    │
    ├─> Story 3.27: Context Forge POC (16h, parallel)
    │
    └─> Week 2 END: Decision Point (1MCP vs Context Forge)

Week 3: Prevention Updates
───────────────────────────────────────
Story 3.26 (Completed) ✅
    │
    ├─> Story 3.28: Update Validation (2h) → blocks 3.21
    ├─> Story 3.29: Update Wizard (2.5h) → blocks 3.23
    ├─> Story 3.30: Update Standards (1.5h) → blocks 3.24
    ├─> Story 3.31: Update Synthesis (1h) → blocks 3.22
    └─> Story 3.32: Update Audit (0.5h) → blocks 3.25

Week 4+: Epic 3B (Prevention - Ready to Execute)
```

### **Sprint Allocation**

**Sprint 1 (Week 1-2): MCP Migration** - 22h
- **Day 1-3:** Story 3.26 - 1MCP Phase 1 (6h)
  - Deliverable: 1MCP operational, 240k tokens freed
- **Day 1-10:** Story 3.27 - Context Forge POC (16h, parallel)
  - Deliverable: POC validation, decision data
- **Day 10:** Decision point - 1MCP vs Context Forge

**Sprint 2 (Week 3): Prevention Updates** - 4h
- Story 3.28: Validation dual-mode (2h)
- Story 3.29: Wizard 1MCP workflow (2.5h)
- Story 3.30: Standards documentation (1.5h)
- Story 3.31: Synthesis proxy (1h)
- Story 3.32: Audit metrics (0.5h)
- Deliverable: All Prevention stories ready for Epic 3B

**Epic 3A Complete!** - Ready for Epic 3B execution

### **Epic Completion Criteria**

Epic 3A is considered **DONE** when:
1. ✅ MCP context < 80k tokens (via `/context` in Claude Code)
2. ✅ All 8 MCPs functional via 1MCP
3. ✅ Decision made: 1MCP or Context Forge (documented)
4. ✅ Stories 3.28-3.32 completed (Prevention updates)
5. ✅ Stories 3.21-3.25 verified compatible with 1MCP mode
6. ✅ No regressions in existing functionality

---

## 📋 Proposed Epic 3B: Gap Prevention

**NOTE:** This was the original "Epic 3A" in first proposal. Now renamed to 3B.

### **Epic Overview**

**Epic ID:** 3B (formerly 3A)
**Epic Title:** Architecture Gap Prevention Infrastructure
**Epic Goal:** Build automated systems to prevent architecture gaps before they occur
**Strategic Focus:** Proactive prevention through automation and standards
**Epic Size:** 5 stories, 18 hours estimated
**Target Completion:** 3 sprints (6 weeks, after Epic 3A)

**PREREQUISITE:** Epic 3A must be completed first (Stories 3.26-3.32)

### **Success Criteria**

1. ✅ Zero new tool ambiguity gaps introduced (validation catches 100%)
2. ✅ 80%+ of gaps caught at commit time (pre-commit hook operational)
3. ✅ All new MCP tools registered via guided wizard (100% adoption)
4. ✅ Agent-tool integration standards documented and followed (1MCP mode)
5. ✅ Quarterly gap audit workflow operational and producing reports

### **Epic Value Proposition**

**Investment:** 18 hours (5 stories)
**Return (Year 1):** 80-180 hours saved from prevented gaps
**ROI:** 4x-10x return on investment
**Break-even:** 3-4 months (after preventing 6-8 gaps)

### **Story Breakdown**

| Story | Title | Priority | Hours | Dependencies | Deliverable |
|-------|-------|----------|-------|--------------|-------------|
| **3.21** | Automated Tool Reference Validation (updated) | 🔴 High | 4h | 3.28 | Dual-mode validation script |
| **3.22** | Git Pre-Commit Relationship Validation (updated) | 🔴 High | 3h | 3.21, 3.31 | Pre-commit hook |
| **3.23** | MCP Tool Registration Workflow (updated) | 🟡 Medium | 5h | 3.21, 3.22, 3.29 | 1MCP wizard |
| **3.24** | Agent-Tool Integration Standards (updated) | 🟡 Medium | 3h | 3.21, 3.23, 3.30 | 1MCP standards docs |
| **3.25** | Quarterly Architecture Gap Audit (updated) | 🟢 Low | 3h | 3.21, 3.22, 3.32 | GitHub Action |
| | **TOTAL** | | **18h** | | |

### **Sprint Allocation (Post Epic 3A)**

**Sprint 1 (Week 4-5): Foundation** - 7h
- Story 3.21: Automated Validation (4h) - uses Story 3.28 updates
- Story 3.22: Pre-Commit Hook (3h) - uses Story 3.31 updates

**Sprint 2 (Week 6-7): Workflows** - 8h
- Story 3.24: Integration Standards (3h) - uses Story 3.30 updates
- Story 3.23: Registration Wizard (5h) - uses Story 3.29 updates

**Sprint 3 (Week 8): Monitoring** - 3h
- Story 3.25: Quarterly Audit (3h) - uses Story 3.32 updates

---

## 📋 Proposed Epic 3C: Architecture Gap Remediation

**NOTE:** This was "Epic 3B" in first proposal. Now renamed to 3C.

### **Epic Overview**

**Epic ID:** 3C (formerly 3B)
**Epic Title:** Architecture Gap Remediation (Existing Gaps)
**Epic Goal:** Systematically resolve 324 gaps discovered during architecture audit
**Strategic Focus:** Reactive remediation of technical debt
**Epic Size:** 21 stories, ~110 hours estimated
**Target Completion:** Ongoing (12-15 sprints), can run parallel to 3A/3B

**NOTE:** Can begin in parallel with Epic 3A/3B (no blocking dependencies)

### **Success Criteria**

1. ✅ Gap count reduced from 324 to <200 (38% reduction)
2. ✅ All CRITICAL broken references resolved (100%)
3. ✅ All HIGH priority orphaned entities integrated or deprecated (100%)
4. ✅ Framework utilities audit complete
5. ✅ All workflow definitions completed

### **Epic Value Proposition**

**Investment:** ~110 hours (21 stories)
**Return:** Clean architecture, reduced technical debt, improved framework usability
**Strategic Impact:**
- Resolves accumulated technical debt
- Unblocks agent functionality (broken references)
- Improves framework discoverability

### **Story Breakdown by Category**

*(Content same as original proposal - not repeated here for brevity)*

---

## 📊 Comparison: Original vs Revised Structure

### **Original Proposal (2-Epic Split)**

| Epic | Stories | Hours | Focus |
|------|---------|-------|-------|
| 3A: Prevention | 5 | 18h | Proactive prevention |
| 3B: Remediation | 21 | ~110h | Reactive fixes |
| **TOTAL** | **26** | **~128h** | |

**Problem:** Didn't account for 1MCP architecture change (Stories 3.26-3.27, 3.28-3.32)

### **Revised Proposal (3-Epic Split)**

| Epic | Stories | Hours | Focus | Timeline |
|------|---------|-------|-------|----------|
| 3A: Infrastructure | 7 | 26h | 1MCP + Prevention updates | Week 1-3 |
| 3B: Prevention | 5 | 18h | Automated prevention | Week 4-6 |
| 3C: Remediation | 21 | ~110h | Fix existing gaps | Ongoing |
| **TOTAL** | **33** | **~154h** | | |

**Benefits:**
- ✅ Accounts for 1MCP architecture change
- ✅ Prevents rework (Prevention stories updated BEFORE implementation)
- ✅ Clear sequencing (Infrastructure → Prevention → Remediation)
- ✅ Can run 3C in parallel (no blocking)

---

## ✅ Benefits of Revised 3-Epic Split

### **1. Critical Blocker First**
- Epic 3A unblocks development (240k tokens freed)
- No other work can proceed efficiently until this is done
- Clear priority: Infrastructure → Prevention → Remediation

### **2. Prevents Rework**
- Prevention stories (3.21-3.25) updated for 1MCP BEFORE implementation
- Original proposal would have required rewriting after 1MCP migration
- Saves ~10-15h of rework

### **3. Dual-Mode Support**
- All Prevention stories work in both legacy and 1MCP modes
- Teams can migrate gradually
- No forced migrations

### **4. Clear Sequencing**
```
Week 1-2: Epic 3A.1 (1MCP Migration) ⚡ CRITICAL
Week 3: Epic 3A.2 (Prevention Updates)
Week 4-6: Epic 3B (Prevention Implementation)
Week 1+: Epic 3C (Remediation, parallel)
```

### **5. Better Risk Management**
- Epic 3A: Small, focused, high-impact (unblock work)
- Epic 3B: Small, focused, high-ROI (prevent future gaps)
- Epic 3C: Large, ongoing, predictable (fix existing gaps)

---

## 📋 Migration Plan (Updated)

### **Phase 1: Approval** (This Week)

**Action Items:**
- [ ] Review REVISED proposal (3-epic split)
- [ ] Approve Epic 3A (Infrastructure) for IMMEDIATE execution
- [ ] Approve Stories 3.26-3.27 (already approved per STATUS-UPDATE)
- [ ] Approve Stories 3.28-3.32 (new, created today)

**Decision Point:**
- **Option A:** 3-epic split (3A Infrastructure, 3B Prevention, 3C Remediation)
- **Option B:** Keep as single Epic 3 with tracks
- **Recommendation:** Option A (clearer strategic focus)

### **Phase 2: Story Assignment** (Week 1)

**Action Items:**
- [ ] Assign Stories 3.26-3.32 to Epic 3A (Infrastructure)
- [ ] Assign Stories 3.21-3.25 to Epic 3B (Prevention)
- [ ] Assign Stories 3.1-3.20 to Epic 3C (Remediation)
- [ ] Update story metadata (epic field)
- [ ] No story ID changes needed

### **Phase 3: Documentation** (Week 1)

**Action Items:**
- [ ] Create Epic 3A definition (Infrastructure)
- [ ] Update Epic 3B definition (Prevention, formerly 3A)
- [ ] Update Epic 3C definition (Remediation, formerly 3B)
- [ ] Update EPIC-3-STATUS-UPDATE.md

### **Phase 4: Execution** (Week 1+)

**Week 1-2: Epic 3A Sprint 1 (1MCP Migration)**
- [ ] Execute Story 3.26: 1MCP Phase 1 (6h)
- [ ] Execute Story 3.27: Context Forge POC (16h, parallel)
- [ ] Decision: Stay 1MCP or migrate Context Forge

**Week 3: Epic 3A Sprint 2 (Prevention Updates)**
- [ ] Execute Stories 3.28-3.32 (4h total)
- [ ] Epic 3A COMPLETE

**Week 4+: Epic 3B Sprint 1 (Prevention)**
- [ ] Execute Stories 3.21-3.22 (7h)
- [ ] Continue Epic 3B sprints

**Week 1+: Epic 3C (Remediation, parallel)**
- [ ] Execute high-priority remediation stories
- [ ] Continue ongoing

---

## 🎯 Recommended Decision

**✅ APPROVE 3-Epic Split (Option A)**

**Rationale:**
1. Accounts for 1MCP architecture change (critical)
2. Prevents 10-15h of rework (Prevention stories)
3. Clear sequencing (Infrastructure → Prevention → Remediation)
4. Can run Epic 3C in parallel (no time lost)
5. Better stakeholder communication (3 focused epics vs 1 large epic)

**Next Steps:**
1. **Approve this REVISED proposal** (stakeholder review)
2. **Execute Epic 3A Sprint 1** (Stories 3.26-3.27, Week 1-2)
3. **Execute Epic 3A Sprint 2** (Stories 3.28-3.32, Week 3)
4. **Begin Epic 3B Sprint 1** (Stories 3.21-3.22, Week 4+)

---

## 📝 Approval Checklist

- [ ] **Product Owner** approves revised 3-epic split
- [ ] **Architect** approves 1MCP infrastructure approach (Winston)
- [ ] **Tech Lead** approves story sequencing
- [ ] **QA Lead** approves epic success criteria
- [ ] **Development Team** reviews capacity for Epic 3A
- [ ] **Stakeholders** informed of revised epic structure

---

**Proposal Owner:** Sarah (@po) + Winston (@architect)
**Review Date:** 2025-10-26 (REVISED)
**Target Decision:** Within 1 week
**Document Version:** 2.0 (REVISED for 1MCP architecture)
