# ADR-AGF-3: Optimal Agent Activation Architecture — Best of Both Worlds

**Status:** Accepted (Roundtable Consensus)
**Date:** 2026-02-19
**Story:** AGF-3
**Epic:** Agent Fidelity (AGF)
**Deciders:** Roundtable Session 1 (Brad Frost, Mitchell Hashimoto, Pedro Valério) + Session 2 (Alan Nicolas, Andrej Karpathy, Pedro Valério)
**Facilitador:** Mirror (@emulator)

---

## Contexto

O AIOS possui dois repositórios com abordagens distintas para ativação de agentes:

| Aspecto | aios-core (UAP+SYNAPSE) | aios-core-skill-first (Embed) |
|---------|-------------------------|-------------------------------|
| Velocidade | Lenta (3-4 Read calls) | Instantânea |
| Riqueza contextual | Alta (branch, permissions, project status) | Baixa |
| Consistência cross-mode | Média (UAP só roda em command mode) | Alta |
| Mecanismo | Custom JS pipeline | Claude Code nativo |

O problema central: nenhuma das abordagens entrega 100% de fidelidade em todos os 4 modos de invocação (@agent, /skill, /command, Task tool) usando apenas mecanismos nativos do Claude Code.

Adicionalmente, a memória de agentes está fragmentada em 4 locais distintos, e o SYNAPSE engine (8-layer, ~2000 LOC JS) representa carga de manutenção significativa quando mecanismos nativos agora cobrem ~75% das suas funcionalidades.

---

## 12 Decisões Arquiteturais

### Sessão 1: Infraestrutura & Decomposição

#### D1: Progressive Enhancement em 4 Níveis

**Decisão:** A ativação de agentes segue 4 níveis progressivos, onde cada camada melhora a experiência mas nenhuma é requisito absoluto para funcionar.

```
Nível 0 (Embed puro):    Persona DNA no corpo do .md     → 70-80% fidelidade
Nível 1 (+ Frontmatter): memory: project, model, skills  → 80-85% fidelidade
Nível 2 (+ Rules):       .claude/rules/agent-{id}-*.md   → 85-92% fidelidade
Nível 3 (+ Hooks):       SYNAPSE-Lite (4 hooks)          → 95-100% fidelidade
```

**Rationale:** Inspirado em progressive enhancement web (HTML→CSS→JS→Framework). O agente funciona mesmo quando camadas superiores falham. No Task tool (subagente), apenas o Nível 0 está disponível — e funciona.

**Trade-offs:**
- (+) Funciona em todos os 4 modos de invocação
- (+) Degradação graceful em vez de falha total
- (-) Fidelidade máxima só no modo @agent com hooks habilitados
- (-) Requer disciplina na organização do arquivo .md

**Consenso:** Unânime (Brad Frost, Mitchell Hashimoto, Pedro Valério)

---

#### D2: Átomos com Contrato de Estado (Presence + Quality)

**Decisão:** Cada componente da ativação é um "átomo" que reporta dois sub-estados: presença e qualidade.

```yaml
átomo: persona
  presence: loaded | degraded | missing | error
  quality: full | degraded | unknown

átomo: context-injection
  presence: full | partial | stale | missing
  quality: full | degraded | unknown

átomo: memory
  presence: loaded | missing
  quality: full | stale
```

**Rationale:** Reportar apenas presença (loaded/missing) é insuficiente. Um agente pode estar "loaded" após compactação, mas com persona degradada (quality = unknown). A separação permite decisões mais precisas sobre quando alertar o usuário.

**Trade-offs:**
- (+) Granularidade de diagnóstico
- (+) Permite decisões determinísticas (block se required atom missing)
- (-) Complexidade adicional no activation report
- (-) Quality "unknown" pós-compactação não é mensurável diretamente

**Consenso:** Unânime — expandido na S2 com sub-estado quality

---

#### D3: Plan/Apply para Ativação

