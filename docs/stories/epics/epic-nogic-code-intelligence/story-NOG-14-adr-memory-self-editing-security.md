# Story NOG-14: ADR — Memory Self-Editing Security Model

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | NOG-14 |
| **Epic** | NOGIC — Code Intelligence Integration |
| **Type** | Architecture Decision Record |
| **Status** | Draft |
| **Priority** | P2 |
| **Points** | 2 |
| **Agent** | @architect (Aria) — primary + @qa (Quinn) — security review |
| **Quality Gate** | @pm (Morgan) |
| **Blocked By** | NOG-9 (research complete) |
| **Branch** | `feat/epic-nogic-code-intelligence` |

---

## Story

As a **framework architect**, I want a formal Architecture Decision Record defining the security model for memory self-editing (STR-5), so that when we implement AI-writable memories, there are guardrails against persistence poisoning, prompt injection, and uncontrolled context degradation.

---

## Problem Statement

NOG-9 research found that Claude Code and Cursor allow AI to write its own memories. AIOS MIS (Memory Intelligence System) is currently read-only from SYNAPSE's perspective. Enabling self-editing is a competitive gap to close, but Codex QA (finding #5) correctly identified that doing so without security guardrails creates serious risks:

### Threat Model

| Threat | Vector | Impact |
|--------|--------|--------|
| **Persistence poisoning** | Malicious prompt → agent writes injection to memory | All future sessions compromised |
| **Context degradation** | Uncontrolled memory growth → token waste | Degraded SYNAPSE performance |
| **Agent impersonation** | Agent A writes memory pretending to be Agent B | Trust violation in multi-agent system |
| **Rollback failure** | No versioning → corrupted memory unrecoverable | Permanent context damage |

### Decision Required

Before any implementation of STR-5, this ADR must define: What can be written, by whom, with what validation, and how to undo it.

---

## Acceptance Criteria

### AC1: ADR Document
- [ ] ADR created in `docs/architecture/adr/ADR-memory-self-editing.md`
- [ ] Follows standard ADR format (Context, Decision, Options, Consequences)
- [ ] Documents all 4 threats from threat model above
- [ ] Defines minimum guardrails (see AC2)
- [ ] Evaluated by @qa (Quinn) for security completeness
- [ ] **Rollback:** ADR is documentation only — no code changes to revert
- [ ] **Observability:** ADR referenced in STR-5 story as blocking dependency

### AC2: Minimum Guardrails Defined

The ADR must define policy for each guardrail:

| Guardrail | Required | Policy to Define |
|-----------|----------|-----------------|
| **Field allowlist** | MANDATORY | Which memory fields can agents write to |
| **Content validation** | MANDATORY | Rejection patterns for injection (`<system>`, `IMPORTANT:`, etc.) |
| **Versionamento** | MANDATORY | How memory versions are stored, max versions retained |
| **Audit log** | MANDATORY | Format: `{timestamp, agent, action, content_hash}`, retention period |
| **Approval gate** | EVALUATE | Is human approval required for new memories? |
| **TTL** | RECOMMENDED | Default expiration for memories (suggested: 30 days) |

### AC3: Implementation Guidance
- [ ] Define recommended implementation sequence (which guardrail first)
- [ ] Estimate effort for each guardrail
- [ ] Define test strategy for security validation
- [ ] Specify how this integrates with SYNAPSE pipeline (which layer, what budget)

### AC4: Decision Matrix
- [ ] Compare options: (A) human-gated, (B) auto with validation, (C) hybrid
- [ ] Recommend option with rationale
- [ ] Define escalation path when validation fails

---

## Scope

### IN Scope
- Architecture Decision Record document
- Threat model documentation
- Guardrail specification
- Implementation guidance and effort estimates

### OUT of Scope
- Implementation of memory self-editing (STR-5 — blocked by this ADR)
- Changes to SYNAPSE engine
- Changes to MIS (Memory Intelligence System)
- Prototype or PoC code

---

## Tasks/Subtasks

- [ ] 1. Research existing memory security patterns
  - [ ] 1.1 Analyze Claude Code MEMORY.md constraints (200 line cap, user can edit)
  - [ ] 1.2 Analyze Cursor Memories feature (sidecar model, beta)
  - [ ] 1.3 Document industry patterns for AI memory security
- [ ] 2. Define threat model
  - [ ] 2.1 Enumerate attack vectors specific to AIOS multi-agent context
  - [ ] 2.2 Rate each by probability x impact
  - [ ] 2.3 Define mitigations per vector
- [ ] 3. Design guardrails
  - [ ] 3.1 Field allowlist specification
  - [ ] 3.2 Content validation rules (regex + heuristic)
  - [ ] 3.3 Versioning schema and rollback mechanism
  - [ ] 3.4 Audit log format and retention
  - [ ] 3.5 Evaluate approval gate vs auto-validation trade-off
  - [ ] 3.6 Define TTL policy
- [ ] 4. Write ADR document
- [ ] 5. @qa security review
- [ ] 6. @pm approval

---

## Testing

N/A — ADR document only. Security tests will be defined in STR-5 based on this ADR.

---

## CodeRabbit Integration

> **N/A — Architecture documentation only.** No code changes.

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | @sm (River) | Story created — Draft. Pre-requisite for STR-5 per Codex QA finding #5. |
