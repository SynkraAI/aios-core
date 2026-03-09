# AN_KE_003 - Pareto ao Cubo

**Type:** Classification Framework
**Phase:** 2 (Source Classification)
**Agent:** @oalanicolas
**Pattern:** Prioritization Pattern

## Purpose

Classificar conhecimento, atividades ou fontes em 4 zonas para priorização extrema. Baseado na observação que 0,8% das atividades produzem ~51% dos resultados.

## The Four Zones

```yaml
zones:
  zone_genius:
    id: "zone_0.8"
    name: "Zona de Genialidade"
    percentage: "0,8%"
    result_contribution: "~51%"
    icon: "🔥"
    action: "PROTEGER a todo custo"
    characteristics:
      - "Só você consegue fazer"
      - "Gera resultado desproporcional"
      - "Coloca você em flow"
      - "Singularidade humana"

  zone_excellence:
    id: "zone_4"
    name: "Zona de Excelência"
    percentage: "4%"
    result_contribution: "~64% (cumulativo)"
    icon: "💎"
    action: "DESENVOLVER"
    characteristics:
      - "Você faz muito bem"
      - "Gera bons resultados"
      - "Pode ser ensinado"
      - "Potencial de delegação com treinamento"

  zone_impact:
    id: "zone_20"
    name: "Zona de Impacto"
    percentage: "20%"
    result_contribution: "~80% (cumulativo)"
    icon: "🚀"
    action: "MANTER (delegar se possível)"
    characteristics:
      - "Necessário para operação"
      - "Resultados moderados"
      - "Pode ser delegado ou automatizado"
      - "Não é diferencial"

  zone_waste:
    id: "zone_80"
    name: "Zona de Merda"
    percentage: "80%"
    result_contribution: "~20%"
    icon: "💩"
    action: "ELIMINAR"
    characteristics:
      - "Qualquer um pode fazer"
      - "Resultado desproporcional baixo"
      - "Drena energia"
      - "Parece urgente mas não é importante"
```

## Configuration

```yaml
AN_KE_003:
  name: "Pareto ao Cubo"
  phase: 2
  agent: "@oalanicolas"

  classification_flow:
    - step: 1
      question: "Se eu parar de fazer isso, o que acontece?"
      test: "Impacto"
    - step: 2
      question: "Só eu consigo fazer isso?"
      test: "Singularidade"
    - step: 3
      question: "Isso gera resultado desproporcional?"
      test: "Valor"
    - step: 4
      question: "Isso me coloca em flow?"
      test: "Genialidade"

  weights:
    impact: 0.9
    singularity: 0.8
    value: 0.7
    flow: 0.6

  veto_conditions:
    - condition: "classification_not_applied"
      action: "REVIEW - Apply Pareto ao Cubo before proceeding"
    - condition: "zone_80_prioritized"
      action: "VETO - Eliminar antes de continuar"

  output:
    type: "classification"
    format: "4 zonas com [SOURCE:]"
```

## Decision Tree

```
FOR EACH item (activity, source, knowledge):

  IF (impacto = alto AND singularidade = alta AND valor = alto AND flow = sim)
    THEN zone = 0.8% (Genialidade) → PROTEGER

  ELSE IF (impacto = alto AND singularidade = média AND valor = alto)
    THEN zone = 4% (Excelência) → DESENVOLVER

  ELSE IF (impacto = médio AND pode_delegar = sim)
    THEN zone = 20% (Impacto) → MANTER/DELEGAR

  ELSE
    THEN zone = 80% (Merda) → ELIMINAR

TERMINATION: All items classified in one of 4 zones
PRIORITY: Focus on 0.8% first, eliminate 80% aggressively
```

## Classification Matrix

| Impacto | Singularidade | Valor | Flow | Zone | Action |
|---------|---------------|-------|------|------|--------|
| Alto | Alta | Alto | Sim | 0,8% 🔥 | PROTEGER |
| Alto | Alta | Alto | Não | 4% 💎 | DESENVOLVER |
| Alto | Média | Médio | - | 4% 💎 | DESENVOLVER |
| Médio | Baixa | Médio | - | 20% 🚀 | MANTER |
| Baixo | Baixa | Baixo | - | 80% 💩 | ELIMINAR |

## Application Examples

### Expert Activities Classification

```yaml
expert: "Alex Hormozi"

zone_0.8_genius:
  - activity: "Criar frameworks de valor"
  - activity: "Gravar conteúdo autêntico"
  - activity: "Fechar deals high-ticket"
  source: "[SOURCE: $100M Offers, intro]"

zone_4_excellence:
  - activity: "Mentorar portfolio companies"
  - activity: "Revisar ofertas de clientes"
  source: "[SOURCE: Acquisition.com blog]"

zone_20_impact:
  - activity: "Reuniões de alinhamento"
  - activity: "Emails operacionais"
  note: "Delegado para team"

zone_80_eliminate:
  - activity: "Social media pessoal"
  - activity: "Networking genérico"
  note: "Eliminado ou minimizado"
```

### Source Classification for Clone

```yaml
clone_project: "Hormozi Clone"

zone_0.8_sources:  # Ouro puro
  - "Comentários respondendo perguntas específicas"
  - "Entrevistas longas (Lex Fridman, MFCEO)"
  - "Stories explicando decisões"
  quality: "Autenticidade máxima"

zone_4_sources:  # Ouro
  - "Livros ($100M Offers, Leads)"
  - "Podcast próprio (Game)"
  - "Posts LinkedIn com insights"
  quality: "Curado, mas editado"

zone_20_sources:  # Bronze
  - "Palestras em eventos"
  - "Entrevistas curtas"
  quality: "Genérico, repetitivo"

zone_80_sources:  # Eliminar
  - "Conteúdo antigo (2016-2019)"
  - "Terceiros falando sobre ele"
  - "Clips sem contexto"
  quality: "Noise, não signal"
```

## Validation Questions

1. "Classifiquei todas as atividades/fontes em 4 zonas?"
2. "O 0,8% está claramente identificado e protegido?"
3. "O 80% está marcado para eliminação?"
4. "Cada classificação tem [SOURCE:]?"
5. "Estou gastando tempo proporcional ao impacto de cada zona?"

## Performance Metrics

```yaml
performance:
  classification_accuracy: "85% (requires iteration)"
  time_to_classify: "30min per 20 items"
  zone_distribution_typical:
    zone_0.8: "1-3 items"
    zone_4: "3-5 items"
    zone_20: "10-15 items"
    zone_80: "80+ items (to eliminate)"
  impact_improvement: "2-3x productivity when followed"
```

## Failure Modes

### Over-Classification in Genius Zone
- **Trigger:** Ego, attachment to activities
- **Manifestation:** 20%+ items in "genius zone"
- **Detection:** Zone 0.8% has > 5 items
- **Recovery:** Re-test with brutal honesty: "Só EU posso fazer?"
- **Prevention:** Limit zone 0.8% to max 3-5 items

### Under-Elimination of Waste
- **Trigger:** Fear of missing out, sunk cost
- **Manifestation:** Zone 80% has < 50% of items
- **Detection:** Still feeling overwhelmed after classification
- **Recovery:** Ask "Se eu PARASSE isso hoje, o que aconteceria em 30 dias?"
- **Prevention:** Default assumption: item is 80% until proven otherwise

---

**Pattern Compliance:** Prioritization Pattern
**Source:** AN Mind Artifacts - Pareto ao Cubo Framework
**Origin:** Extended Pareto Principle (80/20 → 96/4 → 99.2/0.8)
