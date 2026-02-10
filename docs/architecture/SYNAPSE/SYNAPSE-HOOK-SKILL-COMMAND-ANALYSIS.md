# SYNAPSE — Hook / Skill / Command Separation Analysis

> **Author:** @architect (Aria)
> **Date:** 2026-02-10
> **Status:** Ready for PM Review
> **Complementa:** SYNAPSE-ARCHITECTURE-RECOMMENDATION.md
> **Baseado em:** ADR-001, DESIGN-SYNAPSE-ENGINE.md, patterns existentes de MIS/UAP

---

## 1. Criterios de Separacao (observados no aios-core)

| Tipo | Trigger | Proposito | Visibilidade | Pode Bloquear? | Exemplos Existentes |
|------|---------|-----------|-------------|---------------|---------------------|
| **Hook** | Automatico (per-event) | Enforcement, injecao, captura | Invisivel ao usuario | Sim (exit 2) | `read-protection.py`, `precompact-session-digest.js`, `enforce-architecture-first.py` |
| **Skill** | Contexto do usuario | Guia, workflow, conhecimento domain | Descobrivel por nome | Nao | `architect-first/`, `mcp-builder/`, `skill-creator/` |
| **Command** | Invocacao explicita | Operacoes, ativacao, CRUD | User-facing (`@agent`, `/cmd`) | Nao | `greet.md`, `AIOS/agents/*.md` |

### Regra de Ouro

```
Se roda AUTOMATICAMENTE a cada evento → HOOK
Se ENSINA o usuario a fazer algo → SKILL
Se EXECUTA uma operacao que o usuario pediu → COMMAND
```

---

## 2. SYNAPSE — Mapeamento Completo

### 2.1 HOOKS (Automaticos, Per-Event)

| # | Hook | Event | Descricao | Existente? |
|---|------|-------|-----------|------------|
| H1 | **synapse-engine.js** | `UserPromptSubmit` | Motor principal: processa 8 layers, injeta `<synapse-rules>` a cada prompt | NOVO |

**Detalhes do H1:**
- Entry point fino em `.claude/hooks/synapse-engine.js` (~50 linhas)
- Importa engine de `.aios-core/core/synapse/engine.js`
- Input: `{ sessionId, cwd, prompt }` via stdin
- Output: `{ hookSpecificOutput: { additionalContext: "<synapse-rules>..." } }` via stdout
- Timeout: <100ms hard limit
- Fallback: exit silencioso se `.synapse/` nao existe (zero output)

**Porque NAO outros hooks:**
- Session cleanup → feito inline pelo engine (stale >24h check)
- Domain validation → nao eh per-event, eh CRUD (command)
- Constitution enforcement → feito dentro do L0 layer (parte do H1)
- O MIS ja tem seu proprio hook (precompact-session-digest.js) — SYNAPSE nao o substitui

---

### 2.2 SKILLS (Guia e Conhecimento)

| # | Skill | Path | Descricao | Resources |
|---|-------|------|-----------|-----------|
| S1 | **synapse-overview** | `.claude/skills/synapse/SKILL.md` | Visao geral: o que eh SYNAPSE, 8 layers, como funciona, context brackets | references/ |
| S2 | **synapse-domain-guide** | Referencia dentro de S1 | Como criar custom domains, formato KEY=VALUE, keywords RECALL/EXCLUDE | templates/ |
| S3 | **synapse-commands-guide** | Referencia dentro de S1 | Star-commands disponiveis (*synapse, *brief, *dev, *review, *plan, *debug) | — |
| S4 | **synapse-manifest-reference** | Referencia dentro de S1 | Sintaxe completa do manifest, triggers, states | — |

**Estrutura proposta (padrao skill-creator):**

```
.claude/skills/synapse/
├── SKILL.md                          # Entry point: visao geral + router
├── references/
│   ├── DOMAIN-GUIDE.md               # S2: Como criar domains
│   ├── COMMANDS-GUIDE.md             # S3: Star-commands reference
│   ├── MANIFEST-REFERENCE.md         # S4: Sintaxe do manifest
│   ├── CONTEXT-BRACKETS.md           # Explicacao dos brackets
│   └── LAYER-HIERARCHY.md            # Hierarquia L0-L7
└── assets/
    ├── domain-template                # Template para novo domain file
    └── manifest-entry-template        # Template para nova entry no manifest
```

**SKILL.md (conteudo principal):**
- O que eh SYNAPSE e por que existe
- Resumo das 8 layers (tabela)
- Como usar star-commands (`*synapse`, `*synapse status`, `*synapse debug`)
- Links para references/ quando usuario quer detalhes
- Troubleshooting basico (domain nao carrega, bracket errado)

