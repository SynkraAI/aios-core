<!-- Tradução: PT-BR | Original: /docs/en/architecture/ci-cd.md | Sincronização: 2026-01-26 -->

# Arquitetura de CI/CD

> 🌐 [EN](../../architecture/ci-cd.md) | **PT** | [ES](../../es/architecture/ci-cd.md)

---

> Story 6.1: Otimização de Custos do GitHub Actions

## Visão Geral

O AIOS-Core utiliza GitHub Actions para integração contínua e implantação. Este documento descreve a arquitetura de workflow otimizada implementada na Story 6.1.

## Hierarquia de Workflows

```text
┌─────────────────────────────────────────────────────────────────┐
│                        EVENTOS DE TRIGGER                        │
├─────────────────────────────────────────────────────────────────┤
│  Pull Request → ci.yml (obrigatório) + pr-automation.yml (métricas) │
│  Push para main → ci.yml + semantic-release.yml + test.yml      │
│                 + cross-platform (condicional no ci.yml)        │
│  Tag v*       → release.yml → npm-publish.yml                   │
└─────────────────────────────────────────────────────────────────┘
```

**Nota:** PRs executam apenas ci.yml e pr-automation.yml (~12 jobs). Testes estendidos (test.yml) executam apenas no push para main.

## Workflows Ativos

| Workflow                  | Propósito                                         | Trigger                | Crítico |
| ------------------------- | ------------------------------------------------- | ---------------------- | ------- |
| `ci.yml`                  | Validação principal de CI (lint, typecheck, test) | PR, push para main     | Sim     |
| `pr-automation.yml`       | Relatório de cobertura e métricas                 | Apenas PR              | Não     |
| `semantic-release.yml`    | Versionamento automático e changelog              | Push para main         | Sim     |
| `test.yml`                | Testes estendidos (segurança, build, integração)  | Apenas push para main  | Não     |
| `macos-testing.yml`       | Testes específicos para macOS (Intel + ARM)       | Filtrado por path      | Não     |
| `release.yml`             | Criação de Release no GitHub                      | Tag v\*                | Sim     |
| `npm-publish.yml`         | Publicação de pacote no NPM                       | Release publicado      | Sim     |
| `pr-labeling.yml`         | Auto-rotulagem de PRs                             | PR aberto/sincronizado | Não     |
| `quarterly-gap-audit.yml` | Auditoria agendada                                | Cron                   | Não     |
| `welcome.yml`             | Boas-vindas a contribuidores iniciantes           | PR                     | Não     |

## Estratégias de Otimização

### 1. Controle de Concorrência

Todos os workflows usam grupos de concorrência para evitar execuções duplicadas:

```yaml
concurrency:
  group: <workflow>-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true  # Para workflows de CI
  # OU
  cancel-in-progress: false  # Para workflows de release/publicação
```

### 2. Filtros de Path

Workflows ignoram execuções desnecessárias para mudanças apenas em documentação:

```yaml
paths-ignore:
  - 'docs/**'
  - '*.md'
  - '.aios/**'
  - 'squads/**'
  - 'LICENSE'
  - '.gitignore'
```

### 3. Testes Cross-Platform Condicionais

Matriz cross-platform (3 SOs x 3 versões do Node = 7 jobs após exclusões) executa apenas no push para main:

```yaml
cross-platform:
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  strategy:
    matrix:
      os: [ubuntu-latest, windows-latest, macos-latest]
      node: ['18', '20', '22']
      exclude:
        - os: macos-latest
          node: '18' # SIGSEGV do isolated-vm
        - os: macos-latest
          node: '20' # SIGSEGV do isolated-vm
```

### 4. Validação Consolidada

Fonte única de verdade para validação:

- **ci.yml** trata toda validação (lint, typecheck, test)
- **semantic-release.yml** depende da proteção de branch (sem CI duplicado)
- **pr-automation.yml** foca apenas em métricas/cobertura

## Redução de Minutos Faturáveis

| Antes           | Depois         | Economia |
| --------------- | -------------- | -------- |
| ~340 min/semana | ~85 min/semana | ~75%     |

### Detalhamento:

- Concorrência: 40% de redução (cancela execuções obsoletas)
- Filtros de path: 30% de redução (ignora PRs apenas de docs)
- Cross-platform consolidado: 25% de redução (7 vs 16 jobs)
- Workflows redundantes removidos: 5% de redução

## Estratégia de Branches

Todos os workflows visam apenas a branch `main`:

- Sem branches `master` ou `develop`
- Feature branches → PR para main
- Releases via semantic-release na main

## Verificações de Status Obrigatórias

Para proteção de branch na `main`:

1. `CI / ESLint`
2. `CI / TypeScript Type Checking`
3. `CI / Jest Tests`
4. `CI / Validation Summary`

## Solução de Problemas

### Workflow não está executando?

1. Verifique se os paths estão em `paths-ignore`
2. Verifique se a branch corresponde ao trigger
3. Verifique o grupo de concorrência (pode ter sido cancelado)

### Release não está publicando?

1. Verifique se o secret `NPM_TOKEN` está configurado
2. Verifique a configuração do semantic-release
3. Verifique o formato dos conventional commits

### Testes do macOS falhando?

- Node 18/20 no macOS têm problemas de SIGSEGV com isolated-vm
- Apenas Node 22 executa no macOS (por design)

## Documentação Relacionada

- [Faturamento do GitHub Actions](https://docs.github.com/en/billing/managing-billing-for-github-actions)
- [Semantic Release](https://semantic-release.gitbook.io/)
