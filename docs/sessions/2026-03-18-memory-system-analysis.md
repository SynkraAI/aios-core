# Session 2026-03-18 — Memory System v2.0 Deep Dive

## Projeto
- **Nome:** aios-core (framework AIOS)
- **Tipo:** Framework governance
- **Docs:** `docs/analysis/`

## O que foi feito

### Contexto
Usuário reportou que AIOS "esquece tudo a cada 5 minutos" — agentes não gravam memórias, não escutam feedback, seguem plano cegamente até o fim.

### Análise Completa Realizada
1. **Inventory profundo** de TODO o sistema de memória/contexto existente:
   - ✅ Gotchas Memory (`.aiox-core/core/memory/gotchas-memory.js`) — Story 9.4
   - ✅ Session State (`.aiox-core/core/orchestration/session-state.js`) — Story 11.5, ADR-011
   - ✅ Context Loader (`.aiox-core/core/session/context-loader.js`) — Story 6.1.2.5
   - ✅ Context Manager (`.aiox-core/core/orchestration/context-manager.js`)
   - ✅ `/checkpoint` + `/resume` skills

2. **Gaps identificados** (5 críticos):
   - ❌ User Profile Memory (global)
   - ❌ Project Context Memory (decisões, "por quês")
   - ❌ Feedback Loop (auto-gravar correções)
   - ❌ Checkpoints DENTRO de workflows (pause & listen)
   - ❌ Cross-session auto-load de memórias

3. **Mudança de paradigma crítica** (insight do usuário):
   - ❌ ANTES: Agent/Squad tem memória própria
   - ✅ AGORA: PROJETO tem memória, agents são stateless workers
   - Agents como consultores freelancers: não lembram de clientes anteriores, mas cada CLIENTE (projeto) tem suas próprias anotações

4. **Premissas confirmadas**:
   - Updates AIOX NÃO sobrescrevem memórias de usuário
   - Auditoria constante obrigatória
   - Cada aios-core é individual, mas segue mesmas regras
   - Squads/Skills/Tools são stateless, PROJETO é stateful

### Outputs Gerados

**Documentação:**
- `docs/analysis/memory-system-deep-dive-2026-03-18.md` (29 páginas)
  - Inventory completo (5 sistemas mapeados)
  - Gaps identificados (5 faltando)
  - Conflitos/overlaps detectados (3 potenciais)
  - Proposta de integração (SEM contradições)
  - Impacto em `/new-project` e estrutura de pastas
  - 5 phases de implementação (12-17 dias)
  - Success metrics (antes vs depois)

- `docs/analysis/memory-templates-2026-03-18.md`
  - Template: `project-context.md`
  - Template: `agents-used.md`
  - Template: `squads-config.md`
  - Template: `feedback/{topic}.md`

**Estrutura Proposta:**
```
{projeto}/.aios/
├── INDEX.md                         # ✅ Já existe
├── CLAUDE.md                        # ✅ Já existe
├── memory/                          # 🆕 NOVO
│   ├── project-context.md
│   ├── feedback/
│   ├── agents-used.md
│   └── squads-config.md
├── sessions/                        # ✅ Já existe
├── gotchas.json                     # ✅ Já existe
└── workflow-state/                  # ✅ Já existe

Global:
.aios-core/data/memory/user/
└── luiz-fosc-profile.md             # 🆕 NOVO
```

## Agente/Squad em uso
Claude Code (Sonnet 4.5) — análise e design de arquitetura

## Arquivos para contexto (próximo Claude DEVE ler)
- `docs/analysis/memory-system-deep-dive-2026-03-18.md`
- `docs/analysis/memory-templates-2026-03-18.md`
- `.aiox-core/core/memory/gotchas-memory.js`
- `.aiox-core/core/orchestration/session-state.js`
- `.claude/commands/checkpoint.md`

## Decisões tomadas

1. **Memória vive no PROJETO, não nos agents**
   - Agents são stateless workers
   - Projeto instrui agent sobre contexto
   - Mesmo squad em 2 projetos = 2 contextos diferentes

2. **Estrutura de diretórios NÃO muda**
   - Apenas ADICIONAR `.aios/memory/` em projetos
   - ADICIONAR `.aios-core/data/memory/user/` (global)
   - Zero breaking changes

3. **Update AIOX protegido**
   - `.aiox-core/core/**` → pode sobrescrever
   - `.aios/memory/**` → NUNCA tocar
   - `.aios/sessions/**` → NUNCA tocar
   - Merge conflicts em CLAUDE.md se customizado

4. **Abordagem de rollout: Audit → Quick Win → Incremental**
   - Hoje: Criar audit script básico
   - Amanhã: Testar em 1 projeto piloto
   - Próxima semana: Migrar incrementalmente (lotes de 10)

## Próximo passo exato

**Hoje (30 min):**
1. Criar `tools/audit-project-memory.js` (script básico)
2. Rodar em todos os projetos
3. Analisar output (quantos projetos precisam correção)
4. Decidir tamanho do esforço baseado em dados reais

**Amanhã (2-3h):**
1. Escolher 1 projeto piloto (pequeno e simples)
2. Criar `.aios/memory/` manualmente
3. Atualizar 1 agent spawn file com Read Protocol
4. Testar que agent lê memórias antes de começar

**Próxima semana:**
1. Criar story "Memory System v2.0"
2. Implementar templates em `/new-project`
3. Migração incremental (validar cada lote)

## Arquivos modificados não commitados
- `.aios/session.json` (8 linhas modificadas)
- `docs/reports/project-config-audit.md` (43 linhas modificadas)

**Decisão:** Registrado no checkpoint, commit será feito quando implementação começar.
