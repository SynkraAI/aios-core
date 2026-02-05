# ClawdBot Memory System Analysis

**Investigation Story:** Memory & Self-Improvement Systems
**Deliverable:** D1 - ClawdBot Analysis
**Author:** @analyst (Atlas)
**Date:** 2026-02-04
**Status:** Complete

---

## 1. Executive Summary

O ClawdBot implementa um sistema sofisticado de memória e auto-melhoria para Claude Code, baseado em uma arquitetura de **três camadas (Three-Layer Memory)** com persistência em arquivos e banco de dados. O sistema foi projetado para um contexto pessoal (personal assistant), mas possui conceitos transferíveis para o AIOS.

### Key Findings

| Aspecto | Avaliação |
|---------|-----------|
| Sofisticação | ⭐⭐⭐⭐⭐ Muito alta |
| Documentação | ⭐⭐⭐⭐ Boa |
| Reusabilidade | ⭐⭐⭐ Média (contexto diferente) |
| Compatibilidade AIOS | ⭐⭐⭐ Média (adaptações necessárias) |

---

## 2. Mapa Conceitual dos 9 Arquivos

```
ClawdBot Memory Architecture
│
├── IDENTITY LAYER (Who)
│   ├── SOUL.md ─────────────────► AI persona, princípios, boundaries
│   └── USER.md ─────────────────► Human profile, preferências, contexto
│
├── WORKSPACE LAYER (How)
│   └── AGENTS.md ───────────────► Regras operacionais, heartbeat, decision tree
│
├── MEMORY LAYER (What)
│   ├── Memória de Longo Prazo ──► Entidades persistentes (empresas, time, stack)
│   ├── Life - Knowledge Graph ──► Three-layer architecture spec
│   └── skill_KnowledgeGraph ────► Implementação: facts.jsonl, synthesis, cron
│
├── EXTRACTION LAYER (When)
│   ├── Memory Flush V1 ─────────► Session digest básico
│   └── Memory Flush V2 ─────────► Observation masking + Supabase sync
│
└── STORAGE LAYER (Where)
    └── Unified Memory Schema ───► PostgreSQL + pgvector + relations
```

---

## 3. Análise Detalhada por Arquivo

### 3.1 SOUL.md — Identidade do AI

**Propósito:** Define a persona, princípios e boundaries do assistente.

**Conceitos Chave:**
- "Be genuinely helpful, not performatively helpful"
- "Conciseness is King" - Progressive disclosure
- "Have opinions" - Personalidade não-genérica
- "Be resourceful before asking"
- "Remember you're a guest" - Ética de acesso

**Pattern Identificado:**
```yaml
ai_identity:
  core_truths: [lista de princípios inegociáveis]
  boundaries: [o que NÃO fazer]
  vibe: [tom de comunicação]
  continuity: "Files ARE your memory"
```

**Aplicabilidade AIOS:** ⭐⭐⭐
- Bob já tem persona definida
- Princípios podem enriquecer `agent.persona`
- Boundaries aplicáveis a todos os agentes

---

### 3.2 USER.md — Perfil do Humano

**Propósito:** Informações sobre o usuário para personalização.

**Estrutura:**
```yaml
user_profile:
  identity: [nome, pronomes, timezone, língua]
  communication: [preferências de canal, formato]
  context: [trabalho, foco atual, horários]
  preferences: [código > teoria, autonomia]
  irritations: [respostas genéricas, confirmação excessiva]
  notes: [contexto técnico específico]
```

**Aplicabilidade AIOS:** ⭐⭐⭐⭐⭐
- Direto overlap com Epic 10 (User Profile System)
- Estrutura já validada em produção
- Campos `irritations` e `preferences` são gold

---

### 3.3 AGENTS.md — Workspace e Regras Operacionais

**Propósito:** Manual de operação do agente no workspace.

**Conceitos Chave:**

1. **Session Bootstrap:**
   ```
   1. Read SOUL.md (who you are)
   2. Read USER.md (who you're helping)
   3. Read memory/YYYY-MM-DD.md (recent context)
   4. If MAIN SESSION: also read MEMORY.md
   ```

2. **Memory Segregation:**
   - `memory/YYYY-MM-DD.md` - Raw daily logs
   - `MEMORY.md` - Curated long-term (ONLY in main session)
   - Security: MEMORY.md não carrega em group chats

3. **Write It Down Protocol:**
   > "Memory is limited — if you want to remember something, WRITE IT TO A FILE"
   > "Mental notes don't survive session restarts. Files do."

4. **Heartbeat System:**
   - Polling periódico para check-ins proativos
   - `HEARTBEAT.md` com checklist de verificações
   - Track de últimos checks em JSON
   - Regras de quando reach out vs stay quiet