**Porque skill e nao command:**
- Nao executa operacao — **ensina** o usuario sobre o sistema
- Progressive disclosure: metadata sempre no contexto, detalhes sob demanda
- Segue o padrao `architect-first/` e `mcp-builder/`

---

### 2.3 COMMANDS (Operacoes CRUD)

| # | Command | Path | Trigger | Descricao |
|---|---------|------|---------|-----------|
| C1 | **synapse-manager** | `.claude/commands/synapse/manager.md` | `*synapse manage` | Router principal — despacha para tasks |
| C2 | **create-domain** | `.claude/commands/synapse/tasks/create-domain.md` | `*synapse create DOMAIN` | Cria novo domain file + entry no manifest |
| C3 | **add-rule** | `.claude/commands/synapse/tasks/add-rule.md` | `*synapse add DOMAIN "rule text"` | Adiciona regra a domain existente |
| C4 | **edit-rule** | `.claude/commands/synapse/tasks/edit-rule.md` | `*synapse edit DOMAIN N` | Edita/remove regra por indice |
| C5 | **toggle-domain** | `.claude/commands/synapse/tasks/toggle-domain.md` | `*synapse toggle DOMAIN` | Ativa/desativa domain no manifest |
| C6 | **create-command** | `.claude/commands/synapse/tasks/create-command.md` | `*synapse add-command NAME` | Cria novo star-command |
| C7 | **suggest-domain** | `.claude/commands/synapse/tasks/suggest-domain.md` | `*synapse suggest "rule text"` | Sugere domain ideal para uma regra |

**Estrutura proposta (padrao CARL commands):**

```
.claude/commands/synapse/
├── manager.md                        # C1: Router/dispatcher
├── tasks/
│   ├── create-domain.md              # C2: Criar domain + manifest
│   ├── add-rule.md                   # C3: Adicionar regra
│   ├── edit-rule.md                  # C4: Editar/remover regra
│   ├── toggle-domain.md              # C5: Ativar/desativar
│   ├── create-command.md             # C6: Criar star-command
│   └── suggest-domain.md             # C7: Sugerir domain
├── templates/
│   ├── domain-template               # Boilerplate para domain file
│   └── manifest-entry-template       # Boilerplate para manifest entry
└── utils/
    └── manifest-parser-reference.md  # Reference para parser
```

**Porque commands e nao hooks:**
- Sao operacoes CRUD invocadas pelo usuario (nao automaticas)
- Modificam `.synapse/` (manifest, domain files) — requerem intencao explicita
- Seguem padrao CARL: `*.claude/commands/carl/tasks/*.md`

---

## 3. Star-Commands vs CRUD Commands

**Distincao importante:** Star-commands do SYNAPSE sao **processados pelo hook** (H1), nao pelos commands (C1-C7).

| Star-Command | Processado por | Tipo |
|-------------|---------------|------|
| `*synapse` | Hook (L7) | Help inline (output no prompt) |
| `*synapse status` | Hook (L7) | Status inline |
| `*synapse debug` | Hook (L7) | Toggle DEVMODE na session |
| `*synapse domains` | Hook (L7) | Lista domains no output |
| `*synapse reload` | Hook (L7) | Limpa cache no engine |
| `*brief` | Hook (L7) | Mode override na session |
| `*dev` | Hook (L7) | Mode override na session |
| `*review` | Hook (L7) | Mode override na session |
| `*plan` | Hook (L7) | Mode override na session |
| `*discuss` | Hook (L7) | Mode override na session |
| `*debug` | Hook (L7) | Mode override na session |
| `*explain` | Hook (L7) | Mode override na session |
| `*synapse manage` | **Command** (C1) | Abre router CRUD |
| `*synapse create DOMAIN` | **Command** (C2) | Cria domain file |
| `*synapse add DOMAIN "rule"` | **Command** (C3) | Adiciona regra |
| `*synapse edit DOMAIN N` | **Command** (C4) | Edita regra |
| `*synapse toggle DOMAIN` | **Command** (C5) | Ativa/desativa |

**Regra:** Se o star-command **le estado** e retorna output inline → **Hook (L7)**. Se o star-command **modifica arquivos** → **Command**.

---

## 4. MIS — Analise pelo Mesmo Criterio

O MIS atualmente tem:
- **1 Hook:** `precompact-session-digest.js` (PreCompact) ✅
- **0 Skills:** Nenhuma documentacao user-facing
- **0 Commands:** Nenhum CRUD de memorias

### O que DEVERIA ter (seguindo o padrao SYNAPSE):

#### MIS Hooks (ja existente)

| # | Hook | Event | Status |
|---|------|-------|--------|
| MH1 | `precompact-session-digest.js` | PreCompact | ✅ Done (MIS-3) |

Nenhum hook adicional necessario — o digest capture eh a unica operacao automatica per-event.

