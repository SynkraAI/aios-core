# Forge Plugin System — Relatório de Validação

> **Data:** 2026-04-03
> **Validado por:** Claude Opus 4.6
> **Escopo:** 9 plugins YAML + 6 arquivos modificados (runner.md, config.yaml, SKILL.md, phase-0, phase-4, WORKFLOW-GUIDE.md)

---

## Resumo Executivo

| Check | Status | Detalhes |
|-------|--------|----------|
| YAML Syntax | ✅ 9/9 válidos | Todos parsam sem erro |
| Schema Compliance | ✅ 9/9 conformes | Todos têm campos obrigatórios |
| Source References | ✅ 9/9 válidos | Todos apontam para arquivos existentes |
| Priority Conflicts | ✅ 0 conflitos | Nenhuma prioridade duplicada |
| Hook Coverage | ⚠️ Parcial | 2 hooks no runner sem subscriber (ver detalhes) |
| Runner Integration | ✅ Completo | Section 2.5 + 9 hook points + fallback |
| SKILL.md Integration | ✅ Completo | Plugin loading + agent hooks + selective reading |
| Config.yaml | ✅ Completo | plugins.dir + deprecated extended_quality |
| Backwards Compatibility | ✅ Garantido | Fallback se plugins/ não existir |

**Veredicto: APROVADO com 1 observação menor.**

---

## 1. YAML Syntax Validation

Todos os 9 arquivos `.yaml` em `skills/forge/plugins/` foram parseados com sucesso usando `yaml.parse()` do Node.js:

| Plugin | Status |
|--------|--------|
| `bulletproof-test.yaml` | ✅ YAML válido |
| `cloud-pentest.yaml` | ✅ YAML válido |
| `code-refactoring.yaml` | ✅ YAML válido |
| `ecosystem-scanner.yaml` | ✅ YAML válido |
| `lifecycle.yaml` | ✅ YAML válido |
| `quest-sync.yaml` | ✅ YAML válido |
| `tier-s-checklist.yaml` | ✅ YAML válido |
| `tokenizacao.yaml` | ✅ YAML válido |
| `vulnerability-scanner.yaml` | ✅ YAML válido |

---

## 2. Schema Compliance

Cada plugin foi validado contra o schema definido em `plugins/SCHEMA.md`, tanto manualmente quanto via `scripts/validate-plugins.cjs`.

**Campos obrigatórios verificados:**
- `plugin.name` (presente, kebab-case, único entre plugins) ✅
- `plugin.version` (semver) ✅
- `plugin.description` (presente) ✅
- `activation.enabled` (boolean) ✅
- `activation.modes` (se presente, apenas modos válidos do Forge) ✅
- `priority` (0-99, único entre plugins) ✅
- `hooks[]` (array com pelo menos 1 item) ✅
- `hooks[].event` (string válida contra hook taxonomy) ✅
- `hooks[].action` (válida: inject, validate, log) ou `hooks[].skill` (presente) ✅
- `hooks[].description` (presente) ✅
- `state_key` (string, único entre plugins) ✅

**Validação automatizada:**
```
$ node skills/forge/scripts/validate-plugins.cjs
✅ PASS — 9 plugins validated
   ✅ state_key uniqueness — 9 unique keys
   ✅ Priority uniqueness — 9 unique priorities
   ✅ Plugin name uniqueness — 9 unique names
```

**Resultado: 9/9 plugins passaram em todos os checks (manuais + automatizados).**

---

## 3. Source & Skill References

Todos os arquivos referenciados por `source` ou `skill` foram verificados no filesystem:

### Source files (ecosystem-scanner)
| Referência | Status |
|-----------|--------|
| `skills/forge/ecosystem-scanner.md` (Section 1) | ✅ Existe |
| `skills/forge/ecosystem-scanner.md` (Section 2) | ✅ Existe |
| `skills/forge/ecosystem-scanner.md` (Section 3) | ✅ Existe |

### Skill files (quality gates)
| Plugin | Skill Reference | Status |
|--------|----------------|--------|
| `bulletproof-test` | `skills/bulletproof-test/SKILL.md` | ✅ Existe |
| `cloud-pentest` | `skills/cloud-penetration-testing/SKILL.md` | ✅ Existe |
| `code-refactoring` | `skills/code-refactoring-refactor-clean/SKILL.md` | ✅ Existe |
| `tier-s-checklist` | `skills/tier-s-checklist/SKILL.md` | ✅ Existe |
| `tokenizacao` | `skills/tokenizacao/SKILL.md` | ✅ Existe |
| `vulnerability-scanner` | `skills/vulnerability-scanner/SKILL.md` | ✅ Existe |

