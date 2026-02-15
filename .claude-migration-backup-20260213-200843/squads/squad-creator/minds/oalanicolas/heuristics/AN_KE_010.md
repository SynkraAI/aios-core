# AN_KE_010 - Context Death Test

**Type:** Validation Heuristic
**Phase:** 5 (Self-Validation)
**Agent:** @oalanicolas
**Pattern:** Documentation Quality Gate

## Purpose

Validar se documento/plano/spec é self-contained o suficiente para sobreviver à morte do contexto. Conhecimento só existe de verdade quando sobrevive ao reset - se depende de "você lembra que a gente falou...", não está documentado, está só na sua cabeça.

## Configuration

```yaml
AN_KE_010:
  name: "Context Death Test"
  alias: "Reset Test"
  phase: 5
  agent: "@oalanicolas"

  principle: |
    Conhecimento só existe de verdade quando sobrevive à morte do contexto.
    Se depende de "você lembra que a gente falou...", não está documentado.
    Documento self-contained É um clone de conhecimento.

  test_question: |
    "Uma IA com ZERO contexto anterior consegue executar isso sem perguntar nada?"

  validation_checklist:
    - id: "CDT_01"
      check: "Tem o PORQUÊ, não só o QUÊ?"
      weight: 0.9
    - id: "CDT_02"
      check: "Termos técnicos estão definidos ou linkados?"
      weight: 0.7
    - id: "CDT_03"
      check: "Dependências estão explícitas (arquivos, ferramentas, acessos)?"
      weight: 0.8
    - id: "CDT_04"
      check: "Há exemplos concretos, não só abstrações?"
      weight: 0.8
    - id: "CDT_05"
      check: "Decisões já tomadas estão documentadas (não precisa re-decidir)?"
      weight: 0.9
    - id: "CDT_06"
      check: "Constraints/limites estão claros?"
      weight: 0.7
    - id: "CDT_07"
      check: "Output esperado está especificado?"
      weight: 0.8
    - id: "CDT_08"
      check: "Edge cases estão cobertos ou marcados como 'decidir depois'?"
      weight: 0.6

  anti_patterns:
    - pattern: "Você lembra que..."
      problem: "NÃO LEMBRA - contexto morreu"
    - pattern: "Como a gente discutiu..."
      problem: "NÃO DISCUTIU - sessão nova"
    - pattern: "Aquele negócio de..."
      problem: "QUE NEGÓCIO? - referência vazia"
    - pattern: "O padrão normal"
      problem: "QUAL PADRÃO? - assumindo conhecimento"
    - pattern: "Referências a conversas anteriores"
      problem: "Contexto implícito = contexto perdido"
    - pattern: "Assumir conhecimento prévio do domínio"
      problem: "IA zerada não tem domínio"

  validation_levels:
    L1_self:
      description: "Você amanhã entende sem reler conversa?"
      threshold: 0.6
    L2_peer:
      description: "Colega da área entende sem você explicar?"
      threshold: 0.7
    L3_ai:
      description: "IA zerada executa sem perguntar?"
      threshold: 0.8
    L4_stranger:
      description: "Pessoa de fora do projeto entende o suficiente?"
      threshold: 0.9

  thresholds:
    pass: 0.8
    review: 0.6
    fail: "<0.6"

  output:
    type: "decision"
    values: ["PASS", "REVIEW", "FAIL"]
```

## Decision Tree

```
IF (all checklist items pass AND no anti-patterns detected)
  THEN PASS → Document is self-contained

ELSE IF (checklist >= 0.6 AND anti-patterns <= 2)
  THEN REVIEW → Fix specific gaps before proceeding

ELSE IF (checklist < 0.6 OR anti-patterns > 2)
  THEN FAIL → Document needs major rewrite

TERMINATION: Document passes L3_ai level (IA zerada executa sem perguntar)
FALLBACK: Loop back with specific feedback on failing items
```

## Evaluation Criteria

| Criterion | Weight | Threshold | Description |
|-----------|--------|-----------|-------------|
| WHY documented | 0.9 | Required | Porquê, não só o quê |
| Terms defined | 0.7 | >= 80% | Termos técnicos explicados |
| Dependencies explicit | 0.8 | 100% | Arquivos, tools, acessos |
| Concrete examples | 0.8 | >= 1 per concept | Não só abstrações |
| Decisions documented | 0.9 | 100% | Não precisa re-decidir |
| Anti-patterns absent | 1.0 | 0 detected | Zero referências implícitas |

