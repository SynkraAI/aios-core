# Task: validate-extraction

> **Self-Validation Gate** | Checklist antes de handoff para @pedro-valerio

**Execution Type:** Worker
**Model:** Haiku
**Haiku Eligible:** YES

## Checklist Reference

Before marking this task complete, verify against: `checklists/sop-validation.md`

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
| 8 | Evasion Scan executado (silêncios mapeados) | Executado | [ ] | |
| 9 | Paradigm Inversions documentadas | ≥ 1 | [ ] | |
| 10 | Cross-Source Patterns confirmados (triangulação) | ≥ 1 padrão em 3+ fontes | [ ] | |
| 11 | Adversarial Stress Test passado | Cada lente testada | [ ] | |

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

### 8. Evasion Scan Executado

**O que conta:**
- Análise de temas que o expert evitou, minimizou ou desviou
- Cada evasão classificada: CONSCIOUS / HABITUAL / SCOPE_LIMIT
- Triangulação com outras fontes quando possível

**Por que importa para o clone:**
- Clone que não conhece os limites do expert vai inventar respostas onde o expert calaria
- Evasões mapeadas = guardrails do clone (onde NÃO responder com confiança)

**Como verificar:**
- Pelo menos 1 tema evitado identificado (toda fonte tem silêncios)
- Se zero evasões detectadas: provavelmente análise superficial — refazer

### 9. Paradigm Inversions Documentadas (≥ 1)

**O que conta:**
- Pelo menos 1 inversão real: "Campo acredita X → Expert defende Y porque Z"
- Com [SOURCE:] e framework oculto extraído
- Formato: `SE {campo diz X} → ENTÃO {expert faz Y} PORQUE {razão}`

**O que NÃO conta:**
- Reformulações óbvias ("qualidade importa" não é inversão)
- Inversões genéricas sem citação do expert

**Por que importa para o clone:**
- Inversões são o 0,8% do Thinking DNA — onde mora a genialidade
- Clone sem inversões = clone genérico que pensa como todo mundo

### 10. Cross-Source Pattern Detection (≥ 1 padrão confirmado)

**O que é:**
- Mesmo achado (gap, inversão ou evasão) aparecendo em 3+ fontes INDEPENDENTES
- Anedota (1 fonte) → Indício (2 fontes) → Padrão confirmado (3+ fontes)

**Como verificar:**
```yaml
cross_source_patterns:
  - pattern: "{descrição do padrão}"
    type: "GAP / INVERSION / EVASION"
    sources:
      - source: "{fonte 1}"
        evidence: "{trecho}" # [SOURCE: minuto/página]
      - source: "{fonte 2}"
        evidence: "{trecho}" # [SOURCE: minuto/página]
      - source: "{fonte 3}"
        evidence: "{trecho}" # [SOURCE: minuto/página]
    confidence: "CONFIRMED (3+ fontes)"
    implication: "{o que o padrão revela sobre o expert}"
```

**Regras:**
- Se total de fontes < 3: marcar como `[UNCONFIRMED]` e documentar, mas não contar como PASS
- Se fontes são derivadas umas das outras (livro baseado em podcast): contam como 1, não 2
- Fontes devem ser INDEPENDENTES (períodos diferentes, contextos diferentes, entrevistadores diferentes)

**Por que importa para o clone:**
- Padrão confirmado em 3+ fontes = heurística REAL do expert (não aberração pontual)
- Clone baseado em padrões confirmados > clone baseado em anedotas
- Regra AN014 (Triangulação): "Uma fonte = anedota. Três fontes = padrão."

### 11. Adversarial Stress Test (Steel Man → Attack → Survive?)

**O que é:**
Para cada achado das 3 lentes, aplicar teste adversarial em 2 passos:
1. **Steel Man** — Fortalecer o achado (qual a interpretação mais forte?)
2. **Attack** — Tentar destruir (que evidência contrária existe?)
3. **Survive?** — Se sobrevive ao ataque, é robusto. Se não, descartar ou rebaixar.

**Template:**
```yaml
adversarial_test:
  - finding: "{achado da lente}"
    lens: "GAP / INVERSION / EVASION"

    steel_man: "{melhor versão do argumento}"
    attack: "{contra-argumento mais forte}"
    counter_evidence: "{evidência que contradiz}" # [SOURCE:] se houver

    verdict: "SURVIVES / WEAKENED / DESTROYED"
    action:
      survives: "Manter como achado confirmado"
      weakened: "Rebaixar confiança, marcar [NEEDS_VALIDATION]"
      destroyed: "Remover do output final"
```

**Perguntas adversariais por lente:**

| Lente | Steel Man | Attack |
|-------|-----------|--------|
| GAP Analysis | "E se o gap é INTENCIONAL (expert mudou o plano conscientemente)?" | "E se o gap é simplesmente desorganização, não autenticidade?" |
| Inversions | "Qual a versão mais forte desta inversão?" | "E se é EGO do expert, não insight? E se o campo tem razão?" |
| Evasion Scan | "Qual a interpretação mais generosa da evasão?" | "E se é limitação de tempo, não de competência?" |

**Como verificar:**
- Pelo menos 1 achado por lente passou pelo stress test
- Achados que foram DESTROYED foram removidos do output
- Achados WEAKENED foram marcados com [NEEDS_VALIDATION]

**Por que importa para o clone:**
- Clone baseado em achados não testados = clone com vieses do EXTRATOR, não do expert
- Adversarial test elimina projection bias (atribuir ao expert o que é interpretação minha)
- Regra AN015: "Destruir espantalho é fácil. Steel man revela força real."

---

## Fluxo de Validação

```
┌─────────────────────────────────────────┐
│  Executar Checklist                      │
└─────────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Todos 11 itens PASS?│
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
| 8. Evasion Scan não feito | Voltar para fontes | Analisar perguntas evitadas e desvios |
| 9. Zero inversões | Analisar divergências | Buscar onde expert contradiz o campo |
| 10. Zero cross-source patterns | Triangular achados | Verificar mesmos achados em outras fontes |
| 11. Stress test não feito | Executar adversarial | Steel Man → Attack cada achado das 3 lentes |

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
| 8 | Evasion Scan | ✅/❌ | {número de evasões} |
| 9 | Paradigm Inversions | ✅/❌ | {número de inversões} |
| 10 | Cross-Source Patterns | ✅/❌ | {número confirmados em 3+ fontes} |
| 11 | Adversarial Stress Test | ✅/❌ | {achados survividos / total testados} |

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
| Todos 11 itens do checklist verificados | [ ] |
| Evidência documentada para cada item | [ ] |
| Se FAIL: gaps identificados e ação definida | [ ] |
| Se PASS: handoff package listado | [ ] |

---

*"PV não pode operacionalizar inferências. Só entrega com 15+ citações verificáveis."*