**Decisão:** A ativação segue o modelo Terraform de desired state → current state → diff → execution plan → apply → verify.

```
Phase 1: CONFIGURATION — Ler frontmatter, resolver dependências
Phase 2: STATE CHECK   — Verificar existência de hooks, rules, memory
Phase 3: PLAN          — Gerar diff (desired - current = execution plan)
Phase 4: APPLY         — Executar hooks, carregar rules, injetar context
Phase 5: VERIFY        — Confirmar estado final, emitir relatório
```

**Rationale:** Sem um plano explícito, a ativação é uma caixa preta. O Plan/Apply torna visível o que será carregado e o que está faltando ANTES de executar.

**Implementação:** O SessionStart hook é o entry point. Ele executa as Phases 1-5 e escreve o resultado no `$CLAUDE_ENV_FILE` para consumo pelo greeting do agente.

**Trade-offs:**
- (+) Transparência total do que foi carregado
- (+) Detecta gaps antes da ativação
- (-) Overhead no SessionStart (budget: <30s)
- (-) Só funciona no Nível 3 (hooks habilitados)

**Consenso:** Unânime

---

#### D4: Activation Report Visível no Greeting

**Decisão:** O greeting de cada agente DEVE incluir o status de ativação com estado de cada átomo.

```
🟢 @dev ativado (Nível 3 — Full Context)
  ✅ Persona: loaded | ✅ Rules: 3 matched | ✅ Branch: main | ✅ Memory: project

🟡 @dev ativado (Nível 1 — Degraded)
  ✅ Persona: loaded | ⚠️ Rules: 0 matched | ❌ Branch: hook timeout | ✅ Memory: project
```

**Rationale:** "Se não está visível, não aconteceu." (Pedro Valério) — O desenvolvedor precisa saber imediatamente se está operando com contexto completo ou degradado.

**Trade-offs:**
- (+) Observabilidade imediata
- (+) Dev sabe quando confiar no contexto
- (-) Ruído visual se sempre mostra status
- Mitigação: mostrar versão compacta (emoji + nível) por padrão, versão detalhada com `*status`

**Consenso:** Unânime

---

#### D5: Required vs Enhancement Atoms

**Decisão:** Átomos são classificados em `required` (bloqueiam ativação se ausentes) e `enhancement` (degradam gracefully).

```yaml
required_atoms:      # Sem estes = BLOCKED
  - persona          # Identity + constraints no corpo do .md
  - commands          # Pelo menos *help disponível

enhancement_atoms:   # Sem estes = DEGRADED (com alerta)
  - memory            # MEMORY.md auto-inject
  - rules             # .claude/rules/agent-{id}-*.md
  - hooks             # SessionStart, UserPromptSubmit
  - branch_context    # Git branch info
  - project_status    # Stories ativas
```

**Rationale:** Alinhado com as Camadas cognitivas de Karpathy: Camadas 1+2 (Identity + Constraints) são required (~150 tokens). Camadas 3-5 são enhancement.

**Trade-offs:**
- (+) Falha previsível e determinística
- (+) Nunca ativa um agente "vazio"
- (-) Agente pode ativar em modo degradado sem o dev perceber → mitigado por D4

**Consenso:** Unânime

---

#### D6: UserPromptSubmit para Detecção de Troca Mid-Session

**Decisão:** O hook UserPromptSubmit detecta mudança de agente via regex (`@\w+`) no prompt e re-injeta o DNA + contextual state do novo agente.

```bash
# Detecção: regex @agent no prompt do usuário
# Ação: re-injetar Camadas 1+2 do novo agente via additionalContext
# Atualização: escrever novo agent ID em .claude/agent-memory/.active-agent
```

**Rationale:** O SessionStart roda UMA vez. Se o usuário troca de `@dev` para `@qa` mid-session, o contexto do `@dev` contamina o `@qa`. O UserPromptSubmit é o único hook que roda a cada prompt e pode detectar a troca.

