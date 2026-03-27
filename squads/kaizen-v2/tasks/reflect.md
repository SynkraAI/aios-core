---
task:
  name: reflect
  status: SPEC_DEFINED
  version: 1.0.0
  responsible_executor: memory-keeper
  execution_type: SCHEDULED (overnight) | MANUAL (*reflect)
  trigger:
    scheduled: "Cron: 2am daily (configurable in config/config.yaml)"
    manual: "*reflect command"
---

# reflect

## Task Anatomy

### Input
- Last 7 `data/intelligence/daily/YYYY-MM-DD.yaml` files
- Current `data/intelligence/knowledge/patterns.yaml`
- `rules/forgetting-curve.md`, `rules/extraction-criteria.md`

### Output
- Updated `data/intelligence/knowledge/patterns.yaml` (with new patterns + decay recalculation)
- `data/intelligence/reflections/YYYY-MM-DD-reflection.md`
- Passes `checklists/reflection-quality-checklist.md`

### Acceptance Criteria
- [ ] All 7 daily YAMLs analyzed for patterns
- [ ] New patterns extracted (verified ≥2 sightings, meet 5 criteria)
- [ ] Decay scores recalculated per forgetting curve formula
- [ ] patterns.yaml updated with metadata (total_patterns, updated timestamp)
- [ ] Reflection markdown generated with all sections populated
- [ ] Patterns with decay < 0.1 flagged for archive (next compact-archive run)
- [ ] Passes reflection quality checklist

### Dependencies
- `data/intelligence/daily/` has >= 1 file
- `rules/forgetting-curve.md` accessible
- `rules/extraction-criteria.md` accessible
- `templates/reflection-tmpl.md` accessible

### Quality Gates
- Checklist: reflection quality validation
- All extracted patterns have decay_score calculated
- All patterns have verification_count >= 1

---

## Detailed Specification

### Reflection Pipeline
1. **Load Daily Files** — Read last 7 dailies (or all available if < 7)
2. **Mine Patterns** — Extract candidates (via `mine-patterns` subtask)
3. **Apply Decay** — Recalculate decay_score on existing patterns
4. **Validate Extraction** — Check 5 criteria before adding new pattern
5. **Update patterns.yaml** — Merge new/updated patterns
6. **Generate Reflection** — Write markdown report
7. **Flag Archive** — Mark patterns < 0.1 for next compact-archive

### Reflection Output Format
See `templates/reflection-tmpl.md`:
```markdown
# Reflection — YYYY-MM-DD

## Period Analyzed
- Daily files reviewed: N
- Date range: YYYY-MM-DD to YYYY-MM-DD

## Patterns Extracted
### New Patterns (this period)
- Pattern 1: name + decay_score + heuristic
- Pattern 2: ...

### Patterns Reinforced
- Pattern ID: last_reinforced date updated

### Patterns Archived
- Pattern ID: decay_score < 0.1, moved to archive/

### Patterns Deleted
- Pattern ID: decay_score < 0.05, removed

## Decay Recalculation
- Total patterns processed: N
- Patterns decayed: N
- Archive candidates (< 0.1): N

## Next Actions
- Suggested patterns to test
- Patterns nearing archive
```

### Decay Formula (per forgetting-curve.md)
```
decay_score(t) = e^(-rate × days_since_observed)

rate = 0.05 (general patterns)
rate = 0.025 (verified patterns)

Archive if < 0.1
Delete if < 0.05
```

## Veto Conditions
- "Reflection executada com <1 daily file disponível → ABORTAR (sem dados para refletir)"
- "Decay recalculado sem aplicar fórmula de forgetting-curve.md → BLOQUEAR (decay arbitrário invalida todo o sistema)"
- "Pattern novo adicionado sem passar pelos 5 critérios de extraction-criteria.md → REMOVER do patterns.yaml"
- "Reflection sem seção 'Patterns Archived' quando existem patterns com decay < 0.1 → REDO (omissão de limpeza)"

## Success Criteria
- PASS: New patterns extracted, decay recalculated, reflection written
- FAIL: No daily files found, invalid YAML in dailies, decay calculation error
- WARN: No new patterns extracted this period (signal check — valid if learnings are reinforcing existing)

## Error Handling
- If daily files < 1: Skip (log: "No daily files to reflect on")
- If patterns.yaml corrupted: Restore from last backup + flag for manual review
- If decay calc fails: Use default formula fallback
