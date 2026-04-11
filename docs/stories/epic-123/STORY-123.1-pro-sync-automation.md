# Story 123.1: Automação de sync do Pro entre `aios-pro` e `aiox-core`

## Status

- [x] Rascunho
- [x] Em revisão
- [ ] Concluída

## Contexto

O fluxo atual permite que novos squads entrem no repositório `aios-pro` sem serem propagados com previsibilidade para o bundle `pro/` consumido pelo `aiox-core`. O resultado é drift silencioso: o conteúdo existe no GitHub, mas não necessariamente chega ao instalador guiado do Pro.

## Objetivo

Estabelecer um fluxo de sync por fonte única, com `aios-pro` como origem dos squads Pro e `aiox-core/pro` como espelho controlado por PR automática.

## Acceptance Criteria

- [x] AC1. O `aios-pro` valida automaticamente que todo squad top-level publicado está presente em `package.json` e em `squads/README.md`.
- [x] AC2. Mudanças compatíveis em `aios-pro` abrem ou atualizam automaticamente uma PR no `aiox-core` avançando o submódulo `pro`.
- [x] AC3. O `aiox-core` possui um workflow manual/agendado de fallback para reconciliar drift do submódulo `pro`.
- [x] AC4. O plano operacional documenta segredos necessários, branch de sync, e lista dos arquivos alterados.

## Tasks

- [x] Criar validação de publish surface no `aios-pro`
- [x] Atualizar README/package surface do `aios-pro`
- [x] Adicionar workflow de sync `aios-pro` -> `aiox-core`
- [x] Adicionar fallback workflow no `aiox-core`
- [x] Executar validações locais

## Notas de Implementação

- Fonte de verdade: `SynkraAI/aios-pro`
- Espelho controlado: submódulo `pro` em `SynkraAI/aiox-core`
- Branch de sync: `bot/sync-pro-submodule`
- Segredo esperado no `aios-pro`: `AIOX_CORE_SYNC_TOKEN`

## File List

- [docs/stories/epic-123/STORY-123.1-pro-sync-automation.md](/Users/rafaelcosta/Documents/AIOX/aiox-core-pr623/docs/stories/epic-123/STORY-123.1-pro-sync-automation.md)
- [.github/workflows/sync-pro-submodule.yml](/Users/rafaelcosta/Documents/AIOX/aiox-core-pr623/.github/workflows/sync-pro-submodule.yml)
- [package.json](/Users/rafaelcosta/Documents/AIOX/aios-pro/package.json)
- [squads/README.md](/Users/rafaelcosta/Documents/AIOX/aios-pro/squads/README.md)
- [scripts/validate-publish-surface.js](/Users/rafaelcosta/Documents/AIOX/aios-pro/scripts/validate-publish-surface.js)
- [.github/workflows/ci.yml](/Users/rafaelcosta/Documents/AIOX/aios-pro/.github/workflows/ci.yml)
- [.github/workflows/publish.yml](/Users/rafaelcosta/Documents/AIOX/aios-pro/.github/workflows/publish.yml)
- [.github/workflows/sync-aiox-core.yml](/Users/rafaelcosta/Documents/AIOX/aios-pro/.github/workflows/sync-aiox-core.yml)
