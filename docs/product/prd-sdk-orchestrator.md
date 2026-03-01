# PRD: AIOS SDK Orchestrator

**Autor:** Morgan (PM Agent)
**Data:** 2026-03-01
**Versao:** 1.0
**Status:** DRAFT
**Documentos base:**
- `docs/architecture/sdk-orchestrator-architecture.md` (arquitetura tecnica)
- `docs/architecture/sdk-orchestrator-validation.md` (validacao: 0 FAIL, 14 CONCERNS, 19 PASS)
- `docs/research/multi-agent-approaches-comparison.md` (pesquisa de alternativas)

---

## Change Log

| Data | Versao | Descricao | Autor |
|------|--------|-----------|-------|
| 2026-03-01 | 1.0 | PRD inicial completo | Morgan (@pm) |

---

## 1. Visao do Produto

### O que e

O AIOS SDK Orchestrator e um processo Node.js (~500 linhas de codigo) que coordena a execucao dos 11 agentes de IA do AIOS como sessoes isoladas e independentes. Hoje, todos os agentes (dev, qa, architect, devops, pm, po, sm, analyst, data-engineer, ux, aios-master) operam como personas dentro de uma unica sessao Claude Code -- compartilhando contexto, ferramentas e permissoes sem isolamento real. O Orchestrator muda esse modelo: cada agente passa a ter sessao propria, ferramentas restritas, orcamento controlado e contexto isolado.

### Para quem

- **Fase 1 (MVP):** Lucas, dono do negocio e operador solo do AIOS no servidor atual (7.8GB RAM, 2 CPUs AMD EPYC, Ubuntu 22.04)
- **Fase 2 (futuro):** Multi-tenant -- outros desenvolvedores e equipes usando o mesmo servidor, cada um com suas configuracoes, budgets e sessoes isoladas

### Qual problema resolve

O AIOS hoje depende de coordenacao manual entre agentes. Lucas precisa invocar cada agente individualmente, copiar contexto entre eles, e monitorar o processo inteiro em tempo real. Isso impede execucao autonoma (overnight), desperadica tempo em operacoes repetitivas, e nao oferece garantias de que as regras de autoridade (quem pode fazer git push, quem pode editar codigo) sejam respeitadas de forma estrutural.

O Orchestrator resolve esses problemas ao automatizar o fluxo completo do Story Development Cycle (SDC) -- da criacao da story ate o push do PR -- com governanca automatica, controle de custo e observabilidade em tempo real via Telegram.

### Visao de futuro

O SDK Orchestrator e a base tecnica para tres evolucoes estrategicas:

1. **Execucao overnight sem supervisao:** Processar batches de stories durante a madrugada, entregando PRs prontos pela manha
2. **Multi-tenant:** Permitir que multiplos usuarios no mesmo servidor tenham agentes orquestrados com isolamento completo (configs, budgets, sessoes por tenant)
3. **Agent Teams:** Quando a feature experimental de Agent Teams do Claude Code estabilizar, usar paralelismo nativo para fases que se beneficiam de multiplos agentes simultaneos (QA com multiplos revisores, brownfield assessment paralelo)

---

## 2. Personas

### 2.1 Lucas (Operador Solo -- Fase 1)

| Atributo | Detalhe |
|----------|---------|
| Perfil | Dono do negocio, desenvolvedor senior, operador unico do AIOS |
| Infraestrutura | 1 servidor (7.8GB RAM, 2 CPUs, Node v22, Ubuntu 22.04) |
| Uso tipico | Inicia workflows via CLI, monitora progresso pelo Telegram, revisa resultados pela manha |
| Dor principal | Coordenacao manual entre agentes consome tempo e impede execucao autonoma |
| Expectativa | Lanca `node orchestrator.mjs --story 3.1` e recebe PR pronto com custo controlado |

### 2.2 Desenvolvedor/Equipe (Futuro -- Fase 2)

| Atributo | Detalhe |
|----------|---------|
| Perfil | Desenvolvedor ou equipe usando AIOS em servidor compartilhado |
| Uso tipico | Cada usuario tem configuracoes proprias, budgets separados, agentes orquestrados |
| Dor principal | Sem isolamento, acoes de um usuario afetam o ambiente de outro |
| Expectativa | Tenant isolation completo com budget por usuario e audit trail |

