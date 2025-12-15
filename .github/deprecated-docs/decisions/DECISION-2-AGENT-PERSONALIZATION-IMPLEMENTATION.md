# DECISION-2: Agent Personalization Implementation Strategy

**Decision ID:** DECISION-2
**Date:** 2025-01-14
**Status:** ✅ Approved
**Applies to:** Story 6.1.2 - Agent File Updates
**Authors:** Roundtable Decision (Pedro Valério, Brad Frost, Seth Godin, Dan Kennedy)

---

## 🎯 Decision

**Implement MVP rápido (YAML) → Measure → Iterate strategy for agent personalization.**

Maintain current architecture, add personality through YAML configuration with standardized output templates that ensure **familiaridade (fixed positions) + personalização (agent voice)**.

---

## 📊 Context

### Problem Statement

11 AIOS agents currently have generic personas and produce inconsistent outputs. Users want:
1. **Distinct agent personalities** (feel like talking to different experts)
2. **Consistent output structure** (know where to find information quickly)
3. **Zero loss in development velocity** (no performance degradation)
4. **WOW effect** (memorable, engaging experience)

### User Requirement (Direct Quote)

> "Familiaridade aumenta a produtividade. Quando as informações estão sempre nas mesmas posições, nosso cérebro sabe onde buscar rápido. E dentro desses espaços definidos em template, na task e nos agentes aí sim pode ter personalização."

---

## 🔬 Roundtable Analysis Summary

### Pedro Valério (Systems Architect) - MVP Velocity ✅

**Recommendation:** YAML-based automation with template slots

**Evidence:**
- Swarms manages 100+ agents with YAML configs (production scale)
- Home Assistant has 50,000+ automations via YAML
- Microsoft engineer documented: "Separating agent definitions from codebase streamlines management"

**Implementation:**
```yaml
persona_profile:
  archetype: Builder
  communication:
    tone: pragmatic
    vocabulary: [construir, implementar, refatorar]
```

**Outcome:** 2-day MVP, full automation, zero manual configuration

---

### Brad Frost (Atomic Design) - Long-term Sustainability ✅

**Recommendation:** Atomic component patterns for outputs

**Evidence:**
- CFPB Design System: 100+ communication patterns across 50+ agents using atomic components
- Uniform case study: Component patterns allow variations without code
- OpenReplay: Atomic design increases maintainability

**Implementation:**
- Fixed output structure (header → status → output → metrics)
- Personality slots within structure
- Pattern validation to prevent drift

**Outcome:** Initial 2-week setup, then infinite scalability

---

### Seth Godin (Brand Identity) - Emotional Connection ✅

**Recommendation:** Brand promise-driven personality

**Evidence:**
- Jotform: +35% user satisfaction after chatbot personalization
- arXiv Research (2025): Emotion-aware agents show distinct engagement improvements
- MetaDesign: "Brand personalities enable intuitive behavior recognition"

**Implementation:**
- Each agent has 1-line brand promise
- Vocabulary restricted by archetype
- Emotional signature in all outputs

**Outcome:** Measurable user satisfaction increase, stronger agent identity

---

### Dan Kennedy (Pragmatic ROI) - Metrics-Driven Validation ✅

**Recommendation:** Phased rollout with baseline measurement

**Evidence:**
- Full Scale: $2.3M failures when optimizing wrong metrics
- DORA: Teams that measure outcomes 2.5x more likely to be high performers
- GetDX: Core 4 metrics predict performance

**Implementation:**
- Week 1: MVP (YAML)
- Week 2: Measure baseline
- Week 3: A/B test personality vs generic
- Week 4: GO/NO-GO decision based on data

**Outcome:** Data-driven decision, risk mitigation, ROI validation

---

## ✅ Final Decision Rationale

### Why This Approach Wins

1. **Fast to market** (Pedro) - 2-day MVP vs weeks of component library setup
2. **Sustainable** (Brad) - Standardized structure prevents drift
3. **Engaging** (Seth) - Real personality creates emotional connection
4. **Measurable** (Dan) - Clear success metrics and validation

### Consensus Statement

All 4 experts agreed:

> **"Structure is sacred. Tone is flexible."**
>
> - **Fixed:** Section order, metric positions, template structure
> - **Flexible:** Status messages, vocabulary, emoji selection

---

## 📐 Implementation Architecture

### Three-Layer System

```
┌─────────────────────────────────────┐
│   LAYER 1: Agent Persona Config     │  ← YAML in agent files
│   (.aios-core/agents/*.md)          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   LAYER 2: Output Formatter         │  ← Template engine
│   (.aios-core/scripts/)             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   LAYER 3: Standardized Output      │  ← Fixed structure + personalized tone
│   (Tasks, Templates, Checklists)    │
└─────────────────────────────────────┘
```

### Agent File Structure (NEW)

