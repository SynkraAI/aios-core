# Architecture — Wave A (Runtime hygiene)

| Campo | Valor |
|-------|-------|
| Wave | A |
| Epic | CORE-SUPER-UPDATE |
| Status | Accepted — Wave A implemented (A1–A4 ✅) |
| Scope | Timeout config, ConfigCache residual, permission guards extension, denylist CI |

## 1. Goal

Make SYNAPSE and agent runtime **observable and safe** for OSS consumers without importing hub product surfaces.

## 2. Components

```
┌─────────────────────────────────────────────────────────┐
│                     aiox-core (OSS)                       │
│                                                           │
│  ┌──────────────┐   config    ┌─────────────────────┐   │
│  │ core-config  │────────────►│ synapse/engine.js   │   │
│  │ + env vars   │             │ process() pipeline  │   │
│  └──────────────┘             └──────────┬──────────┘   │
│                                          │ skip+warn      │
│                                          ▼                │
│                               metrics + console.warn      │
│                                                           │
│  ┌──────────────┐             ┌─────────────────────┐   │
│  │ ConfigCache  │◄── require ─│ modules importing   │   │
│  │ setInterval  │             │ config-cache        │   │
│  └──────────────┘             └─────────────────────┘   │
│         │                                                 │
│         └── Jest residual: no open handles (#797)         │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ core/permissions/                                  │   │
│  │  permission-mode.js     (KEEP)                     │   │
│  │  operation-guard.js     (KEEP)                     │   │
│  │  path-guard.js          (ADD from hub, adapted)    │   │
│  │  prompt-guard.js        (ADD)                      │   │
│  │  ssrf-guard.js          (ADD)                      │   │
│  │  index.js               (export new guards)        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────┐                                     │
│  │ scripts/denylist │  CI gate for port PRs (A4)          │
│  └──────────────────┘                                     │
└─────────────────────────────────────────────────────────┘
```

## 3. Data / control flow

### 3.1 SYNAPSE timeout (A1)

```
resolveTimeout():
  env AIOX_SYNAPSE_PIPELINE_TIMEOUT_MS
    → else core-config synapse.pipelineTimeoutMs
    → else DEFAULT 100
  clamp: integer, min≥1 (or documented min), max≤30000
  invalid → DEFAULT + warn

process(pipeline):
  for each layer:
    if elapsed > resolveTimeout():
      metrics.skipLayer(id, 'Pipeline timeout')
      console.warn('[synapse:engine] Pipeline timeout …', { timeoutMs, elapsed, layer })
      break remaining
```

**Non-goals:** change layer order; rewrite SYNAPSE; touch workspace.

### 3.2 ConfigCache (A2)

```
Current (OSS): setInterval + unref() already present
                tests/core/config-cache-unref.test.js exists

A2 work:
  1. Reproduce #797 under current Jest (detectOpenHandles / open handles)
  2. If still flaky: skip timer when JEST_WORKER_ID set OR export dispose()
  3. If not reproducible: close #797 with evidence + keep unref tests
```

**Do not** re-implement “add unref” as if missing.

### 3.3 Permissions (A3)

```
Caller (future skills / orchestration)
        │
        ▼
  OperationGuard (existing) ── mode checks ──► allow/deny
        │
        ├── PathGuard.check(path)      // new
        ├── PromptGuard.check(text)    // new
        └── SsrfGuard.check(url)       // new
```

- **Extend** `core/permissions`; **never** replace `permission-mode` / `operation-guard`.
- Hub sources are templates; strip hub-only path allowlists that mention `workspace/`.

### 3.4 Denylist CI (A4)

```
git diff / staged files → rg denylist patterns → exit 1 if hit
Patterns include: workspace/, sinkra_, .sinkra/, mux-adapter, coolify, /Users/, secrets
```

## 4. Configuration

| Key | Source | Default |
|-----|--------|---------|
| `AIOX_SYNAPSE_PIPELINE_TIMEOUT_MS` | env | — |
| `synapse.pipelineTimeoutMs` | core-config.yaml | — |
| Built-in default | engine | `100` |
| Max clamp | engine | `30000` (configurable constant) |

**Not** aliased to `AIOX_PIPELINE_TIMEOUT` (activation-pipeline).

## 5. Integration points

| Integration | Wave A | Later |
|-------------|--------|-------|
| Skills writing files | guards exported; not all wired yet | B must call PathGuard |
| IDE sync fetch | denylist only | D wires SsrfGuard |
| Pro / errors / resilience | untouched | — |

## 6. Failure modes

| Failure | Behavior |
|---------|----------|
| Timeout | Soft-fail: skip remaining layers + **visible** warn (not silent) |
| Invalid timeout config | Fallback default + warn |
| PathGuard deny | Throw/return structured deny (match existing OperationGuard style) |
| Denylist hit in CI | Fail PR |

## 7. What not to port (Wave A)

- Hub themes, ecosystem, workspace bus  
- Journey-log services  
- Full hub permissions policy matrices that assume multi-repo workspace  

## 8. Test plan

| Story | Tests |
|-------|-------|
| A1 | Unit: resolveTimeout precedence/clamp; process() skip + warn spy; active layers complete under high timeout |
| A2 | Repro script or `--detectOpenHandles`; residual fix or issue close evidence |
| A3 | Unit: path traversal, prompt injection samples, SSRF localhost/metadata |
| A4 | Fixture files that must fail denylist; clean fixture passes |

## 9. Acceptance for “Wave A architecture complete”

- [x] This document exists under public path  
- [ ] A1–A4 stories reference this ARCH  
- [ ] No dependency on `workspace/`  
- [ ] Implementation PRs cite ARCH-A section numbers  