---

## 3. Problemas que Resolve

### P1: Coordenacao Manual de Agentes

**Hoje:** Lucas invoca `@sm`, copia o output, invoca `@po`, copia novamente para `@dev`, e assim por diante. Cada troca de agente exige intervencao humana.

**Com Orchestrator:** O workflow SDC executa automaticamente SM -> PO -> DEV -> QA -> DevOps, passando contexto entre fases programaticamente.

### P2: Sem Isolamento Entre Agentes

**Hoje:** Todos os agentes rodam no mesmo context window. O @qa poderia, teoricamente, editar arquivos. O @dev poderia fazer git push. A authority matrix e apenas uma instrucao no prompt, nao uma restricao estrutural.

**Com Orchestrator:** Cada agente roda em `query()` isolada com `allowedTools`/`disallowedTools` especificos. @po so pode ler. @dev nao pode fazer push. Governance hooks bloqueiam violacoes em tempo real.

### P3: Sem Controle de Custos por Agente

**Hoje:** Sem visibilidade de quanto cada agente gasta. Um agente pode consumir todo o budget de uma tarefa.

**Com Orchestrator:** `maxBudgetUsd` por agente por `query()` + budget total por workflow. Se o custo excede o limite, o workflow aborta automaticamente e notifica via Telegram.

### P4: Sem Execucao Autonoma (Overnight)

**Hoje:** Todo workflow requer presenca humana. Nao e possivel processar stories overnight.

**Com Orchestrator:** systemd service com restart automatico. Script de batch processa stories do backlog durante a noite. Notificacoes no Telegram informam progresso e erros.

### P5: Sem Observabilidade em Tempo Real

**Hoje:** Lucas precisa estar na sessao Claude Code para ver o que os agentes estao fazendo.

**Com Orchestrator:** Comms Bridge escreve no outbox do Telegram Bridge. Cada troca de agente, tool call significativo, erro e conclusao gera notificacao automatica.

---

## 4. Requisitos Funcionais

### 4.1 Orquestracao de Workflows

**FR-001: Execucao do SDC completo**
O Orchestrator deve executar o Story Development Cycle completo como state machine sequencial: SM:CREATE -> PO:VALIDATE -> DEV:IMPLEMENT -> QA:GATE -> DEVOPS:PUSH. Cada fase invoca o agente correspondente via `query()` do Claude Agent SDK.

**FR-002: Transicoes condicionais com retry**
O Workflow Engine deve suportar decisoes condicionais com backward-jump retry:
- PO NO-GO (score < 7): Retorna para SM:CREATE (max 2 retries)
- QA FAIL: Retorna para DEV:IMPLEMENT (max 3 retries)
- QA CONCERNS: Prossegue com nota (nao bloqueante)
- Budget excedido: Aborta workflow

**FR-003: Persistencia de estado do workflow**
O estado do workflow (fase atual, historico de fases, custos acumulados, retries) deve ser persistido em `.aios/orchestrator/workflow-state.json`. Se o processo reiniciar, deve retomar da fase onde parou.

**FR-004: Skip condicional de fases**
Se a story ja existe (ficheiro `.story.md` presente), a fase SM:CREATE deve ser pulada automaticamente.

**FR-005: Suporte ao QA Loop**
Alem do SDC, o Orchestrator deve suportar o workflow QA Loop: QA:REVIEW -> DEV:FIX -> QA:REVIEW (max 5 iteracoes), como workflow independente ou integrado ao SDC.

**FR-006: Workflows adicionais (Fase 2)**
Suporte futuro para Spec Pipeline (PM -> Architect -> Analyst -> PM -> QA -> Architect) e Brownfield Discovery como workflows adicionais.

### 4.2 Sessoes Isoladas por Agente

**FR-007: Uma query() por agente por fase**
Cada agente executa em uma chamada `query()` isolada com parametros independentes: `systemPrompt`, `allowedTools`, `disallowedTools`, `model`, `maxBudgetUsd`, `permissionMode`, `hooks`.

**FR-008: Sem continuidade de sessao entre agentes**
Nao ha session resume entre agentes. O contexto e passado explicitamente via prompt (story file, resultado da fase anterior, git diff quando relevante).