**Limitação:** O hook nativo de UserPromptSubmit tem timeout de 10s (prompt type) ou 60s (agent type). A re-injeção de DNA (~150 tokens) é leve e cabe no budget.

**Trade-offs:**
- (+) Troca de agente limpa e determinística
- (+) Contexto anterior não contamina
- (-) Latência adicional a cada prompt (budget: <100ms para detecção)
- (-) Regex pode dar falso positivo se `@dev` aparece em contexto de código

**Consenso:** Consenso (Brad não participou, Mitchell e Pedro alinhados)

---

### Sessão 2: Fidelidade, Memória & Injeção Cognitiva

#### D7: Persona DNA Separada de Enhancement no Arquivo .md

**Decisão:** O arquivo `.claude/agents/{id}.md` segue estrutura obrigatória com separação explícita entre DNA imutável e enhancement degradável.

```markdown
---
name: dev
model: sonnet
memory: project
skills: [project-context]
---

# === PERSONA DNA === (~150 tokens, IMUTÁVEL)

## Identity
You are **Dex**, AIOS Full Stack Developer.
- Role: systematic code implementation with test-first approach
- Style: pragmatic, incremental, evidence-based
- Authority: implement code, run tests, create PRs

## Constraints (Non-Negotiable)
- ALWAYS: run tests before marking tasks complete
- NEVER: push to main/master directly
- NEVER: modify files outside authority scope

# === ENHANCEMENT === (degradável)

## Activation Flow
1. Read memory: `.claude/agent-memory/dev/MEMORY.md`
2. Load context from rules matching `agent-dev-*`
3. Present greeting with activation status

## Commands
- `*help` - Show available commands
...
```

**Rationale (Karpathy):** LLMs seguem primacy effect — as primeiras linhas do prompt têm saliência máxima. Colocar Identity + Constraints nas primeiras ~15 linhas garante que sobrevivam a:
- Task tool (subagente recebe corpo completo, DNA está no topo)
- Compactação (resumo preserva informação saliente)
- Troca de modo (re-injeção de DNA é barata — 150 tokens)

**Impacto no IDE Sync:** O script `claude-agents.js` precisa gerar a separação DNA/Enhancement automaticamente a partir do source of truth (`.aios-core/development/agents/{id}/{id}.md`):
- `persona_profile` → seção Identity
- `agent.customization` → seção Constraints
- `commands`, `dependencies` → seção Enhancement

**Trade-offs:**
- (+) Persona sobrevive a todos os modos de invocação
- (+) Budget de tokens minúsculo (150 tokens para DNA completo)
- (+) Primacy effect garante atenção do modelo
- (-) Requer atualização do IDE sync pipeline
- (-) Fonte de verdade (source .md) precisa adaptar estrutura

**Consenso:** Unânime (Alan, Karpathy, Pedro)

---

#### D8: PreCompact Hook Preserva Persona DNA

**Decisão:** Um hook PreCompact re-injeta as Camadas 1+2 (Identity + Constraints) como `customInstructions` antes da compactação, garantindo que o resumo preserve a identidade do agente.

```bash
#!/bin/bash
# .claude/hooks/pre-compact-persona.sh
INPUT=$(cat)
AGENT_ID=$(cat .claude/agent-memory/.active-agent 2>/dev/null || echo "none")

if [ "$AGENT_ID" != "none" ] && [ -f ".claude/agents/${AGENT_ID}.md" ]; then
  # Extrai DNA (entre PERSONA DNA e ENHANCEMENT markers)
  DNA=$(sed -n '/PERSONA DNA/,/ENHANCEMENT/p' ".claude/agents/${AGENT_ID}.md" | head -20)

  # Injeta como instrução de compactação
  cat <<EOF
{
  "customInstructions": "CRITICAL: When summarizing this conversation, preserve the following agent identity verbatim: ${DNA}"
}
EOF
else
  echo '{}'
fi
```

