# Task: Modernization Score (*modernization-score)

> Pedro Valério | Loaded on-demand when `*modernization-score {workflow}` is invoked

**Execution Type:** Worker (Script-Only)
**Worker Script:** `scripts/modernization-score.sh`
**Model:** `Haiku` (QUALIFIED — 100% deterministic via script)
**Haiku Eligible:** YES — script handles all 12 checks, LLM only formats summary

## Purpose

Aplicar 12-point checklist para avaliar se workflow segue padrões modernos AIOS

---

## MANDATORY PREFLIGHT: Run Worker Script FIRST

```
EXECUTE FIRST — before ANY manual checking:

  bash squads/squad-creator/scripts/modernization-score.sh <workflow-path>

IF the command fails → FIX the script error. Do NOT proceed manually.
IF the command succeeds → Use ONLY these results.

VETO: Do NOT grep patterns yourself. The script checks all 12 patterns in <1s.
      Your job is SUMMARY ONLY — add context about which patterns matter most.
```

---

## Pre-requisite

Load `squads/squad-creator/data/pv-workflow-validation.yaml` for the complete 12-point checklist.

## Input

- Workflow file path (SKILL.md or workflow YAML)

## Steps

### 1. Execute Script

```bash
bash squads/squad-creator/scripts/modernization-score.sh <workflow-path> > /tmp/preflight-modernization-score.yaml
```

### 2. Read Script Output

Read `/tmp/preflight-modernization-score.yaml` and use as the authoritative score.

### 3. Check Each Pattern (REFERENCE ONLY)

| # | Pattern | Check For | Legacy If |
|---|---------|-----------|-----------|
| 1 | Teams Architecture | TeamCreate, TaskCreate | YAML declarativo |
| 2 | SKILL.md Frontmatter | name: + description: | Sem frontmatter |
| 3 | Blocking Execution | Task sem background | Sleep loops |
| 4 | Parallel Execution | Task COM background | Sem paralelismo |
| 5 | Context Preamble | git status, gotchas | Sem context |
| 6 | File-Based Comm | outputs/{slug}/ | Inline outputs |
| 7 | Agent File Refs | Read agent file | Hardcoded personas |
| 8 | Task Dependencies | blockedBy | depends_on |
| 9 | bypassPermissions | mode explícito | Default |
| 10 | Proper Finalization | shutdown + TeamDelete | Sem cleanup |
| 11 | Anti-Pattern Docs | NEVER DO THIS | Sem docs |
| 12 | Artifact Directory | outputs/ estruturado | Arbitrário |

### 4. Generate Score Report

```yaml
modernization_score:
  workflow: "{name}"
  file: "{path}"
  date: "{date}"
  score: "X/12"
  interpretation: "{from scoring table}"

  patterns:
    - id: 1
      name: "Teams Architecture"
      status: "✅ | ❌"
      evidence: "{where found or missing}"
    # ... repeat for all 12

  recommendations:
    - priority: "high | medium | low"
      pattern: "{missing pattern}"
      action: "{what to implement}"
      effort: "{estimated effort}"
```

### Scoring Interpretation

| Score | Interpretation | Action |
|-------|---------------|--------|
| 12/12 | Totalmente moderno | Pronto para produção |
| 9-11/12 | Quase moderno | Ajustes menores |
| 5-8/12 | Parcialmente moderno | Refactor significativo |
| 1-4/12 | Majoritariamente legado | Rewrite necessário |
| 0/12 | Completamente legado | Rewrite total |

## Completion Criteria

- All 12 patterns checked with evidence
- Score calculated with interpretation
- Recommendations prioritized by impact
- Preservation notes (what to keep during refactor)