**FR-009: System prompt em 3 camadas**
O system prompt de cada agente e construido a partir de:
- Camada 1: Ficheiro de persona do agente (`.claude/commands/AIOS/agents/{agent}.md`)
- Camada 2: CLAUDE.md e rules (carregados automaticamente pelo SDK via `settingSources`)
- Camada 3: Contexto do workflow (story file, resultados de fases anteriores)

### 4.3 Authority Matrix (Tool Restrictions)

**FR-010: Restricoes de ferramentas por agente**
Cada agente tem `allowedTools` e `disallowedTools` configurados conforme a authority matrix:

| Agente | allowedTools | disallowedTools |
|--------|-------------|-----------------|
| @sm | Read, Write, Grep, Glob | Bash, Edit |
| @po | Read, Grep, Glob | Edit, Write, Bash |
| @dev | Read, Edit, Write, Bash, Grep, Glob | (nenhum) |
| @qa | Read, Grep, Glob, Bash | Edit, Write |
| @devops | Read, Bash, Grep, Glob | Edit, Write |
| @architect | Read, Grep, Glob, WebSearch, WebFetch | Edit, Write, Bash |
| @pm | Read, Write, Grep, Glob | Bash, Edit |
| @analyst | Read, Grep, Glob, WebSearch, WebFetch | Edit, Write, Bash |
| @data-engineer | Read, Edit, Write, Bash, Grep, Glob | (nenhum) |
| @ux-design-expert | Read, Grep, Glob, WebSearch | Edit, Write, Bash |
| @aios-master | (todos) | (nenhum) |

**FR-011: Filtragem de comandos Bash com resistencia a evasao**
Para agentes com acesso a Bash mas com restricoes especificas (dev, qa, data-engineer), o Orchestrator deve aplicar governance hooks `PreToolUse` com regex multi-camada que detectam:
- Comandos diretos (ex: `git push`)
- Binarios com path (ex: `/usr/bin/git push`)
- Caracteres escapados (ex: `gi\t pu\sh`)
- Wrappers de evasao (base64, eval, bash -c, heredoc, interpolacao de variaveis)

**FR-012: Restricao de escrita entre agentes**
Nenhum agente (exceto @aios-master) pode modificar ficheiros de persona de outros agentes (`.claude/commands/AIOS/agents/`).

### 4.4 Budget Control

**FR-013: Budget por agente por query()**
Cada `query()` tem `maxBudgetUsd` configurado no agent-registry.json:
- @sm: $3 | @po: $2 | @dev: $15 | @qa: $5 | @devops: $3
- @architect: $5 (Opus) | @aios-master: $20 (Opus)

**FR-014: Budget total por workflow**
O Workflow Engine rastreia custo acumulado de todas as fases. Se o total exceder o limite do workflow ($25 para SDC, $15 para QA Loop), o workflow aborta e notifica via Telegram.

**FR-015: Alerta de budget em progresso**
Quando o custo acumulado atinge 80% do limite do workflow, uma notificacao de alerta deve ser enviada.

### 4.5 Observabilidade via Telegram

**FR-016: Integracao com Telegram Bridge via outbox IPC**
O Comms Bridge escreve mensagens JSON em `.aios/outbox/pending/` no formato do schema `outbox-message.json` v2.0. O Telegram Bridge existente consome esses ficheiros sem nenhuma modificacao.

**FR-017: Notificacoes automaticas**
Eventos que geram notificacao:
- Inicio/conclusao de cada fase (`agent_switch`, `progress`)
- Tool calls significativos (`tool_use`)
- Conclusao do workflow com relatorio (`final`)
- Erros e falhas (`error`)
- Alertas de budget (`progress`)

**FR-018: Relatorio pos-workflow**
Ao concluir um workflow, o Orchestrator gera um relatorio resumido com duracao, custo e resultado de cada fase. O relatorio e enviado ao Telegram e salvo em `.aios/orchestrator/reports/`.

### 4.6 Execucao Overnight

**FR-019: systemd service**
O Orchestrator deve rodar como systemd service com restart automatico em caso de falha (`Restart=on-failure`, `RestartSec=10`).

**FR-020: Batch de stories**
Script de overnight (`overnight.sh`) que processa todas as stories do backlog sequencialmente. Se uma story falhar, notifica via OpenClaw e para o batch.