#### MIS Skills (FALTAM)

| # | Skill | Descricao | Prioridade |
|---|-------|-----------|------------|
| MS1 | **memory-guide** | Como o sistema de memoria funciona: tiers (HOT/WARM/COLD), attention scores, setores cognitivos, progressive disclosure | Alta |

**Estrutura proposta:**

```
.claude/skills/memory/
├── SKILL.md                          # Visao geral do MIS
└── references/
    ├── TIERS-GUIDE.md                # HOT/WARM/COLD explanation
    ├── ATTENTION-SCORING.md          # Como scores sao calculados
    └── AGENT-SECTORS.md              # Setor preferences por agente
```

**Porque falta:** MIS foi implementado como sistema backend (hooks + pipeline integration) sem camada user-facing. O usuario nao tem como aprender sobre o sistema sem ler source code.

#### MIS Commands (FALTAM - futuro, MIS-7+)

| # | Command | Trigger | Descricao | Prioridade |
|---|---------|---------|-----------|------------|
| MC1 | **memory-status** | `*memory status` | Mostra memorias HOT/WARM do agente ativo | Media |
| MC2 | **memory-search** | `*memory search "query"` | Busca memorias por tags/keywords | Baixa |
| MC3 | **memory-forget** | `*memory forget ID` | Remove/arquiva memoria especifica | Baixa |

**Nota:** Estes commands sao **pro-gated** — so funcionam com feature gate `pro.memory.*`. Para core, retornam mensagem informativa sobre pro.

**Porque nao existe ainda:** MIS-7 (auto-evolution) esta em Pending. Os commands de memoria fazem mais sentido apos MIS-7.

---

## 5. UAP (Activation Pipeline) — Analise pelo Mesmo Criterio

O UAP atualmente tem:
- **0 Hooks:** Nao eh hook, roda como script chamado por commands
- **0 Skills dedicadas:** (architect-first eh separada)
- **Commands:** `greet.md` + `AIOS/agents/*.md` ✅

### O que DEVERIA ter:

#### UAP Hooks

| # | Hook | Event | Status | Descricao |
|---|------|-------|--------|-----------|
| — | Nenhum necessario | — | N/A | UAP roda na **ativacao** (one-time via command), nao per-event |

**Porque nao hook:** O pipeline de ativacao NAO eh per-prompt. Ele roda uma vez quando o usuario ativa um agente (`@dev`, `@qa`). Isso eh um **command**, nao um hook.

#### UAP Skills (FALTAM)

| # | Skill | Descricao | Prioridade |
|---|-------|-----------|------------|
| US1 | **agent-activation-guide** | Como funciona a ativacao de agentes: tiers, greeting sections, session types, permission modes | Baixa |

**Porque baixa prioridade:** O sistema de ativacao eh transparente ao usuario — funciona automaticamente. Uma skill seria util apenas para developers do framework.

#### UAP Commands (JA EXISTENTES)

| # | Command | Path | Status |
|---|---------|------|--------|
| UC1 | `greet.md` | `.claude/commands/greet.md` | ✅ Done |
| UC2 | 12 agent definitions | `.claude/commands/AIOS/agents/*.md` | ✅ Done |

UAP esta bem servido no nivel de commands. Nao precisa de mudancas.

---

## 6. Mapa Consolidado — Todos os Sistemas

### HOOKS (Automaticos)

| Sistema | Hook | Event | Status |
|---------|------|-------|--------|
| **SYNAPSE** | `synapse-engine.js` | UserPromptSubmit | **NOVO (SYN-7)** |
| **MIS** | `precompact-session-digest.js` | PreCompact | ✅ Done |
| Governance | `read-protection.py` | PreToolUse | ✅ Done |
| Governance | `enforce-architecture-first.py` | PreToolUse | ✅ Done |
| Governance | `write-path-validation.py` | PreToolUse | ✅ Done |
| Governance | `sql-governance.py` | PreToolUse (Bash) | ✅ Done |
| Governance | `slug-validation.py` | PreToolUse (Bash) | ✅ Done |
| Governance | `mind-clone-governance.py` | PreToolUse (Write) | ✅ Done |

### SKILLS (Guia/Conhecimento)

| Sistema | Skill | Status |
|---------|-------|--------|
| **SYNAPSE** | `synapse/` (overview, domain guide, commands, manifest ref) | **NOVO (SYN-11)** |
| **MIS** | `memory/` (tiers, attention, sectors) | **NOVO (futuro, pos-MIS-7)** |
| Framework | `architect-first/` | ✅ Done |
| Framework | `mcp-builder/` | ✅ Done |
| Framework | `skill-creator/` | ✅ Done |

### COMMANDS (Operacoes User-Invoked)