### Plugins sem source/skill (usam description inline)
- `lifecycle.yaml` — instruções completas no campo `description` ✅
- `quest-sync.yaml` — instruções completas no campo `description` ✅

---

## 4. Priority Order & Conflicts

### Mapa de Prioridades (ordem de execução)

| Priority | Plugin | Enabled | Modes |
|----------|--------|---------|-------|
| 1 | `lifecycle` | ✅ true | ALL |
| 10 | `ecosystem-scanner` | ✅ true | FULL_APP, SINGLE_FEATURE, BROWNFIELD, DESIGN_SYSTEM, LANDING_PAGE, CLONE_SITE, SQUAD_UPGRADE |
| 30 | `bulletproof-test` | ✅ true | FULL_APP |
| 31 | `vulnerability-scanner` | ✅ true | FULL_APP, SINGLE_FEATURE |
| 32 | `tier-s-checklist` | ✅ true | FULL_APP |
| 33 | `tokenizacao` | ✅ true | FULL_APP, SINGLE_FEATURE |
| 34 | `code-refactoring` | ✅ true | FULL_APP |
| 35 | `cloud-pentest` | ❌ false | FULL_APP |
| 90 | `quest-sync` | ✅ true | ALL |

**Conflitos de prioridade: 0** — Todas as prioridades são únicas.

**Faixas respeitadas:**
- 1-9 (core): `lifecycle` ✅
- 10-29 (ecosystem): `ecosystem-scanner` ✅
- 30-69 (quality gates): 6 plugins ✅
- 90-99 (sync): `quest-sync` ✅

---

## 5. Hook Coverage Analysis

### Hooks declarados nos plugins

| Hook | Quantidade de Plugins Subscritos |
|------|----------------------------------|
| `after:phase:3` | 6 (todos os quality gates) |
| `after:phase:*` | 2 (lifecycle, quest-sync) |
| `on:error` | 2 (lifecycle, ecosystem-scanner) |
| `after:phase:0` | 1 (ecosystem-scanner) |
| `before:phase:*` | 1 (lifecycle) |
| `on:agent-dispatch` | 1 (ecosystem-scanner) |
| `on:checkpoint` | 1 (lifecycle) |
| `on:story-complete` | 1 (quest-sync) |
| `after:run` | 1 (quest-sync) |

### Hooks no runner.md (fire points)

| Hook Point | Localização no runner.md | Subscriber? |
|-----------|-------------------------|-------------|
| `before:phase:{N}` | Section 2 Step 1, line 34 | ✅ lifecycle |
| `on:agent-dispatch` | Section 2 Step 2, line 39 | ✅ ecosystem-scanner |
| `on:agent-return` | Section 2 Step 2, line 40 | ⚠️ Nenhum plugin subscrito |
| `on:checkpoint` | Section 2 Step 2, line 41 | ✅ lifecycle |
| `after:phase:{N}` | Section 2 Step 3, line 45 | ✅ lifecycle, quest-sync, quality gates |
| `on:story-complete` | Section 3.5, line 144 | ✅ quest-sync |
| `on:error` | Section 4, line 154 | ✅ lifecycle, ecosystem-scanner |
| `on:veto` | Section 5, line 238 | ⚠️ Nenhum plugin subscrito |
| `after:run` | Section 7, line 297 | ✅ quest-sync |

### Hooks no SKILL.md

| Hook Point | Localização | Subscriber? |
|-----------|-------------|-------------|
| `before:run` | Section 3 Step 3, line 184 | ⚠️ Nenhum plugin subscrito |
| `on:agent-dispatch` | Section 5, line 247 | ✅ ecosystem-scanner |
| `on:agent-return` | Section 5, line 250 | ⚠️ Nenhum plugin subscrito |

### ⚠️ Observações sobre hooks sem subscribers

| Hook | Onde é disparado | Status | Avaliação |
|------|-----------------|--------|-----------|
| `on:agent-return` | runner.md line 40, SKILL.md line 250 | Sem subscriber | **ACEITÁVEL** — hook está definido como ponto de extensão futuro. Quando um plugin de métricas for criado, já tem onde se plugar. Nenhum impacto no funcionamento atual. |
| `on:veto` | runner.md line 238 | Sem subscriber | **ACEITÁVEL** — mesmo caso. Ponto de extensão para plugins que queiram adicionar veto checks customizados. |
| `before:run` | SKILL.md line 184 | Sem subscriber | **ACEITÁVEL** — ponto de extensão para setup plugins. O lifecycle já cobre `before:phase:*` que é mais granular. |

