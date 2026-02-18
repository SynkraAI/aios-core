# Changelog — Design System Squad

All notable changes to this squad are documented here.

## [2.0.0] — 2025-10-27

### Merged: design-system-alan operational tooling

Major merge incorporating the `design-system-alan` squad's operational capabilities into the main Design System Squad.

**New Tasks (33 merged):**
- Tailwind v4 audit, upgrade, and Shadcn/UI bootstrap
- DTCG token export (`export-design-tokens-dtcg.md`)
- Design fidelity validation (`validate-design-fidelity.md`)
- DS health metrics dashboard (`ds-health-metrics.md`)
- Bundle size auditing (`bundle-audit.md`)
- Dead code detection (`dead-code-detection.md`)
- Reading experience audits (`audit-reading-experience.md`)
- Contrast matrix generation (`contrast-matrix.md`)
- Focus order audit (`focus-order-audit.md`)
- Atomic refactoring plan + execute (`atomic-refactor-plan.md`, `atomic-refactor-execute.md`)
- DS operational variants: `ds-audit-codebase`, `ds-build-component`, `ds-compose-molecule`, `ds-extend-pattern`, `ds-scan-artifact`, `ds-rebuild-artifact`, `ds-extract-tokens`, `ds-generate-migration-strategy`, `ds-generate-documentation`, `ds-consolidate-patterns`, `ds-setup-design-system`, `ds-generate-shock-report`

**New Templates (10 merged):**
- `component-visual-spec-tmpl.md`, `design-fidelity-report-tmpl.md`, `ds-health-report-tmpl.md`
- `ds-state-persistence-tmpl.yaml`, `ds-tokens-schema-tmpl.yaml`, `ds-artifact-analysis.md`
- `ds-migration-strategy-tmpl.md`, `state-persistence-tmpl.yaml`, `tokens-schema-tmpl.yaml`, `migration-strategy-tmpl.md`

**New Checklists (7 merged):**
- `design-fidelity-checklist.md`, `reading-accessibility-checklist.md`, `ds-accessibility-wcag-checklist.md`
- `ds-component-quality-checklist.md`, `ds-migration-readiness-checklist.md`, `ds-pattern-audit-checklist.md`
- `atomic-refactor-checklist.md`

**New Data (9 merged):**
- `consolidation-algorithms.md`, `roi-calculation-guide.md`, `high-retention-reading-guide.md`
- `design-tokens-spec.yaml`, `atomic-refactor-rules.md`, `atomic-design-principles.md`
- `design-token-best-practices.md`, `wcag-compliance-guide.md`, `integration-patterns.md`

**New Workflows (3 merged):**
- `audit-only.yaml` — Shock report + ROI for executives (10% of use cases)
- `brownfield-complete.yaml` — Full audit→build pipeline (70% of use cases)
- `greenfield-new.yaml` — Start from scratch with tokens (20% of use cases)

**New Capabilities:**
- YOLO/Supervisor parallel execution mode for brad-frost
- State persistence via `.state.yaml` across sessions
- Direct command mapping with zero-discovery Read() paths

### Removed
- `@sarah-federman` agent (Token Engineer) — responsibilities reassigned to `@jina-anne` (token architecture) and `@micah-godbolt` (token tooling/build)

### Agent Changes
- `@brad-frost`: Added 8 ds-* operational tasks to dependencies
- `@design-chief`: Added ds-setup-design-system task + 3 merged workflows to dependencies

---

## [1.0.0] — 2025-09-15

### Initial Release

- 12 specialized agents based on real design system experts
- 62 tasks covering atomic design, tokens, a11y, governance, CSS, patterns
- 4 workflows: design system setup, component creation, audit, app design system
- 17 checklists with blocking/warning severity levels
- 17 data files for reference standards
- Tier-based agent organization (Orchestrator + Tier 0/1/2/3)
