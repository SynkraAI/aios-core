# Story CORE-SU.R1: Remediação da revisão do Core Super Update

## Status

Done

## Story

**Como** mantenedor do AIOX Core,
**quero** corrigir os gaps funcionais, de segurança, governança e qualidade encontrados na revisão do Core Super Update,
**para que** o fluxo SDC completo, o harness de portabilidade e os gates do framework sejam seguros, determinísticos, auditáveis e aderentes à Constitution.

## Acceptance Criteria

1. Todo auto-dispatch de modelo executado por `pm.sh`, Full SDC e Wave Execute exige antes da execução: teto de orçamento positivo e explícito, story válida vinculada para tarefas de implementação e varredura de prompt/contexto contra instruções ou caminhos perigosos; falhas bloqueiam o dispatch com mensagem acionável e sem invocar o modelo.
2. Os caminhos visual e headless de dispatch não concatenam entrada controlada pelo usuário em comandos avaliados por shell; parâmetros, caminhos e contexto preservam seus valores literalmente, incluindo espaços, aspas, `$()`, ponto e vírgula e quebras de linha.
3. O lifecycle canônico mantém a autoridade de QA para concluir a story: verdicts aprovados movem `InReview` para `Done`, enquanto PO permanece responsável por validação/priorização do draft e não por concluir QA.
4. O Full SDC implementa transições condicionais corretas: review aprovado segue para fechamento; review reprovado segue para correções; após correções a story retorna obrigatoriamente ao review; o ciclo de correção e re-review é limitado a 3 iterações e para com diagnóstico explícito ao atingir o limite.
5. A contagem de iterações de quality gate é persistida e incrementada pelo fluxo automático real, não apenas por comandos manuais, e é coberta por testes de PASS, FAIL, re-review e limite excedido.
6. Um ADR explícito define a relação entre checkpoints operacionais em `.aiox/sdc` e `.aiox/waves` e o `SessionState`, incluindo fonte de verdade, limites de autoridade, recuperação, retenção e proibição de esses checkpoints alterarem lifecycle canônico por conta própria; a documentação de orquestração referencia essa decisão.
7. Existem testes de integração dos comandos CLI completos relevantes e do `pm.sh` usando um executável de modelo falso, cobrindo argumentos hostis, bloqueios de governança, propagação literal de parâmetros e códigos de saída, sem rede nem credenciais reais.
8. A auditoria do lifecycle registra evidência de conformidade entre source of truth e projeções de IDE/agentes, corrige divergências QA/PO e valida que stories concluídas possuem histórico mínimo auditável sem reabrir status já concluído.
9. Exports públicos criados ou alterados pelo Core Super Update possuem JSDoc útil com contrato, parâmetros, retorno e erros relevantes; a checagem correspondente cobre os módulos públicos afetados.
10. O harness Wave 0 compara todos os pares OSS↔Hub, OSS↔Enterprise e Hub↔Enterprise, produz classificação real de buckets 3-way, classificação por wave e ocorrências do port denylist.
11. O harness Wave 0 é determinístico por padrão, oferece modo strict `--require-external` que falha quando Hub ou Enterprise não estão disponíveis e produz saída ordenada e estável para a mesma entrada; timestamp, quando solicitado, é opt-in e não altera o resultado semântico.
12. O port denylist cobre `.grok`, caminhos genéricos de `workspace`, padrões de secrets/credenciais e os ports existentes, com allowlist explícita apenas para documentação/testes legítimos e sem mascarar ocorrências reais.
13. O port denylist é executado por gate local pre-push e por CI; ambos falham com saída acionável ao detectar violações. Alterações de CI/pre-push respeitam a autoridade de DevOps e são verificadas sem efetuar push.
14. A suite completa fica estável em execuções consecutivas: sem diretórios temporários residuais, sem mutações persistentes de fixtures/configuração, sem open handles e sem falhas nos testes SYNAPSE A1 observados durante a revisão.
15. Todos os testes focados adicionados passam, e os quality gates do repositório (`npm run lint`, `npm run typecheck`, `npm test`, validações de sync/paridade e port denylist aplicáveis) terminam com sucesso.

## Tasks / Subtasks

