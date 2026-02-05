# AIOS v2.0 Memory System Viability Assessment

**Investigation Story:** Memory & Self-Improvement Systems
**Deliverable:** D4 - Final Report
**Author:** @analyst (Atlas)
**Reviewer:** @architect (Aria)
**Date:** 2026-02-04
**Status:** Complete - APPROVED ✅

---

## Executive Summary

Esta investigação analisou o sistema de memória do ClawdBot, o PRD AIOS v2.0 "Projeto Bob", e o ecossistema open source para determinar a viabilidade de implementar capacidades avançadas de memória e auto-melhoria no AIOS.

### Verdict: VIÁVEL ✅

A implementação é viável e recomendada, com os seguintes pontos-chave:

| Aspecto | Assessment |
|---------|------------|
| Technical Feasibility | ✅ Alta - Stack compatível |
| Strategic Value | ✅ Alta - Diferenciador de mercado |
| Implementation Risk | ⚠️ Média - Complexidade moderada |
| ROI | ✅ Alta - Learning agents |

### Key Recommendations

1. **Absorver** Three-Layer Memory Architecture do ClawdBot
2. **Absorver** Unified Memory Schema para Epic 7
3. **Implementar** Memory Flush como feature de agentes
4. **Adotar** patterns de Mem0 para ranking inteligente
5. **Considerar** MCP exposure para interoperabilidade futura

---

## 1. Context: What We Investigated

### 1.1 ClawdBot Reference (9 arquivos)

Sistema de memória pessoal para Claude Code com:
- Three-Layer Memory (Entity + Daily + Persistent)
- Memory Flush com Observation Masking
- Unified Memory Schema (PostgreSQL + pgvector)
- Session Traces para self-improvement

**Análise completa:** [D1 - ClawdBot Analysis](./clawdbot-analysis.md)

### 1.2 AIOS v2.0 PRD "Projeto Bob"

PRD atual com gaps identificados em:
- Persistência de memória entre sessões
- Aprendizado de agentes
- Contexto acumulado (Epic Context)

**Análise completa:** [D2 - Gap Analysis](./memory-gap-analysis.md)

### 1.3 Open Source Landscape

10+ projetos analisados:
- **Mem0** (37k stars) - líder de mercado
- **Letta/MemGPT** (15k stars) - self-editing memory
- **Graphiti** - knowledge graph specialist
- **OpenMemory** - MCP native

**Análise completa:** [D3 - OSS Landscape](./memory-oss-landscape.md)

---

## 2. Strategic Questions Answered

### Q1: O ClawdBot é open source?

**Parcialmente.** A skill `knowledge-graph` é open source (Apache 2.0), mas o sistema completo (SOUL, USER, AGENTS) são templates proprietários para customização pessoal. **Conclusão:** Podemos absorver patterns, não copiar diretamente.

### Q2: O schema de memória do ClawdBot é compatível com Supabase existente do AIOS?

**Sim.** O schema usa PostgreSQL padrão com pgvector, que já está no stack do AIOS. As tabelas `unified_memories`, `memory_relations`, e `session_traces` podem ser adicionadas sem conflito.

### Q3: O Three-Layer Memory System faz sentido para CLI-first?

**Sim.** O modelo é file-based por design (Layer 1 = files, Layer 2 = daily logs), perfeitamente alinhado com CLI-first. A Layer 3 pode ser automatizada via Memory Flush.

### Q4: Memory Flush + Observation Masking é aplicável ao Claude Code context?

**Sim, diretamente.** O Memory Flush foi projetado especificamente para Claude Code pre-compaction. O Observation Masking é técnica de prompt que pode ser incorporada em qualquer agente.

### Q5: Heartbeat system é relevante para AIOS?

**Parcialmente.** O conceito de polling para background tasks alinha com AIOS Ops (PRD §7.5), mas a implementação assume single-user. Para AIOS, um sistema de cron jobs por projeto seria mais adequado. **Recomendação:** Roadmap futuro, não MVP.

---

## 3. Feature Prioritization (MoSCoW)

### Must Have (🔴 Critical for Epic 7)

| Feature | Source | Complexity | Dependencies |
|---------|--------|------------|--------------|
| Unified Memory Schema | ClawdBot | M | Supabase migration |
| Three-Layer Architecture | ClawdBot | L | None |
| Memory Flush Task | ClawdBot | M | Schema ready |
| USER.md Structure | ClawdBot | S | Epic 10 |

**Total Complexity:** Medium
**Estimated Stories:** 4-6

### Should Have (🟡 Important for Quality)

| Feature | Source | Complexity | Dependencies |
|---------|--------|------------|--------------|
| Observation Masking | ClawdBot | S | Agent prompts |
| Fact Schema (JSONL) | ClawdBot | S | File conventions |
| memory_relations Table | ClawdBot | M | Schema ready |
| Priority-Based Extraction | ClawdBot | M | Memory Flush |
| Intelligent Ranking | Mem0 | L | Embeddings |

**Total Complexity:** Medium-High
**Estimated Stories:** 5-8

### Could Have (🟢 Nice-to-Have for Future)