5. **Decision Tree:**
   ```
   CRIAR/MODIFICAR código? → Superpowers Flow
   CONSULTAR dados? → Skills específicas
   EXECUTAR ação? → Deploy/automação skills
   ```

6. **Cost Control:**
   - Hard cap de $20/dia
   - Fail-safe para não retry com modelo caro
   - Force Haiku para queries simples

**Aplicabilidade AIOS:** ⭐⭐⭐⭐
- Heartbeat ≈ AIOS Ops (PRD §7.5)
- Decision Tree ≈ Bob Router
- Cost control relevante para multi-agent

---

### 3.4 Memória de Longo Prazo — Entidades Persistentes

**Propósito:** Contexto de negócio persistente.

**Estrutura:**
```markdown
## 🏢 Sobre a Empresa
- Escala, projetos, clientes

## 👤 Time
- Membros e preferências

## 🛠️ Ecossistema Técnico
- Infraestrutura, URLs, tools

## 📡 Canais de Comunicação
- Prioridades de contato

## 📝 Decisões Importantes
- Log com data e rationale

## 💡 Processos Aprendidos
- Padrões descobertos em uso

## 🔗 Referências
- Links para docs detalhados
```

**Aplicabilidade AIOS:** ⭐⭐⭐
- Formato manual, não escalável
- Conceito de "Decisões Importantes" valioso
- Pode informar `project.config` (PRD §12)

---

### 3.5 Life - Knowledge Graph — Three-Layer Architecture

**Propósito:** Especificação da arquitetura de memória em camadas.

**The Three Layers:**

| Layer | Storage | Propósito | Retenção |
|-------|---------|-----------|----------|
| 1. Entity Knowledge | `life/areas/` | Facts sobre pessoas/empresas/projetos | Permanent |
| 2. Daily Notes | `memory/YYYY-MM-DD.md` | Logs cronológicos | 7-30 dias |
| 3. Persistent Memory | `MEMORY.md` | Patterns e preferências | Permanent |

**Estrutura de Entidades:**
```
life/areas/
├── people/<slug>/       → summary.md + facts.jsonl
├── companies/<slug>/    → summary.md + facts.jsonl
└── projects/<slug>/     → summary.md + facts.jsonl
```

**Regras de Retrieval:**
1. Load summary.md first (cheap, 5 lines max)
2. Load facts.jsonl only if more detail needed
3. Use memory_search as fallback

**Aplicabilidade AIOS:** ⭐⭐⭐⭐
- Arquitetura elegante e comprovada
- `summary.md` + `facts.jsonl` é padrão reusável
- Compatible com Epic 7 (Memory Layer)

---

### 3.6 skill_KnowledgeGraph — Implementação Técnica

**Propósito:** Skill executável para gestão do knowledge graph.

**Componentes:**

1. **Fact Schema (JSONL):**
```json
{
  "id": "<slug>-NNN",
  "fact": "The actual fact in plain English",
  "category": "relationship|milestone|status|preference|context|decision",
  "ts": "YYYY-MM-DD",
  "source": "conversation|manual|inference",
  "status": "active|superseded",
  "supersedes": "<id>"
}
```

2. **Cron Jobs:**
   - **Fact Extraction** (every 4h): Extract from daily notes → entity facts
   - **Weekly Synthesis** (Sunday): Rewrite summaries, prune stale

3. **What Qualifies as Durable Fact:**
   - ✅ Relationship changes, life milestones, status changes
   - ✅ Stated preferences, key decisions, important context
   - ❌ Casual conversation, temporary states, vague info

4. **Cost Target:** < $0.01/day for extraction

**Aplicabilidade AIOS:** ⭐⭐⭐⭐⭐
- Modelo de dados maduro
- Cron jobs aplicáveis
- Cost efficiency comprovada

---

### 3.7 Memory Flush V1 — Session Digest Básico

**Propósito:** Extração de memória antes de compaction.

**Estrutura de Prioridades:**
```
HIGH: User corrections, explicit rules (NUNCA, SEMPRE)
MEDIUM: Decisions with rationale, reusable patterns
LOW: Lessons from errors and fixes
```

**Output Format:**
```markdown
## Session Digest - HH:MM UTC

### 🚨 Corrections/Rules (HIGH)
- NEVER: [extracted rule]
- ALWAYS: [extracted rule]

### 🎯 Decisions (MEDIUM)
- [Decision + rationale]

### 🔄 Patterns (MEDIUM)
- [Reusable pattern]

### 📚 Lessons (LOW)
- [What was learned]
```

**Aplicabilidade AIOS:** ⭐⭐⭐⭐
- Estrutura de priorização reusável
- Categorias aplicáveis a sessions de agentes

