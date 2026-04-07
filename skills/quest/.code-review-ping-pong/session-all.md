# Ping-Pong Session

## Scope
- files:
  - SKILL.md
  - engine/ceremony.md
  - engine/checklist.md
  - engine/guide.md
  - engine/scanner.md
  - engine/xp-system.md
  - packs/app-development.yaml
  - packs/design-system-forge.yaml
  - packs/squad-upgrade.yaml
  - dashboard/server.js

## Goals
- Clareza: um agente consegue executar a skill sem ambiguidade?
- Completude: todas as seções obrigatórias estão presentes (frontmatter, instruções, exemplos)?
- Consistência: engine docs, packs e SKILL.md não se contradizem?
- Elicitation: pontos de decisão do usuário estão bem definidos?
- Robustez: edge cases estão cobertos (skill invocada sem quest-log, pack inválido, XP overflow)?
- Qualidade do código: dashboard/server.js segue boas práticas (error handling, segurança)?
- Packs YAML: schema consistente, campos obrigatórios presentes, valores válidos?

## Constraints
- Não alterar a arquitetura geral da skill (engine/ + packs/ + dashboard/)
- Não modificar node_modules ou dados gerados (squads/kaizen-v2/data/)
- Manter compatibilidade com o AIOS skill loader
