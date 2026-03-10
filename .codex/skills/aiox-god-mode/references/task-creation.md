# Guia de Criação de Tarefa — Schema e Template Completos

## Convenções de Nomeação
- Use kebab-case (ex: `minha-tarefa-customizada.md`)

## Onde Salvar
- Core: `.aios-core/development/tasks/`
- Squad: `squads/{squad}/tasks/`

## Schema de Tarefa Completo
- Frontmatter YAML: `id`, `name`, `agent`, `inputs`, `outputs`
- Corpo Markdown: Instruções passo a passo para o executor

## Resolução de Caminhos
Sempre use caminhos absolutos ou relativos ao framework (começando com `.aios-core/` ou `squads/`).