| Feature | Source | Complexity | Dependencies |
|---------|--------|------------|--------------|
| Session Traces | ClawdBot | M | Schema ready |
| Weekly Synthesis Cron | ClawdBot | M | Memory Flush |
| Cost Tracking per Session | ClawdBot | S | Traces ready |
| Self-Editing Memory | Letta | XL | Agent redesign |
| MCP Memory Server | OpenMemory | L | MCP expertise |

**Total Complexity:** High
**Estimated Stories:** 8-12

### Won't Have (🔵 Out of Scope for Now)

| Feature | Source | Reason |
|---------|--------|--------|
| Heartbeat System | ClawdBot | AIOS Ops roadmap, not MVP |
| Group Chat Rules | ClawdBot | AIOS is CLI, not chat |
| Personal MEMORY.md | ClawdBot | Project-scoped, not personal |
| Full Letta Integration | Letta | Too opinionated |
| Azure-native Features | AutoGen | Vendor lock-in |

---

## 4. Complexity Assessment

### 4.1 Small (S) - 1-2 days

- USER.md structure template
- Observation Masking prompts
- Fact Schema documentation
- Basic file conventions

### 4.2 Medium (M) - 3-5 days

- Unified Memory Schema migration
- Memory Flush task implementation
- memory_relations table
- Priority-Based Extraction
- Session Traces basic

### 4.3 Large (L) - 1-2 weeks

- Three-Layer Architecture full
- Intelligent Ranking (Mem0-style)
- MCP Memory Server

### 4.4 Extra Large (XL) - 2+ weeks

- Self-Editing Memory (Letta-style)
- Full self-improvement loop
- Multi-agent memory coordination

---

## 5. Dependency Map

```
Epic 7: Memory Layer
│
├── Phase 1: Foundation (Must Have)
│   ├── Story 7.1: Unified Memory Schema
│   │   └── Dependencies: Supabase access
│   │
│   ├── Story 7.2: Three-Layer File Structure
│   │   └── Dependencies: None
│   │
│   ├── Story 7.3: Memory Flush Task
│   │   └── Dependencies: 7.1, 7.2
│   │
│   └── Story 7.4: Agent Memory Integration
│       └── Dependencies: 7.3
│
├── Phase 2: Enhancement (Should Have)
│   ├── Story 7.5: Observation Masking
│   │   └── Dependencies: 7.4
│   │
│   ├── Story 7.6: memory_relations
│   │   └── Dependencies: 7.1
│   │
│   ├── Story 7.7: Priority Extraction
│   │   └── Dependencies: 7.3
│   │
│   └── Story 7.8: Intelligent Ranking
│       └── Dependencies: 7.1, pgvector
│
└── Phase 3: Advanced (Could Have)
    ├── Story 7.9: Session Traces
    │   └── Dependencies: 7.1
    │
    ├── Story 7.10: Weekly Synthesis
    │   └── Dependencies: 7.3, 7.7
    │
    └── Story 7.11: Cost Tracking
        └── Dependencies: 7.9

Epic 10: User Profile System
│
└── Story 10.x: USER.md Structure
    └── Dependencies: Epic 7 foundation
```

---

## 6. Risk Analysis

### 6.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Schema migration breaks existing data | Low | High | Backup + rollback plan |
| Memory Flush consumes too many tokens | Medium | Medium | Observation Masking |
| pgvector performance at scale | Low | Medium | Index tuning, caching |
| Multi-agent memory conflicts | Medium | Medium | Locking strategy |

### 6.2 Implementation Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scope creep (adding too much) | High | High | Strict MoSCoW enforcement |
| Over-engineering | Medium | Medium | Start simple, iterate |
| Integration with existing agents | Medium | Medium | Phased rollout |

### 6.3 Strategic Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Mem0 becomes dominant standard | Medium | Low | Abstract interface |
| Claude Code adds native memory | Medium | Medium | Differentiate on process |
| Users don't adopt | Low | High | Clear value proposition |

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Epic 7, Sprint 1-2)

```
Week 1-2:
├── Day 1-2: Unified Memory Schema (7.1)
│   └── @data-engineer: Create tables, indexes, functions
│
├── Day 3-4: Three-Layer File Structure (7.2)
│   └── @architect: Define conventions, templates
│
├── Day 5-7: Memory Flush Task (7.3)
│   └── @dev: Implement extraction logic
│
└── Day 8-10: Agent Integration (7.4)
    └── @dev: Connect to all agents
```

### Phase 2: Enhancement (Epic 7, Sprint 3-4)

```
Week 3-4:
├── Observation Masking (7.5)
├── memory_relations (7.6)
├── Priority Extraction (7.7)
└── Intelligent Ranking (7.8)
```

### Phase 3: Polish (Epic 7, Sprint 5)

```
Week 5:
├── Session Traces (7.9)
├── Documentation
└── Testing & Optimization
```

### Phase 4: Future (Post-Epic 7)

```
Future Sprints:
├── Weekly Synthesis Cron
├── Cost Tracking
├── Self-Editing Memory (experimental)
└── MCP Memory Server
```

