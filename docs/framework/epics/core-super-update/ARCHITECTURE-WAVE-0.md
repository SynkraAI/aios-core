# Architecture — Wave 0 (3-way diff harness)

| Campo | Valor |
|-------|-------|
| Wave | 0 |
| Epic | CORE-SUPER-UPDATE |
| Status | ✅ Implemented (`diff:framework-3way` + doctor) |
| Depends | Read-only access to peer hub tree (`AIOX_HUB_ROOT`) and peer enterprise tree (`AIOX_ENTERPRISE_ROOT`) |

## 1. Goal

Make framework drift visible before every future harvest. The super-update must not be a one-off manual comparison; it needs a repeatable diff harness for `.aiox-core` across OSS, hub, and enterprise.

## 2. Inputs

| Repo | Role |
|------|------|
| `.` | OSS target, `@aiox-squads/core` |
| peer hub tree (`AIOX_HUB_ROOT`) | Lab source for SDC, guards, orchestration, constitution |
| peer enterprise tree (`AIOX_ENTERPRISE_ROOT`) | Enterprise source for lean variants and workspace-only exclusions |

## 3. Output

The harness should emit a structured report with:

- exact `.aiox-core` file counts per repo;
- files only in OSS, only in hub, only in enterprise;
- files changed in 2-way and 3-way comparisons;
- explicit OSS-superior modules that must not be overwritten;
- candidate ports grouped by wave;
- denylist hits for product/workspace/secrets paths.

## 4. Command Shape

```bash
AIOX_HUB_ROOT=../sinkra-hub AIOX_ENTERPRISE_ROOT=../AIOX-enterprise npm run diff:framework-3way
```

The command is read-only and deterministic. The doctor check is advisory: it may WARN when local peer repos exist and drift is visible, but it must not require private repos for normal OSS users.

## 5. Doctor Integration

| Environment | Behavior |
|-------------|----------|
| Private maintainer workspace with all repos | Run diff harness and report drift |
| Public OSS checkout | PASS/INFO with "external repos not available" |
| CI without sibling repos | PASS/INFO unless explicit `--require-external` is set |

## 6. Non-goals

- Copying files automatically.
- Requiring hub or enterprise repos for public installs.
- Treating enterprise workspace artifacts as OSS candidates.
- Replacing architectural review with raw diff output.

## 7. Acceptance

- [x] Script exists and is deterministic: `.aiox-core/infrastructure/scripts/framework-3way-diff.js`.
- [x] Report emits current file counts; initial verified baseline recorded in `ANALYSIS-3WAY-CORRECTIONS.md`.
- [x] Report flags OSS-only modules: `core/errors`, `core/external-executors`, `core/resilience`, `pro/`.
- [x] Report classifies `context-optimizer` as a skill port, not a core engine merge.
- [x] Doctor integration is advisory outside private maintainer workspaces.
