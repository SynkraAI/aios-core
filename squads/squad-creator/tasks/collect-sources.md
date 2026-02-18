---
task-id: collect-sources
name: Collect & Validate Sources for Mind Cloning
version: 2.2.0
execution_type: Hybrid
note: "Exemplos usam copywriting. Substitua pelo seu domínio."
estimated-time: 30-60 min
complexity: medium

specialist: "@oalanicolas"
specialist_guidance: |
  Use DNA Mental™ source curation methodology:
  - Classify sources as OURO (gold) vs BRONZE quality
  - OURO: Direct from expert (books, interviews, courses) = Tier 0-1
  - BRONZE: About expert (summaries, articles) = Tier 2-3
  - Apply 40/20/40 rule: 40% curadoria, 20% prompt, 40% refinamento
  - For complex source assessment, invoke: @oalanicolas *assess-sources

inputs:
  required:
    - mind_name: "Nome do expert a clonar"
    - domain: "Área de expertise"
  optional:
    - user_materials_path: "Caminho para materiais do usuário (Tier 0)"

outputs:
  primary:
    - sources_inventory: "Lista validada de fontes com classificação"

elicit: true
---

# Collect & Validate Sources

> **Princípio Core:** "Single source = hypothesis; three sources = pattern"
>
> **Regra:** NUNCA prosseguir para extração sem validar fontes suficientes.

---

## FALLBACK CHAIN (Estratégia Automática)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SOURCE ACQUISITION STRATEGY                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STEP 1: USER MATERIALS                                                     │
│  ├── Usuário forneceu materiais?                                            │
│  │   ├── SIM → Indexar como Tier 0 (máxima confiança)                      │
│  │   │         Prosseguir para complementar com web                         │
│  │   └── NÃO → Ir para Step 2                                              │
│  │                                                                          │
│  STEP 2: AUTO-ACQUIRE (auto-acquire-sources.md)                             │
│  ├── Executar busca automática:                                             │
│  │   • YouTube transcripts                                                  │
│  │   • Book summaries                                                       │
│  │   • Podcast appearances                                                  │
│  │   • Articles/blogs                                                       │
│  ├── Resultado >= 10 fontes?                                                │
│  │   ├── SIM → Prosseguir para validação                                   │
│  │   └── NÃO → Ir para Step 3                                              │
│  │                                                                          │
│  STEP 3: MANUAL WEB SEARCH                                                  │
│  ├── Executar queries manuais (FASE 1 abaixo)                              │
│  ├── Resultado >= 10 fontes?                                                │
│  │   ├── SIM → Prosseguir para validação                                   │
│  │   └── NÃO → Ir para Step 4                                              │
│  │                                                                          │
│  STEP 4: FAIL - EXPERT MUITO OBSCURO                                        │
│  └── < 5 fontes encontradas                                                 │
│      ├── PARAR workflow                                                     │
│      ├── Avisar usuário: "Expert não tem material suficiente"               │
│      └── Sugerir: fornecer materiais próprios OU escolher outro expert     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```yaml
fallback_chain:
  step_1_user_materials:
    check: "user_materials_path provided?"
    if_yes:
      action: "Index as Tier 0"
      continue: true
    if_no:
      action: "Skip to step 2"

  step_2_auto_acquire:
    execute: "auto-acquire-sources.md"
    check: "total_sources >= 10?"
    if_yes:
      action: "Proceed to validation"
    if_no:
      action: "Continue to step 3"

  step_3_manual_search:
    execute: "FASE 1 queries below"
    check: "total_sources >= 10?"
    if_yes:
      action: "Proceed to validation"
    if_no:
      action: "Continue to step 4"

  step_4_fail:
    condition: "total_sources < 5"
    action: "STOP - Expert too obscure"
    message: |
      ❌ FONTES INSUFICIENTES

      Encontrei apenas {n} fontes para {mind_name}.
      Mínimo necessário: 10 fontes (5 Tier 1).

      Opções:
      1. Forneça materiais próprios (livros, PDFs, transcrições)
      2. Escolha um expert com mais documentação pública
      3. Prossiga com qualidade reduzida (não recomendado)
```

---

## FASE 1: DISCOVERY - PESQUISA DE FONTES (15 min)

### 1.1 Queries de Pesquisa

Execute TODAS estas buscas:

```
# Conteúdo Primário (do próprio expert)
"{nome}" books
"{nome}" interview transcript
"{nome}" podcast appearance
"{nome}" keynote speech
"{nome}" masterclass
"{nome}" framework methodology

# Conteúdo Secundário (sobre o expert)
"{nome}" biography
"{nome}" case study
"{nome}" best quotes
"{nome}" principles philosophy
```

