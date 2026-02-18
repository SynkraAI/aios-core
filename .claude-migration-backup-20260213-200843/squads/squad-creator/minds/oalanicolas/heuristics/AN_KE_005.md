# AN_KE_005 - Determinism First

**Type:** Method Selection Heuristic
**Phase:** Any (Implementation)
**Agent:** @oalanicolas
**Pattern:** Code > LLM
**Source:** CLAUDE.md - "Determinism First"

## Purpose

Priorizar soluções determinísticas sobre soluções baseadas em LLM. LLM só quando criatividade é genuinamente necessária.

## Core Principle

> "Script/código determinístico ← SEMPRE preferir"
> "LLM como último recurso ← Só quando criatividade é necessária"
> — CLAUDE.md Methodology

## Prioritization Ladder

```yaml
priority_order:
  1:
    name: "Script/código determinístico"
    when: "Lógica pode ser codificada"
    cost: "$0, 100% reproduzível"
    example: "Regex, loops, conditionals"

  2:
    name: "Query SQL direta"
    when: "Dados estruturados"
    cost: "$0, auditável"
    example: "SELECT, JOIN, aggregations"

  3:
    name: "Regex/pattern matching"
    when: "Texto com padrão previsível"
    cost: "$0, reproduzível"
    example: "Extract IDs, validate formats"

  4:
    name: "LLM"
    when: "Criatividade genuinamente necessária"
    cost: "$$, não-determinístico"
    example: "Generate copy, summarize, creative writing"
```

## Configuration

```yaml
AN_KE_005:
  name: "Determinism First"
  phase: "any"
  agent: "@oalanicolas"

  decision_tree:
    - question: "Pode ser codificado com lógica simples?"
      if_yes: "Use código determinístico"
      if_no: "Continue"

    - question: "Dados estão em banco estruturado?"
      if_yes: "Use SQL query"
      if_no: "Continue"

    - question: "Texto tem padrão previsível?"
      if_yes: "Use regex/pattern matching"
      if_no: "Continue"

    - question: "Requer criatividade ou julgamento subjetivo?"
      if_yes: "Use LLM (justified)"
      if_no: "Reavaliar - provavelmente não precisa de LLM"

  veto_conditions:
    - condition: "llm_when_code_suffices"
      action: "VETO - Use deterministic solution"
      maps_to: "AN_VC_007"

  cost_comparison:
    deterministic:
      token_cost: 0
      reproducibility: 100%
      auditability: "Full"
    llm:
      token_cost: "500-5000 per call"
      reproducibility: "~70-90%"
      auditability: "Limited"
```

## Decision Matrix

| Task Type | Deterministic? | Recommended Approach |
|-----------|----------------|---------------------|
| Extract ID from text | Yes | Regex |
| Validate email format | Yes | Regex |
| Sum/aggregate data | Yes | SQL |
| Filter by criteria | Yes | SQL/code |
| Generate creative copy | No | LLM |
| Summarize long text | No | LLM |
| Answer open question | No | LLM |
| Transform data format | Yes | Code |

## ETL First Sub-Pattern

```yaml
etl_first:
  principle: "NEVER use WebFetch when ETL fetch-page.js can do the job"

  comparison:
    etl_fetch:
      command: "node infrastructure/services/etl/bin/fetch-page.js <url>"
      cost: "$0"
      output: "Clean markdown"
    web_fetch:
      cost: "~500-2K tokens/page"
      when: "ONLY when LLM reasoning needed IN the fetch step"

  flow: "WebSearch (find URLs) → fetch-page.js (get content) → LLM (only if needed)"
```

## Validation Questions

1. "Pode ser feito com código simples?"
2. "Pode ser uma query SQL?"
3. "Pode ser um regex?"
4. "Criatividade é GENUINAMENTE necessária?"
5. "Justifiquei o uso de LLM?"

## Anti-Patterns

```yaml
anti_patterns:
  - name: "LLM for Everything"
    symptom: "Usar LLM pra tarefas que código resolve"
    cost: "Tokens desperdiçados, resultados inconsistentes"
    fix: "Perguntar 'Pode ser código?' primeiro"

  - name: "WebFetch for Reading"
    symptom: "Usar WebFetch só pra ler página"
    cost: "500-2K tokens por página"
    fix: "Usar fetch-page.js via Bash"

  - name: "Prompt Engineering over Code"
    symptom: "Prompt elaborado pra tarefa determinística"
    cost: "Fragilidade, não-reprodutibilidade"
    fix: "Código > prompt sempre que possível"
```

## Performance Metrics

```yaml
performance:
  token_savings: "60-80% when following ladder"
  reproducibility_improvement: "70% → 100% for deterministic"
  debugging_time_reduction: "~50% (deterministic is traceable)"
```

---

**Pattern Compliance:** Code > LLM
**Veto Mapping:** AN_VC_007 (LLM When Code Suffices)
**Integration:** All implementation phases