---

## 8. Success Metrics

### 8.1 Technical Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Memory persistence rate | 0% | 95%+ | Sessions with saved memory |
| Context recall accuracy | N/A | 80%+ | Retrieval relevance |
| Token efficiency | Baseline | -30% | Observation Masking effect |
| Memory Flush success | N/A | 90%+ | Extraction completion |

### 8.2 User Experience Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| "Agent remembered" occurrences | 0 | 5+/session | User feedback |
| Context switch friction | High | Low | Qualitative |
| Learning curve | N/A | <1 day | Time to productive use |

### 8.3 Business Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Feature differentiation | Low | High | Competitor comparison |
| User retention | Baseline | +20% | Usage analytics |
| Support tickets (memory-related) | N/A | Low | Ticket volume |

---

## 9. Architectural Decision Records

### ADR-001: Adopt Hybrid Storage (Files + Database)

**Status:** SUPERSEDED by ADR-001-LOCAL ✅

**Context:** ClawdBot uses files as primary storage with DB sync. Mem0 uses pure DB. AIOS needs to decide.

**Decision:** Adopt hybrid approach:
- Files for daily logs and facts (audit trail, git-trackable)
- Database for search, embeddings, relations

**Rationale:**
- CLI-first alignment (files are native)
- Best of both worlds (search + portability)
- Matches ClawdBot proven pattern

> **UPDATE 2026-02-04:** Superseded by [ADR-001-LOCAL](./aios-v2-memory-local-architecture.md)
> Decision refined to use **SQLite + sqlite-vec** instead of Supabase for 100% local, hermetic operation.

---

### ADR-002: Implement Observation Masking in Prompts

**Status:** APPROVED ✅

**Context:** Observation Masking can be implemented as:
- (A) Prompt instruction
- (B) Code-based filtering
- (C) Hybrid

**Decision:** Start with (A) Prompt instruction, evolve to (C) Hybrid.

**Rationale:**
- Fastest to implement
- Zero infrastructure change
- Can measure effectiveness before investing in code

---

### ADR-003: Use ClawdBot Schema as Foundation

**Status:** APPROVED ✅ (with modification)

**Context:** We could design from scratch, adopt Mem0 schema, or adopt ClawdBot schema.

**Decision:** Adopt ClawdBot schema with AIOS namespace:
- `unified_memories` → `aios_memories`
- `memory_relations` → `aios_memory_relations`
- `session_traces` → `aios_session_traces`

**Rationale:**
- Already designed for Claude Code
- pgvector compatible
- Proven in production
- Includes session_traces for future self-improvement
- **Architect note:** Renaming avoids future conflicts and maintains AIOS identity

---

## 10. Conclusion

### The Bottom Line

O AIOS pode e deve implementar capacidades avançadas de memória baseadas nos patterns do ClawdBot e melhores práticas do ecossistema open source.

### Why Now

1. **Gap crítico:** Agentes AIOS não aprendem entre sessões
2. **Competitive advantage:** Poucos frameworks têm memory layer maduro
3. **Foundation ready:** Supabase + pgvector já no stack
4. **Reference available:** ClawdBot provides battle-tested design

### What to Do Next

1. **@architect:** Review this report, approve/modify ADRs
2. **@po:** Create stories for Epic 7 based on Phase 1
3. **@data-engineer:** Prepare schema migration plan
4. **@dev:** Prototype Memory Flush task

### Final Recommendation

**Proceed with implementation** of Must Have features in Epic 7, following the phased roadmap. Start with foundation (schema + structure), iterate based on feedback, and defer advanced features (self-editing, MCP server) for future phases.

---

## Appendix A: File Deliverables

| # | Deliverable | Location | Status |
|---|-------------|----------|--------|
| D1 | ClawdBot Analysis | [clawdbot-analysis.md](./clawdbot-analysis.md) | ✅ Complete |
| D2 | Gap Analysis | [memory-gap-analysis.md](./memory-gap-analysis.md) | ✅ Complete |
| D3 | OSS Landscape | [memory-oss-landscape.md](./memory-oss-landscape.md) | ✅ Complete |
| D4 | Viability Report | This document | ✅ Complete |

---

## Appendix B: References

### Internal Documents
- PRD AIOS v2.0 Bob: `docs/prd/aios-v2-bob.md`
- ClawdBot Reference: `docs/prd/aios-v3-super-bob/referencia-clawdbot/`

### External Sources
- [Mem0 GitHub](https://github.com/mem0ai/mem0)
- [Letta GitHub](https://github.com/letta-ai/letta)
- [Graphiti GitHub](https://github.com/getzep/graphiti)
- [OpenMemory GitHub](https://github.com/CaviraOSS/OpenMemory)
- [Mem0 Research Paper](https://mem0.ai/research)
- [MemGPT Paper (UC Berkeley)](https://arxiv.org/abs/2310.08560)

---

*Investigation completed by @analyst (Atlas) | 2026-02-04*
*Reviewed and APPROVED by @architect (Aria) | 2026-02-04*

— Atlas, investigando a verdade 🔎