- [x] Task 1 — Implementar governança e segurança do auto-dispatch (AC: 1, 2)
  - [x] Centralizar a validação de budget, story binding e prompt/context scan em uma API reutilizável.
  - [x] Integrar o guard em `pm.sh`, Full SDC e Wave Execute antes de qualquer invocação de modelo.
  - [x] Remover construção de comandos por concatenação nos fluxos visual e headless.
  - [x] Cobrir caracteres de shell, multiline, caminhos com espaços e tentativas de bypass.

- [x] Task 2 — Corrigir ownership do lifecycle e loop de QA (AC: 3, 4, 5)
  - [x] Alinhar source of truth, skills e projeções para QA concluir `InReview -> Done` e PO validar/priorizar drafts.
  - [x] Implementar transições condicionais review→close e review→fixes→review.
  - [x] Persistir/incrementar automaticamente `qgIterations` e bloquear após 3 ciclos.
  - [x] Adicionar testes unitários e de integração das transições e do limite.

- [x] Task 3 — Formalizar ownership dos checkpoints (AC: 6)
  - [x] Criar ADR para `.aiox/sdc`, `.aiox/waves` e `SessionState` com fonte de verdade e recuperação.
  - [x] Atualizar a documentação da hierarquia de orquestração para referenciar o ADR.
  - [x] Garantir por código ou teste que checkpoints operacionais não assumem autoridade sobre o lifecycle.

- [x] Task 4 — Completar cobertura de integração e contratos públicos (AC: 7, 9)
  - [x] Testar os comandos CLI completos com filesystem temporário isolado.
  - [x] Testar `pm.sh` com modelo fake e inputs hostis, verificando argv e exit code.
  - [x] Adicionar JSDoc aos exports públicos afetados e checagem automatizada correspondente.

- [x] Task 5 — Completar o harness Wave 0 (AC: 10, 11)
  - [x] Implementar as três comparações pairwise e buckets 3-way semanticamente corretos.
  - [x] Incluir classificação por wave e hits do port denylist no relatório.
  - [x] Implementar `--require-external` e saída determinística/ordenada por padrão.
  - [x] Tornar timestamp opt-in e adicionar fixtures/testes de determinismo e strict mode.

- [x] Task 6 — Endurecer e integrar o port denylist (AC: 12, 13)
  - [x] Adicionar cobertura de `.grok`, `workspace` genérico e secrets/credenciais.
  - [x] Definir allowlist mínima para documentação e testes legítimos.
  - [x] Integrar o scanner ao pre-push e ao CI, com alteração executada/revisada por DevOps.
  - [x] Adicionar testes positivos, negativos e de mensagens acionáveis.

- [x] Task 7 — Auditar lifecycle e sincronizar projeções (AC: 8)
  - [x] Auditar source of truth, regras e skills projetadas para Claude, Codex, Gemini e Grok.
  - [x] Registrar evidências e corrigir divergências sem alterar indevidamente status concluídos.
  - [x] Executar sync e validações de paridade/integration aplicáveis.

- [x] Task 8 — Estabilizar a suite e fechar quality gates (AC: 14, 15)
  - [x] Isolar temporários e impedir mutação persistente de fixtures/configuração.
  - [x] Eliminar open handles e corrigir as falhas SYNAPSE A1 reproduzidas pela suite completa.
  - [x] Executar testes focados e a suite completa em execuções consecutivas.
  - [x] Executar lint, typecheck, sync/paridade e port denylist; registrar os resultados.

## Dev Notes

- Esta story remedia exclusivamente os achados da revisão do Core Super Update; não amplia escopo funcional do epic.
- A Constitution, as regras canônicas de lifecycle e a hierarquia de orquestração são as fontes de verdade.
- Checkpoints `.aiox/sdc` e `.aiox/waves` são estado operacional; a decisão arquitetural deve tornar explícito se são adaptadores, caches ou artefatos recuperáveis, sem competir com `SessionState`.
- Alterações de CI/pre-push devem ser executadas ou aprovadas pelo agente DevOps conforme a matriz de autoridade.
- Testes de shell devem usar executável fake e diretórios temporários; não invocar provedores externos.

## Testing

