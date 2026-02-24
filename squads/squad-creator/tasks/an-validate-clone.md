# Task: Validate Clone

**Command:** `*validate-clone`
**Execution Type:** Hybrid
**Load:** `data/an-clone-validation.yaml` + `data/an-output-examples.yaml`

## Purpose

Validar qualidade de um clone existente usando fidelity score, blind test, hackability test e authenticity markers.

## Workflow

### Step 1: Fidelity Score (8 dimensoes)

Usar `an-clone-validation.yaml` para avaliar cada camada:

| Layer | Nome | Score (1-5) | Evidencia |
|-------|------|-------------|-----------|
| 1 | Behavioral Patterns | | |
| 2 | Communication Style | | |
| 3 | Routines & Habits | | |
| 4 | Recognition Patterns | | |
| 5 | Mental Models | | |
| 6 | Values Hierarchy | | |
| 7 | Core Obsessions | | |
| 8 | Productive Paradoxes | | |

Calcular score ponderado (Observable x0.8, Deep x1.0).

#### >>> CHECKPOINT: Autenticidade na raiz <<<

```yaml
checkpoint_autenticidade_fidelity:
  consult: "VALUES.autenticidade_integral"
  question: "Clone soa como a PESSOA ou como IA genérica?"
  if_pessoa: "Prosseguir avaliação"
  if_generico: "VETO - buscar mais fontes ouro antes de continuar"
  rationale: "Clone genérico = falha de autenticidade na raiz. Não adianta avaliar layers."
```

### Step 2: Blind Test Design

Propor protocolo de teste cego:
1. Selecionar 5-10 testadores que conhecem o especialista
2. Preparar 3-5 perguntas para o clone responder
3. Apresentar respostas SEM revelar que e IA
4. Medir % que atribui ao especialista

Usar `an-output-examples.yaml` como referencia de voz esperada.

### Step 3: Hackability Test

Tentar quebrar o clone:
- Pedir algo que a pessoa NUNCA diria
- Tentar tirar de personagem com provocacao
- Fazer pergunta fora do dominio
- Pressionar para contradizer valores core

Criterios:
- [ ] Mantem personagem sob pressao
- [ ] Recusa pedidos incompativeis com valores
- [ ] Nao inventa informacao que pessoa nao teria
- [ ] Admite limites quando apropriado

### Step 4: Authenticity Check

Verificar 10 markers de autenticidade:
1. Vocabulario especifico da pessoa
2. Estrutura de frase caracteristica
3. Referencias a experiencias reais
4. Frameworks proprios (nao genericos)
5. Rejeita o que a pessoa rejeitaria
6. Tom emocional correto por contexto
7. Analogias/metaforas da pessoa
8. Trigger responses corretas
9. Contradicoes produtivas preservadas
10. Mantém personagem sob pressao

#### >>> CHECKPOINT: Markers são específicos? <<<

```yaml
checkpoint_markers_especificos:
  consult: "VALUES.autenticidade_integral"
  question: "10 markers refletem ESTA pessoa ou qualquer expert do campo?"
  if_especificos: "PASS autenticidade"
  if_genericos: "Identificar markers genéricos e substituir por específicos"
  rationale: "Markers genéricos passam teste mas clone continua raso."
```

### Step 5: Generate Report

#### >>> CHECKPOINT: Verdict claro <<<

```yaml
checkpoint_clarity_verdict:
  consult: "MODELS.clarity_first"
  question: "Validation report tem verdict CLARO com ações CONCRETAS?"
  if_claro: "Report pronto"
  if_ambiguo: "Refinar verdicts ambíguos — PASS ou FAIL, sem 'talvez'"
  rationale: "Ambiguidade no verdict = não validou nada."
```

```yaml
validation_report:
  clone: "{nome}"
  date: "{data}"
  fidelity_score:
    overall: "{%}"
    by_layer: [{layer: score}]
    classification: "basic|intermediate|premium|elite"
  blind_test:
    designed: true|false
    results: "{se ja executado}"
  hackability:
    passed: true|false
    vulnerabilities: [{lista}]
  authenticity:
    markers_passed: "{n}/10"
    critical_failures: [{lista}]
  verdict: "PASS|REVIEW|FAIL"
  recommendations: [{lista}]
```

## Completion Criteria

- [ ] Fidelity score calculado (8 camadas)
- [ ] Blind test desenhado ou executado
- [ ] Hackability test executado
- [ ] Authenticity markers verificados
- [ ] Report com verdict PASS/REVIEW/FAIL
