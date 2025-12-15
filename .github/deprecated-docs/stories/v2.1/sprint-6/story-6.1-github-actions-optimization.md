# STORY 6.1: GitHub Actions Cost Optimization

**ID:** 6.1 | **Epic:** Technical Debt
**Sprint:** 6 | **Points:** 5 | **Priority:** 🟡 Medium | **Created:** 2025-12-08
**Updated:** 2025-12-08
**Status:** 📋 Ready for Development

**Backlog Reference:** ID 1733679600001

---

## Problem Statement

GitHub Actions está consumindo minutos rapidamente devido a múltiplos workflows redundantes e matrix de testes extensa:

1. **Lint/TypeCheck duplicados** - Executa em 3 workflows diferentes (aios-ci, pr-automation, test)
2. **Tests redundantes** - Múltiplos escopos sobrepostos
3. **Cross-platform matrix extensa** - 3 OS × 3 Node versions = 9 jobs mesmo para changes triviais
4. **Double execution** - Alguns tests rodam em push AND pull_request
5. **Sem path filters** - CI roda completo mesmo para docs-only changes

**Impacto Atual:**
- ~50-100 minutos por PR
- Billing frequentemente excede limites
- Feedback loop lento para desenvolvedores

---

## User Story

**Como** mantenedor do AIOS-FULLSTACK,
**Quero** otimizar os workflows do GitHub Actions,
**Para que** tenhamos CI rápido, econômico e sem redundâncias.

---

## Scope

### In Scope

| Feature | Description |
|---------|-------------|
| Workflow Audit | Documentar propósito de cada workflow |
| Consolidation | Unificar lint/typecheck em único workflow |
| Path Filters | Skip CI para docs-only, config-only changes |
| Matrix Optimization | Full matrix apenas em main, minimal em PRs |
| Concurrency | Cancelar runs obsoletas |
| Caching | Otimizar cache de node_modules |
| Documentation | README de workflows e decisões |

### Out of Scope

- Migração para outro CI (CircleCI, Jenkins)
- Self-hosted runners
- Mudanças nos tests em si (coverage é Story 6.2)

---

## Acceptance Criteria

### AC6.1.1: Workflow Audit Documentado
- [ ] Tabela com todos os 6 workflows e seus propósitos
- [ ] Identificação de redundâncias específicas
- [ ] Decision log de quais manter/remover/consolidar

### AC6.1.2: Lint/TypeCheck Consolidados
- [ ] Single source of truth para lint
- [ ] Single source of truth para typecheck
- [ ] Outros workflows referenciam ou delegam

### AC6.1.3: Path Filters Implementados
- [ ] Docs-only changes não triggeram tests
- [ ] Config-only changes têm CI reduzido
- [ ] Code changes triggeram CI completo

### AC6.1.4: Matrix Otimizada
- [ ] PRs: Apenas ubuntu-latest + Node 20.x (ou LTS)
- [ ] Main branch: Full cross-platform matrix
- [ ] macOS runners minimizados (mais caros)

### AC6.1.5: Concurrency Configurada
- [ ] `concurrency` com `cancel-in-progress: true` em todos workflows
- [ ] Group by PR number para não cancelar main

### AC6.1.6: Caching Otimizado
- [ ] Cache de node_modules com hash de package-lock.json
- [ ] Cache compartilhado entre jobs do mesmo PR
- [ ] Verificar se cache está sendo reutilizado

### AC6.1.7: Métricas de Sucesso
- [ ] Tempo médio de CI: 50-100min → 15-25min (50-75% redução)
- [ ] Minutos consumidos por PR documentados antes/depois
- [ ] README com guidelines de quando adicionar workflows

---

## Technical Design

### 1. Current Workflows Analysis

