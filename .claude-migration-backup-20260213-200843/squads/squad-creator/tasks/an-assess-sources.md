# Task: Assess Sources

**Command:** `*assess-sources`
**Version:** 2.2.2 (Script-First + Binary Checkpoints + Scope + No Override + Evolucao Clarified)
**Execution Type:** Hybrid (Worker script 80% + Agent interpretation 20%)
**Worker Script:** `scripts/assess-sources.sh`
**Model:** `Haiku` (QUALIFIED — script handles all 25 checkpoints, LLM only for recommendations)
**Haiku Eligible:** YES — script scores 5 dimensions × 5 checks deterministically
**Load:** `data/an-source-tiers.yaml`

## Purpose

Avaliar e classificar todas as fontes disponíveis para um projeto de clone, gerando um source map priorizado.

---

## MANDATORY PREFLIGHT: Run Worker Script FIRST

```
EXECUTE FIRST — when sources directory exists with downloaded files:

  bash squads/squad-creator/scripts/assess-sources.sh <sources-dir> > /tmp/preflight-assess-sources.yaml

IF the command fails → FIX the script error. Do NOT proceed manually.
IF the command succeeds → READ /tmp/preflight-assess-sources.yaml. Use as baseline scores.

VETO: If sources are already downloaded as files, do NOT grep checkpoints yourself.
      The script scores all 25 checkpoints per source in <1s each.

      Your job is INTERPRETATION ONLY:
      - Add context the script cannot detect (e.g., source type, duration, URL)
      - Override scores where domain knowledge matters (e.g., D3 Atualidade for books)
      - Generate recommendations and gap analysis

NOTE: Script works on FILE content (grep patterns). For sources not yet downloaded
      or for evaluating metadata (URL, duration, type), use manual assessment.
```

---

## SCOPE DEFINITION (CRITICAL)

```yaml
source_granularity:
  principle: "Uma FONTE = uma UNIDADE COMPLETA de conteúdo"

  # O que conta como UMA fonte (avaliar como unidade única)
  one_source_equals:
    livro: "O LIVRO INTEIRO (não capítulos separados)"
    video: "O VÍDEO INTEIRO (não segmentos)"
    podcast: "O EPISÓDIO INTEIRO (não trechos)"
    entrevista: "A ENTREVISTA INTEIRA (não perguntas)"
    curso: "O CURSO INTEIRO (não módulos)"
    post: "O POST INTEIRO (cada post = 1 fonte)"
    thread: "A THREAD INTEIRA (não tweets individuais)"

  # ANTI-PATTERNS - NUNCA FAÇA ISSO
  never_do:
    - "NÃO divida livros em capítulos separados"
    - "NÃO divida vídeos em segmentos"
    - "NÃO trate seções de livro como fontes diferentes"
    - "NÃO avalie partes de um todo separadamente"

  # EXEMPLOS CORRETOS vs INCORRETOS
  examples:
    correto:
      - "Livro '$100M Offers' → 1 fonte (avaliar livro inteiro)"
      - "Entrevista Tom Bilyeu → 1 fonte (avaliar entrevista inteira)"
      - "Podcast Episode #47 → 1 fonte"

    incorreto:
      - "Capítulo 6 de Offers → NÃO (é parte de um livro)"
      - "Seções I-II de Leads → NÃO (é parte de um livro)"
      - "Minutos 0-30 do vídeo → NÃO (é parte de um vídeo)"

  rationale: |
    O usuário BAIXA e PROCESSA fontes no nível de SOURCE (livro, vídeo, episódio).
    A prioridade de extração é por SOURCE, não por capítulo.
    Se um LIVRO é Crown Jewel, todo o livro tem prioridade - não apenas 1 capítulo.
```

---

## SCORING CALIBRATION (CRITICAL)

```yaml
scoring_philosophy:
  principle: "SCORE O QUE EXISTE, não o que falta"
  bias_correction: "Haiku tende a sub-pontuar. Compensar sendo generoso."
  evidence_rule: "Se existe evidência, conta ponto. Gaps vão para recommendations."

  checkpoint_rules:
    - "PASS = evidence EXISTS (not perfect)"
    - "FAIL = evidence MISSING (not weak)"
    - "Partial = PASS (generous interpretation)"
    - "Dúvida = PASS (benefit of the doubt)"

  classification_thresholds:
    ouro: "média >= 4.0 (20+ checkpoints de 25)"
    mixed: "média 3.0-3.9 (15-19 checkpoints de 25)"
    bronze: "média < 3.0 (<15 checkpoints de 25)"
```

---

## Workflow

### Step 1: Collect Sources

Perguntar ao usuário:
- "Liste TODOS os materiais que você tem dessa pessoa"
- Tipos: vídeos, podcasts, livros, posts, stories, comentários, entrevistas, cursos

**IMPORTANTE:** Cada item listado = 1 FONTE COMPLETA (ver SCOPE DEFINITION acima).
- Se usuário lista "Livro $100M Offers" → avaliar o LIVRO INTEIRO como 1 fonte
- Se usuário lista "3 livros" → 3 fontes (cada livro = 1 fonte)
- NUNCA dividir um livro em capítulos ou um vídeo em segmentos