| Sistema | Command | Status |
|---------|---------|--------|
| **SYNAPSE** | `synapse/manager.md` + 6 tasks | **NOVO (SYN-9)** |
| **MIS** | `*memory status/search/forget` | **NOVO (futuro, pos-MIS-7)** |
| UAP | `greet.md` | ✅ Done |
| UAP | `AIOS/agents/*.md` (12 agentes) | ✅ Done |

---

## 7. Diagrama de Fluxo Completo

```
USUARIO DIGITA PROMPT
        │
        ▼
┌─────────────────────────┐
│  HOOK: synapse-engine.js │ ◄── UserPromptSubmit (automatico)
│  (8 layers, <100ms)      │
│                           │
│  L0: Constitution         │
│  L1: Global               │
│  L2: Agent (se ativo)     │
│  L3: Workflow (se ativo)  │
│  L4: Task (se ativa)      │
│  L5: Squad (se ativo)     │
│  L6: Keywords (matching)  │
│  L7: Star-commands        │
│       │                   │
│       ▼                   │
│  <synapse-rules> XML      │
└─────────────────────────┘
        │
        ▼ additionalContext
┌─────────────────────────┐
│  CLAUDE PROCESSA PROMPT  │
│  (com synapse-rules)     │
│                           │
│  Se *synapse manage →     │──► COMMAND: synapse/manager.md
│  Se *synapse create →     │──► COMMAND: synapse/tasks/create-domain.md
│  Se *synapse add →        │──► COMMAND: synapse/tasks/add-rule.md
│  Se *synapse toggle →     │──► COMMAND: synapse/tasks/toggle-domain.md
│                           │
│  Se user quer aprender →  │──► SKILL: synapse/SKILL.md
│  Se user quer detalhes →  │──► SKILL: synapse/references/*.md
└─────────────────────────┘
        │
        ▼ (se contexto compacta)
┌─────────────────────────┐
│  HOOK: precompact-       │ ◄── PreCompact (automatico, MIS)
│  session-digest.js       │
│  (captura conhecimento)  │
└─────────────────────────┘
```

---

## 8. Impact nas Stories do EPIC-SYN

Com esta analise, as stories propostas na Architecture Recommendation se refinam:

| Story | Tipo | O que entrega |
|-------|------|--------------|
| SYN-1 | Engine (hook infra) | Domain loader + manifest parser |
| SYN-2 | Engine (hook infra) | Session manager |
| SYN-3 | Engine (hook infra) | Context bracket tracker |
| SYN-4 | Engine (hook infra) | Layer processors L0-L3 |
| SYN-5 | Engine (hook infra) | Layer processors L4-L7 |
| SYN-6 | Engine (hook infra) | SynapseEngine + formatter |
| **SYN-7** | **Hook** | **Entry point + registration** (`.claude/hooks/synapse-engine.js` + settings) |
| **SYN-8** | **Runtime Data** | **Domain content files** (`.synapse/` population) |
| **SYN-9** | **Commands** | **CRUD operations** (`.claude/commands/synapse/` — manager + 6 tasks + templates) |
| SYN-10 | Engine (pro bridge) | Pro memory bridge (feature-gated) |
| **SYN-11** | **Skill** | **Help + documentation** (`.claude/skills/synapse/` — SKILL.md + references + assets) |
| SYN-12 | Testing | Performance + E2E |

**Stories novas sugeridas (baixa prioridade, futuro):**

| Story | Sistema | Tipo | Descricao |
|-------|---------|------|-----------|
| MIS-8 | MIS | Skill | `.claude/skills/memory/` — guia do sistema de memoria |
| MIS-9 | MIS | Commands | `*memory status/search/forget` — CRUD de memorias (pro-gated) |

---

## 9. Principios de Design

1. **1 Hook por sistema** — SYNAPSE tem 1 hook (UserPromptSubmit), MIS tem 1 hook (PreCompact). Nao proliferar hooks.

2. **Skills ensinam, Commands executam** — Se o usuario quer aprender → skill. Se quer fazer algo → command.

3. **Star-commands de leitura no Hook** — `*synapse status`, `*synapse debug` sao processados pelo hook (L7) porque leem estado e retornam output inline. Nao precisam ser commands.

4. **Star-commands de escrita nos Commands** — `*synapse create`, `*synapse add`, `*synapse toggle` modificam arquivos, portanto sao commands.

5. **Progressive disclosure nas Skills** — SKILL.md tem o essencial, references/ tem os detalhes. Segue padrao `skill-creator/`.

6. **Commands com templates** — Cada command de criacao inclui template para garantir formato correto. Segue padrao CARL.

---

*SYNAPSE Hook/Skill/Command Analysis v1.0.0*
*@architect (Aria) — 2026-02-10*
*1 Hook | 1 Skill (4 references) | 7 Commands | Clear Separation*
