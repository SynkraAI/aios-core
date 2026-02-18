# Design System Squad Knowledge Base

**ID:** design-kb
**Version:** 1.0
**Purpose:** Comprehensive knowledge base for the Design System Squad covering agent roster, frameworks, methodologies, reading list, glossary, and workflow patterns
**Maintained By:** @dan-mall

---

## Squad Overview

The Design System Squad is a specialized team of 12 AI agents that provides comprehensive design system expertise. The squad covers the full lifecycle of design systems — from initial architecture and token foundations through component development, accessibility, governance, adoption, and scaling.

The squad operates within the Synkra AIOS framework, activated via the `@design` prefix or by addressing individual agents directly (e.g., `@brad-frost`, `@jina-anne`).

**Core mission:** Help teams create, maintain, and scale design systems that are consistent, accessible, and developer-friendly.

**Key capabilities:**
- Design system architecture and component taxonomy (Atomic Design)
- Design token creation, management, and multi-platform distribution
- Accessibility auditing and inclusive design guidance (WCAG 2.2)
- CSS architecture and frontend implementation patterns
- UI/UX pattern identification and application
- Object-oriented UX analysis
- Governance, adoption, and organizational scaling
- Designer-developer collaboration workflows

---

## Agent Roster

| Agent | Name | Role | Specialty | Tier |
|-------|------|------|-----------|------|
| @brad-frost | Brad Frost | Component Architect | Atomic Design, component taxonomy, pattern libraries | Tier 1 (Core) |
| @nathan-curtis | Nathan Curtis | System Strategist | Governance, versioning, team models, organizational scaling | Tier 1 (Core) |
| @jina-anne | Jina Anne | Token Architect | Design tokens, Style Dictionary, DTCG format, multi-platform | Tier 1 (Core) |
| @heydon-pickering | Heydon Pickering | Inclusive Design Lead | Accessibility patterns, inclusive components, ARIA | Tier 1 (Core) |
| @dan-mall | Dan Mall | Design Director | Collaboration, hot potato, adoption strategy, business case | Tier 1 (Core) |
| @alla-kholmatova | Alla Kholmatova | Design Language Lead | Naming, shared vocabulary, functional/perceptual patterns | Tier 2 (Specialist) |
| @micah-godbolt | Micah Godbolt | Frontend Architect | Component architecture, testing, build systems, monorepos | Tier 2 (Specialist) |
| @sophia-prater | Sophia Prater | OOUX Specialist | Object-oriented UX, information architecture, object mapping | Tier 2 (Specialist) |
| @stephanie-walter | Stephanie Walter | A11y Design Specialist | Designer-focused accessibility, annotations, audits | Tier 2 (Specialist) |
| @jenifer-tidwell | Jenifer Tidwell | UI Pattern Expert | UI patterns, interaction design, navigation, layout | Tier 2 (Specialist) |
| @andy-bell | Andy Bell | CSS Architect | CUBE CSS, modern CSS, progressive enhancement, fluid design | Tier 3 (Support) |
| @sarah-federman | Sarah Federman | Token Engineer | Token tooling, Style Dictionary configuration, automation | Tier 3 (Support) |

### Tier Descriptions

- **Tier 1 (Core):** Agents activated in most design system workflows. They lead primary deliverables.
- **Tier 2 (Specialist):** Agents activated for specific problem domains. They provide deep expertise.
- **Tier 3 (Support):** Agents activated for implementation-level guidance. They support Tier 1 and 2 agents.

---

## Key Frameworks

### Atomic Design (Brad Frost)

A methodology for creating design systems with a hierarchical component taxonomy:

1. **Atoms:** Smallest building blocks (button, input, label, icon, badge)
2. **Molecules:** Groups of atoms functioning together (search field = label + input + button)
3. **Organisms:** Groups of molecules forming a distinct section (header = logo + nav + search)
4. **Templates:** Page-level layouts defining content structure without real content
5. **Pages:** Templates with real representative content for testing and review

**Key principle:** Build from small to large. Atoms are the foundation. Everything above is composition.

### CUBE CSS (Andy Bell)

A CSS methodology that works with the cascade rather than against it:

- **Composition:** Layout primitives that control how elements flow and space (Stack, Cluster, Sidebar, Grid)
- **Utility:** Small, single-purpose classes derived from design tokens (.text-sm, .gap-md, .color-primary)
- **Block:** Component-specific styles with a clear encapsulation boundary
- **Exception:** State-based variations using data attributes or modifier classes ([data-state="active"])

**Key principle:** Embrace the cascade. Use specificity layers. Let CSS do what CSS does well.

### Object-Oriented UX — OOUX (Sophia Prater)

A content-first design methodology that starts with objects rather than actions:

1. **Identify objects:** What are the nouns users interact with? (Product, Order, User, Review)
2. **Map relationships:** How do objects relate to each other? (User has many Orders)
3. **Define content:** What metadata and properties does each object have?
4. **Assign CTAs:** What actions can users take on each object?
5. **Build the Nested Object Matrix (NOM):** Cross-reference objects, content, nested objects, and CTAs