**FR-021: Shutdown graceful**
Ao receber SIGTERM ou SIGINT, o Orchestrator define um flag de shutdown e espera a fase atual completar antes de encerrar. O estado e persistido para permitir resume no restart.

### 4.7 Crash Recovery

**FR-022: Resume apos crash**
Se o processo crashar durante uma fase, o restart deve:
1. Ler o workflow-state.json
2. Identificar a fase incompleta (presente em `currentPhase` mas sem registro de conclusao em `phaseHistory`)
3. Re-executar a fase desde o inicio
4. Continuar o workflow

**FR-023: Deteccao de estado sujo em re-run do DEV**
Antes de re-executar DEV:IMPLEMENT apos crash, o Orchestrator deve verificar `git status --short` e incluir ficheiros sujos no prompt para que o agente avalie o estado atual antes de continuar.

### 4.8 CLI Interface

**FR-024: Interface de linha de comando**
```
node orchestrator.mjs --workflow sdc --story <path> [--max-budget <usd>]
node orchestrator.mjs --workflow qa-loop --story <path>
node orchestrator.mjs --status
node orchestrator.mjs --abort
```

**FR-025: Output format**
Suporte para `--output-format text|json` para integracao com scripts e automacao.

### 4.9 Logging Estruturado

**FR-026: Logs em JSON com pino**
Logging estruturado via `pino` em `.aios/logs/orchestrator.log` com niveis configurados via `AIOS_LOG_LEVEL`.

**FR-027: Metricas rastreadas por workflow**
| Metrica | Granularidade |
|---------|--------------|
| Custo (USD) | Por query, por fase, por workflow |
| Duracao (ms) | Por query, por fase |
| Tool calls | Por query (contagem por tool) |
| Retries | Por fase |
| Erros | Por query |

### 4.10 Agent Registry

**FR-028: Configuracao externa de agentes**
Configuracoes dos 11 agentes em ficheiro JSON separado (`agent-registry.json`) com schema documentado: id, persona, role, model, maxBudgetUsd, permissionMode, allowedTools, disallowedTools, systemPromptFile, bashRestrictions, workflows.

**FR-029: Selecao de modelo por agente**
- `claude-opus-4-6` para architect e aios-master (raciocinio complexo)
- `claude-sonnet-4-6` para todos os outros agentes (custo-efetivo)

---

## 5. Requisitos Nao-Funcionais

### 5.1 Performance

**NFR-001: Overhead de troca de agente < 15s**
Cada chamada `query()` tem cold start de ~12s (startup do processo Claude Code). O overhead total por troca de agente (incluindo construcao de prompt e governanca) nao deve exceder 15s.

**NFR-002: SDC completo em < 15 minutos**
Um ciclo SDC tipico (story simples, sem retries) deve completar em menos de 15 minutos wall-clock, incluindo os 5 cold starts (~60s total de overhead).

### 5.2 Custo

**NFR-003: Custo por story entre $0.76 e $12.00**
- Story simples (poucos ficheiros, testes basicos): ~$0.76-2.00
- Story media (multiplos ficheiros, testes completos): ~$2.00-6.00
- Story complexa (muitos ficheiros, retries QA): ~$6.00-12.00
- Limite absoluto por SDC: $25.00 (aborta se exceder)

### 5.3 Recursos de Hardware

**NFR-004: RAM < 1GB para orchestrator + 1 worker ativo**
- Processo orchestrator: ~200MB (Node.js + state tracking)
- Subprocess query() ativo: ~500-600MB (efemero)
- Pico: ~800MB com 1 query() ativa

**NFR-005: CPU I/O bound**
O Orchestrator e predominantemente I/O bound (esperando respostas da API). Deve operar confortavelmente com 2 CPUs.

**NFR-006: Disco minimo**
Estado JSON ~1KB por workflow. Logs rotativos. Sem requirementos significativos de disco.

### 5.4 Disponibilidade

**NFR-007: Restart automatico via systemd**
Em caso de crash do processo, systemd reinicia automaticamente apos 10s com recuperacao de estado.

**NFR-008: Graceful shutdown em < 30s**
Ao receber sinal de terminacao, a fase atual deve completar ou ser salva em estado consistente dentro de 30s.

### 5.5 Seguranca

**NFR-009: Tool restrictions estruturais**
Restricoes de ferramentas sao enforced pelo SDK via `allowedTools`/`disallowedTools`, nao apenas por instrucoes no prompt. Um agente que tente usar uma ferramenta bloqueada recebe erro antes de executar.