### Step 2: Classify Each Source (5 Dimensions × 5 Binary Checkpoints)

Para cada fonte, avaliar usando **25 checkpoints binários** (5 por dimensão):

---

#### Dimensão 1: AUTENTICIDADE (5 checkpoints)

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Espontaneidade | Tom de voz, padrão de fala | Não parece scripted/teleprompter |
| 2 | Vulnerabilidade | Admite erros, dúvidas | Mostra pelo menos 1 momento de vulnerabilidade |
| 3 | Respostas difíceis | Responde perguntas incômodas | Não desvia de perguntas challenging |
| 4 | Nuance presente | Muda de ideia, nuances | Mostra evolução ou nuance, não binário |
| 5 | Storytelling pessoal | Histórias próprias | Conta experiências de primeira mão |

**Score Autenticidade = count(passed) → 0-5**

---

#### Dimensão 2: PROFUNDIDADE (5 checkpoints)

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Porquê explicado | Raciocínio por trás | Explica motivação, não só ação |
| 2 | Framework presente | Metodologia/modelo | Tem estrutura repetível SE/ENTÃO |
| 3 | Exemplos específicos | Cases com detalhes | Cita nomes, números, datas específicos |
| 4 | Trade-offs discutidos | Prós e contras | Mostra decisões e o que sacrificou |
| 5 | Conexões cross-domain | Liga ideias | Conecta conceitos de áreas diferentes |

**Score Profundidade = count(passed) → 0-5**

---

#### Dimensão 3: ATUALIDADE (5 checkpoints)

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Recência | Data de publicação | Criado nos últimos 3 anos (2023+) |
| 2 | Contexto atual | Referências temporais | Menciona contexto relevante atual |
| 3 | Não contradito | Posições posteriores | Não contradiz declarações mais recentes da pessoa |
| 4 | Evolução visível | Mudança de pensamento | Mostra amadurecimento vs OBRA ANTERIOR do autor |
| 5 | Aplicabilidade | Relevância hoje | Conselho ainda funciona em 2026 |

**Score Atualidade = count(passed) → 0-5**

**REGRA ESPECIAL - Checkpoint "Evolução":**
```yaml
evolucao_rule:
  definition: "Compara com OBRA ANTERIOR do mesmo autor, não evolução interna do texto"
  first_work_rule: "SE é a primeira obra conhecida do autor → evolucao = FALSE (sem baseline)"
  examples:
    - "$100M Offers (primeiro livro Hormozi) → evolucao = FALSE"
    - "$100M Leads (segundo livro) → evolucao = TRUE se mostra mudança vs Offers"
    - "Entrevista 2024 → evolucao = TRUE se referencia posições anteriores"
  rationale: |
    Evolução requer COMPARAÇÃO. Sem obra anterior publicada, não há baseline.
    Isso é MECÂNICO, não interpretativo: primeira obra = always FALSE.
```

---

#### Dimensão 4: UNICIDADE (5 checkpoints)

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Contra-mainstream | Posição diferente | Contradiz "senso comum" do mercado |
| 2 | Vocabulário próprio | Termos únicos | Usa palavras/expressões signature |
| 3 | Framework original | Modelo não-copiado | Metodologia não encontrada em outros |
| 4 | Insight contra-intuitivo | Surpresa fundamentada | Conclusão inesperada com lógica sólida |
| 5 | Perspectiva singular | Ângulo único | Abordagem que outros autores não têm |

**Score Unicidade = count(passed) → 0-5**

---

#### Dimensão 5: COMPLETUDE (5 checkpoints)

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Playbook presente | Passo a passo | Tem instruções acionáveis (faça X, depois Y) |
| 2 | Framework presente | SE/ENTÃO | Tem regras condicionais documentadas |
| 3 | Exemplos reais | Cases | Tem pelo menos 2 exemplos concretos |
| 4 | Edge cases | Exceções | Discute quando NÃO funciona |
| 5 | Profundidade adequada | Duração/extensão | >30min vídeo OU >10 páginas texto |

**Score Completude = count(passed) → 0-5**

---

### Step 2b: Calculate Tier

