# Story INS-4.4: Installer: CLAUDE.md Template v5 (4 Novas Secoes)

**Epic:** Installation Health & Environment Sync (INS-4)
**Wave:** 2 — Installer Integration (P1)
**Points:** 3
**Agents:** @dev
**Status:** Draft
**Blocked By:** —
**Created:** 2026-02-23

**Executor Assignment:**
- **executor:** @dev
- **quality_gate:** @architect
- **quality_gate_tools:** [manual template review, AIOS-MANAGED marker audit, markdown-merger integration test, npm test]

---

## Story

**As a** new AIOS user or upgraded project,
**I want** my `.claude/CLAUDE.md` to include sections for Boundary (L1-L4), Rules System, Code Intelligence, and Graph Dashboard,
**so that** Claude Code agents have complete context about framework protection, available rules, code-intel status, and graph commands from the moment of installation.

### Context

The current CLAUDE.md template at `.aios-core/product/templates/ide-rules/claude-rules.md` lacks 4 sections that were added in Epics BM, NOG, and GD. The production `.claude/CLAUDE.md` was updated manually — the template never received these sections.

**Sections currently in the template:** Constitution, CLI First, Estrutura do Projeto, Sistema de Agentes, Story-Driven Development, Padroes de Codigo, Testes & Quality Gates, Convencoes Git, Otimizacao Claude Code, MCP Usage, Debug.

**Sections missing from the template (must be added):**
1. `Framework vs Project Boundary` — L1-L4 table, deny rules toggle, `<!-- FRAMEWORK-OWNED -->` marker
2. `Rules System` — reference to `.claude/rules/*.md` files (7 rules)
3. `Code Intelligence` — provider status, graceful fallback explanation
4. `Graph Dashboard` — `aios graph` usage and commands

The production CLAUDE.md already has these sections. This story updates the **template** so that fresh installs get them automatically, and updates the `markdown-merger` integration so upgrades add them to existing projects.

---

## Acceptance Criteria

### AC1: Template Updated with 4 New Sections
- [ ] `.aios-core/product/templates/ide-rules/claude-rules.md` includes all 4 new sections
- [ ] Each new section is wrapped in `<!-- AIOS-MANAGED-START: {section-id} -->` / `<!-- AIOS-MANAGED-END: {section-id} -->` markers (the merger uses these for merge decisions — NOT `FRAMEWORK-OWNED`)
- [ ] Sections are inserted in logical order within the template (after Estrutura do Projeto, before Padroes de Codigo)
- [ ] Existing sections unchanged (no regressions)

### AC2: Section Content Quality
- [ ] `Framework vs Project Boundary` section: L1-L4 table with correct paths, frameworkProtection toggle instructions, references to `.claude/settings.json`
- [ ] `Rules System` section: lists all 7 `.claude/rules/*.md` files with description of each, references `.claude/rules/` directory
- [ ] `Code Intelligence` section: explains provider status (configured/fallback/error), graceful fallback behavior, references NOG epic context
- [ ] `Graph Dashboard` section: documents `aios graph`, `aios graph --format dot`, relevant CLI commands

### AC3: Installer Applies Template on Fresh Install
- [ ] Fresh `npx aios-core install` produces `.claude/CLAUDE.md` with all 4 new sections
- [ ] Template sections use `<!-- AIOS-MANAGED-START: {id} -->` / `<!-- AIOS-MANAGED-END: {id} -->` markers so the markdown-merger can process them correctly
- [ ] The installer uses `markdown-merger` to generate CLAUDE.md from template (do not write it raw)

### AC4: Upgrade Safety
- [ ] Brownfield upgrade: if existing CLAUDE.md lacks the new sections, installer adds them (AIOS-MANAGED sections only)
- [ ] Brownfield upgrade: sections NOT wrapped in AIOS-MANAGED markers (user customizations) are preserved unchanged
- [ ] Verify with `packages/installer/src/merger/strategies/markdown-merger.js` — confirm it uses `AIOS-MANAGED-START/END` markers for merge decisions