**NFR-010: Bash filtering com resistencia a evasao**
Governance hooks devem bloquear tentativas de evasao das restricoes Bash (base64, eval, heredoc, interpolacao de variaveis) alem dos comandos diretamente bloqueados.

**NFR-011: Isolamento de ficheiros de persona**
Agentes nao podem modificar ficheiros de persona de outros agentes.

### 5.6 Logging e Auditoria

**NFR-012: Logs estruturados em JSON**
Todos os eventos significativos (inicio/fim de fase, tool calls, erros, decisoes de governanca) devem ser logados em formato JSON estruturado para analise posterior.

**NFR-013: Relatorio completo por workflow**
Cada workflow concluido gera relatorio com duracao, custo, resultado e tool calls de cada fase, salvo em `.aios/orchestrator/reports/`.

---

## 6. Constraints

### CON-001: Hardware do servidor

| Recurso | Disponivel | Implicacao |
|---------|-----------|------------|
| RAM | 7.8 GB total (~5 GB livre) | Maximo 1 query() ativa simultaneamente (800MB pico) |
| CPU | 2 cores AMD EPYC | I/O bound, suficiente para execucao sequencial |
| OS | Ubuntu 22.04, Node v22 | Compativel com Claude Agent SDK |

### CON-002: Dependencia principal unica

O Claude Agent SDK (`@anthropic-ai/claude-agent-sdk` v0.2.63) e a unica dependencia principal nova. Ja esta instalada no projeto (`package.json`). Dependencias secundarias (`pino`, `yaml`) ja existem no `packages/session-daemon/`.

### CON-003: Integracao com Telegram Bridge via outbox IPC

A comunicacao com o Telegram Bridge existente e exclusivamente via ficheiros JSON no diretorio `.aios/outbox/pending/`, usando o `OutboxWriter` do `packages/session-daemon/src/outbox-writer.js`. Nao ha comunicacao direta ou API entre os dois processos.

### CON-004: CLI First (Constitution Artigo I)

O Orchestrator e um processo CLI. Nao ha UI, dashboard ou web interface. Toda operacao e via linha de comando. Observabilidade e via Telegram (leitura) e logs estruturados (analise).

### CON-005: Agent Authority (Constitution Artigo II)

A authority matrix (`agent-authority.md`) e inegociavel. O Orchestrator deve respeitar:
- Apenas @devops pode fazer git push
- Apenas @dev pode editar codigo
- @qa apenas observa (sem Edit/Write)
- @po apenas valida (sem Edit/Write/Bash)

### CON-006: SDK experimental

O Claude Agent SDK v0.2.63 e um SDK em evolucao. APIs podem mudar entre versoes. O Orchestrator deve ser defensivo quanto a mudancas de interface e testar compatibilidade antes de atualizar versoes do SDK.

### CON-007: Execucao sequencial na Fase 1

Na Fase 1, apenas execucao sequencial (1 query() por vez). Paralelismo sera avaliado na Fase 2+ quando Agent Teams estabilizar e o servidor comportar.

---

## 7. Fases de Entrega (Roadmap)

### Phase 0 -- Proof of Concept (2-3 dias)

**Objetivo:** Provar que `claude -p` com flags de governanca por agente pode executar um SDC completo sequencialmente.

**Entregavel:** `scripts/orchestrator-poc.sh`

**Escopo:**
- Script shell/Node.js que executa SDC com `claude -p`
- Cada agente = uma chamada `claude -p` com `--system-prompt`, `--allowed-tools`, `--model`, `--max-budget-usd`
- Output de cada fase alimenta a proxima via ficheiros temporarios
- Notificacao final via OpenClaw

**Prova:**
- Isolamento de agentes via processos separados funciona
- Tool restrictions via `--allowed-tools` sao respeitadas
- Budget caps via `--max-budget-usd` sao enforced
- System prompts de persona produzem comportamento correto

**Nao prova:**
- Governance hooks (PreToolUse nao existe no modo CLI)
- Streaming em tempo real para Telegram
- Tratamento de erros programatico

### Phase 1 -- MVP: SDK Orchestrator (1-2 semanas)

**Objetivo:** Orchestrator completo usando Claude Agent SDK `query()` com governanca, observabilidade e crash recovery.

