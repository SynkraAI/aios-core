# Mental Model Integration Checklist

> Valida que checkpoints de modelos mentais estão INTEGRADOS nas tasks do oalanicolas

## Pre-Requisito

- [ ] `agents/oalanicolas.md` contém VALUES HIERARCHY (5 valores)
- [ ] `agents/oalanicolas.md` contém CORE OBSESSIONS (3 obsessões)
- [ ] `agents/oalanicolas.md` contém MENTAL MODELS (5 modelos)
- [ ] `agents/oalanicolas.md` contém PRODUCTIVE PARADOXES (4 paradoxos)
- [ ] `data/mental-model-task-matrix.yaml` existe e está completo

## Coverage: Todos os modelos mentais têm checkpoint

### VALUES (5/5)

| Valor | Rank | Tasks com checkpoint | Status |
|-------|------|---------------------|--------|
| clareza_radical | 1 | assess-sources, extract-framework, extract-dna, deconstruct, extract-implicit, validate-extraction | [ ] |
| autenticidade_integral | 2 | assess-sources, extract-framework (x2), validate-clone (x2) | [ ] |
| impacto_transformador | 3 | design-clone, diagnose-clone | [ ] |
| liberdade_criativa | 4 | extract-dna | [ ] |
| evolucao_constante | 5 | assess-sources | [ ] |

### OBSESSIONS (3/3)

| Obsessão | Intensidade | Tasks com checkpoint | Status |
|----------|-------------|---------------------|--------|
| clareza_compreensao_profunda | 10 | extract-framework, deconstruct, extract-dna, extract-implicit, diagnose-clone | [ ] |
| liberdade_autonomia_estrutural | 10 | design-clone | [ ] |
| eficiencia_alavancagem_maxima | 8 | assess-sources, find-0.8 | [ ] |

### MODELS (5/5)

| Modelo | Status | Tasks com checkpoint | Status |
|--------|--------|---------------------|--------|
| pareto_ao_cubo | SIGNATURE | assess-sources, find-0.8, extract-implicit, validate-extraction | [ ] |
| clarity_first | PRIMARY | extract-dna, design-clone, validate-clone, diagnose-clone | [ ] |
| limited_losses_unlimited_gains | RISK | assess-sources, diagnose-clone | [ ] |
| first_principles_thinking | ANALYTICAL | deconstruct, extract-implicit | [ ] |
| frameworks_as_liberation | META | design-clone | [ ] |

### PARADOXES (4/4)

| Paradoxo | Tasks com checkpoint | Status |
|----------|---------------------|--------|
| freedom_through_structure | design-clone (x2) | [ ] |
| clarity_from_chaos | extract-dna, deconstruct | [ ] |
| humble_expert | extract-framework, extract-implicit | [ ] |
| elitist_egalitarian | assess-sources, validate-extraction | [ ] |

## Coverage: Todas as tasks têm checkpoints

| Task | Checkpoints | Modelos usados | Status |
|------|-------------|----------------|--------|
| an-assess-sources | 7 | 5 VALUES + 1 OBS + 1 MODEL + 1 PARADOX | [ ] |
| an-extract-framework | 6 | 2 VALUES + 1 OBS + 1 PARADOX | [ ] |
| an-extract-dna | 5 | 2 VALUES + 1 OBS + 1 MODEL + 1 PARADOX | [ ] |
| find-0.8 | 2 | 1 OBS + 1 MODEL | [ ] |
| an-design-clone | 5 | 1 VALUE + 1 OBS + 1 MODEL + 2 PARADOX | [ ] |
| an-validate-clone | 4 | 2 VALUES + 1 MODEL | [ ] |
| an-diagnose-clone | 4 | 1 VALUE + 1 OBS + 2 MODELS | [ ] |
| deconstruct | 4 | 1 VALUE + 1 OBS + 1 MODEL + 1 PARADOX | [ ] |
| extract-implicit | 5 | 1 VALUE + 1 OBS + 1 MODEL + 1 PARADOX | [ ] |
| validate-extraction | 3 | 1 VALUE + 1 MODEL + 1 PARADOX | [ ] |

## Validation: Checkpoint Quality

Para cada checkpoint inserido, verificar:

- [ ] Tem `consult:` referenciando modelo mental específico
- [ ] Tem `question:` com pergunta decisional (não retórica)
- [ ] Tem `action_if_pass:` e `action_if_fail:` concretos
- [ ] Tem `rationale:` conectando com o modelo mental
- [ ] Está posicionado ANTES do ponto de decisão (não depois)

## Veto Conditions

| # | Trigger | Action |
|---|---------|--------|
| V1 | Modelo mental sem checkpoint em nenhuma task | VETO - criar checkpoint ou remover modelo |
| V2 | Checkpoint sem action definida | VETO - definir action concreta |
| V3 | Task sem nenhum checkpoint | VETO - mínimo 2 checkpoints por task |
| V4 | Checkpoint genérico (serve pra qualquer agent) | VETO - deve ser específico do Alan |

## Totals

- **17 modelos mentais** cobertos
- **46 checkpoints** distribuídos
- **10 tasks** modificadas
- **0 gaps** de cobertura

---

*"Modelo mental solto é filosofia. Modelo mental integrado é decisão."*
