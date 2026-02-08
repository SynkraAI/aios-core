# Bob vs Ralph — Comparação e Estratégia de Convergência

**Documento de Investigação**
**Data:** 2026-02-05
**Autor:** @pm (Bob)
**Epic Reference:** Epic 13

---

## Visão Geral

Bob (AIOS Orchestrator) e Ralph (Wiggum Technique) resolvem problemas complementares. Esta comparação identifica os gaps do Bob e o que adotar do Ralph.

---

## Comparação Lado a Lado

### Capacidades Core

| Capacidade | Bob (AIOS) | Ralph (Wiggum) |
|-----------|------------|-----------------|
| **Decision Intelligence** | SurfaceChecker com thresholds calibrados | Não existe — executa tudo |
| **Executor Assignment** | Dinâmico por keyword matching | Fixo (definido no PRD) |
| **Session Recovery** | SessionState com crash recovery | State file (mais frágil) |
| **Human-in-loop** | Surface criteria (smart, gradual) | Auto-mode flag (tudo ou nada) |
| **Execução Real** | ❌ Echo stubs (pm.sh linhas 386-398) | ✅ `claude -p` funciona |
| **Loop Autônomo** | ❌ Não existe | ✅ while loop ou stop hook |
| **Completion Verification** | ❌ Confia no self-report | ✅ Evidence-based (files + tests) |
| **Fresh Context** | ❌ Mesma sessão (compaction) | ✅ Nova invocação por iteração |
| **Progress Tracking** | ObservabilityPanel (runtime) | progress.txt (persistent) |
| **Codebase Patterns** | ❌ Não existe | ✅ AGENTS.md por diretório |
| **IDS (REUSE>ADAPT>CREATE)** | Planejado (Stories 13.4-13.5) | Não existe |
| **Multi-agent** | Planejado (ExecutorAssignment) | ralph-parallel.sh, ralph-swarm.sh |
| **Cost Control** | ❌ Não existe | ❌ Não nativo (--max-budget-usd resolve) |
| **Tool Scoping** | ❌ Todos os tools para todos | ❌ Mesmo (--allowed-tools resolve) |

### Stack Técnica

| Aspecto | Bob | Ralph |
|---------|-----|-------|
| Linguagem | Node.js + Bash (pm.sh) | Bash puro |
| State | session-state.js (JSON) | prd.json + progress.txt |
| Orchestration | bob-orchestrator.js (complexo) | ralph.sh (60 linhas) |
| Terminal | terminal-spawner.js + pm.sh | Direto (`claude -p`) |
| Config | core-config.yaml | CLAUDE.md + prd.json |
| Tests | Jest (existentes) | npm test inline |

---

## Onde Ralph é Superior

### 1. Pragmatismo de Execução

Ralph simplesmente **funciona**. 60 linhas de bash que executam de verdade, vs centenas de linhas de orchestration que fazem echo.

```bash
# Ralph: funciona
claude -p --dangerously-skip-permissions < CLAUDE.md

# Bob: simula
echo 'Executing: @dev *task params'
```

### 2. Fresh Context por Iteração

Cada iteração do Ralph é uma **nova invocação** do Claude. Isso resolve o problema de compaction (context window cheia) que o Bob enfrenta em sessões longas.

```
Ralph: Iteration 1 → fresh context
       Iteration 2 → fresh context (vê git history)
       Iteration 3 → fresh context (vê progress.txt)

Bob:   Turn 1 → context OK
       Turn 50 → context compactado, perde detalhes
       Turn 100 → sistema de compaction lutando
```

### 3. Evidence-Based Completion

Ralph não confia no self-report do agente. Checa evidência real:

```bash
# Testes passam?
npm test

# Arquivo esperado existe?
[ -f "$OUTPUT_FILE" ]

# Promise no output?
grep "<promise>COMPLETE</promise>"
```

### 4. Memória Distribuída (AGENTS.md)

Ralph atualiza `AGENTS.md` por diretório com learnings. Claude lê automaticamente. Cada parte do código acumula conhecimento de iterações anteriores.

```
src/api/AGENTS.md    → "Use prepared statements for all queries"
src/auth/AGENTS.md   → "JWT refresh tokens need 7d expiry"
src/ui/AGENTS.md     → "Use Radix primitives for accessibility"
```

---

## Onde Bob é Superior

### 1. Decision Intelligence

Bob sabe **quando perguntar** ao humano. Ralph executa cegamente.