**Entregavel:** `packages/aios-orchestrator/orchestrator.mjs` + `agent-registry.json` + systemd service

**Stories previstas:**

| # | Story | Escopo | Estimativa |
|---|-------|--------|-----------|
| 1.1 | Agent Registry + Session Manager | Carregar configs, rodar agente unico via query() | 2 dias |
| 1.2 | Governance Hooks | PreToolUse authority matrix, filtragem Bash resistente a evasao | 1 dia |
| 1.3 | SDC Workflow Engine | State machine, transicoes de fase, persistencia de estado | 2 dias |
| 1.4 | Comms Bridge | Integracao com outbox para Telegram via OutboxWriter | 1 dia |
| 1.5 | CLI Entry Point + Error Handling | Parsing de argumentos, sinais, crash recovery | 1 dia |
| 1.6 | QA Loop Workflow | Ciclo iterativo fix-review (max 5 iteracoes) | 1 dia |
| 1.7 | Integration Testing | Teste end-to-end do SDC com agentes reais | 2 dias |

**Dependencias tecnicas:**
- `@anthropic-ai/claude-agent-sdk` v0.2.63 (ja no package.json)
- `pino` (ja em session-daemon)
- `yaml` (ja em session-daemon)
- Nenhuma dependencia nova necessaria

**Criterios de aceite da Phase 1:**
- SDC completo executado sem intervencao humana
- Authority matrix enforced estruturalmente (nao so por prompt)
- Budget tracking com abort automatico
- Notificacoes no Telegram em cada transicao de fase
- Crash recovery funcional (matar processo, reiniciar, retomar)
- Logging estruturado em JSON

### Phase 2 -- Multi-tenant (futuro, apos validacao da Phase 1)

**Objetivo:** Permitir que multiplos usuarios compartilhem o servidor com isolamento completo.

**Escopo previsto:**
- Configuracao por tenant (agent-registry por usuario, budgets separados)
- Isolamento de sessoes (workspaces, worktrees por tenant)
- Autenticacao e autorizacao (quem pode rodar o que)
- Audit trail por tenant (quem gastou quanto, quais stories processou)
- Rate limiting por tenant

**Pre-requisito:** Phase 1 estavel e validada em producao por pelo menos 2 semanas.

### Phase 3 -- Agent Teams (futuro, quando feature estabilizar)

**Objetivo:** Usar paralelismo nativo do Claude Code para fases que se beneficiam de multiplos agentes simultaneos.

**Escopo previsto:**
- QA review com multiplos revisores (code quality + security + performance)
- Brownfield assessment com coleta de dados paralela (architect + data-engineer + UX)
- Integracao com hooks TeammateIdle e TaskCompleted para quality gates

**Pre-requisitos:**
- Agent Teams sair de experimental (feature flag `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`)
- Suporte a per-teammate tool restrictions (hoje todos herdam do lead)
- Server com RAM suficiente para multiplas queries simultaneas

---

## 8. Criterios de Sucesso

### 8.1 Criterios Quantitativos

| Criterio | Meta | Medicao |
|----------|------|---------|
| SDC completo overnight sem intervencao | 100% das execucoes completam ou abortam com estado salvo | Logs do orchestrator |
| Custo por story dentro do budget | $0.76-$12.00, nunca excedendo $25 | workflow-state.json |
| Tempo de SDC (story simples) | < 15 minutos | Relatorio pos-workflow |
| Notificacoes Telegram funcionando | 100% dos eventos de fase geram notificacao | Outbox files + Telegram delivery |
| Zero violacoes de authority matrix | 0 execucoes de ferramentas bloqueadas | Logs de governance hooks |
| Crash recovery funcional | Retoma em < 15s apos restart | Logs systemd + workflow state |

### 8.2 Criterios Qualitativos

| Criterio | Validacao |
|----------|----------|
| Lucas pode dormir enquanto stories sao processadas | Feedback do usuario apos 1 semana de uso |
| Stories produzidas pelo orchestrator tem qualidade equivalente ao fluxo manual | Revisao por @po de 5 stories geradas autonomamente |
| Custo e previsivel e sem surpresas | Variacao < 2x entre stories de complexidade similar |
| Governanca e transparente e auditavel | Logs de governance mostram cada decisao de allow/deny |

