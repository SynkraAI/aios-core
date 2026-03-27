---
task:
  name: capture-daily
  status: SPEC_DEFINED
  version: 1.0.0
  responsible_executor: memory-keeper
  execution_type: TRIGGERED (Stop hook) | MANUAL (*capture)
  trigger:
    automated: "Stop hook fires when session ends"
    manual: "*capture command"
---

# capture-daily

## Task Anatomy

### Input
- Git log from today (`git log --since=today`)
- Session context (providers, decisions made)
- User prompt in this session (for learning extraction)

### Output
- `data/intelligence/daily/YYYY-MM-DD.yaml`
- Follows `templates/daily-digest-tmpl.yaml` schema

### Acceptance Criteria
- [ ] Daily YAML created with all mandatory fields (date, session_count, providers_active, activity_summary, highlights, decisions, learnings)
- [ ] Git facts verified (commits match `git log --since=today`)
- [ ] Learnings are specific, actionable, verified in context
- [ ] File size < 3KB (compact)
- [ ] Valid YAML syntax
- [ ] Passes `checklists/daily-capture-checklist.md`

### Dependencies
- `git log` command available
- `data/intelligence/daily/` directory exists
- `templates/daily-digest-tmpl.yaml` accessible

### Quality Gates
- Checklist: 7-point daily capture validation
- Max file size: 3KB
- Mandatory fields present: ✓

---

## Detailed Specification

### Trigger: Stop Hook
- Event: Session exit (`SIGNAL.SIGTERM`, `SIGNAL.EXIT`)
- Timeout: 3 seconds (fail-silent if exceeds)
- Async: Yes (non-blocking to session exit)

### Manual Trigger: *capture Command
- Command: `/kaizen-v2:*capture`
- Executes: capture-daily task immediately
- Fallback if Stop hook failed

### Daily YAML Schema
```yaml
date: YYYY-MM-DD
session_count: <N>
providers_active:
  - claude-haiku-4-5
  - context7  # etc
activity_summary: "<text>"
highlights:
  - "<specific finding>"
decisions:
  - "<decision made>"
stories_touched:
  - "<story ID>"
learnings:
  - "<verified insight>"
agents_involved:
  - "<agent name>"
```

### Mandatory Fields
1. `date` — YYYY-MM-DD of capture
2. `session_count` — How many sessions today
3. `providers_active` — List of providers used
4. `activity_summary` — 1-2 sentence summary of the day
5. `learnings` — Array of specific learnings (must be non-empty to extract patterns)

### Optional Fields
- `highlights` — Unusual findings
- `decisions` — Key decisions made
- `stories_touched` — Story IDs worked on
- `agents_involved` — Agents that ran

---

## Workflow Context
- Part of `workflows/wf-daily-capture.yaml`
- Executes before `workflows/wf-overnight-reflect.yaml`
- Data persists to `data/intelligence/daily/`

## Veto Conditions
- "Learning registrado sem evidência rastreável (commit, decisão ou observação direta) → REMOVER do daily"
- "Daily com >3KB indica over-capture → PODAR highlights e manter apenas learnings verificados"
- "Campo learnings vazio quando sessão teve decisões ou insights → BLOQUEAR (captura incompleta)"
- "Providers_active listando modelos não utilizados na sessão → CORRIGIR antes de salvar"

## Success Criteria
- PASS: Daily YAML created with valid schema, all learnings captured
- FAIL: File missing, invalid YAML, mandatory fields empty
- WARN: File size > 3KB (indicates over-capture)

## Error Handling
- If git log fails: Use session context from prompt instead
- If directory missing: Create `data/intelligence/daily/`
- If Stop hook times out: Manual *capture runs as fallback
