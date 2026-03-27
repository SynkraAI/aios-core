---
task:
  name: build-report
  status: SPEC_DEFINED
  version: 1.0.0
  responsible_executor: kaizen-chief
  execution_type: MANUAL (*report weekly|monthly|yearly)
---

# build-report

## Task Anatomy

### Input
- `data/intelligence/daily/` (aggregated by period: week/month/year)
- `data/intelligence/knowledge/patterns.yaml` (top patterns by decay_score)
- `templates/weekly-report-tmpl.md` or `monthly-report-tmpl.md`
- v1 analysis data (optional, from `wf-weekly-report.yaml`)

### Output
- `data/reports/report-YYYY-WXX.md` (weekly)
- `data/reports/report-YYYY-MM.md` (monthly)
- `data/reports/report-YYYY.md` (yearly)

### Acceptance Criteria
- [ ] All daily YAMLs in period aggregated
- [ ] Report includes 6 v1 dimensions (topology, performance, bottleneck, capability, tools, cost)
- [ ] **NEW:** Learnings section includes top patterns by decay_score
- [ ] Patterns referenced have verification status + decay_score + suggested_trigger
- [ ] Max 5 prioritized recommendations (v1 standard)
- [ ] Report follows template format
- [ ] File saved to `data/reports/`
- [ ] Passes report quality checklist

### Dependencies
- `data/intelligence/daily/` populated for period
- `data/intelligence/knowledge/patterns.yaml` readable
- Report templates accessible
- v1 analysis workflow (optional)

---

## Detailed Specification

### Report Types

**Weekly Report** (`report-YYYY-WXX.md`)
- Aggregates 7 days of dailies
- Includes top 3 patterns reinforced this week
- 6 v1 dimensions summary
- Max 5 recommendations

**Monthly Report** (`report-YYYY-MM.md`)
- Aggregates 4-5 weeks of dailies
- Includes top 5 patterns this month
- Trend analysis (week-over-week)
- Patterns nearing archive (warning section)

**Yearly Report** (`report-YYYY.md`)
- Aggregates 12 months
- Top 10 patterns learned this year
- Quarterly trends
- Archive summary (patterns deleted)

### Learnings Section Format
```markdown
## Learnings This Period

### Top Patterns (by decay_score)
- **Pattern Name** (verified: yes/no, decay: 0.85)
  - Heuristic: "..."
  - Suggested Trigger: "When X, do Y"
  - Source: "First observed YYYY-MM-DD, reinforced N times"

### Patterns Reinforced This Week
- Pattern ID: last_reinforced updated to today

### Patterns Archiving Soon
- Pattern ID: decay_score 0.15 (archive in 3 days unless reinforced)
```

### Integration with v1
- If v1 analysis enabled: Merge v1 sections (topology, performance, etc.)
- Pattern insights augment v1 cost/bottleneck findings
- v1 recommendations validated against patterns (consistency check)

### Quality Validation
- Each pattern referenced has verification status
- Decay scores calculated correctly (trust patterns.yaml metadata)
- No duplicate patterns in report
- Recommendations actionable (traceable to patterns or v1 findings)

## Veto Conditions
- "Relatório sem seção Learnings quando patterns.yaml tem patterns ativos (decay ≥ 0.3) → REDO (omissão de inteligência)"
- "Padrão referenciado no relatório sem decay_score e verification status → BLOQUEAR publicação"
- "Mais de 5 recomendações no relatório → CORTAR pelo composite score mais baixo (padrão v1)"
- "Relatório mensal/anual gerado com <3 dailies no período → MARCAR como 'dados esparsos' no header"

## Success Criteria
- PASS: Report generated with all sections, patterns + decay_scores included
- FAIL: Missing daily files, invalid patterns.yaml, template not found
- WARN: Period has <3 dailies (sparse data), no patterns extracted (normal if learnings are routine)

## Error Handling
- If v1 analysis fails: Continue with v2-only report (learnings section only)
- If patterns.yaml missing: Generate report without learnings section (warning in header)
- If template not found: Use minimal markdown structure (headers only)