**Rationale:** A compactação do Claude gera um resumo que preserva "o quê estava sendo feito" mas perde "quem estava fazendo". O `customInstructions` do PreCompact é a única forma de influenciar o que o resumo preserva.

**Trade-offs:**
- (+) Persona sobrevive compactação deterministicamente
- (+) Budget mínimo (~200 tokens no customInstructions)
- (-) Depende do Claude honrar o customInstructions (advisory, ~80% compliance)
- Mitigação: D12 (bracket DEPLETED) compensa como fallback

**Consenso:** Unânime

---

#### D9: Memória Consolidada — De 4 Locais para 2 + Rules

**Decisão:** Consolidar os 4 locais de memória de agente em 2 + rules por domínio.

```
ANTES (4 locais fragmentados):
  1. .aios-core/.../MEMORY.md          ← junction → .claude/agent-memory/{id}/MEMORY.md
  2. .claude/agent-memory/{id}/MEMORY.md  ← auto-inject 200 lines (nativo)
  3. .aios-core/.../agent-context.md      ← authority, always-load files
  4. .synapse/agent-{id}                  ← regras SYNAPSE L2

DEPOIS (2 + rules consolidados):
  1. .claude/agent-memory/{id}/MEMORY.md  ← auto-inject 200 lines (preservado, junction cross-IDE)
  2. .claude/agents/{id}.md               ← DNA + enhancement (corpo do agente)
  3. .claude/rules/agent-{id}-*.md        ← regras glob-targeted (migradas de SYNAPSE + agent-context)
```

**Migração:**
| Origem | Destino | Estratégia |
|--------|---------|-----------|
| `agent-context.md` → authority boundaries | `.claude/rules/agent-{id}-authority.md` | Migração direta |
| `agent-context.md` → always-load files | `skills:` no frontmatter do agente | Frontmatter nativo |
| `.synapse/agent-{id}` → regras per-agent | `.claude/rules/agent-{id}-rules.md` | Conversão KEY=VALUE → markdown |
| `.synapse/sessions/` → session state | `$CLAUDE_ENV_FILE` + agent-memory | Hooks nativos |
| `.aios-core/.../MEMORY.md` → junction | Preservado como está | Sem alteração |

**Ganhos:**
- Elimina 2-3 Read calls na ativação (agent-context.md + SYNAPSE domain files)
- Auto-inject nativo de 200 linhas do MEMORY.md (zero overhead)
- Rules glob-targeted carregam automaticamente no startup (zero Read calls)
- Cross-IDE junction preservado para compatibilidade com Codex/Gemini/Cursor

**Trade-offs:**
- (+) Zero Read calls extras para ativação completa
- (+) Manutenção reduzida (nativos mantidos pela Anthropic)
- (-) Perda de agent-context.md como arquivo centralizador
- (-) Migração de ~12 agent-context.md + ~12 SYNAPSE domains
- Mitigação: IDE sync gera os novos rules automaticamente

**Consenso:** Unânime

---

#### D10: SYNAPSE Dissolve-se em SYNAPSE-Lite (4 Hooks + Rules)

**Decisão:** O SYNAPSE engine monolítico (~2000 LOC JS, 8 layers, 749 testes) é substituído por 4 hooks especializados + regras nativas. O nome SYNAPSE-Lite representa o padrão de organização, não um engine.

```
SYNAPSE-Lite =
  SessionStart hook      → inject branch, project status, restore active agent
  UserPromptSubmit hook  → keyword RECALL + agent switch + context bracket
  PreCompact hook        → persona DNA preservation + transcript backup
  Stop hook              → quality gate + session summary
  + .claude/rules/*.md   → regras organizadas por domínio (ex-SYNAPSE layers)
  + Convenções de naming → agent-{id}-*.md, workflow-{name}.md, etc.
```

**Mapeamento de Layers:**