**Key principle:** Start with what, then define how. Objects create consistent, predictable UX.

### Design Tokens (Jina Anne)

A methodology for storing design decisions as platform-agnostic data:

- **Global tokens:** Raw values with no semantic meaning (color.blue.500 = #3B82F6)
- **Alias tokens:** Semantic references to global tokens (color.brand.primary = {color.blue.500})
- **Component tokens:** Context-specific references to alias tokens (button.color.bg = {color.brand.primary})

**Key principle:** Separate decisions from implementation. One source of truth, many platform outputs.

### Inclusive Design (Heydon Pickering)

An approach that ensures interfaces work for the widest range of users:

- Design for keyboard-only users from the start
- Use semantic HTML as the foundation for accessibility
- Test with real assistive technologies (screen readers, switch devices)
- Avoid ARIA when native HTML provides the semantics
- Design for content, not for able-bodied assumptions

**Key principle:** Inclusive design is not a feature — it is a quality criterion for all features.

---

## Recommended Reading

### Books

| Title | Author | Topic |
|-------|--------|-------|
| Atomic Design | Brad Frost | Component-based design systems |
| Design Systems | Alla Kholmatova | Design language and shared vocabulary |
| Inclusive Components | Heydon Pickering | Building accessible UI components |
| Designing Interfaces | Jenifer Tidwell | UI pattern catalog and interaction design |
| Frontend Architecture for Design Systems | Micah Godbolt | Frontend code architecture |
| Design That Scales | Dan Mall | Scaling design systems in organizations |
| Design Tokens | Self-published / Jina Anne | Token architecture and management |
| Every Layout | Andy Bell & Heydon Pickering | Intrinsic CSS layout patterns |
| Practical Object-Oriented Design in UX | Sophia Prater | Object-oriented UX methodology |
| Accessibility for Everyone | Laura Kalbag | Inclusive design fundamentals |

### Online Resources

| Resource | URL (Reference) | Topic |
|----------|-----------------|-------|
| Design Tokens Community Group | W3C DTCG | Token specification standard |
| Style Dictionary Documentation | amzn.github.io/style-dictionary | Token build tooling |
| Inclusive Components (blog) | inclusive-components.design | Accessible component patterns |
| Every Layout | every-layout.dev | CSS layout primitives |
| A11y Project | a11yproject.com | Accessibility quick references |
| CUBE CSS Documentation | cube.fyi | CUBE CSS methodology |

---

## Glossary

| Term | Definition |
|------|-----------|
| **Atomic Design** | A methodology that classifies components into atoms, molecules, organisms, templates, and pages |
| **Alias Token** | A design token that references another token by name rather than containing a raw value |
| **ARIA** | Accessible Rich Internet Applications — WAI specification for making web content accessible |
| **Breakpoint** | A viewport width at which the layout changes to adapt to different screen sizes |
| **CUBE CSS** | Composition Utility Block Exception — a CSS methodology by Andy Bell |
| **CTI** | Category-Type-Item — a naming taxonomy for design tokens |
| **Component Token** | A design token scoped to a specific component (e.g., button.color.background) |
| **Design Token** | A named, platform-agnostic value representing a design decision (color, spacing, etc.) |
| **DTCG** | Design Tokens Community Group — W3C group defining the token specification |
| **Federated Model** | A team model where design system ownership is distributed across product teams |
| **Global Token** | A design token containing a raw value (e.g., color.blue.500 = #3B82F6) |
| **Governance** | The processes, policies, and decision-making structures that manage the design system |
| **Hot Potato** | A collaboration pattern where work passes rapidly between designer and developer |
| **Inclusive Design** | Designing for the widest range of users, including those with disabilities |
| **Modular Scale** | A sequence of numbers derived by multiplying a base by a consistent ratio |
| **NOM** | Nested Object Matrix — an OOUX artifact mapping objects, content, and CTAs |
| **OOUX** | Object-Oriented UX — a methodology that structures design around user-facing objects |
| **Pattern** | A reusable solution to a common UI problem (navigation, input, feedback, etc.) |
| **Progressive Enhancement** | Building a baseline experience first, then adding advanced features for capable browsers |
| **Semantic Token** | A token named for its purpose rather than its value (color.feedback.error vs color.red.500) |
| **SemVer** | Semantic Versioning — MAJOR.MINOR.PATCH version numbering convention |
| **Specificity** | The algorithm browsers use to determine which CSS rule applies to an element |
| **Style Dictionary** | A tool by Amazon for transforming design tokens into platform-specific formats |
| **Tree-Shaking** | A build optimization that removes unused code from the final bundle |
| **Utility Class** | A single-purpose CSS class that applies one style rule (e.g., .text-center, .mt-4) |
| **Visual Regression** | Testing that compares screenshots to detect unintended visual changes |
| **WCAG** | Web Content Accessibility Guidelines — the international standard for web accessibility |
| **Z-Index** | A CSS property controlling the stacking order of positioned elements |

---

## Workflow Patterns

### New Design System (Full Lifecycle)

```
@dan-mall        --> Business case, stakeholder alignment, team model
@nathan-curtis   --> Governance model, contribution path, versioning
@alla-kholmatova --> Design language, naming conventions, principles
@jina-anne       --> Token architecture, scales, platform output
@brad-frost      --> Component taxonomy, atomic hierarchy
@heydon-pickering --> Accessibility patterns, inclusive foundations
@micah-godbolt   --> Frontend architecture, build pipeline, testing
@andy-bell       --> CSS methodology, utility system
@jenifer-tidwell --> UI patterns, interaction conventions
@sophia-prater   --> Object model, information architecture
@stephanie-walter --> A11y annotations, designer handoff
@sarah-federman  --> Token tooling, automation
```

### Component Creation

```
1. @sophia-prater   --> Identify the object and its relationships
2. @jenifer-tidwell --> Select the appropriate UI pattern
3. @brad-frost      --> Classify atomic level and define component API
4. @jina-anne       --> Create component tokens
5. @andy-bell       --> Write CSS using CUBE methodology
6. @heydon-pickering --> Review accessibility
7. @stephanie-walter --> Create a11y annotations
8. @micah-godbolt   --> Implement and test
9. @alla-kholmatova --> Review naming and language consistency
10. @nathan-curtis  --> Release and version
```

### System Audit

```
1. @dan-mall        --> Assess current state, identify gaps
2. @alla-kholmatova --> Audit design language consistency
3. @jina-anne       --> Audit token architecture and orphans
4. @heydon-pickering --> Accessibility audit
5. @micah-godbolt   --> Architecture and performance audit
6. @jenifer-tidwell --> Pattern usage review
7. @nathan-curtis   --> Governance and process review
```

### Adoption and Scaling

```
1. @dan-mall        --> Adoption strategy, pilot plan, success metrics
2. @nathan-curtis   --> Team model evolution, governance scaling
3. @jina-anne       --> Token migration for consuming teams
4. @stephanie-walter --> A11y training materials
5. @alla-kholmatova --> Vocabulary alignment across teams
```

---

## Quick Reference: Agent Selection

| I need help with... | Ask... |
|---------------------|--------|
| Component structure and hierarchy | @brad-frost |
| Versioning, releases, team structure | @nathan-curtis |
| Design tokens and multi-platform output | @jina-anne |
| Accessible components and patterns | @heydon-pickering |
| Collaboration and organizational strategy | @dan-mall |
| Naming things and design language | @alla-kholmatova |
| Frontend architecture and testing | @micah-godbolt |
| Object modeling and information architecture | @sophia-prater |
| Accessibility annotations for designers | @stephanie-walter |
| UI patterns and interaction design | @jenifer-tidwell |
| CSS methodology and modern CSS | @andy-bell |
| Token tooling and Style Dictionary config | @sarah-federman |

---

## Data Files Reference

| File | Purpose |
|------|---------|
| `data/benchmarks.md` | Industry benchmarks for adoption, ROI, maturity |
| `data/team-model-benchmarks.md` | Team model comparison data |
| `data/wcag-quick-ref.md` | WCAG 2.2 quick reference for designers |
| `data/wcag-designer-criteria.md` | WCAG criteria specific to design decisions |
| `data/naming-examples.md` | Token naming examples using CTI taxonomy |
| `data/platform-formats.md` | Same token in different platform formats |
| `data/pattern-catalog.md` | UI pattern catalog index |
| `data/token-scales.md` | Standard spacing, type, color, and sizing scales |

## Checklists Reference

| File | Agent | Purpose |
|------|-------|---------|
| `checklists/component-review.md` | @brad-frost | Component quality review |
| `checklists/governance-review.md` | @nathan-curtis | Governance model review |
| `checklists/release-checklist.md` | @nathan-curtis | Pre-release validation |
| `checklists/a11y-review.md` | @heydon-pickering | Accessibility review |
| `checklists/architecture-review.md` | @micah-godbolt | Frontend architecture review |
| `checklists/testing-checklist.md` | @micah-godbolt | Testing completeness |
| `checklists/language-review.md` | @alla-kholmatova | Design language review |
| `checklists/token-review.md` | @jina-anne | Token quality review |
| `checklists/migration-checklist.md` | @jina-anne | Token migration |
| `checklists/object-consistency-review.md` | @sophia-prater | Object consistency |
| `checklists/a11y-component-checklist.md` | @stephanie-walter | Per-component a11y |
| `checklists/pattern-review.md` | @jenifer-tidwell | UI pattern review |
| `checklists/navigation-review.md` | @jenifer-tidwell | Navigation review |
| `checklists/layout-review.md` | @jenifer-tidwell | Layout review |
| `checklists/css-review.md` | @andy-bell | CSS quality review |
| `checklists/collaboration-review.md` | @dan-mall | Collaboration review |
| `checklists/adoption-checklist.md` | @dan-mall | Adoption readiness |