---

## 9. Riscos e Mitigacoes

### R1: Cold Start de ~12s por query()

| Aspecto | Detalhe |
|---------|---------|
| Probabilidade | CERTA (comportamento documentado do SDK) |
| Impacto | BAIXO (overhead total ~60s em SDC de 5 fases, aceitavel) |
| Mitigacao | Aceitar o overhead. Para Phase 3, avaliar `streamInput()` que tem sub-1s apos warm-up, ao custo de complexidade de lifecycle |

### R2: Custo pode escalar com stories complexas

| Aspecto | Detalhe |
|---------|---------|
| Probabilidade | MEDIA (depende da complexidade das stories) |
| Impacto | MEDIO ($12 por story complexa vs $2 por story simples) |
| Mitigacao | Budget caps por agente e por workflow. Alertas em 80% do budget. Abort automatico ao exceder limite. Relatorios de custo para analise de tendencias |

### R3: SDK experimental pode mudar APIs

| Aspecto | Detalhe |
|---------|---------|
| Probabilidade | MEDIA (SDK v0.2.63 indica pre-1.0) |
| Impacto | MEDIO (pode requerer refactoring do Orchestrator) |
| Mitigacao | Pinning de versao no package.json. Testar em branch separado antes de atualizar. Manter o Orchestrator em ~500 LOC para facilitar adaptacao. Monitorar changelog do SDK |

### R4: Agente LLM pode produzir resultado inesperado

| Aspecto | Detalhe |
|---------|---------|
| Probabilidade | MEDIA (LLMs podem alucinar ou desviar do prompt) |
| Impacto | ALTO (story mal-implementada, QA gate burlado por resposta ambigua) |
| Mitigacao | Parsing robusto de decisoes (GO/NO-GO, PASS/FAIL) com fallback para retry. QA gate como safety net. Max retries por fase para evitar loops infinitos. Relatorio detalhado para revisao humana |

### R5: Conflitos de git em execucao simultanea

| Aspecto | Detalhe |
|---------|---------|
| Probabilidade | BAIXA (execucao sequencial na Phase 1) |
| Impacto | MEDIO (merge conflicts, estado sujo) |
| Mitigacao | Phase 1 e sequencial (1 story por vez). Recomendacao de rodar overnight sem sessoes interativas. Para coexistencia, usar git worktrees separados |

### R6: RAM insuficiente para queries paralelas (futuro)

| Aspecto | Detalhe |
|---------|---------|
| Probabilidade | ALTA (se tentar 2+ queries em servidor atual) |
| Impacto | ALTO (OOM kill, perda de trabalho) |
| Mitigacao | Phase 1 limita a 1 query() ativa. systemd MemoryMax=512M previne OOM do orchestrator. Paralelismo adiado para Phase 3 com avaliacao de recursos |

### R7: Telegram Bridge offline durante execucao

| Aspecto | Detalhe |
|---------|---------|
| Probabilidade | BAIXA |
| Impacto | BAIXO (observabilidade prejudicada, workflow nao e afetado) |
| Mitigacao | Comms Bridge escreve no outbox independentemente do Telegram Bridge estar rodando. Mensagens ficam pendentes e sao entregues quando o bridge voltar. Orchestrator nao depende de Telegram para funcionar |

---

## 10. Fora de Escopo (v1 / Phase 1)

| Item | Razao | Quando |
|------|-------|--------|
| UI / Dashboard | Constitution Artigo I: CLI First. Observabilidade via Telegram e logs. | Sem data prevista |
| Multi-tenant | Requer validacao do single-tenant primeiro | Phase 2 |
| Agent Teams / Paralelismo | Feature experimental, sem per-agent tool restrictions | Phase 3 |
| Spec Pipeline e Brownfield como workflows | Prioridade e SDC + QA Loop | Phase 2 |
| MCP servers por agente | Complexidade adicional, avaliar necessidade real | Avaliacao futura |
| Web hooks para notificacao | Telegram via outbox IPC e suficiente | Avaliacao futura |
| Suporte a multiplos repositories | Um repo por instancia do Orchestrator | Avaliacao futura |
| Rate limiting por tenant | Pre-requisito e multi-tenant | Phase 2 |

---

## 11. Premissas Tecnicas

### 11.1 Stack e Arquitetura