```javascript
// Bob: checa se precisa de input humano
if (surfaceChecker.shouldSurface(context)) {
  // Mostra ao humano com contexto
  surface(context, criteria);
}

// Ralph: não tem este conceito
// Roda até max_iterations e espera o melhor
```

### 2. Executor Assignment

Bob mapeia automaticamente o tipo de trabalho ao agente correto:

```javascript
// "Implement authentication handler" → @dev (code_general)
// "Create RLS policies" → @data-engineer (database)
// "Design system architecture" → @architect (architecture)
```

Ralph depende do humano definir tudo no PRD manualmente.

### 3. Session Recovery

Bob persiste estado e recupera de crashes:

```javascript
const session = await sessionState.load();
if (session.status === 'interrupted') {
  await resume(session);
}
```

Ralph perde o progresso se o bash loop for interrompido (mas tem progress.txt como backup).

### 4. IDS (Planejado)

O IDS força REUSE > ADAPT > CREATE — previne duplicação. Ralph não tem conceito equivalente.

---

## Estratégia de Convergência

### O que Bob Deve Adotar do Ralph

| # | Padrão Ralph | Implementação Bob | Story |
|---|-------------|-------------------|-------|
| 1 | `claude -p --dangerously-skip-permissions` | Substituir echo stubs no pm.sh | **13.1** |
| 2 | `--append-system-prompt` para agent def | Ativação real de agente | **13.1** |
| 3 | `<promise>COMPLETE</promise>` detection | CompletionVerifier | **13.1** (básico), **13.2** (avançado) |
| 4 | Evidence-based check (tests + files) | Quality gate pós-iteração | **13.1** |
| 5 | Fresh context por iteração | Nova invocação `claude -p` no loop | **13.1** |
| 6 | progress.txt append-only | Iteration logging com codebase patterns | **13.1** |
| 7 | `--max-budget-usd` | Cost ceiling por iteração | **13.1** |
| 8 | AGENTS.md por diretório | Knowledge accumulation | Futuro |
| 9 | Skills com frontmatter | Migração commands → skills | Futuro |
| 10 | Stop hook (plugin oficial) | Ralph loop in-session | **13.3** |

### O que Ralph Não Tem (Vantagens do Bob a Preservar)

| # | Vantagem Bob | Como Preservar |
|---|-------------|----------------|
| 1 | SurfaceChecker (human-in-loop smart) | Integrar no loop: se max_iterations → surface |
| 2 | ExecutorAssignment (agent routing) | Auto-detect no bob-loop.sh |
| 3 | SessionState (crash recovery) | Manter como fallback |
| 4 | IDS (REUSE > ADAPT > CREATE) | Stories 13.4-13.5 como planejado |
| 5 | ObservabilityPanel | Métricas do loop alimentam o panel |

---

## Resultado: bob-loop.sh

O produto da convergência é o `bob-loop.sh` (Story 13.1):

```
bob-loop.sh = Ralph execution pragmatism + Bob decision intelligence
```

Especificamente:
- **De Ralph:** `claude -p`, fresh context, completion promise, progress.txt, evidence-based checks
- **De Bob:** executor-assignment (auto-detect agent), agent definitions, story-driven development, --max-budget safety
- **Novo:** `--append-system-prompt` para ativação real (nem Ralph nem Bob tinham)

### Comando Final

```bash
# Bob + Ralph convergidos
./bob-loop.sh docs/stories/active/12.14.story.md --max-iterations 3 --max-budget 5

# Internamente executa:
claude -p \
  --append-system-prompt "$(cat .aios-core/development/agents/dev.md)" \
  --dangerously-skip-permissions \
  --max-budget-usd 5 \
  "Implement story... [iteration context + progress]"
```

---

## Roadmap de Evolução

```
Fase 1 (Agora): bob-loop.sh com --append-system-prompt
    ↓ validar que funciona
Fase 2: Migrar @dev para SKILL.md com hooks
    ↓ validar hooks (PostToolUse, Stop)
Fase 3: Stop hook para in-session Ralph loop
    ↓ /bob-loop command
Fase 4: IDS (Entity Registry + Decision Engine)
    ↓ REUSE > ADAPT > CREATE
Fase 5: Multi-agent parallel (ralph-parallel pattern)
    ↓ dependency-aware scheduling
```

Cada fase é validável independentemente. Se uma falhar, não bloqueia as outras.

---

*Pesquisa realizada em 2026-02-05 por @pm (Bob)*
*Consolidando: todas as pesquisas Ralph, MMOS, CLI flags, AAA*