| SYNAPSE Layer | Nativo Equivalente |
|---------------|-------------------|
| L0: Constitution | `.claude/rules/constitution.md` (sem paths filter — universal) |
| L1: Global | `.claude/rules/global-*.md` |
| L2: Agent | `.claude/rules/agent-{id}-*.md` com glob |
| L3: Workflow | `.claude/rules/workflow-{name}.md` |
| L4: Task | Story file referenciada no prompt |
| L5: Squad | `.claude/rules/squad-{name}.md` |
| L6: Keyword RECALL | UserPromptSubmit hook com pattern matching |
| L7: Star-Command | Skill system nativo |

**O que se perde:**
- Context brackets adaptativos com estimativa precisa de % (substituído por estimativa heurística no hook)
- Diagnostics cross-pipeline com 10 collectors (substituído por Stop hook simplificado)
- Memory Bridge Pro-gated (substituído por agent memory nativo)

**O que se ganha:**
- Zero manutenção de engine custom
- Nativos evoluem automaticamente com Claude Code updates
- Rules carregadas no startup sem overhead de hook
- ~1800 LOC JS eliminados

**Trade-offs:**
- (+) Manutenção ~90% reduzida
- (+) Nativos são mais estáveis que custom code
- (+) Testes reduzidos de 749 para ~50 (hooks)
- (-) Perde precisão de context brackets (~60% cobertura vs 100%)
- (-) Perde diagnostics sofisticados (10 collectors → 1 Stop hook)
- (-) Migração não-trivial (~2-3 sprints)

**Consenso:** Unânime

---

#### D11: Injeção Hierárquica XML com Priority Attributes

**Decisão:** O output do UserPromptSubmit hook segue formato XML estruturado com atributos de prioridade para truncamento inteligente.

```xml
<agent-context priority="critical">
  <identity>Dex - Full Stack Developer - test-first, pragmatic</identity>
  <constraints>never push main | always test | follow patterns</constraints>
</agent-context>

<session-state priority="high">
  <branch>feature/auth</branch>
  <story>AGF-3</story>
  <activation-level>3 (Full Context)</activation-level>
</session-state>

<keyword-rules priority="medium">
  <!-- Só aparece quando keywords matcham no prompt -->
  <rule trigger="supabase">Use RLS policies. Check migrations first.</rule>
</keyword-rules>

<context-bracket priority="low">
  <status>MODERATE (est. 55% remaining)</status>
  <advice>Consider /compact if session exceeds 30 exchanges.</advice>
</context-bracket>
```

**Rationale (Karpathy):**
1. XML tags dão saliência — o LLM trata `<identity>` como mais importante que texto plano
2. Priority attributes permitem truncamento ordenado (low → medium → high → critical)
3. Sparse injection — keyword-rules só aparece quando triggered (zero tokens desperdiçados)
4. Debuggable — humano pode ler o output e entender exatamente o que foi injetado

**Trade-offs:**
- (+) Priorização explícita de contexto
- (+) Sparse (zero overhead quando sem keywords)
- (+) Debuggável por humanos
- (-) XML adiciona overhead de tokens (~10% vs plain text)
- (-) LLMs não "entendem" priority attributes nativamente — é guia heurístico

**Consenso:** Unânime

---

#### D12: Inversão de Bracket — Mais Injeção Quando Menos Contexto

**Decisão:** O volume de contexto injetado pelo UserPromptSubmit é inversamente proporcional ao contexto restante disponível.

| Bracket | Est. Context % | Injeção Total | Composição |
|---------|---------------|---------------|------------|
| FRESH | 60-100% | ~200 tokens | session-state + keyword-rules |
| MODERATE | 40-60% | ~400 tokens | + context-bracket warning |
| DEPLETED | 25-40% | ~600 tokens | + agent-context re-injection (DNA) |
| CRITICAL | 0-25% | ~800 tokens | + handoff recommendation |