- Unitários: governança de dispatch, lifecycle transitions, contador de iterações, buckets 3-way, determinismo, strict mode e denylist.
- Integração: comandos CLI reais e `pm.sh` com modelo fake, incluindo inputs hostis.
- Regressão: duas execuções consecutivas da suite completa, sem resíduos ou open handles.
- Gates: `npm run lint`, `npm run typecheck`, `npm test`, sync/paridade e port denylist aplicáveis.

## CodeRabbit Integration

### Specialized Agent Review

- Security review para shell injection, prompt scan, budget e story binding.
- Architecture review para ADR e ownership de estado.
- QA review para lifecycle, re-review e estabilidade da suite.
- DevOps review para CI e pre-push.

### Quality Gate Focus

- Nenhuma entrada controlada pelo usuário alcança avaliação de shell.
- Nenhum auto-dispatch ocorre sem os três guards obrigatórios.
- Nenhum caminho de FAIL alcança close sem novo review aprovado.
- Relatórios Wave 0 são reproduzíveis byte a byte por padrão.
- Denylist bloqueia ports e secrets sem falsos negativos nos novos roots.

## Change Log

| Date       | Version | Description                                                                             | Author      |
| ---------- | ------- | --------------------------------------------------------------------------------------- | ----------- |
| 2026-07-09 | Draft   | Story criada a partir dos achados consolidados da revisão do Core Super Update.         | River (@sm) |
| 2026-07-09 | 0.1.0   | Validated GO (9/10) — Status: Draft → Ready.                                            | Pax (@po)   |
| 2026-07-09 | 0.2.0   | Desenvolvimento iniciado — Status: Ready → InProgress.                                  | Dex (@dev)  |
| 2026-07-09 | 0.3.0   | Remediação e quality gates concluídos — Status: InProgress → InReview.                  | Dex (@dev)  |
| 2026-07-10 | 0.4.0   | Blockers da revisão QA corrigidos; story permanece InReview para novo verdict.          | Dex (@dev)  |
| 2026-07-10 | 0.4.1   | QA Gate PASS — Status: InReview → Done.                                                 | Quinn (@qa) |
| 2026-07-10 | 0.4.2   | QA re-review PASS após refinamentos finais; Status Done preservado.                     | Quinn (@qa) |
| 2026-07-10 | 0.4.3   | CodeRabbit pre-PR identificou hardenings adicionais — Status: Done → InProgress.        | Dex (@dev)  |
| 2026-07-10 | 0.5.0   | Hardening fail-closed, waiver e proveniência concluído — Status: InProgress → InReview. | Dex (@dev)  |
| 2026-07-10 | 0.5.1   | QA re-review final PASS — Status: InReview → Done.                                     | Quinn (@qa) |
| 2026-07-10 | 0.5.2   | CodeRabbit pós-fix identificou gate órfão e ajustes documentais — Status: Done → InProgress. | Dex (@dev) |
| 2026-07-10 | 0.6.0   | Backstop de gate órfão e ajustes finais concluídos — Status: InProgress → InReview. | Dex (@dev) |
| 2026-07-10 | 0.6.1   | QA re-review pós-fix PASS — Status: InReview → Done. | Quinn (@qa) |

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Atualização da base: merge de `origin/main` em `feat/core-super-update-epic`, commit `d0efd87c` (o upstream anterior da feature havia sido removido após o merge do PR).
- Testes focados finais: 4 suites/26 testes para lifecycle, denylist, harness e fechamento administrativo; demais testes focados incorporados à suite completa.
- Regressão final: duas execuções consecutivas de `npm test -- --runInBand --silent`, ambas com 376 suites/8.945 testes aprovados e sem processo Jest residual.
- Gates finais: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run validate:manifest`, `npm run validate:registry-determinism`, `npm run validate:port-denylist`, `npm run sync:ide:check`, `npm run validate:parity`, validações Claude/Codex e `git diff --check` com exit code 0.
- CodeRabbit: as rodadas de desenvolvimento e pre-PR foram triadas; os findings válidos foram corrigidos, incluindo leitura fail-closed do diff 3-way, ausência de árvore, localização canônica de gates, autorização de WAIVED, isolamento de proveniência, rollback de gate falho e recusa de gate órfão sem marcador de verdict na story. Novo verdict QA pendente.
- O script legado opcional `validate:structure` permanece indisponível porque o módulo referenciado por `package.json` não existe no baseline; não integra os quality gates obrigatórios desta story.

### Completion Notes List

- Auto-dispatch centralizado com budget explícito, story binding e varredura de prompt/contexto; shell visual/headless usa argumentos literais sem avaliação de entrada do usuário.
- Lifecycle corrigido para autoridade de QA, loop FAIL→fixes→re-review, contador persistido e circuit breaker após três iterações; fechamento PO tornou-se administrativo, revision-bound, idempotente e recuperável.
- QA provenance agora é obrigatória e vinculada à revisão; `Done` ou checkpoint sem verdict aprovado, reviewer e reviewed revision não conclui SDC/wave.
- ADR formaliza `SessionState`/story como fontes canônicas e checkpoints `.aiox` como journals recuperáveis sem autoridade de lifecycle.
- Harness Wave 0 agora executa os três pares, buckets 3-way, waves, denylist, strict mode e saída determinística com rótulos específicos por par.
- Denylist ampliada para `.grok`, workspace, secrets/credenciais e integrada a CI/pre-push; allowlist reduzida sem mascarar credenciais.
- Timers/open handles e flutuações SYNAPSE A1 eliminados; manifesto, registry e projeções regenerados/validados.
- `npm run build` foi definido como o publish safety gate real do pacote e passou com 2.140 arquivos validados.
- `npm run lint` final ficou verde com um único warning em `tests/integration/wizard-debug.temp.test.js`, artefato não rastreado preexistente e preservado fora do escopo.
- Nenhum push foi executado.

### File List

- `.aiox-core/cli/commands/config/index.js`
- `.aiox-core/cli/commands/sdc/index.js`
- `.aiox-core/cli/commands/wave/index.js`
- `.aiox-core/core/execution/parallel-executor.js`
- `.aiox-core/core/execution/parallel-monitor.js`
- `.aiox-core/core/execution/wave-executor.js`
- `.aiox-core/core/orchestration/agent-invoker.js`
- `.aiox-core/core/orchestration/terminal-spawner.js`
- `.aiox-core/core/permissions/dispatch-governance.js`
- `.aiox-core/core/permissions/index.js`
- `.aiox-core/core/permissions/path-guard.js`
- `.aiox-core/core/sdc/dispatch-adapter.js`
- `.aiox-core/core/sdc/index.js`
- `.aiox-core/core/sdc/phase-verify.js`
- `.aiox-core/core/sdc/progress.js`
- `.aiox-core/core/sdc/story-meta.js`
- `.aiox-core/core/sdc/wave-plan.js`
- `.aiox-core/core/sdc/wave-run.js`
- `.aiox-core/core/security/port-denylist.js`
- `.aiox-core/core/synapse/engine.js`
- `.aiox-core/core/synapse/scripts/generate-constitution.js`
- `.aiox-core/data/entity-registry.yaml`
- `.aiox-core/development/agents/qa.md`
- `.aiox-core/development/skills/close-story/SKILL.md`
- `.aiox-core/development/skills/full-sdc/SKILL.md`
- `.aiox-core/development/skills/review-story/SKILL.md`
- `.aiox-core/development/skills/wave-execute/SKILL.md`
- `.aiox-core/development/tasks/add-mcp.md`
- `.aiox-core/development/tasks/github-devops-pre-push-quality-gate.md`
- `.aiox-core/development/tasks/po-close-story.md`
- `.aiox-core/development/tasks/qa-gate.md`
- `.aiox-core/development/tasks/qa-review-story.md`
- `.aiox-core/development/tasks/qa-security-checklist.md`
- `.aiox-core/infrastructure/scripts/framework-3way-diff.js`
- `.aiox-core/infrastructure/scripts/grok-skills-sync/index.js`
- `.aiox-core/infrastructure/scripts/pre-dispatch-guard.js`
- `.aiox-core/install-manifest.yaml`
- `.aiox-core/scripts/pm.sh`
- `.claude/skills/close-story/SKILL.md`
- `.claude/rules/story-lifecycle.md`
- `.claude/skills/AIOX/agents/qa/SKILL.md`
- `.claude/skills/full-sdc/SKILL.md`
- `.claude/skills/review-story/SKILL.md`
- `.claude/skills/wave-execute/SKILL.md`
- `.codex/agents/qa.md`
- `.gemini/rules/AIOX/agents/qa.md`
- `.github/workflows/ci.yml`
- `.gitignore`
- `.grok/skills/aiox-close-story/SKILL.md`
- `.grok/skills/aiox-full-sdc/SKILL.md`
- `.grok/skills/aiox-review-story/SKILL.md`
- `.grok/skills/aiox-sdc/SKILL.md`
- `.grok/skills/aiox-wave-execute/SKILL.md`
- `.husky/pre-push`
- `.kimi/skills/aiox-qa/SKILL.md`
- `docs/architecture/adr/ADR-SDC-WAVE-CHECKPOINT-OWNERSHIP.md`
- `docs/architecture/orchestration-hierarchy.md`
- `docs/framework/epics/core-super-update/LIFECYCLE-AUDIT.md`
- `docs/framework/epics/core-super-update/STORY-CORE-SU.0-DIFF-HARNESS.md`
- `docs/framework/epics/core-super-update/STORY-CORE-SU.A2-CONFIGCACHE-JEST-RESIDUAL.md`
- `docs/framework/epics/core-super-update/STORY-CORE-SU.A3-PERMISSION-GUARDS.md`
- `docs/framework/epics/core-super-update/STORY-CORE-SU.A4-PORT-DENYLIST.md`
- `docs/framework/epics/core-super-update/STORY-CORE-SU.MB-MEMORY-BRIDGE.md`
- `docs/framework/epics/core-super-update/STORY-CORE-SU.R1-REVIEW-REMEDIATION.md`
- `eslint.config.js`
- `package.json`
- `tests/core/execution/parallel-executor.test.js`
- `tests/integration/core-super-update-cli.test.js`
- `tests/synapse/engine.test.js`
- `tests/unit/dispatch-governance.test.js`
- `tests/unit/framework-3way-diff.test.js`
- `tests/unit/lifecycle-close-contract.test.js`
- `tests/unit/port-denylist.test.js`
- `tests/unit/public-api-jsdoc.test.js`
- `tests/unit/sdc/dispatch-adapter.test.js`
- `tests/unit/sdc/phase-verify.test.js`
- `tests/unit/sdc/wave-c-integration.test.js`
- `tests/unit/sdc/wave-run.test.js`
- `tests/unit/terminal-spawner-shell-safety.test.js`

## QA Results

### Review Date: 2026-07-10

### Reviewed By: Quinn (Test Architect)

### Reviewed Revision: working-tree-files-sha256:9d997b871f91445b8d4d98a3a5fc3958da289553422b6e162ce29ae44015e6c0

Digest determinístico de `HEAD d0efd87c99dc6bd0f141cba10eaf64a507bd5d87` e do conteúdo dos 77 arquivos de implementação/documentação listados na story, excluindo os dois registros QA-owned alterados pelo próprio gate (esta story e `LIFECYCLE-AUDIT.md`).

### Code Quality Assessment

Implementação aderente aos 15 ACs. A revisão encontrou um blocker residual no preflight SDC com story relativa; o Dev normalizou o binding para caminho absoluto e adicionou regressão cobrindo caminhos absoluto e relativo. O snapshot corrigido não apresenta issue bloqueante ou dívida técnica que impeça o merge.

### Requirements Traceability

- AC 1–2: governança e literalidade do dispatch cobertas por testes unitários, CLI, `pm.sh` com modelo fake e inspeção do terminal spawner.
- AC 3–5: ownership QA/PO, FAIL→fixes→re-review, persistência do contador e circuit breaker cobertos por lifecycle unitário e integração CLI completa.
- AC 6: ADR, documentação de orquestração e regressão de checkpoint forjado confirmam que journals `.aiox` não têm autoridade canônica.
- AC 7–9: integrações CLI/shell, auditoria de lifecycle e contratos JSDoc verificados.
- AC 10–13: três pares, buckets, waves, determinismo/strict e denylist local+CI/pre-push cobertos e verdes.
- AC 14–15: duas suites integrais consecutivas e todos os quality gates obrigatórios passaram.

### Compliance Check

- Coding Standards: ✓ lint sem erros; único warning em artefato untracked preexistente fora do escopo.
- Project Structure: ✓ ADR, SOT e projeções nos locais canônicos.
- Testing Strategy: ✓ unitários, integração real sem rede e regressão integral consecutiva.
- Constitution: ✓ CLI First, Agent Authority, Story-Driven Development, Quality First e Model Governance.
- All ACs Met: ✓ AC 1–15 rastreados e aprovados.

### Evidence

- Testes focados no snapshot final: PASS, 11 suites/98 testes.
- Suite completa: PASS em duas execuções consecutivas, 376 suites/8.945 testes por execução, sem processo Jest residual.
- `npm run build`, `npm run lint`, `npm run typecheck`, manifesto/registry, port denylist, sync IDE, paridade, integrações Claude/Codex e `git diff --check`: PASS.
- CodeRabbit: duas rodadas delimitadas; todos os achados verificados e remediados, sem CRITICAL/HIGH pendente.

### NFR Validation

- Security: PASS — budget, story binding, intent scan e argv literal bloqueiam dispatch inseguro antes do modelo.
- Reliability: PASS — estado atômico, loop limitado, timers limpos e suite consecutiva estável.
- Performance: PASS — sem regressão observada; timers de timeout são liberados após conclusão.
- Maintainability: PASS — contratos públicos documentados, ADR explícito e projeções sincronizadas.

### Refactoring Performed

Nenhum refactor executado por QA. A correção do blocker residual foi realizada por Dev e revalidada no snapshot final.

### Files Modified During Review

- `docs/framework/epics/core-super-update/STORY-CORE-SU.R1-REVIEW-REMEDIATION.md` (QA Results, Status e Change Log).
- `docs/framework/epics/core-super-update/LIFECYCLE-AUDIT.md` (finalização do audit status vinculada a este verdict).

### Gate Status

Gate: PASS

Quality score: 100/100. Top issues: none.

### Lifecycle Transition

PASS: InReview → Done.

### Re-review Date: 2026-07-10

### Reviewed By: Quinn (Test Architect)

### Reviewed Revision: working-tree-files-sha256:7b296a02063c0e8389d0827c153c9b0e416445d44e6b3741958aa1dd94844489

Digest determinístico de `HEAD d0efd87c99dc6bd0f141cba10eaf64a507bd5d87` e do conteúdo dos 77 arquivos de implementação/documentação da File List, em ordem lexical, excluindo os dois registros QA-owned (esta story e `LIFECYCLE-AUDIT.md`).

### Re-review Assessment

Os quatro refinamentos finais estão corretos e cobertos: o fallback de gate vincula pelo campo `story`/`storyId` exato, ordena candidatos e rejeita múltiplos matches; falhas de `readdir`/`readFile` retornam evidência estruturada e bloqueiam o fluxo; o contrato `qa-review-story` exige persistência atômica, re-leitura e verificação fail-closed antes do handoff; e Wave reutiliza `resolveQaEvidence`, sem confiar em checkpoint operacional como autoridade de lifecycle. O export público `extractQaVerdict` permanece preservado.

### Re-review Evidence

- `npx jest tests/unit/sdc/phase-verify.test.js tests/unit/sdc/wave-c-integration.test.js tests/unit/sdc/wave-run.test.js tests/unit/public-api-jsdoc.test.js --runInBand`: PASS, 4 suites/62 testes.
- ESLint focado nos módulos e testes revisados: PASS.
- `npm run typecheck`: PASS.
- `git diff --check`: PASS.
- Evidência herdada do snapshot final: manifesto, registry e port denylist PASS.

### Re-review Gate Status

Gate: PASS. Quality score: 100/100. Top issues: none.

### Re-review Lifecycle

Status `Done` preservado; nenhuma nova transição necessária.

### Re-review Date: 2026-07-10 (final pre-PR)

### Reviewed By: Quinn (Test Architect)

### Reviewed Revision: working-tree-files-sha256:f21e9e9f7981e64c4ed646eee0a40127c77ec54e97d82d897a879f955f5b9fa9

Digest determinístico de `HEAD d0efd87c99dc6bd0f141cba10eaf64a507bd5d87` e do conteúdo dos 77 arquivos de implementação/documentação da File List, em ordem lexical, excluindo os dois registros QA-owned (esta story e `LIFECYCLE-AUDIT.md`).

### Final Re-review Assessment

Os sete findings da revisão pre-PR foram validados integralmente. O contrato canônico continua aceitando evidência QA inline completa ou gate externo, portanto o short-circuit para QA Results revision-bound é correto. O workflow de review exige remoção obrigatória, verificação de ausência e bloqueio do handoff quando o cleanup de um gate falho não puder ser confirmado. O harness 3-way falha fechado com diagnóstico de árvore/path em erros de indexação ou denylist e, com árvore ausente, marca a classificação como indisponível sem buckets ou candidatos derivados. O resolver usa `qa.qaLocation` do `core-config.yaml`; WAIVED só é aprovado com `active`, `reason` e `approver`; e reviewer/revision ficam limitados à entrada ou documento YAML selecionado. Wave e close consomem a mesma evidência autorizada.

### Final Re-review Evidence

- Regressão independente: `npx jest tests/unit/framework-3way-diff.test.js tests/unit/sdc/phase-verify.test.js tests/unit/sdc/wave-c-integration.test.js tests/unit/sdc/wave-run.test.js tests/unit/lifecycle-close-contract.test.js tests/unit/public-api-jsdoc.test.js --runInBand`: PASS, 6 suites/78 testes.
- Probe contratual isolado dos sete hardenings: PASS, 7/7; probe adicional de leitura denylist com árvore/path: PASS.
- Suite completa do snapshot: PASS, 376 suites/8.956 testes (151 skipped).
- `npm run lint`: PASS, sem erros; único warning no artefato untracked preexistente `wizard-debug.temp.test.js`.
- `npm run typecheck`, manifesto, registry, port denylist, sync IDE, paridade e `git diff --check`: PASS.
- File List: 79/79 artefatos existentes e todos os arquivos modificados do escopo cobertos; dois untracked preexistentes permanecem fora do escopo.

### Final Re-review Gate Status

Gate: PASS

Quality score: 100/100. Top issues: none.

### Final Re-review Lifecycle

PASS: InReview → Done.

### Re-review Date: 2026-07-10 (post-fix final)

### Reviewed By: Quinn (Test Architect)

### Reviewed Revision: working-tree-files-sha256:e9c0c13736727a23bfb654116f84b1b9086802dadbca95a452842a5dd714311e

Digest determinístico de `HEAD d0efd87c99dc6bd0f141cba10eaf64a507bd5d87` e do conteúdo dos 77 arquivos de implementação/documentação da File List, em ordem lexical, excluindo os dois registros QA-owned (esta story e `LIFECYCLE-AUDIT.md`).

### Post-fix Assessment

Os quatro ajustes pós-fix estão corretos. `resolveQaEvidence` recusa um gate externo completo quando a story não contém marcador/verdict QA, mantendo o fallback somente quando a própria story referencia um verdict. O contrato JSDoc de `classifyThreeWay` está associado ao export correto e descreve seu retorno real. O relatório usa `leftLabel` também no heading, preservando `OSS ↔ peer` e `hub ↔ enterprise`. O handoff separa findings ordinários (`*apply-qa-fixes`) de um `QA_FIX_REQUEST.md` estruturado externo (`*fix-qa-issues`). Nenhum blocker ou concern residual foi identificado.

### Post-fix Evidence

- Regressão independente: 6 suites/79 testes, PASS.
- Regressão consolidada do snapshot fornecida por Dev: 6 suites/117 testes, PASS.
- Probe isolado dos quatro contratos: PASS, 4/4, incluindo gate órfão bloqueado e fallback marcado aprovado.
- `npm run lint`: PASS, sem erros; único warning em artefato untracked preexistente.
- `npm run typecheck`, syntax checks e `git diff --check`: PASS.
- Manifesto, registry e port denylist do snapshot: PASS; suite integral anterior: 376 suites/8.956 testes, PASS, com rerun final delegado ao gate DevOps pre-PR.
- File List: 79/79 artefatos existentes e todos os arquivos modificados do escopo cobertos.

### Post-fix Gate Status

Gate: PASS

Quality score: 100/100. Top issues: none.

### Post-fix Lifecycle

PASS: InReview → Done.
