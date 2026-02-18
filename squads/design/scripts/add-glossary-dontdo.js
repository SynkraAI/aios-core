#!/usr/bin/env node
/**
 * Batch script: Add Glossary + Don't Do sections to design squad tasks
 * Run: node squads/design/scripts/add-glossary-dontdo.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const TASKS_DIR = path.join(__dirname, '..', 'tasks');
const DRY_RUN = process.argv.includes('--dry-run');

// Tasks that already have don't-do or glossary sections (skip)
const SKIP_FILES = new Set([
  'focus-order-audit.md',  // already has anti_patterns
  'a11y-doc.md',           // already has don't patterns
]);

// Domain group detection by prefix/keyword
function detectGroup(filename) {
  if (filename.startsWith('ds-')) return 'design-system';
  if (filename.startsWith('token-') || filename === 'export-design-tokens-dtcg.md' || filename === 'css-tokens.md') return 'tokens';
  if (filename.startsWith('a11y-') || filename.startsWith('aria-') || filename === 'contrast-matrix.md' || filename === 'inclusive-audit.md' || filename === 'build-inclusive.md' || filename === 'focus-order-audit.md') return 'accessibility';
  if (filename.startsWith('pattern-') || filename === 'interface-inventory.md' || filename === 'object-audit.md' || filename === 'object-map.md' || filename === 'ux-objects.md') return 'patterns';
  if (filename.startsWith('atomic-') || filename === 'element-collage.md') return 'atomic';
  if (filename.startsWith('layout-') || filename === 'responsive-strategy.md' || filename === 'navigation-analysis.md') return 'layout';
  if (filename === 'audit-tailwind-config.md' || filename === 'tailwind-upgrade.md' || filename === 'css-audit.md' || filename === 'cube-css.md' || filename === 'utility-system.md') return 'css';
  if (filename === 'bootstrap-shadcn-library.md' || filename === 'build-component.md' || filename === 'component-spec.md') return 'components';
  if (filename === 'design-language.md' || filename === 'design-principles.md' || filename === 'shared-vocabulary.md' || filename === 'naming-convention.md') return 'language';
  if (filename === 'governance-model.md' || filename === 'contribution-model.md' || filename === 'versioning-strategy.md' || filename === 'team-model.md' || filename === 'team-workshop.md') return 'governance';
  if (filename === 'testing-strategy.md' || filename === 'validate-design-fidelity.md' || filename === 'execute-checklist.md') return 'testing';
  return 'general';
}

// Domain-specific glossary key terms (inline, referencing shared glossary)
const GROUP_GLOSSARY = {
  'design-system': [
    '**Design tokens** — Platform-agnostic key-value pairs encoding design decisions (colors, spacing, typography)',
    '**Pattern consolidation** — Merging similar UI patterns to reduce redundancy',
    '**Greenfield** — Starting from scratch; **Brownfield** — Integrating into existing codebase',
    '**State file (.state.yaml)** — Progress tracking file for audit/extraction state',
    '**Component API** — Props interface defining how a component is consumed',
  ],
  'tokens': [
    '**Global (primitive) tokens** — Raw values with no semantic meaning (e.g., `color.blue.500`)',
    '**Alias (semantic) tokens** — Purpose-driven tokens referencing globals (e.g., `color.action.primary`)',
    '**Component tokens** — Tokens scoped to a specific component',
    '**CTI** — Category-Type-Item naming taxonomy for tokens',
    '**DTCG** — Design Tokens Community Group W3C specification',
    '**Semantic naming** — Naming by purpose (primary) not description (blue-500)',
  ],
  'accessibility': [
    '**WCAG 2.2** — Web Content Accessibility Guidelines (Levels A, AA, AAA)',
    '**ARIA** — Accessible Rich Internet Applications attributes for assistive technology',
    '**Accessible name** — The label assistive tech announces (via aria-label, content, etc.)',
    '**Focus trap** — UI region where keyboard focus is confined (intentional in modals, accidental is a bug)',
    '**Contrast ratio** — Foreground/background color difference measure (4.5:1 for AA text)',
    '**Landmark** — ARIA role or HTML5 element (`<nav>`, `<main>`) for screen reader navigation',
  ],
  'patterns': [
    '**Pattern library** — Organized collection of reusable UI patterns with documentation',
    '**Interface inventory** — Cataloging every unique UI element to identify inconsistencies',
    '**Pattern consolidation** — Merging similar patterns to establish canonical versions',
    '**Design language** — Shared visual rules and vocabulary defining product identity',
    '**Shared vocabulary** — Team-aligned naming ensuring designers and developers use the same terms',
  ],
  'atomic': [
    '**Atoms** — Smallest UI building blocks (button, icon, label, input)',
    '**Molecules** — Functional units composed of atoms (search bar = input + button)',
    '**Organisms** — Complex components composed of molecules (header, sidebar)',
    '**Templates** — Page-level layouts of organisms without real data',
    '**Barrel export** — `index.ts` re-exporting modules for cleaner import paths',
  ],
  'layout': [
    '**Intrinsic design** — Layouts that adapt based on content and available space, not fixed breakpoints',
    '**CSS custom properties** — CSS variables for runtime theming and token delivery',
    '**Utility classes** — Single-purpose CSS classes composed in HTML',
    '**Responsive strategy** — Approach for adapting UI across screen sizes and devices',
  ],
  'css': [
    '**CSS custom properties** — CSS variables (`--color-primary`) for theming and tokens',
    '**Tailwind CSS** — Utility-first CSS framework with classes like `flex`, `p-4`',
    '**CUBE CSS** — Composition, Utility, Block, Exception methodology',
    '**@layer** — CSS cascade layer for organizing style precedence',
    '**Utility classes** — Single-purpose CSS classes composed in markup',
  ],
  'components': [
    '**Component API** — Props interface defining configuration and behavior',
    '**Variant** — Named style variation (primary, secondary, destructive)',
    '**Component state** — Interactive state: default, hover, active, focus, disabled, error',
    '**Storybook** — Visual component development and documentation environment',
    '**Composition** — Building larger components by combining smaller ones',
  ],
  'language': [
    '**Design language** — Shared visual rules, principles, and vocabulary for product identity',
    '**Shared vocabulary** — Team-aligned naming conventions across design and engineering',
    '**Design tokens** — Platform-agnostic values encoding design decisions',
    '**Semantic naming** — Naming by purpose not description',
  ],
  'governance': [
    '**Governance model** — Rules for who can add/modify design system components and tokens',
    '**Versioning strategy** — How changes are versioned, communicated, and rolled out',
    '**Breaking change** — A modification that requires consumers to update their code',
    '**Contribution guide** — Process for proposing, reviewing, and approving new components or tokens',
  ],
  'testing': [
    '**Design fidelity** — Degree to which implementation matches the design specification',
    '**Visual regression** — Unintended visual changes detected by comparing screenshots',
    '**Accessibility audit** — Systematic check against WCAG criteria',
    '**Component coverage** — Percentage of components with tests and documentation',
  ],
  'general': [
    '**Design tokens** — Platform-agnostic key-value pairs encoding design decisions',
    '**Design system** — Tokens, components, patterns, guidelines, and tooling for UI consistency',
    '**Component API** — Props interface defining how a component is consumed',
  ],
};

// Domain-specific don't-do lists
const GROUP_DONTDO = {
  'design-system': [
    'Do not skip the consolidation phase — extracting tokens from unconsolidated patterns produces duplicates',
    'Do not create tokens with descriptive names (blue-500) instead of semantic names (primary)',
    'Do not hardcode values in components when a token exists — always reference the token',
    'Do not modify .state.yaml manually — let the task update it programmatically',
    'Do not assume greenfield when the codebase has existing styles — check for brownfield indicators first',
  ],
  'tokens': [
    'Do not create tokens with descriptive names (blue-500) — use semantic names (primary, error, surface)',
    'Do not reference tokens upward (global referencing alias) — token references must flow downward only',
    'Do not skip the alias layer — jumping from global directly to component tokens breaks theming',
    'Do not use raw hex/rgb values in components when a token exists',
    'Do not export tokens without validating syntax in each format (CSS, JSON, SCSS, Tailwind)',
    'Do not create circular token references — always validate the token graph',
  ],
  'accessibility': [
    'Do not use `outline: none` without providing a visible alternative focus indicator',
    'Do not use positive `tabIndex` values (1, 2, 3) — they break natural tab order',
    'Do not use `<div onClick>` for interactive elements — use `<button>` or add role + keyboard handlers',
    'Do not rely on color alone to convey information — always provide a secondary indicator (icon, text)',
    'Do not suppress ARIA roles when native HTML semantics already provide them (e.g., `role="button"` on `<button>`)',
    'Do not skip keyboard testing — mouse-only testing misses critical accessibility barriers',
  ],
  'patterns': [
    'Do not inventory patterns without checking for existing pattern libraries first',
    'Do not consolidate patterns before completing a full interface inventory',
    'Do not name patterns inconsistently — follow the shared vocabulary and naming convention',
    'Do not create a new pattern when an existing one can be extended or adapted',
    'Do not skip the validation step that confirms consolidated patterns cover original usage',
  ],
  'atomic': [
    'Do not classify components without understanding their composition (atoms combine into molecules, not vice versa)',
    'Do not create molecules that depend on specific page context — they should be reusable',
    'Do not skip barrel exports when reorganizing component directories',
    'Do not refactor atoms and molecules simultaneously — refactor bottom-up (atoms first)',
    'Do not break existing imports during atomic restructuring — update all consumers',
  ],
  'layout': [
    'Do not use fixed pixel breakpoints when intrinsic design with container queries is viable',
    'Do not mix layout approaches (Grid + absolute positioning) without documenting the rationale',
    'Do not hardcode spacing values — use spacing tokens for consistency',
    'Do not ignore content reflow behavior when planning responsive layouts',
  ],
  'css': [
    'Do not mix naming conventions (BEM + utility classes) without a clear layering strategy',
    'Do not add custom CSS that duplicates existing utility classes',
    'Do not use `!important` to override specificity — restructure cascade layers instead',
    'Do not ignore unused CSS during audits — dead code increases bundle size',
    'Do not upgrade Tailwind versions without checking for breaking changes in config format',
  ],
  'components': [
    'Do not build components without defining the component API (props interface) first',
    'Do not skip variant definitions — undocumented variants lead to ad-hoc styling',
    'Do not create components without Storybook stories for each variant and state',
    'Do not hardcode text or colors — accept them as props or use tokens',
    'Do not skip accessibility requirements (keyboard, ARIA) in component specs',
  ],
  'language': [
    'Do not introduce new terms without adding them to the shared vocabulary document',
    'Do not use different names for the same concept across design and engineering',
    'Do not define principles without concrete examples showing correct and incorrect application',
    'Do not create naming conventions that conflict with existing token naming (CTI)',
  ],
  'governance': [
    'Do not skip the review process when adding components to the design system',
    'Do not introduce breaking changes without a documented migration path',
    'Do not assume governance rules are understood — document them explicitly with examples',
    'Do not modify shared components without notifying consuming teams',
  ],
  'testing': [
    'Do not skip visual regression testing when modifying shared components',
    'Do not declare fidelity validated without comparing against the design spec pixel-by-pixel',
    'Do not test only the happy path — include error, loading, empty, and edge case states',
    'Do not skip accessibility checks during component testing',
  ],
  'general': [
    'Do not skip reading the full task specification before executing',
    'Do not create from scratch when similar patterns exist in the design system',
    'Do not hardcode values that should be design tokens',
    'Do not skip validation steps defined in the task workflow',
  ],
};

// Check if file already has glossary or don't-do sections
function hasExistingSections(content) {
  const lower = content.toLowerCase();
  return {
    hasGlossary: /^##\s+(glossary|key terms|terminology|definitions)/m.test(lower),
    hasDontDo: /^##\s+(don.?t\s+do|anti.?patterns?|never\s+do|forbidden|common\s+mistakes)/m.test(lower),
  };
}

function buildSection(filename, group) {
  const glossaryTerms = GROUP_GLOSSARY[group] || GROUP_GLOSSARY['general'];
  const dontDoItems = GROUP_DONTDO[group] || GROUP_DONTDO['general'];

  let section = '\n\n---\n\n';
  section += '## Glossary\n\n';
  section += '> Full glossary: [design-glossary.md](../data/design-glossary.md)\n\n';
  section += '**Key terms for this task:**\n\n';
  for (const term of glossaryTerms) {
    section += `- ${term}\n`;
  }

  section += '\n---\n\n';
  section += "## Don't Do\n\n";
  for (const item of dontDoItems) {
    section += `- ${item}\n`;
  }

  return section;
}

// Main
const files = fs.readdirSync(TASKS_DIR).filter(f => f.endsWith('.md'));
let modified = 0;
let skipped = 0;
let alreadyHas = 0;

for (const file of files) {
  if (SKIP_FILES.has(file)) {
    skipped++;
    continue;
  }

  const filepath = path.join(TASKS_DIR, file);
  const content = fs.readFileSync(filepath, 'utf-8');
  const { hasGlossary, hasDontDo } = hasExistingSections(content);

  if (hasGlossary && hasDontDo) {
    alreadyHas++;
    continue;
  }

  const group = detectGroup(file);
  let newContent = content.trimEnd();

  // Build sections based on what's missing
  if (!hasGlossary && !hasDontDo) {
    newContent += buildSection(file, group);
  } else if (!hasGlossary) {
    const glossaryTerms = GROUP_GLOSSARY[group] || GROUP_GLOSSARY['general'];
    let section = '\n\n---\n\n## Glossary\n\n';
    section += '> Full glossary: [design-glossary.md](../data/design-glossary.md)\n\n';
    section += '**Key terms for this task:**\n\n';
    for (const term of glossaryTerms) {
      section += `- ${term}\n`;
    }
    newContent += section;
  } else if (!hasDontDo) {
    const dontDoItems = GROUP_DONTDO[group] || GROUP_DONTDO['general'];
    let section = "\n\n---\n\n## Don't Do\n\n";
    for (const item of dontDoItems) {
      section += `- ${item}\n`;
    }
    newContent += section;
  }

  newContent += '\n';

  if (DRY_RUN) {
    console.log(`[DRY] ${file} (${group}) — would add: ${!hasGlossary ? 'glossary' : ''} ${!hasDontDo ? "don't-do" : ''}`);
  } else {
    fs.writeFileSync(filepath, newContent, 'utf-8');
    console.log(`[OK] ${file} (${group})`);
  }
  modified++;
}

console.log(`\n--- Summary ---`);
console.log(`Total tasks: ${files.length}`);
console.log(`Modified: ${modified}`);
console.log(`Skipped (manual): ${skipped}`);
console.log(`Already has sections: ${alreadyHas}`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLIED'}`);