**Rationale (Karpathy):** Quando o contexto está cheio (FRESH), o system prompt original ainda está na memória de trabalho do modelo — não precisa de reforço. Quando está depletado (DEPLETED), o system prompt foi compactado e o modelo perdeu saliência da persona. A re-injeção de DNA compensa a perda.

**Estimativa de bracket sem SYNAPSE engine:** Heurística baseada em `prompt_count` persistido no `$CLAUDE_ENV_FILE`:
```
prompt_count < 10  → FRESH
prompt_count < 25  → MODERATE
prompt_count < 40  → DEPLETED
prompt_count >= 40 → CRITICAL
```

**Trade-offs:**
- (+) Compensa degradação de persona pós-compactação
- (+) Reforço de identidade quando mais necessário
- (-) Estimativa de bracket é heurística (~60% precisão vs SYNAPSE)
- (-) Consome tokens de contexto quando contexto é escasso (paradoxal mas necessário)

**Consenso:** Unânime

---

## Visão Consolidada: Arquitetura de Ativação v2.0

### Diagrama Estrutural

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT FILE (.md)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ FRONTMATTER (name, model, memory:project, skills)     │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ === PERSONA DNA === (~150 tokens, IMUTÁVEL)            │  │
│  │  Identity: name, role, style, authority                │  │
│  │  Constraints: ALWAYS/NEVER rules                       │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ === ENHANCEMENT === (degradável)                        │  │
│  │  Activation Flow, Commands, Guides                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
       ╔══════════╗    ╔══════════╗    ╔══════════╗
       ║ Nível 0  ║    ║ Nível 1  ║    ║ Nível 2  ║
       ║ DNA only ║    ║ + Memory ║    ║ + Rules  ║
       ║ Task tool║    ║ 200 lines║    ║ glob-tgt ║
       ║ 70-80%   ║    ║ 80-85%   ║    ║ 85-92%   ║
       ╚══════════╝    ╚══════════╝    ╚══════════╝
                                            │
                                      ╔═════╧═════╗
                                      ║  Nível 3   ║
                                      ║ SYNAPSE-   ║
                                      ║ Lite       ║
                                      ║ (4 hooks)  ║
                                      ║ 95-100%    ║
                                      ╚════════════╝
