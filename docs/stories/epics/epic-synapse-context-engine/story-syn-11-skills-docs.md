# Story SYN-11: Skills + Help Documentation

**Epic:** SYNAPSE Context Engine (SYN)
**Story ID:** SYN-11
**Priority:** Medium
**Points:** 3
**Effort:** 4-6 hours
**Status:** Ready for Review
**Type:** Feature
**Lead:** @dev (Dex) + @architect (Aria)
**Depends On:** SYN-7 (Hook Entry Point — Done)
**Repository:** aios-core
**Wave:** 3 (Pro + Polish)

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [manual-review, coderabbit-cli]
```

---

## User Story

**Como** usuario do AIOS,
**Quero** uma skill SYNAPSE com documentacao completa (overview, guias de referencia, troubleshooting) acessivel via `/synapse` no Claude Code,
**Para** entender como o motor SYNAPSE funciona, quais dominios existem, como criar/gerenciar dominios customizados, e como diagnosticar problemas — sem precisar ler codigo fonte.

---

## Objective

Criar a skill SYNAPSE em `.claude/skills/synapse/` com:

1. **SKILL.md** — Overview + router com frontmatter para discovery
2. **5 reference guides** — Documentacao detalhada por topico
3. **Assets** — Templates para usuario criar dominios customizados
4. **Integration** — Links para CRUD commands (SYN-9) e star-commands (SYN-7/L7)

---

## Scope

### IN Scope

- **`.claude/skills/synapse/SKILL.md`** — Main skill file
  - Frontmatter com `name: synapse` e `description` (third-person format)
  - Overview: O que e SYNAPSE, como funciona, arquitetura 4-layer
  - Quick Start: Como verificar se esta ativo, comandos basicos
  - Router: Links para references/ e commands/

- **`.claude/skills/synapse/references/domains.md`** — Domain Guide
  - O que sao dominios, tipos (L0-L7), formato KEY=VALUE
  - Como o manifest funciona
  - Como criar dominios customizados (link para `*synapse create`)
  - Exemplos de cada tipo de dominio

- **`.claude/skills/synapse/references/commands.md`** — Commands Reference
  - Todos os star-commands: *brief, *dev, *review, *plan, *discuss, *debug, *explain
  - Sub-commands: *synapse help/status/debug/domains/session/reload
  - CRUD commands: *synapse create/add/edit/toggle (links para SYN-9 tasks)
  - Exemplos de uso

- **`.claude/skills/synapse/references/manifest.md`** — Manifest Reference
  - Formato KEY=VALUE completo
  - Todas as keys validas (STATE, ALWAYS_ON, NON_NEGOTIABLE, AGENT_TRIGGER, etc.)
  - Como adicionar/modificar entries
  - Validacao e troubleshooting

- **`.claude/skills/synapse/references/brackets.md`** — Context Brackets Guide
  - 4 brackets: FRESH, MODERATE, DEPLETED, CRITICAL
  - Como sao calculados
  - Token budgets por bracket
  - Como afetam a injecao de regras e memorias

- **`.claude/skills/synapse/references/layers.md`** — 8-Layer Architecture Guide
  - L0 Constitution (NON_NEGOTIABLE, ALWAYS_ON)
  - L1 Global + Context
  - L2 Agent-scoped
  - L3 Workflow-scoped
  - L4 Task context
  - L5 Squad discovery
  - L6 Keyword (RECALL)
  - L7 Star-commands
  - Prioridade e conflito entre layers

- **`.claude/skills/synapse/assets/`** — Reference links to existing templates (IDS: REUSE)
  - `domain-template` and `manifest-entry-template` already exist at `.claude/commands/synapse/templates/`
  - Assets section in SKILL.md must link to the existing templates, NOT duplicate them
  - If user-facing copies are needed, create symlinks or a README pointing to `../../commands/synapse/templates/`

### OUT of Scope

- Engine implementation (SYN-1 through SYN-6)
- CRUD command implementation (SYN-9 — Done)
- Hook entry point (SYN-7 — Done)
- Memory bridge documentation (SYN-10 — will update after done)
- Performance benchmarks (SYN-12)
- Video tutorials or interactive guides
- Internationalization (documentation in Portuguese only where needed, English primary)

---

## Acceptance Criteria

1. **SKILL.md Exists and Discoverable**
   - `.claude/skills/synapse/SKILL.md` exists with valid frontmatter
   - `name: synapse` and `description` in third-person format
   - Claude Code can discover and load the skill via `/synapse`
   - Overview section explains SYNAPSE purpose and architecture
   - Quick Start section has actionable first steps

2. **5 Reference Guides Complete**
   - `references/domains.md` — Domain types (L0-L7), format, creation guide
   - `references/commands.md` — All star-commands and CRUD commands documented
   - `references/manifest.md` — Complete manifest format reference
   - `references/brackets.md` — 4 brackets, calculation, token budgets
   - `references/layers.md` — 8-layer hierarchy, priority, conflict resolution
   - Each guide is self-contained (can be read independently)

3. **Content Accuracy**
   - All domain types documented match actual `.synapse/` content (SYN-8)
   - All commands documented match actual CRUD tasks (SYN-9)
   - All star-commands documented match actual `.synapse/commands` file
   - Layer descriptions match engine implementation (SYN-4, SYN-5, SYN-6)
   - Bracket definitions match context-tracker (SYN-3)
   - No invented features or undocumented capabilities

4. **Asset Templates (IDS: REUSE)**
   - `assets/` directory references existing templates from `.claude/commands/synapse/templates/`
   - NOT duplicated — linked or redirected (README, symlink, or direct path reference in SKILL.md)
   - Templates match format expected by domain-loader (SYN-1)
   - Source of truth remains `.claude/commands/synapse/templates/domain-template` and `manifest-entry-template`

5. **Cross-References**
   - SKILL.md links to all 5 references
   - Commands guide links to CRUD tasks in `.claude/commands/synapse/`
   - Domains guide links to `*synapse create` command
   - Layers guide references engine implementation files
   - Brackets guide references context-tracker

6. **Article IV Compliance (No Invention)**
   - All documented features trace to implemented code
   - No aspirational or planned features described as current
   - SYN-10 (memory bridge) referenced as "when pro is available" only if SYN-10 is done

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Documentation drift from code | Medium | Medium | Derive all content from implemented code, not design docs. Reference specific file paths |
| Skill discovery issues | Low | Medium | Follow exact pattern from architect-first skill (working reference) |
| Over-documenting planned features | Medium | High | Strict Article IV: only document what is implemented and working |
| Low overall | — | — | Creates only documentation files, no code modification |

---

## Dev Notes

### Skill Structure Pattern

Follow the pattern from `.claude/skills/architect-first/SKILL.md`:

```markdown
---
name: synapse
description: "This skill should be used when users want to understand the SYNAPSE context engine, manage domains, configure context rules, or troubleshoot rule injection."
---

