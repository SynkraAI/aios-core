# validate-contracts

```yaml
task:
  name: validate-contracts
  description: "Verify consistency of local ETL contracts (registry, tasks, agents, templates)"
  squad: etl-squad
  phase: 0
  elicit: false

input:
  required: []
  optional:
    - workspace_path: "Path to workspace root (default: cwd)"
    - fix: "false (default). true → auto-fix minor issues (missing keywords, format mismatches)"
    - verbose: "false (default). true → show details for each check"

execution:
  workflow: null
  agents: [validator]

  steps:
    - agent: validator
      action: "Registry → Task consistency"
      rules:
        - "For each pipeline in source-type-registry.yaml:"
        - "  Verify task file exists in tasks/ matching pipeline name"
        - "  Verify output_format in registry matches output_format in task"
        - "  Verify agents referenced in task exist in agents/"
        - "Report: matched, mismatched, missing"

    - agent: validator
      action: "Agent → Squad consistency"
      rules:
        - "For each agent in squad.yaml agents list:"
        - "  Verify agent .md file exists in agents/"
        - "  Verify agent id in file matches squad.yaml"
        - "  Verify tier in file matches squad.yaml"
        - "Report: matched, mismatched, missing"

    - agent: validator
      action: "Workflow → Agent consistency"
      rules:
        - "For each workflow in workflows/:"
        - "  Verify all agents referenced in phases exist in agents/"
        - "  Verify workflow is referenced by at least one task"
        - "Report: orphan workflows, missing agent references"

    - agent: validator
      action: "Template → Task consistency"
      rules:
        - "For each template in templates/:"
        - "  Verify at least one task references it"
        - "For each task that references a template:"
        - "  Verify template file exists"
        - "Report: orphan templates, missing templates"

    - agent: validator
      action: "Generate contract report"
      rules:
        - "Aggregate all checks"
        - "Calculate contract health score: valid / total checks"
        - "Verdict: CONSISTENT (100%), DEGRADED (>80%), INCONSISTENT (<80%)"
        - "If fix=true → apply auto-fixes and report changes"

output_format: text

veto_conditions:
  - "source-type-registry.yaml not found → FAIL (run *workspace-preflight first)"
  - "squad.yaml not found → FAIL"
  - "Contract health <50% → FAIL with detailed report"
  - ">3 missing task files for registered pipelines → FAIL"

output_example: |
  ETL Contract Validation Report
  ==============================

  Registry → Tasks:
    url-to-markdown      → tasks/url-to-markdown.md       ✅ format: md ✅
    youtube-to-brief     → tasks/youtube-to-brief.md      ✅ format: md ✅
    pdf-to-knowledge     → tasks/pdf-to-knowledge.md      ✅ format: md ✅
    spreadsheet-to-json  → tasks/spreadsheet-to-json.md   ✅ format: yaml ✅
    compile              → tasks/compile.md                ✅ format: md ✅
    enrich               → tasks/enrich.md                 ✅ format: md ✅
    extract-keyframes    → tasks/extract-keyframes.md      ✅ format: dir ✅
    ...10/10 pipelines matched

  Agents → Squad:
    etl-chief  T0 ✅    extractor T1 ✅    parser   T1 ✅
    enricher   T2 ✅    validator T2 ✅    loader   T2 ✅
    ...6/6 agents matched

  Workflows → Agents:
    wf-etl-pipeline.yaml     → 5 agents ✅ (referenced by 7 tasks)
    wf-batch-processing.yaml → 2 agents ✅ (referenced by 1 task)
    wf-compile.yaml          → 5 agents ✅ (referenced by 1 task)
    ...3/3 workflows valid

  Templates → Tasks:
    markdown-output-tmpl.md  → referenced by url-to-markdown ✅
    yaml-output-tmpl.yaml    → referenced by spreadsheet-to-json ✅
    chunk-jsonl-tmpl.jsonl   → referenced by pdf-to-knowledge ✅
    ...3/3 templates valid

  Contract Health: 25/25 checks passed (100%)
  Verdict: CONSISTENT ✅

completion_criteria:
  - "All 4 consistency dimensions checked"
  - "Contract health score calculated"
  - "Clear verdict (CONSISTENT / DEGRADED / INCONSISTENT)"
  - "Specific issues listed with file paths"
```