## Validation Questions

1. "Uma IA com ZERO contexto anterior consegue executar isso sem perguntar nada?"
2. "Todos os termos técnicos estão definidos ou linkados?"
3. "As dependências (arquivos, ferramentas, acessos) estão explícitas?"
4. "Existem exemplos concretos ou só abstrações?"
5. "As decisões já tomadas estão documentadas?"
6. "Há alguma frase tipo 'como discutimos' ou 'você lembra'?"

## Performance Metrics

```yaml
performance:
  decision_speed: "2-5 minutes per document"
  accuracy_rate: "95% (anti-patterns are easy to detect)"
  confidence_level: "90% (checklist is explicit)"
  quality_correlation: "Direct - self-contained = usable across contexts"
```

## Failure Modes

### Implicit Context Dependency
- **Trigger:** Documento criado no meio de conversa longa
- **Manifestation:** Referências a "o que falamos", "aquele approach"
- **Detection:** Grep por anti-patterns ("lembra", "discutimos", "aquele")
- **Recovery:** Expandir cada referência implícita com contexto explícito
- **Prevention:** Aplicar checklist ANTES de finalizar documento

### Assumed Domain Knowledge
- **Trigger:** Expert escrevendo para si mesmo
- **Manifestation:** Jargão sem definição, "óbvio" que não é óbvio
- **Detection:** Pedir para não-expert ler e marcar termos desconhecidos
- **Recovery:** Adicionar glossário ou links para definições
- **Prevention:** Checklist item CDT_02 (termos definidos)

### Missing WHY
- **Trigger:** Foco em execução, pressa para entregar
- **Manifestation:** Lista de passos sem rationale
- **Detection:** Para cada ação, perguntar "por que isso e não outra coisa?"
- **Recovery:** Adicionar rationale para cada decisão significativa
- **Prevention:** Checklist item CDT_01 (tem o porquê)

## Second-Order Effects

```yaml
second_order:
  if_passes:
    - "Qualquer IA/pessoa continua o trabalho"
    - "Você pode esquecer e retomar meses depois"
    - "Conhecimento está EXTERNALIZADO (Building a Second Brain)"
    - "Documento vira asset, não liability"
    - "Onboarding de novos membros fica trivial"
    - "Debugging futuro tem contexto completo"

  if_fails:
    - "Dependência de quem escreveu (bus factor = 1)"
    - "Retrabalho toda vez que contexto muda"
    - "Conhecimento morre com a sessão/pessoa"
    - "Documento vira liability (confunde mais que ajuda)"
```

## When NOT to Apply

```yaml
exceptions:
  - context: "Brainstorm exploratório"
    reason: "Ainda não é pra documentar, é pra explorar"
  - context: "Conversa síncrona que vai virar doc depois"
    reason: "Aplicar no doc final, não na conversa"
  - context: "Contexto que DEVE morrer"
    reason: "Decisões temporárias, experimentos descartáveis"
  - context: "Notas pessoais só pra você"
    reason: "Você É o contexto"
```

## Integration with Workflow

```yaml
checkpoint:
  id: "context-death-test"
  heuristic: AN_KE_010
  phase: 5

  trigger_conditions:
    - "Documento/plano finalizado"
    - "Spec pronta para handoff"
    - "Task file completado"
    - "Qualquer artefato que será usado por outra sessão"

  criteria:
    - metric: "checklist_pass_rate"
      threshold: 0.8
      operator: ">="
    - metric: "anti_patterns_count"
      threshold: 0
      operator: "=="
    - metric: "validation_level"
      threshold: "L3_ai"
      operator: ">="

  veto_conditions:
    - condition: "anti_patterns_detected > 0"
      action: "HALT - Expand implicit references"
    - condition: "checklist_pass_rate < 0.6"
      action: "HALT - Major rewrite needed"

  pass_action: "Document approved for handoff/storage"
  fail_action: "Loop back with specific gaps to fix"
```

## Related Heuristics

- **AN008 (Feynman):** Se não explica simples, não entendeu → CDT valida se explicou simples
- **AN014 (Triangulação):** Doc self-contained = múltiplas pessoas validam igual
- **Context Parity (MMOS):** Cada agente carrega seu contexto completo → CDT garante que doc carrega contexto

---

**Pattern Compliance:** Documentation Quality Gate
**Source:** Alan Nicolas - Extracted from recurring behavior pattern
**Trigger:** "Tá super mega ultra bem explicado para uma IA que não sabe nem o que é isso?"