# SYNAPSE Context Engine

## Overview
[What SYNAPSE is, how it works]

## Quick Start
[First steps for new users]

## Architecture
[4-layer architecture diagram from EPIC-SYN-INDEX]

## References
### references/
- `domains.md` - Complete domain management guide
- `commands.md` - Star-commands and CRUD reference
- `manifest.md` - Manifest format specification
- `brackets.md` - Context bracket system guide
- `layers.md` - 8-layer processor architecture

### assets/
- `domain-template` - Template for new domains
- `manifest-entry-template` - Template for manifest entries
```

[Source: .claude/skills/architect-first/SKILL.md pattern]

### Existing CRUD Commands (SYN-9)

The following CRUD tasks exist in `.claude/commands/synapse/`:

| Command | Task File | Purpose |
|---------|-----------|---------|
| `*synapse create` | `tasks/create-domain.md` | Create new domain + manifest entry |
| `*synapse add` | `tasks/add-rule.md` | Add rule to existing domain |
| `*synapse edit` | `tasks/edit-rule.md` | Edit or remove rule by index |
| `*synapse toggle` | `tasks/toggle-domain.md` | Toggle domain active/inactive |
| `*synapse command` | `tasks/create-command.md` | Create new star-command |
| `*synapse suggest` | `tasks/suggest-domain.md` | Suggest best domain for a rule |

Router: `manager.md` dispatches to appropriate task.

[Source: .claude/commands/synapse/ directory]

### Star-Commands (from .synapse/commands)

```
*brief, *dev, *review, *plan, *discuss, *debug, *explain
*synapse help, *synapse status, *synapse debug, *synapse domains, *synapse session, *synapse reload
```

[Source: .synapse/commands]

### Testing

- **No unit tests required** — This is documentation-only story
- **Validation:** Manual verification that skill loads in Claude Code
- **Accuracy check:** Cross-reference all documented features against implemented code
- **Naming Convention:** N/A (no test files)

### Key Files

| File | Action |
|------|--------|
| `.claude/skills/synapse/SKILL.md` | CREATE |
| `.claude/skills/synapse/references/domains.md` | CREATE |
| `.claude/skills/synapse/references/commands.md` | CREATE |
| `.claude/skills/synapse/references/manifest.md` | CREATE |
| `.claude/skills/synapse/references/brackets.md` | CREATE |
| `.claude/skills/synapse/references/layers.md` | CREATE |
| `.claude/skills/synapse/assets/README.md` | CREATE (links to existing templates) |
| `.claude/commands/synapse/templates/domain-template` | REUSE (already exists from SYN-9) |
| `.claude/commands/synapse/templates/manifest-entry-template` | REUSE (already exists from SYN-9) |

---

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Feature (Documentation + Skill creation)
**Secondary Type(s)**: None
**Complexity**: Low

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Skill file creation
- @architect: Content accuracy review

**Supporting Agents:**
- @qa: Cross-reference validation

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run `coderabbit --prompt-only -t uncommitted` before marking story complete
- [ ] Pre-PR (@devops): Run `coderabbit --prompt-only --base main` before creating pull request

### Self-Healing Configuration

**Expected Self-Healing:**
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: [CRITICAL, HIGH]

### CodeRabbit Focus Areas

**Primary Focus:**
- Content accuracy (no invented features)
- Frontmatter validity for skill discovery
- Cross-reference integrity (links to real files)

**Secondary Focus:**
- Markdown formatting consistency
- Documentation completeness per section

---

## Tasks / Subtasks

- [x] **Task 1: SKILL.md Main File** [AC: 1, 5]
  - [x] Create `.claude/skills/synapse/SKILL.md` with frontmatter
  - [x] Write Overview section (SYNAPSE purpose, per-prompt injection, 8 layers)
  - [x] Write Quick Start section (verify active, basic commands)
  - [x] Write Architecture section (4-layer diagram from EPIC-SYN-INDEX)
  - [x] Add Resources section linking to all references and assets

- [x] **Task 2: Domains Reference** [AC: 2, 3, 6]
  - [x] Create `references/domains.md`
  - [x] Document domain types L0-L7 with examples from `.synapse/` files
  - [x] Document KEY=VALUE format (comments, empty lines, SCREAMING_SNAKE_CASE)
  - [x] Document manifest registration (STATE, ALWAYS_ON, triggers)
  - [x] Link to `*synapse create` command

- [x] **Task 3: Commands Reference** [AC: 2, 3, 5]
  - [x] Create `references/commands.md`
  - [x] Document 7 mode commands (*brief through *explain) with behavior
  - [x] Document 6 *synapse sub-commands (help, status, debug, domains, session, reload)
  - [x] Document 6 CRUD operations (create, add, edit, toggle, command, suggest)
  - [x] Include usage examples for each command

- [x] **Task 4: Manifest Reference** [AC: 2, 3]
  - [x] Create `references/manifest.md`
  - [x] Document complete KEY format (STATE, ALWAYS_ON, NON_NEGOTIABLE, AGENT_TRIGGER, etc.)
  - [x] Document VALUE types and constraints
  - [x] Include complete manifest example from `.synapse/manifest`
  - [x] Document troubleshooting (validation errors, format issues)

- [x] **Task 5: Brackets Reference** [AC: 2, 3]
  - [x] Create `references/brackets.md`
  - [x] Document 4 brackets with context % ranges
  - [x] Document token budgets per bracket
  - [x] Document which layers activate per bracket
  - [x] Explain calculation method (from context-tracker SYN-3)

- [x] **Task 6: Layers Reference** [AC: 2, 3]
  - [x] Create `references/layers.md`
  - [x] Document each layer (L0-L7) with: purpose, trigger, format, priority
  - [x] Document layer execution order and pipeline flow
  - [x] Document conflict resolution between layers
  - [x] Include XML output format example (`<synapse-rules>`)

- [x] **Task 7: Asset Templates (IDS: REUSE)** [AC: 4]
  - [x] Create `assets/README.md` pointing to existing templates at `.claude/commands/synapse/templates/`
  - [x] Verify existing `domain-template` and `manifest-entry-template` are parseable by domain-loader (SYN-1)
  - [x] Reference templates in SKILL.md assets section with correct relative paths

---

## Definition of Done

- All 6 ACs met and verified
- SKILL.md discoverable via `/synapse` in Claude Code
- All 5 reference guides complete and self-contained
- All documented features trace to implemented code (Article IV)
- Cross-references verified (no broken links)
- No template placeholders remaining (no `{PLACEHOLDER}`, `TBD`, or `TODO` in final files)
- No lint errors on markdown files
- Story checkboxes updated, File List populated

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-11 | @sm (River) | Story drafted from EPIC-SYN Wave 3. Specs from EPIC-SYN-INDEX.md, architect-first skill pattern, SYN-9 CRUD commands review, .synapse/ content files review. Depends on SYN-7 (Done). |
| 2026-02-12 | @po (Pax) | Validation GO Condicional (94/100). Status Draft → Ready. 3 should-fix + 1 nice-to-have identified. |
| 2026-02-12 | @po (Pax) | Applied all fixes: SF-1 quality_gate @qa→@architect, SF-2 asset templates REUSE from commands/templates/ (not duplicate), SF-3 self-healing timeout 30→15min, NH-1 added placeholder check to DoD. Updated Scope, AC4, Task 7, Key Files, File List. Score: 94→100/100. |
| 2026-02-12 | @dev (Dex) | Implementation complete. 7 files created: SKILL.md, 5 reference guides (domains, commands, manifest, brackets, layers), assets/README.md. All content derived from source code (Article IV). Skill discovery confirmed. Status Ready → Ready for Review. |

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- No debug logs — documentation-only story, no code execution or runtime errors

### Completion Notes List

- All 7 files created successfully (SKILL.md + 5 references + assets README)
- SKILL.md discoverable via `/synapse` in Claude Code (confirmed via system-reminder skill list)
- All content cross-referenced against actual `.synapse/` files and engine source code for Article IV compliance
- Asset templates follow IDS REUSE pattern — `assets/README.md` links to existing templates at `.claude/commands/synapse/templates/`
- No unit tests required (documentation-only story per Dev Notes)
- No placeholders remaining in any file

### File List

| File | Action |
|------|--------|
| `.claude/skills/synapse/SKILL.md` | CREATE |
| `.claude/skills/synapse/references/domains.md` | CREATE |
| `.claude/skills/synapse/references/commands.md` | CREATE |
| `.claude/skills/synapse/references/manifest.md` | CREATE |
| `.claude/skills/synapse/references/brackets.md` | CREATE |
| `.claude/skills/synapse/references/layers.md` | CREATE |
| `.claude/skills/synapse/assets/README.md` | CREATE (links to existing templates) |
| `.claude/commands/synapse/templates/domain-template` | REUSE (already exists from SYN-9) |
| `.claude/commands/synapse/templates/manifest-entry-template` | REUSE (already exists from SYN-9) |

---

## QA Results

### Review Date: 2026-02-12

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Excellent documentation-only delivery. All 7 files are well-structured, self-contained, and accurately derived from source code. The SKILL.md frontmatter follows the architect-first pattern correctly and is immediately discoverable. IDS REUSE pattern properly applied for asset templates.

### Refactoring Performed

None. No code or content changes needed.

### Compliance Check

- Coding Standards: N/A (documentation-only)
- Project Structure: PASS — files placed in `.claude/skills/synapse/` following established skill pattern
- Testing Strategy: N/A — no unit tests required (documentation story, per Dev Notes)
- All ACs Met: PASS (6/6)

### AC Validation Detail

| AC | Status | Evidence |
|----|--------|----------|
| AC1: SKILL.md Discoverable | PASS | Frontmatter valid, `synapse` appears in Claude Code skill list |
| AC2: 5 Reference Guides | PASS | All 5 files exist, each self-contained with overview + details + source refs |
| AC3: Content Accuracy | PASS | All claims cross-referenced against 10 source files — zero discrepancies found |
| AC4: Asset Templates (REUSE) | PASS | assets/README.md links to existing templates, no duplication |
| AC5: Cross-References | PASS | All relative links verified: SKILL.md→5 refs, refs→source files, assets→manifest.md |
| AC6: Article IV (No Invention) | PASS | No aspirational features, all content traces to implemented code |

### Improvements Checklist

- [x] All 7 deliverables created and complete
- [x] Frontmatter discovery confirmed
- [x] Content accuracy verified (10 source files cross-referenced)
- [x] IDS REUSE pattern applied correctly
- [x] No placeholders remaining (grep: 31 matches all format syntax, not unfilled)
- [x] Cross-references verified (no broken links)

### Observations (Non-Blocking)

1. **brackets.md CRITICAL section**: The "Bracket-Specific Rules > CRITICAL" states "Only inject L0 Constitution and L1 Global rules" (from `.synapse/context` domain), while the "Layer Activation" table correctly shows CRITICAL has all L0-L7 active (from `context-tracker.js` LAYER_CONFIGS). These are not contradictory — the context domain provides behavioral guidelines to the LLM, while LAYER_CONFIGS controls which layers the engine loads. A clarifying sentence could help future readers distinguish engine behavior from LLM behavior. **Severity: Low — cosmetic.**

2. **commands.md behavior descriptions**: Slightly condensed from source rule text (e.g., "skip preamble" vs source "Skip pleasantries and preamble"). Acceptable summarization for documentation, not invention. **Severity: None.**

### Security Review

No security concerns. Documentation-only story — no code execution, no secrets, no API endpoints.

### Performance Considerations

No performance concerns. Static markdown files with no runtime impact.

### Files Modified During Review

None. No modifications performed.

### Gate Status

Gate: **PASS** — `docs/qa/gates/syn-11-skills-docs.yml`
Quality Score: 100/100
Risk Profile: Low (documentation-only, no code changes)

### Recommended Status

PASS — Ready for Done. Story owner decides final status.

---

*Story SYN-11 — Skills + Help Documentation*
*Wave 3 Pro + Polish | Depends on SYN-7 | User Documentation*
