# 🎨 Design - Brad Frost Methodology

**Version:** 2.1.0
**Command:** `/design`
**Type:** Specialist Agent
**Independence:** ✅ 100% Self-Contained

---

## Prerequisites

> **This expansion pack is 100% INDEPENDENT.** No database, no cloud services, no external APIs required.

### Required

| Dependency | Purpose | Install |
|------------|---------|---------|
| **Claude Code** | AI coding assistant | [claude.ai/code](https://claude.ai/code) |

### Optional (for component generation)

| Dependency | Version | Purpose | Install |
|------------|---------|---------|---------|
| **Node.js** | >= 18.0 | Component generation | [nodejs.org](https://nodejs.org/) |
| **npm/yarn/pnpm** | - | Package management | Included with Node.js |

### System Requirements

- **OS:** macOS, Linux, or Windows
- **Disk:** ~10MB (pack files only)
- **Codebase:** Any React, Vue, or HTML/CSS project

---

## Overview

Design System is a **100% independent** agent for:

- **Brownfield Audit:** Scan existing codebases for UI pattern redundancy
- **Pattern Consolidation:** Reduce 47 buttons to 3 using HSL clustering
- **Design Tokens:** Extract and generate tokens (CSS, Tailwind, SCSS)
- **Component Generation:** Build React/Vue components with tests
- **Accessibility:** WCAG compliance audits and fixes
- **ROI Analysis:** Calculate cost savings from design system investment

### Brad Frost Methodology

> "Show the horror, then fix it"

This agent follows Atomic Design principles:
- **Atoms** → Basic elements (buttons, inputs)
- **Molecules** → Simple combinations (form fields)
- **Organisms** → Complex components (forms, cards)
- **Templates** → Page layouts
- **Pages** → Final implementations

---

## Quick Start

```bash
# 1. Copy pack to your project
cp -r squads/design-system /your/project/squads/

# 2. Activate Design System
/design-system

# 3. Audit your codebase
*audit ./src

# 4. See what you're working with
*shock-report
```

---

## Workflows

### 1. Brownfield (70% of use cases)

Audit existing codebase → consolidate → migrate

```bash
/design-system

*audit ./src              # Scan for pattern redundancy
# Output: 47 buttons, 89 colors, 176 total patterns

*consolidate              # Reduce via HSL clustering
# Output: 47 → 3 buttons (93.6% reduction)

*tokenize                 # Generate design tokens
# Output: tokens.yaml + CSS/Tailwind exports

*migrate                  # Generate migration strategy
# Output: 4-phase plan with priorities

*build button             # Generate Button component
*build input              # Generate Input component
*compose form-field       # Create molecule from atoms
*document                 # Generate pattern library
```

### 2. Greenfield (20% of use cases)

Start fresh with token-based design system

```bash
/design-system

*setup                    # Initialize structure
# Provide tokens.yaml or create starter tokens

*build button             # Generate components
*build input
*compose form-field
*document
```

### 3. Audit Only (10% of use cases)

Generate reports for stakeholders

```bash
/design-system

*audit ./src              # Scan codebase
*consolidate              # Reduce patterns
*shock-report             # Visual HTML report
*calculate-roi            # Cost analysis
# Output: ROI 34.6x, breakeven 10 days, $374k/year savings
```

---

## Commands

### Audit & Analysis

| Command | Description |
|---------|-------------|
| `*audit {path}` | Scan codebase for UI patterns |
| `*audit-reading` | Audit reading experience |
| `*audit-tailwind` | Audit Tailwind config |
| `*consolidate` | Reduce patterns via clustering |
| `*shock-report` | Generate visual HTML report |
| `*calculate-roi` | Calculate ROI and cost savings |

### Token Management

| Command | Description |
|---------|-------------|
| `*tokenize` | Extract design tokens |
| `*export-tokens {format}` | Export as CSS/Tailwind/SCSS |
| `*token-analytics` | Analyze token usage |

### Component Building

| Command | Description |
|---------|-------------|
| `*setup` | Initialize design system structure |
| `*build {component}` | Generate component with tests |
| `*compose {molecule}` | Create molecule from atoms |
| `*extend {pattern}` | Extend existing pattern |
| `*document` | Generate documentation |
| `*bootstrap-shadcn` | Setup shadcn/ui library |

### Accessibility

| Command | Description |
|---------|-------------|
| `*a11y-audit` | Full accessibility audit |
| `*aria-audit` | ARIA attributes audit |
| `*contrast-matrix` | Color contrast analysis |
| `*focus-order` | Focus order validation |

### Refactoring

| Command | Description |
|---------|-------------|
| `*refactor-plan` | Plan atomic refactoring |
| `*refactor-execute` | Execute refactoring |
| `*dead-code` | Detect unused patterns |
| `*design-compare` | Compare with design files |

### Maintenance

| Command | Description |
|---------|-------------|
| `*health-metrics` | Design system health score |
| `*bundle-audit` | Analyze bundle impact |
| `*tailwind-upgrade` | Upgrade Tailwind version |
| `*validate-fidelity` | Check design fidelity |

---

## Project Structure

```
squads/design-system/
├── agents/
│   └── design-system.md         # Main agent (Brad Frost persona)
├── tasks/                        # 45 design system tasks
│   ├── audit-codebase.md
│   ├── consolidate-patterns.md
│   ├── build-component.md
│   ├── a11y-audit.md
│   └── ...
├── templates/                    # 10 templates
│   ├── tokens-schema-tmpl.yaml
│   ├── component-visual-spec-tmpl.md
│   ├── design-fidelity-report-tmpl.md
│   └── ...
├── checklists/                   # 11 quality checklists
│   ├── accessibility-wcag-checklist.md
│   ├── component-quality-checklist.md
│   ├── pattern-audit-checklist.md
│   └── ...
├── data/                         # 9 knowledge base files
│   ├── atomic-design-principles.md
│   ├── design-token-best-practices.md
│   ├── wcag-compliance-guide.md
│   └── ...
├── workflows/                    # 3 workflow orchestrations
│   ├── brownfield-complete.yaml
│   ├── greenfield-new.yaml
│   └── audit-only.yaml
├── config.yaml
└── README.md
```

---

## Output Structure

When you run design system commands, outputs go to:

```
outputs/design-system/{project}/
├── audit/
│   ├── pattern-inventory.json   # All detected patterns
│   ├── consolidation-map.json   # Before/after mapping
│   └── shock-report.html        # Visual report
├── tokens/
│   ├── tokens.yaml              # Master token file
│   ├── tokens.css               # CSS custom properties
│   ├── tokens.tailwind.js       # Tailwind config
│   └── tokens.scss              # SCSS variables
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx
│   │   └── Input/
│   └── molecules/
│       └── FormField/
├── docs/
│   ├── pattern-library.md
│   └── migration-strategy.md
└── .state.yaml                  # Progress state
```

---

## Knowledge Base

| File | Description |
|------|-------------|
| `atomic-design-principles.md` | Atomic Design methodology |
| `design-token-best-practices.md` | Token naming and structure |
| `consolidation-algorithms.md` | HSL clustering algorithms |
| `roi-calculation-guide.md` | ROI and cost analysis |
| `integration-patterns.md` | Framework integration |
| `wcag-compliance-guide.md` | Accessibility guidelines |
| `high-retention-reading-guide.md` | Reading UX best practices |
| `atomic-refactor-rules.md` | Refactoring rules |

---

## Component Generation Standards

Generated components follow these standards:

- **React TypeScript** with strict mode
- **Token-based styling** (zero hardcoded values)
- **WCAG AA accessibility** minimum (AAA target)
- **Unit tests** with >80% coverage (Jest + RTL)
- **Storybook stories** included
- **Atomic Design structure**

---

## Integration (Optional)

Design System can integrate with other expansion packs:

```bash
*integrate mmos        # Personality-based token variations
*integrate creator-os  # Educational tokens for courses
*integrate innerlens   # Minimal distraction tokens
```

These integrations are **optional** - the core design system works without them.

---

## Examples

### Shock Report Output

```html
<!-- shock-report.html -->
<h2>Button Redundancy: 47 variants → 3 recommended</h2>
<div class="side-by-side">
  <div class="before">
    <!-- 47 different button styles -->
  </div>
  <div class="after">
    <!-- 3 consolidated buttons: primary, secondary, ghost -->
  </div>
</div>
```

### ROI Calculation

```
Pattern Count: 176 total (before) → 24 (after)
Reduction: 86.4%
Developer Hours Saved: 240h/year
Cost Savings: $374,400/year (at $130/hr avg)
ROI: 34.6x
Breakeven: 10 days
```

### Token Output (tokens.css)

```css
:root {
  /* Colors */
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;

  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
}
```

---

## Why 100% Independent?

This pack has **zero external dependencies** because:

1. **Filesystem-only operations** - reads codebases, writes components
2. **In-memory algorithms** - pattern clustering, token extraction
3. **No database needed** - state stored in `.state.yaml`
4. **No cloud services** - everything runs locally
5. **Framework-agnostic** - works with React, Vue, HTML/CSS

**Share freely** with your team, students, or clients.

---

**Maintained By:** AIOS Team
**Last Updated:** 2026-01-22
**Independence:** ✅ 100% Self-Contained (no database, no cloud, no external APIs)