```yaml
agent:
  name: Dex                    # Human name
  id: dev                      # System ID (unchanged)

persona_profile:               # NEW SECTION
  archetype: Builder
  zodiac: ♒ Aquarius

  communication:
    tone: pragmatic
    emoji_frequency: medium
    vocabulary: [construir, implementar, refatorar]

    greeting_levels:
      minimal: "💻 dev Agent ready"
      named: "💻 Dex (Builder) ready. Let's build!"
      archetypal: "💻 Dex the Builder (♒ Aquarius) ready to innovate!"

    signature_closing: "— Dex, sempre construindo 🔨"
```

### Output Template (FIXED STRUCTURE)

```markdown
## 📊 Task Execution Report

**Agent:** Dex (Builder)
**Task:** develop-story
**Started:** 2025-01-14T10:30:00Z
**Completed:** 2025-01-14T10:32:23Z
**Duration:** 2.3s                      ← ALWAYS LINE 6 (familiaridade)
**Tokens Used:** 1,801 total            ← ALWAYS LINE 7 (familiaridade)

---

### Status
✅ Tá pronto! Implementei com sucesso.  ← PERSONALITY SLOT (personalização)

### Output
{Task-specific content}

### Metrics                              ← ALWAYS LAST (familiaridade)
- Tests: 12/12
- Coverage: 87%
- Linting: ✅ Clean

---
— Dex, sempre construindo 🔨            ← PERSONALITY SLOT (personalização)
```

---

## 📊 Success Metrics

### Must Have (MVP Phase 1)

| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|-------------------|
| Agent files updated | 0/11 | 11/11 | File count |
| Output structure compliance | N/A | 100% | Pattern validation |
| Backward compatibility | N/A | 100% | Regression tests |

### Should Have (Phase 2)

| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|-------------------|
| User comprehension speed | TBD | +8% | A/B testing |
| Token overhead | N/A | <15% | Token tracking |
| Task completion time | TBD | Same or better | Duration tracking |

### Nice to Have (Phase 3)

| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|-------------------|
| User satisfaction | TBD | +12% | Survey (1-5 scale) |
| Agent recognition | N/A | 80% | Blind test |
| Personality consistency | N/A | 95% | Vocabulary analysis |

---

## 📅 Implementation Phases

### Phase 1: MVP Implementation (Day 1-2) - $200

**Deliverables:**
- [ ] Add `persona_profile` section to 11 agent files
- [ ] Define vocabulary + tone + greetings for each
- [ ] Rename files: db-sage → data-engineer, github-devops → devops
- [ ] Merge aios-developer + aios-orchestrator → aios-master

**Success Criteria:**
- All 11 agents have valid YAML persona config
- Pattern validation script passes
- No breaking changes to existing workflows

---

### Phase 2: Output Formatter (Day 2-3) - $100

**Deliverables:**
- [ ] Create `output-formatter.js` script
- [ ] Create `validate-output-pattern.js` validator
- [ ] Create `task-execution-report.md` template
- [ ] Unit tests for formatter
- [ ] Integration with 1 task (develop-story)

**Success Criteria:**
- Formatter generates valid outputs for all agents
- Validation catches malformed outputs
- At least 1 task uses new format

---

### Phase 3: Baseline Measurement (Day 3-4) - $100

**Deliverables:**
- [ ] Measure user comprehension speed (current state)
- [ ] Track token usage per task execution
- [ ] Conduct user satisfaction survey
- [ ] A/B test: generic vs personalized output

**Success Criteria:**
- Baseline metrics established
- Can measure delta between old/new
- Dashboard shows real-time metrics

---

### Phase 4: GO/NO-GO Decision (Day 5) - $100

**Criteria:**

✅ **GO** if:
- User comprehension speed +8% OR
- User satisfaction +12% AND
- Token overhead <15%

❌ **NO-GO** if:
- No measurable improvement AND
- Token overhead >15%

**Actions on GO:**
- Migrate all remaining tasks to new format
- Update all templates and checklists
- Create aios-master task to maintain consistency

**Actions on NO-GO:**
- Rollback to generic agents
- Document learnings
- Revisit in 3 months with refined approach

---

## 🎨 Personality Configuration

### 11 Agent Personas (Story 6.1.2)

| Agent ID | Name | Archetype | Zodiac | Tone | Primary Verbs |
|----------|------|-----------|--------|------|---------------|
| dev | Dex | Builder | ♒ Aquarius | pragmatic | construir, implementar, refatorar |
| qa | Quinn | Guardian | ♍ Virgo | analytical | validar, verificar, garantir |
| po | Pax | Balancer | ♎ Libra | collaborative | equilibrar, harmonizar, priorizar |
| pm | Morgan | Visionary | ♐ Sagittarius | strategic | planejar, estrategizar, projetar |
| sm | River | Flow Master | ♊ Gemini | adaptive | adaptar, pivotar, ajustar |
| architect | Aria | Architect | ♑ Capricorn | structured | arquitetar, estruturar, organizar |
| analyst | Atlas | Explorer | ♉ Taurus | methodical | explorar, analisar, investigar |
| ux-design-expert | Uma | Empathizer | ♓ Pisces | empathetic | empatizar, compreender, facilitar |
| data-engineer | Dara | Engineer | ♉ Taurus | technical | otimizar, modelar, integrar |
| devops | Gage | Operator | ♈ Aries | decisive | deployar, automatizar, monitorar |
| aios-master | Orion | Orchestrator | ♌ Leo | commanding | orquestrar, coordenar, liderar |