### 1.2 Fontes por Tipo (Preencher)

```yaml
discovered_sources:
  books:
    - title: ""
      year: ""
      relevance: "alta|média"
      status: "disponível|indisponível"

  interviews_podcasts:
    - title: ""
      host: ""
      duration: ""
      url: ""

  articles_posts:
    - title: ""
      source: ""
      url: ""

  videos_talks:
    - title: ""
      event: ""
      duration: ""
      url: ""

  courses_workshops:
    - title: ""
      platform: ""
      url: ""
```

---

## FASE 2: CLASSIFICAÇÃO POR TIER (10 min)

### 2.1 Sistema de Tiers

| Tier | Tipo | Confiança | Exemplos |
|------|------|-----------|----------|
| **Tier 1** | Primário (do expert) | ALTA | Livros próprios, entrevistas diretas |
| **Tier 2** | Secundário (sobre expert) | MÉDIA | Biografias, case studies |
| **Tier 3** | Terciário (agregado) | BAIXA | Wikipedia, resumos |

### 2.2 Classificar Fontes Descobertas

```yaml
sources_by_tier:
  tier_1_primary:
    count: 0
    items:
      - source: ""
        type: ""
        estimated_content: "X horas / Y páginas"

  tier_2_secondary:
    count: 0
    items:
      - source: ""
        type: ""

  tier_3_tertiary:
    count: 0
    items:
      - source: ""
        type: ""
```

---

## FASE 3: VALIDAÇÃO DE COBERTURA (10 min)

### 3.1 Checklist de Mínimos (OBRIGATÓRIO)

```yaml
minimum_requirements:
  # Quantidade
  total_sources:
    required: 10
    actual: 0
    status: "✅|❌"

  tier_1_sources:
    required: 5
    actual: 0
    status: "✅|❌"

  # Diversidade de Tipos
  source_types:
    required: 3  # diferentes tipos
    actual: 0
    types_found: []
    status: "✅|❌"

  # Volume de Conteúdo
  content_volume:
    audio_video_hours:
      required: 5
      actual: 0
      status: "✅|❌"

    text_pages:
      required: 200
      actual: 0
      status: "✅|❌"

  # Cobertura Temporal
  temporal_coverage:
    periods_covered: []  # ex: "2010-2015", "2020-present"
    has_multiple_periods:
      required: true
      actual: false
      status: "✅|❌"
```

### 3.2 Validação de Triangulação

Para claims importantes, precisamos de 3+ fontes independentes.

```yaml
triangulation_check:
  main_framework:
    claim: "O framework principal do expert"
    sources_confirming: []
    count: 0
    status: "✅ (3+) | ⚠️ (2) | ❌ (1)"

  core_principles:
    claim: "Princípios fundamentais"
    sources_confirming: []
    count: 0
    status: ""

  signature_methodology:
    claim: "Metodologia distintiva"
    sources_confirming: []
    count: 0
    status: ""
```

---

## FASE 4: GAP ANALYSIS (5 min)

### 4.1 Identificar Lacunas

```yaml
gaps_identified:
  missing_types:
    - type: ""
      importance: "crítico|importante|desejável"
      action: ""

  temporal_gaps:
    - period: ""
      why_matters: ""
      action: ""

  depth_gaps:
    - area: ""
      current_coverage: ""
      needed: ""
```

### 4.2 Plano de Aquisição

```yaml
acquisition_plan:
  priority_1_critical:
    - source: ""
      how_to_get: ""
      estimated_time: ""

  priority_2_important:
    - source: ""
      how_to_get: ""

  priority_3_nice_to_have:
    - source: ""
```

---

## FASE 5: QUALITY GATE - GO/NO-GO (5 min)

### 5.1 Checklist Final

```yaml
go_no_go_checklist:
  # Quantidade (BLOCKING)
  - check: "10+ fontes totais"
    status: "✅|❌"
    blocking: true

  - check: "5+ fontes Tier 1 (primárias)"
    status: "✅|❌"
    blocking: true

  # Diversidade (BLOCKING)
  - check: "3+ tipos diferentes de fonte"
    status: "✅|❌"
    blocking: true

  # Volume (BLOCKING)
  - check: "5+ horas de áudio/vídeo OU 200+ páginas"
    status: "✅|❌"
    blocking: true

  # Triangulação (BLOCKING)
  - check: "Framework principal confirmado em 3+ fontes"
    status: "✅|❌"
    blocking: true

  # Temporal (WARNING)
  - check: "Cobertura de 2+ períodos temporais"
    status: "✅|⚠️"
    blocking: false
```

