# Story CORE-SU.D2: Grok integration hardening

## Status

InReview

## Story

**Como** mantenedor do AIOX Core,
**quero** tornar a projeção Grok autocontida, brownfield-safe e deterministicamente validada,
**para que** instalações fresh e existentes não percam dados nem aceitem drift silencioso.

## Acceptance Criteria

1. A instalação e o sync somente Grok geram todos os hooks obrigatórios sem depender de `.claude/` no projeto de destino e falham de forma acionável quando uma fonte canônica obrigatória está ausente.
2. `.grok/rules/aiox-core.md` possui uma única fonte de verdade e atualizações preservam conteúdo brownfield fora das seções gerenciadas pelo AIOX.
3. O sync registra ownership dos artefatos gerenciados, remove apenas artefatos anteriormente gerenciados que ficaram obsoletos e preserva extensões Grok do projeto.
4. O validator strict regenera a projeção esperada e detecta drift byte a byte em todos os artefatos gerenciados; regras com conteúdo customizado são comparadas apenas nas seções AIOX.
5. O hook de autoridade bloqueia criações e merges de PR via REST, CLI e GraphQL para agentes não-devops, nos payloads Claude e Grok.
6. Grok integra o compatibility contract e `validate:parity`, tornando a validação obrigatória no CI.
7. A integração diagnostica colisões de skills/hooks descobertas pelo runtime Grok sem apagar ou sobrescrever dados externos ao AIOX.
8. Instalações fresh e brownfield, sync idempotente, drift adversarial, extensões customizadas e limpeza de artefato gerenciado obsoleto possuem regressão automatizada.
9. `npm run lint`, `npm run typecheck`, `npm test`, build, manifesto, registry, IDE sync, paridade, Grok strict e `git diff --check` passam.

## Findings Inventory

- [x] P1 — Fresh Grok sync depende de `.claude/hooks` no destino.
- [x] P1 — Sync sobrescreve regras brownfield após o merge do instalador.
- [x] P1 — Validator strict aceita drift de conteúdo.
- [x] P1 — Hook permite `createPullRequest`/`mergePullRequest` via GraphQL.
- [x] P2 — Grok ausente do compatibility contract/parity/CI.
- [x] P2 — Ownership confunde artefatos AIOX obsoletos com extensões do projeto.
- [x] P2 — Runtime local descobre skills e hooks AIOX duplicados.
- [x] P2 — Quality gate integral e `git diff --check` estão vermelhos.

## Tasks / Subtasks

- [x] Task 1 — Consolidar hooks e regras em fontes canônicas autocontidas (AC: 1, 2, 5).
- [x] Task 2 — Implementar manifesto de ownership, convergência e validação determinística (AC: 3, 4).
- [x] Task 3 — Integrar Grok à paridade/CI e diagnóstico runtime (AC: 6, 7).
- [x] Task 4 — Cobrir fresh, brownfield, drift, customização, limpeza e GraphQL (AC: 8).
- [x] Task 5 — Regenerar artefatos e executar todos os gates (AC: 9).

## QA Results

Gate atual: FAIL — achados reproduzidos na auditoria local de 2026-08-10.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Auditoria base: commit `7c5fcad3` em `feat/grok-full-compatibility`.
- Quatro mudanças externas preexistentes em validator/hook/testes foram preservadas.
- Base integrada até `9ae6475f`; hardening final validado no worktree e sync Grok idempotente em 92 arquivos.
- Suíte integral: 378 suites e 9.043 testes passaram; 11 suites/151 testes explicitamente ignorados pela configuração do projeto.
- `grok inspect --json`: exatamente três hooks AIOX ativos (SYNAPSE, autoridade e PreCompact), sem dupla execução entre `.grok` nativo e compatibilidade Claude.

### Completion Notes List

- Hooks Grok agora partem de fontes canônicas em `.aiox-core`, sem dependência de `.claude/` no destino.
- Regras usam seções AIOX gerenciadas; conteúdo brownfield externo às seções é preservado.
- `aiox-managed.json` registra ownership e hashes; limpeza limita-se a arquivos anteriormente gerenciados.
- O validator strict regenera a projeção em diretório temporário e compara conteúdo determinístico.
- Autoridade cobre CLI, REST e GraphQL; criação/merge de PR continuam exclusivos de devops.
- Hooks nativos e Claude-compatible usam definições canônicas idênticas; a deduplicação nativa do Grok elimina execução dupla sem alterar `~/.grok`.
- Paridade e CI incluem Grok; o validator reporta 20 colisões de skills do runtime externo sem modificar `.agents/`.
- O Jest força uma única instância das dependências do runtime para que `.aiox-core/node_modules` não altere mocks nem o resultado dos gates.
- Todos os gates do AC9 passaram; pronto para nova revisão independente de QA.

### File List

- `docs/framework/epics/core-super-update/STORY-CORE-SU.D2-GROK-INTEGRATION-HARDENING.md`
- `.aiox-core/data/entity-registry.yaml`
- `.aiox-core/development/scripts/populate-entity-registry.js`
- `.aiox-core/infrastructure/contracts/compatibility/aiox-4.0.4.yaml`
- `.aiox-core/infrastructure/scripts/grok-skills-sync/index.js`
- `.aiox-core/infrastructure/scripts/grok-skills-sync/validate.js`
- `.aiox-core/infrastructure/scripts/validate-parity.js`
- `.aiox-core/infrastructure/templates/grok-hooks/enforce-git-push-authority.cjs`
- `.aiox-core/infrastructure/templates/grok-hooks/precompact-session-digest.cjs`
- `.aiox-core/infrastructure/templates/grok-hooks/precompact-wrapper.cjs`
- `.aiox-core/infrastructure/templates/grok-hooks/synapse-engine.cjs`
- `.aiox-core/infrastructure/templates/grok-hooks/synapse-wrapper.cjs`
- `.aiox-core/install-manifest.yaml`
- `.claude/settings.json`
- `.claude/hooks/enforce-git-push-authority.cjs`
- `.github/workflows/ci.yml`
- `.grok/README.md`
- `.grok/aiox-managed.json`
- `.grok/config.toml`
- `.grok/hooks/enforce-git-push-authority.cjs`
- `.grok/hooks/git-push-authority.json`
- `.grok/hooks/precompact-session-digest.cjs`
- `.grok/hooks/precompact.json`
- `.grok/hooks/synapse-engine.cjs`
- `.grok/hooks/synapse-prompt.json`
- `.grok/rules/aiox-core.md`
- `docs/ide-integration.md`
- `docs/migration/PRO-14.5-legacy-slash-command-shim-retirement.md`
- `jest.config.js`
- `packages/installer/src/wizard/ide-config-generator.js`
- `packages/installer/src/wizard/index.js`
- `packages/installer/tests/unit/artifact-copy-pipeline/artifact-copy-pipeline.test.js`
- `packages/installer/tests/unit/wizard/grok-install-surface.test.js`
- `tests/claude/subagent-governance.test.js`
- `tests/integration/wizard-ide-flow.test.js`
- `tests/unit/grok/grok-skills-sync.test.js`
- `tests/unit/validate-parity.test.js`
- `tests/unit/wizard/ide-config-generator.test.js`

## Change Log

- 2026-08-10: Story criada a partir dos achados da auditoria Grok; Status InProgress.
- 2026-08-10: Achados corrigidos, regressões adicionadas e gates integrais aprovados; Status InReview.
- 2026-08-10: Drift runtime de hooks duplicados eliminado por entrypoints canônicos deduplicáveis; gates integrais repetidos com sucesso.
