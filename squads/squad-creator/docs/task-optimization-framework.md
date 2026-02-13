# Task Optimization Framework
## Como tornar tasks Haiku-compatible

> "Se precisa de reasoning é porque o processo está vago" - Pedro Valério

---

## 1. CÓDIGO vs LLM

**Pergunta central:** O que pode ser script e o que precisa de LLM?

| Operação | Código (Script) | LLM |
|----------|-----------------|-----|
| Contar arquivos | ✅ `ls | wc -l` | ❌ |
| Verificar se arquivo existe | ✅ `test -f` | ❌ |
| Parse YAML/JSON | ✅ `yq`, `jq` | ❌ |
| Grep por padrão | ✅ `grep -c` | ❌ |
| Calcular porcentagem | ✅ `awk`, Python | ❌ |
| Comparar strings | ✅ `diff`, `==` | ❌ |
| Classificar tipo de conteúdo | ⚠️ Com regex simples | ✅ Se ambíguo |
| Avaliar qualidade de texto | ❌ | ✅ |
| Interpretar intenção | ❌ | ✅ |
| Gerar texto criativo | ❌ | ✅ |

**Regra:** Se pode ser `if/else` com condições claras → SCRIPT

---

## 2. PERGUNTAS PARA CADA TASK

### 2.1 Identificação de Código
- [ ] Quais operações são puramente I/O? (ler, escrever, listar)
- [ ] Quais cálculos são aritméticos? (%, soma, média)
- [ ] Quais verificações são binárias? (existe/não existe)
- [ ] Quais padrões podem ser regex? (formato, estrutura)

### 2.2 Identificação de LLM
- [ ] Onde precisa interpretar linguagem natural?
- [ ] Onde precisa julgamento de qualidade?
- [ ] Onde precisa criatividade?
- [ ] Onde o contexto muda o significado?

### 2.3 Haiku vs Opus
- [ ] A task tem classificação multi-sinal? → Opus
- [ ] A task tem tie-breakers contextuais? → Opus
- [ ] A task tem cascading decisions (A→B→C)? → Opus
- [ ] A task é checklist binário? → Haiku
- [ ] A task é fórmula com pesos? → Haiku
- [ ] A task é gatekeeper (pass/fail)? → Haiku

---

## 3. TEMPLATE DE MELHORIA

### Antes (Vago - precisa Opus):
```yaml
step: "Avaliar qualidade do clone"
how: "Analisar se está bom"
score: "1-5 baseado em julgamento"
```

### Depois (Específico - funciona em Haiku):
```yaml
step: "Avaliar qualidade do clone"
how: |
  1. Grep por 'voice_dna:' no arquivo
  2. Contar quantas signature_phrases existem
  3. Verificar se vocabulary.always_use tem 5+ items
checkpoints:
  - id: 1
    check: "voice_dna section exists"
    command: "grep -c 'voice_dna:' file.md"
    pass_if: "> 0"
  - id: 2
    check: "signature_phrases >= 3"
    command: "grep -A50 'signature_phrases:' file.md | grep -c '  -'"
    pass_if: ">= 3"
score: "count(passed_checkpoints) / total_checkpoints"
```

---

## 4. CHECKLIST DE CONVERSÃO

Para cada task, responder:

### Inputs
- [ ] Os inputs são bem definidos? (path, type, format)
- [ ] Há exemplos de input?
- [ ] Há validação de input?

### Processamento
- [ ] Cada step tem comando/ação específica?
- [ ] "Verificar" está substituído por critério binário?
- [ ] "Avaliar" está substituído por checklist?
- [ ] "Analisar" está substituído por perguntas específicas?

### Outputs
- [ ] O formato de output é template YAML/JSON?
- [ ] Há exemplo de output completo?
- [ ] Os campos são todos especificados?

### Scoring
- [ ] Scoring é fórmula matemática?
- [ ] Thresholds são números fixos?
- [ ] Classificação é por faixas definidas?

---

## 5. PADRÕES DE CONVERSÃO

### Padrão 1: "Avaliar qualidade" → Checkpoints binários

**Antes:**
```
Avaliar se o voice_dna está bem implementado (1-5)
```

**Depois:**
```yaml
voice_dna_quality:
  checkpoints:
    - "voice_dna: section exists" # grep test
    - "signature_phrases has 3+ items" # count test
    - "vocabulary.always_use has 5+ items" # count test
    - "vocabulary.never_use has 3+ items" # count test
    - "metaphors section exists" # grep test
  score: "passed / 5"
```

### Padrão 2: "Classificar tipo" → Decision tree com ordem

**Antes:**
```
Detectar se é Expert, Pipeline ou Hybrid squad
```

**Depois:**
```yaml
type_detection:
  step_1: "count agents with voice_dna"
  step_2: "count workflow files"
  step_3: "check for heuristic IDs (PV_*, SC_*)"

  decision:
    if: "voice_dna_count >= 50% of agents"
    then: "expert"
    elif: "workflow_files >= 3"
    then: "pipeline"
    elif: "heuristic_ids_found"
    then: "hybrid"
    else: "pipeline"  # default
```

### Padrão 3: "Julgamento interpretativo" → Scoring Calibration

**Antes:**
```
Avaliar se o clone passa ou reprova
```

**Depois:**
```yaml
scoring_calibration:
  principle: "Score o que EXISTE, não o que falta"
  rule: "Se evidência presente → ponto. Gaps → recommendations."

  example:
    wrong: "voice_dna incomplete, score 2/5"
    right: "voice_dna has 3 of 5 elements, score 3/5. Gaps: add metaphors, add never_use"
```

---

## 6. QUANDO ACEITAR OPUS

Algumas tasks são irredutivelmente complexas:

- **DNA Extraction:** Requer síntese criativa
- **Agent Creation:** Requer persona design
- **Type Detection com ambiguidade:** Quando sinais conflitam
- **Deep Research:** Requer triangulação de fontes

**Regra:** Se após todas as otimizações ainda precisa de "julgamento humano", é OPUS.

---

## 7. MÉTRICAS DE SUCESSO

Uma task está otimizada quando:

1. **Haiku atinge 90%+ do resultado Opus**
2. **Ou a decisão final (pass/fail) é idêntica**
3. **E o custo é 95%+ menor**

Se Haiku erra a direção (PASS vs FAIL, tipo A vs tipo B), a task precisa de mais trabalho ou é Opus-only.

---

## 8. EXEMPLO COMPLETO: an-fidelity-score

### Antes (v1.0 - Opus needed):
```
Avaliar layer 1-5 baseado em julgamento
Evidência: "como age, reage"
```

### Depois (v2.0 - Haiku compatible):
```yaml
layer_1_behavioral_patterns:
  where_to_look: "persona:, behavioral_patterns:, modes:, states:"
  checkpoints:
    - id: 1
      check: "Greeting ritual"
      what: "Saudação específica"
      pass_if: "Existe texto de greeting definido"
    - id: 2
      check: "Response structure"
      what: "Padrão de resposta"
      pass_if: "Existe response_format: ou equivalente"
    # ... 3 mais checkpoints
  score: "count(passed) # 0-5"
```

---

*Framework Version: 1.0*
*Author: @pedro-valerio*
*Date: 2026-02-11*
