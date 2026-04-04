# Forge Evolution Checklist for Claude

> Baseado na auditoria de `skills/forge/docs/FORGE-EVOLUTION-PLAN.md`
> Data: 2026-04-04
> Status geral: parcialmente implementado, com gaps estruturais a corrigir

---

## Resumo Executivo

- [x] Os artefatos principais das 9 features existem no repositório
- [x] `node skills/forge/scripts/validate-plugins.cjs` passa
- [x] `node skills/forge/scripts/validate-forge-quest-sync.cjs` passa
- [ ] Os novos modos `DRY_RUN`, `REPLAY` e `TEMPLATE` foram propagados corretamente para o ecossistema de plugins
- [ ] Todos os novos workflows seguem integralmente o template de `skills/forge/WORKFLOW-GUIDE.md`
- [ ] O status "COMPLETO ✅" do plano bate com os critérios globais ainda abertos

---

## Checklist Crítico

### 1. Propagação dos novos modos nos plugins

- [ ] Atualizar `skills/forge/plugins/SCHEMA.md` para incluir modos válidos:
  - `DRY_RUN`
  - `REPLAY`
  - `TEMPLATE`
- [ ] Atualizar `skills/forge/scripts/validate-plugins.cjs` para aceitar:
  - `DRY_RUN`
  - `REPLAY`
  - `TEMPLATE`
- [ ] Revisar plugins relevantes e decidir explicitamente em quais novos modos cada um deve rodar
- [ ] Garantir coerência entre workflow e plugins para `REPLAY`
- [ ] Garantir coerência entre workflow e plugins para `TEMPLATE`

### 2. Gaps funcionais do `DRY_RUN`

- [ ] Revisar `skills/forge/workflows/dry-run.md` para alinhar a simulação com o mecanismo real de hooks
- [ ] Resolver a inconsistência entre:
  - "não existe Phase 0-5 real"
  - "ecosystem-scanner plugin roda normalmente"
- [ ] Decidir uma das abordagens:
  - simular quais plugins disparariam sem executá-los
  - ou definir um fluxo real de hooks compatível com `DRY_RUN`
- [ ] Garantir que o relatório do dry-run não prometa plugins/contextos que o modo não consegue realmente produzir

### 3. Aderência ao template de workflow

- [ ] Adicionar `Progress Display` em `skills/forge/workflows/dry-run.md`
- [ ] Adicionar `Quest Integration` em `skills/forge/workflows/dry-run.md`
- [ ] Adicionar `Progress Display` em `skills/forge/workflows/replay.md`
- [ ] Adicionar `Quest Integration` em `skills/forge/workflows/replay.md`
- [ ] Adicionar `Progress Display` em `skills/forge/workflows/template.md`
- [ ] Adicionar `Quest Integration` em `skills/forge/workflows/template.md`
- [ ] Adicionar `Error Recovery` em `skills/forge/workflows/template.md`
- [ ] Reexecutar `node skills/forge/scripts/validate-forge-quest-sync.cjs`
- [ ] Confirmar que os warnings ligados aos novos workflows desapareceram

### 4. Consistência do plano

- [ ] Revisar `skills/forge/docs/FORGE-EVOLUTION-PLAN.md`
- [ ] Alinhar o cabeçalho `Status: COMPLETO ✅` com a realidade atual
- [ ] Fechar ou atualizar a seção `Critérios de Aceitação Global`
- [ ] Marcar explicitamente o que está:
  - implementado
  - implementado com ressalvas
  - pendente

---

## Checklist Fase por Fase

### Fase A — Fundação

- [x] `Feature 1 / Memory` criada
- [x] `Feature 3 / Dependency Graph` criada
- [x] `Feature 2 / Dry Run` criada
- [ ] `Feature 2 / Dry Run` está semanticamente consistente com o sistema real de hooks/plugins

### Fase B — Consumidores de Memory

- [x] `Feature 9 / Feedback` criada
- [x] `Feature 6 / Advisor` criada
- [x] Arquivos e referências principais presentes

### Fase C — Orquestração Avançada

- [x] `Feature 7 / Parallel` criada
- [x] Configuração e documentação principais presentes

### Fase D — Novos Workflows

- [x] `Feature 4 / Replay` criada
- [x] `Feature 8 / Template` criada
- [ ] `Replay` funciona de forma coerente com o filtro de plugins por modo
- [ ] `Template` funciona de forma coerente com o filtro de plugins por modo
- [ ] Ambos seguem integralmente o template de workflow

### Fase E — Pós-Deploy

- [x] `Feature 5 / Watch` criada
- [x] Hook `after:deploy` documentado
- [x] Referências principais adicionadas

---

## Evidências Principais

- `skills/forge/SKILL.md`
- `skills/forge/config.yaml`
- `skills/forge/runner.md`
- `skills/forge/plugins/SCHEMA.md`
- `skills/forge/scripts/validate-plugins.cjs`
- `skills/forge/workflows/dry-run.md`
- `skills/forge/workflows/replay.md`
- `skills/forge/workflows/template.md`
- `skills/forge/plugins/ecosystem-scanner.yaml`
- `skills/forge/plugins/forge-watch.yaml`
- `skills/forge/docs/FORGE-EVOLUTION-PLAN.md`

---

## Comandos de Verificação

```bash
node skills/forge/scripts/validate-plugins.cjs
node skills/forge/scripts/validate-forge-quest-sync.cjs
```

---

## Pedido Objetivo para Claude

- [ ] Verificar se os novos modos `DRY_RUN`, `REPLAY` e `TEMPLATE` foram integrados corretamente ao sistema de plugins
- [ ] Corrigir a inconsistência semântica do `dry-run`
- [ ] Completar os workflows novos para aderirem ao `WORKFLOW-GUIDE.md`
- [ ] Revisar o plano e ajustar o status/checklists globais para refletir a implementação real
