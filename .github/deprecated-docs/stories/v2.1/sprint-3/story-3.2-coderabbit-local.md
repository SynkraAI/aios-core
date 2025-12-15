# STORY 3.2: CodeRabbit Local Extension

**ID:** 3.2 | **Epic:** [EPIC-S3](../../../epics/epic-s3-quality-templates.md)
**Sprint:** 3 | **Points:** 0 | **Priority:** ⚫ N/A | **Created:** 2025-01-19
**Updated:** 2025-12-01
**Status:** ❌ Cancelled

**Reference:** [Quality Gates Decision 4](../../../audits/PEDRO-DECISION-LOG.md#decisão-4)

**Predecessor:** Story 1.4 (IDE Selection) ✅

---

## ⚠️ CANCELLATION NOTICE

> **Status:** CANCELLED - Superseded by CLI + GitHub App Architecture
>
> **Decision Date:** 2025-12-01
> **Decision By:** Pax (@po)
>
> ### Reason for Cancellation
>
> This story was created with the assumption that CodeRabbit IDE extensions would be the primary integration method. However, the architecture evolved to use a more powerful dual-mode approach:
>
> | Original Plan | Adopted Architecture |
> |---------------|---------------------|
> | IDE Extensions (per-IDE setup) | **CodeRabbit CLI** (IDE-agnostic) |
> | Manual feedback in IDE | **Self-healing loops** with @qa/@devops agents |
> | 6 separate setup guides | **Single WSL setup** works everywhere |
> | Installer IDE detection | **Not needed** - CLI works universally |
>
> ### What Was Implemented Instead
>
> 1. **CodeRabbit CLI** - Installed in WSL (`~/.local/bin/coderabbit`)
> 2. **CodeRabbit GitHub App** - Installed on repository ✅
> 3. **.coderabbit.yaml** - Full configuration with path_instructions
> 4. **Documentation** - 5 comprehensive guides in `docs/guides/coderabbit/`
> 5. **Agent Integration** - @qa and @devops agents with self-healing workflows
>
> ### References
>
> - [CodeRabbit Integration Guide](../../../guides/coderabbit/coderabbit-integration-guide.md)
> - [CodeRabbit Workflows](../../../guides/coderabbit/coderabbit-workflows.md)
> - [CodeRabbit Configuration](../../../guides/coderabbit/coderabbit-configuration-reference.md)
> - Story 3.1 (Pre-Commit Hooks) - ✅ Completed

---

## Original User Story (Historical)

**Como** developer, **Quero** CodeRabbit local na IDE, **Para** feedback imediato durante coding

---

## Original Acceptance Criteria (Not Implemented)

### IDE Support
- [x] ~~AC3.2.1: Cursor IDE setup guide created~~ → Superseded by CLI
- [x] ~~AC3.2.2: Windsurf IDE setup guide created~~ → Superseded by CLI
- [x] ~~AC3.2.3: Trae IDE setup guide created~~ → Superseded by CLI
- [x] ~~AC3.2.4: Zed IDE setup guide created~~ → Superseded by CLI
- [x] ~~AC3.2.5: Antigravity IDE setup guide created~~ → Superseded by CLI
- [x] ~~AC3.2.6: Continue.dev setup guide created~~ → Superseded by CLI

### Integration
- [x] ~~AC3.2.7: Extension detection in installer~~ → Not needed
- [x] ~~AC3.2.8: Auto-recommendation based on detected IDE~~ → Not needed
- [x] ~~AC3.2.9: Installation link provided per IDE~~ → Not needed

### Documentation
- [x] AC3.2.10: Central setup documentation page → ✅ `docs/guides/coderabbit/README.md`

---

## Original Scope (Historical)

### IDE Extension Integration

| IDE | Extension Status | Auto-Install |
|-----|-----------------|--------------|
| Cursor | CodeRabbit extension | Manual |
| Windsurf | CodeRabbit extension | Manual |
| Trae | CodeRabbit extension | Manual |
| Zed | CodeRabbit extension | Manual |
| Antigravity | CodeRabbit extension | Manual |
| Continue.dev | CodeRabbit extension | Manual |

### Installer Integration Flow
1. Detect IDE installed
2. Recommend CodeRabbit extension
3. Provide installation link
4. (Optional) Auto-install if IDE supports CLI

---

## Tasks

### Research (3h)
- [ ] 3.2.1: Research CodeRabbit IDE extensions availability

### Documentation (4h)
- [ ] 3.2.2: Create setup guide per IDE (6 IDEs)

### Testing (6h)
- [ ] 3.2.3: Test in Cursor
- [ ] 3.2.4: Test in Windsurf
- [ ] 3.2.5: Test in Trae
- [ ] 3.2.6: Test in Zed
- [ ] 3.2.7: Test in Antigravity
- [ ] 3.2.8: Test in Continue.dev

### Finalization (2h)
- [ ] 3.2.9: Document setup process

**Total Estimated:** 15h (~2 days)

---

## Smoke Tests (IDE-01 to IDE-04)

| Test ID | Name | Description | Priority | Pass Criteria |
|---------|------|-------------|----------|---------------|
| IDE-01 | Extension Exists | CodeRabbit available for each IDE | P0 | Link works |
| IDE-02 | Setup Guide | Documentation complete per IDE | P0 | Steps clear |
| IDE-03 | Detection | Installer detects IDE | P1 | Correct IDE shown |
| IDE-04 | Recommendation | Extension recommended | P1 | Link displayed |

---

## Dependencies

**Depends on:**
- Story 1.4 (IDE Selection) ✅

**Blocks:**
- None (can run parallel with 3.1)

**Parallel with:**
- Story 3.1 (Pre-Commit Hooks)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Setup guides for 6 IDEs created
- [ ] Installer integration working
- [ ] IDE-01 to IDE-04 tests pass
- [ ] Documentation published
- [ ] QA Review passed
- [ ] PR created and approved

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-19 | 1.0 | Story created (combined file) | River |
| 2025-12-01 | 2.0 | Separated into individual story file | Pax (@po) |
| 2025-12-01 | 3.0 | **CANCELLED** - Superseded by CLI + GitHub App architecture | Pax (@po) |

---

**Created by:** River 🌊
**Separated by:** Pax 🎯 (PO)
**Cancelled by:** Pax 🎯 (PO) - 2025-12-01
