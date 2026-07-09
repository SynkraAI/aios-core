# Architecture — Wave B (SDC skills OSS lean)

| Campo | Valor |
|-------|-------|
| Wave | B |
| Epic | CORE-SUPER-UPDATE |
| Status | Accepted — Wave B implemented |
| Gate | Required before B1–B6 merge |

## 1. Goal

Ship **invocable SDC skills** for OSS: validate → develop → review → close, composed by a **thin** `full-sdc` orchestrator. Tasks under `.aiox-core/development/tasks/` remain **source of truth**.

**Source rule:** enterprise already carries the lean `full-sdc` shape in the desired 300–500 line range. Use that as baseline and enrich from hub only where OSS-safe behavior is missing. Do not manually strip the hub 2200 LOC skill as the first move.

**Source rule:** prefer **enterprise lean full-sdc (~468 LOC)** as enrichment baseline; do not strip hub ~2200 LOC as the first move. OSS already ships a thinner lean orchestrator + task SOTs.

**Not in scope:** hub full-sdc 2200 LOC as primary base, worktree product registry, hub conductor adapters, product harvest trees.

## 2. Components

```
User / IDE slash
      │
      ▼
┌─────────────────┐
│ full-sdc (lean) │  orchestrator only — Sequence Lock (soft)
└────────┬────────┘
         │ invokes (read + execute protocol)
    ┌────┼────┬────────────┬──────────┐
    ▼    ▼    ▼            ▼          ▼
 validate develop review  apply-qa   close
 -story  -story  -story   -fixes     -story
    │      │       │          │          │
    ▼      ▼       ▼          ▼          ▼
 tasks:  tasks:  tasks:    (inline)   tasks:
 validate-next  dev-develop  qa-gate/  po-close-story
 -story.md      -story.md    qa-review
```

**Skill SOT path (framework):** `.aiox-core/development/skills/<name>/SKILL.md`  
**Surfaces:** `.claude/skills/`, `.grok/skills/` (via sync), Codex skills sync later.

## 3. Phase protocol (full-sdc lean)

| Phase | Skill | Agent default | Task SOT |
|-------|-------|---------------|----------|
| 1 Validate | `validate-story-draft` | @po | `validate-next-story.md` / `dev-validate-next-story.md` |
| 2 Develop | `develop-story` | @dev | `dev-develop-story.md` |
| 3 Review | `review-story` | @qa | `qa-gate.md` + `qa-review-story.md` |
| 3b Fix | `apply-qa-fixes` | @dev | QA Results section + gate file |
| 4 Deploy | *skip if deploy_type none* | — | optional later |
| 5 Close | `close-story` | @po | `po-close-story.md` |

### Sequence Lock (lean)

1. Team-lead (or single agent) runs phases **in order**.
2. After each phase: verify on-disk artifacts (see §5) before next phase.
3. No phase sets story `status: Done` except `close-story`.
4. QG loop max **3** iterations then escalate.

### Explicitly non-ported (hub full-sdc)

- Worktree auto-spawn / WL-1..7 registry / GC  
- Agent Teams multi-teammate spawn protocol (optional later)  
- `.sdc-ack` full auto-ACK matrix (optional; v1 uses checklist only)  
- deploy-story / verify-deploy product targets  
- sinkra tier / owner_squad / `.sinkra/` paths  
- direct hub-to-OSS prose dump when an enterprise lean equivalent exists  

## 4. Skill → task invocation rule

```
SKILL.md body MUST:
  1. Name the task file path under .aiox-core/development/tasks/
  2. Say "execute that task protocol; do not invent parallel AC"
  3. List inputs/outputs + verification checklist
  4. Contain zero sinkra_/workspace/ product tokens
```

## 5. Post-phase verification (minimal)

| Skill | Must exist on disk after |
|-------|---------------------------|
| validate-story-draft | Story status Ready (or GO recorded); Change Log entry |
| develop-story | Tasks checked; File List; tests run note |
| review-story | `docs/qa/gates/*` or QA Results section with verdict |
| apply-qa-fixes | Fixes applied; re-test note |
| close-story | status Done; Change Log |

## 6. Configuration

No new core-config keys for v1. Mode: `yolo` | `interactive` via skill arg.

## 6b. Execute runtime (CLI First)

Lean execution is **not** the hub conductor/worktree product. OSS ships:

| Surface | Path |
|---------|------|
| Runtime lib | `.aiox-core/core/sdc/` (`story-meta`, `progress`, `phase-verify`, `wave-plan`) |
| CLI | `aiox sdc …`, `aiox wave …` |
| Durable state | `.aiox/sdc/{story-id}/state.json`, `.aiox/waves/{wave-id}/state.json` |
| Skills | `full-sdc` (EXECUTE loop), `wave-execute` (dispatch full-sdc children) |

Agents still perform phase work (tasks/skills). CLI owns **plan / next / verify / mark** so Sequence Lock is mechanical.

## 7. IDE wire (B6)

| Surface | Mechanism |
|---------|-----------|
| Claude | `.claude/skills/<name>/SKILL.md` |
| Grok | `.grok/skills/aiox-<name>/` via `grok-skills-sync` WORKFLOW_SKILLS or copy |
| Codex | `sync:skills:codex` or manual skill dirs later |

## 8. Anti-bloat

- Soft: full-sdc SKILL.md **< 400 lines**
- Hard: CI `validate:port-denylist` must pass
- Hard: skills must not re-implement task YAML logic in prose dumps

## 9. Test / smoke

1. `npm run validate:port-denylist`  
2. Skills exist + frontmatter `name` unique  
3. Manual: invoke validate on a Draft story path (optional e2e later)  

## 10. Acceptance ARCH-B complete

- [x] This document  
- [x] Skills land under `.aiox-core/development/skills/`  
- [x] full-sdc lean references only OSS tasks  
- [x] No workspace/ in skills  
- [x] Grok sync copies development/skills → `.grok/skills/aiox-*`  
- [x] `aiox sdc` + `aiox wave` execute/plan surfaces  
- [x] `wave-execute` lean skill dispatches `full-sdc`  
- [x] Source rule documented: enterprise lean baseline first, hub enrichment second  