**Conclusão:** Os 3 hooks sem subscriber são **intencionais** — são pontos de extensão para plugins futuros. Não causam erro nem overhead (se não tem subscriber, o firing é um no-op).

---

## 6. Runner Integration (runner.md)

### Section 2.5 — Plugin System ✅

Verificado que contém:
- [x] Boot Sequence (5 steps: Discover, Filter enabled, Filter mode, Sort, Build registry)
- [x] Fallback clause ("If plugins/ does not exist or is empty, skip")
- [x] Firing Protocol (lookup, filter, read source, execute action, write state)
- [x] Wildcard resolution (both `before:phase:3` and `before:phase:*` merged)
- [x] Severity handling (recommended → CONCERNS, optional → INFO)
- [x] Plugin state namespace (`plugins.{state_key}`)
- [x] Example state.json structure

### Hook Points no Runner ✅

9 hook points verificados nas seguintes sections:
- Section 2 Step 1 (Enter Phase): `before:phase:{N}` ✅
- Section 2 Step 2 (Execute Phase): `on:agent-dispatch`, `on:agent-return`, `on:checkpoint` ✅
- Section 2 Step 3 (Exit Phase): `after:phase:{N}` ✅
- Section 3.5 (Progress): `on:story-complete` ✅
- Section 4 (Error Recovery): `on:error` ✅
- Section 5 (Veto Conditions): `on:veto` ✅
- Section 7 (Completion): `after:run` ✅

---

## 7. SKILL.md Integration

- [x] Section 3 Step 3: Plugin loading (Glob, Filter, Sort, Build registry, Fire `before:run`)
- [x] Section 3 Step 3: Fallback clause ("If no plugins found: proceed with legacy behavior")
- [x] Section 5 Step 4: `on:agent-dispatch` hook
- [x] Section 5 Step 7: `on:agent-return` hook
- [x] Section 9 (Selective Reading): `plugins/*.yaml` → ALWAYS
- [x] Section 9 (Selective Reading): `plugins/SCHEMA.md` → Only when creating/debugging

---

## 8. Config.yaml

- [x] `plugins.dir: "plugins/"` adicionado
- [x] `extended_quality` marcado como DEPRECATED com comentário explicativo
- [x] Seção `extended_quality` mantida como fallback (backwards compatibility)

---

## 9. Phase Files

### phase-4-integration.md
- [x] Step 4 simplificado para "Plugin-Driven"
- [x] Referência ao hook `after:phase:3`
- [x] Nota "para adicionar novo gate: criar plugin YAML"
- [x] Progress display mantido (visual idêntico ao anterior)
- [x] Steps 1-3, 5-8 inalterados (QA, Pedro Valério, Kaizen, Pre-Push, Summary, Checkpoint, State)

### phase-0-discovery.md
- [x] Step 5 atualizado com nota "Plugin-Driven"
- [x] Referência ao plugin `ecosystem-scanner`
- [x] Instruções originais mantidas como documentação (backwards compatible)

---

## 10. WORKFLOW-GUIDE.md

- [x] Tabela "O que é Herdado Automaticamente" atualizada com `Plugin System`
- [x] Nova seção "Plugin Integration" adicionada antes de "Regras de Ouro"
- [x] Explica que workflows herdam plugins automaticamente
- [x] Documenta como criar plugin exclusivo para um workflow

---

## 11. Backwards Compatibility

| Cenário | Comportamento | Verificado |
|---------|--------------|------------|
| `plugins/` não existe | Runner usa comportamento legado | ✅ (fallback clause em runner.md Section 2.5) |
| `plugins/` vazio | Runner usa comportamento legado | ✅ (mesma clause) |
| Plugin com `enabled: false` | Filtrado no boot, nunca dispara | ✅ (cloud-pentest demonstra) |
| Modo não listado em `modes` | Plugin filtrado para aquele run | ✅ (ecosystem-scanner exclui QUICK) |
| `extended_quality` ainda no config | Funciona como fallback | ✅ (seção mantida com DEPRECATED) |
| Phase files com instruções inline | Continuam funcionando | ✅ (lifecycle plugin faz o mesmo, sem conflito) |

---

## 12. Inventário Final

### Arquivos Criados (11)