### AC5: Regression Test Coverage
- [ ] Test: fresh install output contains all 4 new section headings
- [ ] Test: upgrade of CLAUDE.md without new sections → new sections added
- [ ] Test: upgrade of CLAUDE.md with custom content in PROJECT-CUSTOMIZED sections → custom content preserved
- [ ] `npm test` passes with zero new failures

---

## Tasks / Subtasks

### Task 1: Audit Current Template and Production CLAUDE.md (AC1)
- [ ] 1.1 Read `.aios-core/product/templates/ide-rules/claude-rules.md` — list all sections and markers
- [ ] 1.2 Read production `.claude/CLAUDE.md` — identify the 4 missing sections and their exact content
- [ ] 1.3 Note: production CLAUDE.md sections for Boundary, Rules, Code-Intel already exist — use them as content source for template (copy-adapt)

### Task 2: Write Template Sections (AC1, AC2)
- [ ] 2.1 Author `## Framework vs Project Boundary` section — L1-L4 table, paths, frameworkProtection toggle, reference to `.claude/settings.json`
- [ ] 2.2 Author `## Rules System` section — list 7 rules files with 1-line description each, note that they live in `.claude/rules/`
- [ ] 2.3 Author `## Code Intelligence` section — provider status table (configured/fallback/error), graceful fallback note, context7 reference
- [ ] 2.4 Author `## Graph Dashboard` section — `aios graph` commands, usage examples, output formats (ascii, dot, json)
- [ ] 2.5 Wrap each section with `<!-- AIOS-MANAGED-START: {section-id} -->` at the top and `<!-- AIOS-MANAGED-END: {section-id} -->` at the bottom (merger uses these markers — NOT `FRAMEWORK-OWNED`)

### Task 3: Update Template File (AC1)
- [ ] 3.1 Insert 4 new sections into `.aios-core/product/templates/ide-rules/claude-rules.md` at correct position
- [ ] 3.2 Verify all existing sections still present and unchanged
- [ ] 3.3 Verify AIOS-MANAGED-START/END markers are applied to all framework-controlled sections; verify human-readable `<!-- FRAMEWORK-OWNED: ... -->` and `<!-- PROJECT-CUSTOMIZED: ... -->` annotations are consistent (these are for human readability only, not for merger logic)

### Task 4: Verify Installer Integration (AC3)
- [ ] 4.1 Read installer flow to confirm CLAUDE.md is generated from template via markdown-merger
- [ ] 4.2 If installer writes CLAUDE.md raw (without merger), update to use markdown-merger
- [ ] 4.3 Verify: fresh install produces CLAUDE.md with all 4 new sections

### Task 5: Verify Upgrade Safety (AC4)
- [ ] 5.1 Read `packages/installer/src/merger/strategies/markdown-merger.js` and `markdown-section-parser.js` — confirm they use `AIOS-MANAGED-START/END` markers for merge decisions (NOT `FRAMEWORK-OWNED`)
- [ ] 5.2 Test upgrade scenario: simulate CLAUDE.md without new sections → run upgrade → verify 4 sections added
- [ ] 5.3 Test upgrade scenario: CLAUDE.md with custom PROJECT-CUSTOMIZED section → run upgrade → verify custom content preserved

### Task 6: Tests (AC5)
- [ ] 6.1 Add unit test: template has 4 new sections with AIOS-MANAGED-START/END markers
- [ ] 6.2 Add integration test: fresh install CLAUDE.md contains all expected section headings
- [ ] 6.3 Add test: upgrade merges new sections without destroying existing custom content
- [ ] 6.4 `npm test` regression check

---

## Dev Notes

### Key Files (Read These First)

| File | Purpose |
|------|---------|
| `.aios-core/product/templates/ide-rules/claude-rules.md` | The template to update — read current content first |
| `.claude/CLAUDE.md` | Production CLAUDE.md — source for the 4 new section contents |
| `packages/installer/src/merger/strategies/markdown-merger.js` | Merger for CLAUDE.md — understand AIOS-MANAGED-START/END marker handling |
| `packages/installer/src/installer/aios-core-installer.js` | How installer writes CLAUDE.md — verify it uses template + merger |

### Section Content Reference (Production CLAUDE.md)

The production `.claude/CLAUDE.md` already contains the 4 sections. Extract them as the authoritative content:

1. **Framework vs Project Boundary** — currently at approximately the section after "Estrutura do Projeto" in production. Extract the L1-L4 table and toggle instructions.
2. **Rules System** — look for the section listing `.claude/rules/*.md` files. Note: production may have this under a different heading — normalize heading name to "Rules System".
3. **Code Intelligence** — look for section about code-intel provider (NOG epic). May be under "Context Management" or "Code Intelligence".
4. **Graph Dashboard** — look for `aios graph` documentation. May be in "Comandos Frequentes" or a dedicated section.

### AIOS-MANAGED Marker Protocol

Every template section that the framework controls must be wrapped with:
```html
<!-- AIOS-MANAGED-START: {section-id} -->
... section content ...
<!-- AIOS-MANAGED-END: {section-id} -->
```

The `markdown-merger.js` and `markdown-section-parser.js` use `AIOS-MANAGED-START/END` markers (NOT `FRAMEWORK-OWNED`) to decide whether to replace a section during upgrades. The parser explicitly matches `/^<!--\s*AIOS-MANAGED-START:\s*([a-zA-Z0-9_-]+)\s*-->/`.

**NOTE on production CLAUDE.md:** The existing `.claude/CLAUDE.md` uses `<!-- FRAMEWORK-OWNED: ... -->` comments as human-readable annotations. These are descriptive only — the merger does NOT use them for merge decisions. Templates must use `AIOS-MANAGED-START/END` for the merger to function correctly.

### Template Upgrade Policy

When the installer runs on an existing project:
- Sections wrapped in `AIOS-MANAGED-START/END` in `claude-rules.md` → overwrite matching section IDs in existing CLAUDE.md
- Sections NOT wrapped in AIOS-MANAGED markers → skip if section exists in target CLAUDE.md (user customizations preserved)
- New AIOS-MANAGED sections in template not present in target → added

### Testing

**Test Location:** `packages/installer/tests/`

**Key Scenarios:**
1. Template has exactly 4 new headings with FRAMEWORK-OWNED markers
2. Fresh install: CLAUDE.md output contains `## Framework vs Project Boundary`, `## Rules System`, `## Code Intelligence`, `## Graph Dashboard`
3. Upgrade: missing sections added; existing PROJECT-CUSTOMIZED content preserved

---

## CodeRabbit Integration

**Story Type:** Architecture (template update) + Integration (installer)
**Complexity:** Medium (template authoring + installer integration + upgrade safety)

**Quality Gates:**
- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@architect): Template completeness and AIOS-MANAGED marker consistency review

**Self-Healing Configuration:**
- **Mode:** light
- **Max Iterations:** 2
- **Timeout:** 15 minutes
- **Severity Filter:** CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: auto_fix (up to 2 iterations)
- HIGH issues: document_only

**Focus Areas (Primary):**
- AIOS-MANAGED-START/END markers: correctly applied to all 4 new sections in template (NOT FRAMEWORK-OWNED)
- Upgrade safety: sections without AIOS-MANAGED markers (user customizations) never overwritten

**Focus Areas (Secondary):**
- Section content accuracy: paths, commands, file names match actual project structure
- Template version: increment template version comment if present

---

## Dev Agent Record

### Agent Model Used
_To be filled by @dev_

### Debug Log References
_To be filled by @dev_

### Completion Notes
_To be filled by @dev_

### File List
_To be filled by @dev_

---

## QA Results
_To be filled by @qa_

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-23 | @sm (River) | Story drafted from Epic INS-4 handoff secao 3.4 + Codex recommendation (reusar markdown-merger, FRAMEWORK-OWNED markers) |
| 2026-02-23 | @sm (River) | [Codex Story Review] Markers corrigidos: merger usa `AIOS-MANAGED-START/END` (NAO `FRAMEWORK-OWNED`). AC1, AC3, AC4, Task 2.5, Task 5.1, Dev Notes "FRAMEWORK-OWNED Marker Protocol" e "Template Upgrade Policy" atualizados para AIOS-MANAGED protocol. Dev Note adicionada explicando que producao CLAUDE.md usa FRAMEWORK-OWNED como comentarios descritivos, mas o merger so entende AIOS-MANAGED-START/END. |