| Decisao | Escolha | Racional |
|---------|---------|----------|
| Runtime | Node.js (v22) | Ecossistema do projeto, SDK nativo |
| Dependencia principal | Claude Agent SDK v0.2.63 | Ja instalado, cobre isolamento+governanca+budget |
| Arquitetura | Single file (~500 LOC) | Minimo codigo, maximo reuso do SDK |
| Repositorio | Monorepo (`packages/aios-orchestrator/`) | Consistente com estrutura existente |
| Deploy | systemd service | Disponivel, simples, restart automatico |
| Logging | pino (JSON) | Ja em uso no session-daemon |
| Comunicacao | Outbox IPC (filesystem) | Reusa Telegram Bridge sem modificacao |

### 11.2 Decisoes Arquiteturais Chave

**D1: query() sobre streamInput()**
Cada fase e uma `query()` efemera em vez de `streamInput()` persistente. Mais simples, crash-safe, sem gestao de lifecycle. Tradeoff aceito: ~12s cold start por fase.

**D2: Agent configs em JSON separado**
Agent registry em `agent-registry.json` em vez de inline no codigo. Configs mudam mais frequentemente que a logica. JSON e legivel por outras ferramentas (Telegram Bridge, dashboards futuros).

**D3: Sem session resume entre agentes**
Contexto passado via prompt, nao via session resume. Cada agente e stateless por design. Simplifica crash recovery e isolamento.

**D4: Reuso do OutboxWriter existente**
O Comms Bridge importa o `OutboxWriter` do session-daemon diretamente, garantindo compliance com o schema v2.0 sem reimplementacao.

---

## 12. Checklist Results Report

### Validacao contra PM Checklist

| Categoria | Status | Observacoes |
|-----------|--------|-------------|
| 1. Problem Definition & Context | PASS | Problemas claros (P1-P5), personas definidas, metricas de sucesso |
| 2. MVP Scope Definition | PASS | Escopo MVP (Phase 1) bem delimitado, fora de escopo explicito |
| 3. User Experience Requirements | N/A | Sem UI -- CLI First. Experiencia via CLI e Telegram |
| 4. Functional Requirements | PASS | 29 FR numerados cobrindo todos os aspectos |
| 5. Non-Functional Requirements | PASS | 13 NFR com metas quantitativas |
| 6. Epic & Story Structure | PASS | 7 stories para Phase 1, estimadas e sequenciadas |
| 7. Technical Guidance | PASS | Premissas tecnicas, decisoes arquiteturais documentadas |
| 8. Cross-Functional Requirements | PASS | Integracao com Telegram Bridge, CLAUDE.md, agent-authority.md |
| 9. Clarity & Communication | PASS | Linguagem acessivel, tabelas, exemplos concretos |

### Deficiencias Identificadas

| Severidade | Item | Recomendacao |
|------------|------|--------------|
| MEDIA | Nao ha mecanismo de rollback automatico se story falhar apos push | Considerar `git revert` automatico ou PR em draft para revisao humana |
| MEDIA | Parsing de decisoes (GO/NO-GO, PASS/FAIL) depende de output textual do LLM | Definir formato estruturado de resposta (JSON) para fases de decisao |
| BAIXA | Sem metrica de qualidade das stories produzidas (alem de QA gate) | Avaliar em producao e iterar |

### Decisao Final

**READY FOR ARCHITECT** -- O PRD cobre requisitos funcionais e nao-funcionais de forma completa, com scope bem definido para Phase 1, riscos identificados com mitigacoes, e alinhamento total com a arquitetura tecnica ja validada (0 FAIL na auditoria).

---

## 13. Next Steps

### Para @architect (Aria)

A arquitetura tecnica ja foi produzida e validada (`sdk-orchestrator-architecture.md`, validacao com 0 FAIL). O proximo passo e:

1. Revisar este PRD contra a arquitetura existente para confirmar alinhamento
2. Resolver os 14 CONCERNS da validacao durante a implementacao
3. Proceder com sharding do PRD em epics/stories para execucao

### Para @sm (River)

Apos aprovacao deste PRD, criar stories detalhadas para Phase 1 baseadas na tabela de stories da secao 7 (stories 1.1 a 1.7), seguindo o template padrao de story com acceptance criteria testáveis.

---

*Morgan, planejando o futuro*
