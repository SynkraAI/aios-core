# Changelog — Copywriting Squad

All notable changes to the copywriting-squad are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] - 2026-02-16

### Added
- **3 New Checklists**:
  - `checklists/awareness-checklist.md` — Eugene Schwartz 5 Levels of Awareness diagnostic
  - `checklists/sales-letter-checklist.md` — Gary Halbert sales letter structure (35-point)
  - `checklists/vsl-quality-checklist.md` — Jon Benson VSL quality gate (30-point)
- **Validation Report**: `docs/validation-report-2026-02-16.md` — Final 9.6/10 score
- `copy-maestro.md` — Added `behavioral_states` (5 states) + `handoff_to` (6 agents)
- `config.yaml` — Added `components` manifest (all 44 components listed)

### Changed
- **15 Expert Agents**: Full DNA rewrite with voice_dna, thinking_dna, objection_algorithms, output_examples, anti_patterns, handoff_to (avg 809 lines, up from ~150)
- **7 Workflows**: Added CHECKPOINTS, VETO CONDITIONS, and FAILURE/REWORK sections
- `README.md` — v2.0 with complete component listing and line counts
- `user-guide.md` — Added Templates, Workflows, and Checklists sections
- `config.yaml` — version 1.0.0 → 2.0.0

### Fixed
- `gary-halbert.md` — Fixed broken ref `halbert-checklist.md` → `sales-letter-checklist.md`
- Zero broken references remaining (was 1)

---

## [1.1.0] - 2026-02-15

### Added
- **5 Tasks** (AIOS Task Anatomy compliant):
  - `tasks/trafego-pago-rapido.md` — Workflow para copy de trafego pago
  - `tasks/high-ticket-sales.md` — Workflow para vendas high-ticket
  - `tasks/conteudo-organico.md` — Workflow para conteudo organico
  - `tasks/email-marketing.md` — Workflow para email marketing
  - `tasks/otimizacao-funil.md` — Workflow para otimizacao de funil
- **5 Templates** (Output structure guides):
  - `templates/sales-letter-tmpl.md` — Sales letter completa
  - `templates/vsl-script-tmpl.md` — Video Sales Letter script
  - `templates/email-sequence-tmpl.md` — Sequencias de email (SOS, welcome, carrinho)
  - `templates/bullets-fascinations-tmpl.md` — Bullets e fascinations (12 formatos)
  - `templates/oferta-irresistivel-tmpl.md` — Grand Slam Offer (Hormozi)
- **2 Data KBs**:
  - `data/awareness-levels-kb.md` — 5 niveis de consciencia de Schwartz
  - `data/clone-profiles-kb.md` — Perfis detalhados dos 15 clones
- `CHANGELOG.md` (this file)

### Fixed
- `config.yaml` — Added `entry_agent: copy-maestro`
- 98 dead dependency references removed from 16 agents
- `copy-maestro.md` — All `[PLANNED: CS.2]` markers resolved
- `README.md` — Structure section updated to match actual layout

### Changed
- 15 expert agents — Added `handoff_to:` sections with tier-aware routing

---

## [1.0.0] - 2026-02-05

### Added
- Initial squad creation with 16 agents (1 orchestrator + 15 experts)
- 3-tier system: Estrategistas (5) → Executores (9) → Otimizadores (1)
- 2 tasks: lancamento-completo.md, diagnostico-projeto.md
- 7 workflows + INDEX.md
- 3 checklists: sugarman-31-triggers.md, audit-copy-hopkins.md, clone-selection-guide.md
- 1 data file: copywriting-framework-kb.md
- config.yaml, README.md