```

### SYNAPSE: Antes → Depois

| Componente | Antes (Engine) | Depois (SYNAPSE-Lite) |
|-----------|---------------|----------------------|
| Runtime | ~2000 LOC JS custom | 4 hooks bash (~200 LOC) |
| Testes | 749 unitários | ~50 (hooks) |
| Domains | .synapse/ manifest + files | .claude/rules/*.md com glob |
| Sessions | .synapse/sessions/ JSON | $CLAUDE_ENV_FILE + agent-memory |
| Brackets | Cálculo preciso no engine | Heurística no UserPromptSubmit |
| Diagnostics | 10 collectors, quality scoring | Stop hook quality gate |
| Memory | MemoryBridge Pro-gated | memory: project nativo |
| Ativação | UAP + greeting-builder JS | SessionStart hook + frontmatter |

### Memória: Antes → Depois

```
ANTES (4 locais)                        DEPOIS (2 + rules)
─────────────                           ────────────────
.aios-core/.../MEMORY.md        ←junction→  .claude/agent-memory/{id}/MEMORY.md  ✅ preservado
.aios-core/.../agent-context.md              ├→ .claude/rules/agent-{id}-*.md     ✅ migrado
.synapse/agent-{id}                          └→ skills: no frontmatter            ✅ migrado
.synapse/sessions/                           $CLAUDE_ENV_FILE                     ✅ migrado
```

---

## Roadmap de Implementação

### Phase A: Foundation (Story AGF-4, ~8h)

- [ ] Atualizar IDE sync (`claude-agents.js`) para gerar separação DNA/Enhancement
- [ ] Implementar SessionStart hook (branch info, project status, active agent restore)
- [ ] Implementar PreCompact hook (persona DNA preservation)
- [ ] Criar `.claude/rules/` com rules migradas de agent-context.md
- [ ] Validar Nível 0 (DNA funciona no Task tool sem hooks)

### Phase B: SYNAPSE-Lite (Story AGF-5, ~8h)

- [ ] Implementar UserPromptSubmit hook (agent switch + keyword RECALL + bracket estimation)
- [ ] Migrar SYNAPSE domains para `.claude/rules/` com glob patterns
- [ ] Implementar Stop hook (quality gate)
- [ ] Implementar injeção hierárquica XML com priority
- [ ] Eliminar dependência do .synapse/ runtime directory

### Phase C: Consolidation (Story AGF-6, ~4h)

- [ ] Migrar agent-context.md → rules + frontmatter skills
- [ ] Deprecar UAP (unified-activation-pipeline.js)
- [ ] Deprecar greeting-builder.js
- [ ] Atualizar agent-system-architecture.md com nova arquitetura
- [ ] Cross-IDE validation (Codex, Gemini, Cursor junctions)

---

## Análise de Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Hooks nativos mudam API em update do Claude Code | Média | Alto | Hooks são bash simples, fácil adaptar |
| Heurística de bracket imprecisa vs SYNAPSE engine | Alta | Médio | Manter métricas de prompt_count, iterar heurística |
| Migração quebra agentes existentes | Média | Alto | Feature flag, rollback path, testes antes de merge |
| agent-context.md removal quebra Codex/Gemini sync | Média | Médio | Preservar em paralelo durante transição |
| PreCompact customInstructions não honrado pelo Claude | Baixa | Médio | D12 (bracket DEPLETED) compensa como fallback |

---

## Referências

| Recurso | Path |
|---------|------|
| Story AGF-3 | `docs/stories/epics/epic-agent-fidelity/story-AGF-3-optimal-agent-activation.md` |
| Agent System Architecture | `docs/architecture/agent-system-architecture.md` |
| SYNAPSE Flowcharts | `docs/architecture/SYNAPSE/SYNAPSE-FLOWCHARTS.md` |
| Research: Skills Advanced | `docs/research/2026-02-09-claude-code-skills-advanced/` |
| Research: Synergy | `docs/research/2026-02-09-claude-code-agents-teams-skills-synergy/` |
| Story AGF-1 (Defense-in-Depth) | `docs/stories/epics/epic-agent-fidelity/story-AGF-1-defense-in-depth-context.md` |

---

## Participantes do Roundtable

### Sessão 1 — Infraestrutura & Decomposição
| Mente | Papel | Contribuição Principal |
|-------|-------|----------------------|
| **Brad Frost** | Atomic Design | Decomposição em átomos/moléculas, progressive enhancement, component status propagation |
| **Mitchell Hashimoto** | IaC / DevOps | Plan/Apply model, declarative desired state, immutability, state management |
| **Pedro Valério** | Process Absolutism | Mapeamento de cenários de falha, defense-in-depth, deterministic checklist |

### Sessão 2 — Fidelidade & Cognição
| Mente | Papel | Contribuição Principal |
|-------|-------|----------------------|
| **Alan Nicolas** | IA Expert / Voice DNA | Hierarquia de saliência, consolidação de memória (Elimina→Automatiza→Amplifica), SYNAPSE-Lite design |
| **Andrej Karpathy** | Practical AI | Prompt-as-program, 5 camadas cognitivas, primacy effect, injeção hierárquica XML, bracket inversão |
| **Pedro Valério** | Ponte S1↔S2 | Validação cruzada, gap identification (granularidade, medição, reinjeção), deterministic resolution |

---

*ADR criado: 2026-02-19*
*Método: Roundtable duplo com 5 mentes cognitivas via Mirror (@emulator)*
*Epic: Agent Fidelity (AGF) — CLI First | Observability Second | UI Third*