| # | Arquivo | Tamanho | Status |
|---|---------|---------|--------|
| 1 | `plugins/SCHEMA.md` | 5.2 KB | ✅ |
| 2 | `plugins/lifecycle.yaml` | 3.9 KB | ✅ |
| 3 | `plugins/ecosystem-scanner.yaml` | 2.2 KB | ✅ |
| 4 | `plugins/quest-sync.yaml` | 2.1 KB | ✅ |
| 5 | `plugins/bulletproof-test.yaml` | 926 B | ✅ |
| 6 | `plugins/vulnerability-scanner.yaml` | 821 B | ✅ |
| 7 | `plugins/tier-s-checklist.yaml` | 790 B | ✅ |
| 8 | `plugins/tokenizacao.yaml` | 893 B | ✅ |
| 9 | `plugins/code-refactoring.yaml` | 948 B | ✅ |
| 10 | `plugins/cloud-pentest.yaml` | 1.0 KB | ✅ |
| 11 | `scripts/validate-plugins.cjs` | ~5 KB | ✅ |

### Arquivos Modificados (6)

| # | Arquivo | Mudanças | Status |
|---|---------|---------|--------|
| 1 | `runner.md` | Section 2.5 + 9 hook points | ✅ |
| 2 | `config.yaml` | `plugins.dir` + deprecated `extended_quality` | ✅ |
| 3 | `SKILL.md` | Plugin loading (S3) + agent hooks (S5) + selective reading (S9) | ✅ |
| 4 | `phases/phase-4-integration.md` | Step 4 simplificado | ✅ |
| 5 | `phases/phase-0-discovery.md` | Nota plugin-driven | ✅ |
| 6 | `WORKFLOW-GUIDE.md` | Seção "Plugin Integration" + tabela | ✅ |

### Documentação

| # | Arquivo | Propósito | Status |
|---|---------|-----------|--------|
| 1 | `docs/PLUGIN-SYSTEM-PLAN.md` | Plano com checklist (100% completo) | ✅ |
| 2 | `docs/PLUGIN-SYSTEM-VALIDATION-REPORT.md` | Este relatório | ✅ |

---

## 13. Observações e Recomendações

### ✅ Pontos Fortes

1. **Zero config pro usuário** — plugins carregam automaticamente, invisíveis
2. **Schema consistente** — todos os 9 plugins seguem o mesmo formato
3. **Prioridades sem conflito** — ordem de execução é determinística
4. **Todas as referências válidas** — nenhum source/skill aponta pra arquivo inexistente
5. **Backwards compatible** — fallback explícito se plugins não existirem
6. **Ownership boundaries respeitados** — quest-sync nunca escreve em quest-log.yaml

### ⚠️ Observações Menores (não bloqueantes)

1. **3 hooks sem subscriber** (`on:agent-return`, `on:veto`, `before:run`) — são pontos de extensão futuros, não bugs. Mas um plugin de métricas futuro deveria usar `on:agent-return` para registrar performance dos agentes.

2. **Duplicação residual nas fases** — Phase files ainda têm instruções inline de checkpoint/state write que o lifecycle plugin agora centraliza. O caso mais evidente é `phase-0-discovery.md` Step 5, onde o ecosystem scan está marcado como "Plugin-Driven" mas mantinha instruções executáveis que poderiam causar execução duplicada. **Corrigido:** as instruções agora são explicitamente marcadas como "reference documentation" com nota clara de que NÃO devem ser reexecutadas quando o plugin system está ativo. O mesmo padrão de duplicação existe em menor grau nos demais phase files (checkpoints, state writes), mas sem risco de execução duplicada.

3. **`detect` é free-text** — O campo `detect` nos quality gates é texto livre interpretado pelo LLM, não uma expressão booleana formal. Funciona bem pro caso de uso atual, mas um sistema de detecção mais estruturado (e.g., glob patterns) seria mais robusto.

4. **Namespace corrigido em phase-4** — O texto original em `phase-4-integration.md` dizia `plugins.{plugin_name}`, mas o contrato real (definido em `runner.md` Section 2.5) é `plugins.{state_key}`. Corrigido: o phase file agora usa `plugins.{state_key}` com nota explicativa.

### 💡 Próximos Passos Sugeridos

1. ~~Criar um script `validate-plugins.cjs`~~ **FEITO** — script criado em `scripts/validate-plugins.cjs`, valida YAML syntax, schema compliance, referências de arquivos, hooks/actions válidos, e unicidade de name/priority/state_key. Retorna exit code 1 se falhar.
2. **Integrar validador ao workflow/CI** — adicionar `node skills/forge/scripts/validate-plugins.cjs` como pre-push check ou como step do `before:run` hook, para que o Forge se auto-valide antes de cada run.
3. Considerar um plugin de métricas (`forge-metrics.yaml`) que use `on:agent-return` para logar performance dos agentes.
4. Gradualmente remover instruções inline duplicadas dos phase files conforme confiança no plugin system cresce, seguindo o padrão aplicado no Step 5 do phase-0 (marcar como "reference documentation").
