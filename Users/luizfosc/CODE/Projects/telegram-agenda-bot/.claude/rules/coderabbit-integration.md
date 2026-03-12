---
paths:
  - ".aiox-core/**"
  - "tests/**"
  - "packages/**"
  - "bin/**"
---

# CodeRabbit Integration

## Severity Handling

| Severity | Dev Phase | QA Phase |
|----------|-----------|----------|
| CRITICAL | auto_fix, block if persists | auto_fix, block if persists |
| HIGH | auto_fix, document if fails | auto_fix, document if fails |
| MEDIUM | document_as_tech_debt | document_as_tech_debt |
| LOW | ignore | ignore |

## Dev Phase (@dev — SDC Phase 3)

Max 2 iterations. After 2 iterations with CRITICAL → HALT, manual intervention.

## QA Phase (@qa — QA Loop Pre-Review)

Max 3 iterations. Full mode (all severities scanned).

## Integration Points

| Workflow | Phase | Agent |
|----------|-------|-------|
| Story Development Cycle | 3 (Implement) | @dev |
| QA Loop | 1 (Review) | @qa |
| Standalone | Any (`*coderabbit-review`) | Any |

## Reference

Full configs and focus areas: `.claude/references/coderabbit-detail.md`
Config: `.aiox-core/core-config.yaml` under `coderabbit_integration`.
Reports: `docs/qa/coderabbit-reports/`
