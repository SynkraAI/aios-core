# Model Tier Qualification Framework

> Squad Creator Token Economy - Validação Empírica de Tasks por Modelo

**Status:** Active
**Created:** 2026-02-11
**Owner:** @pedro-valerio + @oalanicolas

---

## 1. Conceito Core

```
OPUS = BASELINE (100%)

Para cada task:
1. Roda Opus → Output = Gold Standard
2. Roda Sonnet → Compara com Gold
3. Roda Haiku → Compara com Gold

Threshold de aprovação:
├── Haiku >= 90% → USA HAIKU (máxima economia)
├── Haiku < 90% mas Sonnet >= 95% → USA SONNET
└── Ambos < threshold → MANTÉM OPUS
```

### Economia por Tier

| Tier | Input/1M | Output/1M | vs Opus |
|------|----------|-----------|---------|
| Haiku | $1.00 | $5.00 | **-80%** |
| Sonnet | $3.00 | $15.00 | **-40%** |
| Opus | $5.00 | $25.00 | baseline |

> **Nota:** Preços atualizados para Opus 4.5/4.6 (fev 2026). Legacy Opus 4.0/4.1 era $15/$75.

---

## 2. Scoring Rubric

Cada output é avaliado em 5 dimensões:

### Dimensões de Qualidade

| Dimensão | Weight | Critério |
|----------|--------|----------|
| **Completeness** | 0.30 | Output tem todas as seções/campos esperados? |
| **Accuracy** | 0.30 | Scores, decisões, classificações corretas? |
| **Reasoning** | 0.20 | Justificativas coerentes e úteis? |
| **Format** | 0.10 | Output segue formato esperado? |
| **Actionability** | 0.10 | Recomendações são acionáveis? |

### Escala de Scoring

```yaml
completeness:
  10: "100% das seções presentes"
  7: "80-99% das seções"
  4: "50-79% das seções"
  0: "<50% das seções"

accuracy:
  10: "100% match com Opus"
  7: "Diferença < 10%"
  4: "Diferença 10-30%"
  0: "Diferença > 30%"

reasoning:
  10: "Reasoning equivalente ao Opus"
  7: "Reasoning mais superficial mas correto"
  4: "Reasoning parcialmente incorreto"
  0: "Reasoning ausente ou errado"

format:
  10: "Formato perfeito"
  5: "Formato parcial"
  0: "Formato quebrado"

actionability:
  10: "Tão acionável quanto Opus"
  5: "Menos específico"
  0: "Genérico demais"
```

### Cálculo do Score Final

```
SCORE = Σ (dimension_score × weight)
RANGE = 0-10
PERCENTAGE = SCORE / OPUS_SCORE × 100

THRESHOLD:
  - Haiku: >= 90% (9.0/10)
  - Sonnet: >= 95% (9.5/10)
```

---

## 3. Loop de Compensação

Quando Haiku não atinge 90%, aplicar compensações iterativas:

```
┌─────────────────────────────────────────────────────────────────┐
│ COMPENSAÇÃO ITERATIVA                                           │
│                                                                 │
│ Tentativa 1: OUTPUT EXAMPLES detalhados                         │
│              Adicionar 2-3 exemplos concretos no prompt         │
│              Re-testar → Score melhorou?                        │
│                                                                 │
│ Tentativa 2: CHECKLIST INLINE no prompt                         │
│              Adicionar checklist de validação no próprio prompt │
│              Re-testar → Score melhorou?                        │
│                                                                 │
│ Tentativa 3: TEMPLATE STRICT com campos obrigatórios            │
│              Forçar estrutura exata de output                   │
│              Re-testar → Score melhorou?                        │
│                                                                 │
│ Tentativa 4: VALIDATION SCRIPT pós-output                       │
│              Script que valida e pede correção se falhar        │
│              Re-testar → Score melhorou?                        │
│                                                                 │
│ Se após 4 tentativas ainda < 90%:                               │
│    → Documentar "Haiku não elegível"                            │
│    → Promover para Sonnet                                       │
│    → Repetir processo se Sonnet < 95%                           │
└─────────────────────────────────────────────────────────────────┘
```

### Tipos de Compensação

| Tipo | Quando Usar | Exemplo |
|------|-------------|---------|
| **Output Examples** | Output está incompleto | Adicionar 2-3 outputs completos de referência |
| **Checklist Inline** | Está faltando seções | "Verifique: [ ] seção A [ ] seção B [ ] seção C" |
| **Template Strict** | Formato inconsistente | YAML/JSON schema no prompt |
| **Validation Script** | Erros detectáveis | Script que valida e retorna erros |

---

## 4. Test Cases

Cada task deve ter um test case padronizado:

### Estrutura do Test Case

```yaml
# test-cases/{task-name}.yaml
test_case:
  name: "{task-name}-standard"
  version: "1.0"

  input:
    # Dados de entrada para o teste
    target: "path/to/real/test/data"
    params:
      key: value

  expected_output:
    # Seções obrigatórias no output
    sections:
      - section_1
      - section_2
      - section_3

    # Validações específicas
    validations:
      - "score deve ser numérico entre 0-10"
      - "status deve ser PASS|FAIL|REVIEW"
      - "recommendations deve existir se score < 8"

  baseline:
    # Referência ao output do Opus
    opus_output: "test-results/{task-name}/opus-baseline.yaml"
    opus_score: 10.0  # Por definição
```

