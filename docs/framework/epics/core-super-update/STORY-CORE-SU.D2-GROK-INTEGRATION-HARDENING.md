# Story CORE-SU.D2: Grok integration hardening

## Status

InProgress

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

- [ ] P1 — Fresh Grok sync depende de `.claude/hooks` no destino.
- [ ] P1 — Sync sobrescreve regras brownfield após o merge do instalador.
- [ ] P1 — Validator strict aceita drift de conteúdo.
- [ ] P1 — Hook permite `createPullRequest`/`mergePullRequest` via GraphQL.
- [ ] P2 — Grok ausente do compatibility contract/parity/CI.
- [ ] P2 — Ownership confunde artefatos AIOX obsoletos com extensões do projeto.
- [ ] P2 — Runtime local descobre skills e hooks AIOX duplicados.
- [ ] P2 — Quality gate integral e `git diff --check` estão vermelhos.

## Tasks / Subtasks

- [ ] Task 1 — Consolidar hooks e regras em fontes canônicas autocontidas (AC: 1, 2, 5).
- [ ] Task 2 — Implementar manifesto de ownership, convergência e validação determinística (AC: 3, 4).
- [ ] Task 3 — Integrar Grok à paridade/CI e diagnóstico runtime (AC: 6, 7).
- [ ] Task 4 — Cobrir fresh, brownfield, drift, customização, limpeza e GraphQL (AC: 8).
- [ ] Task 5 — Regenerar artefatos e executar todos os gates (AC: 9).

## QA Results

Gate atual: FAIL — achados reproduzidos na auditoria local de 2026-08-10.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Auditoria base: commit `7c5fcad3` em `feat/grok-full-compatibility`.
- Quatro mudanças externas preexistentes em validator/hook/testes foram preservadas.

### Completion Notes List

- Pendente.

### File List

- `docs/framework/epics/core-super-update/STORY-CORE-SU.D2-GROK-INTEGRATION-HARDENING.md`

## Change Log

- 2026-08-10: Story criada a partir dos achados da auditoria Grok; Status InProgress.