### Archetype Vocabulary Reference

Defined in `.aios-core/data/archetype-vocabulary.yaml`:

```yaml
archetypes:
  Builder:
    primary_verbs: [construir, implementar, refatorar, resolver, otimizar]
    avoid_words: [talvez, possivelmente, acho que]
    emoji_palette: [⚡, 🔨, 🏗️, ✅, 🔧]

  Guardian:
    primary_verbs: [validar, verificar, proteger, garantir, auditar]
    avoid_words: [aproximadamente, parece, creio]
    emoji_palette: [✅, 🛡️, 🔍, ⚠️, 📋]

  Balancer:
    primary_verbs: [equilibrar, harmonizar, mediar, alinhar, integrar]
    avoid_words: [sempre, nunca, impossível]
    emoji_palette: [⚖️, 🤝, 📊, ✨, 🎯]
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ Breaking Familiaridade

**DON'T:**
```markdown
Dex: Duration was 2.3s
Tokens: 1,234
### Output        ← Wrong order
### Status        ← Should be before Output
```

**DO:**
```markdown
**Duration:** 2.3s      ← Fixed position (line 6)
**Tokens:** 1,234       ← Fixed position (line 7)
### Status              ← Always before Output
### Output
### Metrics             ← Always last
```

### ❌ Over-Personalizing Structure

**DON'T:**
```yaml
dex_format: "Status: {status} | Dur: {dur}"
quinn_format: "Result → {status} (took {dur})"
```

**DO:**
```yaml
all_agents_structure: "**Duration:** {dur}"  # Fixed
dex_tone: "✅ Tá pronto!"                    # Personalized
quinn_tone: "✅ Validado."                   # Personalized
```

### ❌ Vocabulary Drift

**DON'T:**
```javascript
dex: "completed successfully"  // Generic
quinn: "got it done"           // Informal
```

**DO:**
```javascript
dex: "construir"   // From Builder vocabulary
quinn: "validar"   // From Guardian vocabulary
```

---

## 📚 Documentation Created

| Document | Purpose | Location |
|----------|---------|----------|
| **AGENT-PERSONALIZATION-STANDARD-V1.md** | Complete implementation guide | `docs/standards/` |
| **personalized-agent-template.md** | Agent file template | `.aios-core/templates/` |
| **personalized-task-template.md** | Task file template | `.aios-core/templates/` |
| **personalized-checklist-template.md** | Checklist template | `.aios-core/templates/` |
| **personalized-template-file.yaml** | Template file structure | `.aios-core/templates/` |
| **personalized-workflow-template.yaml** | Workflow file structure | `.aios-core/templates/` |

---

## 🔄 Future Enhancements (Post-MVP)

### Story 6.1.3: Advanced Features

- [ ] Dynamic personality adjustment based on context
- [ ] Multi-language support (EN, PT-BR, ES)
- [ ] Voice mode integration (audio greetings)
- [ ] Visual customization (avatar selection)

### Story 6.1.4: Analytics Dashboard

- [ ] Real-time personality consistency monitoring
- [ ] User satisfaction tracking per agent
- [ ] Token usage analytics by agent
- [ ] A/B testing framework

### Story 6.1.5: AIOS-Master Integration

- [ ] Auto-generate new agents with personality
- [ ] Maintain consistency across expansion packs
- [ ] Validate personality compliance pre-commit

---

## 💰 Investment & ROI

### Total Investment: $500 (5 days)

| Phase | Days | Cost |
|-------|------|------|
| Phase 1: MVP | 2 | $200 |
| Phase 2: Formatter | 1 | $100 |
| Phase 3: Metrics | 1 | $100 |
| Phase 4: Decision | 1 | $100 |
| **Total** | **5** | **$500** |

### Expected ROI

**Conservative scenario (+8% comprehension):**
- User saves 5 seconds per task output review
- 100 tasks/week = 500 seconds saved
- $50/hour developer rate = $7/week savings
- Breakeven: 71 weeks

**Optimistic scenario (+15% satisfaction):**
- Improved retention (hard to quantify)
- Faster onboarding for new team members
- Stronger brand identity ("WOW effect")
- Breakeven: 30 days (estimated)

---

## ✅ Approval

**Approved by:** Roundtable Consensus (Pedro Valério, Brad Frost, Seth Godin, Dan Kennedy)

**Rationale:**
1. ✅ Evidence-based (real case studies, not opinions)
2. ✅ Fast to market (2-day MVP)
3. ✅ Low risk (phased rollout with measurement)
4. ✅ High value (familiaridade + personalização)
5. ✅ Scalable (template-based automation)

**Next Steps:**
1. Begin Phase 1: Update 11 agent files
2. Create output formatter
3. Measure baseline
4. Execute GO/NO-GO decision

---

**Decision Date:** 2025-01-14
**Effective Date:** Immediate (Story 6.1.2)
**Review Date:** After Phase 4 completion
**Related:** Story 6.1.2, Epic 6.1, DECISION-1 (PT-BR Localization)