| Workflow | Trigger | Jobs | Redundancy |
|----------|---------|------|------------|
| `aios-ci.yml` | push, PR | lint, typecheck, test, story | ⚠️ Overlaps with test.yml |
| `pr-automation.yml` | PR | lint, typecheck, test, coverage, metrics | ⚠️ Overlaps with aios-ci |
| `cross-platform-tests.yml` | push, PR | 9 matrix jobs | ⚠️ Too expensive for PRs |
| `test.yml` | push, PR | lint, security, build, compatibility | ⚠️ Overlaps with others |
| `pr-labeling.yml` | PR | auto-labels | ✅ Minimal cost |
| `npm-publish.yml` | release | publish | ✅ Minimal cost |

### 2. Proposed Consolidation

```yaml
# .github/workflows/ci.yml (MAIN - consolidado)
name: CI
on:
  push:
    branches: [main]
    paths-ignore:
      - 'docs/**'
      - '*.md'
      - '.aios/**'
  pull_request:
    paths-ignore:
      - 'docs/**'
      - '*.md'
      - '.aios/**'

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps: [checkout, setup-node, cache, lint, typecheck]

  test:
    needs: lint-and-typecheck
    runs-on: ubuntu-latest
    steps: [checkout, setup-node, cache, test]

  # Full matrix apenas em main
  cross-platform:
    if: github.ref == 'refs/heads/main'
    needs: test
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20, 22]
```

### 3. Files to Modify

| File | Action |
|------|--------|
| `.github/workflows/aios-ci.yml` | Consolidar em ci.yml |
| `.github/workflows/pr-automation.yml` | Remover lint/typecheck, manter metrics |
| `.github/workflows/cross-platform-tests.yml` | Mover para ci.yml com conditional |
| `.github/workflows/test.yml` | Remover redundâncias |
| `.github/workflows/ci.yml` | NOVO - workflow consolidado |
| `docs/architecture/ci-cd.md` | NOVO - documentação |

---

## Implementation Tasks

### Phase 1: Audit & Document (1h)
- [ ] Executar cada workflow localmente com `act` se possível
- [ ] Documentar exatamente o que cada job faz
- [ ] Criar tabela de redundâncias

### Phase 2: Consolidation (2h)
- [ ] Criar novo `ci.yml` consolidado
- [ ] Migrar lint/typecheck para novo workflow
- [ ] Adicionar path filters
- [ ] Configurar concurrency

### Phase 3: Matrix Optimization (1h)
- [ ] Condicional para cross-platform apenas em main
- [ ] Reduzir matrix de PRs para ubuntu + Node LTS
- [ ] Remover macOS 18.x/20.x (já excluídos por SIGSEGV)

### Phase 4: Cleanup & Test (1h)
- [ ] Remover/deprecar workflows redundantes
- [ ] Testar em PR de feature
- [ ] Verificar que main ainda tem full coverage

### Phase 5: Documentation (0.5h)
- [ ] Criar `docs/architecture/ci-cd.md`
- [ ] README section sobre CI
- [ ] Document decision log

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Quebrar CI em main | High | Testar extensivamente em branch primeiro |
| Perder coverage de plataforma | Medium | Manter full matrix em main |
| Cache não funcionar | Low | Fallback para fresh install |

---

## Test Scenarios

1. **PR com code changes** → CI completo (lint + test)
2. **PR com docs-only** → Skip CI ou minimal
3. **Push to main** → Full cross-platform matrix
4. **PR atualizado** → Cancela run anterior

---

## Definition of Done

- [ ] Tempo de CI em PRs reduzido em 50%+
- [ ] Nenhuma redundância de lint/typecheck
- [ ] Path filters funcionando
- [ ] Documentação de CI criada
- [ ] Todos os tests passando em main
- [ ] Métricas antes/depois documentadas

---

## References

- `.github/workflows/` - Diretório de workflows
- [GitHub Actions Billing](https://docs.github.com/en/billing/managing-billing-for-github-actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

## File List

*To be updated during implementation*

---

*Story created by @po (Pax) - 2025-12-08*
*Backlog item: 1733679600001*