```yaml
tier_calculation:
  formula: "média = (A + P + At + U + C) / 5"

  thresholds:
    ouro:
      range: ">= 4.0"
      meaning: "Fonte premium - prioridade máxima de extração"
      checkpoints_passed: "20+ de 25"

    mixed:
      range: "3.0 - 3.9"
      meaning: "Usar com cautela - complementar, não base"
      checkpoints_passed: "15-19 de 25"

    bronze:
      range: "< 3.0"
      meaning: "Descartar como base - baixo ROI"
      checkpoints_passed: "<15 de 25"

  special_rules:
    - "SE Autenticidade < 3 → BRONZE (independente do resto)"
    - "SE Profundidade = 5 AND Autenticidade >= 4 → CROWN JEWEL"
    - "SE todas dimensões >= 4 → CROWN JEWEL"

  # ANTI-OVERRIDE RULE (CRITICAL FOR HAIKU)
  no_subjective_override:
    principle: "Tier classification é MECÂNICA, não subjetiva"
    rule: |
      SE special_rules são satisfeitas → APLICAR tier automaticamente
      NUNCA fazer override com julgamentos como:
        - "é livro 3 de 3, menos original"
        - "é síntese, não criação"
        - "parece menos importante"

    examples:
      correto:
        - "Score 5/5/5/5/5 → CROWN JEWEL (todas dimensões >= 4)"
        - "Score 5/5/4/4/4 → CROWN JEWEL (Profundidade=5 AND Autenticidade>=4)"
      incorreto:
        - "Score 5/5/5/5/5 → OURO porque 'é livro 3'" # PROIBIDO
        - "Score 5/5/5/5/5 → OURO porque 'é síntese'" # PROIBIDO

    enforcement: |
      APÓS calcular scores, APLICAR special_rules mecanicamente.
      Tier é DETERMINADO pelos números, não por interpretação.
      Notas subjetivas vão em "notes:", não afetam tier.
```

---

### Step 3: Prioritize Sources

Ordenar fontes OURO por valor de extração:

```yaml
extraction_priority:
  crown_jewel:
    description: "0.8% - gera 51% do resultado"
    types:
      - "Entrevistas longas (>1h) com perguntas difíceis"
      - "Podcasts em formato conversacional profundo"
      - "Debates/discussões com challengers"

  ouro:
    description: "4% - gera 33% do resultado"
    types:
      - "Comentários respondendo perguntas reais de audiência"
      - "Cases detalhados com análise de decisões"
      - "Livros com metodologia própria"

  impacto:
    description: "20% - gera 16% do resultado"
    types:
      - "Stories espontâneos"
      - "Posts com insights específicos"
      - "Cursos (seções de Q&A)"

  bronze:
    description: "80% - ELIMINAR"
    types:
      - "Conteúdo scripted/promocional"
      - "Reposts/compilações de outros"
      - "Material datado sem insights únicos"
```

---

### Step 4: Generate Source Map

```yaml
source_assessment:
  mind: "{nome}"
  version: "2.0"
  assessment_date: "{ISO date}"

  summary:
    total_sources: {n}
    crown_jewel: {n}
    ouro: {n}
    mixed: {n}
    bronze: {n}
    average_quality: {média das médias}

  sources:
    - name: "{fonte}"
      type: "{vídeo|podcast|livro|post|curso|entrevista}"
      url: "{link se disponível}"
      duration: "{duração/páginas}"

      checkpoints:
        autenticidade:
          espontaneidade: true|false
          vulnerabilidade: true|false
          respostas_dificeis: true|false
          nuance: true|false
          storytelling: true|false
          score: {0-5}

        profundidade:
          porque_explicado: true|false
          framework: true|false
          exemplos_especificos: true|false
          tradeoffs: true|false
          cross_domain: true|false
          score: {0-5}

        atualidade:
          recencia: true|false
          contexto_atual: true|false
          nao_contradito: true|false
          evolucao: true|false
          aplicabilidade: true|false
          score: {0-5}

        unicidade:
          contra_mainstream: true|false
          vocabulario_proprio: true|false
          framework_original: true|false
          insight_contraintuitivo: true|false
          perspectiva_singular: true|false
          score: {0-5}

        completude:
          playbook: true|false
          framework_presente: true|false
          exemplos_reais: true|false
          edge_cases: true|false
          profundidade_adequada: true|false
          score: {0-5}

      media: {A+P+At+U+C / 5}
      tier: "crown_jewel|ouro|mixed|bronze"
      extraction_priority: {1-n}
      notes: "{observações específicas}"

  recommendations:
    - action: "{ação recomendada}"
      priority: "urgente|alta|média"
      rationale: "{por quê}"

  gaps_identified:
    - "{dimensão/aspecto que falta cobertura}"
```

---

## Completion Criteria

- [ ] Todas as fontes listadas
- [ ] Cada fonte avaliada com 25 checkpoints binários
- [ ] Tier calculado por média das 5 dimensões
- [ ] Crown Jewel identificado (se houver)
- [ ] Prioridade de extração definida
- [ ] Source map YAML gerado com checkpoints detalhados
- [ ] Gaps identificados para busca de fontes adicionais

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.2.2 | 2026-02-11 | EVOLUCAO_RULE clarified - primeira obra = always FALSE (sem baseline para comparar) |
| 2.2.1 | 2026-02-11 | NO_SUBJECTIVE_OVERRIDE rule - tier classification é mecânica, não interpretativa |
| 2.2.0 | 2026-02-11 | Script-First: added scripts/assess-sources.sh as Worker, EXECUTE FIRST block |
| 2.1.0 | 2026-02-11 | SCOPE DEFINITION added - explicit granularity rules (1 book = 1 source) |
| 2.0.0 | 2026-02-11 | Binary Checkpoint Conversion - 5 dimensões × 5 checkpoints binários |
| 1.0.0 | 2026-01-XX | Initial version com scoring subjetivo 1-5 |
