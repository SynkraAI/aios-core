---
task:
  name: mine-patterns
  status: SPEC_DEFINED
  version: 1.0.0
  responsible_executor: memory-keeper
  execution_type: SUBTASK (called by reflect.md)
  trigger:
    parent: reflect.md
---

# mine-patterns

## Task Anatomy

### Input
- Daily YAML files (from `data/intelligence/daily/`)
- `rules/extraction-criteria.md` (5-point validation)
- Existing `data/intelligence/knowledge/patterns.yaml`

### Output
- List of pattern candidates (each with: name, heuristic, context, trigger, verification_count)
- Only patterns passing all 5 criteria are returned

### Acceptance Criteria
- [ ] All dailies scanned for learning candidates
- [ ] Each candidate validated against 5 extraction criteria
- [ ] Only verified patterns (≥2 sightings or sources) returned
- [ ] Patterns are non-obvious (not already documented)
- [ ] Patterns are reusable (applicable to >1 scenario)
- [ ] Patterns are actionable (have trigger + action)
- [ ] Patterns are empirical (based on observation)

### Dependencies
- `rules/extraction-criteria.md` readable
- Daily YAML files in `data/intelligence/daily/`
- Existing patterns.yaml for deduplication check

---

## Detailed Specification

### Extraction Criteria (from rules/extraction-criteria.md)

**All 5 must be met for a pattern to extract:**

1. **VERIFIED:** Pattern observed ≥2 times independently OR documented in trusted sources
   - Check: verification_count >= 2 OR source in docs/
   - Example: Bug appeared twice in git history → verified

2. **NON_OBVIOUS:** Pattern not already in docs/patterns/ OR contradicts existing belief
   - Check: grep patterns.yaml for pattern_name → if found, reinforce instead of extract
   - Example: New insight about Windows hooks = NON_OBVIOUS

3. **REUSABLE:** Applicable to >1 scenario in the project
   - Check: Can this pattern help with other tasks/agents?
   - Example: "Hooks timeout on Windows" → reusable across all Windows hooks

4. **ACTIONABLE:** Pattern includes trigger condition AND action (if X, then Y)
   - Check: suggested_trigger is not empty AND heuristic has "do this"
   - Example: "When implementing Windows hooks, use timer.unref() not process.exit()"

5. **EMPIRICAL:** Based on direct observation, not speculation
   - Check: Can trace learning to git commit, task, or documented decision
   - Reject: "I think X might be true" or "This seems like..."

### Rejection Rules

- **ONE-TIME observations:** Stay in daily YAML, don't extract
- **Speculation:** "Maybe X is true" → stays in daily only
- **Already-known patterns:** Don't duplicate; instead, reinforce existing pattern
- **Ambiguous triggers:** Require clarification → reject with comment

### Mining Pipeline

1. Read each daily YAML
2. Extract `learnings` array
3. For each learning:
   - Check if it already exists in patterns.yaml
   - If exists: Mark for reinforcement (reset days_since_observed)
   - If new: Validate against 5 criteria
   - If passes: Add to candidates list
   - If fails: Log rejection reason + move to daily archive
4. Return candidates list

### Candidate Object Format
```yaml
pattern_id: null  # Will be assigned by mine-patterns
name: "Pattern Name"
first_observed: "YYYY-MM-DD"
days_since_observed: 0
decay_score: 1.0  # Fresh
verified: true
verification_count: 2
heuristic: "The pattern (what to remember)"
context: "Where/when applies"
suggested_trigger: "When X, do Y"
archive_date: null
deleted_date: null
```

## Veto Conditions
- "Pattern extraído com verification_count < 2 e sem fonte documentada → REJEITAR (critério VERIFIED falhou)"
- "Pattern sem suggested_trigger (if X then Y) → REJEITAR (critério ACTIONABLE falhou)"
- "Pattern duplicado de entrada existente em patterns.yaml → REDIRECIONAR para reforço, não extrair novo"
- "Pattern baseado em especulação ('talvez', 'parece que') sem commit/task rastreável → REJEITAR (critério EMPIRICAL falhou)"
- "Mais de 5 patterns extraídos numa única reflexão → REVISAR priorização (extração em massa indica filtro frouxo)"

## Success Criteria
- PASS: ≥1 pattern extracted with all 5 criteria met
- PASS: 0 patterns extracted (valid if no learnings meet criteria)
- FAIL: Invalid YAML in dailies, extraction criteria not applied
- WARN: All candidates fail validation (possible signal: learnings are too generic)

## Error Handling
- If daily file invalid YAML: Skip + log + continue
- If extraction criteria file missing: Fallback to strict defaults (require all 5)
- If patterns.yaml corrupted: Work from scratch (all learnings are new candidates)
