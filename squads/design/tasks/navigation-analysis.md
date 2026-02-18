# Task: Navigation Structure Analysis

**Task ID:** navigation-analysis
**Version:** 1.0
**Purpose:** Analyze navigation structure including information architecture, wayfinding, menus, and search patterns
**Agent:** @jenifer-tidwell
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Performs a comprehensive analysis of a product's navigation system: information architecture, menu structures, wayfinding patterns, breadcrumbs, search integration, and user orientation mechanisms. Identifies navigation debt, dead ends, orphan pages, and cognitive overload points. Produces a navigation health report with concrete improvement recommendations aligned to established navigation patterns.

```
INPUT (sitemap, user flows, analytics, navigation components)
    |
[PHASE 1: STRUCTURE MAPPING]
    -> Map the complete navigation architecture and hierarchy
    |
[PHASE 2: PATTERN EVALUATION]
    -> Evaluate navigation patterns against best practices and user behavior
    |
[PHASE 3: OPTIMIZATION]
    -> Recommend navigation improvements with priority and rationale
    |
OUTPUT: Navigation analysis report with architecture map, findings, and improvement plan
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sitemap | file | Yes | Current sitemap or navigation tree of the product |
| user_flows | string[] | Yes | Top 5-10 user flows that rely on navigation (e.g., "find product", "manage account") |
| analytics_data | file | No | Page view data, navigation click paths, search query logs, exit pages |
| nav_components | string[] | Yes | List of navigation components in use (top nav, sidebar, breadcrumbs, tabs, footer nav) |
| user_research | file | No | Card sort results, tree test results, or navigation-focused usability findings |

---

## Preconditions

- A sitemap or navigation tree exists (even if informal or outdated)
- The product has at least 15 unique pages or screens to justify navigation analysis
- At least the top 5 user flows can be articulated by the product team
- Navigation components currently in use can be identified and listed

---

## Steps

### Phase 1: Structure Mapping
1. Build the complete navigation hierarchy: map every page and its position in the tree (depth levels, parent-child relationships)
2. Identify all navigation entry points: global navigation, local navigation, contextual links, footer links, search results, deep links
3. Map each user flow through the navigation tree: for each flow, trace the path a user takes from entry to goal completion
4. Calculate navigation depth metrics: maximum depth, average depth, number of pages at each level
5. Identify orphan pages: pages with no inbound navigation links (reachable only via direct URL or search)
6. Identify dead ends: pages with no forward navigation or next steps
7. Map cross-links: connections between pages that bypass the hierarchy (shortcuts, related items, contextual navigation)
8. Document the navigation component inventory: which components appear on which pages, their placement, and their behavior

### Phase 2: Pattern Evaluation
1. Evaluate the primary navigation pattern:
   - **Hub-and-spoke**: appropriate for mobile or focused task apps
   - **Fully connected**: appropriate for content-rich sites with heavy cross-referencing
   - **Pyramid/hierarchical**: appropriate for deep content structures with clear categories
   - **Sequential/wizard**: appropriate for multi-step processes
2. Assess wayfinding effectiveness: can users always answer "where am I?", "where can I go?", and "how do I get back?"
3. Evaluate breadcrumb implementation: present on all sub-pages, reflects true hierarchy (not just browser history), clickable at every level
4. Assess search integration: is search discoverable, does it surface relevant results, are results well-organized, is there search within sections
5. Evaluate menu patterns: label clarity, depth limits (no more than 3 levels in a dropdown), information scent (do labels predict what is behind them)
6. Check for cognitive overload: menus with more than 7 top-level items, pages with more than 3 navigation regions, competing navigation mechanisms
7. Assess responsive navigation: does the mobile navigation maintain discoverability, is the hamburger menu used appropriately, are touch targets adequate
8. Cross-reference analytics: which navigation paths are most and least used, where do users drop off, what do users search for that should be navigable

### Phase 3: Optimization Recommendations
1. Prioritize findings by impact on the top user flows (navigation issues blocking primary tasks are critical)
2. For each finding, recommend a specific navigation pattern improvement:
   - Flat structure: reduce depth by promoting frequently accessed pages
   - Mega menu: replace deep dropdowns with organized panels for large sites
   - Contextual navigation: add "related" or "next steps" links to reduce dead ends
   - Persistent breadcrumbs: add or fix breadcrumb trail for wayfinding
   - Search enhancement: add autocomplete, filters, or scoped search
3. Propose a revised navigation architecture: simplified hierarchy with reduced depth and improved cross-linking
4. Recommend mobile navigation strategy: bottom tabs for primary actions, drawer for secondary, search for discovery
5. Create a navigation testing plan: tree test tasks, first-click test scenarios, and A/B test hypotheses for proposed changes
6. Estimate impact of changes on key navigation metrics: task completion rate, time to find, navigation depth, search reliance

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| navigation-map | markdown | Complete navigation hierarchy with depth metrics and cross-links |
| flow-analysis | markdown | Each user flow traced through navigation with friction points identified |
| findings-report | markdown | All findings organized by severity with pattern-based evidence |
| improvement-plan | markdown | Prioritized recommendations with proposed navigation changes and testing plan |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Complete hierarchy | blocking | Every page in the product must appear in the navigation map |
| Flow tracing | blocking | All specified user flows must be traced with steps and friction points noted |
| Pattern identification | blocking | The primary navigation pattern must be identified and evaluated against alternatives |
| Wayfinding assessment | warning | The three wayfinding questions must be answered for at least 5 key pages |
| Analytics correlation | warning | Findings should reference analytics data where available |
| Mobile evaluation | warning | Responsive navigation must be evaluated separately from desktop |

---

## Handoff

- **On completion:** Hand to @brad-frost for navigation component implementation updates
- **On pattern replacement:** Hand to @jenifer-tidwell (pattern-match) for specific pattern selection
- **On form-related navigation (wizards):** Hand to @jenifer-tidwell (form-design) for multi-step flow design
- **On accessibility navigation concerns:** Hand to @stephanie-walter for keyboard navigation and landmark audit
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Intrinsic design** — Layouts that adapt based on content and available space, not fixed breakpoints
- **CSS custom properties** — CSS variables for runtime theming and token delivery
- **Utility classes** — Single-purpose CSS classes composed in HTML
- **Responsive strategy** — Approach for adapting UI across screen sizes and devices

---

## Don't Do

- Do not use fixed pixel breakpoints when intrinsic design with container queries is viable
- Do not mix layout approaches (Grid + absolute positioning) without documenting the rationale
- Do not hardcode spacing values — use spacing tokens for consistency
- Do not ignore content reflow behavior when planning responsive layouts

