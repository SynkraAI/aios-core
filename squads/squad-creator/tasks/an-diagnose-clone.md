# Task: Diagnose Clone

**Command:** `*diagnose-clone`
**Execution Type:** Hybrid
**Load:** `data/an-clone-anti-patterns.yaml`

## Purpose

Diagnosticar por que um clone esta fraco, mapeando sintomas para causas raiz e prescrevendo tratamento.

## Workflow

### Step 1: Identify Symptoms

Perguntar ao usuario: "O que esta errado com o clone?"

Sintomas comuns:
- "Responde generico" → provavelmente falta Framework
- "Nao parece a pessoa" → fontes bronze ou sem Voice DNA
- "Se perde em conversas longas" → prompt monolitico, precisa estagios
- "Quebra facil" → sem veto conditions, immune system fraco
- "Inventa coisas" → sem Swipe File, sem limites
- "Muito robótico" → sem contradicoes produtivas, sem storytelling

### Step 2: Map to Root Cause

#### >>> CHECKPOINT: Causa raiz real? <<<

```yaml
checkpoint_root_cause:
  consult: "OBSESSIONS.clareza_compreensao_profunda"
  question: "Mapeei a CAUSA RAIZ real ou só o sintoma imediato?"
  if_raiz: "Root cause com evidência"
  if_sintoma: "Aplicar '5 Whys' até chegar em causa fundamental"
  rationale: "Tratar sintoma = clone continua fraco. Tratar causa = transformação."
```

Usar `an-clone-anti-patterns.yaml` para diagnosticar:

| Sintoma | Causa Raiz Provavel | Anti-pattern |
|---------|---------------------|-------------|
| Generico | Falta Framework | So Playbook, sem SE/ENTAO |
| Nao parece pessoa | Fontes bronze | Volume sem curadoria |
| Se perde | Prompt monolitico | Sem estagios |
| Quebra facil | Sem immune system | Sem veto conditions |
| Inventa | Sem Swipe File | Sem exemplos reais |
| Robótico | Sem paradoxos | Contradictions resolvidas |

### Step 3: Verify Trinity

Checklist rapido:
- [ ] Tem Playbook? (passo a passo)
- [ ] Tem Framework? (SE/ENTAO)
- [ ] Tem Swipe File? (exemplos reais)
- [ ] Fontes sao ouro ou bronze?
- [ ] Quanto % do tempo foi curadoria?

### Step 4: Prescribe Treatment

#### >>> CHECKPOINTS: Impacto + ROI do tratamento <<<

```yaml
checkpoint_impacto_tratamento:
  consult: "VALUES.impacto_transformador"
  question: "Tratamento gera transformação PROFUNDA ou patch superficial?"
  if_profundo: "Priorizar tratamento"
  if_superficial: "Buscar root cause mais profunda"
  rationale: "Depth over breadth. Patch = clone volta a falhar."

checkpoint_roi_tratamento:
  consult: "MODELS.limited_losses_unlimited_gains"
  question: "Tratamento tem downside limitado e upside aberto?"
  if_bom_ratio: "Priorizar"
  if_mau_ratio: "Buscar tratamento com melhor ratio"
  rationale: "Tratamento caro com ganho marginal = desperdício."
```

Para cada causa raiz, prescrever acao especifica:

| Causa | Tratamento | Prioridade |
|-------|------------|------------|
| Falta Framework | Extrair regras SE/ENTAO de entrevistas | URGENTE |
| Fontes bronze | Reclassificar, buscar ouro | URGENTE |
| Sem estagios | Mapear contextos, criar stages | ALTA |
| Sem Swipe | Coletar exemplos reais | ALTA |
| Sem immune | Definir veto conditions | MEDIA |
| Sem paradoxos | Mapear contradictions produtivas | MEDIA |

### Step 5: Generate Report

#### >>> CHECKPOINT: Diagnóstico claro <<<

```yaml
checkpoint_clarity_diagnosis:
  consult: "MODELS.clarity_first"
  question: "Diagnóstico tem causa raiz CLARA e tratamento ACIONÁVEL?"
  if_claro: "Report pronto"
  if_vago: "Simplificar: 1 causa + 1 ação por problema"
  rationale: "Diagnóstico vago = tratamento vago = clone continua fraco."
```

```yaml
diagnosis_report:
  clone: "{nome}"
  symptoms: [{lista}]
  root_causes:
    - cause: "{causa}"
      evidence: "{evidencia}"
      severity: "critico|alto|medio"
  trinity_status:
    playbook: "presente|ausente|parcial"
    framework: "presente|ausente|parcial"
    swipe_file: "presente|ausente|parcial"
  source_quality: "ouro|mixed|bronze"
  treatment:
    - action: "{o que fazer}"
      priority: "urgente|alta|media"
      effort: "{estimativa}"
  prognosis: "Com essas acoes, fidelidade deve subir de {X}% para {Y}%"
```

## Completion Criteria

- [ ] Sintomas identificados
- [ ] Causas raiz mapeadas
- [ ] Trindade verificada
- [ ] Tratamento prescrito com prioridades
- [ ] Report de diagnostico gerado
