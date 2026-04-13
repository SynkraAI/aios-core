# Stories Index — Squad Ecosystem Quality

**Generated:** 2026-03-12
**Last Updated:** (auto)
**Total Stories:** 7 (3 P0 + 4 P1)

---

## 🔴 P0 (CRÍTICO) — Sprint 1

Ações que bloqueiam produção. Paralelo, ~2-3 dias.

### S1.1: Negotiation — Create Phantom Files
**Story:** [`story-negotiation-create-phantom-files.md`](../../../stories/active/story-negotiation-create-phantom-files.md)
**Squad:** negotiation
**Objective:** Criar 10 arquivos faltantes que bloqueiam 8 comandos
**Esforço:** 2-4h
**Owner:** TBD
**Status:** 🟡 PENDING

**Quick AC:**
- [ ] 10 files created (phone-script, pipeline-math, frame-strategy, etc)
- [ ] config.yaml updated
- [ ] Smoke tests pass

---

### S1.2: Relationship-Therapy — Safety Vetos
**Story:** [`story-relationship-therapy-safety-vetos.md`](../../../stories/active/story-relationship-therapy-safety-vetos.md)
**Squad:** relationship-therapy
**Objective:** Implementar veto conditions para suicídio/abuso (risco de harm)
**Esforço:** 3-4h
**Owner:** TBD
**Status:** 🟡 PENDING
**Critical:** Requer consultoria de safety AI expert

**Quick AC:**
- [ ] data/safety-rules.md created with trigger patterns
- [ ] HARD_STOP vetos em 11 agents
- [ ] Log system functional
- [ ] 20+ adversarial prompts tested

---

### S1.3: Affiliates — Create 12 Workflows
**Story:** [`story-affiliates-create-workflows.md`](../../../stories/active/story-affiliates-create-workflows.md)
**Squad:** affiliates (17A, 73T)
**Objective:** 12 workflows YAML para orquestrar 73 tasks isoladas
**Esforço:** 4-6h (3 sub-sprints de 1.5h)
**Owner:** TBD
**Status:** 🟡 PENDING

**Quick AC:**
- [ ] wf-profile-build, wf-offer-validation, wf-campaign-launch, etc (12 total)
- [ ] Cada workflow: 3+ fases com veto conditions
- [ ] README updated com diagrama
- [ ] L3 score sobe para 8.5+

---

## 🟠 P1 (ALTO) — Sprint 2

Ações que degradam experiência. Paralelo, ~2-3 dias.

### S2.1: Guardrails-Tips — Implement Feedback Loop
**Story:** [`story-guardrails-implement-feedback-loop.md`](../../../stories/active/story-guardrails-implement-feedback-loop.md)
**System:** aiox-guardrails-tips-system
**Objective:** Learning system ativo (detectar quando user seguiu tip)
**Esforço:** 2-3h
**Owner:** TBD
**Status:** 🟡 PENDING

**Quick AC:**
- [ ] detectFollowedRecommendation() implementado (3+ patterns)
- [ ] History atualizada com followed: true
- [ ] Boosts calculados e aplicados
- [ ] *tips stats mostra accuracy rate

---

### S2.2: Viral-Squad — Validate MCP 21st.dev
**Story:** [`story-viral-squad-validate-mcp-21stdev.md`](../../../stories/active/story-viral-squad-validate-mcp-21stdev.md)
**Squad:** viral-squad (45A, 22W)
**Objective:** Validar integração MCP (scripts existem, não testados)
**Esforço:** 2-2.5h
**Owner:** TBD
**Status:** 🟡 PENDING
**Critical:** Requer acesso MCP 21st.dev API key

**Quick AC:**
- [ ] Environment checks pass (5/5)
- [ ] Scripts validated (3/3)
- [ ] Integration tests pass (5/5)
- [ ] Performance benchmark documentado
- [ ] CI pipeline updated

---

### S2.3: Guardrails-Tips — Create Test Suite
**Story:** [`story-guardrails-create-test-suite.md`](../../../stories/active/story-guardrails-create-test-suite.md)
**System:** aiox-guardrails-tips-system
**Objective:** 30+ unit tests (único layer Synapse sem cobertura)
**Esforço:** 3-4h
**Owner:** TBD
**Status:** 🟡 PENDING

**Quick AC:**
- [ ] 30+ tests implemented (8 grupos)
- [ ] Coverage >= 85%
- [ ] All tests pass in < 5 seconds
- [ ] CI/CD integrado

---

### S2.4: Money-Makers — Create Mind DNA
**Story:** [`story-money-makers-create-mind-dna.md`](../../../stories/active/story-money-makers-create-mind-dna.md)
**Squad:** money-makers-vtd
**Objective:** Consolidar natanael-mind-dna.md (referência quebrada)
**Esforço:** 1-1.5h
**Owner:** TBD
**Status:** 🟡 PENDING

**Quick AC:**
- [ ] natanael-mind-dna.md created (8 sections)
- [ ] 11 frameworks consolidated com [REF]
- [ ] 2+ output examples concretos
- [ ] README updated

---

## Summary

| Métrica | Value |
|---------|-------|
| Total Stories | 7 |
| P0 Stories | 3 |
| P1 Stories | 4 |
| Total Effort | 17-24.5h |
| Timeline | ~1 week |
| Teams | 7 devs |
| Critical Blockers | 2 (safety expert, MCP key) |

---

## Story Status Dashboard

```
Sprint 1 (P0):
[====                              ] S1.1 Negotiation (0%)
[====                              ] S1.2 Therapy (0%)
[====                              ] S1.3 Affiliates (0%)

Sprint 2 (P1):
[====                              ] S2.1 Feedback Loop (0%)
[====                              ] S2.2 Viral Validation (0%)
[====                              ] S2.3 Tests (0%)
[====                              ] S2.4 Mind DNA (0%)

OVERALL: [==========================] 0%
```

---

## Quick Links

**Original Sources (docs/stories/active/):**
- [`story-squad-audit-10x4.md`](../../../stories/active/story-squad-audit-10x4.md) — Original audit consolidation
- [`INDEX-SQUAD-AUDIT-ACTIONS.md`](../../../stories/active/INDEX-SQUAD-AUDIT-ACTIONS.md) — Consolidated view
- [`EPIC-squad-ecosystem-quality.md`](../../../stories/active/EPIC-squad-ecosystem-quality.md) — Master epic

**Epic Governance:**
- [`EPIC-status.md`](../../../stories/active/EPIC-status.md) — Daily status tracking

---

Generated: 2026-03-12
Last Updated: (auto-sync)