---

### 3.8 Memory Flush V2 — Observation Masking + Supabase

**Propósito:** Evolução com filtragem inteligente e sync de banco.

**Novidades V2:**

1. **Observation Masking:**
   > "Before extracting, mentally filter out routine tool calls, greetings, debug outputs, low information density messages"

2. **Entity Linking:**
   ```markdown
   ### 🔗 Entities Mentioned
   - people: [names]
   - projects: [names]
   - companies: [names]
   ```

3. **Supabase Sync para HIGH items:**
   ```sql
   INSERT INTO unified_memories (content, entity_type, source, entity_slug, metadata)
   VALUES (..., 'preference', 'clawdbot', 'pedro', '{"priority": "high"}');
   ```

**Aplicabilidade AIOS:** ⭐⭐⭐⭐⭐
- Observation Masking é critical para escala
- Entity Linking alinha com Knowledge Graph
- Supabase sync = hybrid persistence

---

### 3.9 Unified Memory Schema — Database Design

**Propósito:** Schema PostgreSQL para memória unificada.

**Tabelas:**

| Tabela | Propósito | Key Features |
|--------|-----------|--------------|
| `unified_memories` | Core memory | pgvector embeddings, entity linking, soft delete |
| `memory_relations` | Graph links | source→target, relation_type, strength |
| `project_context` | Arquitetura | tech_stack JSONB, key_decisions |
| `session_traces` | Auto-improvement | input/output, feedback, cost tracking |

**Índices Importantes:**
- IVFFlat para vector similarity (lists=100)
- GIN para full-text search (portuguese)
- B-tree para entity_type, source, created_at

**Functions:**
- `search_memories()` - Busca semântica com filtros
- `get_project_context()` - Context lookup por projeto

**Aplicabilidade AIOS:** ⭐⭐⭐⭐⭐
- Schema production-ready
- pgvector já no AIOS stack
- session_traces = gold para feedback loops

---

## 4. Padrões de Design Identificados

### 4.1 Append-Only Facts
```
Never delete facts — supersede instead
{"status": "superseded", "supersedes": "old-id"}
```
**Benefício:** Auditoria completa, rollback possível

### 4.2 Summary + Details Split
```
summary.md (5 lines max) → Always load
facts.jsonl (unlimited) → Load on demand
```
**Benefício:** Token efficiency, progressive detail

### 4.3 Observation Masking
```
Filter BEFORE extraction:
- Routine tool calls
- Greetings, small talk
- Debug outputs
- Low information density
```
**Benefício:** Signal vs noise, cost reduction

### 4.4 Priority-Based Extraction
```
HIGH: Corrections, rules → Always persist
MEDIUM: Decisions, patterns → Persist if space
LOW: Lessons → Persist if relevant
```
**Benefício:** Importance triage automático

### 4.5 Hybrid Persistence
```
Files (fast, local) ↔ Database (searchable, shared)
Sync HIGH priority items to DB
Keep daily logs in files
```
**Benefício:** Best of both worlds

### 4.6 Heartbeat-Driven Maintenance
```
Periodic cron jobs for:
- Fact extraction (4h)
- Summary synthesis (weekly)
- Memory maintenance (during heartbeats)
```
**Benefício:** Background improvement sem interrupção

---

## 5. Diagrama de Arquitetura do Sistema de Memória

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ClawdBot Memory Architecture                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │   SOUL.md    │    │   USER.md    │    │  AGENTS.md   │           │
│  │  (Identity)  │    │  (Profile)   │    │   (Rules)    │           │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘           │
│         │                   │                   │                    │
│         └───────────────────┼───────────────────┘                    │
│                             ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    SESSION BOOTSTRAP                          │   │
│  │   1. Load Identity → 2. Load Profile → 3. Load Context       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                             │                                        │
│         ┌───────────────────┼───────────────────┐                   │
│         ▼                   ▼                   ▼                    │
│  ┌────────────┐     ┌────────────┐     ┌────────────────┐           │
│  │  Layer 1   │     │  Layer 2   │     │    Layer 3     │           │
│  │  Entity    │     │   Daily    │     │   Persistent   │           │
│  │ Knowledge  │     │   Notes    │     │    Memory      │           │
│  ├────────────┤     ├────────────┤     ├────────────────┤           │
│  │life/areas/ │     │memory/     │     │  MEMORY.md     │           │
│  │ people/    │     │YYYY-MM-DD  │     │  (curated)     │           │
│  │ companies/ │     │.md         │     │                │           │
│  │ projects/  │     │            │     │                │           │
│  └─────┬──────┘     └─────┬──────┘     └───────┬────────┘           │
│        │                  │                    │                     │
│        └──────────────────┼────────────────────┘                     │
│                           ▼                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    MEMORY FLUSH (Pre-compaction)              │   │
│  │                                                               │   │
│  │   Observation Masking → Priority Extraction → Persist         │   │
│  │                                                               │   │
│  │   HIGH: Rules/Corrections → unified_memories (Supabase)       │   │
│  │   MEDIUM: Decisions/Patterns → daily notes                    │   │
│  │   LOW: Lessons → daily notes                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                           │                                          │
│                           ▼                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    CRON JOBS (Background)                     │   │
│  │                                                               │   │
│  │   Every 4h: Fact Extraction (daily notes → entity facts)      │   │
│  │   Weekly: Summary Synthesis (facts → summaries)               │   │
│  │   Heartbeat: Memory Maintenance                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                           │                                          │
│                           ▼                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    SUPABASE (PostgreSQL + pgvector)           │   │
│  │                                                               │   │
│  │   unified_memories │ memory_relations │ session_traces        │   │
│  │                    │ project_context  │                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Pontos Fortes e Fracos