### 5.2 Decisão

```yaml
decision:
  blocking_checks_passed: 0/5

  status: "GO|CONDITIONAL|NO-GO"

  # GO: Todos blocking checks ✅
  # CONDITIONAL: 4/5 blocking, com plano para preencher
  # NO-GO: <4/5 blocking - precisa mais pesquisa

  conditions_if_conditional:
    - ""

  next_action: ""
```

---

## OUTPUT: SOURCES INVENTORY

```yaml
# ═══════════════════════════════════════════════════════════════
# SOURCES INVENTORY - {MIND_NAME}
# Domain: {DOMAIN}
# Collected: {DATE}
# ═══════════════════════════════════════════════════════════════

sources_inventory:
  metadata:
    mind_name: ""
    domain: ""
    collection_date: ""
    total_sources: 0
    tier_1_count: 0
    quality_status: "GO|CONDITIONAL|NO-GO"

  # ─────────────────────────────────────────────────────────────
  # FONTES POR TIER
  # ─────────────────────────────────────────────────────────────

  tier_1_primary:
    - id: "S01"
      title: ""
      type: "book|interview|article|video|course"
      year: ""
      url: ""
      estimated_volume: ""
      key_topics: []
      triangulates: ["framework", "principles", "methodology"]

  tier_2_secondary:
    - id: "S06"
      title: ""
      type: ""
      url: ""

  tier_3_tertiary:
    - id: "S10"
      title: ""
      type: ""
      url: ""

  # ─────────────────────────────────────────────────────────────
  # VALIDAÇÃO
  # ─────────────────────────────────────────────────────────────

  validation:
    total_sources: 0
    tier_1_count: 0
    type_diversity: 0
    content_volume:
      hours: 0
      pages: 0
    temporal_periods: []
    triangulation_score: "X/3 claims validated"

  # ─────────────────────────────────────────────────────────────
  # GAPS & RISKS
  # ─────────────────────────────────────────────────────────────

  gaps:
    - gap: ""
      risk: "alto|médio|baixo"
      mitigation: ""

  # ─────────────────────────────────────────────────────────────
  # DECISÃO
  # ─────────────────────────────────────────────────────────────

  decision:
    status: "GO|CONDITIONAL|NO-GO"
    blocking_passed: "X/5"
    ready_for_extraction: true|false
    conditions: []

# ═══════════════════════════════════════════════════════════════
```

---

## QUALITY CHECK

- [ ] 10+ fontes totais identificadas
- [ ] 5+ fontes Tier 1 (primárias)
- [ ] 3+ tipos diferentes de fonte
- [ ] 5+ horas OU 200+ páginas de conteúdo
- [ ] Framework principal triangulado (3+ fontes)
- [ ] Decisão GO ou CONDITIONAL com plano

**BLOCKING:** Se <4 checks passam → NO-GO, precisa mais pesquisa

---

## EXEMPLO: Dan Kennedy

```yaml
sources_inventory:
  metadata:
    mind_name: "Dan Kennedy"
    domain: "Direct Response Marketing"
    collection_date: "2024-01-15"
    total_sources: 14
    tier_1_count: 8
    quality_status: "GO"

  tier_1_primary:
    - id: "S01"
      title: "The Ultimate Sales Letter"
      type: "book"
      year: "2011"
      estimated_volume: "200 pages"
      key_topics: ["sales letters", "direct response", "copywriting"]
      triangulates: ["framework", "methodology"]

    - id: "S02"
      title: "No B.S. Direct Marketing"
      type: "book"
      year: "2013"
      estimated_volume: "250 pages"
      triangulates: ["framework", "principles"]

    - id: "S03"
      title: "Interview with Dan Kennedy - Marketing Secrets"
      type: "interview"
      year: "2020"
      url: "..."
      estimated_volume: "2 hours"
      triangulates: ["principles", "methodology"]

  validation:
    total_sources: 14
    tier_1_count: 8
    type_diversity: 4  # books, interviews, articles, courses
    content_volume:
      hours: 12
      pages: 800
    temporal_periods: ["1990s", "2000s", "2010s", "2020s"]
    triangulation_score: "3/3 claims validated"

  decision:
    status: "GO"
    blocking_passed: "5/5"
    ready_for_extraction: true
```

---

**Squad Architect | Source Collector v2.0**
*"Three sources make a pattern. One source is just a guess."*
