---
name: design-system-catalog
description: >-
  Gerencia o catálogo global de todos os design systems criados pelo pipeline
  forge. Indexa, lista, atualiza status e calcula score de completude de cada
  DS em ~/CODE/design-systems/. Última etapa do pipeline de 4 skills.
risk: safe
source: opensquad
paths:
  - "skills/design-system-catalog/"
lazy_load: true
context_budget: 400
---

# Design System Catalog

Mantém um índice centralizado de todos os design systems em `~/CODE/design-systems/`. É a última etapa do pipeline de 4 skills de design system.

## When to Use This Skill

- Após completar a geração de um design system (depois de `/design-system-storybook`)
- Para listar todos os design systems disponíveis com status e score
- Para verificar o progresso de completude de um DS específico
- Para escanear a pasta e detectar novos DSs não catalogados

## Do NOT Use This Skill When

- Ainda não existe nenhum design system gerado em `~/CODE/design-systems/`
- Quer criar ou modificar componentes (use `/design-system-storybook` ou `@brad-frost`)
- Quer extrair o DNA de um site (use `/design-system-forge`)

## Discovery Questions

Perguntas a fazer antes de executar. Pule se o usuário já forneceu o contexto.

1. **Qual operação quer realizar? (list, add, status, scan, remove)** — (determina qual comando executar)
2. **Se `add` ou `status`: qual é o nome ou caminho do design system?** — (necessário para localizar o DS)

## Prerequisites

- Pasta `~/CODE/design-systems/` existente
- Para `add`: o DS deve ter `design-system/manifest.json` com campo `source`

## Workflow

### Comandos Disponíveis

| Comando | O que faz |
|---------|-----------|
| `/design-system-catalog list` | Lista todos os DSs com tabela: nome, URL, status, componentes, score |
| `/design-system-catalog add {path}` | Adiciona DS ao catálogo, detecta metadados automaticamente |
| `/design-system-catalog status {nome}` | Detalha um DS: tokens, componentes, storybook, score |
| `/design-system-catalog scan` | Escaneia `~/CODE/design-systems/` e adiciona DSs não catalogados |
| `/design-system-catalog remove {nome}` | Remove entrada do catálogo (não deleta arquivos) |

### Detecção Automática de Status

| Artefatos encontrados | Status atribuído |
|----------------------|-----------------|
| Apenas `design-system/` | Extracted |
| + `package.json` + `.storybook/` | Scaffolded |
| + `src/components/atoms/` | In Progress |
| Componentes gerados ≥ componentes detectados | Complete |

### Script CLI

```bash
node ~/aios-core/skills/design-system-catalog/lib/catalog-manager.mjs list
node ~/aios-core/skills/design-system-catalog/lib/catalog-manager.mjs add ~/CODE/design-systems/circle-br/
node ~/aios-core/skills/design-system-catalog/lib/catalog-manager.mjs status circle-br
node ~/aios-core/skills/design-system-catalog/lib/catalog-manager.mjs scan
node ~/aios-core/skills/design-system-catalog/lib/catalog-manager.mjs remove circle-br
```

## Best Practices

- Sempre rodar `scan` ao retomar trabalho após um intervalo longo
- O catálogo fica em `~/CODE/design-systems/CATALOG.md` — não editar manualmente
- Score é calculado como `componentes gerados / componentes detectados × 100`
- `remove` nunca apaga arquivos — só remove a entrada do catálogo

## Pipeline Completo

```
/design-system-forge     ← Extrai DNA do site
/design-system-scaffold  ← Cria projeto Next.js + Storybook
/design-system-storybook ← Gera componentes + stories
/design-system-catalog   ← VOCÊ ESTÁ AQUI (registra no catálogo global)
```