### Pontos Fortes ✅

1. **Arquitetura de 3 camadas bem definida** — Separação clara de concerns
2. **Append-only facts** — Auditabilidade e rollback
3. **Summary + Details split** — Token efficiency
4. **Observation Masking** — Filtragem inteligente de ruído
5. **Hybrid persistence** — Files + Database
6. **Cron-based maintenance** — Background improvement
7. **Cost consciousness** — $0.01/day target
8. **Session traces** — Feedback loop para self-improvement
9. **Security boundaries** — MEMORY.md não carrega em group chats

### Pontos Fracos ⚠️

1. **Contexto pessoal** — Projetado para 1 usuário, não multi-tenant
2. **Files como source of truth** — Não escala para times
3. **Heartbeat system** — Complexo para orquestrar
4. **Manual curation** — MEMORY.md requer manutenção humana
5. **Sem versionamento** — Facts append-only mas sem branches
6. **Dependência de LLM para extraction** — Custo variável
7. **Sem conflict resolution** — Multi-agent pode colidir

---

## 7. Perguntas Respondidas

### Q1: O ClawdBot é open source?

**Parcialmente.** O skill `knowledge-graph` tem link para GitHub (`jdrhyne/agent-skills`), mas a referência completa parece ser de um projeto privado ou parcialmente público. A skill é distribuível, mas o sistema completo (SOUL, USER, AGENTS) é template para customização pessoal.

### Q2: O schema é compatível com Supabase existente do AIOS?

**Sim, compatível.** O schema usa PostgreSQL padrão com pgvector, que já está no stack do AIOS. As tabelas `unified_memories` e `memory_relations` podem coexistir com as existentes.

### Q3: O Three-Layer Memory System faz sentido para CLI-first?

**Sim, com adaptações.** O modelo funciona bem para CLI pois é file-based por design. A Layer 1 (entities) e Layer 2 (daily notes) são nativamente arquivos. Layer 3 (MEMORY.md) pode ser automatizada.

### Q4: Memory Flush + Observation Masking é aplicável ao Claude Code context?

**Sim, diretamente.** O Memory Flush foi projetado para Claude Code pre-compaction. O Observation Masking é técnica de prompt, não de infraestrutura.

### Q5: Heartbeat system é relevante para AIOS?

**Parcialmente.** O conceito de polling para background tasks alinha com AIOS Ops (PRD §7.5), mas a implementação atual assume single-user. Para AIOS, um sistema de cron jobs por projeto seria mais adequado.

---

## 8. Conclusão

O ClawdBot implementa um sistema de memória **sofisticado e bem pensado** para Claude Code em contexto pessoal. Os conceitos de **Three-Layer Memory, Observation Masking, e Priority-Based Extraction** são diretamente aplicáveis ao AIOS.

### Recomendação de Absorção

| Conceito | Prioridade | Epic Target |
|----------|------------|-------------|
| Unified Memory Schema | 🔴 Must | Epic 7 (Memory Layer) |
| Three-Layer Architecture | 🔴 Must | Epic 7 |
| Memory Flush (V2) | 🟡 Should | Epic 7 |
| USER.md structure | 🔴 Must | Epic 10 (User Profile) |
| Observation Masking | 🟡 Should | All agents |
| Fact Schema (JSONL) | 🟡 Should | Epic 7 |
| Session Traces | 🟢 Could | Future (self-improvement) |
| Heartbeat System | 🔵 Won't (for now) | AIOS Ops (Roadmap) |

---

*Analysis completed by @analyst (Atlas) | 2026-02-04*

— Atlas, investigando a verdade 🔎
