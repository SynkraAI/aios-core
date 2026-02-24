# Task: validate-extraction

> **Self-Validation Gate** | Checklist antes de handoff para @pedro-valerio

**Execution Type:** Worker

## Objetivo

Validar que a extração de conhecimento está completa e com qualidade suficiente para operacionalização. Se falhar, LOOP - não handoff.

---

## Gate: FRAMEWORK_HANDOFF_READY

#### >>> CHECKPOINTS: Modelos mentais validam o handoff <<<

```yaml
checkpoint_clareza_handoff:
  consult: "VALUES.clareza_radical"
  question: "Insumos como um TODO trazem CLAREZA ou CONFUSÃO?"
  if_clareza: "HANDOFF para PV"
  if_confusao: "LOOP - simplificar antes de entregar"
  rationale: "PV não pode operacionalizar confusão."

checkpoint_pareto_identificado:
  consult: "MODELS.pareto_ao_cubo"
  question: "0.8% do expert está identificado e documentado?"
  if_sim: "Handoff pode prosseguir"
  if_nao: "VETO - executar find-0.8 antes de handoff"
  rationale: "Sem identificar genialidade = clone mediano."

checkpoint_depth_not_breadth:
  consult: "PARADOXES.elitist_egalitarian"
  question: "Insumos refletem PROFUNDIDADE (poucos, ricos) ou VOLUME (muitos, rasos)?"
  if_profundidade: "Handoff com qualidade depth-first"
  if_volume: "LOOP - reduzir volume, aumentar profundidade"
  rationale: "Clone de QUALIDADE (0.8%) > clones medianos (64%)."
```

### Checklist Obrigatório

| # | Critério | Threshold | Status | Evidência |
|---|----------|-----------|--------|-----------|
| 1 | Citações diretas com `[SOURCE: página/minuto]` | ≥ 15 | [ ] | |
| 2 | Signature phrases verificáveis | ≥ 5 | [ ] | |
| 3 | Thinking DNA com decision architecture | Mapeada | [ ] | |
| 4 | Heuristics com contexto (QUANDO aplicar) | Cada uma | [ ] | |
| 5 | Anti-patterns documentados do EXPERT | Não genéricos | [ ] | |
| 6 | Conceitos marcados como "inferido" | Zero | [ ] | |
| 7 | Pareto ao Cubo aplicado (0,8% identificado) | Documentado | [ ] | |

---

## Validação Detalhada

### 1. Citações Diretas (≥ 15)

**O que conta como citação:**
- Frase exata do expert com fonte
- Formato: `"{frase}" [SOURCE: livro p.123]` ou `[SOURCE: podcast 45:30]`

**O que NÃO conta:**
- Paráfrase sem fonte
- "O expert acredita que..." sem citação
- Inferências

**Como verificar:**
```bash
# Contar citações no documento
grep -c "\[SOURCE:" {arquivo}
```

### 2. Signature Phrases (≥ 5)

**O que conta:**
- Frases que o expert repete consistentemente
- Bordões, mantras, expressões características
- Devem aparecer em múltiplas fontes

**Exemplo:**
- Hormozi: "If you're not embarrassed by the first version..."
- Naval: "Specific knowledge cannot be taught"

**Como verificar:**
- Buscar padrões repetidos em diferentes fontes
- Confirmar que não é frase genérica do campo

### 3. Thinking DNA com Decision Architecture

**Deve conter:**
- Como o expert decide (pipeline de decisão)
- Quando aplica cada framework
- Weights/prioridades entre critérios

**Não pode ser:**
- Lista genérica de "boas práticas"
- Frameworks do campo sem adaptação do expert

### 4. Heuristics com Contexto

**Formato correto:**
```yaml
- id: "EX001"
  name: "Regra do X"
  rule: "SE {situação} → ENTÃO {ação}"
  when_to_use: "{contexto específico}"
  source: "[SOURCE: onde extraiu]"
```

**Formato errado:**
```yaml
- "Sempre faça X" (sem contexto)
- "É importante Y" (sem trigger)
```

### 5. Anti-Patterns do EXPERT

**Deve ser:**
- O que ESTE expert especificamente evita
- Com justificativa do expert
- Com [SOURCE:]

**Não pode ser:**
- "Best practices" genéricas do campo
- "Erros comuns" sem citação do expert

### 6. Zero Inferências Não Marcadas

**Buscar e eliminar:**
- Conceitos sem [SOURCE:]
- Afirmações sobre "o que o expert pensa" sem citação
- Generalizações sem evidência

**Se precisar inferir:**
- Marcar explicitamente: `[INFERRED] - needs validation`
- Não entregar para PV com inferências

### 7. Pareto ao Cubo Aplicado

**Deve documentar:**
- 0,8% do expert (genialidade única)
- O que diferencia este expert de outros
- Core do core

---

## Fluxo de Validação

```
┌─────────────────────────────────────────┐
│  Executar Checklist                      │
└─────────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Todos 7 itens PASS? │
         └─────────────────────┘
            │              │
           SIM            NÃO
            │              │
            ▼              ▼
    ┌───────────┐   ┌─────────────────┐
    │  HANDOFF  │   │  LOOP           │
    │  para PV  │   │  Identificar gap│
    └───────────┘   │  Corrigir       │
                    │  Re-validar     │
                    └─────────────────┘
```

---

## Se Falhar: Ações por Item

| Item | Se FAIL | Ação |
|------|---------|------|
| 1. Citações < 15 | Voltar para sources | Buscar mais entrevistas/podcasts |
| 2. Phrases < 5 | Analisar mais conteúdo | Procurar padrões repetidos |
| 3. Decision arch faltando | Extrair mais | Focar em "como decide" |
| 4. Heuristics sem contexto | Adicionar | Documentar QUANDO aplicar |
| 5. Anti-patterns genéricos | Especificar | Buscar citações do expert |
| 6. Inferências presentes | Remover ou validar | Buscar [SOURCE:] ou deletar |
| 7. 0,8% não identificado | Aplicar find-0.8 | Executar task find-0.8.md |

---

## Template de Validação

```yaml
# Validation Report: {expert_name}

## Checklist Results

| # | Critério | Result | Count/Evidence |
|---|----------|--------|----------------|
| 1 | Citações [SOURCE:] | ✅/❌ | {número} |
| 2 | Signature phrases | ✅/❌ | {número} |
| 3 | Decision architecture | ✅/❌ | {sim/não} |
| 4 | Heuristics contextualizadas | ✅/❌ | {número} |
| 5 | Anti-patterns específicos | ✅/❌ | {número} |
| 6 | Zero inferências | ✅/❌ | {número encontradas} |
| 7 | Pareto ao Cubo | ✅/❌ | {sim/não} |

## Gate Decision

**Status:** PASS / FAIL

**Se FAIL - Gaps identificados:**
1. {gap_1}
2. {gap_2}

**Próxima ação:**
- {ação para corrigir}

## Se PASS - Handoff Package

**Artefatos prontos para @pedro-valerio:**
- [ ] {expert}_dna.yaml
- [ ] frameworks/*.md
- [ ] heuristics.yaml
- [ ] source-index.yaml
```

---

## Completion Criteria

| Critério | Status |
|----------|--------|
| Todos 7 itens do checklist verificados | [ ] |
| Evidência documentada para cada item | [ ] |
| Se FAIL: gaps identificados e ação definida | [ ] |
| Se PASS: handoff package listado | [ ] |

---

*"PV não pode operacionalizar inferências. Só entrega com 15+ citações verificáveis."*