### Localização

```
squads/squad-creator/
├── test-cases/
│   ├── _template.yaml              # Template para novos test cases
│   │
│   ├── pv-axioma-assessment/       # Cada task tem sua pasta
│   │   ├── test-case.yaml          # Definição do teste
│   │   ├── opus-baseline.yaml      # Output Opus (gold standard)
│   │   ├── sonnet-output.yaml      # Output Sonnet
│   │   └── haiku-output.yaml       # Output Haiku
│   │
│   ├── validate-squad/
│   │   ├── test-case.yaml
│   │   └── ...
│   └── ...
│
├── config/
│   ├── model-routing.yaml          # Tier assignments
│   └── scoring-rubric.yaml         # Evaluation criteria
│
├── scripts/
│   ├── model-tier-validator.cjs    # Validation tool
│   └── model-usage-logger.cjs      # Usage tracking
```

**Estrutura por task:** Cada task tem sua própria pasta em `test-cases/` contendo:
- `test-case.yaml` - Definição do teste
- `{model}-output.yaml` - Outputs de cada modelo testado

---

## 5. Fluxo de Validação

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. CRIAR SKILL (model: haiku)                                  │
│                    ↓                                            │
│  2. RODAR TEST CASE em [opus, sonnet, haiku]                    │
│                    ↓                                            │
│  3. SCORING (5 dimensões × weights)                             │
│                    ↓                                            │
│  4. COMPARAR com baseline (opus = 100%)                         │
│                    ↓                                            │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ Haiku >= 90%? ────────────────────────→ ✅ SHIP HAIKU  │     │
│  │      │                                                 │     │
│  │      ▼ NO                                              │     │
│  │ COMPENSAR (examples/checklist/template/script)         │     │
│  │      │                                                 │     │
│  │      ▼                                                 │     │
│  │ RE-TEST                                                │     │
│  │      │                                                 │     │
│  │      ▼                                                 │     │
│  │ Haiku >= 90%? ────────────────────────→ ✅ SHIP HAIKU  │     │
│  │      │                                                 │     │
│  │      ▼ NO (após 4 tentativas)                          │     │
│  │ Sonnet >= 95%? ───────────────────────→ ⚠️ SHIP SONNET │     │
│  │      │                                                 │     │
│  │      ▼ NO                                              │     │
│  │ KEEP OPUS ────────────────────────────→ 🔴 SHIP OPUS   │     │
│  └────────────────────────────────────────────────────────┘     │
│                    ↓                                            │
│  5. DOCUMENTAR resultado + padrão aprendido                     │
│                    ↓                                            │
│  6. ATUALIZAR config/model-routing.yaml                         │
│                    ↓                                            │
│  7. PRÓXIMA TASK                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Padrões Aprendidos

Documentar padrões conforme testamos:

### Haiku Funciona Bem Para

- Scoring com fórmula definida
- Checklist validation (PASS/FAIL)
- Format conversion (estrutura clara)
- Registry updates (determinístico)
- Deterministic calculations
- Template-based generation

### Haiku Precisa de Compensação Para

| Padrão | Compensação |
|--------|-------------|
| Multi-step reasoning | Chain-of-thought no prompt |
| Complex output | Template strict com schema |
| Quality judgment | Rubric inline detalhada |
| Missing sections | Checklist de seções obrigatórias |

### Haiku Não Elegível Para

- Creative synthesis
- Nuanced analysis requiring context
- Multi-source integration
- Novel framework creation
- Complex trade-off decisions

---

## 7. Comandos

### Rodar Validação

```bash
# Listar test cases disponíveis
node squads/squad-creator/scripts/model-tier-validator.cjs list

# Validar uma task específica
node squads/squad-creator/scripts/model-tier-validator.cjs validate pv-axioma-assessment

# Gerar relatório consolidado
node squads/squad-creator/scripts/model-tier-validator.cjs report

# Atualizar routing config após validação
node squads/squad-creator/scripts/model-tier-validator.cjs update-routing pv-axioma-assessment haiku "Scoring determinístico"
```

### Logar Resultado Manual

```bash
node scripts/model-usage-logger.cjs log {task} {model} {tokens_in} {tokens_out} {latency}
node scripts/model-usage-logger.cjs report
```

---

## 8. Métricas de Sucesso

| Métrica | Target | Atual | Medição |
|---------|--------|-------|---------|
| Tasks em Haiku | >= 15/41 (37%) | 15/41 | Após validação |
| Tasks em Sonnet | <= 14/41 (34%) | 14/41 | Após validação |
| Tasks em Opus | <= 12/41 (29%) | 12/41 | Após validação |
| Economia total | >= 50% | ~60% | Comparado com tudo em Opus |
| Qualidade mínima | >= 90% | TBD | Score vs Opus baseline |

> **Nota:** Com Opus 4.5/4.6 a $5/$25, a economia de usar Haiku ($1/$5) é ~80%, não ~93%.

---

## 9. Changelog

| Data | Mudança |
|------|---------|
| 2026-02-11 | Framework criado |
| 2026-02-11 | pv-axioma-assessment validado (Haiku OK) |

---

*Model Tier Qualification Framework v1.0*
*Squad Creator Token Economy*
